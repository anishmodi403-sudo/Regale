import type { BoardColumn, ServiceRequest, TimeStatus } from '../types'

/** Urgency is relative, not fixed — driven by % of promise time elapsed
 * (spec §10.3), never a flat minute count.
 *   0–60% elapsed  → on time
 *   ~60% elapsed   → at risk
 *   100%+ elapsed  → breached
 */
const AT_RISK_THRESHOLD = 0.6

export function pctElapsed(request: ServiceRequest, nowMs: number): number {
  const elapsedMin = (nowMs - request.requestedAt) / 60000
  return elapsedMin / request.promiseMinutes
}

/** Whether a request ever crossed its promise deadline — true for a
 * currently-breached live request, and true for a completed request that
 * finished after its deadline even though timeStatus() reports it as
 * on_time now (that override exists for board/KPI purposes only). Used by
 * the per-request timeline and the After the Rush review stats. */
export function hasBreached(request: ServiceRequest, nowMs: number): boolean {
  const promiseAt = request.requestedAt + request.promiseMinutes * 60_000
  if (request.completedAt) return request.completedAt > promiseAt
  return nowMs > promiseAt
}

export function timeStatus(request: ServiceRequest, nowMs: number): TimeStatus {
  if (request.progressState === 'completed') return 'on_time'
  const pct = pctElapsed(request, nowMs)
  if (pct >= 1) return 'breached'
  if (pct >= AT_RISK_THRESHOLD) return 'at_risk'
  return 'on_time'
}

export function minutesLate(request: ServiceRequest, nowMs: number): number {
  const promiseAt = request.requestedAt + request.promiseMinutes * 60000
  return Math.max(0, Math.round((nowMs - promiseAt) / 60000))
}

export function minutesLeft(request: ServiceRequest, nowMs: number): number {
  const promiseAt = request.requestedAt + request.promiseMinutes * 60000
  return Math.max(0, Math.round((promiseAt - nowMs) / 60000))
}

/** Column placement follows lifecycle state, not urgency. An On-the-Way
 * request stays in In Progress even after it breaches its promise time —
 * the breach shows there as a red pill/timer overlay (see statusPillFor),
 * never a column move, so In Progress never empties out while a server is
 * actively carrying requests. Only a request that is overdue AND not yet
 * picked up (still just "accepted", not on a running trip) belongs in the
 * Breached column. To Do and In Progress never overlap. */
export function columnFor(request: ServiceRequest, nowMs: number): BoardColumn {
  if (request.progressState === 'in_progress') return 'in_progress'
  if (timeStatus(request, nowMs) === 'breached') return 'breached'
  return 'to_do'
}

export interface StatusPillMeta {
  label: string
  tone: 'danger' | 'info' | 'warning'
}

/** The status pill + timer are an urgency overlay, independent of which
 * column the card lives in — a breached On-the-Way request still shows
 * the red BREACH pill even though columnFor keeps it in In Progress. */
export function statusPillFor(request: ServiceRequest, nowMs: number): StatusPillMeta {
  if (timeStatus(request, nowMs) === 'breached') return { label: 'BREACH', tone: 'danger' }
  if (request.progressState === 'in_progress') return { label: 'ON THE WAY', tone: 'warning' }
  return { label: 'ACCEPTED', tone: 'info' }
}

/** Sorting is independent per column (spec §4.2):
 *  - Breached: most overdue first
 *  - To Do / In Progress: least time remaining first */
export function compareWithinColumn(column: BoardColumn, nowMs: number) {
  return (a: ServiceRequest, b: ServiceRequest) => {
    if (column === 'breached') {
      return minutesLate(b, nowMs) - minutesLate(a, nowMs)
    }
    return minutesLeft(a, nowMs) - minutesLeft(b, nowMs)
  }
}

/** "0m Late" at the exact breach instant reads like a glitch — say "Due
 * now" instead (Iteration §7). */
export function timerLabel(request: ServiceRequest, nowMs: number): string {
  const status = timeStatus(request, nowMs)
  if (status === 'breached') {
    const late = minutesLate(request, nowMs)
    return late === 0 ? 'Due now' : `${late}m Late`
  }
  return `${minutesLeft(request, nowMs)}m left`
}

/** Same "just crossed the line" wording for the Live Alerts feed. */
export function overdueLabel(request: ServiceRequest, nowMs: number): string {
  const late = minutesLate(request, nowMs)
  return late === 0 ? 'Just breached' : `Overdue by ${late}m`
}

export function freshnessFor(readyAt: number, nowMs: number): 'fresh' | 'cooling' | 'urgent' {
  const elapsedMin = (nowMs - readyAt) / 60000
  if (elapsedMin >= 7) return 'urgent'
  if (elapsedMin >= 4) return 'cooling'
  return 'fresh'
}
