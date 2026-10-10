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
  let rawText = '';
  let isError = false;
  let costUsd = 0;
  let tokens = 0;
  try {
    for await (const message of query({ prompt: params.prompt, options })) {
      if (message.type !== 'result') continue;
      isError = message.is_error;
      rawText = message.subtype === 'success' ? message.result : message.errors.join('\n');
      costUsd = message.total_cost_usd;
      for (const u of Object.values(message.modelUsage ?? {})) tokens += u.inputTokens + u.outputTokens;
    }
  } catch (err) {
    // A session that ends in error (most often out of turns) is a failed attempt, not a dead run:
    // files on disk survive and the next step judges them.
    isError = true;
    rawText = `${rawText}\n${err instanceof Error ? err.message : String(err)}`.trim();
  }
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
