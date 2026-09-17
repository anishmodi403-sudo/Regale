import type { ServiceRequest, Trip } from '../types'

/** A trip's run state is never stored — it's derived from its stops' own
 * progress so the two can never contradict each other (Iteration §1: a
 * trip could previously show "Start Trip" while one of its requests was
 * already "On the Way", which is impossible — if a stop is moving, the
 * trip has already started). */
export type TripRunState = 'created' | 'assigned' | 'running' | 'done'

export function getTripStops(trip: Trip, requests: ServiceRequest[]): ServiceRequest[] {
  return trip.stopRequestIds
    .map((id) => requests.find((r) => r.id === id))
    .filter((r): r is ServiceRequest => Boolean(r))
}

export function getTripRunState(trip: Trip, stops: ServiceRequest[]): TripRunState {
  if (stops.length > 0 && stops.every((s) => s.progressState === 'completed')) return 'done'
  if (stops.some((s) => s.progressState === 'in_progress')) return 'running'
  if (trip.assignedServerId) return 'assigned'
  return 'created'
}

export function getTripDoneCount(stops: ServiceRequest[]): number {
  return stops.filter((s) => s.progressState === 'completed').length
}
