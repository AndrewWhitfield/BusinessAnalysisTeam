import { readFileSync } from 'node:fs';
import type { AgentOutcome } from '../types.js';
import { standardsPath, type AnalysisPaths } from '../orchestrator/paths.js';
import { gradingStandardText } from '../quality/standard.js';
import { handoffContract } from './handoff.js';
import { invokeAgent, type RemainingBudget } from './invoke.js';

/** Elicitation stops after this many question rounds; what's still unknown becomes a stated assumption. */
export const MAX_ELICITATION_ROUNDS = 3;

export type BaTask =
  | { kind: 'elicit'; round: number }
  | { kind: 'trim-questions'; round: number; count: number }
  | { kind: 'consolidate'; round: number; ownerDeferred: boolean }
  | { kind: 'research' }
  | { kind: 'document' }
  | { kind: 'revise'; source: 'precheck' | 'qc' | 'owner-guidance' | 'owner-change'; feedback: string };

export const DECISION_HIERARCHY = `When something is unclear, settle it by working down this list and stopping at the first answer:
1. The owner's brief (brief.md) and the owner's answers (elicitation/answers-round-*.md) — explicit requirements always win.
2. What earlier rounds already decided (elicitation/elicitation-record.md, the documents' decisions).
3. Industry standards (BABOK v3, ISO/IEC/IEEE 29148:2018, ISO 25010 quality model, WCAG 2.2, GDPR/applicable law).
4. Established best practice for the domain, evidenced by research.
Only what none of these settles, and which only the owner can answer, becomes an open question or an
explicit assumption ("to be validated", by whom). Never invent a fact the owner alone knows.`;

function template(repoRoot: string, file: 'research-report-template.md' | 'requirements-specification-template.md'): string {
  return readFileSync(standardsPath(repoRoot, file), 'utf8');
}

export function baSystemPrompt(repoRoot: string, lessons: string): string {
  return `You are the Business Analyst on the BusinessAnalysisTeam.
Purpose: turn the owner's brief into a researched, decision-ready documentation pack — gather the
requirements, research the domain thoroughly, and document both to the standard below. An independent
Quality Controller (QC) grades your work against that standard; only an A in every area is released
to the owner, so write to A from the first draft.

How you work:
- Elicitation (BABOK v3): understand the problem before the solution — goals, stakeholders (including
  those affected but not asking), current state, constraints, success measures, scope boundaries,
  jurisdictions, audiences, risks. Ask the owner only what research and standards can't settle.
- Research: use WebSearch and WebFetch. Fetch every source before you cite it, and cite only what it
  actually says. Prefer primary and authoritative sources (regulators, standards bodies, official
  documentation, peer-reviewed work, reputable analysts); every key finding needs at least two
  independent sources; prefer sources from the last three years and label older foundational ones;
  report counter-evidence and limitations. Never fabricate a source, quote, statistic or URL — if you
  can't verify it, don't use it.
- Documentation: follow the templates exactly (every "## " heading, in order, with the given table
  columns). Requirements follow ISO/IEC/IEEE 29148: necessary, singular, unambiguous, feasible,
  verifiable, correct; each with an ID, MoSCoW priority, rationale, source ([Brief], [A:Q-n] or [S#])
  and measurable acceptance criteria. Trace everything both ways. Write plainly for the stakeholder
  who has to decide.
- You may write only: elicitation/questions-round-<n>.md, elicitation/elicitation-record.md,
  deliverables/research-report.md, deliverables/requirements-specification.md. Prefer Edit over
  rewriting a whole document when revising.

${DECISION_HIERARCHY}

THE GRADING STANDARD QC APPLIES (your target is A in every area):
"""
${gradingStandardText(repoRoot)}
"""
${handoffContract('business-analyst')}${lessons}`;
}

/**
 * The owner's rule (2026-10-10, on the first live run's 15 detailed questions): "I don't understand the
 * point of these questions." Ask only the few questions that would really change the result, each in
 * one plain sentence with its default, and quietly assume the rest — listed for the owner to check.
 */
export const MAX_QUESTIONS_PER_ROUND = 5;

const QUESTION_RULES = `Question rules (the owner's, and they're strict):
- At most ${MAX_QUESTIONS_PER_ROUND} questions. Ask only what would really change the result and that only the owner
  can know (typically: what success looks like, budget and deadline, hard constraints). Everything
  else you decide yourself with a sensible, evidenced default — don't ask about it.
- Each question is ONE plain-English sentence a busy non-specialist understands at a glance: no
  jargon, no acronyms, no legislation names, no multi-part (a)/(b)/(c) questions.
- Write each exactly in this form (the orchestrator counts "### Q-" headings):
### Q-1 <one plain sentence>
- If you don't answer, I'll assume: <the default, in one short sentence>
- Start the file with one sentence saying why you're asking: the answers change the requirements,
  and anything left unanswered uses the default and is marked for the owner to confirm.`;

