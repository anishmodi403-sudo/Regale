import type { ServiceRequest, Trip } from '../types'
import { floorLabel } from './format'
import { hasBreached } from './urgency'

export interface RushStats {
  onTimeRate: number | null // 0–100, null when no completed requests yet
  avgDoneMinutes: number | null
  breachedCount: number
  requestsPerTrip: number | null
  avgClearingMinutes: number | null // Pickup-type requests only
  busiestFloors: { floor: number; count: number }[]
  breachesByType: { type: string; count: number }[]
  fullestTrips: { label: string; stops: number }[]
}

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

/** All stats derive from this session's live request/trip pool — there is
 * no separate historical store, so "this rush" means everything placed so
 * far. Reads calmly as a review, unlike the live board (Iteration §8). */
export function computeRushStats(requests: ServiceRequest[], trips: Trip[], nowMs: number): RushStats {
  const relevant = requests.filter((r) => !r.scheduled)
  const completed = relevant.filter((r) => r.progressState === 'completed' && r.completedAt)

  const onTimeCompleted = completed.filter((r) => !hasBreached(r, nowMs))
  const onTimeRate = completed.length > 0 ? Math.round((onTimeCompleted.length / completed.length) * 100) : null

  const doneMinutes = completed.map((r) => (r.completedAt! - r.requestedAt) / 60_000)
  const avgDoneMinutes = average(doneMinutes)

  const breachedCount = relevant.filter((r) => hasBreached(r, nowMs)).length

  const requestsPerTrip = trips.length > 0 ? average(trips.map((t) => t.stopRequestIds.length)) : null

  const pickups = completed.filter((r) => r.type === 'Pickup')
  const avgClearingMinutes = average(pickups.map((r) => (r.completedAt! - r.requestedAt) / 60_000))

  const floorCounts = new Map<number, number>()
  for (const r of relevant) floorCounts.set(r.floor, (floorCounts.get(r.floor) ?? 0) + 1)
  const busiestFloors = Array.from(floorCounts.entries())
    .map(([floor, count]) => ({ floor, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const breachTypeCounts = new Map<string, number>()
  for (const r of relevant) {
    if (!hasBreached(r, nowMs)) continue
    breachTypeCounts.set(r.type, (breachTypeCounts.get(r.type) ?? 0) + 1)
  }
  const breachesByType = Array.from(breachTypeCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const fullestTrips = [...trips]
    .sort((a, b) => b.stopRequestIds.length - a.stopRequestIds.length)
    .slice(0, 3)
    .map((t) => ({ label: t.label, stops: t.stopRequestIds.length }))

  return { onTimeRate, avgDoneMinutes, breachedCount, requestsPerTrip, avgClearingMinutes, busiestFloors, breachesByType, fullestTrips }
}

export function formatMinutes(min: number | null): string {
  if (min === null) return '—'
  return `${Math.round(min)} min`
}

export function formatPercent(pct: number | null): string {
  if (pct === null) return '—'
  return `${pct}%`
}

export function formatFloorList(floors: { floor: number; count: number }[]): string {
  return floors.map((f) => `${floorLabel(f.floor)} (${f.count})`).join(' · ')
}
