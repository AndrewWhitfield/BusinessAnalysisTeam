import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analysisPaths } from '../orchestrator/paths.js';
import { formatPrecheck, runPrecheck } from './precheck.js';

/** Runs the mechanical pre-check on an analysis by hand: npm run pack-check -- <project> [--min-sources n] */
const argv = process.argv.slice(2);
const project = argv[0];
if (!project) {
  console.error('npm run pack-check -- <project> [--min-sources <n>]');
  process.exit(1);
}
const i = argv.indexOf('--min-sources');
const minSources = i >= 0 ? Number(argv[i + 1]) : 5;
const repoRoot = path.resolve(fileURLToPath(import.meta.url), '../../..');
const result = await runPrecheck(analysisPaths(repoRoot, project), { repoRoot, minSources });
console.log(formatPrecheck(result));
process.exitCode = result.pass ? 0 : 1;
