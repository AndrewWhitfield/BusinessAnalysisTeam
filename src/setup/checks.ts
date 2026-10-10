import { access, mkdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { execa } from 'execa';
import { analysesRoot } from '../orchestrator/paths.js';

export const MIN_NODE_MAJOR = 20;

export interface Check {
  name: string;
  ok: boolean;
  /** A failed required check stops a run; an optional one only warns. */
  required: boolean;
  detail: string;
}

export function nodeCheck(version = process.versions.node): Check {
  const major = Number(version.split('.')[0]);
  const ok = major >= MIN_NODE_MAJOR;
  return { name: 'Node.js', ok, required: true, detail: ok ? `v${version}` : `v${version} — version ${MIN_NODE_MAJOR} or later is required (https://nodejs.org)` };
}

export async function dependenciesCheck(repoRoot: string): Promise<Check> {
  const ok = await access(path.join(repoRoot, 'node_modules', '@anthropic-ai', 'claude-agent-sdk')).then(
    () => true,
    () => false,
  );
  return { name: 'Dependencies', ok, required: true, detail: ok ? 'installed' : 'missing — run `npm install` in this folder' };
}

export async function gitCheck(): Promise<Check> {
  const res = await execa('git', ['--version'], { reject: false });
  const ok = res.exitCode === 0;
  return {
    name: 'git',
    ok,
    required: false,
    detail: ok ? String(res.stdout).trim() : 'not found — analyses still run, but without a version history of each draft (install from https://git-scm.com)',
  };
}

export async function analysesFolderCheck(repoRoot: string): Promise<Check> {
  const root = analysesRoot(repoRoot);
  try {
    await mkdir(root, { recursive: true });
    await access(root, constants.W_OK);
    return { name: 'Analyses folder', ok: true, required: true, detail: root };
  } catch (err) {
    return { name: 'Analyses folder', ok: false, required: true, detail: `${root} is not writable (${err instanceof Error ? err.message : String(err)}) — set BAT_ANALYSES_ROOT in .env` };
  }
}

export function signInHint(): Check {
  const viaKey = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
  return {
    name: 'Sign-in method',
    ok: true,
    required: false,
    detail: viaKey ? 'ANTHROPIC_API_KEY (from the environment or .env)' : 'no API key set — the agents will use Claude Code\'s sign-in on this machine, if any',
  };
}

/** The checks that need no model call — cheap enough to run before every analysis. */
export async function localChecks(repoRoot: string): Promise<Check[]> {
  return [nodeCheck(), await dependenciesCheck(repoRoot), await gitCheck(), await analysesFolderCheck(repoRoot), signInHint()];
}

export function formatChecks(checks: Check[]): string {
  return checks.map((c) => `${c.ok ? '✔' : c.required ? '✘' : '!'} ${c.name}: ${c.detail}`).join('\n');
}

export function blocking(checks: Check[]): Check[] {
  return checks.filter((c) => c.required && !c.ok);
}
