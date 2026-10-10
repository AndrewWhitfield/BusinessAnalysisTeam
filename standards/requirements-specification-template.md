# Requirements specification — <analysis title>

> Template. Every `## ` heading below is required (the orchestrator's pre-check looks for each). Keep the
> headings' wording; you may number them ("## 3. Scope"). Write "Not applicable — <reason>" under a
> heading that genuinely doesn't apply. Cite research as `[S#]` (the register in research-report.md),
> owner answers as `[A:Q-n]`, and the brief as `[Brief]`.

## Document control
Version, date, status ("QC-approved draft for owner sign-off" once A), author (Business Analyst agent),
reviewer (Quality Controller agent), change history.

## Executive summary
One page that stands alone: problem, objectives, recommendation, the most important requirements,
the key risks, and the decisions the owner needs to make.

## Background and problem statement
The situation today, the problem or opportunity, and the evidence for it.

## Business objectives and success measures
Numbered OBJ-1, OBJ-2, … each with a metric, a target, a measurement method and a time frame.

## Stakeholders
Table: stakeholder, role/interest, influence, what they need, how they are engaged. Include those
affected but not asking.

## Scope
In scope, out of scope (each with the reason), and recommendations beyond the brief, flagged for the
owner to accept or reject.

## Current and future state
How things work today and how they will work once the need is met (process steps, or a short narrative
plus a diagram in Mermaid where it helps).

## Business requirements
Table, exactly these columns:
`| ID | Requirement | Rationale | Source | Priority | Acceptance criteria |`
IDs BR-1, BR-2, … Priority is one of Must, Should, Could, Won't. Source cites `[Brief]`, `[A:Q-n]` or `[S#]`.

## Functional requirements
Same table and columns; IDs FR-1, FR-2, …. User stories may be added below the table, each linked to an FR.

## Non-functional requirements
Same table and columns; IDs NFR-1, NFR-2, …. Cover at least security/privacy, performance,
availability, usability/accessibility and compliance — each specified with a measurable threshold, or
ruled out with the reason.

## Data requirements
Key data entities, their attributes, sources, owners, retention and privacy classification.

## Business rules
Numbered BRL-1, BRL-2, … each with its source.

## Assumptions
Numbered AS-1, AS-2, … each marked "to be validated" with who validates it and by when.

## Constraints
Numbered CON-1, CON-2, … (budget, time, technology, regulation, organisation).

## Dependencies
Numbered DEP-1, DEP-2, … with the owner of each dependency.

## Risks
Table: `| ID | Risk | Likelihood | Impact | Mitigation | Owner |`, IDs RSK-1, RSK-2, ….

## Open questions
Table: `| ID | Question | Who must answer | What it blocks |`, IDs OQ-1, OQ-2, ….

## Traceability matrix
Table: `| Requirement | Traces from | Acceptance criteria | Verified by |` with one row for every BR,
FR and NFR, plus a second table mapping every brief need and owner answer forward to its requirements
or to a scope-out decision.

## Glossary
Every acronym and domain term, defined.
