# Round 5 — Quality Controller's report

**Overall: A** — PASS (A in every area)

| Area | Grade (computed) | Findings |
|---|---|---|
| QC-COMPLETENESS | A | 0 |
| QC-ACCURACY | A | 0 |
| QC-RESEARCH | A | 0 |
| QC-REQUIREMENTS | A | 0 |
| QC-TRACEABILITY | A | 0 |
| QC-CONSISTENCY | A | 0 |
| QC-ALIGNMENT | A | 0 |
| QC-CLARITY | A | 0 |

## Report

```
QC-COMPLETENESS: A
A evidence:
- The pre-check passed. Every section of both templates is present and substantive: spec §1 to §19 and research §1 to §11.
- The v0.5 changes are complete:
  - The 15-character shortfall now appears wherever the pack touches NIST: research §1 (council IT decision), F-34, the §7 NIST row, R-14, §9 (a new limitation) and C-18; spec §2 (council IT), NFR-26 rationale, AS-34 and RSK-15.
  - Council IT is named as the party that accepts the remaining risk, by 30 October 2026 (AS-34).
  - No new owner question was added.
- Coverage is unchanged from round 4:
  - B-1 to B-6, Q-1 to Q-15 and AS-01 to AS-23 all trace forward in §18.
  - §5 covers the sponsor, the four approvers, staff, six affected-but-not-asking groups, external suppliers and regulators.
  - Scope is in §6.1 and §6.2. §6.3 lists REC-1 to REC-4 with the default if the owner doesn't decide.
- NFRs cover:
  - security and privacy (NFR-1 to NFR-10, NFR-26, NFR-27);
  - performance (NFR-11 to NFR-13);
  - availability (NFR-14 to NFR-16);
  - usability and accessibility (NFR-17 to NFR-21);
  - compliance (NFR-22 to NFR-24).
- The rest is covered: data (§11), BRL-1 to BRL-27, AS-01 to AS-36, CON-1 to CON-13, DEP-1 to DEP-9, RSK-1 to RSK-15 and the glossary.
- OQ-1 to OQ-5 each name who answers and what they block.

QC-ACCURACY: A
A evidence:
- The round-4 MINOR is fixed. I fetched S76 (NIST SP 800-63B-4):
  - §3.1.1: "A password (sometimes referred to as a passphrase or, if numeric, a personal identification number [PIN])".
  - §3.1.1.2: "SHALL require passwords that are used as a single-factor authentication mechanism to be a minimum of 15 characters"; a password used only within multi-factor sign-in must be at least 8.
  - §3.2.2: "no more than 100 by disabling that authenticator", rebind required, "agencies MAY impose lower limits", reset after success, "30 seconds up to an hour", and a bot-detection challenge.
  - §3.1.3.3 is the PSTN section.
  - F-34, §7, R-14, §9, C-18, AS-34, NFR-26 and RSK-15 all state these correctly. Nothing in either document still claims the sign-in "meets NIST". The remaining phrases ("within both limits", "any cap of 100 or less meets NIST's limit on failed attempts (§3.2.2)") are accurate.
- I fetched 21 sources this round. Each resolves and supports what it is cited for:
  - S76: as above.
  - S85: "progressively increasing time delay"; "between 5 and 10 login attempts"; the lockout and denial-of-service warnings; v1.0, reviewed 19 November 2018.
  - S86: the failed-login counter belongs to the account, not the source IP address; "max 2-3, after that permanent account lockout"; password spraying defined.
  - S88, Table VI: 4-digit PINs 39/851 (5%) in 10 guesses and 65/851 (8%) in 30; 6-digit 7% and 9%. Mechanical Turk, smartphone unlock, and the author order are correct.
  - S90: the exact DDMM quote.
  - S32: "You'll need your library card number and PIN". S33: the quote is exact. S34: a PIN for online resources. These three now also support "English libraries use it".
  - S22: LibCal card-and-PIN authentication, SMS add-on, tablets, smart locks, mediation and space-use reports.
  - S27: staff book on a member's behalf; a library card can be required.
  - S28: "1,500+" libraries, events but no room booking, an API with patron authentication.
  - S79: UK location, Cyber Essentials, username/password with MFA, and "The backend (staff-only) is not WCAG compliant".
  - S80: "Ideal for NHS, councils, schools, libraries", QR check-in, AWS UK, WCAG 2.2 AA, no price for the service.
  - S18: 8 trials (6,615 people); 7 trials (5,841); 67.8% to 78.6%; RR 1.14 (1.03–1.26); text vs phone in 3 trials (2,509).
  - S19: 10 studies (8,236 people); RR 1.11 (1.05–1.19); text alone 1.14 (0.99–1.31), p = 0.07.
  - S20: 11.1% to 8.4%, OR 0.74; 9.9% against 8.2%.
  - S3: 5 days, 4 hours, under-13 rule, 30-minute hold, 1-month suspension.
  - S4: 1 month ahead, 15 minutes, 3 no-shows give up to 3 months, written appeal, dates 10 June 2024 and 14 May 2025.
  - S14: 1.6 million; 6%; 3.8 million (7%); 26 February 2025.
  - S38: WCAG 2.2 AA, intranets covered, "legally responsible", 30 September 2024, EHRC and GDS.
  - S46: "accessible to all residents using reasonable means, including digital technologies"; "capable of being met"; 21 February 2025.
- S21 (a PDF) could not be read by the fetch tool this round. It is unchanged since I verified it in round 1, and S22 and S27 corroborate the F-12 claims that cite it.
- Estimates are still labelled: F-9, F-25, F-34, AS-34 and RSK-15.
- Instrument titles and versions are correct.

QC-RESEARCH: A
- [OBSERVATION] research-report.md F-34 and §9; requirements-specification.md §13.2 AS-35 — the pack says it isn't known whether the LMS locks PINs. Vendor documentation shows such locks exist: Sierra's WebPAC help says "The system blocks access for one minute after five failed attempts to log in with the same barcode in one minute" (6.2 and earlier). In 6.3 and later the number of attempts and the length of the block come from the PIN_RETRY_LIMIT option. AS-35 already handles this correctly as an unknown with a named validator, so this is optional context.
  Uplift (optional): add one sentence to F-34 or AS-35 citing the Sierra documentation as an example that LMSs can limit PIN retries, which supports setting the cap below any LMS limit.
A evidence:
- The round-4 MINOR is resolved. The counter-evidence from S76 (the 15-character single-factor rule, §3.1.1 and §3.1.1.2) is now reported where the pack relies on NIST: F-34, §7, R-14, a new §9 limitation, C-18 and §1. The reason for keeping card and PIN is stated in each: the owner-approved default [A:Q-8], PINs held by the LMS, and use in English libraries [S32][S33][S34]. Council IT accepts the remaining risk.
- RQ-1 to RQ-10 are stated and answered (§3).
- F-34 rests on three independent authorities: NIST [S76] (foundational), the NCSC [S85] (labelled "older; current guidance") and OWASP [S86][S87]. Its point about how PINs are chosen rests on two independent peer-reviewed studies [S88][S89] (labelled foundational), with S90 as a practice example. Its limitations are in §9.
- Every other key finding keeps two or more sources.
- Options A to H in §6 include doing nothing and doing the minimum. Counter-evidence is reported in R-1 to R-14 and §9.
- The legal, standards and accessibility context in §7 is complete for England.
- My two searches this round, on UK council study-room booking and on LMS PIN lockouts, found no material gap.

QC-REQUIREMENTS: A
A evidence:
- v0.5 changes rationale and assumption text only. My Grep recount of the BR, FR and NFR rows gives 77 Must and 13 Should, with 95 rows in total (so 5 Could), matching §2 and the change history.
- The NFR-26 statement and criteria (a) to (e) are unchanged: singular, and measurable by the counts of LMS checks (≤ 5 in any 15 minutes, ≤ 20 in total), the 15-minute refusal, the re-enable and the reset.
- The NFR-26 rationale is now accurate. It says 20 is within NIST's limit and OWASP's lockouts, and states the 15-character shortfall.
- All 95 requirements keep an ID, a MoSCoW priority, a rationale, a source and acceptance criteria (Given/When/Then, or a metric with a method).
- No requirement statement uses a banned vague term.
- US-1 to US-6 follow "As a … I want … so that …".
- NFR thresholds stay measurable: 2.0 s at the 95th percentile, 99.5%, under 1% failures, 0 WCAG A/AA failures, 5 of 6 participants, ≤ 5 and ≤ 20 checks, 10 cards in 10 minutes.

QC-TRACEABILITY: A
A evidence:
- The Source columns are unchanged. NFR-26 reads [A:Q-8]; [S76][S85][S86]; [S32][S33] in both §10 and the §18 backward trace, and its §18 summary matches criteria (a) to (e).
- The backward trace lists all 95 requirements with an acceptance summary and a verification method.
- The "Affects" entries for AS-34 (NFR-26) and AS-35 (NFR-26, RSK-15) match.
- C-18's research "Based on" column now adds F-16, which supports the new reason for keeping card and PIN. Its spec §18 row still traces to NFR-26, NFR-27, FR-43, FR-31, AS-34 to AS-36 and RSK-15.
- Forward traces are complete for B-1 to B-6, Q-1 to Q-15, AS-01 to AS-23 and C-1 to C-18, and match the inverse of the Source columns, as in round 4.

QC-CONSISTENCY: A
A evidence:
- The 15-character point is worded the same way in every place it appears: research §1, F-34, §7, R-14, §9 and C-18; spec §2, NFR-26, AS-34 and RSK-15. "Within both limits" in NFR-26 matches "within both that limit and OWASP's" in C-18, and AS-34 has "meets NIST's limit on failed attempts (§3.2.2)".
- My Grep for block/blocked/blocks finds only room blocks, "LMS block", the Communico quote and column headers. "Sign-in pause" and "overall cap" are used as the glossary defines them.
- RSK-15 now says "at most 20 guesses before staff must re-enable online sign-in for the card", which agrees with NFR-26 and the glossary's "Re-enable" entry.
- These figures agree everywhere they appear: 5–8%, 5/15/20, 10/10/15, 77/13/5 (95), 14–17%, 12%, 60%, 1 March 2027, 99.5% and 2.0 s.
- IDs are unique and gap-free (S1 to S90, AS-01 to AS-36), and every referenced ID is defined.
- The research conclusions and the requirements agree.

QC-ALIGNMENT: A
A evidence:
- The problem statement, objectives and scope are unchanged and restate the brief faithfully. answers-round-1.md ("approved the analyst's stated default assumptions") is reflected exactly in §13.1.
- v0.5 adds no scope, requirement, priority or value. Card-and-PIN sign-in stays the owner-approved default [A:Q-8], and the pack does not override it.
- The trade-off is now explicit: council IT accepts a risk that NIST doesn't permit for a single factor. That risk is quantified as 5–8% (estimate) and placed with the approver who owns security (AS-34, To be validated, council IT, 30 October 2026).
- L-002 is met. The owner still faces at most five decisions, each with a default: sign-off, OQ-1, OQ-2 and REC-1 to REC-4. The PIN facts go to library systems staff (AS-35) and the risk acceptance to council IT.
- The recommendation and its trade-off follow from F-12 to F-14 and F-27.

QC-CLARITY: A
A evidence:
- The round-4 observation was applied. The AS-34 Basis now gives the key figures (5, 15 minutes, 100, 2–3, 5–8%) plus the NIST note and points to research F-34. AS-35 is shorter. The §13.2 table is easier to scan.
- Research §1 gained one clause in its decisions paragraph and still fits one page. It covers the problem, evidence, recommendation, implications, risks, decisions with named owners and confidence.
- Spec §2 is about one page.
- Both documents follow their templates, with numbered sections, ID-keyed tables and three diagrams.
- NIST, PIN, LMS, sign-in pause, overall cap and re-enable are defined in the glossary (§19) and in the research "How to read" note.
- The new text is plain and active, with no marketing language. Repeating the NIST point in each section is needed because each section is read alone (summary, finding, risk, conclusion, assumption).

Stated overall: A
```
