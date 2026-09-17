import { useAppState } from '../../state/AppStateContext'
import { Avatar } from '../common/Avatar'
import { Pill } from '../common/Pill'
import { CloseIcon } from '../common/Icons'

const STATUS_META: Record<'assigned' | 'on_trip' | 'room_task' | 'free', { label: string; tone: 'primary' | 'warning' | 'info' | 'success' }> = {
  assigned: { label: 'ASSIGNED', tone: 'primary' },
  on_trip: { label: 'ON TRIP', tone: 'warning' },
  room_task: { label: 'ROOM TASK', tone: 'info' },
  free: { label: 'FREE', tone: 'success' },
}

export function SelectServerPopover({ tripId }: { tripId: string }) {
  const { trips, servers, closeModal, assignServerToTrip } = useAppState()
  const trip = trips.find((t) => t.id === tripId)
  if (!trip) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-text-primary/20 p-8" onClick={closeModal}>
      <div
        className="relative mr-[300px] w-[300px] animate-slide-in-right rounded-card border border-hairline bg-card p-4 shadow-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="absolute -bottom-2 right-10 h-4 w-4 rotate-45 border-b border-r border-hairline bg-card" />
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-label text-text-secondary">
            Select Server for {trip.label}
          </h3>
          <button onClick={closeModal} aria-label="Close" className="text-text-secondary hover:text-text-primary">
            <CloseIcon size={14} />
          </button>
        </div>
        <div className="space-y-1.5">
          {servers.map((s) => {
            const meta = STATUS_META[s.status]
            return (
              <button
                key={s.id}
                onClick={() => assignServerToTrip(trip.id, s.id)}
                className="flex w-full items-center gap-2.5 rounded-button px-2 py-2 text-left transition hover:bg-panel"
              >
                <Avatar name={s.name} initials={s.initials} size={28} presence={s.status !== 'free' ? 'active' : undefined} />
                <span className="flex-1 text-[13px] font-semibold text-text-primary">{s.name}</span>
                <Pill tone={meta.tone}>{meta.label}</Pill>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
