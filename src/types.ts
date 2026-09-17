export type RequestType = 'Supplies' | 'Meal Request' | 'Room Task' | 'Beverage' | 'Pickup'

export type PromiseTier = 'standard' | 'priority' | 'custom'

/** Whether work on the request has actually started yet. Time-urgency
 * (on-time / at-risk / breached) is tracked separately — see lib/urgency.ts. */
export type ProgressState = 'accepted' | 'in_progress' | 'completed'

export type TimeStatus = 'on_time' | 'at_risk' | 'breached'

export type BoardColumn = 'breached' | 'to_do' | 'in_progress'

export interface ServiceRequest {
  id: string
  floor: number
  room: string
  code: string
  type: RequestType
  item: string
  itemsCount: number
  specialInstructions?: string
  requestedAt: number // epoch ms
  promiseMinutes: number
  promiseTier: PromiseTier
  progressState: ProgressState
  progressLabel?: string // e.g. "Preparing", "Kitchen wait" — shown in Floor-Cluster / detail only
  assignedServerId?: string
  tripId?: string
  scheduled?: boolean // scheduled request not yet promoted onto the live board

  // Per-request lifecycle timeline (Iteration §4a) — stamped the moment
  // each step is actually reached, so the Request Detail panel can show a
  // real Requested → Accepted → On the Way → Completed history instead of
  // guessing. Requests start already "accepted" in this system, so
  // acceptedAt is always set alongside requestedAt.
  acceptedAt?: number
  onTheWayAt?: number
  completedAt?: number
}

export type ServerStatus = 'assigned' | 'on_trip' | 'room_task' | 'free'

export interface Server {
  id: string
  name: string
  initials: string
  status: ServerStatus
  statusLine: string // "3 of 4 done"
  floorLine?: string // "F11 • 1 stop left"
  currentTripId?: string
}

export type Freshness = 'fresh' | 'cooling' | 'urgent'

export interface KitchenItem {
  id: string
  room: string
  type: 'Food' | 'Beverage'
  itemsCount: number
  readyAt: number // epoch ms
}

export interface Trip {
  id: string
  label: string // "Trip #12"
  stopRequestIds: string[]
  // Run state (created/assigned/running/done) is NOT stored — it's derived
  // live from the stops' own progressState via lib/tripStatus.ts, so the
  // trip and its requests can never show contradictory states.
  createdBy: 'ai' | 'coordinator'
  assignedServerId?: string
  distanceKm: number
  estMinutes: number
  priority: 'Low' | 'Medium' | 'High'
  suggestedAt: number
}

export interface WastageEvent {
  id: string
  requestId: string
  reason: string
  at: number
}
