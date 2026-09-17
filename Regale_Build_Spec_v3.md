# Regale — Room Service Dispatch Dashboard
### Build Specification v3 — Final Handoff

> **How to use this file.** The screens described here were designed manually in Figma and are the **source of truth for visual direction**. Match the layout, hierarchy, colors, type, and interaction patterns exactly. Product logic and behaviors are specified alongside so the build is functional, not just a mockup. Data and copy can be swapped later; the look and structure should not drift.

---

## 0. Intent

**Regale** is a B2B hotel room-service dispatch dashboard, tagline *"Room Service. Elevated."*

A **Coordinator** (e.g. Alex Rivera) uses it to monitor live guest requests across 12 floors, catch SLA breaches before they happen, and batch nearby requests into **trips** assigned to **servers**. AI assists by suggesting optimized trips.

**Core mental model:** requests arrive → they age against a promise time (SLA) → the coordinator groups nearby requests into a trip → assigns a free server → the server runs the trip.

**The hero feature is the Trip Builder.** Grouping nearby-floor requests into one server trip is the entire reason this product exists. It must read as the protagonist of the interface, never as a secondary button.

**The experience:** calm, premium, clear. During a rush the screen must *reduce* the coordinator's stress. The real test is not an empty screen — it is the screen at peak load, still scannable.

---

## 1. Global Layout

Three fixed regions:

```
┌──────────────┬──────────────────────────────────┬──────────────┐
│ LEFT SIDEBAR │      CENTER CANVAS (fluid)       │  RIGHT RAIL  │
│   ~255px     │                                  │    ~290px    │
│              │  ● Live service | Tue • 08:15    │  [user chip] │
│  Brand       │ ─────────────────────────────────┴──────────────│
│              │  Command View        [KPI cluster: 22/15/3/4]   │
│  SERVER      │  ⟳ After the Rush                                │
│  PANEL       │  ● Sorted by urgency      ⧉ Floor-Cluster View  │
│              │                                                  │
│  ──────────  │  ┌──────────┬──────────┬──────────┐  QUICK ACTION│
│              │  │ BREACHED │  TO DO   │IN PROGRESS│  LIVE ALERTS │
│  KITCHEN     │  │  ● red   │ ● blue   │ ● orange │  TRIPS       │
│  READY       │  │  [cards] │ [cards]  │ [cards]  │              │
│  STRIPE      │  └──────────┴──────────┴──────────┘              │
└──────────────┴──────────────────────────────────────────────────┘
```

**Top bar** spans center + right rail: centered live-service status `● Live service | Tuesday • 08:15`, and top-right user chip (avatar + "Alex Rivera / Coordinator") with a light/dark toggle (sun/moon).

**Modals and detail panels slide in from the right**, overlaying the right rail, dimming the rest with a light scrim.

---

## 2. Visual Design System

### 2.1 Overall feel
Clean, calm, premium SaaS. Generous white space, soft rounded cards, subtle shadows, thin hairline borders. Light theme primary, dark mode toggle present. A slight decorative dotted/noise texture appears on some panel backgrounds — keep it very subtle.

### 2.2 Color tokens

```css
:root {
  /* Surfaces */
  --bg-canvas:        #FFFFFF;   /* app background — white / very light warm grey */
  --bg-panel:         #F7F8FA;   /* sidebar & rail fills */
  --surface-card:     #FFFFFF;   /* request cards */
  --border:           #E5E7EB;   /* hairline borders */

  /* Brand & primary */
  --primary:          #4F46E5;   /* indigo — primary actions, AI, accents */
  --primary-alt:      #6366F1;   /* lighter indigo */
  --primary-contrast: #FFFFFF;
  --brand-gold:       #C8A24B;   /* R monogram square */

  /* Semantic status */
  --danger:           #E5484D;   /* breach, overdue, urgent   (alt #DC2626) */
  --warning:          #F59E0B;   /* at-risk, late, cooling    (alt #F97316) */
  --success:          #16A34A;   /* free, fresh, live, on-track (alt #22C55E) */
  --info:             #2563EB;   /* to do, accepted           (alt #3B82F6) */

  /* Text */
  --text-primary:     #111827;   /* headings, request IDs */
  --text-secondary:   #6B7280;   /* meta, labels */

  /* Shape */
  --radius-card:      14px;      /* 12–16px range */
  --radius-button:    10px;
  --radius-pill:      999px;
  --shadow-card:      0 1px 2px rgba(17,24,39,.05);
  --shadow-hover:     0 4px 12px rgba(17,24,39,.08);
}
```

