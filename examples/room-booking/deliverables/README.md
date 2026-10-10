# Online study-room booking for the town library

**Status: QC grade A in all 8 areas** (round 5) — ready for your review and sign-off.

| Document | What it is |
|---|---|
| [Requirements specification](requirements-specification.md) | Objectives, stakeholders, scope, business / functional / non-functional requirements with acceptance criteria, data, rules, assumptions, risks, traceability. |
| [Research report](research-report.md) | The research behind it: findings, comparables, regulatory context, counter-evidence, and the verified source register. |
| [QC certificate](../reviews/round-5-qc.md) | The Quality Controller's final report: the evidence for every A. |
| [Elicitation record](../elicitation/elicitation-record.md) | Your answers to the analyst's questions, and the assumptions adopted where none was given. |

## Executive summary

**Problem.** Members book the library's six study rooms by phone or at the front desk. At exam time the desk is overwhelmed, and around a quarter of booked rooms sit empty because people don't turn up [Brief]. The library has about 4,000 active members and about 300 bookings a month, peaking in May and December [Brief].

**Objectives** (§4). OBJ-1: no-shows at or below 12% in May 2027, from about 25% today. OBJ-2: at least 60% of bookings made by members themselves. OBJ-3: live by 1 March 2027. OBJ-4: meet the public-sector accessibility rules at go-live [Brief]. The targets and date are the owner's approved defaults [A:Q-1][A:Q-6].

**Recommendation.** Buy a hosted booking product made for libraries and configure it, rather than build one; keep phone and desk booking in the same calendar; and fight no-shows with three measures together: reminders with an easy cancel link, check-in with automatic release, and suspension after repeated no-shows, with notice and staff review (research C-1 to C-3). Trade-off: a yearly subscription and reliance on the library-system supplier for a secure sign-in link, in exchange for a faster, lower-risk launch before the May 2027 peak.

**Most important requirements** (77 Musts, 13 Shoulds, 5 Coulds).
- Members see free rooms and book themselves, signing in with their library card number and personal identification number (PIN), checked live against the library management system over an encrypted link. Wrong PINs are limited in two stages: a sign-in pause of at least 15 minutes after every 5, and after 20 no online sign-in until staff re-enable it (BR-1, FR-1, FR-5, FR-6, NFR-2, NFR-26).
- One calendar for online, phone, desk and walk-in bookings, with no double booking (BR-4, FR-10, FR-12, FR-17).
- Booking rules (1-hour slots, at most 3 hours, 14 days ahead, 2 future bookings) with a stricter peak set, changeable by staff (BRL-8 to BRL-13, FR-40, FR-41).
- Email confirmation and day-before reminder; check-in by QR (quick response) code or through staff; release 15 minutes after the start; 4-week online suspension after 3 no-shows in 90 days, with emails and staff correction (FR-23 to FR-30, FR-32, FR-33).
- Reports that measure the targets (FR-45, FR-46).
- Web Content Accessibility Guidelines (WCAG) 2.2 level AA for member and staff pages; hosting in the UK or a country covered by UK adequacy regulations; Cyber Essentials certification; multi-factor sign-in for staff (NFR-17, NFR-18, NFR-8, NFR-6, NFR-5).

**Key risks** (§16). Under five months to buy, set up and test (RSK-8). The 12% target may be missed: reminders alone are estimated to reach about 14–17%, and automatic release recovers room time without lowering the no-show rate (RSK-1). Someone could guess members' PINs at the public sign-in page: even with the overall cap of 20, roughly 5–8% of PINs that members chose themselves could be found (**estimate**, AS-34), and the cap lets someone shut members out of online sign-in until staff re-enable it (RSK-15). Members who forget to check in will be recorded as no-shows (RSK-2). The library-system supplier may be slow or charge for the sign-in link (RSK-7).

**Decisions needed.**
- **Owner, by 30 October 2026:** sign off this specification and confirm the 15 approved defaults and the assumptions in §13; keep the 15-minute release or relax it to 20–30 minutes (OQ-1); keep the 12% target or set an interim one (OQ-2); accept or reject recommendations REC-1 to REC-4 (§6.3).
- **Library systems staff:** name the library management system and confirm an encrypted interface and its cost (OQ-3); say whether the LMS locks a PIN after failed attempts, how PINs are set (chosen by members or a default such as the date of birth) and how long they are (AS-35).
- **Council IT:** validate the sign-in limit values (AS-34, AS-36), weighing how PINs are set (AS-35), and accept the risk that remains, because no cap brings a short PIN used alone up to NIST's US digital identity standard (AS-34); validate the other assumptions it owns (§13.2).
- **Procurement team:** confirm the buying route and whether the contract reaches £30,000 including value added tax (VAT) (OQ-4).
- **Data protection officer:** judge whether the automatic suspension is a significant automated decision (OQ-5).

