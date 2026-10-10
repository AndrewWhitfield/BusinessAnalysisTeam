import { handoffSchema, type AgentRole, type Handoff } from '../types.js';

export type HandoffParse = { ok: true; handoff: Handoff } | { ok: false; error: string };

/**
 * The last ```json block of an agent's final text, validated against the handoff schema. A broken
 * handoff is never coerced: it gets one corrective retry, then counts as a failed step.
 */
export function parseHandoff(text: string): HandoffParse {
  const last = [...text.matchAll(/```json\s*([\s\S]*?)```/g)].at(-1);
  if (!last) return { ok: false, error: 'No ```json handoff block found.' };
  let json: unknown;
  try {
    json = JSON.parse(last[1]!);
  } catch (err) {
    return { ok: false, error: `Handoff block is not valid JSON: ${(err as Error).message}` };
  }
  const parsed = handoffSchema.safeParse(json);
  return parsed.success ? { ok: true, handoff: parsed.data } : { ok: false, error: `Handoff failed validation: ${parsed.error.message}` };
}

export function handoffContract(role: AgentRole): string {
  return `End your turn with exactly one fenced \`\`\`json block (no other json blocks) holding:
{
  "from": "${role}",
  "task_id": "<the task id you were given>",
  "output": "<one or two lines: what you produced or concluded>",
  "assumptions": ["<anything you assumed>"],
  "decisions": ["<each decision and the standard or evidence behind it>"],
  "confidence": "low" | "medium" | "high",
  "open_questions": ["<only questions that survive the decision hierarchy>"]
}
Your real work goes in the files you were asked to write (or the block you were asked to produce) — the
json block is only the handoff summary.`;
}