**Column accent colors** (kanban header dot + column tint):
- Breached Promise Time → **red**
- To Do → **blue**
- In Progress → **orange/amber**

**Color discipline:** every color carries one meaning. Status color lives on *status* (which changes), not on request *type* (which is constant). Never tint every card — calm is the default, color is earned. AI-generated things are marked with the **✦ sparkle** glyph plus indigo, so AI actions stay distinguishable even though indigo is also the general primary.

### 2.3 Typography
Modern sans-serif (Inter or similar).

| Element | Treatment |
|---|---|
| **Request ID** (`502`, `905`) | Large, bold, dark — the loudest element on each card |
| Floor tag (`F5`) + request code (`RG-4203`) | Small, muted, beside/right of the ID |
| Type + item (`Supplies - **Towel**`) | Medium weight secondary line; **item name bold** |
| Section labels (`SERVER PANEL`, `LIVE ALERTS`, `TRIPS`, `QUICK ACTION`, `KITCHEN READY STRIPE`) | ALL-CAPS, small, letter-spaced, muted |
| Page title (`Command View`, `Floor-Cluster View`) | Large, bold |

### 2.4 Status pills & badges (reused everywhere)

| Label | Color | Where |
|---|---|---|
| `BREACH` | red bg, red text | breached cards |
| `ACCEPTED` | blue tint | To Do cards |
| `ON THE WAY` | amber tint | In Progress cards |
| `AT RISK` / `BREACHED` / `TO DO` | amber / red / blue | floor-cluster rows |
| `ON TRIP` / `ROOM TASK` / `FREE` | amber / blue / green | server chips |
| `Fresh` / `Cooling` / `Urgent` | green / amber / red | kitchen stripe |
| `✦ AI CREATED` / `✦ ASSIGNED` | indigo tint | trip detail |

Pills are fully rounded. **Late timers** use a small red alarm-bell icon + `Xm Late`. **Countdowns** use `Xm left`.

### 2.5 Shape & elevation
Card radius ~12–16px. Buttons pill or ~10px radius. Primary buttons filled indigo; secondary white with border. Shadows soft, low-opacity, short spread; cards lift slightly on hover.

---

## 3. Left Sidebar

### 3.1 Brand
`R` monogram in a thin gold/tan square + `REGALE` wordmark + small-caps subtitle `ROOM SERVICE. ELEVATED.`

### 3.2 Server Panel
Header `SERVER PANEL` with a green count pill `4 servers`.

Each row: avatar (small green presence dot when active) + name + status line + status pill, with a **colored left accent bar** signalling state (amber = on trip, blue = room task, green = free).

- **Maron Chen** — `3 of 4 done` · `F11 • 1 stop left` · `ON TRIP`
- **Arun Kumar** — `Trip #13` · `F7 • R-716` · `ROOM TASK`
- **Divya Patel** — `2 of 4 done` · `F9 • 2 stops left` · `ON TRIP`
- **Karan Singh** — `Available` · `FREE`

### 3.3 Kitchen Ready Stripe
Header `KITCHEN READY STRIPE` + count pill `3`. Each row: colored food/beverage icon tile + item summary + freshness timer.

- `RM 805` — Food • 2 items — `3m` **Fresh**
- `RM 1201` — Beverage • 1 item — `5m` **Cooling**
- `RM 617` — Food • 3 items — `8m` **Urgent**

Footer link `View All Kitchen Ready ›`.

> Separate the Server Panel and Kitchen Ready Stripe with a clear divider or generous gap — they must read as two distinct groups, not one flowing region.

