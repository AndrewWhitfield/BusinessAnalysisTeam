import { query, type Options } from '@anthropic-ai/claude-agent-sdk';
import type { AgentOutcome, AgentRole } from '../types.js';
import type { AnalysisPaths } from '../orchestrator/paths.js';
import { effortForRole, modelForRole } from './models.js';
import { toolPolicyForRole } from './toolPolicies.js';
import { parseHandoff } from './handoff.js';

/** What this invocation may still spend; every call's SDK maxBudgetUsd is set to it. */
export type RemainingBudget = () => number;

/** Below this a call can't do useful work: stop at the budget checkpoint instead of starting it. */
export const MIN_CALL_USD = 2;

/** Thrown before a call when the invocation's budget is used up. */
export class BudgetExhausted extends Error {
  constructor(readonly remainingUsd: number) {
    super(`This invocation's budget is used up ($${remainingUsd.toFixed(2)} left).`);
  }
}

/**
 * A problem with this machine's setup — no sign-in, a rejected key, no access to the model — rather
 * than with the agent's work. Retrying can't fix it, so the run stops with what to do (README "Setup").
 */
export class SetupProblem extends Error {}

const SETUP_ERRORS: [RegExp, string][] = [
  [/invalid.{0,20}api.?key|authentication|unauthori[sz]ed|not logged in|\/login|401/i, 'The agents could not sign in to Claude. Sign in to Claude Code on this machine (run `claude`, then /login), or set ANTHROPIC_API_KEY in .env. Then run `npm run doctor`.'],
  [/credit balance|billing|quota|usage limit/i, 'The Claude account has no usage left (credit balance or plan limit). Top it up or wait for the limit to reset, then resume.'],
  [/model.{0,40}(not found|not available|does not exist|no access)|does not have access/i, 'This account cannot use the configured model. Set BAT_MODEL_BUSINESS_ANALYST / BAT_MODEL_QUALITY_CONTROLLER / BAT_MODEL_LESSONS_CURATOR in .env to a model it can use, then run `npm run doctor`.'],
];

/** The setup advice for an errored session's text, if it failed for a setup reason. */
export function setupAdvice(text: string): string | undefined {
  return SETUP_ERRORS.find(([re]) => re.test(text))?.[1];
}

export interface InvokeParams {
  role: AgentRole;
  taskId: string;
  systemPrompt: string;
  prompt: string;
  paths: AnalysisPaths;
  remainingBudget: RemainingBudget;
  maxTurns?: number;
  noTools?: boolean;
}

/**
 * Each session sees only what the orchestrator gives it: no user or project settings, no MCP servers,
 * no claude.ai connectors (AgentTeam found sessions otherwise inherit the maintainer's own setup).
 */
const ISOLATION: Partial<Options> = {
  settingSources: [],
  strictMcpConfig: true,
  settings: { disableClaudeAiConnectors: true },
};

function toolOptions(params: InvokeParams): Partial<Options> {
  if (params.noTools) return { tools: [], allowedTools: [] };
  const policy = toolPolicyForRole(params.role, params.paths);
  return { allowedTools: policy.allowedTools, ...(policy.hooks ? { hooks: policy.hooks } : {}) };
}

type SessionResult = Pick<AgentOutcome, 'rawText' | 'isError' | 'costUsd' | 'tokens'>;

/** Runs one SDK session to its result message, with the real cost and token counts. */
async function runSession(prompt: string, options: Options): Promise<SessionResult> {
  const r: SessionResult = { rawText: '', isError: false, costUsd: 0, tokens: 0 };
  try {
    for await (const message of query({ prompt, options })) {
      if (message.type !== 'result') continue;
      r.isError = message.is_error;
      r.rawText = message.subtype === 'success' ? message.result : message.errors.join('\n');
      r.costUsd = message.total_cost_usd;
      for (const u of Object.values(message.modelUsage ?? {})) r.tokens += u.inputTokens + u.outputTokens;
    }
  } catch (err) {
    // A session that ends in error (most often out of turns) is a failed attempt, not a dead run:
    // files on disk survive and the next step judges them.
    r.isError = true;
    r.rawText = `${r.rawText}\n${err instanceof Error ? err.message : String(err)}`.trim();
  }
  return r;
}

async function runOnce(params: InvokeParams): Promise<AgentOutcome> {
  const remaining = params.remainingBudget();
  if (remaining < MIN_CALL_USD) throw new BudgetExhausted(remaining);
  const options: Options = {
    systemPrompt: params.systemPrompt,
    model: modelForRole(params.role),
    effort: effortForRole(params.role),
    ...toolOptions(params),
    cwd: params.paths.dir,
    maxTurns: params.maxTurns ?? 60,
    maxBudgetUsd: remaining,
    ...ISOLATION,
  };
  const run = await runSession(params.prompt, options);
  const advice = run.isError && run.costUsd === 0 ? setupAdvice(run.rawText) : undefined;
  if (advice) throw new SetupProblem(`${advice}\n(Claude said: ${run.rawText.trim().slice(0, 300)})`);
  const { rawText, isError, costUsd, tokens } = run;
  const parsed = parseHandoff(rawText);
  return { rawText, isError, costUsd, tokens, ...(parsed.ok ? { handoff: parsed.handoff } : { handoffError: parsed.error }) };
}

/**
 * One scoped Agent SDK session per step, driven by orchestrator code (deterministic gates, budgets and
 * loops). A malformed handoff gets one short corrective retry — the work on disk is kept — and the
 * cost of both attempts is reported, straight from the SDK, never estimated.
 */
export async function invokeAgent(params: InvokeParams): Promise<AgentOutcome> {
  const first = await runOnce(params);
  if (first.handoff) return first;
  const outOfTurns = /maximum number of turns/i.test(first.rawText);
  const retryPrompt = outOfTurns
    ? `${params.prompt}\n\n---\nYour previous session ran out of turns. Everything you wrote is still on disk. This session has NO tools. Reply with only the handoff json block, stating honestly what is done and what is not.`
    : `${params.prompt}\n\n---\nYour previous reply did not end with one valid handoff json block (${first.handoffError}). Your files are still on disk — don't redo the work. Repeat any other block you were asked for, then end with one corrected json block.`;
  const second = await runOnce({ ...params, prompt: retryPrompt, ...(outOfTurns ? { noTools: true, maxTurns: 2 } : {}) });
  // Both texts are kept: a report block written in the first attempt still counts if the retry
  // only repaired the handoff (block parsers take the last block of their kind).
  return { ...second, rawText: `${first.rawText}\n\n${second.rawText}`, costUsd: first.costUsd + second.costUsd, tokens: first.tokens + second.tokens };
}
