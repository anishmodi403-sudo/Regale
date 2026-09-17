import type { KitchenItem, Server, ServiceRequest, Trip } from '../types'

// Mock data is anchored to real wall-clock time at load, so every timer on
// screen ticks live and ages/breaches naturally as the session runs — see
// spec §12 step 3 ("mock data early ... never build against an empty or
// all-breached screen") and §10.7 ("timers tick live").
const NOW = Date.now()
const MIN = 60_000

function minutesAgo(min: number): number {
  return NOW - min * MIN
}

// Backfills the per-request lifecycle timestamps (Iteration §4a) for seed
// data, since the literal request rows above only specify the final
// progressState. Requests are auto-accepted the moment they're placed;
// "on the way" and "completed" are stamped a plausible few minutes later,
// scaled to the request's own promise window, and never after "now".
function attachTimeline(r: ServiceRequest): ServiceRequest {
  const acceptedAt = r.requestedAt
  if (r.progressState === 'accepted') return { ...r, acceptedAt }

  const onTheWayAt = Math.min(NOW, acceptedAt + Math.min(3, Math.max(1, Math.round(r.promiseMinutes * 0.15))) * MIN)
  if (r.progressState === 'in_progress') return { ...r, acceptedAt, onTheWayAt }

  const completedAt = Math.min(NOW, onTheWayAt + 4 * MIN)
  return { ...r, acceptedAt, onTheWayAt, completedAt }
}