---

## 4. Center — Command View (default)

### 4.1 Header row
- Title `Command View`
- Toggle pill `⟳ After the Rush` (ghost by default; solid indigo when engaged — see §8)
- Right-aligned KPI cluster: `22 Live requests` · `15 At-risk` (amber) · `3 Breached` (red) · `4 To Do` (blue)
- Sub-row: `● Sorted by urgency` (green dot) left; `⧉ Floor-Cluster View` toggle right

### 4.2 Three kanban columns
Each column: header with status dot + name + count badge, then a vertical stack of cards. Column body carries a **faint tint** matching its accent.

1. **Breached Promise Time** (red, 3) — `BREACH` pill + red `🔔 Xm Late`
2. **To Do** (blue, 4) — `ACCEPTED` pill + `Xm left`
3. **In Progress** (orange, 4) — `ON THE WAY` pill + `Xm left`

**Column semantics — strict rule:** *To Do* means accepted but untouched. The moment anything is actively progressing (on the way, preparing, being fetched, kitchen wait, in-room task underway) it belongs in *In Progress*. These two must never overlap.

**Sorting rule:**
- Within **Breached** → most overdue at top
- Within **To Do** and **In Progress** → least time remaining at top
- Sorting is independent per column; columns are not sorted against each other. In Progress cards showing less time remaining than To Do cards is correct, not a bug.

### 4.3 Request card anatomy

Three proximity zones — group tightly *within* a zone, leave clear space *between* zones:

```
Zone A — Identity   [BIG ID]  [F5]                    [RG-4203]
Zone B — Task       Supplies - Towel
─────────────────── (light divider)
Zone C — Status     [BREACH]              🔔 10m Late    [ › ]
```

- **Zone A:** request ID large/bold/dark; floor tag tight beside it; **RG-code small and muted, right-aligned** — recognizable when needed, never competing.
- **Zone B:** type + **item name in bold** — this is what the coordinator actually acts on.
- **Zone C:** divided from Zone B by a light hairline; status pill left, **timer bold** on the right, chevron bottom-right.

**Sample cards** (use as mock data):

| ID | Floor | Code | Type · Item | Status | Timer |
|---|---|---|---|---|---|
| 502 | F5 | RG-4203 | Supplies · **Towel** | BREACH | 🔔 10m Late |
| 1204 | F12 | RG-4188 | Room task · **Bed Cleaning** | BREACH | 🔔 8m Late |
| 804 | F8 | RG-4192 | Meal Request · **Biryani** | BREACH | 🔔 5m Late |
| 905 | F9 | RG-4196 | Supplies · **Water Bottle** | ACCEPTED | 21m left |
| 1103 | F11 | RG-4214 | Meal Request · **Chicken fried** | ACCEPTED | 21m left |
| 1211 | F12 | RG-4181 | Meal Request · **Rice** | ACCEPTED | 24m left |
| 617 | F9 | RG-4208 | Room task · **Washroom clean** | ACCEPTED | 27m left |
| 716 | F7 | RG-4217 | Room task · **Room Cleaning** | ON THE WAY | 3m left |
| 1201 | F8 | RG-4191 | Supplies · **Tissue** | ON THE WAY | 6m left |
| 805 | F9 | RG-4185 | Meal Request · **Dalia** | ON THE WAY | 9m left |
| 306 | F11 | RG-4200 | Meal Request · **Poha** | ON THE WAY | 15m left |

*(Note the ordering above already follows the sorting rule — most overdue first in Breached, least time remaining first elsewhere.)*

### 4.4 Card interaction
- **The whole card is the click target** for opening Request Detail. The chevron is an **affordance cue only**, never the sole target — a lone chevron is too small to hit reliably during a rush.
- **Hover:** stronger border + slight lift + chevron nudges right.
- **Trip selection is a separate explicit mode** (checkbox / select mode), not the default click. An accidental detail-open is harmless; an accidental trip-selection creates a wrong trip.

