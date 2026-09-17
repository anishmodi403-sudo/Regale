import type { ServiceRequest } from '../types'
import { minutesLate, minutesLeft, timeStatus } from './urgency'

const DEFAULT_MAX_STOPS = 4
const DEFAULT_FLOOR_WINDOW = 3

export interface TripPlan {
  requestIds: string[]
}

/** Shared AI trip-building logic for both "Suggest with AI" and Auto Mode
 * (Iteration 2 §4) — breach-first, cluster-to-fill:
 *   1. Anchor on the worst outstanding breach (most overdue). If nothing
 *      is breached, anchor on the single most urgent request instead.
 *   2. Fill the rest of the trip from nearby/adjacent floors, prioritizing
 *      other breaches, then at-risk, then on-time — so breach-first and
 *      fuller trips both get served.
 *   3. A lone-stop trip only happens when there's genuinely nothing nearby
 *      to ride along — it never artificially caps a trip that could fill.
 */
export function planBreachFirstTrip(
  candidates: ServiceRequest[],
  nowMs: number,
  opts: { maxStops?: number; floorWindow?: number } = {},
): TripPlan | null {
  if (candidates.length === 0) return null
  const maxStops = opts.maxStops ?? DEFAULT_MAX_STOPS
  const floorWindow = opts.floorWindow ?? DEFAULT_FLOOR_WINDOW

  const breached = candidates.filter((r) => timeStatus(r, nowMs) === 'breached')
  const anchor =
    breached.length > 0
      ? breached.reduce((worst, r) => (minutesLate(r, nowMs) > minutesLate(worst, nowMs) ? r : worst))
      : candidates.reduce((most, r) => (minutesLeft(r, nowMs) < minutesLeft(most, nowMs) ? r : most))

  function urgencyRank(r: ServiceRequest): number {
    const s = timeStatus(r, nowMs)
    if (s === 'breached') return 0
    if (s === 'at_risk') return 1
    return 2
  }

  const rest = candidates
    .filter((r) => r.id !== anchor.id && Math.abs(r.floor - anchor.floor) <= floorWindow)
    .sort((a, b) => {
      const urgencyDiff = urgencyRank(a) - urgencyRank(b)
      if (urgencyDiff !== 0) return urgencyDiff
      const distDiff = Math.abs(a.floor - anchor.floor) - Math.abs(b.floor - anchor.floor)
      if (distDiff !== 0) return distDiff
      return minutesLeft(a, nowMs) - minutesLeft(b, nowMs)
    })
    .slice(0, maxStops - 1)
    .map((r) => r.id)

  return { requestIds: [anchor.id, ...rest] }
}
