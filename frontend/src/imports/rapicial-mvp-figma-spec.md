You are designing a lightweight MVP UI in Figma for a product called “Rapicial”.
Rapicial is an event operations tool: a one-way announcements feed + private Q inbox (tickets).
Goal: clean, minimal, “Toss-like” UI. Primary accent color: Green family. Font: Pretendard.

=== 0) Global Design System (Must create components + styles first) ===
Brand:
- Name: Rapicial (use English labels primarily; optional Korean helper text in small caption if needed)
- Tone: friendly, clear, concise, operational

Typography (Pretendard):
- Use Pretendard Variable / Pretendard (set as the default text style)
- Type scale:
  - H1 24/32 Semibold
  - H2 20/28 Semibold
  - H3 16/24 Semibold
  - Body 14/22 Regular
  - Caption 12/18 Regular
  - Micro 10/14 Regular
- Numbers and time should be readable (use tabular numerals if available)

Color tokens (Green accent, Toss-like neutrals):
- Background: near-white (very light gray)
- Surface/Card: white
- Text: near-black
- Subtext: medium gray
- Border/Divider: light gray
- Primary: Green 600
- Primary hover: Green 700
- Primary soft background: Green 50/100
- Error: red
- Warning: amber
- Success: green
- Urgent highlight: green + subtle icon/badge (NOT harsh red unless error)
Use soft shadows and subtle borders; avoid heavy gradients.

Layout & Spacing:
- 8pt spacing system
- Mobile: 375x812 frames (iPhone size), safe area respected
- Admin desktop: 1440 width, responsive down to 1024
- Use Auto Layout everywhere, consistent paddings (16/20/24), rounded corners (12–16)
- Keep UI lightweight: no heavy illustrations; use simple icons.

Core UI Components (create as variants):
- Top App Bar (title, back button, optional search icon)
- Bottom Tab Bar (Feed / Ask / My Q) with icons
- Buttons: Primary / Secondary / Ghost / Destructive, sizes (L/M/S), loading state
- Text field: normal/error/helper, prefix/suffix icons
- Textarea (question input)
- Chips: Category chip, Filter chip, Tag chip
- Badges: status (New, In progress, Answered, Published, Closed), urgent badge
- Card: standard announcement card, ticket card
- List item: with title + meta + chevron
- Toggle switch, Radio group
- Reaction row: emoji buttons with count + active state
- Poll card + poll options (single/multi) + close timer
- Empty states (minimal icon + message + CTA)
- Toast/snackbar (success/error)
- Modal / Bottom sheet (for quick actions on mobile)
- Skeleton loading placeholders

Naming convention:
- Pages: “PWA / …” and “Admin / …”
- Components: “C / …”
- Styles: “T / …” “C / …”

=== 1) Product Structure ===
Create two experiences:
A) Attendee PWA (mobile-first, installable PWA feel)
B) Admin Console (desktop web app)

=== 2) Attendee PWA Screens (MVP) ===
Create these mobile frames with prototypes between them:

(1) PWA / Join (QR Landing)
- Header: Rapicial wordmark
- Event card: Event name (e.g., “Rapicial Demo Festival”), date/time, location
- Inputs:
  - Display Name (placeholder: “Nickname”)
  - Toggle: “Anonymous mode” (on/off). If on, show “Anonymous ####” preview
  - Optional: “Event code” (4–6 digits) field hidden behind “Have a code?” link
- CTA Primary: “Enter Event Space”
- Secondary: “View Announcements (Read-only)”
- Micro: “No install. Works in browser.”

(2) PWA / Feed (Announcements)
- Top app bar: “Announcements” + search icon
- Section: Pinned
  - Pinned cards: “Schedule”, “Map”, “FAQ quick list”
- Section: Latest
  - Announcement cards:
    - Title, tags, time
    - Urgent style variant (badge + subtle tinted left border)
    - Block preview (1–2 lines), “Open” chevron
    - Reaction row (👍 ✅ 🔥) with counts
    - Optional poll card inline
- Floating CTA (or top button): “Ask a question” leading to Ask tab
- Bottom tab bar: Feed / Ask / My Q
- Empty state when no posts: “No announcements yet.”

(3) PWA / Announcement Detail
- Title, tags, published time, optional urgent badge
- Content as simple blocks (MVP rendering):
  - Headings, bullets, divider
  - Toggle blocks (collapsible sections)
  - Simple table block
  - “Timetable” as agenda list blocks
  - “Map link” block (button: “Open map”)
  - Image block placeholder
- Reaction row with emoji
- If post contains poll: show poll interaction + results state (if public)

