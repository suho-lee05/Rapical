You are designing a lightweight MVP UI in Figma for a product called “Rapicial”.
Rapicial is an event operations messenger: one-way announcements feed + private Q inbox (tickets).
Design goal: clean, minimal, “Toss-like” UI with Green accent, Pretendard font.
Also incorporate the BEST interaction patterns from KakaoTalk, Discord, Telegram, Bubble (inspired, NOT copied):
- KakaoTalk: fast scanability, chat-list rows, unread badges, simple bottom tabs
- Telegram: channel-like broadcast feed, pinned posts, strong search
- Discord: reactions, tags/roles, moderation patterns, “similar threads” feel
- Bubble: host-to-many broadcast + private 1:1 replies that feel like a DM

IMPORTANT UPGRADES:
- Admin Console MUST be mobile-first screens too (Admin PWA), and also responsive to tablet/desktop.
- Provide MORE diverse sample content and a clear “feature demo” prototype flow.
- The prototype should demonstrate: join, view pinned posts, ask with suggested answers, send ticket, admin reply private, admin publish as FAQ, reactions, poll voting, search, moderation action, offline/reconnect banner.

========================================================
0) GLOBAL DESIGN SYSTEM (Create first)
========================================================
Brand:
- Name: Rapicial (English labels primarily; small Korean helper text allowed as caption)
- Accent: Green family, Toss-like neutrals
- Font: Pretendard (default everywhere)

Typography (Pretendard):
- H1 24/32 Semibold
- H2 20/28 Semibold
- H3 16/24 Semibold
- Body 14/22 Regular
- Caption 12/18 Regular
- Micro 10/14 Regular

Color tokens:
- BG: very light gray
- Surface: white
- Text: near-black
- Subtext: gray
- Border: light gray
- Primary: Green 600
- Primary hover: Green 700
- Primary soft: Green 50/100
- Success: green
- Warning: amber
- Error: red
- Urgent highlight: green-tinted accent edge + “URGENT” badge (avoid harsh red unless error)

Layout:
- 8pt spacing system
- Cards radius 14–16, buttons radius 12–14
- Soft shadows, minimal borders, generous whitespace
- Auto Layout everywhere + responsive constraints

Icons:
- Minimal outline icons, consistent stroke weight

========================================================
1) RESPONSIVE STRATEGY (Mobile-first + Responsive Web)
========================================================
Create frames for breakpoints:
- Mobile primary: 390x844
- Tablet: 834x1194
- Desktop: 1440x900

Responsive behavior:
- Mobile: bottom tabs for Attendee AND Admin
- Tablet/Desktop:
  - Attendee: top bar + optional left “Pinned/Tags” column
  - Admin: split view (Inbox list left, detail right) like modern inbox tools
Use Auto Layout and constraints so cards and lists reflow naturally.

========================================================
2) COMPONENT LIBRARY (C / …) + STATES (Variants)
========================================================
Create reusable components with variants:
- C / App Bar (title, back, search, overflow)
- C / Bottom Tabs (Attendee: Feed/Ask/My Q ; Admin: Inbox/Posts/Create/Tools/Settings)
- C / Quick Actions Row (Schedule/Map/Ask/Lost&Found)
- C / Card / Announcement (normal/pinned/urgent/updated)
- C / Card / Ticket (new/in progress/answered/published/closed + unread)
- C / Row / ChatList (Kakao-style: avatar/initial, title, preview, time, unread badge)
- C / Badge / Status (New, In progress, Answered, Published, Closed)
- C / Chip / Tag (Schedule, Booth, Lost&Found, Location, Ticket, Other)
- C / Reaction Row (👍 ✅ 🔥 ❓ with counts + active state)
- C / Poll Card (single/multi, close timer, results states)
- C / Inputs (text field, textarea, OTP code input)
- C / Radio group (Private vs Publish)
- C / Toast/Snackbar (success/error)
- C / Banner (Reconnecting/Offline, Read-only mode)
- C / Modal + Bottom Sheet (quick actions)
- C / Skeleton loaders
- C / Empty states (minimal icon + message + CTA)

Add these UI states explicitly:
- Read/unread indicators for posts and replies
- Loading, empty, error, offline/reconnecting

========================================================
3) SAMPLE DATA (Must populate screens for demo realism)
========================================================
Create a “Demo Event Space” and populate with diverse content:

