import { useAppState } from '../../state/AppStateContext'
import { SlideOverPanel } from '../common/Overlay'
import { floorLabel, formatClockTime } from '../../lib/format'
import { getTripDoneCount, getTripRunState, getTripStops, type TripRunState } from '../../lib/tripStatus'
import { Pill, type PillTone } from '../common/Pill'
import { SparkleIcon, CloseIcon } from '../common/Icons'

const RUN_STATE_META: Record<TripRunState, { label: string; tone: PillTone }> = {
  created: { label: 'CREATED', tone: 'neutral' },
  assigned: { label: 'ASSIGNED', tone: 'primary' },
  running: { label: 'RUNNING', tone: 'warning' },
  done: { label: 'DONE', tone: 'success' },
}

export function TripDetailPanel({ tripId }: { tripId: string }) {
  const { trips, requests, servers, closeModal, openModal, removeStopFromTrip, startTrip } = useAppState()

  const trip = trips.find((t) => t.id === tripId)
  if (!trip) return null

  const stops = getTripStops(trip, requests)
  const runState = getTripRunState(trip, stops)
  const doneCount = getTripDoneCount(stops)
  const floors = Array.from(new Set(stops.map((r) => r.floor))).sort((a, b) => a - b)
  const itemSummary = stops.map((r) => r.item).join(', ')
  const totalItems = stops.reduce((sum, r) => sum + r.itemsCount, 0)
  const server = servers.find((s) => s.id === trip.assignedServerId)
  const runMeta = RUN_STATE_META[runState]

  return (
    <SlideOverPanel
      title={trip.label}
      width={460}
      titleAdornment={
        <div className="flex items-center gap-1.5">
          {trip.createdBy === 'ai' && (
            <Pill tone="primary" icon={<SparkleIcon size={10} />}>
              AI CREATED
            </Pill>
          )}
          <Pill tone={runMeta.tone}>{runMeta.label}</Pill>
        </div>
      }
      onClose={closeModal}
      footer={
        runState === 'assigned' ? (
          <button
            onClick={() => startTrip(trip.id)}
            className="w-full rounded-button bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast hover:bg-primary-alt"
          >
            Start Trip
          </button>
        ) : runState === 'running' ? (
          <div className="flex w-full items-center justify-center gap-1.5 rounded-button bg-warning-tint px-4 py-2.5 text-sm font-semibold text-warning">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warning" />
            </span>
            In progress · {doneCount}/{stops.length} done
          </div>
        ) : runState === 'done' ? (
          <div className="w-full rounded-button bg-success-tint px-4 py-2.5 text-center text-sm font-semibold text-success">
            ✓ Trip completed
          </div>
        ) : (
          <button
            onClick={() => openModal({ type: 'select-server', tripId: trip.id })}
            className="w-full rounded-button bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast hover:bg-primary-alt"
          >
            Assign to Server ›
          </button>
        )
      }
    >
      <div className="space-y-6">
        <div>
          <p className="text-[13px] text-text-secondary">{itemSummary}</p>
          <p className="mt-0.5 text-[12px] font-medium text-text-secondary">{floors.map(floorLabel).join(', ')}</p>
        </div>

        <section>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-label text-text-secondary">Trip Overview</h3>
          <div className="grid grid-cols-2 gap-2.5">
            <StatTile value={String(stops.length)} label="Stops" />
            <StatTile value={`${trip.distanceKm} km`} label="Est. Distance" />
            <StatTile value={`${trip.estMinutes} min`} label="Est. Time" />
            <StatTile value={trip.priority} label="Priority" />
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-label text-text-secondary">Stops ({stops.length})</h3>
            {runState !== 'created' && (
              <span className="text-[11px] font-semibold text-text-secondary">
                {doneCount}/{stops.length} done
              </span>
            )}
          </div>
          <div className="relative space-y-3">
            {stops.map((r, i) => {
              const isLast = i === stops.length - 1
              const marker =
                r.progressState === 'completed'
                  ? { icon: '✓', ring: 'bg-success text-white', line: 'bg-success', label: 'Done', labelTone: 'text-success' }
                  : r.progressState === 'in_progress'
                    ? { icon: String(i + 1), ring: 'bg-warning-tint text-warning ring-2 ring-warning', line: 'bg-hairline', label: 'On the way', labelTone: 'text-warning' }
                    : { icon: String(i + 1), ring: 'bg-panel text-text-secondary', line: 'bg-hairline', label: 'Not started', labelTone: 'text-text-secondary' }

              return (
                <div key={r.id} className="relative flex items-start gap-3">
                  <div className="flex shrink-0 flex-col items-center">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${marker.ring}`}>
                      {marker.icon}
                    </span>
                    {!isLast && <span className={`mt-1 w-px flex-1 ${marker.line}`} style={{ minHeight: 28 }} />}
                  </div>
                  <div className="flex-1 rounded-card border border-hairline bg-card p-3 pb-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-text-primary">
                          {floorLabel(r.floor)} · Room {r.room}{' '}
                          <span className="font-normal text-text-secondary/70">· {r.code}</span>
                        </div>
                        <div className="text-[12px] text-text-secondary">
                          {r.type} • {r.itemsCount} item{r.itemsCount === 1 ? '' : 's'} — Requested at {formatClockTime(r.requestedAt)}
                        </div>
                      </div>
                      {r.progressState !== 'completed' && (
                        <button
                          onClick={() => removeStopFromTrip(trip.id, r.id)}
                          aria-label={`Remove ${r.id} from trip`}
                          className="shrink-0 text-text-secondary transition hover:text-danger"
                        >
                          <CloseIcon size={14} />
                        </button>
                      )}
                    </div>
                    <span className={`mt-1.5 inline-block text-[11px] font-semibold ${marker.labelTone}`}>{marker.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-label text-text-secondary">Trip Details</h3>
          <dl className="space-y-2 text-[13px]">
            <Row label="Total Items" value={`${totalItems} items`} />
            <Row label="Estimated Distance" value={`${trip.distanceKm} km`} />
            <Row label="Estimated Time" value={`${trip.estMinutes} min`} />
            <Row label="Priority" value={trip.priority} />
            <Row label="Suggested At" value={formatClockTime(trip.suggestedAt)} />
            <Row label="Created By" value={trip.createdBy === 'ai' ? 'AI Assistant' : 'Coordinator'} />
            {server && <Row label="Assigned Server" value={server.name} />}
          </dl>
        </section>
      </div>
    </SlideOverPanel>
  )
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-card border border-hairline bg-panel p-3 text-center">
      <div className="text-base font-extrabold text-text-primary">{value}</div>
      <div className="text-[11px] text-text-secondary">{label}</div>
    </div>
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
