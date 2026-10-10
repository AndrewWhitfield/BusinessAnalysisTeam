import type { RoundRecord } from '../types.js';
import { QC_AREAS, gradePoints } from './standard.js';

/**
 * The loop runs until QC awards A — there is no round cap that lets a lower grade through. What it
 * does watch for is a stall: rounds that stop getting better usually mean the BA needs something only
 * the owner can give (a fact, a decision, a scope call). Then the run stops and asks the owner instead
 * of spending on rounds that can't converge.
 */
export const STALL_WINDOW = 3;

/**
 * A round's score: the sum of its area points (A=4 … E=0), less a point per finding so fixing
 * findings within a grade still counts as progress. A failed pre-check scores below any graded round.
 */
export function roundScore(r: RoundRecord): number {
  if (!r.precheckPassed || !r.areas) return -1;
  const points = QC_AREAS.reduce((sum, area) => sum + gradePoints(r.areas?.[area] ?? 'E'), 0);
  const f = r.findings ?? { critical: 0, major: 0, minor: 0 };
  return points * 100 - (f.critical * 9 + f.major * 3 + f.minor);
}

/** True when the last STALL_WINDOW rounds since the baseline all failed to beat the best before them. */
export function isStalled(rounds: RoundRecord[], baseline: number): boolean {
  const considered = rounds.slice(baseline);
  if (considered.length <= STALL_WINDOW) return false;
  const before = considered.slice(0, -STALL_WINDOW).map(roundScore);
  const recent = considered.slice(-STALL_WINDOW).map(roundScore);
  return Math.max(...recent) <= Math.max(...before);
}
