import { describe, expect, it } from 'vitest';
import { activeLessonsFor, applyCuration, parseCuration, type LessonLedger } from '../src/orchestrator/learning.js';

const empty: LessonLedger = { version: 1, lessons: [] };

describe('lesson ledger', () => {
  it('adds, updates and retires lessons with stable ids', () => {
    const first = applyCuration(empty, { add: [{ roles: ['business-analyst'], lesson: 'State every NFR threshold with its measurement method.', why: 'QC raised it in 3 rounds.' }], update: [], retire: [] }, 'x', '2026-10-10').ledger;
    expect(first.lessons[0]?.id).toBe('L-001');
    const second = applyCuration(
      first,
      {
        add: [{ roles: ['all'], lesson: 'Cite owner answers as [A:Q-n] everywhere.', why: 'Traceability findings.' }],
        update: [{ id: 'L-001', lesson: 'State every NFR threshold with metric, conditions and method.', why: 'Sharper.' }],
        retire: [{ id: 'L-404', reason: 'does not exist' }],
      },
      'y',
      '2026-10-11',
    );
    expect(second.ledger.lessons.map((l) => l.id)).toEqual(['L-001', 'L-002']);
    expect(second.ledger.lessons[0]?.updated).toBe('2026-10-11');
    expect(second.notes).toEqual(['retire skipped: no lesson L-404']);
    expect(activeLessonsFor(second.ledger, 'quality-controller').map((l) => l.id)).toEqual(['L-002']);
  });

  it('parses the curator block and rejects a broken one', () => {
    expect(parseCuration('```lessons\n{"add": []}\n```')).toEqual({ add: [], update: [], retire: [] });
    expect(parseCuration('```lessons\n{not json\n```')).toBeUndefined();
    expect(parseCuration('nothing')).toBeUndefined();
  });
});
