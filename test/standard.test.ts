import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { QC_AREAS } from '../src/quality/standard.js';
import { REPO_ROOT } from './helpers.js';

describe('the grading standard document', () => {
  it('defines the A criteria for every graded area, in report order', async () => {
    const text = await readFile(path.join(REPO_ROOT, 'standards', 'grading-standard.md'), 'utf8');
    const defined = [...text.matchAll(/^### (QC-[A-Z]+)/gm)].map((m) => m[1]);
    expect(defined).toEqual([...QC_AREAS]);
  });
});