### 4.5 The breach bell — deliberate, keep it
Breached cards carry an animated bell beside the timer. It is the visual proxy for an audio alert that rings **2–3 times within a 5-minute cycle**, then stops. It sits next to the time because it announces a *time* breach.

**Guard against overlap:** if several requests breach simultaneously, do not let every card ring independently. Cards animate; **audio is consolidated** through Live Alerts.

---

## 5. Center — Floor-Cluster View

The alternate center layout for building trips by geography.

### 5.1 Header
Title `Floor-Cluster View ⓘ` + `After the Rush` pill + the same 4 KPIs.
Sub-line: *"Nearby floors with active requests. Select requests to create a trip."*
Controls row: `Grouped by ▾ Nearby floors (Smart)` · `Sort by ▾ Urgency` · `Auto group ⬤` (on) · ⓘ

### 5.2 Floor groups (accordion)
Each floor is a collapsible group with a colored left bar by severity, floor label, request count, urgency label, and a right-hand summary (`1 Breached · 1 At-risk · 1 To Do`).

Expanded groups show a table — columns: `☑` · Request ID · Type (with icon) · Room · Requested At · Promise Time (with `(Xm late)` / `(Xm left)`) · Status pill.

**F12 · 3 · High urgency** — 1 Breached · 1 At-risk · 1 To Do

| ☑ | ID | Type | Room | Requested | Promise | Status |
|---|---|---|---|---|---|---|
| ☑ | 1204 | In-Room Task | 1204 | 07:55 | **08:15 (8m late)** | BREACHED |
| ☑ | 1210 | Beverage | 1210 | 08:00 | 08:20 (5m late) | AT RISK |
| ☑ | 1215 | Meal Request | 1215 | 08:10 | 08:30 (15m left) | TO DO |

**F11 · 2 · At risk** — 1103 Meal Request (08:18, 3m late, AT RISK) ☑ · 1110 Supplies (08:25, 5m left, AT RISK) ☐
**F10 · 1 · To Do** — 1008 Pickup (08:32, 17m left, TO DO) ☐
**F9 · 1 · Normal** and **F8 · 1 · Normal** — collapsed

Breached rows get a red-tinted row background; at-risk rows amber-tinted.

### 5.3 Selection bar (sticky bottom)
Appears when requests are checked:

`☑ 4 requests selected · F12 (1204, 1210, 1215) • F11 (1103) · Est. stops: 5 · Floors: 2`  →  primary button `👥 Create Trip — Assign to a free server ›`

---

## 6. Right Rail

### 6.1 Quick Action
Card containing `+ Add New Request / Create a new request`, and a full-width indigo `✦ Suggest with AI` button.

### 6.2 Live Alerts
Header `🔔 LIVE ALERTS`. Each alert: red left bar + ID + type + red overdue line + red dot.
- `1204 · In-Room Task · Overdue by 8m`
- `804 · Meal Request · Overdue by 5m`

Footer `View All Alerts ›`.

> Live Alerts is the mechanism that lets individual cards stay calm — only genuinely urgent items surface here, so the board doesn't have to shout.

### 6.3 Trips — the hero block
Header `TRIPS`. Give this block the most visual weight in the rail.

- `Trip #12` — Towel, Biryani, Rice, Clear tray — `F11, F12, F10` — ›
- `Trip #13` — Water Bottle, toast, Room task — `F7, F8` — ›

The trip card footer is **stateful** — see §7.

---

## 7. Trip Lifecycle States (right rail footer)

Reproduce all three:

1. **Created through AI** → `✦ Created through AI` + `Assign ›` button (subtle/greyed)
2. **Assign to Server** → button becomes `Assign to Server` (active)
3. **Assigned** → button becomes solid indigo `Start Trip` with the assigned server's avatar

---

## 8. "After the Rush" mode
A stateful context pill beside the page title. Default = outlined/ghost; engaged = **solid indigo**. It represents a calmer post-peak operating mode that relaxes urgency sorting and surfaces review-oriented information rather than live firefighting. Keep it prominent and clearly stateful.

---

## 9. Modals & Detail Panels (right-slide overlays)

### 9.1 Add New Request
Header `Add New Request ✕`.

