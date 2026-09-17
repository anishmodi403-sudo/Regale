# Regale — Iteration 2 Instructions (for Claude Code)

The build is strong and its structure is correct. **Do not rebuild it or change the layout.** These are targeted changes only: mock-data logic, card style, dark theme, and the AI trip logic. Leave everything else (three-region layout, kanban columns, Trip drawer, Request/Trip detail panels, Floor-Cluster view, Add Request modal, undo/recovery, After-the-Rush) exactly as it is except where explicitly listed below.

---

## 1. Fix the mock-data / time bug (board decays to all-breached)

After the app runs for a while, every request ages past its promise time and they all end up Breached — To Do and In Progress drain to empty (currently shows "20 Breached, 0 To Do, 0 In Progress" with no filter active). Trips still show "in progress" on the right, but the columns are empty — inconsistent.

Fix:
- **Seed request times relative to load time, not fixed timestamps.** Every time the app loads, generate start-times relative to *now* so there is always a realistic live spread — roughly a few breached, several at-risk, and the rest on-time / to-do — no matter when the app is opened. It must look like a live morning rush on every load, never decay into all-breached.
- **Keep state self-consistent over time.** Requests that belong to an In-Progress trip must actually appear in the In Progress column (right now trips claim "in progress" while the columns are empty). Server states, trip states, and the columns must always agree.
- Optionally trickle in a few new requests over time (or re-seed a healthy spread on load) so the board never fully empties into a single column.
- This is purely mock-data / time logic — do not change the layout or design.

## 2. Card style — remove the left-bar (both themes)

Remove the colored left-bar from all request cards. The column already communicates the state, so a left-bar on every card is redundant and makes the board noisy.
- Keep the clean card style: color lives only on the **status pill, the timer, and the column header dot**. The card body stays neutral.
- **Exception — breached cards only** may carry ONE subtle extra cue (a faint red background tint OR a thin red border), since breaches are the top priority. Nothing heavy, and only on breached cards — never a thick bar, never on other columns.

## 3. Rebuild the dark theme (currently too red / muddy)

The current dark theme is wrong: the Breached column has a heavy red/brown background wash and breached cards are red-tinted boxes, so a large part of the screen glows red, and cards barely lift off the background. Rebuild it on this rule — **elevation carries structure, color lives only on small accents, never washed across columns or card bodies:**

- **Three clear elevation layers in warm charcoal (never pure black):** canvas = darkest, column region = one step lighter, card surface = lighter still — so cards visibly float above the columns.
- **No colored wash on any column.** All three columns (Breached / To Do / In Progress) share the same neutral dark panel background. The column header dot (red / blue / amber) is the only column color.
- **No colored card bodies.** A breached card is a neutral dark card with a red pill + red timer only (plus the one subtle breach cue from §2). Color lives only on pills, timers, and small status elements.
- Keep text high-contrast (WCAG AA), and keep the same semantic hues at adjusted luminance so meaning survives the theme switch.
- Goal: dark mode feels calm and premium — cards floating on neutral charcoal, color appearing only as small accents, not a screen tinted red. Same quality bar as the light theme.

## 4. AI trip logic — breach-first, cluster-to-fill (both modes)

"Suggest with AI" is not just a grouping convenience — it is a recovery mechanism. Its trip-building logic, in **both** modes below:
- **Anchor the trip on the worst outstanding breach** (most overdue request first).
- **Then cluster nearby / adjacent-floor requests to fill that trip**, so breach-first and fuller-trips both get served — the breach sets the destination, the clustering fills the trolley on the way.
- **When filling, prioritize at-risk requests over on-time ones.**
- Only send a near-empty trip for a lone breach if there is genuinely nothing nearby to ride along.

## 5. Two autonomy modes for the AI

Add an **"Auto Mode"** toggle near the "Suggest with AI" button (hover label: "Auto Mode — AI builds & assigns trips"). It creates two levels of autonomy for the same breach-first logic above:

**Manual (default — Auto Mode OFF):**
- Clicking "Suggest with AI" builds **one** breach-anchored trip and proposes it.
- The **coordinator assigns** the server and decides. AI proposes, human decides. (This is for the morning rush, when the coordinator is at the desk.)

**Auto Mode ON (coordinator away / off-peak):**
- AI **builds trips AND assigns them to free servers automatically**, breach-first, using the §4 logic.
- It builds **as many trips as there are free servers** at once, then continues as servers free up (not one-at-a-time — nobody is there to click).
- **Guardrails (mandatory):**
  - Only ever assigns to genuinely **FREE** servers (never overrides §C2 — a trip goes only to a free server).
  - **Clear ON indicator** whenever Auto Mode is active, so the coordinator always knows AI is driving.
  - **Every AI action is logged and undoable** — an action feed the coordinator can review and reverse when they return (e.g. "Auto Mode created Trip #21, assigned Karan — undo").
  - AI acts, but never silently and never irreversibly.

---

## Do not touch
Three-region layout · kanban columns and their sort rules · Trip drawer structure · Request Detail & Trip Detail panels (timelines already built) · Floor-Cluster view · Add Request modal · undo/recovery/error flows · Kitchen Ready Stripe · After-the-Rush view. Change only §1–§5 above.

---

## After this build
Start the dev server and open it so I can visually verify — I want to check, in BOTH light and dark: the board loads with a healthy spread (not all-breached), cards have no left-bar, dark mode has floating cards on neutral charcoal (no red wash), and Auto Mode toggles with an ON indicator + undoable log. Show me after §1–§3 (the visual/data fixes) as one checkpoint, then §4–§5 (the AI logic) as a second checkpoint.
