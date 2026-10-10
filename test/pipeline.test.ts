import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { runAnalysis, type Team } from '../src/orchestrator/pipeline.js';
import { pathsFor, questionsFile, type AnalysisPaths } from '../src/orchestrator/paths.js';
import { BudgetExhausted, SetupProblem, setupAdvice } from '../src/agents/invoke.js';
import type { BaTask } from '../src/agents/businessAnalyst.js';
import type { AgentOutcome } from '../src/types.js';
import { fixture, handoffJson, qcReport, tempRepo } from './helpers.js';

const ok = (rawText: string): AgentOutcome => ({ rawText, isError: false, costUsd: 0.5, tokens: 1000 });

interface Script {
  /** QC replies, one per QC call, in order (the last repeats). */
  qc: string[];
  /** Throw BudgetExhausted on the first call of this BA task kind. */
  budgetOn?: BaTask['kind'];
  /** The first draft of the specification leaves NFR-2 out of the traceability matrix. */
  untracedFirstDraft?: boolean;
  /** The first draft of the questions asks this many (over the limit triggers a trim). */
  questions?: number;
}

/** A scripted team: the BA writes fixture documents, QC replies from the script, the curator adds a lesson. */
function scriptedTeam(paths: AnalysisPaths, script: Script) {
  const calls: string[] = [];
  let qcCalls = 0;
  let budgetThrown = false;
  const team: Team = {
    async ba(task) {
      calls.push(`ba:${task.kind}${task.kind === 'revise' ? `:${task.source}` : ''}`);
      if (script.budgetOn === task.kind && !budgetThrown) {
        budgetThrown = true;
        throw new BudgetExhausted(0.4);
      }
      await mkdir(paths.deliverablesDir, { recursive: true });
      await mkdir(paths.elicitationDir, { recursive: true });
      const questions = (n: number) => Array.from({ length: n }, (_, i) => `### Q-${i + 1} Question ${i + 1}?\n- If you don't answer, I'll assume: a default.\n`).join('\n');
      if (task.kind === 'elicit') await writeFile(questionsFile(paths, task.round), questions(script.questions ?? 2));
      if (task.kind === 'trim-questions') await writeFile(questionsFile(paths, task.round), questions(3));
      if (task.kind === 'consolidate') await writeFile(paths.elicitationRecord, '# Elicitation record\nQ-1 all branches.');
      if (task.kind === 'research') await writeFile(paths.researchReport, await fixture('research-report.md'));
      if (task.kind === 'document') {
        const spec = await fixture('requirements-specification.md');
        await writeFile(paths.specification, script.untracedFirstDraft ? spec.replace(/\| NFR-2 \| S1 \|.*\n/, '') : spec);
      }
      if (task.kind === 'revise') await writeFile(paths.specification, await fixture('requirements-specification.md'));
      return ok(handoffJson('business-analyst', `${task.kind} done`, ['Disputed nothing.']));
    },
    async qc(args) {
      calls.push(`qc:${args.round}${args.reportProblems ? ':fix' : ''}`);
      const reply = script.qc[Math.min(qcCalls, script.qc.length - 1)]!;
      qcCalls += 1;
      return ok(reply);
    },
    async curate() {
      calls.push('curate');
      return ok('```lessons\n{"add": [{"roles": ["business-analyst"], "lesson": "Trace every NFR in the matrix before handing off.", "why": "Pre-check and QC both raised it."}]}\n```\n' + handoffJson('lessons-curator'));
    },
  };
  return { team, calls };
}

const MINOR = qcReport({ 'QC-CLARITY': ['[MINOR] §Glossary — "OBJ" undefined — used in §4'] });
const ALL_A = qcReport();

let repoRoot: string;
let paths: AnalysisPaths;

beforeEach(async () => {
  repoRoot = await tempRepo();
  paths = pathsFor(path.join(repoRoot, 'Analyses', 'room-booking'));
});

const start = { brief: '# Room booking\nLet members book study rooms online.', askQuestions: true, minSources: 5 };