Event:
- Name: “Rapicial Demo Festival 2026”
- Date: “Mar 28–29, 2026”
- Location: “Main Campus / Stadium Zone”
- Host: “Rapicial Crew”

Pinned posts (3):
1) “Today Schedule (Timetable)”
   - Agenda list blocks: Opening, Main Stage, Booth Hours, Fireworks time
2) “Map & Gates”
   - Map link button + “Gate A / Gate B” text
3) “FAQ Quick (Top 5)”
   - Toggle blocks for common Qs

Latest posts (at least 8, varied types):
- URGENT: “Weather change: Main stage moved indoor” (urgent badge + tinted edge)
- Updated: “Shuttle bus route updated” (updated label)
- Info: “Booth coupon event: stamp tour”
- Safety: “Lost & Found instructions”
- Operations: “Queue guidance: Food trucks”
- Policy: “Re-entry policy”
- Poll post: “Which stage are you going to now?” (single select, closes in 30 min)
- Poll post: “Need more water stations?” (multi select, results public)

Tickets (at least 10, varied categories + similar questions):
- Schedule: “What time does the fireworks start?”
- Schedule: “Fireworks time please” (similar to above)
- Location: “Where is Gate B?”
- Lost&Found: “I lost my AirPods near Booth 12”
- Booth: “Is Booth 7 giving freebies?”
- Ticket: “Can I re-enter after leaving?”
- Other: “Is there a quiet zone?”
Include “Similar questions (3)” cluster in Admin detail for at least one ticket.

Suggested answers dataset:
- Ensure Ask screen shows 3–5 suggested posts/FAQs while typing “fireworks” or “gate”.

========================================================
4) ATTENDEE PWA (Mobile-first) — Pages “Attendee / …”
========================================================
Create these screens and prototype them. Must feel like Telegram channel reading + Kakao clarity + Discord reactions + Bubble-like private thread.

(1) Attendee / Join (QR Landing)
- Rapicial wordmark
- Event summary card with date/location
- Display Name input (placeholder “Nickname”)
- Toggle: Anonymous mode (shows “Anonymous ####” preview)
- Link: “Have an event code?” expands OTP 4–6 digit input
- Primary CTA: “Enter Event Space”
- Secondary CTA: “View Announcements (Read-only)”
- Micro: “No install. Works in browser.”

(2) Attendee / Feed (Announcements)
- App bar: “Announcements” + search icon
- Quick Actions Row (4 buttons): Schedule / Map / Ask / Lost&Found
- Pinned section (compact): 3 pinned cards
- Latest section:
  - Announcement cards with: title, tags, time, preview
  - Urgent card variant clearly stands out
  - Reaction row under each card (Discord-style)
  - Poll card embedded where relevant
- Add “New” dot/read indicator for unread posts (Telegram vibe)
- Bottom tabs: Feed / Ask / My Q

(3) Attendee / Announcement Detail
- Title, tags, time, urgent/updated badge if applicable
- Render blocks: headings, bullets, divider, toggles, table, agenda list, map link, image placeholder
- Reaction row + poll interaction (if present)

(4) Attendee / Ask (Question Composer + Deflection)
- Textarea: “Type your question…”
- Category chips
- While typing show “Suggested answers” module:
  - 3–5 cards with buttons: “Open” / “This solved it”
- Add a “Solved” flow:
  - If “This solved it” clicked → show success toast + mark as solved + return to Feed
- CTA sticky bottom:
  - Primary: “Send question”
  - Secondary: “Solved (don’t send)”
- After sending show toast “Sent to host” and route to My Q

(5) Attendee / My Q (Private DM-like thread)
- List view using ChatList rows:
  - ticket preview, status badge, time, unread badge when reply arrives
- Ticket detail:
  - My question bubble
  - Host reply bubble (private)
  - If published: “Published to FAQ” banner + “Open public post” button

(6) Attendee / Search
- Search input fixed at top
- Results grouped: Pinned / Announcements / FAQs
- Tag filter chips (Schedule/Location/Lost&Found/etc.)

(7) Attendee / System States (small set)
- Offline banner: “Offline — showing cached pinned posts”
- Reconnecting banner: “Reconnecting…”

Prototype connections (Attendee):
- Join -> Feed
- Feed quick actions:
  - Schedule -> Announcement Detail (pinned schedule)
  - Map -> Announcement Detail (pinned map)
  - Ask -> Ask screen
  - Lost&Found -> Announcement Detail (lost&found post)
- Feed card -> Announcement Detail
- Search icon -> Search screen
- Ask:
  - “Open” suggestion -> Announcement Detail
  - “This solved it” -> toast + back to Feed
  - “Send question” -> My Q + toast
- My Q ticket -> ticket detail

========================================================
5) ADMIN PWA (Mobile-first + responsive) — Pages “Admin / …”
========================================================
Admin must look and behave like a mobile operations console.
Use bottom tabs on mobile. Make responsive tablet/desktop split views too.

