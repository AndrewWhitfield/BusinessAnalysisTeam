import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { citedSources, runPrecheck } from '../src/quality/precheck.js';
import { pathsFor } from '../src/orchestrator/paths.js';
import { REPO_ROOT, fixture } from './helpers.js';

async function analysis(report: string | undefined, spec: string | undefined) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'bat-pre-'));
  const paths = pathsFor(dir);
  await mkdir(paths.deliverablesDir, { recursive: true });
  if (report !== undefined) await writeFile(paths.researchReport, report);
  if (spec !== undefined) await writeFile(paths.specification, spec);
  return runPrecheck(paths, { repoRoot: REPO_ROOT, minSources: 5 });
}

type Result = Awaited<ReturnType<typeof analysis>>;
const problems = (r: Result) => r.findings.map((f) => `${f.where}: ${f.problem}`).join('\n');

describe('mechanical pre-check', () => {
  it('passes the well-formed fixture pack', async () => {
    const r = await analysis(await fixture('research-report.md'), await fixture('requirements-specification.md'));
    expect(problems(r)).toBe('');
    expect(r.pass).toBe(true);
  });

  it('reports missing deliverables', async () => {
    expect((await analysis(undefined, undefined)).findings).toHaveLength(2);
  });

  it('finds a missing section, a placeholder and an unregistered citation', async () => {
    const report = (await fixture('research-report.md'))
      .replace(/## Limitations[\s\S]*?(?=## Conclusions)/, '')
      .replace('rose briefly after introduction [S2].', 'rose briefly after introduction [S2] [S9]. TBD');
    const text = problems(await analysis(report, await fixture('requirements-specification.md')));
    expect(text).toMatch(/"## limitations" is missing/);
    expect(text).toMatch(/placeholder left in/);
    expect(text).toMatch(/\[S9\] is cited but not in the source register/);
  });

  it('checks requirement rows: vague terms, priorities, traceability, duplicates', async () => {
    const spec = (await fixture('requirements-specification.md'))
      .replace('Members can book study rooms', 'Members can easily book study rooms')
      .replace('| [S5] | Should |', '| [S5] | High |')
      .replace('| NFR-2 | S1 |', '| NFR-X | S1 |')
      .replace('| NFR-1 | The booking pages', '| FR-1 | dup | r | [Brief] | Must | ac |\n| NFR-1 | The booking pages');
    const text = problems(await analysis(await fixture('research-report.md'), spec));
    expect(text).toMatch(/BR-1: vague term "easily"/);
    expect(text).toMatch(/Priority "High"/);
    expect(text).toMatch(/NFR-2 has no row in the traceability matrix/);
    expect(text).toMatch(/FR-1 is defined 2 times/);
  });

  it('does not flag a vague word when the requirement gives a number', async () => {
    const spec = (await fixture('requirements-specification.md')).replace('95% of availability searches return within 2 seconds', 'Searches are fast: 95% return within 2 seconds');
    expect(problems(await analysis(await fixture('research-report.md'), spec))).toBe('');
  });

  it('requires enough sources', async () => {
    const report = (await fixture('research-report.md')).replace(/- \[S5\].*\n/, '').replace(/\[S5\]/g, '[S4]');
    expect(problems(await analysis(report, (await fixture('requirements-specification.md')).replace(/\[S5\]/g, '[S4]')))).toMatch(/4 source\(s\) in the register; at least 5/);
  });

  it('reads grouped citations', () => {
    expect([...citedSources('see [S1, S3] and [S4][S7]')]).toEqual([1, 3, 4, 7]);
  });
});
