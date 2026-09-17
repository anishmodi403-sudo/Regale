# Regale — Iteration Instructions (for Claude Code)

The current build is strong and its structure is correct. **Do not rebuild it.** These are targeted fixes, additions, and polish. Keep the existing three-region layout, color tokens, card anatomy, kanban columns, Trip drawer, Floor-Cluster view, Add Request modal, and undo/recovery exactly as they are — only change what's listed below.

---

## 1. Fix the trip lifecycle logic (currently contradictory)

Right now a trip can show **"Start Trip"** while its assigned server is already **ON TRIP** and one of its requests is already **ON THE WAY**. That's impossible — if a request in the trip is on the way, the trip has already started.

Fix the trip state machine so it is internally consistent:

- **Created (AI or manual)** → footer shows `✦ Created through AI` + `Assign ›`
- **Assigned** (server chosen, not yet moving) → footer shows the server avatar + `Start Trip`
- **Running** (server has started / any request in it is On the Way) → footer shows a **live/running state** (e.g. "In progress · Arun" with progress), NOT "Start Trip"
- **Done** → all stops complete, server returns to Free

A trip whose requests are already "On the Way" must be in the **Running** state, never "Assigned/Start Trip."

## 2. Fix the mock data so the tool is actually operable

- **Always keep at least one server genuinely FREE** (Karan Singh = FREE by default). Right now all four servers can be busy at once, which leaves the "assign to a free server" flow with no valid target and makes the whole assign action impossible to demonstrate.
- A server shown as **ON TRIP** must actually be tied to a running trip (not "0 of 3 done" with no started trip). Keep server states and trip states consistent with each other.

## 3. Trip Detail panel — add live state + stop-by-stop progress

Inside the Trip Detail panel, add a **per-trip progress indicator** so the coordinator can see how far along a running trip is:

- A **vertical numbered timeline of the stops**, each stop marked **done (✓)** or **pending (○)** — e.g. "Stop 1 ✓ done · Stop 2 ✓ done · Stop 3 ○ pending."
- Show the trip's live state at the top (Running / Assigned / Done), matching the fixed lifecycle in §1.
- This answers "which stops are finished and which are still pending" at a glance. It serves the requests-per-trip efficiency metric and matches the live progress already shown in the Server Panel ("3 of 4 done").

## 4. Request Detail panel — three changes

**a) Add a per-request lifecycle timeline.**
A **vertical timeline** of this one request's journey: Requested → Accepted → On the Way → Completed, with each reached step filled/checked and the current step highlighted. If the request has breached, show **Breached** in red on the timeline at the point it crossed its promise time (as in the reference: Requested ● → Breached ⊘ → Accepted → On the Way → Completed). Times shown next to reached steps, "—" for steps not yet reached.

