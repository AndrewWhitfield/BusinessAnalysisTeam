#!/usr/bin/env node
import 'dotenv/config';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runAnalysis, type RunParams } from './orchestrator/pipeline.js';

const USAGE = `Usage:
  npm start -- --project <name> --brief-file <brief.md> [--no-questions] [--min-sources <n>]
      Start an analysis. The Business Analyst asks you clarifying questions first (unless --no-questions).
  npm start -- --project <name> --resume [--feedback-file <file> | --approve]
      Continue: answer the analyst's questions, give guidance, accept the pack, or request changes.

--brief "<text>" and --feedback "<text>" work for one-line text. Use the -file forms for anything longer:
on Windows, npm passes arguments through cmd.exe, which silently cuts text at its first line break.`;

const NAME = /^[a-z0-9][a-z0-9-]*$/;

function flag(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

function textFlag(argv: string[], name: string): string | undefined {
  const file = flag(argv, `${name}-file`);
  return file ? readFileSync(file, 'utf8').trim() : flag(argv, name)?.trim();
}

function fail(message: string): never {
  console.error(`${message}\n\n${USAGE}`);
  process.exit(1);
}

/** The first rule a set of flags breaks, or undefined. */
function firstProblem(argv: string[], resume: boolean, brief: string | undefined, feedback: string | undefined): string | undefined {
  const approve = argv.includes('--approve');
  const minSources = Number(flag(argv, '--min-sources') ?? 5);
  const rules: [boolean, string][] = [
    [resume === Boolean(brief), 'Give either --brief-file (to start) or --resume (to continue).'],
    [!resume && Boolean(feedback || approve), '--feedback and --approve answer a waiting analysis, so they need --resume.'],
    [Boolean(feedback) && approve, 'Give either --feedback or --approve, not both.'],
    [!Number.isInteger(minSources) || minSources < 0, '--min-sources must be a whole number.'],
  ];
  return rules.find(([broken]) => broken)?.[1];
}

function parseArgs(argv: string[], repoRoot: string): RunParams {
  const project = flag(argv, '--project');
  if (!project || !NAME.test(project)) fail('--project <kebab-case-name> is required.');
  const resume = argv.includes('--resume');
  const brief = textFlag(argv, '--brief');
  const feedback = textFlag(argv, '--feedback') ?? textFlag(argv, '--answers');
  const problem = firstProblem(argv, resume, brief, feedback);
  if (problem) fail(problem);
  return {
    repoRoot,
    project,
    ...(brief ? { start: { brief, askQuestions: !argv.includes('--no-questions'), minSources: Number(flag(argv, '--min-sources') ?? 5) } } : {}),
    ...(resume ? { owner: { text: feedback, approve: argv.includes('--approve') } } : {}),
  };
}

const repoRoot = path.resolve(fileURLToPath(import.meta.url), '../..');

runAnalysis(parseArgs(process.argv.slice(2), repoRoot))
  .then((stop) => console.log(`\n[orchestrator] Stopped: ${stop}.`))
  .catch((err) => {
    console.error('\n[orchestrator] Fatal error:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
