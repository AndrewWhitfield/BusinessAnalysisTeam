import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { execa } from 'execa';
import { z } from 'zod';
import type { AgentRole } from '../types.js';

/**
 * The team's memory across analyses (README "Continuous learning"). The owner's words are recorded
 * verbatim in knowledge/owner-feedback.jsonl; every QC finding is recorded in knowledge/qc-findings.jsonl;
 * the Lessons curator turns both into general lessons in knowledge/lessons.json; every BA and QC
 * session carries the active lessons for its role. All three files are committed in this repo.
 */
export const KNOWLEDGE_DIR = 'knowledge';
const LESSONS_FILE = 'lessons.json';
export const OWNER_FEEDBACK_FILE = 'owner-feedback.jsonl';
export const QC_FINDINGS_FILE = 'qc-findings.jsonl';

/** More than this per role and a prompt stops being read — the curator merges or retires instead. */
export const MAX_LESSONS_PER_PROMPT = 30;

const lessonRoles = z.array(z.enum(['all', 'business-analyst', 'quality-controller'])).min(1);

const lessonSchema = z.object({
  id: z.string().regex(/^L-\d{3,}$/),
  added: z.string(),
  updated: z.string().optional(),
  source: z.string(),
  roles: lessonRoles,
  lesson: z.string().min(10),
  why: z.string().min(5),
  status: z.enum(['active', 'retired']),
  retiredReason: z.string().optional(),
});
export type Lesson = z.infer<typeof lessonSchema>;

const ledgerSchema = z.object({ version: z.literal(1), lessons: z.array(lessonSchema) });
export type LessonLedger = z.infer<typeof ledgerSchema>;

export const curationSchema = z.object({
  add: z.array(z.object({ roles: lessonRoles, lesson: z.string().min(10), why: z.string().min(5) })).default([]),
  update: z.array(z.object({ id: z.string(), lesson: z.string().min(10), why: z.string().min(5) })).default([]),
  retire: z.array(z.object({ id: z.string(), reason: z.string().min(5) })).default([]),
});
export type Curation = z.infer<typeof curationSchema>;

function file(repoRoot: string, name: string): string {
  return path.join(repoRoot, KNOWLEDGE_DIR, name);
}

export async function appendRecord(repoRoot: string, name: string, record: object): Promise<void> {
  await mkdir(path.join(repoRoot, KNOWLEDGE_DIR), { recursive: true });
  await appendFile(file(repoRoot, name), `${JSON.stringify(record)}\n`, 'utf8');
}

export async function loadLedger(repoRoot: string): Promise<LessonLedger> {
  try {
    return ledgerSchema.parse(JSON.parse(await readFile(file(repoRoot, LESSONS_FILE), 'utf8')));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { version: 1, lessons: [] };
    throw new Error(`knowledge/${LESSONS_FILE} is invalid — fix it by hand: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function saveLedger(repoRoot: string, ledger: LessonLedger): Promise<void> {
  await mkdir(path.join(repoRoot, KNOWLEDGE_DIR), { recursive: true });
  await writeFile(file(repoRoot, LESSONS_FILE), `${JSON.stringify(ledgerSchema.parse(ledger), null, 2)}\n`, 'utf8');
}

/** Applies a validated curation; unknown ids are reported, never guessed at. */
export function applyCuration(ledger: LessonLedger, curation: Curation, source: string, today: string): { ledger: LessonLedger; notes: string[] } {
  const notes: string[] = [];
  const lessons = ledger.lessons.map((l) => ({ ...l }));
  const byId = new Map(lessons.map((l) => [l.id, l]));
  for (const u of curation.update) {
    const l = byId.get(u.id);
    if (l) Object.assign(l, { lesson: u.lesson, why: u.why, updated: today });
    else notes.push(`update skipped: no lesson ${u.id}`);
  }
  for (const r of curation.retire) {
    const l = byId.get(r.id);
    if (l) Object.assign(l, { status: 'retired' as const, retiredReason: r.reason, updated: today });
    else notes.push(`retire skipped: no lesson ${r.id}`);
  }
  let next = lessons.reduce((max, l) => Math.max(max, Number(l.id.slice(2))), 0) + 1;
  for (const a of curation.add) lessons.push({ id: `L-${String(next++).padStart(3, '0')}`, added: today, source, ...a, status: 'active' });
  return { ledger: { version: 1, lessons }, notes };
}

export function activeLessonsFor(ledger: LessonLedger, role: AgentRole): Lesson[] {
  return ledger.lessons
    .filter((l) => l.status === 'active' && (l.roles.includes('all') || (l.roles as string[]).includes(role)))
    .slice(-MAX_LESSONS_PER_PROMPT);
}

/** The block appended to a role's system prompt; empty when nothing applies. */
export function lessonsPromptFor(repoRoot: string, role: AgentRole): string {
  let ledger: LessonLedger;
  try {
    ledger = ledgerSchema.parse(JSON.parse(readFileSync(file(repoRoot, LESSONS_FILE), 'utf8')));
  } catch {
    return ''; // a missing or broken ledger never stops a session; loadLedger reports it at curation
  }
  const lessons = activeLessonsFor(ledger, role);
  if (lessons.length === 0) return '';
  return `\n\nLessons the team has learnt on earlier analyses (from the owner's feedback and QC's findings). They are standing instructions — apply them; if one conflicts with this task, say so in your handoff:\n${lessons.map((l) => `- ${l.lesson} (Why: ${l.why}) [${l.id}]`).join('\n')}`;
}

export function ledgerText(ledger: LessonLedger): string {
  const active = ledger.lessons.filter((l) => l.status === 'active');
  return active.length ? active.map((l) => `${l.id} [${l.roles.join(', ')}] ${l.lesson} (Why: ${l.why})`).join('\n') : '(the ledger is empty)';
}

/** The curator's ```lessons block, validated; missing or broken means "learn nothing". */
export function parseCuration(rawText: string): Curation | undefined {
  const block = [...rawText.matchAll(/```lessons\s*\n([\s\S]*?)```/g)].at(-1)?.[1];
  if (!block) return undefined;
  try {
    const parsed = curationSchema.safeParse(JSON.parse(block));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

/** Commits only knowledge/ (a pathspec commit, so nothing else is swept in). Never pushes. */
export async function commitKnowledge(repoRoot: string, message: string): Promise<boolean> {
  const git = (args: string[]) => execa('git', args, { cwd: repoRoot, reject: false });
  await git(['add', '--', KNOWLEDGE_DIR]);
  if ((await git(['diff', '--cached', '--quiet', '--', KNOWLEDGE_DIR])).exitCode === 0) return false;
  return (await git(['commit', '-q', '-m', message, '--', KNOWLEDGE_DIR])).exitCode === 0;
}
