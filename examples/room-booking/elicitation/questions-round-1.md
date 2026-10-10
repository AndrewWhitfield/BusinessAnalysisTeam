# Questions for the owner — round 1

**Project:** Online study-room booking for the town library
**Prepared by:** Business Analyst, 10 October 2026
**How to answer:** Short answers are fine. If a default below suits you, reply "use the default". Any question you leave unanswered will use its default, and the requirements will mark that default as an assumption for you to validate.

**Settled by the brief, so not asked here:**
- Jurisdiction: England. Public-sector accessibility rules apply, so I will require WCAG 2.2 level AA and a published accessibility statement under the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018.
- Six study rooms, about 4,000 active members, about 300 bookings a month, with peaks in May and December.
- Members book for themselves and can see which rooms are free. Member accounts already live in the library management system.
- The output is a requirements pack to take to suppliers, with priorities and acceptance criteria.

## Goals and success

### Q-1 What would success look like in numbers (for no-shows, how many members book online, and front-desk workload), and how is today's "around a quarter" no-show figure worked out?
- Why it matters: These numbers become the measurable business requirements and acceptance targets, and they decide which reports the system has to produce to prove them. Knowing how no-shows are counted today gives us the baseline to compare the new figures with.
- If unanswered, I will assume: No-shows at or below 12% (half of today's ~25%) across the first full exam peak after launch; at least 60% of bookings made by members themselves rather than by staff; today's baseline taken from desk records of rooms booked but not used. All three figures are my placeholders for you to validate. The brief gives the problem but sets no targets.

## No-shows and booking rules

### Q-2 Which of these ways of cutting no-shows are you willing to use: (a) reminder messages, (b) "check-in", where members confirm they have arrived and the room is released to others if they don't arrive within a set time, (c) a temporary ban on booking after repeated no-shows, (d) a refundable deposit or a fee? Are any of these off limits?
- Why it matters: This is the heart of "fewer empty rooms". Each measure brings its own requirements: (a) messaging; (b) a way to check in plus automatic release; (c) a strikes-and-suspension rule with a way to appeal; (d) taking payments, which brings card-payment security rules and may put off members on low incomes.
- If unanswered, I will assume: (a) yes. (b) yes, with rooms released 15 minutes after the start time if nobody has checked in. (c) yes: three no-shows in 90 days suspends self-booking for 4 weeks, with desk booking still allowed. (d) no fees. Basis: the university libraries I reviewed release unclaimed rooms after 15–30 minutes; one public library (Regina, Canada) suspends booking for a month after repeated no-shows; reviews of hospital appointment reminders find a modest rise in attendance; I left out fees because the brief mentions no charges.

### Q-3 Who may book a room: any active member, or are there limits by age, by account status (for example unpaid charges or a blocked card), or for non-members? And are rooms free for everyone?
- Why it matters: This sets the eligibility checks the system makes at each booking. It also decides whether children's personal data needs extra handling and whether payment features are needed at all.
- If unanswered, I will assume: Any member whose account is active and not blocked in the library management system may book online. No age limit beyond what membership already allows. Non-members cannot book. Rooms are free. Basis: the brief says "members … book them themselves" and mentions no charges.

### Q-4 What are the booking rules today (opening hours, slot length, longest single booking, how far ahead members can book, how many bookings one member may hold), and may the new system change them, including stricter rules in May and December?
- Why it matters: These become the business rules the system enforces, and suppliers must let staff configure them. Alongside the no-show measures, fair-share limits at peak times are the main way to spread the six rooms across more members.
- If unanswered, I will assume: Bookable during opening hours in 1-hour slots; at most 3 hours per booking; up to 14 days ahead; at most 2 future bookings per member at any time. Staff can change all of these without the supplier's help, and a separate peak-period rule set can be switched on. Basis: university libraries cap use in similar ways (for example one session a day, or a daily hours limit). My figures are placeholders for you to validate.

### Q-5 Must phone and front-desk booking carry on alongside online booking, with staff booking for members in the same system? And should someone who walks in be able to use a room that is free or has just been released?
- Why it matters: This decides whether a staff booking screen and a walk-in "book now" route are core requirements. It also keeps the service open to members who can't or won't book online, which the library must consider under the Equality Act 2010 and its statutory duty to provide a comprehensive library service.
- If unanswered, I will assume: Yes to both. Staff book by phone and at the desk into the same live calendar, so there is one true record. Walk-ins can take any free room straight away, either through staff or by booking it themselves on the spot. Basis: Department for Culture, Media and Sport (DCMS) guidance reads "comprehensive" as accessible to all residents by reasonable means, including digital ones; Equality Act 2010.

## Budget, timing and buying

### Q-6 What budget do you have for setting the system up and for running it each year, and by what date must it be working?
- Why it matters: The budget rules options in or out: an add-on from your library-system supplier, an off-the-shelf booking service, or a custom build. It also sets where the line falls between Must and Should/Could, and it fixes the delivery milestones in the requirements.
- If unanswered, I will assume: No fixed budget. I will prioritise so that all Musts fit a low-cost, off-the-shelf subscription service, and mark costly extras (text messages, door hardware) as Should or Could. The system is live and tested by 1 March 2027, so it beds in before the May 2027 peak. Basis: about 300 bookings a month is a small, standard need; the date follows from the peak months in the brief.

### Q-7 How will the system be bought (through the council's procurement team, a public-sector framework such as G-Cloud, or direct quotes from suppliers), and does the council already have a booking platform, for example for venues or leisure, that you would be expected to use?
- Why it matters: The buying route sets the format of the requirements pack (for example pass/fail items and scored questions) and decides whether Procurement Act 2023 notices apply. For councils, those notice duties start at £30,000 including VAT. An existing council platform could be the cheapest option and must be weighed as an alternative.
- If unanswered, I will assume: A quotation exercise run with the council's procurement team. The specification names no supplier, and its Must items are pass/fail. There is no existing council platform to reuse. Basis: the brief asks for "requirements I can take to suppliers".

## Systems and the building

### Q-8 Which library management system do you use (supplier and product), who looks after it (your team, council IT or a regional consortium), and should members sign in to book with their library card number and PIN?
- Why it matters: This decides the integration requirement: how the booking system checks that a member is active, and whether members need a separate login. Some library-system suppliers sell their own room-booking module, which would be an option to compare.
- If unanswered, I will assume: Members sign in with their card number and PIN, checked live against the library management system through a standard library interface (SIP2) or the supplier's interface (API). The library-system supplier's own module is assessed alongside other products. Basis: English council libraries commonly use card number and PIN for online accounts, and at least one widely used library booking product (LibCal) lists SIP2 among its sign-in methods.

### Q-9 How do members get into a booked room today (unlocked, key from the desk, or a door code), and would you accept new equipment at the rooms, such as a printed QR code, a small screen by each door or smart locks, if it helps confirm that people have arrived?
- Why it matters: This decides how check-in can work and what equipment, building work and Wi-Fi it needs.
- If unanswered, I will assume: Rooms are unlocked. Members check in by scanning a printed QR code at the door with their own phone, or by asking staff. Door screens and smart locks are listed as options, not requirements. Basis: this is the cheapest approach and needs no building work. If keys are collected at the desk today, collecting the key could itself count as check-in.

### Q-10 Are there IT or information-governance rules the system must meet (for example whether a supplier-hosted cloud service is allowed, data kept in the UK, security certification such as Cyber Essentials, staff signing in with council accounts), and who approves them?
- Why it matters: These become security, privacy and hosting requirements and pass/fail buying criteria. A data protection impact assessment (DPIA) may be needed before go-live, and someone must own it.
- If unanswered, I will assume: A supplier-hosted service is allowed. Personal data is held in the UK or in a country covered by UK adequacy regulations. The supplier holds Cyber Essentials certification. The council's data protection officer reviews a DPIA before go-live. Staff use named accounts with multi-factor sign-in. Basis: UK GDPR and the Data Protection Act 2018, plus a common UK public-sector security baseline. To be validated with council IT.

### Q-11 Do most member records hold an email address and a mobile number, and should reminders go by email only or also by text message (SMS), given that texts cost money per message?
- Why it matters: This decides the notification channels, whether members must add contact details before booking, and the running costs.
- If unanswered, I will assume: Email confirmation with a cancellation link, plus an email reminder the day before, is a Must; text reminders are a Should if the budget allows. Basis: reviews of hospital appointment reminders show modest attendance gains from texts; email adds no cost per message.

## Scope and people

### Q-12 Should the system cover only the six study rooms in this one library, or also other spaces (meeting rooms, public computers) or other branches, now or later?
- Why it matters: This fixes scope in and out, and decides whether suppliers must show they can scale to more rooms, sites or resource types. Both affect price.
- If unanswered, I will assume: Only the six study rooms at one site are in scope. Staff must be able to add rooms or sites through settings (a Could). Other resource types are out of scope. Basis: the brief names only the six study rooms.

### Q-13 Who runs the library (the council directly, or a trust or community group on its behalf), and who must sign off the requirements and the purchase?
- Why it matters: This identifies the decision makers and approvers in the stakeholder list, who is the data controller for members' booking data, and whether public procurement law applies to the purchase.
- If unanswered, I will assume: The council runs the library as the library authority. The library service manager signs off, with council IT, the data protection officer and procurement as approvers. Basis: the brief says "a public library in England", and in England that statutory service is provided by council library authorities under the Public Libraries and Museums Act 1964.

### Q-14 Who mainly uses the rooms today (for example students revising, tutors, home workers, small groups), and do you have any complaints, surveys or feedback on what members want, or groups you especially want to serve?
- Why it matters: This shapes the user groups, room rules (group size, length of booking) and who should be consulted or included in user testing, especially disabled members, older members and people without internet access.
- If unanswered, I will assume: Most users are students revising, plus home workers and small groups. I will rely on published research for what members expect and recommend user testing that includes disabled members. Basis: the May and December peaks in the brief line up with exam periods.

### Q-15 How do the six rooms differ: number of seats, equipment (power sockets, screens), and whether each is wheelchair accessible or has a hearing loop?
- Why it matters: This decides what room information the booking pages must show and whether members can filter rooms by feature. Access details let disabled members choose the right room before they travel.
- If unanswered, I will assume: The rooms are the same apart from seat numbers, and each room's booking page shows its capacity and access details. Basis: the brief gives no differences between rooms.
