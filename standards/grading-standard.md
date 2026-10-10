# Grading standard — what an A grade is

This is the standard the Quality Controller (QC) applies to every documentation pack, and the bar the
Business Analyst (BA) writes to. It is the single definition of the grades: the QC prompt embeds this
file, the BA prompt embeds this file, and the orchestrator computes grades with the rules in
[How a grade is computed](#how-a-grade-is-computed). Change the bar here, and only here.

**The passing grade is A.** Anything lower goes back to the BA with every finding and the exact
change that lifts it to A. The loop ends only when QC can award A in every area.

## Principles

1. **Objective, not impressionistic.** A grade is the consequence of findings, and every finding is a
   checkable fact: where it is, what is wrong, the evidence, and the change that fixes it. "Feels thin"
   is not a finding; "§4 lists 3 stakeholder groups but the brief names 5 (finance, ops, IT, legal,
   customers) — legal and customers missing" is.
2. **The grade is computed, not chosen.** QC classifies each finding by severity; the orchestrator
   derives the grade from those severities. QC states the grade it expects, and a mismatch between the
   stated and the computed grade invalidates the report.
3. **Every finding below A carries its uplift.** A finding without a concrete "Uplift:" (what to
   change, where, to what standard) is not a valid finding.
4. **Fit for decision.** A means a senior business analyst and a demanding reviewer at a strong
   consultancy would release the pack to stakeholders for sign-off *without changes* — at most optional
   polish remains.
5. **Owner-only facts are not defects once handled properly.** Information only the owner can supply
   (budgets, internal policies, named people) is acceptable as an explicit assumption: stated, marked
   "to be validated", with who validates it. Hiding or inventing such facts *is* a defect.

## Severity of a finding

| Severity | Definition | Examples |
|---|---|---|
| **CRITICAL** | Would lead a stakeholder to a wrong decision or a build of the wrong thing. | A key claim is factually wrong or rests on a fabricated, dead or misrepresented source; a core need in the brief or the owner's answers is missing; two core requirements contradict each other; the scope contradicts the brief. |
| **MAJOR** | A material defect a reviewer would block sign-off for. | A requirement that can't be verified, or has no acceptance criteria; a requirement with no traceable source; a material claim without a citation; a key finding resting on a single source; a required section missing or empty; an assumption presented as fact; scope added that nobody asked for; a significant alternative, risk or stakeholder group not considered. |
| **MINOR** | Must be fixed, but doesn't change what a reader would decide or build. | Ambiguous wording on a non-core item; inconsistent terminology; a term used but not in the glossary; a citation missing its date or access date; a table or heading that makes the pack harder to read; a non-key finding that would benefit from a second source. |
| **OBSERVATION** | Optional polish. Never affects the grade. | An extra diagram that would help; a phrasing improvement. |

## How a grade is computed

Each area is graded from its findings (observations ignored):

| Grade | Rule |
|---|---|
| **A** | No CRITICAL, MAJOR or MINOR findings — **and** QC records the evidence that each of the area's A criteria (below) is met. |
| **B** | No CRITICAL or MAJOR; one or more MINOR. |
| **C** | No CRITICAL; one or two MAJOR. |
| **D** | One CRITICAL, or three or more MAJOR. |
| **E** | Two or more CRITICAL, or the area's subject is missing or unusable. |

**Overall grade** = the lowest area grade. **Pass** = overall A *and* the orchestrator's mechanical
pre-check passed. There is no rounding up and no averaging: one MINOR anywhere means B.

## The eight areas and their A criteria

An area is A only when **every** criterion below holds and QC can point to the evidence.

### QC-COMPLETENESS — nothing needed is missing
- Every section of both templates is present and substantive; a section that genuinely doesn't apply says "Not applicable — <reason>".
- Every need, goal, constraint and question in the brief and in the owner's answers is addressed somewhere, and the traceability matrix shows where.
- Stakeholders (including those affected but not asking), scope in and out, business requirements, functional and non-functional requirements (at least: security/privacy, performance, availability, usability/accessibility, compliance — each either specified or explicitly ruled out with a reason), data, business rules, assumptions, constraints, dependencies, risks, open questions and glossary are all covered.
- Each open question names who must answer it and what it blocks.

