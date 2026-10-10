import path from 'node:path';

/**
 * Where analyses live — one folder (and local git repo) per analysis. The default, `analyses/` inside
 * this repo, works on any machine and is gitignored, so analyses are never published with the team.
 * BAT_ANALYSES_ROOT puts them anywhere else.
 */
export function analysesRoot(repoRoot: string): string {
  const configured = process.env.BAT_ANALYSES_ROOT?.trim();
  return configured ? path.resolve(configured) : path.join(repoRoot, 'analyses');
}

/** Paths inside one analysis folder. Agents run with `dir` as their working directory. */
export interface AnalysisPaths {
  dir: string;
  brief: string;
  elicitationDir: string;
  elicitationRecord: string;
  deliverablesDir: string;
  researchReport: string;
  specification: string;
  presentation: string;
  reviewsDir: string;
  recordsDir: string;
  runStatus: string;
  checkpoint: string;
  budget: string;
  handoffs: string;
}

export const RECORDS_DIR = '.ba';

export function analysisPaths(repoRoot: string, project: string): AnalysisPaths {
  return pathsFor(path.join(analysesRoot(repoRoot), project));
}

export function pathsFor(dir: string): AnalysisPaths {
  const deliverablesDir = path.join(dir, 'deliverables');
  const elicitationDir = path.join(dir, 'elicitation');
  const recordsDir = path.join(dir, RECORDS_DIR);
  return {
    dir,
    brief: path.join(dir, 'brief.md'),
    elicitationDir,
    elicitationRecord: path.join(elicitationDir, 'elicitation-record.md'),
    deliverablesDir,
    researchReport: path.join(deliverablesDir, 'research-report.md'),
    specification: path.join(deliverablesDir, 'requirements-specification.md'),
    presentation: path.join(deliverablesDir, 'README.md'),
    reviewsDir: path.join(dir, 'reviews'),
    recordsDir,
    runStatus: path.join(recordsDir, 'run-status.json'),
    checkpoint: path.join(recordsDir, 'checkpoint.md'),
    budget: path.join(recordsDir, 'budget.json'),
    handoffs: path.join(recordsDir, 'handoffs.jsonl'),
  };
}

export function questionsFile(paths: AnalysisPaths, round: number): string {
  return path.join(paths.elicitationDir, `questions-round-${round}.md`);
}

export function answersFile(paths: AnalysisPaths, round: number): string {
  return path.join(paths.elicitationDir, `answers-round-${round}.md`);
}

export function precheckFile(paths: AnalysisPaths, round: number): string {
  return path.join(paths.reviewsDir, `round-${round}-precheck.md`);
}

export function qcReportFile(paths: AnalysisPaths, round: number): string {
  return path.join(paths.reviewsDir, `round-${round}-qc.md`);
}

/** Repo-relative standards the prompts embed and the pre-check reads. */
export function standardsPath(repoRoot: string, file: 'grading-standard.md' | 'research-report-template.md' | 'requirements-specification-template.md'): string {
  return path.join(repoRoot, 'standards', file);
}
