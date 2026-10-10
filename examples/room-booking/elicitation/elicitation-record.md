# Elicitation record: online study-room booking

**Project:** Online study-room booking for the town library
**Prepared by:** Business Analyst
**Date:** 10 October 2026
**Inputs:** `brief.md`; `elicitation/questions-round-1.md` (Q-1 to Q-15); `elicitation/answers-round-1.md`
**Rounds held:** 1. **Round 2:** not needed (§7 says why).

## 1. Summary

- The owner didn't answer the round-1 questions and approved every stated default. All 15 defaults are now adopted. Each one is an **assumption — to be confirmed by the owner**.
- I also adopted 23 defaults for points I didn't ask about (AS-01 to AS-23 in §5). Each of these is also an **assumption — to be confirmed by the owner**.
- None of the answers left a gap that only the owner can close and that would materially change the requirements. So there's no second round of questions.
- Five defaults have the biggest effect on what gets bought, so they're the ones to check first:
  - Q-1: the success targets (no-shows at or below 12%, at least 60% of bookings made by members themselves).
  - Q-2: check-in with release after 15 minutes, and a 4-week suspension after 3 no-shows.
  - Q-4: the booking rules.
  - Q-6: live by 1 March 2027.
  - Q-10: the IT and data-protection rules.

## 2. How to read this record

**Status labels**
- **Brief fact.** Stated in `brief.md`. Not an assumption.
- **Assumption — to be confirmed by the owner.** A default that the owner approved without supplying the fact, or one I adopted without asking. It stands until the owner changes it. When a specialist holds the fact, the "Owner checks with" column names them.

**Source tags.** The requirements specification will trace each requirement back to this record:
- `[Brief]` for the facts in §3.
- `[A:Q-n]` for an adopted round-1 default.
- `AS-nn` for a default adopted without asking. These go in the specification's assumptions section, and any research that supports them is cited there as `[S#]`.

**Requirement types used below**
- **BR** (business requirement): a measurable outcome the library wants.
- **Rule** (business rule): a rule the system enforces.
- **FR** (functional requirement): something the system does.
- **NFR** (non-functional requirement): a quality the system must have, such as security, privacy, speed, availability or accessibility.
- **TR** (transition requirement): something needed to go live that isn't a system feature.
- **Con** (constraint): a limit on the solution or the purchase.
- **Scope**: in or out of the project.

**Priorities** follow MoSCoW: **Must** (essential), **Should** (important, not essential), **Could** (desirable if affordable) and **Won't** (not this time).

**How this record relates to the specification and the research report**
- Each "implied requirement" below is an outline. The requirements specification turns it into a numbered requirement with acceptance criteria. If the two ever differ, the specification takes precedence and records why.
- Round 1 gave a basis for each default, such as other libraries' practice. I restate those bases here without re-proving them. The research report checks and cites them. If research contradicts a basis, I'll revisit the default and flag it to the owner.

## 3. Facts settled by the brief

| ID | What the brief says (quoted) | Requirements implied |
|---|---|---|
| B-1 | "Members book the library's six study rooms by phoning or visiting the front desk. At exam time the desk is overwhelmed, and around a quarter of booked rooms sit empty because people don't turn up." | BR: fewer no-shows, starting from a baseline of about 25% (target and measurement in Q-1). BR: less front-desk workload (measured as in Q-1). Scope: the six study rooms (Q-12). |
| B-2 | "A way for members to see which rooms are free and book them themselves, with fewer empty rooms." | FR, Must: show the free and booked times for each room. FR, Must: members book for themselves. BR, Must: fewer empty rooms (Q-1, Q-2). |
| B-3 | "About 4,000 active members; roughly 300 room bookings a month, peaking in May and December." | NFR: capacity and speed sized for this load (AS-15). Rule: a stricter rule set for peak months (Q-4). BR: success is measured over the first exam peak (Q-1). |
| B-4 | "We are a public library in England, so the service must meet public-sector accessibility rules." | NFR, Must: member-facing pages conform to the Web Content Accessibility Guidelines (WCAG) 2.2, level AA. NFR, Should: staff screens conform to the same level (the research report confirms whether the regulations require it). TR, Must: before go-live, the library publishes an accessibility statement for the booking service, and the supplier provides evidence of conformance to support it. Basis: GOV.UK guidance (last updated 30 September 2024) says public-sector websites must meet WCAG 2.2 AA and must publish an accessibility statement, and that the body is "legally responsible" even if it has outsourced the website. The research report cites this. Because the library is in England, the legal frame also includes the UK General Data Protection Regulation (UK GDPR) with the Data Protection Act 2018, the Equality Act 2010, the Procurement Act 2023 and the Public Libraries and Museums Act 1964. |
| B-5 | "We already use a library management system for member accounts." | FR, Must: sign-in and eligibility are checked against the library management system (Q-3, Q-8). Con: no second register of members to keep in step (AS-11). |
| B-6 | "Research how other libraries handle this and what members expect, then give me requirements I can take to suppliers, with clear priorities and acceptance criteria." | Deliverables: a research report, and a requirements specification ready to give to suppliers. Every requirement has a MoSCoW priority and acceptance criteria. The wording names no supplier (Q-7). |

