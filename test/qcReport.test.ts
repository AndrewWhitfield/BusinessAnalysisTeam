import { describe, expect, it } from 'vitest';
import { evaluateQcReport, revisionBrief } from '../src/quality/qcReport.js';
import { gradeFromCounts } from '../src/quality/standard.js';
import { qcReport } from './helpers.js';

describe('gradeFromCounts (the grading standard)', () => {
  it.each([
    [{ critical: 0, major: 0, minor: 0 }, 'A'],
    [{ critical: 0, major: 0, minor: 1 }, 'B'],
    [{ critical: 0, major: 0, minor: 9 }, 'B'],
    [{ critical: 0, major: 1, minor: 0 }, 'C'],
    [{ critical: 0, major: 2, minor: 5 }, 'C'],
    [{ critical: 0, major: 3, minor: 0 }, 'D'],
    [{ critical: 1, major: 0, minor: 0 }, 'D'],
    [{ critical: 2, major: 0, minor: 0 }, 'E'],
  ])('%o grades %s', (counts, grade) => {
    expect(gradeFromCounts(counts)).toBe(grade);
  });
});

describe('evaluateQcReport', () => {
  it('passes an all-A report with evidence', () => {
    const v = evaluateQcReport(qcReport());
    expect(v.problems).toEqual([]);
    expect(v.pass).toBe(true);
    expect(v.overall).toBe('A');
  });

  it('ignores observations when grading', () => {
    expect(evaluateQcReport(qcReport({ 'QC-CLARITY': ['[OBSERVATION] §2 — a diagram would help — n/a'] })).pass).toBe(true);
  });

  it('fails the pack on a single minor finding anywhere (overall = worst area)', () => {
    const v = evaluateQcReport(qcReport({ 'QC-CLARITY': ['[MINOR] §3 — acronym undefined — "SLA"'] }));
    expect(v.valid).toBe(true);
    expect(v.pass).toBe(false);
    expect(v.overall).toBe('B');
    expect(v.areas.find((a) => a.area === 'QC-CLARITY')?.findings[0]?.uplift).toBe('fix it properly.');
  });

  it('invalidates a report whose stated grade does not match its findings', () => {
    const v = evaluateQcReport(qcReport({ 'QC-ACCURACY': ['[MAJOR] S3 — dead link — 404'] }, { stated: { 'QC-ACCURACY': 'A' }, overall: 'A' }));
    expect(v.valid).toBe(false);
    expect(v.pass).toBe(false);
    expect(v.problems.join('\n')).toMatch(/QC-ACCURACY: stated A but its findings compute to C/);
  });

  it('invalidates a finding without its uplift', () => {
    const text = qcReport({ 'QC-RESEARCH': ['[MINOR] RQ-2 — one source — S5'] }).replace('  Uplift: fix it properly.\n', '');
    const v = evaluateQcReport(text);
    expect(v.valid).toBe(false);
    expect(v.problems.join('\n')).toMatch(/no "Uplift:" line/);
  });

  it('invalidates a report with a missing area, and text with no report', () => {
    expect(evaluateQcReport(qcReport().replace(/QC-CLARITY: A\n.*\n/, '')).problems.join('\n')).toMatch(/QC-CLARITY: missing/);
    expect(evaluateQcReport('no report here').valid).toBe(false);
  });

  it('invalidates an A without A evidence', () => {
    const v = evaluateQcReport(qcReport().replace('A evidence: checked every criterion for QC-TRACEABILITY.', ''));
    expect(v.problems.join('\n')).toMatch(/QC-TRACEABILITY: no "A evidence:" line/);
  });

  it('builds a revision brief with every finding and its uplift, worst first', () => {
    const v = evaluateQcReport(qcReport({ 'QC-CLARITY': ['[MINOR] small'], 'QC-ACCURACY': ['[CRITICAL] wrong figure'] }));
    const brief = revisionBrief(v);
    expect(v.overall).toBe('D');
    expect(brief.indexOf('wrong figure')).toBeLessThan(brief.indexOf('small'));
    expect(brief).toMatch(/Uplift to A: fix it properly\./);
  });
});
