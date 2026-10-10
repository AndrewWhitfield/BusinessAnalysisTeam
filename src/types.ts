import { z } from 'zod';

export const AGENT_ROLES = ['business-analyst', 'quality-controller', 'lessons-curator'] as const;
export type AgentRole = (typeof AGENT_ROLES)[number];

/**
 * Where an analysis stands. The orchestrator persists it after every step, so an interrupted or
 * paused run resumes exactly where it stopped.
 *   elicitation      → the BA drafts clarifying questions for the owner
 *   awaiting-answers → stopped: the owner answers (or approves the BA's default assumptions)
 *   consolidation    → the BA records the answers; may ask one more round of questions
 *   research         → the BA researches and writes the research report
 *   documentation    → the BA writes the requirements specification
 *   quality-gate     → pre-check + QC grading; below A goes back to the BA with findings and uplift
 *   awaiting-guidance→ stopped: QC rounds stalled; the owner gives guidance
 *   awaiting-acceptance → stopped: grade A reached, the pack is presented to the owner
 *   accepted         → the owner accepted the pack
 */
export const PHASES = [
  'elicitation',
  'awaiting-answers',
  'consolidation',
  'research',
  'documentation',
  'quality-gate',
  'awaiting-guidance',
  'awaiting-acceptance',
  'accepted',
] as const;
export type Phase = (typeof PHASES)[number];

export const GRADES = ['A', 'B', 'C', 'D', 'E'] as const;
export type Grade = (typeof GRADES)[number];

const roundSchema = z.object({
  round: z.number().int().positive(),
  at: z.string(),
  precheckPassed: z.boolean(),
  /** Absent when the pre-check failed and QC wasn't run. */
  overall: z.enum(GRADES).optional(),
  areas: z.record(z.string(), z.enum(GRADES)).optional(),
  findings: z.object({ critical: z.number(), major: z.number(), minor: z.number() }).optional(),
});
export type RoundRecord = z.infer<typeof roundSchema>;

const revisionSchema = z.object({
  /** What the revision answers: pre-check findings, a QC report, owner guidance or an owner change request. */
  source: z.enum(['precheck', 'qc', 'owner-guidance', 'owner-change']),
  feedback: z.string(),
});
export type PendingRevision = z.infer<typeof revisionSchema>;

export const runStatusSchema = z.object({
  version: z.literal(1),
  project: z.string(),
  createdAt: z.string(),
  phase: z.enum(PHASES),
  /** True while stopped at a budget checkpoint; `--resume --approve` clears it. */
  budgetPaused: z.boolean().default(false),
  askQuestions: z.boolean(),
  minSources: z.number().int().nonnegative(),
  elicitationRound: z.number().int().nonnegative(),
  qcRound: z.number().int().nonnegative(),
  /** QC rounds before this index don't count towards a stall (reset by owner guidance or a change). */
  stallBaseline: z.number().int().nonnegative().default(0),
  rounds: z.array(roundSchema),
  pendingRevision: revisionSchema.optional(),
  /** The owner approved the BA's default assumptions instead of answering the last question round. */
  lastAnswersDeferred: z.boolean().default(false),
  /** QC's last report block, so the next round checks each finding was resolved. */
  lastQcReport: z.string().optional(),
  /** The BA's handoff after its last revision (decisions, disputes), shown to QC. */
  lastBaResponse: z.string().optional(),
  /** The owner's latest guidance or change request, which QC checks the pack reflects. */
  ownerContext: z.string().optional(),
  /** Consecutive QC reports in this round that broke the report rules. */
  invalidQcReports: z.number().int().nonnegative().default(0),
});
export type RunStatus = z.infer<typeof runStatusSchema>;

/** The structured handoff every agent ends its turn with (validated, never coerced). */
export const handoffSchema = z.object({
  from: z.enum(AGENT_ROLES),
  task_id: z.string().min(1),
  output: z.string().min(1),
  assumptions: z.array(z.string()),
  decisions: z.array(z.string()),
  confidence: z.enum(['low', 'medium', 'high']),
  open_questions: z.array(z.string()),
});
export type Handoff = z.infer<typeof handoffSchema>;

/** What one agent call produced, with its real cost from the SDK result. */
export interface AgentOutcome {
  rawText: string;
  handoff?: Handoff;
  handoffError?: string;
  isError: boolean;
  costUsd: number;
  tokens: number;
}