1. **Request Details** — `Request Type *` (dropdown, e.g. Meal Request) · `Room Number *` (e.g. 1205) · `Floor` (e.g. F12) · `No. of Items *` (e.g. 2 items) · `Special Instructions (Optional)` textarea with `0/120` counter, placeholder *"e.g. No onions, extra napkins…"*
2. **Promise Time** — radios: `Standard (20 min)` → By 08:35 AM *(default)* · `Priority (10 min)` → By 08:25 AM · `Custom` → Select time ›
3. **Assign Server (Optional)** — dropdown `Auto assign (AI will assign)`, helper *"You can reassign later if needed."*

Footer: `Cancel` (ghost) · `Create Request` (solid indigo).

> This modal is the manual/phone channel. It must be fillable in under 15 seconds while a guest is on the line.

### 9.2 Trip Detail panel — `Trip #12`
Header `Trip #12` + `✦ AI CREATED` + `✦ ASSIGNED` badges + ✕.
Summary: `Towel, Biryani, Rice, Clear tray` · floors `F11, F12, F10`.

- **TRIP OVERVIEW** — 4 stat tiles: `3 Stops` · `1.2 km Est. Distance` · `12 min Est. Time` · `Medium Priority`
- **STOPS (3)** — numbered timeline:
  1. `F11 · Room 1103 · RG-4214` — Meal Request • 2 items — Requested at 07:34 AM
  2. `F12 · Room 1205 · RG-4218` — Beverage • 1 item — Requested at 07:36 AM
  3. `F12 · Room 1207 · RG-4219` — Supplies • 2 items — Requested at 07:37 AM
- **TRIP DETAILS** — Total Items `6 items` · Estimated Distance `1.2 km` · Estimated Time `12 min` · Priority `Medium` · Suggested At `08:14 AM` · Created By `AI Assistant`
- **ACTIONS** — `✎ Edit Trip` (ghost) · `Assign to Server ›` (primary) · and a clear way to **remove a request from the trip**

### 9.3 Select Server popover
Triggered from `Assign to Server`. Header `SELECT SERVER FOR TRIP #12 ✕`. Anchored as a small popover above the Assign button with a pointer tail.

- Maron Chen — ON TRIP
- Arun Kumar — ROOM TASK
- Divya Patel — ON TRIP
- Karan Singh — FREE

---

## 10. Behaviors & Logic

### 10.1 Triggers
- **T1** The promise clock starts when a request is **placed**, not when it's accepted.
- **T2** As promise time approaches → status escalates to **At Risk** (amber).
- **T3** When promise time passes → **Breached**: card moves to the Breached column, pins to top, bell animates, Live Alerts updates, KPI counts update.
- **T4** Kitchen marks an item Ready → it appears in the Kitchen Ready Stripe and its freshness clock starts (Fresh → Cooling → Urgent).
- **T5** Scheduled requests auto-promote onto the live board: **30 min before** their slot for Meal Requests and In-Room Tasks, **15 min before** for Supplies and Pickups.
- **T6** A server marks a step done → the request's state and that server's panel row (status, stops left) update live.
- **T7** All stops complete → server flips to **FREE**.
- **T8** A delivered meal becomes a **tray to clear** with its own waiting timer.
- **T9** Cancelling a request after it's ready → requires confirmation, logged as a wastage event.

### 10.2 Constraints
- Food cannot be dispatched before the kitchen marks it ready.
- A trip can only be assigned to a **FREE** server.
- Creating a trip must stay within **3–4 clicks**, without leaving the board.
- A request cannot skip lifecycle states.
- **One active assignment per request** — a request already on a trip cannot be added to another.

### 10.3 Urgency is relative, not fixed
Each request kind has a different promise time (Standard 20 min, Priority 10 min, custom). Urgency is driven by **percentage of promise time elapsed**, never a fixed minute count:

```
0–60% elapsed   → calm / To Do
~60% elapsed    → At Risk (amber)
100% elapsed    → Breached (red, moves column, bell)
past 100%       → deepening red, stays pinned at top
```