// ---------------------------------------------------------------------------
// Requests — the 11 sample cards from spec §4.3, plus enough extra realistic
// rows to spread across all 12 floors and read as a believable peak-load
// board: mixed breached / at-risk / calm, never empty, never all-breached.
// Trip #12's three stops (§9.2) and Trip #13's two stops are drawn from
// this same pool so the board and the Trips rail stay one consistent story.
// ---------------------------------------------------------------------------
const rawRequests: ServiceRequest[] = [
  // ---- Breached (3) ----
  {
    id: '502',
    floor: 5,
    room: '502',
    code: 'RG-4203',
    type: 'Supplies',
    item: 'Towel',
    itemsCount: 2,
    requestedAt: minutesAgo(30),
    promiseMinutes: 20,
    promiseTier: 'standard',
    progressState: 'accepted',
  },
  {
    id: '1204',
    floor: 12,
    room: '1204',
    code: 'RG-4188',
    type: 'Room Task',
    item: 'Bed Cleaning',
    itemsCount: 1,
    requestedAt: minutesAgo(28),
    promiseMinutes: 20,
    promiseTier: 'standard',
    progressState: 'accepted',
  },
  {
    id: '804',
    floor: 8,
    room: '804',
    code: 'RG-4192',
    type: 'Meal Request',
    item: 'Biryani',
    itemsCount: 1,
    requestedAt: minutesAgo(25),
    promiseMinutes: 20,
    promiseTier: 'standard',
    progressState: 'accepted',
  },

  // ---- To Do / accepted (8) ----
  {
    id: '905',
    floor: 9,
    room: '905',
    code: 'RG-4196',
    type: 'Supplies',
    item: 'Water Bottle',
    itemsCount: 4,
    requestedAt: minutesAgo(5),
    promiseMinutes: 26,
    promiseTier: 'standard',
    progressState: 'accepted',
  },
  {
    id: '1108',
    floor: 11,
    room: '1108',
    code: 'RG-4210',
    type: 'Meal Request',
    item: 'Paneer Curry',
    itemsCount: 2,
    requestedAt: minutesAgo(5),
    promiseMinutes: 24,
    promiseTier: 'standard',
    progressState: 'accepted',
  },
  {
    id: '1211',
    floor: 12,
    room: '1211',
    code: 'RG-4181',
    type: 'Meal Request',
    item: 'Rice',
    itemsCount: 3,
    requestedAt: minutesAgo(5),
    promiseMinutes: 29,
    promiseTier: 'standard',
    progressState: 'accepted',
  },
  {
    id: '617',
    floor: 9,
    room: '617',
    code: 'RG-4208',
    type: 'Room Task',
    item: 'Washroom Clean',
    itemsCount: 1,
    requestedAt: minutesAgo(5),
    promiseMinutes: 32,
    promiseTier: 'standard',
    progressState: 'in_progress',
    tripId: 'trip-16',
    assignedServerId: 'divya',
  },
  {
    id: '101',
    floor: 1,
    room: '101',
    code: 'RG-4301',
    type: 'Supplies',
    item: 'Bathrobe',
    itemsCount: 1,
    requestedAt: minutesAgo(4),
    promiseMinutes: 22,
    promiseTier: 'standard',
    progressState: 'accepted',
  },
  {
    id: '310',
    floor: 3,
    room: '310',
    code: 'RG-4309',
    type: 'Beverage',
    item: 'Filter Coffee',
    itemsCount: 2,
    requestedAt: minutesAgo(6),
    promiseMinutes: 21,
    promiseTier: 'standard',
    progressState: 'accepted',
  },
  {
    id: '611',
    floor: 6,
    room: '611',
    code: 'RG-4318',
    type: 'Room Task',
    item: 'Turndown Service',
    itemsCount: 1,
    requestedAt: minutesAgo(5),
    promiseMinutes: 30,
    promiseTier: 'standard',
    progressState: 'accepted',
  },
  {
    id: '605',
    floor: 6,
    room: '605',
    code: 'RG-4325',
    type: 'Meal Request',
    item: 'Tomato Soup',
    itemsCount: 1,
    requestedAt: minutesAgo(5),
    promiseMinutes: 24,
    promiseTier: 'standard',
    progressState: 'accepted',
  },

  // ---- In progress / on the way (8) ----
  {
    id: '716',
    floor: 7,
    room: '716',
    code: 'RG-4217',
    type: 'Room Task',
    item: 'Room Cleaning',
    itemsCount: 1,
    requestedAt: minutesAgo(5),
    promiseMinutes: 8,
    promiseTier: 'priority',
    progressState: 'in_progress',
    tripId: 'trip-13',
    assignedServerId: 'arun',
  },
  {
    id: '1201',
    floor: 8,
    room: '1201',
    code: 'RG-4191',
    type: 'Supplies',
    item: 'Tissue',
    itemsCount: 3,
    requestedAt: minutesAgo(5),
    promiseMinutes: 11,
    promiseTier: 'standard',
    progressState: 'in_progress',
    tripId: 'trip-13',
    assignedServerId: 'arun',
  },
  {
    id: '805',
    floor: 9,
    room: '805',
    code: 'RG-4185',
    type: 'Meal Request',
    item: 'Dalia',
    itemsCount: 1,
    requestedAt: minutesAgo(5),
    promiseMinutes: 14,
    promiseTier: 'standard',
    progressState: 'in_progress',
    tripId: 'trip-16',
    assignedServerId: 'divya',
  },
  {
    id: '306',
    floor: 11,
    room: '306',
    code: 'RG-4200',
    type: 'Meal Request',
    item: 'Poha',
    itemsCount: 2,
    requestedAt: minutesAgo(5),
    promiseMinutes: 20,
    promiseTier: 'standard',
    progressState: 'in_progress',
  },
  {
    id: '203',
    floor: 2,
    room: '203',
    code: 'RG-4305',
    type: 'Meal Request',
    item: 'Club Sandwich',
    itemsCount: 1,
    requestedAt: minutesAgo(6),
    promiseMinutes: 13,
    promiseTier: 'standard',
    progressState: 'in_progress',
  },
  {
    id: '402',
    floor: 4,
    room: '402',
    code: 'RG-4312',
    type: 'Pickup',
    item: 'Clear Tray',
    itemsCount: 2,
    requestedAt: minutesAgo(6),
    promiseMinutes: 10,
    promiseTier: 'priority',
    progressState: 'in_progress',
  },
  {
    id: '1005',
    floor: 10,
    room: '1005',
    code: 'RG-4322',
    type: 'Supplies',
    item: 'Extra Pillow',
    itemsCount: 2,
    requestedAt: minutesAgo(5),
    promiseMinutes: 16,
    promiseTier: 'standard',
    progressState: 'in_progress',
  },
  {
    id: '304',
    floor: 3,
    room: '304',
    code: 'RG-4330',
    type: 'Beverage',
    item: 'Masala Tea',
    itemsCount: 2,
    requestedAt: minutesAgo(6),
    promiseMinutes: 8,
    promiseTier: 'priority',
    progressState: 'in_progress',
  },

  // ---- Trip #12 stops (spec §9.2) — running: 2 of 3 already done, the
  // last one still on the way. Gives the Trip Detail progress timeline
  // (Iteration §3) a real mix of done/pending to show. ----
  {
    id: '1103',
    floor: 11,
    room: '1103',
    code: 'RG-4214',
    type: 'Meal Request',
    item: 'Chicken Fried Rice',
    itemsCount: 2,
    requestedAt: minutesAgo(41),
    promiseMinutes: 45,
    promiseTier: 'standard',
    progressState: 'completed',
    tripId: 'trip-12',
    assignedServerId: 'maron',
  },
  {
    id: '1205',
    floor: 12,
    room: '1205',
    code: 'RG-4218',
    type: 'Beverage',
    item: 'Iced Tea',
    itemsCount: 1,
    requestedAt: minutesAgo(39),
    promiseMinutes: 45,
    promiseTier: 'standard',
    progressState: 'completed',
    tripId: 'trip-12',
    assignedServerId: 'maron',
  },
  {
    id: '1207',
    floor: 12,
    room: '1207',
    code: 'RG-4219',
    type: 'Supplies',
    item: 'Extra Towels',
    itemsCount: 2,
    requestedAt: minutesAgo(38),
    promiseMinutes: 45,
    promiseTier: 'standard',
    progressState: 'in_progress',
    tripId: 'trip-12',
    assignedServerId: 'maron',
  },

  // ---- Trip #16 stops (Divya, F9) — running: 2 of 4 done, 2 on the way.
  // Gives Divya a real running trip behind her "ON TRIP" status (Iteration
  // §2 — a server shown ON TRIP must actually be tied to a running trip). ----
  {
    id: '903',
    floor: 9,
    room: '903',
    code: 'RG-4350',
    type: 'Supplies',
    item: 'Bath Amenities',
    itemsCount: 3,
    requestedAt: minutesAgo(22),
    promiseMinutes: 25,
    promiseTier: 'standard',
    progressState: 'completed',
    tripId: 'trip-16',
    assignedServerId: 'divya',
  },
  {
    id: '907',
    floor: 9,
    room: '907',
    code: 'RG-4351',
    type: 'Meal Request',
    item: 'Idli',
    itemsCount: 2,
    requestedAt: minutesAgo(20),
    promiseMinutes: 25,
    promiseTier: 'standard',
    progressState: 'completed',
    tripId: 'trip-16',
    assignedServerId: 'divya',
  },

  // ---- Scheduled, not yet promoted onto the live board (T5) ----
  {
    id: '1008',
    floor: 10,
    room: '1008',
    code: 'RG-4340',
    type: 'Pickup',
    item: 'Breakfast Tray',
    itemsCount: 1,
    requestedAt: minutesAgo(-25),
    promiseMinutes: 20,
    promiseTier: 'standard',
    progressState: 'accepted',
    scheduled: true,
  },
]

