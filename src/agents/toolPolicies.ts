import path from 'node:path';
import type { HookCallback, Options } from '@anthropic-ai/claude-agent-sdk';
import type { AgentRole } from '../types.js';
import type { AnalysisPaths } from '../orchestrator/paths.js';

export interface ToolPolicy {
  allowedTools: string[];
  hooks?: Options['hooks'];
}

function deny(reason: string) {
  return {
    continue: true,
    hookSpecificOutput: { hookEventName: 'PreToolUse' as const, permissionDecision: 'deny' as const, permissionDecisionReason: reason },
  };
}

const WRITING_TOOLS = new Set(['Write', 'Edit', 'NotebookEdit', 'Bash']);

/** Read-only: QC judges the pack and may never change it (no self-grading, in either direction). */
function readOnlyHook(): HookCallback {
  return async (input) => {
    if (input.hook_event_name !== 'PreToolUse') return { continue: true };
    return WRITING_TOOLS.has(input.tool_name) ? deny('The Quality Controller is read-only by design: it grades, the Business Analyst fixes.') : { continue: true };
  };
}

/** Windows paths compare case-insensitively (an agent may write c:\ for C:\). */
function norm(p: string): string {
  const resolved = path.resolve(p);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function isUnder(target: string, dir: string): boolean {
  const rel = path.relative(norm(dir), target);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * The BA writes only its own work: the elicitation folder and the two deliverables. The brief, the
 * owner's answers, the reviews, the presentation page and the run records belong to the orchestrator.
 */
export function baWriteHook(paths: AnalysisPaths): HookCallback {
  const allowed = (target: string) =>
    target === norm(paths.researchReport) ||
    target === norm(paths.specification) ||
    (isUnder(target, paths.elicitationDir) && !/answers-round-\d+\.md$/i.test(target));
  return async (input) => {
    if (input.hook_event_name !== 'PreToolUse') return { continue: true };
    if (input.tool_name !== 'Write' && input.tool_name !== 'Edit') return { continue: true };
    const file = (input.tool_input as { file_path?: string } | undefined)?.file_path;
    const target = file ? norm(path.resolve(paths.dir, file)) : '';
    return allowed(target)
      ? { continue: true }
      : deny('The Business Analyst may write only elicitation/questions-*.md, elicitation/elicitation-record.md, deliverables/research-report.md and deliverables/requirements-specification.md.');
  };
}

export function toolPolicyForRole(role: AgentRole, paths: AnalysisPaths): ToolPolicy {
  switch (role) {
    case 'business-analyst':
      return {
        allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebSearch', 'WebFetch'],
        hooks: { PreToolUse: [{ hooks: [baWriteHook(paths)] }] },
      };
    case 'quality-controller':
      // Web access to verify the sources the pack cites.
      return { allowedTools: ['Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch'], hooks: { PreToolUse: [{ hooks: [readOnlyHook()] }] } };
    case 'lessons-curator':
      return { allowedTools: [] };
  }
}
