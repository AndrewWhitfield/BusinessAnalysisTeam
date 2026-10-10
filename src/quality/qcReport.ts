import { GRADES, type Grade } from '../types.js';
import { QC_AREAS, SEVERITIES, gradeFromCounts, worstGrade, type QcArea, type Severity, type SeverityCounts } from './standard.js';

export interface Finding {
  severity: Severity;
  text: string;
  uplift: string;
}

export interface AreaResult {
  area: QcArea;
  statedGrade: Grade;
  computedGrade: Grade;
  findings: Finding[];
  aEvidence: string;
}

export interface QcVerdict {
  /** The report is well formed and internally consistent; an invalid report is sent back to QC. */
  valid: boolean;
  problems: string[];
  areas: AreaResult[];
  /** Worst computed area grade; E when the report is unusable. */
  overall: Grade;
  statedOverall?: Grade;
  pass: boolean;
  counts: SeverityCounts;
  /** The report block exactly as QC wrote it. */
  reportText: string;
}

const AREA_HEADER = /^\s*\**(QC-[A-Z]+)\**\s*:\s*\**([A-E])\b/;
const FINDING = new RegExp(`^\\s*[-*]\\s*\\[(${SEVERITIES.join('|')})\\]\\s*(.+)$`, 'i');
const UPLIFT = /^\s*(?:[-*]\s*)?\**uplift\**\s*:\s*(.*)$/i;
const A_EVIDENCE = /^\s*(?:[-*]\s*)?\**A evidence\**\s*:\s*(.*)$/i;
const STATED_OVERALL = /^\s*\**stated overall\**\s*:\s*\**([A-E])\b/i;

/** The ```qc-report block (the last one, if QC wrote several). */
export function extractReportBlock(rawText: string): string | undefined {
  const blocks = [...rawText.matchAll(/```qc-report\s*\n([\s\S]*?)```/g)];
  return blocks.at(-1)?.[1]?.trim();
}

interface DraftArea {
  area: string;
  stated: Grade;
  findings: Finding[];
  aEvidence: string;
}

/** Adds a continuation line to whichever field the previous line opened. */
function continueLast(area: DraftArea, line: string, field: 'finding' | 'uplift' | 'evidence' | undefined): void {
  const text = line.trim();
  if (!text) return;
  const last = area.findings.at(-1);
  if (field === 'uplift' && last) last.uplift = `${last.uplift} ${text}`.trim();
  else if (field === 'finding' && last) last.text = `${last.text} ${text}`;
  else if (field === 'evidence') area.aEvidence = `${area.aEvidence} ${text}`.trim();
}

function parseAreas(block: string): { drafts: DraftArea[]; statedOverall?: Grade } {
  const drafts: DraftArea[] = [];
  let statedOverall: Grade | undefined;
  let field: 'finding' | 'uplift' | 'evidence' | undefined;
  for (const line of block.split('\n')) {
    const header = AREA_HEADER.exec(line);
    const overall = STATED_OVERALL.exec(line);
    const current = drafts.at(-1);
    if (header) {
      drafts.push({ area: header[1]!.toUpperCase(), stated: header[2]!.toUpperCase() as Grade, findings: [], aEvidence: '' });
      field = undefined;
    } else if (overall) {
      statedOverall = overall[1]!.toUpperCase() as Grade;
      field = undefined;
    } else if (current) {
      field = parseAreaLine(current, line, field);
    }
  }
  return { drafts, statedOverall };
}

function parseAreaLine(area: DraftArea, line: string, field: 'finding' | 'uplift' | 'evidence' | undefined): typeof field {
  const finding = FINDING.exec(line);
  if (finding) {
    area.findings.push({ severity: finding[1]!.toUpperCase() as Severity, text: finding[2]!.trim(), uplift: '' });
    return 'finding';
  }
  const uplift = UPLIFT.exec(line);
  if (uplift && area.findings.length > 0) {
    area.findings.at(-1)!.uplift = uplift[1]!.trim();
    return 'uplift';
  }
  const evidence = A_EVIDENCE.exec(line);
  if (evidence) {
    area.aEvidence = evidence[1]!.trim();
    return 'evidence';
  }
  continueLast(area, line, field);
  return field;
}