**b) Remove the "Mark Step Done" button.**
Advancing a request through its steps is done by the **server** on their own device — that is a core decision of this product (servers mark their own steps; this is what removes the radio and keeps the Server Panel live). The coordinator does **not** advance requests. So "Mark Step Done" does not belong on the coordinator's Request Detail panel. The coordinator's panel is **read-only for status** — the step updates on its own when the server marks it.
*(Optional, low priority: a tucked-away "mark done on server's behalf" override for the rare case a server's device fails — but not a primary button. Default: just remove it.)*

**c) Make "Cancel Request" conditional.**
A request that is already **On the Way / part of a running trip cannot be cancelled** from here — a server is already committed to it (for food, it's cooked/en route = waste; for supplies/room tasks, the trip route is already built around it). So:
- Show **"Cancel Request"** only while the request is **Placed or Accepted** (not yet picked up, not on a trip).
- The moment it is On the Way or on a running trip, **hide "Cancel Request."**
- To pull a live request, the coordinator uses **"Remove from trip"** in the **Trip Detail panel** (with confirmation; for food this logs a wastage event) — not a cancel button on the request.
- For a live request, the Request Detail panel is mainly informational (status, timeline, which trip, which server, "view trip"); it does not need action buttons.

## 5. Dark theme — rebuild it properly (currently unusable)

The current dark theme fails because canvas, columns, and cards are all nearly the same dark value, so nothing lifts and the column tints look muddy. Rebuild it on this rule: **elevation carries structure, color carries meaning — never smear color across whole surfaces.**

- **Three clear elevation layers, warm charcoal (never pure black, never flat near-black):**
  - Canvas = darkest warm charcoal
  - Column region = one step lighter
  - Card surface = lighter still, so cards clearly float above the columns
- **Column tints barely-there** — just enough to group Breached / To Do / In Progress, not heavy washes.
- **Color lives on the accent only** — left border, status pill, timer — while the card body stays neutral dark. A breached card is a neutral dark card with a red left-border + red pill + red timer, NOT a red card.
- Keep the same semantic hues (red/amber/blue/green/indigo/gold) at adjusted luminance so meaning survives the theme switch and text stays high-contrast (WCAG AA).
- The light↔dark toggle must flip every token cleanly with no unreadable elements in either mode.

Use the elevation-layered, accent-only-color approach — cards must visibly float and urgency must read precisely, the same quality as the light theme.

## 6. Hover & interaction states — both themes

Every card and every actionable element must have a clear, working interactive state in **both** light and dark:

- **Hovering a request card** → subtle lift (shadow) + background shifts one notch + a **column-colored outline/border**:
  - To Do → **blue** outline
  - In Progress → **amber/orange** outline
  - Breached → **red** outline
  - Tune each to the current theme's background so it's clearly visible but not harsh.
- Keep it to **border + subtle background + shadow** — do NOT flood the whole card with color on hover (that would re-introduce the "everything tinted" problem).
- **Every button, icon, chevron, toggle, and filter must be genuinely interactive** — visible hover state, pointer cursor, and a real action. Nothing decorative-but-dead. The chevron is an affordance cue; the whole card remains the click target for opening detail.

## 7. Small consistency catches

- **"0m Late" / "Overdue by 0m"** at the exact breach moment should read **"Due now"** (or "Just breached"), not "0m Late."
- **Mute the RG-ID** a little more — smaller, lower contrast — so the room number stays the loudest element on the card.
- **Floor labels always carry the F prefix** everywhere (F10, never bare 10), including inside trip summaries.

## 8. Build the "After the Rush" panel (if not already done)

The `After the Rush` toggle should open a calm post-rush review view showing the 5 metrics as large stat tiles — On-time completion rate, Avg request-to-done time, Breached this rush, **Requests per trip** (the key efficiency metric), Avg tray/pickup clearing time — plus a simple patterns section (busiest floors, most breaches by type, fullest trips). Calm and reflective, more whitespace than the live board. Toggling off returns to the live Command View.

---

## Do not touch
Three-region layout · color token structure · card anatomy · kanban columns and their sort rules · Floor-Cluster view · Add Request modal · Trip drawer structure · undo/recovery/error flows · Kitchen Ready Stripe. Change only what is listed above.

---

# Deploying Regale to a public URL (Vercel + GitHub)

Once the build looks right and runs with `npm run dev`, deploy it so you have a shareable link for your portfolio. Ask Claude Code to help with each step:

**Step 1 — Put the project on GitHub**
Tell Claude Code: *"Initialize a git repository for this project and push it to a new GitHub repo. Walk me through any auth steps."* It will run `git init`, create commits, and help you create + push to a GitHub repository. (You'll need a free github.com account and to be signed in / authenticated.)

**Step 2 — Connect Vercel**
- Go to **vercel.com** and sign up with your GitHub account (free).
- Click **Add New… → Project**.
- Select the Regale GitHub repo you just pushed.
- Vercel auto-detects it's a Vite/React app — leave the defaults (Build command `npm run build`, output `dist`).
- Click **Deploy**.

**Step 3 — Get your link**
In ~1–2 minutes Vercel gives you a public URL like `regale-xxxx.vercel.app`. That's your shareable portfolio link — anyone who opens it can use the tool as the coordinator. (State is in-memory mock data, so a refresh resets it — perfect for a demo.)

**Step 4 — Auto-deploy on updates**
After this, every time you push new commits to GitHub, Vercel redeploys automatically. So future tweaks go live by pushing to the repo.

> Note: your data is in-memory only (no backend), which is exactly right for a portfolio demo — no database or sign-in to set up.
