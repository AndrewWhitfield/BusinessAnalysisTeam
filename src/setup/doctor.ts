import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blocking, formatChecks, localChecks, type Check } from './checks.js';

/**
 * First-time setup check: `npm run doctor`. Checks this machine (Node, dependencies, git, the analyses
 * folder), then makes one tiny call per configured model to prove the sign-in works and the account
 * can use it (a few cents each). `--skip-probe` makes no model calls.
 */
const repoRoot = path.resolve(fileURLToPath(import.meta.url), '../../..');

async function probeModels(): Promise<Check[]> {
  const { query } = await import('@anthropic-ai/claude-agent-sdk');
  const { modelForRole } = await import('../agents/models.js');
  const { setupAdvice } = await import('../agents/invoke.js');
  const models = [...new Set((['business-analyst', 'quality-controller', 'lessons-curator'] as const).map(modelForRole))];
  const checks: Check[] = [];
  for (const model of models) {
    let detail = 'no reply';
    let ok = false;
    try {
      for await (const m of query({ prompt: 'Reply with the single word: ok', options: { model, maxTurns: 1, tools: [], allowedTools: [], settingSources: [], strictMcpConfig: true } })) {
        if (m.type !== 'result') continue;
        ok = !m.is_error;
        const text = m.subtype === 'success' ? m.result : m.errors.join(' ');
        detail = ok ? `signed in and working ($${m.total_cost_usd.toFixed(2)} test call)` : (setupAdvice(text) ?? text.slice(0, 300));
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err);
      detail = setupAdvice(text) ?? text.slice(0, 300);
    }
    checks.push({ name: `Model ${model}`, ok, required: true, detail });
  }
  return checks;
}

async function main(): Promise<void> {
  console.log('BusinessAnalysisTeam — setup check\n');
  const checks = await localChecks(repoRoot);
  console.log(formatChecks(checks));
  if (blocking(checks).length > 0) {
    console.log('\nFix the ✘ items above, then run `npm run doctor` again.');
    process.exitCode = 1;
    return;
  }
  if (process.argv.includes('--skip-probe')) {
    console.log('\nSkipped the sign-in test (--skip-probe).');
    return;
  }
  console.log('\nTesting sign-in with one tiny call per model…');
  const probes = await probeModels();
  console.log(formatChecks(probes));
  if (blocking(probes).length > 0) {
    process.exitCode = 1;
    console.log('\nFix the ✘ items above, then run `npm run doctor` again.');
    return;
  }
  console.log('\nReady. Try the example:\n  npm start -- --project room-booking --brief-file examples/brief-example.md');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