## 4. Round 1: questions, answers and adopted defaults

**The owner's answer, which applies to every question in this round** (`answers-round-1.md`):

> "The owner did not answer these questions and approved the analyst's stated default assumptions ("If unanswered, I will assume")."

The status of every default in this section is therefore **assumption — to be confirmed by the owner**.

### Q-1 Success targets and today's no-show baseline

**Question:** "What would success look like in numbers (for no-shows, how many members book online, and front-desk workload), and how is today's "around a quarter" no-show figure worked out?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "No-shows at or below 12% (half of today's ~25%) across the first full exam peak after launch; at least 60% of bookings made by members themselves rather than by staff; today's baseline taken from desk records of rooms booked but not used. All three figures are my placeholders for you to validate."

**Status:** assumption — to be confirmed by the owner.

**How I apply it:**
- **No-show:** a booking that wasn't cancelled before its start time and wasn't checked in by the release time (15 minutes after the start, Q-2).
- **No-show rate:** the number of no-shows divided by the number of bookings not cancelled before their start, over a stated period.
- **First full exam peak after launch:** the calendar month of May 2027, given go-live by 1 March 2027 (Q-6).
- **Self-service share:** bookings made by members themselves (online, including walk-ins who book on the spot) divided by all bookings, over the same period.
- **Front-desk workload:** the default sets no separate target for it. It's tracked as the number and share of bookings that staff make. That share is 40% or less if the 60% target is met.

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| The no-show rate in May 2027 is 12% or less, against a baseline of about 25% | BR | Must |
| At least 60% of bookings in May 2027 are made by members themselves | BR | Must |
| Before go-live, staff work out today's no-show baseline from desk records of rooms booked but not used, covering the latest May and December peaks where records allow | TR | Must |
| Every booking records who made it (the member or staff) and its outcome (checked in, cancelled, or released as a no-show) | FR | Must |
| For any date range, both in total and per room, staff can report bookings by who made them, cancellations, check-ins, no-shows, the no-show rate and the self-service share, and can export the report as a spreadsheet file | FR | Must |
| Reports show how often released rooms were booked again, and room use (checked-in hours as a share of bookable hours), so "fewer empty rooms" is measured directly | FR | Should |

### Q-2 Ways of cutting no-shows

**Question:** "Which of these ways of cutting no-shows are you willing to use: (a) reminder messages, (b) "check-in", where members confirm they have arrived and the room is released to others if they don't arrive within a set time, (c) a temporary ban on booking after repeated no-shows, (d) a refundable deposit or a fee? Are any of these off limits?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "(a) yes. (b) yes, with rooms released 15 minutes after the start time if nobody has checked in. (c) yes: three no-shows in 90 days suspends self-booking for 4 weeks, with desk booking still allowed. (d) no fees."

**Status:** assumption — to be confirmed by the owner.

**How I apply it:**
- **Release:** if a booking has no check-in 15 minutes after its start, the booking ends, it's recorded as a no-show, and anyone can book the room straight away. AS-04 covers when the check-in window opens and how it works for bookings of more than one hour.
- **"Three no-shows in 90 days":** counted over the 90 days up to and including the latest no-show. The suspension lasts 28 days from the third no-show.
- **"Desk booking still allowed":** staff can still book for a suspended member, at the desk or by phone (Q-5).
- Q-11 sets the reminder channels and timing. AS-05 covers how members are told about no-shows and suspensions.

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| Members check in to their booking (how: Q-9) | FR | Must |
| A booking not checked in 15 minutes after its start is released, recorded as a no-show, and the room shows as free | Rule | Must |
| A member with three no-shows in any 90-day period can't book online for 4 weeks, but staff can still book for them | Rule | Must |
| Staff can remove a wrongly recorded no-show and lift a suspension, recording the reason, so that a failed check-in (for example, no phone signal) doesn't count against a member | FR | Must |
| Staff can change the release time, the number of no-shows, the counting period and the length of the suspension without the supplier's help | FR | Should |
| Members get a reminder before each booking (details in Q-11) | FR | Must |
| No deposits or no-show fees | Scope (out) | Won't |

### Q-3 Who may book

**Question:** "Who may book a room: any active member, or are there limits by age, by account status (for example unpaid charges or a blocked card), or for non-members? And are rooms free for everyone?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "Any member whose account is active and not blocked in the library management system may book online. No age limit beyond what membership already allows. Non-members cannot book. Rooms are free."

**Status:** assumption — to be confirmed by the owner.

**How I apply it:** "Active" and "not blocked" mean the library management system's own account statuses. The booking system adds no eligibility rules of its own.

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| When a member signs in, the system checks with the library management system that the account is active and not blocked. If it isn't, the system refuses online booking and tells the member to contact staff | FR | Must |
| Only library members can be booked into a room. There's no guest or non-member booking | Rule | Must |
| Any eligible member can book, whatever their age | Rule | Must |
| Rooms are free. Together with Q-2(d), this means there are no charging or payment features at all | Scope (out) | Won't |

### Q-4 Booking rules

**Question:** "What are the booking rules today (opening hours, slot length, longest single booking, how far ahead members can book, how many bookings one member may hold), and may the new system change them, including stricter rules in May and December?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "Bookable during opening hours in 1-hour slots; at most 3 hours per booking; up to 14 days ahead; at most 2 future bookings per member at any time. Staff can change all of these without the supplier's help, and a separate peak-period rule set can be switched on. … My figures are placeholders for you to validate."

**Status:** assumption — to be confirmed by the owner.

**How I apply it:**
- Slots start on the hour, within the opening hours that staff set (AS-08).
- "14 days ahead" means a member can book any slot that starts within the next 14 days.
- "2 future bookings" counts the member's bookings that haven't started yet.
- The rules apply to bookings that staff make too, unless staff override them (AS-06).
- The default doesn't set the stricter peak values. Assumption — to be confirmed by the owner: the library service sets those values before May 2027, and the system only has to hold and apply them.
- Assumption — to be confirmed by the owner: a rule change applies to new bookings only, and existing bookings stand.

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| Rooms can be booked only during opening hours | Rule | Must |
| Bookings are made in whole 1-hour slots | Rule | Must |
| A single booking lasts at most 3 hours | Rule | Must |
| Members can book up to 14 days ahead | Rule | Must |
| A member can hold at most 2 future bookings at once | Rule | Must |
| Staff can change each rule above without the supplier's help | FR | Must |
| Staff can hold a second, stricter set of values for these rules and switch it on and off (for May and December) | FR | Must |

### Q-5 Phone, desk and walk-in booking

**Question:** "Must phone and front-desk booking carry on alongside online booking, with staff booking for members in the same system? And should someone who walks in be able to use a room that is free or has just been released?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "Yes to both. Staff book by phone and at the desk into the same live calendar, so there is one true record. Walk-ins can take any free room straight away, either through staff or by booking it themselves on the spot."

**Status:** assumption — to be confirmed by the owner.

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| Phone and desk booking stay available alongside online booking | Scope (in) | Must |
| Staff can make, change and cancel bookings for a member, finding the member by card number or name | FR | Must |
| Online, desk and phone bookings all go into one calendar, and a room can never be booked twice for the same time | FR | Must |
| The availability a person sees is current at the moment the page loads | NFR | Must |
| An eligible member can book a free or just-released room starting now, either themselves or through staff | FR | Must |
| Staff have a view of today that shows each room's status: free, booked, checked in or released | FR | Must |

### Q-6 Budget and deadline

**Question:** "What budget do you have for setting the system up and for running it each year, and by what date must it be working?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "No fixed budget. I will prioritise so that all Musts fit a low-cost, off-the-shelf subscription service, and mark costly extras (text messages, door hardware) as Should or Could. The system is live and tested by 1 March 2027, so it beds in before the May 2027 peak."

**Status:** assumption — to be confirmed by the owner.

**How I apply it:**
- "Low-cost" isn't a number, and the default sets no budget. Suppliers' quotes will establish the cost, and the owner decides.
- The Musts are written so that a configured off-the-shelf product can meet them without custom development.
- Going live by 1 March 2027 leaves under five months from today for the purchase, set-up, the connection to the library management system, testing and staff training. That's a risk (§8).

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| The service is live, tested and accepted by 1 March 2027 | Con | Must |
| Every Must can be met by configuring an existing hosted product, without custom software development | Con | Must |
| Suppliers price the Must items separately from each Should and Could item (for example text messages and door equipment), so that the owner can choose which extras to buy | Con (purchase) | Must |

### Q-7 How the system will be bought

**Question:** "How will the system be bought (through the council's procurement team, a public-sector framework such as G-Cloud, or direct quotes from suppliers), and does the council already have a booking platform, for example for venues or leisure, that you would be expected to use?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "A quotation exercise run with the council's procurement team. The specification names no supplier, and its Must items are pass/fail. There is no existing council platform to reuse."

**Status:** assumption — to be confirmed by the owner. The owner checks with the council's procurement team.

**How I apply it:**
- Must items are pass or fail. Should and Could items are the basis for comparing suppliers, and the procurement team decides how to score them.
- For council contracts valued at £30,000 or more including VAT, the Procurement Act 2023 adds duties to publish notices. GOV.UK's below-threshold guidance confirms this figure, and the research report cites it. The procurement team confirms whether this contract reaches that value.

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| The specification names no supplier or product | Con | Must |
| Each Must is worded so that it can be marked pass or fail from a supplier's response, a demonstration or a test | Con | Must |
| Before inviting quotes, the procurement team confirms the buying route and whether the notice duties apply | TR | Must |
| The research report compares the alternatives: the library-system supplier's own booking module, booking products made for libraries, general booking products, and doing nothing | Research | n/a |

### Q-8 Library management system and member sign-in

**Question:** "Which library management system do you use (supplier and product), who looks after it (your team, council IT or a regional consortium), and should members sign in to book with their library card number and PIN?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "Members sign in with their card number and PIN, checked live against the library management system through a standard library interface (SIP2) or the supplier's interface (API). The library-system supplier's own module is assessed alongside other products."

**Status:** assumption — to be confirmed by the owner. The owner checks with whoever manages the library management system.

**How I apply it:**
- The default doesn't name the library management system, so the requirement stays neutral about the product. Suppliers must show that they work with it once it's named.
- SIP2 (Standard Interchange Protocol, version 2) is a common way for other systems to check library member details.
- An API (application programming interface) is a supplier's own route for the same purpose.

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| Members sign in with their library card number and PIN, with no separate username or password | FR | Must |
| The card number and PIN are checked live against the library management system through SIP2 or that system's supplier interface | FR | Must |
| Suppliers list the library management systems they have connected to in this way, and confirm compatibility with the library's system once it's named | Con (purchase) | Must |
| Dependency: the library-system supplier enables the interface, and any charge for it is included when comparing costs | Dependency | n/a |

### Q-9 Room access and check-in

**Question:** "How do members get into a booked room today (unlocked, key from the desk, or a door code), and would you accept new equipment at the rooms, such as a printed QR code, a small screen by each door or smart locks, if it helps confirm that people have arrived?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "Rooms are unlocked. Members check in by scanning a printed QR code at the door with their own phone, or by asking staff. Door screens and smart locks are listed as options, not requirements."

**Status:** assumption — to be confirmed by the owner.

**How I apply it:**
- A QR code is a printed square barcode that a phone camera reads to open a web page. Here it opens the room's check-in page.
- A member who has no phone, or whose phone fails, checks in with staff.
- Q-6 puts door hardware at Should or Could. I set it at **Could, priced separately**, because Q-9 calls it an option.
- Check-in on members' own phones relies on phone signal or Wi-Fi in each room (AS-21).
- Limitation, to be looked at in the research report: a printed code could be photographed and used from somewhere else.

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| Each room has a printed QR code that opens that room's check-in page. Scanning it and signing in checks in the member's current booking for that room | FR | Must |
| Check-in works in the phone's web browser, with no app to install (AS-09) | NFR | Must |
| Staff can check a member in from the staff screen | FR | Must |
| No building work is needed for any Must | Con | Must |
| A screen by each room door shows the room's status and allows check-in | FR | Could |
| Smart locks open the room for the member who booked it | FR | Could |

### Q-10 IT and information-governance rules

**Question:** "Are there IT or information-governance rules the system must meet (for example whether a supplier-hosted cloud service is allowed, data kept in the UK, security certification such as Cyber Essentials, staff signing in with council accounts), and who approves them?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "A supplier-hosted service is allowed. Personal data is held in the UK or in a country covered by UK adequacy regulations. The supplier holds Cyber Essentials certification. The council's data protection officer reviews a DPIA before go-live. Staff use named accounts with multi-factor sign-in. … To be validated with council IT."

**Status:** assumption — to be confirmed by the owner. The owner checks with council IT and the data protection officer.

**How I apply it:**
- A DPIA (data protection impact assessment) is a documented check of the privacy risks before a new use of personal data.
- Cyber Essentials is a UK government-backed security certification scheme.
- Multi-factor sign-in means a password plus a second check, such as a code sent to a phone.

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| A service hosted by the supplier is acceptable | Con | n/a |
| Members' personal data is stored and processed only in the UK or in countries covered by UK adequacy regulations | NFR (privacy) | Must |
| The supplier holds a current Cyber Essentials certificate throughout the contract | NFR (security) | Must |
| Each member of staff signs in with their own named account using multi-factor sign-in. There are no shared accounts | NFR (security) | Must |
| The supplier provides what the DPIA needs: what data is held, where, by which subcontractors, and how it's protected | Con (purchase) | Must |
| The council's data protection officer reviews the DPIA before go-live | TR | Must |

### Q-11 Member contact details and reminders

**Question:** "Do most member records hold an email address and a mobile number, and should reminders go by email only or also by text message (SMS), given that texts cost money per message?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "Email confirmation with a cancellation link, plus an email reminder the day before, is a Must; text reminders are a Should if the budget allows."

**Status:** assumption — to be confirmed by the owner.

**How I apply it:**
- **"The day before":** the reminder goes out on the day before the booking, at a time staff set. Bookings made on the day itself get the confirmation only.
- Bookings that staff make also get a confirmation email when the member has an email address.
- The default doesn't say how many member records hold an email address. AS-20 assumes most do, to be checked with a report from the library management system.

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| Each booking gets a confirmation email giving the room, date, time, how to check in, and a cancellation link | FR | Must |
| Each booking gets a reminder email the day before | FR | Must |
| Cancelling through the link frees the room at once | FR | Must |
| Text-message reminders, which cost extra per message | FR | Should |
| A member with no email address can still book, online or through staff. Online, they're offered the chance to add an address for booking messages | FR | Should |

### Q-12 What's in scope

**Question:** "Should the system cover only the six study rooms in this one library, or also other spaces (meeting rooms, public computers) or other branches, now or later?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "Only the six study rooms at one site are in scope. Staff must be able to add rooms or sites through settings (a Could). Other resource types are out of scope."

**Status:** assumption — to be confirmed by the owner.

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| In scope: the six study rooms at one library site | Scope (in) | Must |
| Staff can add rooms and further sites through settings, without the supplier's help | FR | Could |
| Out of scope: other spaces and resources (such as meeting rooms and public computers) and other branches | Scope (out) | Won't |

### Q-13 Who runs the library and who signs off

**Question:** "Who runs the library (the council directly, or a trust or community group on its behalf), and who must sign off the requirements and the purchase?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "The council runs the library as the library authority. The library service manager signs off, with council IT, the data protection officer and procurement as approvers."

**Status:** assumption — to be confirmed by the owner.

**How I apply it:** The council is the data controller for booking data (AS-13), and it's the buyer subject to public procurement law (Q-7).

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| The stakeholder list names the library service manager (signs off) and council IT, the data protection officer and procurement (approve) | Stakeholders | n/a |
| The council acts as data controller and the supplier as processor (AS-13) | Con | Must |
| The purchase follows the council's procurement rules and the Procurement Act 2023 (Q-7) | Con | Must |

### Q-14 Who uses the rooms

**Question:** "Who mainly uses the rooms today (for example students revising, tutors, home workers, small groups), and do you have any complaints, surveys or feedback on what members want, or groups you especially want to serve?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "Most users are students revising, plus home workers and small groups. I will rely on published research for what members expect and recommend user testing that includes disabled members."

**Status:** assumption — to be confirmed by the owner.

**How I apply it:** The specification's user groups are students revising, home workers and small groups. It also includes groups the round-1 question named as affected but not asking: disabled members, older members and members without internet access. Front-desk staff are a user group as well.

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| Before go-live, members (including disabled members) test the main tasks (find a free room, book, cancel and check in), and the problems they find are fixed | TR | Should |
| The research report draws on published research for what members expect, because there's no local survey | Research | n/a |

### Q-15 How the rooms differ

**Question:** "How do the six rooms differ: number of seats, equipment (power sockets, screens), and whether each is wheelchair accessible or has a hearing loop?"

**Answer:** Not answered. The owner approved the default.

**Adopted default:**
> "The rooms are the same apart from seat numbers, and each room's booking page shows its capacity and access details."

**Status:** assumption — to be confirmed by the owner.

**Requirements implied:**

| Implied requirement | Type | Planned priority |
|---|---|---|
| Each room's booking page shows its name, number of seats and access details (for example step-free access or a hearing loop) | FR | Must |
| Staff can edit each room's details | FR | Must |
| Before set-up, the library supplies each room's number of seats and access details | TR | Must |
| Members can't filter rooms by feature, because the rooms are alike apart from seats | Scope (out) | Won't |

## 5. Defaults adopted without asking

The specification needs each of these points settled. Under the owner's rule, I didn't ask about them. The status of every row is **assumption — to be confirmed by the owner**.

| ID | Assumption | Basis | Requirements implied (type, planned priority) | Owner checks with |
|---|---|---|---|---|
| AS-01 | A booking is for a whole room for a period of time. Single seats can't be booked. | The brief speaks of booking rooms. | Rule, Must: one booking per room per slot. | Owner |
| AS-02 | One member books for a group and is responsible for the booking. Other attendees aren't named. There's no minimum group size, and the room's number of seats is the maximum. | UK GDPR data-minimisation principle (Article 5(1)(c)). The brief sets no rules for groups. | FR, Must: a booking needs only the booking member's details. Rule, Must: no minimum group size. | Owner |
| AS-03 | Members can see their upcoming bookings and cancel any of them online up to the start time. Cancelling frees the room at once and never counts as a no-show. | Q-11 (cancellation link); the brief's "fewer empty rooms". | FR, Must. | Owner |
| AS-04 | Check-in opens 10 minutes before the start and closes at the release time. One check-in covers the whole booking. With no check-in, the whole booking is released. | Q-2 sets only the release time. The rule can't work until the window and longer bookings are settled. | Rule, Must. FR, Should: staff can change the opening time of the window (as in Q-2). | Owner |
| AS-05 | A suspension doesn't cancel a member's existing bookings. It only stops new online bookings. Members get an email each time a no-show is recorded and when a suspension starts, giving its end date and how to ask staff for a review. | UK GDPR fairness and transparency principle (Article 5(1)(a)); Q-2. | Rule, Must: existing bookings stand. FR, Should: the emails. | Owner |
| AS-06 | Staff can override a booking rule for one booking, recording the reason. For example, a disabled member may need a longer booking as a reasonable adjustment. | Equality Act 2010: the duty on service providers to make reasonable adjustments. | FR, Should. | Owner |
| AS-07 | Anyone can see which rooms are free without signing in, and this public view never shows who booked. Signing in is needed to book, cancel or check in. | The brief's "see which rooms are free"; UK GDPR data minimisation. | FR, Must: sign-in to book, cancel or check in. FR, Should: the public view without sign-in. | Owner |
| AS-08 | Staff set opening hours and closure days, and can block a room or a time (for maintenance or events). Blocked times can't be booked. If staff block a time that already has bookings, the members affected get an email. | The opening-hours rule in Q-4 needs a source, and the desk needs to block rooms in day-to-day running. | FR, Must. | Owner |
| AS-09 | The service is a website that works on phones, tablets and computers in current versions of the main web browsers, with nothing to install. | Q-9 (check-in on members' own phones); accessibility (B-4). | NFR, Must. The specification sets the list of browsers. | Owner |
| AS-10 | The service is in English only. | The library is in England, and the brief names no other language. | Con. | Owner |
| AS-11 | The booking system holds only the member data it needs: card number or member identifier, name, email address (plus mobile number if text reminders are bought) and booking history. It never stores PINs. | UK GDPR data minimisation; security good practice. | NFR (privacy and security), Must. | Data protection officer |
| AS-12 | Booking records that identify members are kept for no more than 12 months after the booking date, then deleted or made anonymous. Anonymous statistics are kept for reports. The council's own retention schedule overrides this if it differs. | UK GDPR storage-limitation principle (Article 5(1)(e)). The 90-day no-show rule and year-on-year peak reports need no longer. | NFR (privacy), Must. | Data protection officer |
| AS-13 | The lawful basis for booking data is "public task" (UK GDPR Article 6(1)(e)). The council is the data controller. The supplier is a processor under a contract that meets UK GDPR Article 28. Before go-live, the library's privacy notice is updated to cover booking. | UK GDPR; Q-13 (the council runs the library). | Con, Must: the contract terms. TR, Must: the privacy notice. | Data protection officer |
| AS-14 | The service is available at least 99.5% of each calendar month. Planned maintenance doesn't count if it's done outside opening hours with at least 5 working days' notice. | A working default for a small public service. The research report checks it against what booking-service suppliers commonly offer. | NFR (availability), Must. | Council IT |
| AS-15 | The service handles at least 50 people using it at once, with 95% of pages loading within 2 seconds. That's well above the expected use of about 300 bookings a month. | Brief volumes (B-3). A working default that the research report checks. | NFR (speed and capacity), Must. | Council IT |
| AS-16 | Staff can export booking data and reports as spreadsheet files (CSV, a plain format any spreadsheet opens) at any time. At the end of the contract, the supplier returns all the library's data in a common format and then deletes its copies. | UK GDPR Article 28(3)(g) (return or deletion of data when the service ends); avoids being locked in to one supplier. | FR, Must: export. Con, Must: the exit terms. | Procurement |
| AS-17 | The supplier trains staff before go-live, and provides support during library opening hours with response times set in the contract. | Needed to go live by 1 March 2027 (Q-6) and to run the desk through the peaks. | TR, Must: training. NFR, Should: the support hours and response times. | Owner |
| AS-18 | Before go-live, staff enter all future bookings from the current desk diary into the new system. Past bookings aren't moved across. | One live calendar (Q-5). | TR, Must. | Owner |
| AS-19 | Before go-live, the council records how it has considered the effect on members with protected characteristics, usually in an equality impact assessment. | Equality Act 2010, the public sector equality duty (section 149). | TR, Should. | Owner |
| AS-20 | Most members' library records hold an email address. If a report from the library management system shows otherwise, text reminders may need to move from Should to Must. | Not known. Checking it needs only a report from the library management system. | Affects the priorities in Q-11. TR, Must: run the report before suppliers are invited to quote. | Library systems staff |
| AS-21 | Phone signal or the library's public Wi-Fi works in every study room, so members can check in on their own phones. | Q-9 check-in depends on it. A phone test in each room confirms it. | Dependency. TR, Must: test each room before go-live. | Library staff |
| AS-22 | There are two staff roles. Front-desk staff can book, change, cancel, check members in, correct no-shows, lift suspensions and run reports. Administrators can also change the rules, rooms, opening hours and staff accounts. | Security good practice: each person gets only the access their job needs. Q-4 limits rule changes to staff. | FR, Must. | Council IT |
| AS-23 | All times are shown and enforced in UK time, and the clock changes are handled automatically. | The library is in England. | NFR, Must. | Owner |

## 6. What remains open

**No open questions block the work.** Every round-1 question has an adopted default, and every other point has a default in §5.

What remains is confirmation:
- The owner confirms or changes the defaults, starting with the five in §1.
- The specialists in §5 confirm their facts during the owner's review of the specification.

The requirements specification carries these as assumptions, each marked "to be validated" and naming who validates it.

## 7. Gaps reviewed: why there is no round 2

I checked each default for gaps that would change the requirements materially, that only the owner could close, and that research couldn't settle. None meets all three tests.

| Possible gap | Why another question isn't needed |
|---|---|
| The library management system isn't named (Q-8) | The requirement is neutral about the product: SIP2 or the supplier's interface, with suppliers proving compatibility. Library systems staff can name the system during review, and it doesn't change any requirement. |
| No budget figure (Q-6) | The owner approved "no fixed budget". The priorities keep the Musts low-cost, and separate prices for each extra let the owner decide once quotes are in. |
| No values for the stricter peak rules (Q-4) | These are settings the library chooses later. The requirement is that staff can set them and switch them on and off. |
| No front-desk workload target (Q-1) | It's tracked through the share of bookings that staff make, which the 60% target already covers. A separate staff-time target would need time-recording that nobody has asked for. |
| How many member records hold an email address (Q-11) | That's a fact from a system report, not an owner decision (AS-20). The specification records what changes if coverage turns out to be low. |
| Details of each room (Q-15) | This is set-up data that the library supplies before configuration. It doesn't change the requirements. |

## 8. Risks noted during elicitation

These go into the specification's risk register with mitigations.

1. **Weak baseline.** Desk records may not show reliably which bookings went unused, which weakens the before-and-after comparison (Q-1). Mitigation: record how the baseline is worked out, and use the system's first full month as a second reference point.
2. **Tight timeline.** The purchase, set-up, the connection to the library management system, testing and training must all be done by 1 March 2027 (Q-6).
3. **The library-system interface.** The library-system supplier may charge for its interface, or be slow to enable it (Q-8).
4. **Check-in abuse.** A photographed QR code could be used to check in from somewhere else (Q-9).
5. **Members excluded.** Members without a smartphone, an email address or internet access could be left out. Mitigation: staff booking and staff check-in stay available (Q-5, Q-9).
6. **Unfair suspensions.** A failed check-in could wrongly count as a no-show. Mitigation: staff can correct no-shows and lift suspensions (Q-2).
7. **Reminders reach too few members.** Low email coverage would weaken the effect of reminders (AS-20).

## 9. Where each item goes in the specification

| Source | Lands in |
|---|---|
| B-1, B-2, Q-1 | Business requirements (targets); reporting requirements; transition (baseline) |
| B-3 | Non-functional (capacity, speed); business rules (peak rule set) |
| B-4 | Non-functional (accessibility); transition (accessibility statement) |
| B-5, Q-3, Q-8 | Functional (sign-in, eligibility); constraints; dependencies |
| B-6, Q-7 | Specification format; procurement constraints; research alternatives |
| Q-2, AS-03 to AS-06 | Business rules (check-in, release, suspension); functional (staff corrections, notifications) |
| Q-4, AS-01, AS-02, AS-08 | Business rules (booking limits); functional (configuration, opening hours, blocking) |
| Q-5, AS-07, AS-18, AS-22 | Functional (staff booking, live calendar, walk-in, availability view, roles); transition (diary migration) |
| Q-6, AS-17 | Constraints (date, off-the-shelf, pricing); transition (training); non-functional (support) |
| Q-9, AS-09, AS-21 | Functional (check-in); non-functional (browser-based); dependency (signal) |
| Q-10, AS-11 to AS-16, AS-23 | Non-functional (security, privacy, availability, speed, data location, time); constraints (contract, exit) |
| Q-11, AS-20 | Functional (confirmation, reminder, cancellation, text messages); assumption (email coverage) |
| Q-12, Q-15 | Scope in and out; functional (room details, adding rooms) |
| Q-13, Q-14, AS-19 | Stakeholders and user groups; transition (user testing, equality assessment) |
| AS-10 | Constraints (language) |

## Change log

| Date | Change |
|---|---|
| 10 October 2026 | Round 1 consolidated. The owner approved all 15 defaults. 23 unasked defaults were added. No round 2. |