describe('the analysis pipeline (scripted agents)', () => {
  it('runs questions → research → documentation → pre-check → QC rounds until A → presentation → acceptance', async () => {
    const { team, calls } = scriptedTeam(paths, { qc: [MINOR, ALL_A], untracedFirstDraft: true });
    const base = { repoRoot, project: 'room-booking', paths, team, commit: false };

    expect(await runAnalysis({ ...base, start })).toBe('awaiting-answers');
    expect(await readFile(paths.checkpoint, 'utf8')).toMatch(/2 question\(s\)/);

    expect(await runAnalysis({ ...base, owner: { text: 'Q-1: only the central branch. Q-2: no budget limit.' } })).toBe('awaiting-acceptance');
    expect(calls).toEqual([
      'ba:elicit',
      'curate', // the owner's answers become lessons
      'ba:consolidate',
      'ba:research',
      'ba:document',
      // round 1: pre-check fails (NFR-2 untraced) — QC is not spent
      'ba:revise:precheck',
      'qc:2', // round 2: B (one minor)
      'ba:revise:qc',
      'qc:3', // round 3: A
      'curate', // what QC had to find becomes lessons
    ]);

    const status = JSON.parse(await readFile(paths.runStatus, 'utf8'));
    expect(status.rounds.map((r: { precheckPassed: boolean; overall?: string }) => r.overall ?? 'pre-check')).toEqual(['pre-check', 'B', 'A']);
    expect(await readFile(path.join(paths.reviewsDir, 'round-1-precheck.md'), 'utf8')).toMatch(/NFR-2 has no row in the traceability matrix/);
    expect(await readFile(path.join(paths.reviewsDir, 'round-3-qc.md'), 'utf8')).toMatch(/Overall: A/);

    const page = await readFile(paths.presentation, 'utf8');
    expect(page).toMatch(/QC grade A in all 8 areas/);
    expect(page).toMatch(/Members will book study rooms online/);
    expect(page).toMatch(/\| 2 \| B \|/);

    const answers = await readFile(path.join(paths.elicitationDir, 'answers-round-1.md'), 'utf8');
    expect(answers).toMatch(/only the central branch/);
    expect(await readFile(path.join(repoRoot, 'knowledge', 'owner-feedback.jsonl'), 'utf8')).toMatch(/central branch/);
    expect(await readFile(path.join(repoRoot, 'knowledge', 'qc-findings.jsonl'), 'utf8')).toMatch(/"severity":"MINOR"/);
    const ledger = JSON.parse(await readFile(path.join(repoRoot, 'knowledge', 'lessons.json'), 'utf8'));
    expect(ledger.lessons.length).toBe(2);

    expect(await runAnalysis({ ...base, owner: { approve: true } })).toBe('accepted');
  });

  it('holds the analyst to at most five plain questions: over the limit, it trims them before you see them', async () => {
    const { team, calls } = scriptedTeam(paths, { qc: [ALL_A], questions: 15 });
    const base = { repoRoot, project: 'room-booking', paths, team, commit: false };
    expect(await runAnalysis({ ...base, start })).toBe('awaiting-answers');
    expect(calls).toEqual(['ba:elicit', 'ba:trim-questions']);
    expect(await readFile(paths.checkpoint, 'utf8')).toMatch(/3 question\(s\)/);
  });

  it('never releases below A: stalled rounds stop for owner guidance, which goes to the BA', async () => {
    const { team, calls } = scriptedTeam(paths, { qc: [MINOR, MINOR, MINOR, MINOR, ALL_A] });
    const base = { repoRoot, project: 'room-booking', paths, team, commit: false };
    expect(await runAnalysis({ ...base, start: { ...start, askQuestions: false } })).toBe('awaiting-guidance');
    expect(calls.filter((c) => c.startsWith('qc:'))).toEqual(['qc:1', 'qc:2', 'qc:3', 'qc:4']);
    expect(await readFile(paths.checkpoint, 'utf8')).toMatch(/NOT released below A/);

    expect(await runAnalysis({ ...base, owner: { text: 'Define OBJ in the glossary; OBJ means business objective.' } })).toBe('awaiting-acceptance');
    expect(calls).toContain('ba:revise:owner-guidance');
  });

  it('sends a malformed QC report back to QC, never to the BA, and asks the owner after three', async () => {
    const mismatched = qcReport({ 'QC-ACCURACY': ['[MAJOR] S3 — dead link — 404'] }, { stated: { 'QC-ACCURACY': 'A' }, overall: 'A' });
    const { team, calls } = scriptedTeam(paths, { qc: [mismatched, ALL_A] });
    const base = { repoRoot, project: 'room-booking', paths, team, commit: false };
    expect(await runAnalysis({ ...base, start: { ...start, askQuestions: false } })).toBe('awaiting-acceptance');
    expect(calls.filter((c) => c.startsWith('qc:'))).toEqual(['qc:1', 'qc:1:fix']);
    expect(calls).not.toContain('ba:revise:qc');

    const other = pathsFor(path.join(repoRoot, 'Analyses', 'other'));
    const { team: alwaysMalformed } = scriptedTeam(other, { qc: [mismatched] });
    expect(await runAnalysis({ repoRoot, project: 'other', paths: other, team: alwaysMalformed, commit: false, start: { ...start, askQuestions: false } })).toBe('awaiting-guidance');
    expect(await readFile(other.checkpoint, 'utf8')).toMatch(/break the grading standard's report rules/);
  });

  it('stops at the budget cap and continues only with the owner\'s approval', async () => {
    const { team, calls } = scriptedTeam(paths, { qc: [ALL_A], budgetOn: 'research' });
    const base = { repoRoot, project: 'room-booking', paths, team, commit: false };
    expect(await runAnalysis({ ...base, start: { ...start, askQuestions: false } })).toBe('budget');
    expect(await runAnalysis({ ...base, owner: {} })).toBe('budget');
    expect(await runAnalysis({ ...base, owner: { approve: true } })).toBe('awaiting-acceptance');
    expect(calls.filter((c) => c === 'ba:research')).toHaveLength(2);
  });

  it('reopens an A-graded pack for an owner change and grades it to A again', async () => {
    const { team, calls } = scriptedTeam(paths, { qc: [ALL_A] });
    const base = { repoRoot, project: 'room-booking', paths, team, commit: false };
    expect(await runAnalysis({ ...base, start: { ...start, askQuestions: false } })).toBe('awaiting-acceptance');
    expect(await runAnalysis({ ...base, owner: { text: 'Add evening opening hours to scope.' } })).toBe('awaiting-acceptance');
    expect(calls).toContain('ba:revise:owner-change');
    expect(JSON.parse(await readFile(paths.runStatus, 'utf8')).ownerContext).toMatch(/evening/);
  });

  it('refuses to start twice on the same analysis', async () => {
    const { team } = scriptedTeam(paths, { qc: [ALL_A] });
    const base = { repoRoot, project: 'room-booking', paths, team, commit: false };
    await runAnalysis({ ...base, start: { ...start, askQuestions: false } });
    await expect(runAnalysis({ ...base, start })).rejects.toThrow(/already has an analysis/);
  });
});

describe('setup problems', () => {
  it('stop the run with guidance and leave the analysis where it was, ready to resume', async () => {
    const { team } = scriptedTeam(paths, { qc: [ALL_A] });
    const base = { repoRoot, project: 'room-booking', paths, commit: false };
    let failSignIn = true;
    const flaky: Team = {
      ...team,
      ba: async (task, id) => {
        if (failSignIn) throw new SetupProblem('The agents could not sign in to Claude.');
        return team.ba(task, id);
      },
    };
    expect(await runAnalysis({ ...base, team: flaky, start: { ...start, askQuestions: false } })).toBe('setup-problem');
    expect(await readFile(paths.checkpoint, 'utf8')).toMatch(/could not sign in/);
    expect(JSON.parse(await readFile(paths.runStatus, 'utf8')).phase).toBe('research');
    failSignIn = false;
    expect(await runAnalysis({ ...base, team: flaky, owner: {} })).toBe('awaiting-acceptance');
  });

  it('recognise sign-in, billing and model-access errors', () => {
    expect(setupAdvice('Invalid API key · Please run /login')).toMatch(/sign in/);
    expect(setupAdvice('Your credit balance is too low')).toMatch(/no usage left/);
    expect(setupAdvice('model: claude-x not found')).toMatch(/cannot use the configured model/);
    expect(setupAdvice('The research report is missing a section')).toBeUndefined();
  });
});