### QC-ACCURACY — what is said is true and evidenced
- Every factual claim (statistic, market fact, regulation, product capability, date) cites a source from the register as `[S#]`.
- Every source QC spot-checks resolves, is the publication described, and actually says what it is cited for. QC fetches at least five sources, always including every source behind a key finding or a recommendation.
- No figure is invented, rounded misleadingly, or presented with false precision; estimates are labelled as estimates with their basis.
- Regulations and standards are named with their correct title and version/year.

### QC-RESEARCH — the research is thorough and balanced
- The research questions are stated, and each is answered or explicitly left open with the reason.
- Every key finding has at least two independent, credible sources (primary or authoritative where they exist — regulators, standards bodies, official documentation, peer-reviewed work, reputable industry analysis).
- Sources are current: published within the last three years unless foundational (standards, legislation, seminal work) and labelled as such.
- Alternatives and comparables are examined, including "do nothing"; counter-evidence and limitations are reported, not omitted.
- Relevant legal, regulatory, standards and accessibility context is identified for the domain and jurisdiction(s) in scope.

### QC-REQUIREMENTS — each requirement is well formed (ISO/IEC/IEEE 29148)
- Every requirement is necessary, singular (one requirement per statement), unambiguous, feasible, verifiable, correct, and implementation-free unless the brief imposes the implementation.
- Every requirement has a unique ID, a MoSCoW priority, a rationale, a source, and measurable acceptance criteria (Given/When/Then, or a metric with target and measurement method).
- No vague terms ("fast", "user-friendly", "intuitive", "flexible", "robust", "etc.", "and/or", "as appropriate") without a measurable definition.
- Non-functional requirements state a measurable threshold (e.g. "95th percentile page load ≤ 2 s on 4G"), not an aspiration.
- User stories (where used) follow "As a … I want … so that …" and satisfy INVEST.

### QC-TRACEABILITY — every line can be followed both ways
- Every requirement traces back to its origin: a brief item, an owner answer (by question ID), or a research finding `[S#]`.
- Every brief need and owner answer traces forward to at least one requirement, or to a stated scope-out decision with its reason.
- Every requirement traces to its acceptance criteria.
- The traceability matrix is complete and agrees with the requirement tables.

### QC-CONSISTENCY — the pack agrees with itself
- No two statements contradict (within or across documents): figures, names, scope, priorities and dates agree everywhere.
- Terminology is used exactly as the glossary defines it; one term per concept.
- IDs are unique, sequential within their type, and every ID referenced is defined.
- The research report's conclusions and the specification's requirements agree.

### QC-ALIGNMENT — it is what the owner asked for
- The problem statement and objectives restate the brief faithfully, and the owner's answers are reflected exactly.
- Nothing in scope goes beyond the brief and answers without being flagged as a recommendation for the owner to accept or reject (no gold-plating).
- Every assumption is explicit, marked "to be validated", and names who validates it; none contradicts the brief or answers.
- Recommendations follow from the evidence and state their trade-offs.

### QC-CLARITY — a stakeholder can read and use it
- The executive summary stands alone: problem, recommendation, key requirements, key risks, decisions needed — on one page.
- The structure follows the templates; headings, numbering and tables make the content easy to navigate.
- Plain language for the intended audience; every acronym and domain term is defined in the glossary on first use.
- Sentences are concise and active; no filler, no repetition, no marketing language.

## Report format QC must use

QC writes its report in one fenced block, area by area, in the order above:

````
```qc-report
QC-COMPLETENESS: B
- [MINOR] requirements-specification.md §7 NFR table — accessibility neither specified nor ruled out — brief says "used by the public".
  Uplift: add an NFR for WCAG 2.2 AA conformance with an acceptance criterion (automated axe scan shows 0 serious issues + manual keyboard walk-through of the 5 core journeys), source: brief.
A evidence: <for an A area, the evidence that each criterion holds; for a B–E area, what already meets the bar>
QC-ACCURACY: A
A evidence: fetched S1, S3, S4, S7, S9 (all behind key findings) — each resolves and supports its citation; ...
...
Stated overall: B
```
````

Rules: one `QC-<AREA>: <grade>` header per area; each finding is one bullet `- [SEVERITY] <location> — <problem> — <evidence>` followed by an indented `Uplift:` line; every area has an `A evidence:` line; `Stated overall:` closes the block.