## What needs your decision

36 assumption(s) to validate and 5 open question(s) — see the specification's Assumptions and Open questions sections.

## QC certification

Graded against [the grading standard](https://github.com/AndrewWhitfield/BusinessAnalysisTeam/blob/main/standards/grading-standard.md): an area is A only with no critical, major or minor finding and recorded evidence that each of its A criteria holds.

| Area | Grade | Evidence (QC) |
|---|---|---|
| COMPLETENESS | A | - The pre-check passed. Every section of both templates is present and substantive: spec §1 to §19 and research §1 to §11. - The v0.5 changes are complete: - The 15-character shortfall now appears wherever the pack touches NIST: research §1 (council IT decision), F-34, the §7 NIST row, R-14, §9 (a new limitation) and C-18; spec §2 (council IT), NFR-26 rationale, AS-34 and RSK-15. - Council IT is n |
| ACCURACY | A | - The round-4 MINOR is fixed. I fetched S76 (NIST SP 800-63B-4): - §3.1.1: "A password (sometimes referred to as a passphrase or, if numeric, a personal identification number [PIN])". - §3.1.1.2: "SHALL require passwords that are used as a single-factor authentication mechanism to be a minimum of 15 characters"; a password used only within multi-factor sign-in must be at least 8. - §3.2.2: "no mor |
| RESEARCH | A | - The round-4 MINOR is resolved. The counter-evidence from S76 (the 15-character single-factor rule, §3.1.1 and §3.1.1.2) is now reported where the pack relies on NIST: F-34, §7, R-14, a new §9 limitation, C-18 and §1. The reason for keeping card and PIN is stated in each: the owner-approved default [A:Q-8], PINs held by the LMS, and use in English libraries [S32][S33][S34]. Council IT accepts the |
| REQUIREMENTS | A | - v0.5 changes rationale and assumption text only. My Grep recount of the BR, FR and NFR rows gives 77 Must and 13 Should, with 95 rows in total (so 5 Could), matching §2 and the change history. - The NFR-26 statement and criteria (a) to (e) are unchanged: singular, and measurable by the counts of LMS checks (≤ 5 in any 15 minutes, ≤ 20 in total), the 15-minute refusal, the re-enable and the reset |
| TRACEABILITY | A | - The Source columns are unchanged. NFR-26 reads [A:Q-8]; [S76][S85][S86]; [S32][S33] in both §10 and the §18 backward trace, and its §18 summary matches criteria (a) to (e). - The backward trace lists all 95 requirements with an acceptance summary and a verification method. - The "Affects" entries for AS-34 (NFR-26) and AS-35 (NFR-26, RSK-15) match. - C-18's research "Based on" column now adds F- |
| CONSISTENCY | A | - The 15-character point is worded the same way in every place it appears: research §1, F-34, §7, R-14, §9 and C-18; spec §2, NFR-26, AS-34 and RSK-15. "Within both limits" in NFR-26 matches "within both that limit and OWASP's" in C-18, and AS-34 has "meets NIST's limit on failed attempts (§3.2.2)". - My Grep for block/blocked/blocks finds only room blocks, "LMS block", the Communico quote and col |
| ALIGNMENT | A | - The problem statement, objectives and scope are unchanged and restate the brief faithfully. answers-round-1.md ("approved the analyst's stated default assumptions") is reflected exactly in §13.1. - v0.5 adds no scope, requirement, priority or value. Card-and-PIN sign-in stays the owner-approved default [A:Q-8], and the pack does not override it. - The trade-off is now explicit: council IT accept |
| CLARITY | A | - The round-4 observation was applied. The AS-34 Basis now gives the key figures (5, 15 minutes, 100, 2–3, 5–8%) plus the NIST note and points to research F-34. AS-35 is shorter. The §13.2 table is easier to scan. - Research §1 gained one clause in its decisions paragraph and still fits one page. It covers the problem, evidence, recommendation, implications, risks, decisions with named owners and  |

## How it got here

| Round | Overall | Areas (comp accu rese requ trac cons alig clar) | Findings (crit / major / minor) |
|---|---|---|---|
| 1 | C | C B B B B B A B | 0 / 1 / 14 |
| 2 | C | A A A C A B A A | 0 / 1 / 1 |
| 3 | B | A B A A A B A A | 0 / 0 / 2 |
| 4 | B | A A B A A A A A | 0 / 0 / 1 |
| 5 | A | A A A A A A A A | 0 / 0 / 0 |

Total model spend for this analysis: $54.18.

## Your next step

- Accept: `npm start -- --project room-booking --resume --approve`
- Ask for changes: write them in a file, then `npm start -- --project room-booking --resume --feedback-file <file>` — the analyst revises and QC grades again to A.
