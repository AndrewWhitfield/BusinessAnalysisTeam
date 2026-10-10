import 'dotenv/config';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { runLessonsCurator } from '../agents/lessonsCurator.js';
import { analysisPaths } from './paths.js';
import { BudgetTracker } from './records.js';
import { appendRecord, applyCuration, commitKnowledge, loadLedger, OWNER_FEEDBACK_FILE, parseCuration, saveLedger } from './learning.js';

/**
 * Teaches the team from feedback given outside a run (in chat, in a review meeting):
 *   npm run learn -- --project <name> --occasion "<what it was about>" (--file <path> | --text "<feedback>")
 */
const USAGE = 'npm run learn -- --project <name> --occasion "<what it was about>" (--file <path> | --text "<feedback>")';

function flag(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const project = flag(argv, '--project');
  const occasion = flag(argv, '--occasion');
  const file = flag(argv, '--file');
  const text = file ? await readFile(file, 'utf8') : flag(argv, '--text');
  if (!project || !occasion || !text) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const repoRoot = path.resolve(fileURLToPath(import.meta.url), '../../..');
  const paths = analysisPaths(repoRoot, project);
  const budget = new BudgetTracker(paths);
  await budget.restore();
  await appendRecord(repoRoot, OWNER_FEEDBACK_FILE, { at: new Date().toISOString(), project, occasion, text });
  const ledger = await loadLedger(repoRoot);
  const outcome = await runLessonsCurator({ taskId: `learn-${Date.now().toString(36)}`, project, occasion, evidence: text, ledger, paths, remainingBudget: () => budget.remainingUsd() });
  await budget.record(outcome);
  const curation = parseCuration(outcome.rawText);
  if (curation) {
    const today = new Date().toISOString().slice(0, 10);
    const { ledger: next, notes } = applyCuration(ledger, curation, `${project} — ${occasion} (${today})`, today);
    await saveLedger(repoRoot, next);
    notes.forEach((n) => console.warn(n));
    console.log(`Lessons: ${curation.add.length} added, ${curation.update.length} updated, ${curation.retire.length} retired.`);
  } else console.warn('No valid lessons block — feedback recorded, ledger unchanged.');
  await commitKnowledge(repoRoot, `Team learning: ${project} — ${occasion}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
