import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { RunStatus } from '../types.js';
import { QC_AREAS } from '../quality/standard.js';
import { section } from '../quality/precheck.js';
import type { QcVerdict } from '../quality/qcReport.js';
import { qcReportFile, type AnalysisPaths } from './paths.js';

function roundRow(r: RunStatus['rounds'][number]): string {
  if (!r.precheckPassed) return `| ${r.round} | pre-check failed | — | — |`;
  const f = r.findings ?? { critical: 0, major: 0, minor: 0 };
  const areas = QC_AREAS.map((a) => r.areas?.[a] ?? '?').join(' ');
  return `| ${r.round} | ${r.overall ?? '?'} | ${areas} | ${f.critical} / ${f.major} / ${f.minor} |`;
}

function openItems(spec: string): string {
  const ids = (title: string, prefix: string) => new Set(section(spec, title).match(new RegExp(`\\b${prefix}-\\d+\\b`, 'g')) ?? []).size;
  return `${ids('Assumptions', 'AS')} assumption(s) to validate and ${ids('Open questions', 'OQ')} open question(s) — see the specification's Assumptions and Open questions sections.`;
}

/**
 * The page the owner reads first: what the pack is, its QC certification, how it got there, and
 * what the owner needs to decide. Written by the orchestrator from the records, never by an agent.
 */
export async function presentationPage(paths: AnalysisPaths, status: RunStatus, verdict: QcVerdict, totalUsd: number): Promise<string> {
  const spec = await readFile(paths.specification, 'utf8');
  const summary = section(spec, 'Executive summary').trim();
  const heading = /^#\s+(.+)$/m.exec(spec)?.[1]?.trim() ?? status.project;
  const title = heading.replace(/^Requirements specification\s*[—–-]\s*/i, '');
  const final = status.rounds.at(-1)!;
  const rel = (p: string) => path.relative(paths.deliverablesDir, p).replace(/\\/g, '/');
  return `# ${title}

**Status: QC grade A in all ${QC_AREAS.length} areas** (round ${final.round}) — ready for your review and sign-off.

| Document | What it is |
|---|---|
| [Requirements specification](requirements-specification.md) | Objectives, stakeholders, scope, business / functional / non-functional requirements with acceptance criteria, data, rules, assumptions, risks, traceability. |
| [Research report](research-report.md) | The research behind it: findings, comparables, regulatory context, counter-evidence, and the verified source register. |
| [QC certificate](${rel(qcReportFile(paths, final.round))}) | The Quality Controller's final report: the evidence for every A. |
| [Elicitation record](${rel(paths.elicitationRecord)}) | Your answers to the analyst's questions, and the assumptions adopted where none was given. |

## Executive summary

${summary || '(see the specification)'}

## What needs your decision

${openItems(spec)}

## QC certification

Graded against [the grading standard](https://github.com/AndrewWhitfield/BusinessAnalysisTeam/blob/main/standards/grading-standard.md): an area is A only with no critical, major or minor finding and recorded evidence that each of its A criteria holds.

| Area | Grade | Evidence (QC) |
|---|---|---|
${verdict.areas.map((a) => `| ${a.area.replace('QC-', '')} | ${a.computedGrade} | ${a.aEvidence.replace(/\|/g, '\\|').slice(0, 400)} |`).join('\n')}

## How it got here

| Round | Overall | Areas (${QC_AREAS.map((a) => a.replace('QC-', '').slice(0, 4).toLowerCase()).join(' ')}) | Findings (crit / major / minor) |
|---|---|---|---|
${status.rounds.map(roundRow).join('\n')}

Total model spend for this analysis: $${totalUsd.toFixed(2)}.

## Your next step

- Accept: \`npm start -- --project ${status.project} --resume --approve\`
- Ask for changes: write them in a file, then \`npm start -- --project ${status.project} --resume --feedback-file <file>\` — the analyst revises and QC grades again to A.
`;
}
