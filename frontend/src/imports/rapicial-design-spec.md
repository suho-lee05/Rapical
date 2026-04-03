You are designing a lightweight MVP UI in Figma for a product called “Rapicial”.
Rapicial is an event operations messenger: one-way announcements + private Q inbox (tickets).
Design must feel familiar by borrowing the BEST patterns from messaging apps (KakaoTalk, Discord, Telegram, Bubble) — inspired by them, NOT copied.
Style: clean “Toss-like” product UI, primary accent color Green, font Pretendard.
Build BOTH Attendee and Admin as mobile-first screens, but ensure the whole design is responsive web (mobile → tablet → desktop).

========================================================
0) GLOBAL DESIGN SYSTEM (Create first)
========================================================
Brand & Tone:
- Name: Rapicial (use English labels primarily; optional small Korean helper text in caption)
- Tone: friendly, concise, operational, minimal

Typography (Pretendard):
- Set Pretendard as default font
- Type scale:
  - H1 24/32 Semibold
  - H2 20/28 Semibold
  - H3 16/24 Semibold
  - Body 14/22 Regular
  - Caption 12/18 Regular
  - Micro 10/14 Regular

Color Tokens (Toss-like neutrals + Green):
- Background: very light gray
- Surface/Card: white
- Text: near-black
- Subtext: gray
- Border/Divider: light gray
- Primary: Green 600
- Primary hover: Green 700
- Primary soft: Green 50/100
- Success: Green
- Warning: Amber
- Error: Red
- Urgent (for announcements): Green-tinted highlight + “URGENT” badge (avoid aggressive red unless error)

Spacing & Shape:
- 8pt grid
- Cards radius 14–16, buttons radius 12–14
- Soft shadow only, subtle borders, generous whitespace
- Use Auto Layout everywhere

Icons:
- Simple, minimal icons (outline style). Don’t overuse.

========================================================
1) MESSENGER-INSPIRED UX PRINCIPLES (Must reflect these)
========================================================
Inspiration patterns to incorporate (without copying exact layouts):
KakaoTalk (clarity + speed):
- Familiar “chat list” pattern (title, preview, time, unread badge)
- Simple bottom tab navigation on mobile
- Clear unread indicators and pinned section

Telegram (channels + clean reading):
- “Channel-like” broadcast feel for announcements
- Pinned messages area + strong search entry point
- Lightweight post reading experience (fast scrolling, clean typography)

Discord (organization + reactions + moderation):
- Emoji reactions under messages/posts with counts and active state
- Role-like chips / tags (Schedule, Booth, Lost&Found, Location)
- Moderation actions (mute/ban) in Admin flows, compact and fast
- Optional “threads-like” grouping: similar questions clustered (MVP can be a simple “Similar” section)

Bubble (one-to-many + private replies + intimacy):
- Host-to-many broadcast experience that feels personal
- Private reply feels like a 1:1 DM thread (“My Q”)
- Friendly “speech bubble” styling on key message cards (subtle)

Core product rule:
- Users NEVER see other users’ questions.
- Host can reply privately or publish publicly as FAQ/Announcement.

========================================================
2) RESPONSIVE STRATEGY (Mobile-first + responsive web)
========================================================
Create frames for these breakpoints:
- Mobile: 390x844 (primary)
- Tablet: 834x1194 (iPad portrait)
- Desktop: 1440x900 (key screens only)

Responsive behavior:
- Mobile: Bottom tab bars for both Attendee and Admin
- Tablet/Desktop:
  - Attendee: top navigation + left optional sidebar for Pinned/Tags
  - Admin: split view (list on left, detail on right) like modern inbox tools
Use constraints and Auto Layout so components naturally stretch and reflow.

========================================================
3) COMPONENT LIBRARY (Create as variants)
========================================================
Components (C / …):
- App Bar (title, back, search, overflow menu)
- Bottom Tab Bar (Attendee: Feed / Ask / My Q ; Admin: Inbox / Posts / Create / Tools / Settings)
- Card:
  - Announcement Card (normal / urgent / pinned)
  - Ticket Card (new/in progress/answered/published/closed)
- Chat-list Row (messenger-style): avatar/initial, title, preview, time, unread badge
- Status Badges: New / In progress / Answered / Published / Closed
- Tag Chips: Schedule, Booth, Lost&Found, Location, Ticket, Other
- Buttons: Primary / Secondary / Ghost / Destructive (L/M/S + loading)
- Inputs: Text field, Textarea, OTP/Event code input
- Toggle switch + Radio group (Private vs Publish)
- Reaction row: emoji buttons with count
- Poll card: single/multi select, close timer, results states
- Toast/Snackbar
- Modal + Bottom sheet (quick actions)
- Skeleton loading + empty states

Styles:
- T / Typography styles
- C / Color styles

========================================================
4) ATTENDEE EXPERIENCE (Mobile-first PWA)
========================================================
Create these screens under pages named “Attendee / …” and prototype them.

