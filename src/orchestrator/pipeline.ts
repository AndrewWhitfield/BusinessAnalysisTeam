import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { AgentOutcome, AgentRole, Phase, RunStatus } from '../types.js';
import { MAX_ELICITATION_ROUNDS, MAX_QUESTIONS_PER_ROUND, runBusinessAnalyst, type BaTask } from '../agents/businessAnalyst.js';
import { runQualityController } from '../agents/qualityController.js';
import { runLessonsCurator } from '../agents/lessonsCurator.js';
import { BudgetExhausted } from '../agents/invoke.js';
import { evaluateQcReport, revisionBrief, scorecard, type QcVerdict } from '../quality/qcReport.js';
import { formatPrecheck, runPrecheck } from '../quality/precheck.js';
import { isStalled, STALL_WINDOW } from '../quality/progress.js';
import { analysisPaths, answersFile, precheckFile, qcReportFile, questionsFile, type AnalysisPaths } from './paths.js';
import { BudgetTracker, commitAnalysis, ensureAnalysisRepo, exists, logHandoff, readStatus, writeStatus, writeText } from './records.js';
import {
  appendRecord,
  applyCuration,
  commitKnowledge,
  lessonsPromptFor,
  loadLedger,
  OWNER_FEEDBACK_FILE,
  parseCuration,
  QC_FINDINGS_FILE,
  saveLedger,
} from './learning.js';
import { presentationPage } from './presentation.js';

/** A malformed QC report is sent back to QC this many times before the owner is asked. */
const MAX_INVALID_QC_REPORTS = 3;

/** The three agents, injectable so the whole pipeline can be proven without spending on models. */
export interface Team {
  ba(task: BaTask, taskId: string): Promise<AgentOutcome>;
  qc(args: { taskId: string; round: number; previousReport?: string; baResponse?: string; ownerContext?: string; reportProblems?: string[] }): Promise<AgentOutcome>;
  curate(args: { taskId: string; occasion: string; evidence: string }): Promise<AgentOutcome>;
}

export interface StartParams {
  brief: string;
  askQuestions: boolean;
  minSources: number;
}

export interface OwnerInput {
  text?: string;
  approve?: boolean;
}

export interface RunParams {
  repoRoot: string;
  project: string;
  start?: StartParams;
  owner?: OwnerInput;
  /** Tests inject these; a real run builds them from the environment. */
  paths?: AnalysisPaths;
  team?: Team;
  commit?: boolean;
}

/** Why a run stopped. */
export type StopReason = 'awaiting-answers' | 'awaiting-guidance' | 'awaiting-acceptance' | 'accepted' | 'budget';

let taskCounter = 0;
function taskId(kind: string): string {
  taskCounter += 1;
  return `${kind}-${Date.now().toString(36)}-${taskCounter}`;
}

function realTeam(repoRoot: string, paths: AnalysisPaths, budget: BudgetTracker, project: string): Team {
  const remainingBudget = () => budget.remainingUsd();
  return {
    ba: (task, id) => runBusinessAnalyst({ task, taskId: id, repoRoot, paths, lessons: lessonsPromptFor(repoRoot, 'business-analyst'), remainingBudget }),
    qc: (args) => runQualityController({ ...args, repoRoot, paths, lessons: lessonsPromptFor(repoRoot, 'quality-controller'), remainingBudget }),
    curate: async (args) => runLessonsCurator({ ...args, project, ledger: await loadLedger(repoRoot), paths, remainingBudget }),
  };
}

