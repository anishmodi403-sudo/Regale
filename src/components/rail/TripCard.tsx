import type { Trip } from '../../types'
import { useAppState } from '../../state/AppStateContext'
import { floorLabel } from '../../lib/format'
import { getTripDoneCount, getTripRunState, getTripStops } from '../../lib/tripStatus'
import { Avatar } from '../common/Avatar'
import { ChevronRight, SparkleIcon } from '../common/Icons'

export function TripCard({ trip }: { trip: Trip }) {
  const { requests, servers, openModal } = useAppState()

  const stops = getTripStops(trip, requests)
  const runState = getTripRunState(trip, stops)
  const doneCount = getTripDoneCount(stops)
  const itemSummary = stops.map((r) => r.item).join(', ')
  const floors = Array.from(new Set(stops.map((r) => r.floor))).sort((a, b) => a - b)
  const server = servers.find((s) => s.id === trip.assignedServerId)

  return (
    <div className="rounded-card border border-hairline bg-card shadow-card transition hover:shadow-hover">
      <button
        onClick={() => openModal({ type: 'trip-detail', tripId: trip.id })}
        className="flex w-full items-start justify-between gap-2 p-3.5 text-left"
      >
        <div className="min-w-0">
          <div className="text-[14px] font-bold text-text-primary">{trip.label}</div>
          <div className="mt-0.5 truncate text-[12px] text-text-secondary">{itemSummary}</div>
          <div className="mt-1 text-[11px] font-medium text-text-secondary">{floors.map(floorLabel).join(', ')}</div>
        </div>
        <ChevronRight size={16} className="mt-1 shrink-0 text-text-secondary" />
      </button>

      <div className="border-t border-hairline px-3.5 py-2.5">
        {runState === 'running' && server ? (
          <button
            onClick={() => openModal({ type: 'trip-detail', tripId: trip.id })}
            className="flex w-full items-center justify-between gap-2 rounded-button bg-warning-tint px-3 py-2 text-[12px] font-semibold text-warning transition hover:brightness-95"
          >
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warning" />
              </span>
              In progress · {server.name.split(' ')[0]} · {doneCount}/{stops.length} done
            </span>
            <Avatar name={server.name} initials={server.initials} size={20} />
          </button>
        ) : runState === 'done' ? (
          <div className="flex w-full items-center justify-center gap-1.5 rounded-button bg-success-tint px-3 py-2 text-[12px] font-semibold text-success">
            ✓ Completed
          </div>
        ) : runState === 'assigned' && server ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              openModal({ type: 'trip-detail', tripId: trip.id })
            }}
            className="flex w-full items-center justify-between gap-2 rounded-button bg-primary px-3 py-2 text-[12px] font-semibold text-primary-contrast transition hover:bg-primary-alt"
          >
            Start Trip
            <Avatar name={server.name} initials={server.initials} size={20} />
          </button>
        ) : trip.createdBy === 'ai' ? (
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
              <SparkleIcon size={11} /> Created through AI
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                openModal({ type: 'select-server', tripId: trip.id })
              }}
              className="flex items-center gap-0.5 rounded-button px-2 py-1 text-[12px] font-medium text-text-secondary transition hover:text-text-primary"
            >
              Assign <ChevronRight size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              openModal({ type: 'select-server', tripId: trip.id })
            }}
            className="w-full rounded-button border border-primary px-3 py-2 text-[12px] font-semibold text-primary transition hover:bg-primary-tint"
          >
            Assign to Server
          </button>
        )}
      </div>
    </div>
  )
}
