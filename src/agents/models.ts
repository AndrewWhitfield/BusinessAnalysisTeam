import type { AgentRole } from '../types.js';

export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';
const EFFORTS: readonly Effort[] = ['low', 'medium', 'high', 'xhigh', 'max'];

const ENV_SUFFIX: Record<AgentRole, string> = {
  'business-analyst': 'BUSINESS_ANALYST',
  'quality-controller': 'QUALITY_CONTROLLER',
  'lessons-curator': 'LESSONS_CURATOR',
};

/**
 * Defaults put outcome before cost: research, documentation and quality judgement are all
 * reasoning-heavy, so every role runs on the current Opus at high effort or above.
 * Override per role with BAT_MODEL_<ROLE> / BAT_EFFORT_<ROLE>.
 */
const DEFAULTS: Record<AgentRole, { model: string; effort: Effort }> = {
  'business-analyst': { model: 'claude-opus-5-5', effort: 'xhigh' },
  'quality-controller': { model: 'claude-opus-5-5', effort: 'xhigh' },
  'lessons-curator': { model: 'claude-opus-5-5', effort: 'high' },
};

export function modelForRole(role: AgentRole): string {
  return process.env[`BAT_MODEL_${ENV_SUFFIX[role]}`]?.trim() || DEFAULTS[role].model;
}

export function effortForRole(role: AgentRole): Effort {
  const configured = process.env[`BAT_EFFORT_${ENV_SUFFIX[role]}`]?.trim() as Effort | undefined;
  return configured && EFFORTS.includes(configured) ? configured : DEFAULTS[role].effort;
}