export const requests: ServiceRequest[] = rawRequests.map(attachTimeline)

// ---------------------------------------------------------------------------
// Servers — spec §3.2 flavor, but every non-free status here is now backed
// by a real running trip (Iteration §2), so nothing is contradictory.
// Karan Singh always starts FREE so the assign flow always has a valid
// target to demonstrate.
// ---------------------------------------------------------------------------
export const servers: Server[] = [
  {
    id: 'maron',
    name: 'Maron Chen',
    initials: 'MC',
    status: 'on_trip',
    statusLine: '2 of 3 done',
    floorLine: 'F12 • 1 stop left',
    currentTripId: 'trip-12',
  },
  {
    id: 'arun',
    name: 'Arun Kumar',
    initials: 'AK',
    status: 'room_task',
    statusLine: 'Trip #13 · 0 of 2 done',
    floorLine: 'F7 • R-716',
    currentTripId: 'trip-13',
  },
  {
    id: 'divya',
    name: 'Divya Patel',
    initials: 'DP',
    status: 'on_trip',
    statusLine: '2 of 4 done',
    floorLine: 'F9 • 2 stops left',
    currentTripId: 'trip-16',
  },
  {
    id: 'karan',
    name: 'Karan Singh',
    initials: 'KS',
    status: 'free',
    statusLine: 'Available',
  },
]

// ---------------------------------------------------------------------------
// Kitchen Ready Stripe — spec §3.3
// ---------------------------------------------------------------------------
export const kitchenItems: KitchenItem[] = [
  { id: 'k805', room: '805', type: 'Food', itemsCount: 2, readyAt: minutesAgo(3) },
  { id: 'k1201', room: '1201', type: 'Beverage', itemsCount: 1, readyAt: minutesAgo(5) },
  { id: 'k617', room: '617', type: 'Food', itemsCount: 3, readyAt: minutesAgo(8) },
]

// ---------------------------------------------------------------------------
// Trips — spec §6.3 / §9.2. Run state is derived (see lib/tripStatus.ts),
// not stored, so it can never drift out of sync with the stops above:
// Trip #12 and #16 are RUNNING (some stops done, one+ still on the way),
// Trip #13 is RUNNING (just started, 0 done), Trip #14 is CREATED — a
// fresh AI suggestion still awaiting a server, the one state that needs no
// stops in progress at all.
// ---------------------------------------------------------------------------
export const trips: Trip[] = [
  {
    id: 'trip-12',
    label: 'Trip #12',
    stopRequestIds: ['1103', '1205', '1207'],
    createdBy: 'ai',
    assignedServerId: 'maron',
    distanceKm: 1.2,
    estMinutes: 12,
    priority: 'Medium',
    suggestedAt: minutesAgo(45),
  },
  {
    id: 'trip-13',
    label: 'Trip #13',
    stopRequestIds: ['716', '1201'],
    createdBy: 'coordinator',
    assignedServerId: 'arun',
    distanceKm: 0.6,
    estMinutes: 7,
    priority: 'High',
    suggestedAt: minutesAgo(18),
  },
  {
    id: 'trip-14',
    label: 'Trip #14',
    stopRequestIds: ['310', '605', '611'],
    createdBy: 'ai',
    distanceKm: 0.9,
    estMinutes: 9,
    priority: 'Low',
    suggestedAt: minutesAgo(2),
  },
  {
    id: 'trip-16',
    label: 'Trip #16',
    stopRequestIds: ['903', '907', '805', '617'],
    createdBy: 'coordinator',
    assignedServerId: 'divya',
    distanceKm: 0.5,
    estMinutes: 8,
    priority: 'Medium',
    suggestedAt: minutesAgo(22),
  },
]

export const coordinator = {
  name: 'Alex Rivera',
  role: 'Coordinator',
  initials: 'AR',
}
