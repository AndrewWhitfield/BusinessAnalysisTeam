import { readFileSync } from 'node:fs';
import type { Grade } from '../types.js';
import { standardsPath } from '../orchestrator/paths.js';

/**
 * The eight graded areas, in report order. standards/grading-standard.md defines each one's A
 * criteria; a test keeps the two in step.
 */
export const QC_AREAS = [
  'QC-COMPLETENESS',
  'QC-ACCURACY',
  'QC-RESEARCH',
  'QC-REQUIREMENTS',
  'QC-TRACEABILITY',
  'QC-CONSISTENCY',
  'QC-ALIGNMENT',
  'QC-CLARITY',
] as const;
export type QcArea = (typeof QC_AREAS)[number];

export const SEVERITIES = ['CRITICAL', 'MAJOR', 'MINOR', 'OBSERVATION'] as const;
export type Severity = (typeof SEVERITIES)[number];

export interface SeverityCounts {
  critical: number;
  major: number;
  minor: number;
}

/**
 * The grading standard's rule (standards/grading-standard.md, "How a grade is computed"): the grade
 * follows from the findings' severities, never from the reviewer's impression. Observations don't count.
 */
export function gradeFromCounts(c: SeverityCounts): Grade {
  if (c.critical >= 2) return 'E';
  if (c.critical === 1 || c.major >= 3) return 'D';
  if (c.major >= 1) return 'C';
  if (c.minor >= 1) return 'B';
  return 'A';
}

const ORDER: Record<Grade, number> = { A: 4, B: 3, C: 2, D: 1, E: 0 };

/** Points for progress tracking: A=4 … E=0. */
export function gradePoints(g: Grade): number {
  return ORDER[g];
}

export function worstGrade(grades: Grade[]): Grade {
  return grades.reduce<Grade>((worst, g) => (ORDER[g] < ORDER[worst] ? g : worst), 'A');
}

/** The standard's full text, embedded in the BA's and QC's system prompts. */
export function gradingStandardText(repoRoot: string): string {
  return readFileSync(standardsPath(repoRoot, 'grading-standard.md'), 'utf8');
}
