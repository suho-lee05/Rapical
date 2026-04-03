You are working inside the existing Figma Make file for “Rapicial” MVP UI.
Do NOT start from scratch. Audit the current design and upgrade it.
Goal: Toss-like clean UI + Green accent + Pretendard + messenger-inspired usability (KakaoTalk/Discord/Telegram/Bubble inspired, not copied).
Both Attendee and Admin must be mobile-first AND responsive web (mobile/tablet/desktop).

========================================================
A) AUDIT FIRST (create a short checklist panel inside the file)
========================================================
1) Identify inconsistencies in:
- spacing (8pt grid), corner radius, shadows, borders
- typography usage (Pretendard styles)
- color usage (green accent overuse, contrast issues)
- component duplication (same patterns not using components)
2) List top 10 quick UI fixes and apply them.

========================================================
B) REFACTOR INTO A REAL DESIGN SYSTEM (must do)
========================================================
Create a “Design System” page and convert repeated UI into components + styles:
- Typography styles: H1/H2/H3/Body/Caption/Micro (Pretendard)
- Color tokens: BG/Surface/Text/Subtext/Border/Primary(Green)/PrimarySoft/Urgent/Success/Warning/Error
- Components (variants required):
  - App Bar (title/back/search/overflow)
  - Bottom Tab Bar (Attendee: Feed/Ask/My Q ; Admin: Inbox/Posts/Create/Tools/Settings)
  - Card: Announcement (normal/pinned/urgent/updated), Ticket (status+unread)
  - ChatList Row (Kakao-like scanability: title, preview, time, unread)
  - Status Badge: New/In progress/Answered/Published/Closed
  - Tag Chip: Schedule/Booth/Lost&Found/Location/Ticket/Other
  - Reaction row (Discord-like) with active state + counts
  - Poll card (single/multi + close timer + results state)
  - Inputs: field/textarea/OTP (event code)
  - Radio group: Private vs Publish
  - Toast/Snackbar
  - Banner: Offline/Reconnecting/Read-only
  - Bottom sheet + modal (quick actions)
  - Skeleton loaders + empty states
Ensure ALL screens use components (replace duplicates).

========================================================
C) UPGRADE THE MVP UX (make it “demo-ready”)
========================================================
Attendee improvements:
1) Feed top must include:
- Search bar (not only icon) OR prominent search entry
- Quick Actions row (Schedule / Map / Ask / Lost&Found)
- Pinned section that feels like a mini dashboard:
  - “Now / Next” schedule summary card (agenda snippet)
  - “Map & Gates” card
  - “FAQ Top 5” toggle card
2) Add read/unread indicator for new announcements (Telegram-like channel feel).
3) Announcement detail must support MVP blocks: headings, bullets, divider, toggles, table, agenda list, map link, image.
4) Ask screen:
- While typing show “Suggested answers (3–5)” with actions:
  - Open
  - This solved it (shows success toast and returns to Feed)
- Provide example question chips for speed: “Fireworks time?”, “Where is Gate B?”, “Lost item”, “Re-entry?”
5) My Q:
- Make it feel like a private DM thread (Bubble vibe):
  - message bubbles, timestamps, unread replies
  - if a reply is published: show “Published to FAQ” banner + open link

Admin improvements (mobile-first):
1) Inbox:
- Use chat-list rows + unread
- Add swipe or quick actions: Reply / Publish / Close / Mark In progress
2) Ticket detail:
- Show “Similar questions (stack)” module (Discord threads vibe)
- Show “Suggested FAQs” module (similarity)
- Add Quick Reply templates row (4 buttons):
  - Schedule link, Map link, Lost&Found steps, Re-entry policy
- Reply composer:
  - Default visibility = Private (prevent mistakes)
  - Publish to FAQ as explicit choice
- After publishing, show the created public post preview card.
3) Posts + Create:
- Keep editor lightweight (markdown + insert block buttons)
- Add “Urgent / Pinned / Updated” toggles consistently.

========================================================
D) RESPONSIVE WEB (must create tablet + desktop versions for key screens)
========================================================
Create 3 breakpoints:
- Mobile 390
- Tablet 834
- Desktop 1440
Key responsive frames required:
1) Attendee Feed:
- Tablet/Desktop: left column for Pinned/Tags, center feed list, sticky Ask button
2) Admin Inbox:
- Tablet/Desktop: split view (list left, detail right)
3) Admin Post Editor:
- Tablet/Desktop: editor left, preview right
Use Auto Layout + constraints so resizing works.

========================================================
E) ADD DIVERSE SAMPLE CONTENT (for realistic demo)
========================================================
Populate the UI with rich sample content:
Event: “Rapicial Demo Festival 2026” (Mar 28–29, 2026, Main Campus / Stadium Zone)
Pinned posts (3): Today Schedule, Map & Gates, FAQ Top 5 (toggles)
Latest posts (at least 10):
- URGENT: Weather change / stage moved
- Updated: Shuttle bus route updated
- Lost & Found instructions
- Queue guidance
- Re-entry policy
- Booth coupon stamp tour
- Two poll posts (one single-select, one multi-select)
Tickets (at least 12):
- Include repeated/similar questions (fireworks time variants) to demo similarity & publish-as-FAQ
- Include Lost&Found and Location types

========================================================
F) BUILD A GUIDED DEMO PROTOTYPE (must)
========================================================
Create a “Demo / Start Here” page with 2 big buttons:
- Demo as Attendee
- Demo as Admin
Add a short numbered demo script and wire prototypes:
1) Attendee Join -> Feed -> open pinned schedule
2) Attendee Ask “fireworks time?” -> see suggested answer -> tap “This solved it” (toast)
3) Attendee Ask another question -> Send -> My Q
4) Admin Inbox -> open ticket -> send Private reply
5) Admin publishes another ticket as FAQ -> verify Attendee Feed shows new post
6) Attendee reacts 👍 and votes in poll
7) Show Offline/Reconnecting banner frames (optional quick jump)

Keep everything minimal, clean, fast, and consistent with Toss-like UI.
Finish by ensuring naming is clean and components are used everywhere.