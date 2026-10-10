import { cp, mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { QC_AREAS, type QcArea } from '../src/quality/standard.js';

export const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
export const FIXTURES = path.join(REPO_ROOT, 'test', 'fixtures');

/** A throwaway "team repo": the real standards and an empty knowledge folder. */
export async function tempRepo(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'bat-'));
  await cp(path.join(REPO_ROOT, 'standards'), path.join(dir, 'standards'), { recursive: true });
  return dir;
}

export async function fixture(name: string): Promise<string> {
  return readFile(path.join(FIXTURES, name), 'utf8');
}

const ORDER = 'ABCDE';

function rank(findings: string[]): string {
  const n = (s: string) => findings.filter((x) => x.startsWith(`[${s}]`)).length;
  if (n('CRITICAL') >= 2) return 'E';
  if (n('CRITICAL') === 1 || n('MAJOR') >= 3) return 'D';
  if (n('MAJOR') >= 1) return 'C';
  if (n('MINOR') >= 1) return 'B';
  return 'A';
}

export function handoffJson(from: string, output = 'done', decisions: string[] = []): string {
  const body = JSON.stringify({ from, task_id: 't', output, assumptions: [], decisions, confidence: 'high', open_questions: [] });
  return ['```json', body, '```'].join('\n');
}

/** A well-formed QC report; each finding is "[SEVERITY] ..." and gets an Uplift line. */
export function qcReport(
  spec: Partial<Record<QcArea, string[]>> = {},
  override: { stated?: Partial<Record<QcArea, string>>; overall?: string } = {},
): string {
  let worst = 'A';
  const blocks = QC_AREAS.map((area) => {
    const findings = spec[area] ?? [];
    const computed = rank(findings);
    if (ORDER.indexOf(computed) > ORDER.indexOf(worst)) worst = computed;
    const lines = findings.map((f) => `- ${f}\n  Uplift: fix it properly.`);
    return [`${area}: ${override.stated?.[area] ?? computed}`, ...lines, `A evidence: checked every criterion for ${area}.`].join('\n');
  });
  const report = ['```qc-report', ...blocks, `Stated overall: ${override.overall ?? worst}`, '```'].join('\n');
  return `Here is my review.\n\n${report}\n\n${handoffJson('quality-controller')}`;
}
