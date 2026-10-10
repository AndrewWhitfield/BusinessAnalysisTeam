# Round 4 — Quality Controller's report

**Overall: B** — below A: returned to the Business Analyst

| Area | Grade (computed) | Findings |
|---|---|---|
| QC-COMPLETENESS | A | 0 |
| QC-ACCURACY | A | 0 |
| QC-RESEARCH | B | 1 |
| QC-REQUIREMENTS | A | 0 |
| QC-TRACEABILITY | A | 0 |
| QC-CONSISTENCY | A | 0 |
| QC-ALIGNMENT | A | 0 |
| QC-CLARITY | A | 0 |

## Report

```
QC-COMPLETENESS: A
A evidence:
- All sections of both templates are present and substantive (pre-check passed; spec §1–§19, research §1–§11).
- The v0.4 changes are complete:
  - AS-35 now asks how PINs are set (chosen by the member, a date-of-birth default, or common PINs refused), as well as their length and any LMS lock. Library systems staff validate it by 30 October 2026.
  - AS-34 states the 5–8% estimate and the trade-off of a lower cap. Council IT validates it.
  - Spec §2, research §1, §9, C-18 and RSK-15 carry the same check.
  - The glossary adds LMS block, Sign-in limit and Sign-in pause, and makes clear what Block means.
- Coverage is otherwise as in round 3. B-1 to B-6, Q-1 to Q-15 and AS-01 to AS-23 all trace forward in §18. §5 covers the sponsor, the approvers, staff, six affected-but-not-asking groups, external suppliers and regulators. Scope is in §6.1 and §6.2. §6.3 lists REC-1 to REC-4 with the default if the owner doesn't decide.
- Business requirements are in §8 and functional requirements in §9. NFRs cover:
  - security and privacy (NFR-1 to NFR-10, NFR-26, NFR-27);
  - performance (NFR-11 to NFR-13);
  - availability (NFR-14 to NFR-16);
  - usability and accessibility (NFR-17 to NFR-21);
  - compliance (NFR-22 to NFR-24).
- The rest is covered too: data in §11, BRL-1 to BRL-27, AS-01 to AS-36, CON-1 to CON-13, DEP-1 to DEP-9, RSK-1 to RSK-15 and the glossary.
- OQ-1 to OQ-5 each name who answers and what they block. OQ-1 and OQ-2 now say they don't hold up procurement and which default applies.

QC-ACCURACY: A
- [OBSERVATION] requirements-specification.md §16 RSK-15 (Mitigation) — "so a stranger gets at most 20 guesses per card" is looser than NFR-26 — NFR-26 and the glossary's "Re-enable" entry restart the count after a successful sign-in or a staff re-enable. So 20 is the limit per run of failures, not over the life of the card.
  Uplift (optional): change it to "at most 20 guesses before staff must re-enable online sign-in for the card".
A evidence:
- The round-3 MINOR is resolved. AS-34 now gives "roughly 5–8%" for PINs that members chose themselves, labelled an **estimate** and drawn from S88. It says the 0.2% figure applies only to random PINs, and that NIST allows any lower cap.
- S88 (arXiv 2003.04868 v3, 16 June 2021), Table VI:
  - 851 first-choice 4-digit PINs: 39 found in 10 guesses (5%) and 65 in 30 (8%).
  - 369 first-choice 6-digit PINs: 7% and 9%.
  - The table models a throttled attacker. Participants were recruited on Mechanical Turk and chose PINs for smartphone unlock.
  - F-34, AS-34, AS-35 and §9 state all of this faithfully.
  - The register's author order (Markert, Bailey, Golla, Dürmuth, Aviv) is correct. My round-3 report listed the authors in the wrong order.
- S89's abstract, as reproduced by the Password Research index, says birthday guessing "will enable a competent thief to gain use of an ATM card once for every 11–18 stolen wallets", "depending on whether banks prohibit weak PINs such as 1234". F-34 matches it.
- S90 is quoted exactly: "Your PIN is four digits and for UCL students is set automatically to your date of birth (Day/Day/Month/Month)".
- The BA left DataGenetics out because it couldn't be verified, and recorded this in §4. That is correct practice.
- The round-3 observation is applied. F-14 now says S80 "gives no price for the service". S80 shows volume discounts and a technical account manager "typically from £650/day", but no price for the service itself.
- Sources fetched this round (47):
  - Library practice: S3, S4, S7, S8, S10, S11.
  - Members and reminders: S14, S15, S16, S18, S19, S20.
  - Products and buying: S22, S23, S24, S26, S27, S28, S29, S30, S31, S56, S78, S79, S80, S81, S82, S83, S84.
  - SIP2 and sign-in pages: S32, S33, S35, S37.
  - Law and guidance: S38, S39, S43, S44, S45, S46, S63.
  - Sign-in standards and PIN studies: S76, S85, S86, S87, S88, S89, S90.
  - Plus NIST's change log.
- Each resolves and supports its citation:
  - F-1 to F-3: 30, 15, 20 and 30-minute windows; one month; 3 no-shows in a calendar year; 4 in a week; 61% (1,214 readers).
  - F-6: 1.6 million; 6%; 3.8 million (7%); 92%; 57% and 64%.
  - F-7: 8 trials and 6,615 people; 67.8% to 78.6%; RR 1.14 (1.03–1.26); RR 1.11 (1.05–1.19); text alone 1.14 (0.99–1.31), p = 0.07.
  - REC-1 and F-8 (S20): 11.1% to 8.4%, OR 0.74; 9.9% against 8.2%.
  - C-1, F-12, F-14 and F-27: the LibCal card-and-PIN quote; Spydus "1,500+" with no room booking; £360 a year; "The backend (staff-only) is not WCAG compliant"; searches returning 22, 2, 0 and 0 results; G-Cloud 15 starting 6 August 2026 with the conflicting end date.
  - F-17 (S35, S37), F-19 (S38, S39) and C-8 (S43, S44, a draft of 31 March 2026).
  - F-34: S76 §3.2.2, S85, S86 and S87, quoted as in round 3.
- S21 and S36 are unchanged PDFs, verified in round 1 and backed up by S22, S27 and S37.
- Estimates are labelled (F-9, F-25, F-34 and AS-34), and the instruments keep their correct titles and versions.

QC-RESEARCH: B
- [MINOR] research-report.md §5.5 F-34 (the NIST bullet), §7 (the NIST row), §8 R-14, §9, §10 C-18 ("meets it"); requirements-specification.md §10 NFR-26 rationale ("20 meets both") and §13.2 AS-34 Basis ("any value of 100 or less meets NIST") — the pack makes NIST SP 800-63B-4 [S76] its main authority for the sign-in limit and says the design "meets NIST". It leaves out that the same standard rejects a short PIN as a sole sign-in factor. That is counter-evidence from a source the pack already relies on, and the A criterion says it must be reported, not omitted — S76 §3.1.1 says: "A password (sometimes referred to as a passphrase or, if numeric, a personal identification number [PIN]) is a secret value…". §3.1.1.2 says verifiers "SHALL require passwords that are used as a single-factor authentication mechanism to be a minimum of 15 characters in length", or 8 if they are only part of multi-factor sign-in. The card number identifies the member; it isn't a second factor. So a 4- or 6-digit library PIN falls short of NIST whatever the cap. "Meets NIST" also invites council IT, which validates AS-34, to read the sign-in as conforming to NIST. This is MINOR, not MAJOR, because what gets built doesn't change: card-and-PIN sign-in is the owner-approved default [A:Q-8], the LMS sets PINs, and the pack already puts a figure on the remaining risk (5–8%; RSK-15, High impact). I missed this in rounds 2 and 3, when I checked only §3.2.2. The PIN-length discussion added in v0.4 (AS-35, §9) makes it directly relevant now.
  Uplift: (1) Add to F-34's NIST bullet: "The same standard calls a numeric password a PIN and requires a password used as the only factor to be at least 15 characters (§3.1.1, §3.1.1.2) [S76]. A library PIN therefore falls short of NIST as a single factor whatever the cap; the limit reduces the risk but does not bring the sign-in up to NIST." Add §3.1.1 and §3.1.1.2 to S76's register entry and this point to the §7 NIST row. (2) Add one line to §9 and to R-14's evidence: card-and-PIN sign-in is kept because it is the owner-approved default [A:Q-8], the LMS sets PINs, and English libraries use it [S32][S33][S34]; council IT accepts the remaining risk when it validates AS-34. Add no new owner question (L-002). (3) Change "any value of 100 or less meets NIST" (AS-34) to "any cap of 100 or less meets NIST's limit on failed attempts (§3.2.2)". Change "20 meets both" (NFR-26 rationale) and "meets it" (C-18) to "is within both limits". Add one clause to AS-34's Basis saying that library PINs don't meet NIST's 15-character rule, for council IT to note.
A evidence: what already meets the bar.
- RQ-1 to RQ-10 are stated and answered.
- F-34's case for a cap rests on three independent authorities: NIST [S76] (a foundational standard), the NCSC [S85] ("older; current guidance") and OWASP [S86][S87] (current).
- Its point about how PINs are chosen rests on two independent peer-reviewed studies, S88 and S89 (both labelled "older; foundational"), with S90 as a practice example. §9 adds the limitation that the PIN figures come from phone and banking settings.
- Counter-evidence is reported: lockout can deny service, IP blocking isn't a primary defence, and 6-digit PINs add little.
- Every other key finding keeps two or more sources, as in round 3. Options A–H include doing nothing and doing the minimum. The legal, standards and accessibility context is complete.
- My searches this round found date-of-birth defaults at another UK university library (Goldsmiths), which is consistent with S90. They found no other gap beyond the one above.

QC-REQUIREMENTS: A
A evidence:
- v0.4 changes wording only. No requirement was added, removed or reprioritised. My Grep recount gives 77 Must, 13 Should and 5 Could (95 in total), matching the stated totals.
- NFR-26's statement and criteria (a)–(e) are still singular and measurable, now in "sign-in pause" wording:
  - (b) allows no more than 5 LMS checks per card in any 15 minutes and no more than 20 in total.
  - (d) now tests "more than 15 minutes after the 20th failure", which fixes the round-3 wording point.
- FR-43 now reads "re-enable online sign-in for a card stopped at the overall cap (NFR-26)", and its criterion (b) is unchanged.
- FR-7 and BRL-1 use "LMS block" with no change of meaning [A:Q-3].
- FR-35 ("can book online") stays verifiable through its Given/When/Then.
- All 95 requirements keep an ID, a MoSCoW priority, a rationale, a source and acceptance criteria. No requirement statement uses a banned vague term. US-1 to US-6 use the "As a … I want … so that …" form. NFR thresholds stay measurable, with methods, as in round 3.

QC-TRACEABILITY: A
A evidence:
- The requirement Source columns are unchanged, and the backward trace still lists all 95 requirements with an acceptance summary and a verification method.
- NFR-26's §18 summary matches its criteria: refused for 15 minutes after the 6th attempt; no more than 5 and no more than 20 LMS checks; refused after 20 until staff re-enable; reset on success; failures logged without the PIN.
- S88, S89 and S90 are cited only in AS-34, AS-35 and the research, so no requirement row needs them.
- The "Affects" entries of AS-34 (NFR-26) and AS-35 (NFR-26, RSK-15) match the tags in NFR-26.
- The §13.1 Q-3 summary uses the renamed term and still traces to FR-7 and BRL-1 to BRL-4. The C-18 row still traces to NFR-26, NFR-27, FR-43, FR-31, AS-34 to AS-36 and RSK-15.
- Forward traces for B-1 to B-6, Q-1 to Q-15, AS-01 to AS-23 and C-1 to C-18 are complete, and the inverse of the Source columns matches, as in round 3.

QC-CONSISTENCY: A
A evidence:
- The round-3 MINOR is resolved. Grep across both deliverables shows each concept now has one term:
  - "Block" or "blocked" means a staff room block only: FR-1, FR-21, FR-37, FR-39, NFR-13, BRL-8, BRL-25, AS-08, the §11 Block entity and the state diagram.
  - "LMS block" is the account status: FR-7, BRL-1, §13.1 Q-3, "Eligible member", research §2, F-5 and F-16 (with Communico's quoted "card blocks").
  - "Sign-in pause" is stage 1 in spec §2, NFR-26 (statement, rationale and criteria (b), (d), (e)), AS-34, RSK-15 and the glossary, and in research "How to read", §1, F-34, R-14 and C-18.
  - The glossary's Block entry distinguishes all three terms.
- The v0.3 change-history row keeps "block" as a historical record, and the v0.4 row says so.
- The 5–8% estimate agrees in research §1, F-34, R-14, §9 and C-18, and in spec §2, AS-34 and RSK-15. Other figures agree as in round 3: 5, 15 and 20; 10, 10 and 15; 77, 13 and 5 (95 in total); 14–17%, 12%, 60%, 1 March 2027, 99.5% and 2.0 s.
- IDs are unique and gap-free, including S1 to S90, and every referenced ID is defined.
- The research conclusions and the requirements agree.

QC-ALIGNMENT: A
A evidence:
- The problem statement, objectives and scope are unchanged and restate the brief faithfully. answers-round-1.md ("approved the analyst's stated default assumptions") is reflected exactly in §13.1.
- The v0.4 changes add evidence and wording only, with no new scope.
- AS-34, AS-35 and AS-36 stay "To be validated", each with a named validator and the date 30 October 2026, and none contradicts the brief or the answers. "LMS block" quotes the approved Q-3 wording.
- AS-34 now states the trade-off of a lower cap: it shuts out more forgetful members [S85] and changes protection less than how PINs are set does [S88]. The recommendation and its trade-off are unchanged and follow from F-12 to F-14 and F-27.
- L-002 is met. No owner question was added. The owner still faces at most five decisions, each with a default: sign-off, OQ-1, OQ-2 and REC-1 to REC-4. The new PIN-setting check goes to library systems staff and council IT (spec §2, AS-35).

QC-CLARITY: A
- [OBSERVATION] requirements-specification.md §13.2 AS-34 (Basis, about 300 words) and AS-35 (about 170 words) — the assumption cells now carry the full PIN-guessing analysis, which makes the §13.2 table hard to scan.
  Uplift (optional): keep each Basis to two or three sentences with the key figures (5–8%, NIST ≤ 100, NCSC 5–10), and point to research F-34 for the argument.
A evidence:
- Research §1 is about 650 words by my count and now fits one page. It covers the problem, recommendation, implications, risks (including the 5–8% estimate), decisions with named owners, and a one-line confidence statement. Spec §2 is about one page.
- Both documents follow their templates, with numbered sections, ID-keyed tables and three diagrams.
- The new terms are defined in §19 (LMS block, Sign-in limit, Sign-in pause). The "How to read" note defines them for research readers.
- The new text is plain and active, with no marketing language.

Stated overall: B
```