function countQuestions(markdown: string): number {
  return (markdown.match(/^#{2,4}\s*Q-\d+/gm) ?? []).length;
}

function handoffSummary(outcome: AgentOutcome): string {
  const h = outcome.handoff;
  if (!h) return outcome.rawText.slice(-3000);
  const list = (label: string, items: string[]) => (items.length ? `${label}:\n${items.map((i) => `- ${i}`).join('\n')}\n` : '');
  return `${h.output}\n${list('Decisions', h.decisions)}${list('Assumptions', h.assumptions)}${list('Open questions', h.open_questions)}`.trim();
}

/** One analysis run: advances the state machine until it reaches an owner checkpoint or the budget. */
class AnalysisRun {
  private status!: RunStatus;

  constructor(
    private readonly params: RunParams,
    private readonly paths: AnalysisPaths,
    private readonly budget: BudgetTracker,
    private readonly team: Team,
  ) {}

  async run(): Promise<StopReason> {
    await this.loadOrCreate();
    const early = await this.applyOwnerInput();
    if (early) return early;
    try {
      for (;;) {
        const stop = await this.step();
        await this.save(`Phase: ${this.status.phase}`);
        if (stop) return stop;
      }
    } catch (err) {
      if (!(err instanceof BudgetExhausted)) throw err;
      this.status.budgetPaused = true;
      await this.checkpoint('budget', `This invocation has used its $${this.budget.cap.toFixed(2)} budget (analysis total so far $${this.budget.totalUsd.toFixed(2)}). Work done is saved.\n\nContinue with a fresh cap: \`npm start -- --project ${this.params.project} --resume --approve\``);
      await this.save('Paused at the budget cap');
      return 'budget';
    }
  }

  // ---- state ----------------------------------------------------------------------------------

  private async loadOrCreate(): Promise<void> {
    const existing = await readStatus(this.paths);
    if (existing && this.params.start) throw new Error(`"${this.params.project}" already has an analysis — continue it with --resume.`);
    if (existing) {
      this.status = existing;
      return;
    }
    const start = this.params.start;
    if (!start) throw new Error(`"${this.params.project}" has no analysis to resume — start one with --brief-file.`);
    await ensureAnalysisRepo(this.paths.dir);
    await writeText(this.paths.brief, start.brief);
    this.status = {
      version: 1,
      project: this.params.project,
      createdAt: new Date().toISOString(),
      phase: 'elicitation',
      budgetPaused: false,
      askQuestions: start.askQuestions,
      minSources: start.minSources,
      elicitationRound: 0,
      qcRound: 0,
      stallBaseline: 0,
      rounds: [],
      lastAnswersDeferred: false,
      invalidQcReports: 0,
    };
    await this.save('Analysis started: brief recorded');
  }

  private async save(message: string): Promise<void> {
    await writeStatus(this.paths, this.status);
    if (this.params.commit !== false) await commitAnalysis(this.paths.dir, message);
  }

  private setPhase(phase: Phase): void {
    this.status.phase = phase;
    console.log(`[orchestrator] → ${phase}`);
  }

  // ---- owner input at checkpoints -------------------------------------------------------------

  /** Applies --approve / --feedback to whatever is waiting; returns a stop reason if nothing can proceed. */
  private async applyOwnerInput(): Promise<StopReason | undefined> {
    const owner = this.params.owner ?? {};
    if (this.status.budgetPaused) {
      if (!owner.approve) return this.repeatCheckpoint('budget');
      this.status.budgetPaused = false;
      return undefined;
    }
    switch (this.status.phase) {
      case 'awaiting-answers':
        return this.onAnswers(owner);
      case 'awaiting-guidance':
        return this.onGuidance(owner);
      case 'awaiting-acceptance':
      case 'accepted':
        return this.onAcceptance(owner);
      default:
        if (owner.text || owner.approve) console.warn('[orchestrator] Nothing is waiting for an answer — your input was not needed; continuing the run.');
        return undefined;
    }
  }

  private async repeatCheckpoint(reason: StopReason): Promise<StopReason> {
    console.log(`[orchestrator] Waiting for you (${reason}). See ${this.paths.checkpoint}`);
    if (await exists(this.paths.checkpoint)) console.log(`\n${await readFile(this.paths.checkpoint, 'utf8')}`);
    return reason;
  }

  private async onAnswers(owner: OwnerInput): Promise<StopReason | undefined> {
    if (!owner.text && !owner.approve) return this.repeatCheckpoint('awaiting-answers');
    const round = this.status.elicitationRound;
    const deferred = !owner.text;
    const body = deferred
      ? 'The owner did not answer these questions and approved the analyst\'s stated default assumptions ("If unanswered, I will assume").'
      : owner.text!;
    await writeText(answersFile(this.paths, round), `# Owner's answers — round ${round}\n\n${body}\n`);
    this.status.lastAnswersDeferred = deferred;
    this.setPhase('consolidation');
    if (owner.text) await this.learnFromOwner(`owner answers to elicitation round ${round}`, owner.text);
    return undefined;
  }

  private async onGuidance(owner: OwnerInput): Promise<StopReason | undefined> {
    if (!owner.text && !owner.approve) return this.repeatCheckpoint('awaiting-guidance');
    const outstanding = this.status.pendingRevision?.feedback ?? '';
    if (owner.text) {
      this.status.pendingRevision = { source: 'owner-guidance', feedback: `Owner's guidance:\n${owner.text}\n\nOutstanding findings:\n${outstanding}` };
      this.status.ownerContext = owner.text;
      await this.learnFromOwner('guidance after stalled QC rounds', owner.text);
    }
    this.status.stallBaseline = this.status.rounds.length;
    this.status.invalidQcReports = 0;
    this.setPhase('quality-gate');
    return undefined;
  }

  private async onAcceptance(owner: OwnerInput): Promise<StopReason | undefined> {
    if (owner.text) {
      this.status.pendingRevision = { source: 'owner-change', feedback: owner.text };
      this.status.ownerContext = owner.text;
      this.status.stallBaseline = this.status.rounds.length;
      this.setPhase('quality-gate');
      await this.learnFromOwner('change request on the A-graded pack', owner.text);
      return undefined;
    }
    if (owner.approve && this.status.phase === 'awaiting-acceptance') {
      this.setPhase('accepted');
      await this.checkpoint('accepted', `Accepted by the owner on ${new Date().toISOString().slice(0, 10)}. The documentation pack is in ${this.paths.deliverablesDir}.`);
      await this.save('Accepted by the owner');
      return 'accepted';
    }
    return this.repeatCheckpoint(this.status.phase === 'accepted' ? 'accepted' : 'awaiting-acceptance');
  }

  // ---- the work ---------------------------------------------------------------------------------

  private async step(): Promise<StopReason | undefined> {
    switch (this.status.phase) {
      case 'elicitation':
        return this.elicit();
      case 'consolidation':
        return this.consolidate();
      case 'research':
        await this.callBa({ kind: 'research' });
        this.setPhase('documentation');
        return undefined;
      case 'documentation':
        await this.callBa({ kind: 'document' });
        this.setPhase('quality-gate');
        return undefined;
      case 'quality-gate':
        return this.qualityGate();
      default:
        return this.status.phase as StopReason;
    }
  }

  private async callBa(task: BaTask): Promise<AgentOutcome> {
    return this.call('business-analyst', task.kind, (id) => this.team.ba(task, id));
  }

  private async call(role: AgentRole, kind: string, fn: (id: string) => Promise<AgentOutcome>): Promise<AgentOutcome> {
    const id = taskId(kind);
    console.log(`[orchestrator] ${role}: ${kind} (${id})`);
    const outcome = await fn(id);
    await this.budget.record(outcome);
    await logHandoff(this.paths, role, id, outcome);
    console.log(`[orchestrator]   $${outcome.costUsd.toFixed(2)} · analysis total $${this.budget.totalUsd.toFixed(2)}${outcome.isError ? ' · ended in error' : ''}`);
    return outcome;
  }

  private async elicit(): Promise<StopReason | undefined> {
    if (!this.status.askQuestions) {
      this.setPhase('research');
      return undefined;
    }
    const round = this.status.elicitationRound + 1;
    await this.callBa({ kind: 'elicit', round });
    return this.afterQuestions(round, 'research');
  }

  private async questionCount(round: number): Promise<number> {
    const file = questionsFile(this.paths, round);
    return (await exists(file)) ? countQuestions(await readFile(file, 'utf8')) : 0;
  }

  /** Stops for the owner if the BA wrote questions for `round`; otherwise moves on. Over the limit, the BA trims them first. */
  private async afterQuestions(round: number, otherwise: Phase): Promise<StopReason | undefined> {
    const file = questionsFile(this.paths, round);
    const asked = await this.questionCount(round);
    if (asked > MAX_QUESTIONS_PER_ROUND) {
      console.log(`[orchestrator] ${asked} questions is over the limit of ${MAX_QUESTIONS_PER_ROUND} — the Business Analyst trims them.`);
      await this.callBa({ kind: 'trim-questions', round, count: asked });
    }
    const questions = await this.questionCount(round);
    if (questions === 0) {
      this.setPhase(otherwise);
      return undefined;
    }
    this.status.elicitationRound = round;
    this.setPhase('awaiting-answers');
    await this.checkpoint(
      'questions',
      `The Business Analyst has ${questions} question(s) for you: ${file}\n\nAnswer them (refer to each by its Q- number) in a file, then:\n  npm start -- --project ${this.params.project} --resume --feedback-file <your answers file>\n\nOr let the analyst proceed on the default assumptions stated under each question:\n  npm start -- --project ${this.params.project} --resume --approve`,
    );
    return 'awaiting-answers';
  }

  private async consolidate(): Promise<StopReason | undefined> {
    const round = this.status.elicitationRound;
    await this.callBa({ kind: 'consolidate', round, ownerDeferred: this.status.lastAnswersDeferred });
    if (round + 1 > MAX_ELICITATION_ROUNDS) {
      this.setPhase('research');
      return undefined;
    }
    return this.afterQuestions(round + 1, 'research');
  }

  // ---- the quality gate -------------------------------------------------------------------------

  private async qualityGate(): Promise<StopReason | undefined> {
    const pending = this.status.pendingRevision;
    if (pending) {
      const outcome = await this.callBa({ kind: 'revise', source: pending.source, feedback: pending.feedback });
      this.status.lastBaResponse = handoffSummary(outcome);
      this.status.pendingRevision = undefined;
      await this.save(`BA revision (${pending.source})`);
    }
    const round = this.status.qcRound + 1;
    const precheck = await runPrecheck(this.paths, { repoRoot: this.params.repoRoot, minSources: this.status.minSources });
    await writeText(precheckFile(this.paths, round), `# Round ${round} — mechanical pre-check\n\n${formatPrecheck(precheck)}\n`);
    if (!precheck.pass) {
      console.log(`[orchestrator] Pre-check: ${precheck.findings.length} finding(s) — back to the Business Analyst.`);
      this.recordRound({ round, at: new Date().toISOString(), precheckPassed: false });
      return this.belowA({ source: 'precheck', feedback: formatPrecheck(precheck) });
    }
    return this.gradeWithQc(round);
  }

  private async gradeWithQc(round: number): Promise<StopReason | undefined> {
    let problems: string[] | undefined;
    let verdict: QcVerdict | undefined;
    while (this.status.invalidQcReports < MAX_INVALID_QC_REPORTS) {
      const outcome = await this.call('quality-controller', `qc-round-${round}`, (id) =>
        this.team.qc({ taskId: id, round, previousReport: this.status.lastQcReport, baResponse: this.status.lastBaResponse, ownerContext: this.status.ownerContext, reportProblems: problems }),
      );
      verdict = evaluateQcReport(outcome.rawText);
      if (verdict.valid) break;
      this.status.invalidQcReports += 1;
      problems = verdict.problems;
      console.warn(`[orchestrator] QC's report broke the report rules (${verdict.problems.length} problem(s)) — sent back to QC.`);
    }
    if (!verdict?.valid) return this.invalidReportsCheckpoint(verdict);
    this.status.invalidQcReports = 0;
    await this.recordQcRound(round, verdict);
    if (verdict.pass) return this.present(verdict);
    console.log(`[orchestrator] QC round ${round}: ${verdict.overall} (${scorecard(verdict)}) — back to the Business Analyst with findings and uplift.`);
    return this.belowA({ source: 'qc', feedback: revisionBrief(verdict) });
  }

  private recordRound(record: RunStatus['rounds'][number]): void {
    this.status.rounds.push(record);
    this.status.qcRound = record.round;
  }

  private async recordQcRound(round: number, verdict: QcVerdict): Promise<void> {
    const at = new Date().toISOString();
    this.recordRound({ round, at, precheckPassed: true, overall: verdict.overall, areas: Object.fromEntries(verdict.areas.map((a) => [a.area, a.computedGrade])), findings: verdict.counts });
    this.status.lastQcReport = verdict.reportText;
    const table = verdict.areas.map((a) => `| ${a.area} | ${a.computedGrade} | ${a.findings.filter((f) => f.severity !== 'OBSERVATION').length} |`).join('\n');
    await writeText(
      qcReportFile(this.paths, round),
      `# Round ${round} — Quality Controller's report\n\n**Overall: ${verdict.overall}** — ${verdict.pass ? 'PASS (A in every area)' : 'below A: returned to the Business Analyst'}\n\n| Area | Grade (computed) | Findings |\n|---|---|---|\n${table}\n\n## Report\n\n\`\`\`\n${verdict.reportText}\n\`\`\`\n`,
    );
    for (const a of verdict.areas) {
      for (const f of a.findings) await appendRecord(this.params.repoRoot, QC_FINDINGS_FILE, { at, project: this.params.project, round, area: a.area, ...f });
    }
  }

  /** Below A: queue the revision, unless the rounds have stalled — then the owner is asked. */
  private async belowA(revision: NonNullable<RunStatus['pendingRevision']>): Promise<StopReason | undefined> {
    this.status.pendingRevision = revision;
    if (!isStalled(this.status.rounds, this.status.stallBaseline)) return undefined;
    this.setPhase('awaiting-guidance');
    await this.checkpoint(
      'guidance',
      `The last ${STALL_WINDOW} quality rounds haven't improved on the best grade so far — the analyst likely needs something only you can give (a fact, a decision, a scope call). The pack is NOT released below A.\n\nOutstanding findings (latest round):\n\n${revision.feedback}\n\nGive guidance in a file:  npm start -- --project ${this.params.project} --resume --feedback-file <file>\nOr let the loop carry on as is:  npm start -- --project ${this.params.project} --resume --approve`,
    );
    return 'awaiting-guidance';
  }

  private async invalidReportsCheckpoint(verdict: QcVerdict | undefined): Promise<StopReason> {
    this.status.invalidQcReports = 0;
    this.setPhase('awaiting-guidance');
    await this.checkpoint(
      'guidance',
      `The Quality Controller produced ${MAX_INVALID_QC_REPORTS} reports in a row that break the grading standard's report rules, so no grade can be computed:\n${(verdict?.problems ?? []).map((p) => `- ${p}`).join('\n')}\n\nResume to try again (\`--resume --approve\`), or give guidance with \`--resume --feedback-file <file>\`.`,
    );
    return 'awaiting-guidance';
  }

  // ---- presentation -------------------------------------------------------------------------------

  private async present(verdict: QcVerdict): Promise<StopReason> {
    console.log(`[orchestrator] QC awards A in every area (round ${this.status.qcRound}).`);
    await this.learnFromQcRounds();
    const page = await presentationPage(this.paths, this.status, verdict, this.budget.totalUsd);
    await writeText(this.paths.presentation, page);
    this.setPhase('awaiting-acceptance');
    await this.checkpoint('acceptance', `Your documentation pack is ready — QC grade A in every area.\n\nStart here: ${this.paths.presentation}\n\nAccept: npm start -- --project ${this.params.project} --resume --approve\nRequest changes: npm start -- --project ${this.params.project} --resume --feedback-file <file>`);
    console.log(`\n${page}`);
    return 'awaiting-acceptance';
  }

  private async checkpoint(kind: string, body: string): Promise<void> {
    const text = `# Checkpoint: ${kind}\n\nAnalysis: ${this.params.project} · ${new Date().toISOString()}\n\n${body}\n`;
    await writeText(this.paths.checkpoint, text);
    console.log(`\n[orchestrator] ${'='.repeat(70)}\n${text}`);
  }

  // ---- learning -----------------------------------------------------------------------------------

  private async learnFromOwner(occasion: string, text: string): Promise<void> {
    await appendRecord(this.params.repoRoot, OWNER_FEEDBACK_FILE, { at: new Date().toISOString(), project: this.params.project, occasion, text });
    await this.curate(occasion, text);
  }

  /** Once A is reached: what QC had to find on the way becomes lessons, so the next first draft is better. */
  private async learnFromQcRounds(): Promise<void> {
    if (this.status.rounds.length - this.status.stallBaseline <= 1 && !this.status.rounds.some((r) => !r.precheckPassed)) return;
    const files = (await readdir(this.paths.reviewsDir)).filter((f) => /^round-\d+-(qc|precheck)\.md$/.test(f)).sort((a, b) => Number(/\d+/.exec(a)![0]) - Number(/\d+/.exec(b)![0]));
    const parts = await Promise.all(files.map(async (f) => `## ${f}\n${await readFile(path.join(this.paths.reviewsDir, f), 'utf8')}`));
    const evidence = parts.join('\n\n').slice(-60_000);
    await this.curate(`the findings QC and the pre-check raised before the pack reached A (${this.status.rounds.length} round(s))`, evidence);
  }

  private async curate(occasion: string, evidence: string): Promise<void> {
    const repoRoot = this.params.repoRoot;
    try {
      const outcome = await this.call('lessons-curator', 'curate', (id) => this.team.curate({ taskId: id, occasion, evidence }));
      const curation = parseCuration(outcome.rawText);
      if (curation) {
        const today = new Date().toISOString().slice(0, 10);
        const { ledger, notes } = applyCuration(await loadLedger(repoRoot), curation, `${this.params.project} — ${occasion} (${today})`, today);
        await saveLedger(repoRoot, ledger);
        notes.forEach((n) => console.warn(`[orchestrator] Lessons: ${n}`));
        console.log(`[orchestrator] Lessons: ${curation.add.length} added, ${curation.update.length} updated, ${curation.retire.length} retired.`);
      } else console.warn('[orchestrator] The Lessons curator gave no valid lessons block — the evidence is recorded, the ledger unchanged.');
    } catch (err) {
      if (err instanceof BudgetExhausted) throw err;
      console.warn(`[orchestrator] Learning failed (the run carries on): ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      if (this.params.commit !== false) await commitKnowledge(repoRoot, `Team learning: ${this.params.project} — ${occasion}`);
    }
  }
}

export async function runAnalysis(params: RunParams): Promise<StopReason> {
  const paths = params.paths ?? analysisPaths(params.repoRoot, params.project);
  const budget = new BudgetTracker(paths);
  await budget.restore();
  const team = params.team ?? realTeam(params.repoRoot, paths, budget, params.project);
  return new AnalysisRun(params, paths, budget, team).run();
}