(1) Admin / Login (mobile)
- Minimal form + “Admin only” note
- CTA: “Sign in”

(2) Admin / Inbox (mobile)
- Bottom admin tabs: Inbox / Posts / Create / Tools / Settings
- Filter chips: New / In progress / Answered / Published / Closed
- Ticket list as ChatList rows (Kakao clarity):
  - status badge, category chip, preview, time, unread
- Row quick actions via overflow or swipe:
  - “Reply”, “Publish”, “Close”, “Mark In progress”

(3) Admin / Ticket Detail (mobile) — Fast resolution UX
- Header: status badge, category chip, created time, user label (Anonymous ####)
- Ticket content card
- “Similar questions” stack module (Discord threads vibe):
  - show 2–3 similar tickets with “Open”
- “Suggested FAQs” module (similarity):
  - each suggestion has actions:
    - “Reply with link (Private)”
    - “Publish as FAQ (Public)”
- Quick Reply templates row:
  - “Schedule link”, “Map link”, “Lost&Found steps”, “Re-entry policy”
- Reply composer:
  - textarea
  - radio: Private reply vs Publish to FAQ (default Private)
  - tags selector
  - Primary: “Send”
  - Secondary: “Save draft”
- After Publish:
  - show a “Created public post” card with link to post detail

(4) Admin / Posts (mobile)
- List of posts with pinned/urgent/updated badges
- CTA: “Create post”

(5) Admin / Create Post Editor (mobile, lightweight MVP)
- Title input + tag chips
- toggles: Pinned / Urgent / Updated label
- Content editor:
  - Markdown textarea
  - “Insert block” mini toolbar buttons:
    - Heading, Bullets, Divider, Toggle, Table, Image, Timetable item, Map link
  - Preview toggle (simple)
- Actions: Publish / Save draft

(6) Admin / Poll Builder (mobile)
- question input
- options list add/remove
- single/multi toggle
- close timer
- results public toggle
- Publish poll (creates a post)

(7) Admin / Tools (mobile)
- Moderation essentials:
  - User/session list
  - actions: Mute / Ban / Unban
  - Rate limit toggle (e.g., “1 question per 30s”)
  - Link restriction toggle
- confirmation modals

(8) Admin / Responsive Tablet/Desktop (Key Frames)
Create tablet+desktop versions for:
- Admin Inbox (split view): list left, detail right
- Admin Post Editor: editor left, preview right
- Admin Posts list: wider cards with filters left

Prototype connections (Admin):
- Login -> Inbox
- Inbox row -> Ticket detail
- Ticket detail:
  - “Reply with link” -> inserts a link-style reply + toast “Sent”
  - “Publish as FAQ” -> creates post + routes to post preview + toast
- Create post -> publish -> visible in Attendee Feed (simulate by linking to Attendee Feed frame)

========================================================
6) DEMO MODE (Must build a guided prototype)
========================================================
Create a small “Demo / Start Here” page with 2 big buttons:
- “Demo as Attendee”
- “Demo as Admin”
And a short step-by-step checklist for the demo flow:
1) Join -> Feed -> open pinned schedule
2) Ask “fireworks time?” -> see suggested answer -> mark solved
3) Ask another question -> send -> check My Q
4) Admin Inbox -> open ticket -> reply private
5) Admin publishes as FAQ -> attendee sees it in Feed
6) Attendee reacts 👍 and votes in poll
7) Show offline/reconnecting banner states quickly (optional frames)

========================================================
7) DELIVERABLES
========================================================
- Design System page with tokens and components (variants)
- Attendee mobile-first PWA screens + prototypes
- Admin mobile-first PWA screens + prototypes
- Tablet/Desktop responsive versions for key screens
- Rich sample content everywhere so the UI feels real and demo-ready
- Consistent naming + auto layout + constraints for handoff

Start with design system & components, then Attendee mobile screens, then Admin mobile screens, then tablet/desktop responsive frames, then wire the Demo Mode prototype.