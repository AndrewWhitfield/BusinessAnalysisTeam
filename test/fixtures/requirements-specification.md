# Requirements specification — Library room booking

## Document control
Version 1.0, 2026-10-10, status: draft for QC. Author: Business Analyst agent. Reviewer: Quality Controller agent.

## Executive summary
Members will book study rooms online, get reminders, and unclaimed rooms are released after 15 minutes [S5]. Key decision for the owner: approve the vendor module (OQ-1).

## Background and problem statement
Bookings are taken by phone at the desk, which is busy at peak times and leaves rooms empty when members don't arrive [Brief].

## Business objectives and success measures
OBJ-1: 80% of bookings made online within 6 months of launch, measured from booking records.

## Stakeholders
| Stakeholder | Interest | Influence | Needs | Engagement |
|---|---|---|---|---|
| Members | book rooms | medium | quick booking | survey |
| Desk staff | fewer calls | high | less admin | workshop |

## Scope
In scope: online booking, reminders, release of unclaimed rooms. Out of scope: payments (rooms are free) [Brief].

## Current and future state
Today members phone the desk; in future they book online and check in at the room.

## Business requirements
| ID | Requirement | Rationale | Source | Priority | Acceptance criteria |
|---|---|---|---|---|---|
| BR-1 | Members can book study rooms without contacting staff | Reduce desk load | [Brief] | Must | 80% of bookings made online within 6 months |

## Functional requirements
| ID | Requirement | Rationale | Source | Priority | Acceptance criteria |
|---|---|---|---|---|---|
| FR-1 | The service shows each room's free slots for the next 14 days | Members expect to see availability | [S1] | Must | Given a member opens the booking page, when rooms exist, then free slots for 14 days are listed |
| FR-2 | The service releases a booking not checked in within 15 minutes of its start | Cut no-shows | [S5] | Should | Given a booking with no check-in, when 15 minutes pass, then the slot shows as free |

## Non-functional requirements
| ID | Requirement | Rationale | Source | Priority | Acceptance criteria |
|---|---|---|---|---|---|
| NFR-1 | The booking pages conform to WCAG 2.2 level AA | Legal duty | [S4] | Must | Automated scan reports 0 serious issues and a manual keyboard walk-through of 3 journeys passes |
| NFR-2 | 95% of availability searches return within 2 seconds | Members book in under two minutes | [S1] | Should | Load test of 100 concurrent users shows p95 at or under 2 seconds |

## Data requirements
Booking: member ID, room, start, end, status. Owner: library services. Retention: 12 months. Classification: personal data.

## Business rules
BRL-1: one active booking per member per day [Brief].

## Assumptions
AS-1: members have library accounts — to be validated by the library manager by launch.

## Constraints
CON-1: must run on the council's existing hosting platform.

## Dependencies
DEP-1: the member directory, owned by IT services.

## Risks
| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| RSK-1 | Late members lose rooms | Medium | Low | Reminder 30 minutes before | Library manager |

## Open questions
| ID | Question | Who must answer | What it blocks |
|---|---|---|---|
| OQ-1 | Approve the vendor module? | Owner | Procurement |

## Traceability matrix
| Requirement | Traces from | Acceptance criteria | Verified by |
|---|---|---|---|
| BR-1 | Brief | 80% online | Booking report |
| FR-1 | S1 | 14-day slots | Acceptance test |
| FR-2 | S5 | release at 15 min | Acceptance test |
| NFR-1 | S4 | 0 serious issues | Accessibility audit |
| NFR-2 | S1 | p95 2 s | Load test |

## Glossary
WCAG: Web Content Accessibility Guidelines. p95: 95th percentile. No-show: a booking not used.
