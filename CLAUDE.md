# CLAUDE.md — BusinessAnalysisTeam

> Read at the start of every session. Keep it short.

## What this project is

An AI business analysis team. A Business Analyst agent elicits requirements, researches them and documents
them. A Quality Controller agent grades the pack against `standards/grading-standard.md`, and only an A in
every area reaches the owner. Below A, the pack goes back to the BA with each finding and its uplift. The
orchestrator (`src/orchestrator/pipeline.ts`) runs it as a resumable state machine with owner checkpoints.

[README.md](README.md) is the single design document; extend it rather than adding parallel design docs.
Mark substantive changes in its Revision log.

## Rules that carry weight

- **The definition of A lives only in `standards/grading-standard.md`.** Both prompts embed it.
  `src/quality/standard.ts` (areas, `gradeFromCounts`) implements its computation rule, and a test keeps
  the two in step. Change the bar there; never weaken it to get a pack through.
- **No self-grading.** The BA never grades, and QC never edits (both enforced by hooks in
  `src/agents/toolPolicies.ts`). The pre-check and the grade computation are orchestrator code.
- **Outcome before cost** (the owner's rule): quality first. Watch and report cost honestly; when
  criteria conflict, put the trade-off to the owner.
- **Findings train the team.** `knowledge/` (owner feedback, QC findings, lessons) is committed. Feedback
  the owner gives in chat goes through
  `npm run learn -- --project <name> --occasion "<what>" --file <path>`.
- **Push only owner-approved changes.** Commit locally as you go and keep branches to a minimum.
  Analyses live outside this repo (`BAT_ANALYSES_ROOT`) and are never pushed.
- Check with `npm run check` (tsc, eslint with complexity cap 12, vitest). Prove pipeline changes with
  the scripted-agent test in `test/pipeline.test.ts` before spending on a live run.
- Multi-line text goes in a file (`--brief-file`, `--feedback-file`). On Windows, cmd.exe cuts
  multi-line arguments.
- Never read or handle `.env`. The owner adds the API key.