(1) Attendee / Join (QR Landing)
- Rapicial wordmark + event card (name, date/time, location)
- Display Name input
- Anonymous toggle (if on, show “Anonymous ####” preview)
- Optional: “Have an event code?” expands an OTP 4–6 digit field
- Primary CTA: “Enter Event Space”
- Secondary: “View Announcements (Read-only)”
- Micro copy: “No install. Works in browser.”

(2) Attendee / Feed (Announcements) — Telegram Channel + Kakao clarity
- App bar: “Announcements” + Search icon
- Pinned section (compact, always first): Schedule / Map / FAQ Quick
- Latest section: announcement cards
  - Urgent variant: badge + subtle tinted accent edge
  - Under each: reactions row (Discord style)
  - If poll exists: poll card embedded
- “Ask a question” CTA (floating or top-right button)
- Bottom tabs: Feed / Ask / My Q
- Empty state if no posts

(3) Attendee / Announcement Detail — clean reading
- Title, tags, time, urgent badge if needed
- Content blocks (MVP):
  - headings, bullets, divider
  - toggles (collapsible)
  - simple table
  - timetable as agenda list
  - map link button
  - image block
- Reaction row + poll (if present)

(4) Attendee / Ask (Question Composer) — deflect duplicates
- Textarea: “Type your question…”
- Category chips
- “Suggested answers” module while typing (AI similarity UX):
  - 3–5 cards from FAQ/Announcements
  - Buttons: “Open” / “This solved it”
- CTA area:
  - Primary: “Send question”
  - Secondary: “Solved (don’t send)”
- Success toast after sending

(5) Attendee / My Q (Private Thread) — Bubble-inspired 1:1 feel
- A messenger-like list view of only MY tickets (chat list rows):
  - preview, status badge, time, unread badge if reply arrived
- Ticket Detail:
  - My question bubble
  - Host reply bubble (private)
  - If published: “Published to FAQ” banner with link to public post

(6) Attendee / Search
- Search input
- Results grouped: Pinned, Announcements, FAQs
- No results empty state

Prototype:
- Join -> Feed
- Tabs switch: Feed / Ask / My Q
- Feed -> Announcement Detail
- Ask suggested item -> Announcement Detail
- Ask send -> My Q (or toast and stay)
- Search icon -> Search screen

========================================================
5) ADMIN EXPERIENCE (Mobile-first “Admin PWA”, responsive)
========================================================
IMPORTANT: Admin must be designed primarily as mobile screens too.
Create screens under pages named “Admin / …” with the same design language.
Also create tablet/desktop responsive versions for key screens:
- Admin Inbox (split view)
- Admin Ticket Detail
- Admin Post Editor

(1) Admin / Login (mobile)
- Minimal: email + password OR magic link (choose one)
- “Admin only” note

(2) Admin / Inbox (mobile) — Discord/Kakao organization
- Bottom admin tabs: Inbox / Posts / Create / Tools / Settings
- Inbox filters chips: New / In progress / Answered / Published / Closed
- Ticket list as “chat list rows”:
  - status badge, category chip, question preview, time, unread
- Quick actions on row (swipe or overflow): Assign / Mark In progress / Close

(3) Admin / Ticket Detail (mobile) — fastest possible answering
- Header: status badge + category + created time + user label
- Ticket content card
- Suggested FAQs module (similarity):
  - Each suggestion: “Reply with link (Private)” and “Publish as FAQ (Public)”
- Reply composer:
  - Textarea
  - Radio: Private reply vs Publish to FAQ
  - Tags selector
  - Primary: “Send”
  - Secondary: “Save draft”
- After publishing:
  - Show “Created public post” preview card with link

(4) Admin / Posts (mobile)
- List of posts (pinned/urgent badges, tags)
- CTA: “Create post”

(5) Admin / Create (mobile) — lightweight editor
- Title input
- Tag chips
- Toggles: Pinned / Urgent
- Content editor MVP:
  - Markdown textarea
  - “Insert block” quick buttons:
    - Heading, Bullets, Divider, Toggle, Table, Image, Timetable item, Map link
  - Preview toggle (simple)
- Actions: Publish / Save draft

(6) Admin / Poll Builder (mobile)
- Question input
- Options list add/remove
- Single vs Multi
- Close time
- Results public toggle
- Publish (creates poll post)

(7) Admin / Tools (mobile) — moderation essentials
- Users/Sessions list
- Actions: Mute / Ban / Unban
- Rate limit settings (simple toggles)
- Confirmation modal

(8) Admin / Settings (mobile)
- Event settings: Join mode (QR only vs QR+code), code rotate
- Roles: Admin/Moderator list (simple)

========================================================
6) RESPONSIVE DESKTOP/TABLET FRAMES (Key)
========================================================
Create responsive versions (834 and 1440) for:
- Attendee Feed: pinned sidebar on left, posts center, ask button sticky
- Admin Inbox: split view list-left, detail-right (classic inbox)
- Admin Post Editor: editor-left, preview-right

Ensure components reflow correctly using Auto Layout and constraints.
Avoid clutter; keep it fast and clean.

========================================================
7) DELIVERABLES
========================================================
- A “Design System” page with tokens + components + variants
- Mobile-first Attendee + Admin flows with prototypes
- Tablet + Desktop responsive frames for key screens
- Consistent naming, reusable components, handoff-ready constraints

Start with the design system, then Attendee mobile screens, then Admin mobile screens, then responsive tablet/desktop versions.