### 10.4 Non-visual signals
The coordinator isn't always facing the screen. Signals escalate with severity, so sound is reserved for what truly needs the ear — this prevents alert fatigue.
- **At Risk** → visual only
- **Cooling threshold** → visual pulse + subtle sound
- **Breached** → strong visual + short alert sound once; if unresolved after 5 minutes, once more; never continuous

### 10.5 Control, recovery & error states
- **Undo toast** after any assignment or trip creation — *"Trip #12 assigned to Karan · Undo"* — visible for several seconds.
- **Remove from trip** — clearly reachable in the Trip Detail panel.
- **Confirmation on risky actions** — e.g. assigning a breached request to a server who is nearly finished elsewhere.
- **Errors in plain language with a way forward**, never codes: *"Assign failed — Karan just started a trip. Choose another server →"*
- **AI suggestions are proposals** — the coordinator can dismiss or modify a suggested cluster.

### 10.6 Expert efficiency
- **Keyboard shortcuts** for frequent moves (open detail, enter select mode, create trip, assign, move between columns).
- **Bulk selection** — select several requests, assign in one action.
- **Quick filters** — breached only, a floor range, one server's work.

### 10.7 Live behavior
Timers tick live. Statuses auto-escalate To Do → At Risk → Breached as promise time approaches and passes. KPI counts derive from live request states. Selecting requests in Floor-Cluster View aggregates into the bottom selection bar (count, floors, est. stops) → Create Trip. `Suggest with AI` generates a proposed trip that lands in the Trips rail as "Created through AI". Assigning a server moves the trip to Assigned and updates that server's panel row, then Start Trip. Everything is framed as real-time — the "Live service" status is always visible.

---

## 11. Consistency Rules (previously violated — enforce these)

- **Spelling:** Regale · Server Panel · **servers** (not severs) · Panel (not Panal)
- **Floor labels always carry the F prefix** — `F10`, never bare `10`, including inside trip summaries
- **One border-radius scale, one shadow scale, one type scale** across the entire product
- **Indigo is the primary**; AI-specific things additionally carry the **✦** glyph so AI actions remain distinguishable
- **Type badges neutral, status badges semantic** — color belongs on what changes
- **One primary time signal per card** — no percentages, no progress bars, no competing numbers

---

## 12. Build Order

1. **Layout shell** — three regions, top bar, no navigation between them
2. **Request card component** — three zones, badges, timer, chevron, hover, and the %-of-promise urgency decay
3. **Mock data early** — a realistic spread across 12 floors and all request types, with mixed states (a few breached, several at-risk, the rest on-time). Never build against an empty or all-breached screen.
4. **Three kanban columns** with tints, counts, and sorting rules
5. **Left sidebar** — Server Panel + Kitchen Ready Stripe, visually separated
6. **Right rail** — Quick Action, Live Alerts, then **Trips** (most care here; it's the hero)
7. **Trip Detail panel** + Select Server popover + the three trip lifecycle states
8. **Floor-Cluster View** with accordion groups, selection, and the sticky selection bar
9. **Add New Request modal**
10. **Behaviors** — triggers, constraints, non-visual signals
11. **Control & recovery** — undo toasts, confirmations, error states
12. **Dark mode** — warm charcoal base, never pure black; same semantic hues at adjusted luminance
13. **Expert layer** — shortcuts, bulk actions, filters

### Check at every step
- Does it stay calm at full load, or has it become a wall of color?
- Do cards clearly lift off the canvas?
- Is the Trip Builder unmistakably the hero, or has it slipped back into being a button?
- Does every color on screen carry a meaning you can name?

---

## 13. Still Open (to be designed later)
- Dark mode surfaces and tokens — not yet defined
- Empty states — no breaches, no trips, no alerts
- Precise behavior spec for "After the Rush" active mode
- "View All" screens for Kitchen Ready and Alerts

---

*Design direction is the priority: match the calm premium look, the indigo/red/amber/green status language, the big-ID request cards, the three-region layout, and the right-slide modals exactly. Data and copy can be swapped later.*