(4) PWA / Ask (Question Composer)
- Top: “Ask”
- Textarea: “Type your question…”
- Category chips (optional): Schedule / Booth / Lost & Found / Location / Ticket / Other
- While typing: “Suggested answers” module (AI similarity UX)
  - Show 3–5 suggested FAQ/announcements cards
  - Buttons on each: “Open” / “This solved it”
- Bottom CTA:
  - Primary: “Send question”
  - Secondary: “Solved (don’t send)”
- After sending: small success toast “Sent to host”

(5) PWA / My Q (My Tickets)
- List of user’s tickets only
- Each ticket item: question preview, status badge, time, “View”
- Ticket detail view:
  - User question (card)
  - Host reply (private reply) if exists
  - If reply was published as FAQ: show “Published to FAQ” link to the public post

(6) PWA / Search
- Search input: “Search announcements & FAQs”
- Results: Posts (cards) and FAQs (tagged)
- No results empty state with hint

Prototype connections:
- Join -> Feed
- Bottom tabs switch between Feed / Ask / My Q
- Feed card -> Announcement Detail
- Ask “Open suggested answer” -> Announcement Detail
- Ask send -> My Q (or remains with toast)
- Search icon -> Search screen

=== 3) Admin Console Screens (MVP) ===
Create these desktop frames (1440) with a left sidebar and top bar:

(1) Admin / Login
- Minimal form (email + password) OR “Magic link” (choose one, keep simple)
- Branding: Rapicial
- CTA: “Sign in”
- Small note: “Admin only”

(2) Admin / Dashboard (Inbox List)
Layout:
- Left sidebar: Inbox, Posts, Polls, Users (optional), Analytics (optional), Settings
- Top bar: Event selector dropdown (Event Space), search, admin avatar

Inbox main:
- Tabs/filters: New / In progress / Answered / Published / Closed
- Ticket list table:
  - Status badge, question preview, category, created time, “Assigned to”
- Right side panel (or detail page): show ticket preview on select
- Bulk actions minimal: “Mark as In progress”, “Close”

(3) Admin / Ticket Detail (Core MVP)
- Ticket header:
  - Status badge, category chips, created time
  - User label: “Anonymous ####” or display name
- Ticket content card (question)
- “Suggested FAQs” module (similarity):
  - List of recommended posts/FAQs with quick actions:
    - “Reply with link (Private)”
    - “Publish as FAQ (Public)”
- Reply composer:
  - Textarea for reply
  - Radio group: Visibility
    - Private reply (only questioner)
    - Publish to FAQ (public post)
  - Tag selector (Schedule / Booth / Lost&Found / Location / etc.)
  - Actions:
    - Primary: “Send reply”
    - Secondary: “Save draft”
    - Optional: “Mark as answered”
- After Publish to FAQ: show auto-created post preview link

(4) Admin / Posts (Announcements)
- List of posts:
  - Pinned badge, urgent badge, tags, published time
- CTA: “Create post”

(5) Admin / Post Editor (Lightweight, MVP)
- Title input
- Tag chips
- Toggles: Pinned / Urgent
- Content editor (MVP):
  - Markdown textarea + simple “Insert block” buttons:
    - Heading, Bullets, Divider, Toggle, Table, Image, Timetable item, Map link
  - Preview panel on right (or toggle preview)
- Buttons:
  - Primary: “Publish”
  - Secondary: “Save draft”
  - Optional: “Schedule” (can be disabled/coming soon)

(6) Admin / Poll Builder (MVP)
- Question input
- Options list (add/remove)
- Toggle: Single / Multi select
- Close time picker (simple)
- Toggle: Results public
- Publish poll (creates a post card)

(7) Admin / Users & Moderation (Optional for MVP, simple)
- List of users/sessions
- Actions: Mute / Ban / Unban
- Minimal confirmation modal

(8) Admin / Analytics (Optional, simple)
- Cards:
  - Total questions, avg first response time, published FAQ count
  - Top searched keywords (placeholder)
  - Duplicate deflection rate (placeholder)
Keep it minimal.

=== 4) Visual Style Requirements (Toss-like) ===
- Clean white cards, subtle shadows, generous spacing
- Rounded corners, minimal icon usage
- Green accent for primary actions and highlights
- Avoid clutter: fewer borders, more whitespace
- Use consistent card patterns for posts and tickets
- Ensure accessibility: contrast, readable font sizes

=== 5) Deliverables ===
- A small design system page:
  - Colors, typography, components with variants
- Mobile PWA frames + prototypes
- Desktop Admin frames + prototypes
- All frames ready for handoff:
  - Auto layout, constraints, consistent naming
  - Components used instead of duplicated elements

Start by creating the design system and components, then build PWA screens, then Admin console screens.