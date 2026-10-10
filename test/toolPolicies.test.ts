import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { baWriteHook } from '../src/agents/toolPolicies.js';
import { pathsFor } from '../src/orchestrator/paths.js';

const paths = pathsFor(path.resolve('analysis-x'));
const hook = baWriteHook(paths);
const signal = new AbortController().signal;

async function decision(tool: string, file: string): Promise<string | undefined> {
  const out = (await hook({ hook_event_name: 'PreToolUse', tool_name: tool, tool_input: { file_path: file } } as never, undefined, { signal })) as {
    hookSpecificOutput?: { permissionDecision?: string };
  };
  return out.hookSpecificOutput?.permissionDecision;
}

describe('the Business Analyst may write only its own work', () => {
  it.each([paths.researchReport, paths.specification, path.join(paths.elicitationDir, 'questions-round-1.md'), paths.elicitationRecord])('allows %s', async (file) => {
    expect(await decision('Write', file)).toBeUndefined();
  });

  it.each([paths.brief, paths.presentation, paths.runStatus, path.join(paths.reviewsDir, 'round-1-qc.md'), path.join(paths.elicitationDir, 'answers-round-1.md'), path.resolve('elsewhere.md')])(
    'denies %s',
    async (file) => {
      expect(await decision('Edit', file)).toBe('deny');
    },
  );
});
