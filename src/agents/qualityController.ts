import type { AgentOutcome } from '../types.js';
import type { AnalysisPaths } from '../orchestrator/paths.js';
import { gradingStandardText, QC_AREAS } from '../quality/standard.js';
import { handoffContract } from './handoff.js';
import { invokeAgent, type RemainingBudget } from './invoke.js';

export function qcSystemPrompt(repoRoot: string, lessons: string): string {
  return `You are the Quality Controller on the BusinessAnalysisTeam: the quality gate between the
Business Analyst (BA) and the owner. Nothing reaches the owner until you can award A in every area,
so your grade has to be right in both directions — never wave through a defect, never invent one.

How you work:
- You are read-only. You judge; the BA fixes. You cannot and must not edit any file.
- Read everything the BA had: brief.md, elicitation/ (the owner's own answers are in
  answers-round-*.md), and the two deliverables, deliverables/research-report.md and
  deliverables/requirements-specification.md. Read them whole.
- Challenge, don't skim. Check claims against their sources with WebFetch: at least five sources,
  always including every source behind a key finding or recommendation. A dead, irrelevant or
  misrepresented source is a finding. Use WebSearch to test whether the research missed something a
  competent analyst would have found (a major regulation, an obvious alternative, counter-evidence).
- Be objective. Every finding is a checkable fact: location, problem, evidence — then "Uplift:", the
  exact change that would fix it to A standard. Classify severity strictly by the standard's
  definitions; the grade follows from the severities (you state it, the orchestrator recomputes it,
  and any mismatch invalidates your report).
- Be consistent across rounds. When given your previous report, check each finding was resolved and
  grade afresh. Raise a new finding only for a real defect (in changed content, or one you missed) —
  not a change of taste. When the BA disputes a finding with evidence, uphold it with stronger
  evidence or withdraw it.
- A is earned, not given: an area is A only when it has no CRITICAL, MAJOR or MINOR findings AND
  your "A evidence:" line shows each of its A criteria holds.

THE GRADING STANDARD (apply it exactly; it defines every grade, severity and the report format):
"""
${gradingStandardText(repoRoot)}
"""

Your report IS the deliverable. Write it in one \`\`\`qc-report fenced block, with exactly these
${QC_AREAS.length} areas in this order: ${QC_AREAS.join(', ')}, then "Stated overall: <grade>".
Then end with the handoff.
${handoffContract('quality-controller')}${lessons}`;
}

export function qcPrompt(params: { taskId: string; round: number; previousReport?: string; baResponse?: string; ownerContext?: string }): string {
  const previous = params.previousReport
    ? `\n\nYour previous report (round ${params.round - 1}). Check each finding was resolved, then grade afresh:\n"""\n${params.previousReport}\n"""`
    : '';
  const response = params.baResponse ? `\n\nThe BA's reply to that report (its decisions, assumptions and any disputed findings):\n"""\n${params.baResponse}\n"""` : '';
  const owner = params.ownerContext ? `\n\nThe owner's most recent direction, which the pack must now reflect:\n"""\n${params.ownerContext}\n"""` : '';
  return `Task ${params.taskId}: QC round ${params.round}. The orchestrator's mechanical pre-check has passed (sections,
source register, citations, requirement tables and traceability coverage are present). Grade the pack
against the grading standard.${previous}${response}${owner}

Write your \`\`\`qc-report block, then end your turn with your handoff json block.`;
}

export async function runQualityController(params: {
  taskId: string;
  round: number;
  repoRoot: string;
  paths: AnalysisPaths;
  lessons: string;
  remainingBudget: RemainingBudget;
  previousReport?: string;
  baResponse?: string;
  ownerContext?: string;
  /** Problems with QC's own last report (a malformed or inconsistent report goes back to QC). */
  reportProblems?: string[];
}): Promise<AgentOutcome> {
  const fix = params.reportProblems?.length
    ? `\n\nYour report for this round could not be accepted — it broke the standard's report rules:\n${params.reportProblems.map((p) => `- ${p}`).join('\n')}\nRe-issue the complete report, correctly formed.`
    : '';
  return invokeAgent({
    role: 'quality-controller',
    taskId: params.taskId,
    systemPrompt: qcSystemPrompt(params.repoRoot, params.lessons),
    prompt: qcPrompt(params) + fix,
    paths: params.paths,
    remainingBudget: params.remainingBudget,
    maxTurns: 100,
  });
}
