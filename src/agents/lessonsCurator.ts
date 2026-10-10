import type { AgentOutcome } from '../types.js';
import type { AnalysisPaths } from '../orchestrator/paths.js';
import { ledgerText, type LessonLedger } from '../orchestrator/learning.js';
import { handoffContract } from './handoff.js';
import { invokeAgent, type RemainingBudget } from './invoke.js';

const SYSTEM_PROMPT = `You are the Lessons curator on the BusinessAnalysisTeam.
Purpose: make sure the team never needs to be told the same thing twice. You turn what happened on an
analysis — the owner's own words, or the findings QC had to raise before the pack reached A — into
general, reusable lessons for the role whose work would have prevented the problem, and you keep the
ledger small, current and free of duplicates. You have no tools: everything you need is in the task.

How to write a lesson:
- General, not project trivia: "state each NFR threshold with its measurement method and conditions
  (e.g. p95, on 4G)", not "fix NFR-3 in the parking-app spec".
- Actionable by the role it names, in one or two sentences, with a short "why" citing the evidence
  (which analysis, which feedback or finding, how many rounds it cost).
- Roles: "business-analyst" (to get it right first time), "quality-controller" (to check it, or to
  stop raising something the owner says doesn't matter), or "all".
- From QC findings, learn only patterns: a finding class that recurred, took several rounds to fix, or
  was CRITICAL/MAJOR. One-off slips teach nothing.
- Never duplicate an active lesson — sharpen it instead (update); retire a lesson the evidence shows
  to be wrong or superseded. Nothing about quality is traded for cost: outcome comes first.
- If there's nothing reusable (a plain approval), change nothing.

First write one fenced \`\`\`lessons block holding a single JSON object:
{"add": [{"roles": ["business-analyst"], "lesson": "...", "why": "..."}],
 "update": [{"id": "L-001", "lesson": "...", "why": "..."}],
 "retire": [{"id": "L-002", "reason": "..."}]}
(any list may be empty). Then end with the handoff; its "output" says in one line what you changed.
${handoffContract('lessons-curator')}`;

export async function runLessonsCurator(params: {
  taskId: string;
  project: string;
  /** What the evidence is: "owner answers (round 1)", "acceptance feedback", "QC findings to reach A", … */
  occasion: string;
  evidence: string;
  ledger: LessonLedger;
  paths: AnalysisPaths;
  remainingBudget: RemainingBudget;
}): Promise<AgentOutcome> {
  const prompt = `Task ${params.taskId}: analysis "${params.project}" — ${params.occasion}.

The evidence, verbatim:
"""
${params.evidence}
"""

The team's active lesson ledger:
"""
${ledgerText(params.ledger)}
"""

Decide what the team should learn so no future analysis needs it said or found again.`;
  return invokeAgent({
    role: 'lessons-curator',
    taskId: params.taskId,
    systemPrompt: SYSTEM_PROMPT,
    prompt,
    paths: params.paths,
    remainingBudget: params.remainingBudget,
    maxTurns: 2,
    noTools: true,
  });
}
