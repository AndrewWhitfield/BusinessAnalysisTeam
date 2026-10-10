import { access, appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execa } from 'execa';
import { runStatusSchema, type AgentOutcome, type AgentRole, type RunStatus } from '../types.js';
import type { AnalysisPaths } from './paths.js';

export async function exists(file: string): Promise<boolean> {
  return access(file).then(
    () => true,
    () => false,
  );
}

export async function writeText(file: string, text: string): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text.endsWith('\n') ? text : `${text}\n`, 'utf8');
}

export async function readStatus(paths: AnalysisPaths): Promise<RunStatus | undefined> {
  if (!(await exists(paths.runStatus))) return undefined;
  return runStatusSchema.parse(JSON.parse(await readFile(paths.runStatus, 'utf8')));
}

export async function writeStatus(paths: AnalysisPaths, status: RunStatus): Promise<void> {
  await writeText(paths.runStatus, JSON.stringify(runStatusSchema.parse(status), null, 2));
}

export async function logHandoff(paths: AnalysisPaths, role: AgentRole, taskId: string, outcome: AgentOutcome): Promise<void> {
  await mkdir(paths.recordsDir, { recursive: true });
  const entry = { at: new Date().toISOString(), role, taskId, costUsd: outcome.costUsd, tokens: outcome.tokens, isError: outcome.isError, handoff: outcome.handoff ?? null, handoffError: outcome.handoffError };
  await appendFile(paths.handoffs, `${JSON.stringify(entry)}\n`, 'utf8');
}

interface BudgetFile {
  totalUsd: number;
  totalTokens: number;
}

/** Default spending cap for one invocation (USD); BAT_MAX_RUN_USD overrides it. */
export const DEFAULT_RUN_CAP_USD = 30;

export function runCapUsd(): number {
  const fromEnv = Number(process.env.BAT_MAX_RUN_USD);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_RUN_CAP_USD;
}

/**
 * Real spend from the SDK's results, never estimated. The cap applies per invocation: past it the
 * run stops at a budget checkpoint and the owner decides whether to continue.
 */
export class BudgetTracker {
  private state: BudgetFile = { totalUsd: 0, totalTokens: 0 };
  private startUsd = 0;

  constructor(
    private readonly paths: AnalysisPaths,
    private readonly capUsd = runCapUsd(),
  ) {}

  async restore(): Promise<void> {
    if (await exists(this.paths.budget)) this.state = JSON.parse(await readFile(this.paths.budget, 'utf8')) as BudgetFile;
    this.startUsd = this.state.totalUsd;
  }

  async record(outcome: AgentOutcome): Promise<void> {
    this.state.totalUsd += outcome.costUsd;
    this.state.totalTokens += outcome.tokens;
    await writeText(this.paths.budget, JSON.stringify(this.state, null, 2));
  }

  remainingUsd(): number {
    return this.capUsd - (this.state.totalUsd - this.startUsd);
  }

  get totalUsd(): number {
    return this.state.totalUsd;
  }

  get cap(): number {
    return this.capUsd;
  }
}

/** Each analysis is its own local git repo, committed at every step (never pushed). */
export async function ensureAnalysisRepo(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
  if (!(await exists(path.join(dir, '.git')))) await execa('git', ['init', '-q', '-b', 'main'], { cwd: dir, reject: false });
}

export async function commitAnalysis(dir: string, message: string): Promise<void> {
  const git = (args: string[]) => execa('git', args, { cwd: dir, reject: false });
  await git(['add', '-A']);
  if ((await git(['diff', '--cached', '--quiet'])).exitCode === 0) return;
  const res = await git(['commit', '-q', '--no-verify', '-m', message]);
  if (res.exitCode !== 0) console.warn(`[orchestrator] Could not commit the analysis: ${String(res.stderr).trim()}`);
}