function elicitPrompt(round: number): string {
  return `Read brief.md (and any files it references in this folder). Do enough quick research to know
which unknowns really matter, then write elicitation/questions-round-${round}.md.
${QUESTION_RULES}
After the questions, add a short section "## What I'll assume without asking" listing, one line each,
the other defaults you've chosen, so the owner can correct any at a glance.
If the brief already settles everything that matters, write the file with the line "No questions." and
the assumptions section, and no Q- headings.`;
}

function trimQuestionsPrompt(round: number, count: number): string {
  return `elicitation/questions-round-${round}.md has ${count} questions; the limit is ${MAX_QUESTIONS_PER_ROUND}. Rewrite the file to
keep only the ${MAX_QUESTIONS_PER_ROUND} or fewer that would most change the result. Move every other question to "## What
I'll assume without asking" as a one-line default.
${QUESTION_RULES}`;
}

function consolidatePrompt(round: number, ownerDeferred: boolean): string {
  const next = round + 1;
  const owner = ownerDeferred
    ? `The owner chose not to answer round ${round}'s questions and approved your stated defaults (elicitation/answers-round-${round}.md).`
    : `The owner answered round ${round} in elicitation/answers-round-${round}.md (their own words — treat them as requirements).`;
  return `${owner}
Read brief.md and every elicitation/questions-round-*.md and answers-round-*.md, then write
elicitation/elicitation-record.md: every question with its answer quoted, or the default now adopted,
plus every "assume without asking" default — each default marked "assumption — to be confirmed by the
owner" — and the requirements each implies.
${next <= MAX_ELICITATION_ROUNDS
    ? `Only if an answer opens a gap that changes the requirements materially and that research can't close,
also write elicitation/questions-round-${next}.md (at most 3 questions this time, numbering on from the last
question). Otherwise don't create that file — a sensible default is better than another round of questions.
${QUESTION_RULES}`
    : 'This was the last question round: anything still unknown becomes an explicit assumption.'}`;
}

function researchPrompt(repoRoot: string): string {
  return `Read brief.md and elicitation/ (if present). Plan the research questions, research them thoroughly
on the web, and write deliverables/research-report.md following this template exactly (replace the
guidance text with content):
"""
${template(repoRoot, 'research-report-template.md')}
"""`;
}

function documentPrompt(repoRoot: string): string {
  return `Read brief.md, elicitation/ (if present) and deliverables/research-report.md. Write
deliverables/requirements-specification.md following this template exactly (replace the guidance text
with content). Every requirement traces to the brief, an owner answer or a research finding; add to the
research report (and its source register) if the specification needs evidence it doesn't have yet.
"""
${template(repoRoot, 'requirements-specification-template.md')}
"""`;
}

const REVISE_INTRO: Record<Extract<BaTask, { kind: 'revise' }>['source'], string> = {
  precheck: "The orchestrator's mechanical pre-check failed. Fix every finding below (QC grades only once the pre-check passes):",
  qc: 'QC graded your pack below A. Every finding below, with the uplift that lifts it to A:',
  'owner-guidance': 'The QC rounds stalled, and the owner has given this guidance — apply it, then resolve the open findings it unblocks:',
  'owner-change': 'The owner reviewed the A-graded pack and asks for these changes (their words — they are requirements):',
};

function revisePrompt(task: Extract<BaTask, { kind: 'revise' }>): string {
  return `${REVISE_INTRO[task.source]}
"""
${task.feedback}
"""
Revise deliverables/research-report.md and deliverables/requirements-specification.md so that every
finding is resolved at its root — fix the class of problem everywhere it occurs, not just the cited
line — and record the revision in the specification's Document control change history. Re-verify any
source you add or change. If you are certain a finding is factually wrong, don't make a change you
believe is wrong: say so in your handoff "decisions" with the evidence (QC sees your reply and must
uphold the finding with evidence or withdraw it).`;
}

export function baPrompt(task: BaTask, repoRoot: string): string {
  switch (task.kind) {
    case 'elicit':
      return elicitPrompt(task.round);
    case 'trim-questions':
      return trimQuestionsPrompt(task.round, task.count);
    case 'consolidate':
      return consolidatePrompt(task.round, task.ownerDeferred);
    case 'research':
      return researchPrompt(repoRoot);
    case 'document':
      return documentPrompt(repoRoot);
    case 'revise':
      return revisePrompt(task);
  }
}

export async function runBusinessAnalyst(params: {
  task: BaTask;
  taskId: string;
  repoRoot: string;
  paths: AnalysisPaths;
  lessons: string;
  remainingBudget: RemainingBudget;
}): Promise<AgentOutcome> {
  return invokeAgent({
    role: 'business-analyst',
    taskId: params.taskId,
    systemPrompt: baSystemPrompt(params.repoRoot, params.lessons),
    prompt: `Task ${params.taskId}.\n\n${baPrompt(params.task, params.repoRoot)}\n\nEnd your turn with your handoff json block.`,
    paths: params.paths,
    remainingBudget: params.remainingBudget,
    // Research and documentation are many fetches and edits; each counts as a turn.
    maxTurns: ['elicit', 'trim-questions', 'consolidate'].includes(params.task.kind) ? 40 : 150,
  });
}
