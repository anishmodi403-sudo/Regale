import { useAppState } from '../../state/AppStateContext'
import { SlideOverPanel } from '../common/Overlay'
import { floorLabel, formatClockTime } from '../../lib/format'
import { columnFor, timerLabel, timeStatus } from '../../lib/urgency'
import { Pill } from '../common/Pill'
import { BellIcon } from '../common/Icons'
import type { ServiceRequest } from '../../types'

const COLUMN_META = {
  breached: { label: 'BREACH', tone: 'danger' as const },
  to_do: { label: 'ACCEPTED', tone: 'info' as const },
  in_progress: { label: 'ON THE WAY', tone: 'warning' as const },
}

interface TimelineNode {
  key: string
  label: string
  at: number | null // null = not reached yet
  kind: 'step' | 'breach'
  current: boolean
}

/** Builds the Requested → [Breached] → Accepted → On the Way → Completed
 * timeline (Iteration §4a). Breach isn't a stored past event — it's
 * derived from whether "now" (or the completion time, for requests that
 * finished late) ever passed the promise deadline, so it stays accurate
 * even for requests that are still ticking. */
function buildTimeline(request: ServiceRequest, nowMs: number): TimelineNode[] {
  const promiseAt = request.requestedAt + request.promiseMinutes * 60_000
  const breachedAt = request.completedAt
    ? request.completedAt > promiseAt
      ? promiseAt
      : null
    : nowMs > promiseAt
      ? promiseAt
      : null

  const current = request.progressState === 'completed' ? 'completed' : request.progressState === 'in_progress' ? 'on_the_way' : 'accepted'

  const nodes: TimelineNode[] = [{ key: 'requested', label: 'Requested', at: request.requestedAt, kind: 'step', current: false }]
  if (breachedAt !== null) nodes.push({ key: 'breached', label: 'Breached', at: breachedAt, kind: 'breach', current: false })
  nodes.push(
    { key: 'accepted', label: 'Accepted', at: request.acceptedAt ?? null, kind: 'step', current: current === 'accepted' },
    { key: 'on_the_way', label: 'On the Way', at: request.onTheWayAt ?? null, kind: 'step', current: current === 'on_the_way' },
    { key: 'completed', label: 'Completed', at: request.completedAt ?? null, kind: 'step', current: current === 'completed' },
  )
  return nodes
}

export function RequestDetailPanel({ requestId }: { requestId: string }) {
  const { requests, trips, servers, now, closeModal, openModal, cancelRequest } = useAppState()
  const request = requests.find((r) => r.id === requestId)
  if (!request) return null

  const column = columnFor(request, now)
  const meta = COLUMN_META[column]
  const status = timeStatus(request, now)
  const trip = trips.find((t) => t.id === request.tripId)
  const server = servers.find((s) => s.id === request.assignedServerId)
  const timeline = buildTimeline(request, now)

  // Coordinator's panel is read-only for status (Iteration §4b — servers
  // advance their own steps). Cancel only makes sense before anyone is
  // committed to the request; once it's on the way or queued on a trip,
  // pulling it goes through "Remove from trip" in the Trip Detail panel
  // instead (Iteration §4c).
  const canCancel = request.progressState === 'accepted' && !request.tripId
  const isCommitted = request.progressState !== 'accepted' || Boolean(request.tripId)

  return (
    <SlideOverPanel
      title={`Request ${request.id}`}
      onClose={closeModal}
      footer={
        canCancel ? (
          <button
            onClick={() => cancelRequest(request.id)}
            className="w-full rounded-button border border-hairline px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger-tint"
          >
            Cancel Request
          </button>
        ) : undefined
      }
    >
      <div className="space-y-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-text-primary">{request.id}</span>
          <span className="rounded-md bg-panel px-2 py-0.5 text-xs font-semibold text-text-secondary">
            {floorLabel(request.floor)}
          </span>
          <span className="ml-auto text-[11px] font-normal text-text-secondary/70">{request.code}</span>
        </div>

        <div className="text-sm text-text-secondary">
          {request.type} · <span className="font-semibold text-text-primary">{request.item}</span> ·{' '}
          {request.itemsCount} item{request.itemsCount === 1 ? '' : 's'}
        </div>

        <div className="flex items-center justify-between rounded-card border border-hairline bg-panel p-3">
          <Pill tone={meta.tone}>{meta.label}</Pill>
          <span className={`flex items-center gap-1 text-sm font-bold ${column === 'breached' ? 'text-danger' : status === 'at_risk' ? 'text-warning' : 'text-text-primary'}`}>
            {column === 'breached' && <BellIcon size={13} className="animate-bell-ring text-danger" />}
            {timerLabel(request, now)}
          </span>
        </div>

        <section>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-label text-text-secondary">Timeline</h3>
          <div className="space-y-0">
            {timeline.map((node, i) => {
              const isLast = i === timeline.length - 1
              const reached = node.at !== null
              const circleClass =
                node.kind === 'breach'
                  ? 'bg-danger text-white'
                  : !reached
                    ? 'bg-panel text-text-secondary'
                    : node.current
                      ? 'bg-primary text-primary-contrast ring-2 ring-primary/30'
                      : 'bg-success text-white'
              const lineClass = reached && !isLast ? 'bg-success' : 'bg-hairline'
              return (
                <div key={node.key} className="relative flex items-start gap-3">
                  <div className="flex shrink-0 flex-col items-center">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${circleClass}`}>
                      {node.kind === 'breach' ? '⊘' : reached ? '✓' : '○'}
                    </span>
                    {!isLast && <span className={`w-px flex-1 ${lineClass}`} style={{ minHeight: 22 }} />}
                  </div>
                  <div className="flex flex-1 items-center justify-between pb-4 pt-0.5">
                    <span
                      className={`text-[13px] ${
                        node.kind === 'breach'
                          ? 'font-bold text-danger'
                          : node.current
                            ? 'font-bold text-text-primary'
                            : reached
                              ? 'font-medium text-text-primary'
                              : 'text-text-secondary'
                      }`}
                    >
                      {node.label}
                      {node.current && <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-label text-primary">Current</span>}
                    </span>
                    <span className="text-[11px] text-text-secondary">{node.at !== null ? formatClockTime(node.at) : '—'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {request.specialInstructions && (
          <div>
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-label text-text-secondary">Special Instructions</h3>
            <p className="rounded-card border border-hairline bg-panel p-3 text-[13px] text-text-primary">{request.specialInstructions}</p>
          </div>
        )}

        <dl className="space-y-2 text-[13px]">
          <Row label="Room" value={request.room} />
          <Row label="Requested At" value={formatClockTime(request.requestedAt)} />
          <Row label="Promise" value={`${request.promiseMinutes} min (${request.promiseTier})`} />
          {server && <Row label="Server" value={server.name} />}
        </dl>

        {trip ? (
          <button
            onClick={() => openModal({ type: 'trip-detail', tripId: trip.id })}
            className="w-full rounded-button border border-hairline px-3 py-2.5 text-left text-[13px] font-semibold text-primary hover:bg-primary-tint"
          >
            Part of {trip.label} — view trip ›
          </button>
        ) : (
          isCommitted && (
            <p className="rounded-card border border-hairline bg-panel p-3 text-[12px] text-text-secondary">
              This request is already on the way and can't be cancelled from here.
            </p>
          )
        )}
      </div>
    </SlideOverPanel>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline/70 py-1.5">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-semibold text-text-primary">{value}</dd>
    </div>
  )
}