function countsOf(findings: Finding[]): SeverityCounts {
  return {
    critical: findings.filter((f) => f.severity === 'CRITICAL').length,
    major: findings.filter((f) => f.severity === 'MAJOR').length,
    minor: findings.filter((f) => f.severity === 'MINOR').length,
  };
}

function areaProblems(a: AreaResult): string[] {
  const problems: string[] = [];
  if (a.statedGrade !== a.computedGrade) {
    problems.push(`${a.area}: stated ${a.statedGrade} but its findings compute to ${a.computedGrade} (standard: "How a grade is computed")`);
  }
  for (const f of a.findings) {
    if (f.severity !== 'OBSERVATION' && !f.uplift) problems.push(`${a.area}: [${f.severity}] finding has no "Uplift:" line — "${f.text.slice(0, 80)}"`);
  }
  if (!a.aEvidence) problems.push(`${a.area}: no "A evidence:" line`);
  return problems;
}

/**
 * Parses QC's report and computes the verdict. The grade is the standard's computed grade, never QC's
 * stated letter: a mismatch, a finding without its uplift, a missing area or missing A evidence makes
 * the report invalid (and it goes back to QC, not to the BA). Pass needs every area A.
 */
export function evaluateQcReport(rawText: string): QcVerdict {
  const block = extractReportBlock(rawText);
  const empty = { critical: 0, major: 0, minor: 0 };
  if (!block) {
    return { valid: false, problems: ['No ```qc-report block found.'], areas: [], overall: 'E', pass: false, counts: empty, reportText: '' };
  }
  const { drafts, statedOverall } = parseAreas(block);
  const problems: string[] = [];
  const areas: AreaResult[] = [];
  for (const area of QC_AREAS) {
    const matches = drafts.filter((d) => d.area === area);
    if (matches.length === 0) {
      problems.push(`${area}: missing from the report`);
      continue;
    }
    if (matches.length > 1) problems.push(`${area}: graded ${matches.length} times`);
    const d = matches[0]!;
    areas.push({ area, statedGrade: d.stated, computedGrade: gradeFromCounts(countsOf(d.findings)), findings: d.findings, aEvidence: d.aEvidence });
  }
  for (const d of drafts) if (!(QC_AREAS as readonly string[]).includes(d.area)) problems.push(`${d.area}: not an area of the standard`);
  areas.forEach((a) => problems.push(...areaProblems(a)));
  const allFindings = areas.flatMap((a) => a.findings);
  const counts = countsOf(allFindings);
  const overall = areas.length === QC_AREAS.length ? worstGrade(areas.map((a) => a.computedGrade)) : 'E';
  if (!statedOverall) problems.push('No "Stated overall:" line');
  else if (statedOverall !== overall) problems.push(`Stated overall ${statedOverall} but the areas compute to ${overall}`);
  const valid = problems.length === 0;
  return { valid, problems, areas, overall, statedOverall, pass: valid && overall === 'A', counts, reportText: block };
}

export function isGrade(value: string): value is Grade {
  return (GRADES as readonly string[]).includes(value);
}

/** The feedback the BA receives for a revision: every finding with its uplift, worst first. */
export function revisionBrief(verdict: QcVerdict): string {
  const rank: Record<Severity, number> = { CRITICAL: 0, MAJOR: 1, MINOR: 2, OBSERVATION: 3 };
  const lines: string[] = [`QC graded the pack ${verdict.overall} overall (${scorecard(verdict)}). Every finding below must be fixed to reach A.`];
  const findings = verdict.areas
    .flatMap((a) => a.findings.map((f) => ({ area: a.area, ...f })))
    .filter((f) => f.severity !== 'OBSERVATION')
    .sort((x, y) => rank[x.severity] - rank[y.severity]);
  findings.forEach((f, i) => lines.push(`${i + 1}. [${f.severity}] ${f.area} — ${f.text}\n   Uplift to A: ${f.uplift}`));
  const observations = verdict.areas.flatMap((a) => a.findings.filter((f) => f.severity === 'OBSERVATION').map((f) => `- ${a.area}: ${f.text}`));
  if (observations.length) lines.push(`\nOptional observations (don't affect the grade):\n${observations.join('\n')}`);
  return lines.join('\n');
}

export function scorecard(verdict: QcVerdict): string {
  return verdict.areas.map((a) => `${a.area.replace('QC-', '').toLowerCase()} ${a.computedGrade}`).join(', ');
}
