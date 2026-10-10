# Round 3 — Quality Controller's report

**Overall: B** — below A: returned to the Business Analyst

| Area | Grade (computed) | Findings |
|---|---|---|
| QC-COMPLETENESS | A | 0 |
| QC-ACCURACY | B | 1 |
| QC-RESEARCH | A | 0 |
| QC-REQUIREMENTS | A | 0 |
| QC-TRACEABILITY | A | 0 |
| QC-CONSISTENCY | B | 1 |
| QC-ALIGNMENT | A | 0 |
| QC-CLARITY | A | 0 |

## Report

```
QC-COMPLETENESS: A
A evidence: The round-2 changes are complete.
- NFR-26 now works in two stages. AS-34 is restated (validated by council IT). AS-35 now also covers PIN length (validated by library systems staff).
- FR-43 adds the staff re-enable, and FR-31 logs it.
- The §11 failed sign-in record adds the network address and the count of consecutive failures; NFR-9 lists the same fields.
- NFR-27 (Should) is added with AS-36 (council IT, 30 October 2026), and RSK-15 is updated.
Every template section is present and substantive (pre-check passed; spec §1–§19, research §1–§11). B-1 to B-6, Q-1 to Q-15 and AS-01 to AS-23 all trace forward in §18. §5 covers the sponsor, approvers, staff, six affected-but-not-asking groups, external suppliers and regulators. Scope is in §6.1–§6.2, and REC-1 to REC-4 now have their default stated in §6.3. Requirements are complete: BRs in §8, FRs in §9, and NFRs for:
- security and privacy (NFR-1 to NFR-10, NFR-26, NFR-27);
- performance (NFR-11 to NFR-13);
- availability (NFR-14 to NFR-16);
- usability and accessibility (NFR-17 to NFR-21);
- compliance (NFR-22 to NFR-24).
Data is in §11, rules in §12 (BRL-1 to BRL-27), assumptions in §13 (AS-01 to AS-36), constraints in §14 (CON-1 to CON-13), dependencies in §15 (DEP-1 to DEP-9) and risks in §16 (RSK-1 to RSK-15). OQ-1 to OQ-5 each name who answers and what they block. The glossary covers all seven new terms.
QC-ACCURACY: B
- [MINOR] requirements-specification.md §13.2 AS-34 (Basis) and AS-35; research-report.md §9 (fifth bullet) — the protection estimate for the overall cap of 20 assumes PINs are chosen at random, which overstates the protection more than tenfold — AS-34 says "If the PIN is 4 digits chosen at random, 20 guesses find it 0.2% of the time". Members' PINs are not random. A peer-reviewed study of user-chosen PINs (Markert, Golla, Dürmuth, Bailey and Aviv, 2020; arXiv 2003.04868, Table VI) found that an attacker limited to a few guesses finds 5% of 4-digit PINs in 10 guesses and 8% in 30. It also found 6-digit PINs add little. A 2012 DataGenetics analysis of 3.4 million leaked PINs, as reported by Schneier, found the 20 most common make up 26.8% of them. Some UK library systems set the PIN to the member's date of birth: UCL Library says "Your PIN is four digits and for UCL students is set automatically to your date of birth (Day/Day/Month/Month)", which leaves 366 possible values. AS-35 and §9 also say the PIN's length "sets how much protection the cap gives", but the evidence shows how PINs are chosen matters more. Council IT is asked to validate the cap of 20 on this basis.
  Uplift: (1) In AS-34, replace the 0.2% sentence with an evidence-based one. Add Markert et al. (2020) to the source register as peer-reviewed and labelled "older; foundational", then write: "for member-chosen 4-digit PINs, 20 guesses would succeed for roughly 5–8% of cards (**estimate**, between the study's 10- and 30-guess figures [S#]); 0.2% applies only if PINs were random". (2) Extend AS-35 and research §9 to ask how PINs are set (chosen by the member, a default such as date of birth, or any block on common PINs) as well as their length. (3) Say that council IT should weigh this when validating 20, and that NIST allows any lower cap [S76].
- [OBSERVATION] research-report.md F-14 — "its listing gives no prices" [S80] is loose: the listing gives volume discounts and a day rate for a technical account manager ("typically from £650/day"), but no price for the service itself.
  Uplift (optional): change it to "its listing gives no price for the service".
A evidence: what already meets the bar. This round I fetched 44 sources plus the OWASP repository's commit history:
- Library practice and members: S3–S8, S10, S11, S14–S16.
- Reminder evidence: S18, S19.
- Products and buying: S21–S31, S78–S84.
- Sign-in, security and legal: S32, S33, S35, S37–S39, S44, S56, S63, S76, S85–S87.
The new and changed claims check out:
- S76 §3.2.2 says "no more than 100 by disabling that authenticator". Disabled authenticators must be re-bound, and "agencies MAY impose lower limits". It also gives the SHOULD reset after success, bot-detection challenges and "30 seconds up to an hour". F-34 now quotes it faithfully.
- S85 (v1.0, reviewed 19 November 2018) says "progressively increasing time delay", "Throttling is preferred, because account lockout can leave legitimate users unable to access their accounts" and "between 5 and 10 login attempts before the account is frozen", plus the denial-of-service warning.
- S86 says "The counter of failed logins should be associated with the account itself, rather than the source IP address" and "(max 2-3, after that permanent account lockout)". The "2–3 timed lockouts" paraphrase is fair.
- S87 has the password-spraying definition and "multiple, layered defenses can provide a reasonable degree of protection". It asks for a CAPTCHA "when the login request is considered suspicious or high risk", and says blocking an IP address "should not be used as the sole or primary defense" and should be temporary. It also says thresholds can be adjusted "to reduce potential impact on legitimate users", which supports AS-36.
- GitHub shows both cheat sheets last committed on 4 October 2026, as §7 and §11 state.
- S32 and S33 are quoted exactly. S63 (updated 6 September 2026) matches §7 on 3.3.8.
The sources behind the key findings and the recommendation were re-fetched, and each supports its citation:
- F-1 to F-3 (S3–S8, S10, S11): 30, 15, 20 and 30-minute windows; one month; 3 no-shows in a calendar year; 4 in a week; 61% (1,214 readers).
- F-6 (S14–S16): 1.6 million; 6%; 3.8 million (7%); 92%; 57% and 64%.
- F-7 (S18, S19): 8 trials and 6,615 people; 7 trials and 5,841 people; 67.8% to 78.6%; RR 1.14 (1.03–1.26); RR 1.11 (1.05–1.19); text alone 1.14 (0.99–1.31), p = 0.07.
- C-1, F-12 and F-14 (S22–S31, S78–S80).
- F-17 (S35, S37).
- F-19 (S38, S39).
- F-27 (S56; S81–S84 give 22, 2, 0 and 0 results).
- C-8 (S44, draft of 31 March 2026).
S21 and S36 resolve as PDFs whose text my tools can't extract. They are unchanged since round 1, when they were verified, and are backed up by S22/S27 and S37. Estimates are labelled (F-9, F-25). Instruments are named correctly, as in round 2.
QC-RESEARCH: A
A evidence: RQ-1 to RQ-10 are stated and answered, and RQ-5 includes the revised F-34. F-34 now rests on three independent authorities:
- NIST [S76], a foundational standard;
- the NCSC [S85], labelled "older; current guidance";
- OWASP [S86][S87], current (2026) and labelled "Industry guidance, not law" in §7.
S32 and S33 show that the same PIN opens members' other online library services. Counter-evidence is reported: the NCSC and OWASP warn that lockout can be used for denial of service, which leads to the staff route and NFR-27, and IP blocking is not a primary defence. Every other key finding keeps two or more sources, as in round 2. Options A–H include doing nothing and doing the minimum. §9 states the limits, including the keyword-only G-Cloud search and the unnamed LMS. Legal, standards and accessibility context is complete. My searches found one gap, how guessable human-chosen PINs are, which is raised once under QC-ACCURACY.
QC-REQUIREMENTS: A
A evidence: The round-2 MAJOR is resolved.
- NFR-26 refuses sign-in for at least 15 minutes after every 5th consecutive failure (the 5th, 10th and 15th).
- It counts failures across those pauses, resets the count only on a successful sign-in or by staff, and stops online sign-in at 20 until staff re-enable it.
- Refused attempts neither reach the LMS nor add to the count, and the limit also covers door-screen identification.
- AC (b) caps LMS checks at 5 in any 15 minutes and 20 in total over a 100-attempt scripted run.
- AC (d) tests the cap, a refusal 24 hours later and the staff re-enable. AC (e) tests the reset after a successful sign-in.
- FR-43 adds the re-enable action with its own Given/When/Then (b).
- AS-34 states both stages, and that NIST's 100 is a cap at which sign-in is disabled. AS-35 covers PIN length and the LMS's own lock.
NFR-27 (Should) is singular, with a measurable trigger: 10 different cards failing from one address within 10 minutes brings a 15-minute bot check. Its criteria (a)–(d) count LMS checks, show a member can pass the check, show other addresses are unaffected, and include the check in the WCAG 2.2 audit, including 3.3.8. All 95 requirements (BR-1 to BR-16, FR-1 to FR-52, NFR-1 to NFR-27) have an ID, a MoSCoW priority, a rationale, a source and acceptance criteria. My recount matches the stated totals: 77 Must (15 BR, 39 FR, 23 NFR), 13 Should (1 BR, 8 FR, 4 NFR) and 5 Could. NFR thresholds stay measurable, with methods, as in round 2. No requirement statement uses a banned vague term, and US-1 to US-6 use the "As a … I want … so that …" form. The round-2 per-source observation is taken up as NFR-27.
QC-TRACEABILITY: A
A evidence: The new and changed rows match the Source columns:
- NFR-26: [A:Q-8]; [S76][S85][S86][S32][S33].
- NFR-27: [A:Q-8]; [S76][S85][S86][S87].
- FR-43 adds [S76]. FR-52 adds (AS-24), with a matching AS-24 "Affects" entry.
- §13.1 Q-8 and the §18 Q-8 and B-5 rows include NFR-26 and NFR-27. Q-5 and Q-9 include FR-52.
- The "Affects" entries of AS-34, AS-35 and AS-36 match the tags in NFR-26 and NFR-27.
- C-18 traces to NFR-26, NFR-27, FR-43, FR-31, AS-34 to AS-36 and RSK-15.
The backward trace lists all 95 requirements, each with an acceptance summary and a named verification method. NFR-26's summary includes the total of 20 or fewer, the cap and re-enable, and the reset. Forward traces for B-1 to B-6, Q-1 to Q-15, AS-01 to AS-23 and C-1 to C-18 are complete. The rest is unchanged from round 2, when the inverse of every Source column matched exactly.
QC-CONSISTENCY: B
- [MINOR] requirements-specification.md §2 (first "Most important requirements" bullet), §9 FR-43, §10 NFR-26 (statement and AC (b), (d), (e)), §13.2 AS-34, §16 RSK-15, §19 "Overall cap"; research-report.md §1, F-34, R-14, C-18 — "block" now names three different concepts.
  - The glossary defines "Block" only as "A period in which staff make a room unavailable … (FR-39)". FR-37, FR-39, NFR-13, BRL-8, BRL-25, AS-08 and the §11 Block entity use it that way.
  - NFR-26, AS-34 and RSK-15 use the same noun for a period of refused sign-ins ("a block of at least 15 minutes", "counted across blocks", "three blocks, then a stop"), and so does the glossary's own "Overall cap" entry.
  - FR-43's "re-enable a member's blocked online sign-in" sits next to FR-7 and BRL-1, where "blocked" is the LMS account status.
  So supplier-facing text uses one term for three concepts, against "one term per concept". The sign-in meaning came from QC's own round-2 uplift wording, so QC missed this in round 2; the new text has spread it.
  Uplift: (1) Give the stage-1 period its own term, for example "sign-in pause". Use it in spec §2, NFR-26 (statement and all criteria), AS-34, RSK-15 and the glossary's "Overall cap" entry, and in research §1, F-34, R-14 and C-18. (2) Add a glossary entry: "Sign-in pause: stage 1 of the sign-in limit; at least 15 minutes in which online sign-in for one card is refused after every 5th consecutive failure (NFR-26)." (3) Reword FR-43's action as "re-enable online sign-in for a card stopped at the overall cap (NFR-26)", and keep "Block" for room blocks only. (4) While editing NFR-26 AC (d), replace "after the last block has ended" with "more than 15 minutes after the 20th failure". Pauses follow only the 5th, 10th and 15th failures, so "the last block" ended before the 16th.
A evidence: what already meets the bar. The round-2 MINOR is fixed:
- BRL-17 and AS-24 now check in a door-screen "book now" booking (FR-52) at once, matching FR-12 (a) and (b) and FR-52's criterion.
- FR-52 cites AS-24.
IDs are unique and gap-free: BR 1–16, FR 1–52, NFR 1–27, BRL 1–27, AS 01–36, CON 1–13, DEP 1–9, RSK 1–15, OQ 1–5, REC 1–4, US 1–6, F 1–34, R 1–14, C 1–18 and S1–S87. Every referenced ID is defined. Figures agree across both documents:
- the sign-in limit: 5 failures, at least 15 minutes, a cap of 20;
- the bot check: 10 cards, 10 minutes, 15 minutes;
- the totals: 77/13/5 = 95;
- 14–17%, 12%, 60%, 1 March 2027, 99.5% and 2.0 s.
NFR-9 matches §11's failed sign-in record field for field. Research C-18 agrees with NFR-26, NFR-27 and AS-34. No round-2 wording survives ("far inside", "ceiling").
QC-ALIGNMENT: A
A evidence: The problem statement and objectives are unchanged and restate the brief faithfully. answers-round-1.md ("approved the analyst's stated default assumptions") is reflected exactly in §13.1. The v0.3 additions stay within the brief and the approved defaults:
- NFR-26's cap and FR-43's re-enable secure Q-8's live card-and-PIN sign-in on a public page.
- NFR-27 is a Should quality of that same sign-in, from research F-34, compared between suppliers, not a new feature.
The round-2 observation is taken up: §6.3 now says what happens to REC-1 to REC-4 if the owner doesn't decide. AS-34, AS-35 and AS-36 are "To be validated", each with a named validator and a date, and none contradicts the brief or the answers. The recommendation and its trade-off are unchanged and follow from F-12 to F-14 and F-27. L-002 is met: the owner faces at most five decisions (sign-off with the defaults, OQ-1, OQ-2, REC-1 to REC-4), each with a stated default, and specialist checks go to named roles.
QC-CLARITY: A
- [OBSERVATION] research-report.md §1 — still about 800 words by my hand count. "Key implications" was cut to three items, but the evidence bullets, risks and decisions grew.
  Uplift (optional): shorten the second evidence bullet (about 77 words) to one sentence and cut "Confidence" to one line, so §1 fits on one page.
A evidence: Both executive summaries stand alone, covering problem, recommendation, key requirements or implications, key risks, and decisions with named owners. Spec §2 is about one page. Both documents follow the templates, with numbered sections, ID-keyed tables and three diagrams. New terms are defined in §19: Bot check, CAPTCHA, Network address, Overall cap, OWASP, Password spraying and Re-enable (online sign-in). OWASP and CAPTCHA are also defined at first use in research §4 and F-34. The new text is plain and active, with no marketing language.
Stated overall: B
```
