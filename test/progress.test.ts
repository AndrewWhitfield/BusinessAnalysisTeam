import { describe, expect, it } from 'vitest';
import { isStalled, roundScore } from '../src/quality/progress.js';
import { QC_AREAS } from '../src/quality/standard.js';
import type { Grade, RoundRecord } from '../src/types.js';

function round(n: number, grade: Grade, minor = 0): RoundRecord {
  return { round: n, at: '', precheckPassed: true, overall: grade, areas: Object.fromEntries(QC_AREAS.map((a) => [a, grade])), findings: { critical: 0, major: 0, minor } };
}

describe('stall detection', () => {
  it('fixing findings within the same grade still counts as progress', () => {
    expect(roundScore(round(1, 'B', 2))).toBeGreaterThan(roundScore(round(1, 'B', 5)));
  });

  it('is not stalled while rounds keep improving', () => {
    expect(isStalled([round(1, 'C'), round(2, 'B', 6), round(3, 'B', 4), round(4, 'B', 2)], 0)).toBe(false);
  });

  it('is stalled after three rounds without beating the best', () => {
    expect(isStalled([round(1, 'B', 2), round(2, 'B', 3), round(3, 'B', 2), round(4, 'C')], 0)).toBe(true);
  });

  it('only counts rounds after the baseline (owner guidance resets it)', () => {
    expect(isStalled([round(1, 'B', 2), round(2, 'B', 3), round(3, 'B', 2), round(4, 'C')], 1)).toBe(false);
  });

  it('scores a failed pre-check below any graded round', () => {
    expect(roundScore({ round: 1, at: '', precheckPassed: false })).toBeLessThan(roundScore(round(1, 'E')));
  });
});
