import type { ServiceRequest } from '../../types'
import { useAppState } from '../../state/AppStateContext'
import { columnFor, statusPillFor, timeStatus, timerLabel } from '../../lib/urgency'
import { floorLabel } from '../../lib/format'
import { Pill } from '../common/Pill'
import { BellIcon, ChevronRight } from '../common/Icons'

// No left-bar and no resting tint (Iteration 2 §2, refined) — every card,
// breached included, is a plain neutral card at rest. Color lives only on
// the status pill and the timer; a full column-colored outline appears on
// hover only, purely as an interaction cue.
const COLUMN_HOVER_OUTLINE: Record<'breached' | 'to_do' | 'in_progress', string> = {
  breached: 'hover:border-danger',
  to_do: 'hover:border-info',
  in_progress: 'hover:border-warning',
}

export function RequestCard({ request }: { request: ServiceRequest }) {
  const { now, openModal, selectMode, selection, toggleSelected } = useAppState()
  const column = columnFor(request, now)
  const status = timeStatus(request, now)
  const pill = statusPillFor(request, now)
  const isSelected = selection.has(request.id)

  const timerColor = status === 'breached' ? 'text-danger' : status === 'at_risk' ? 'text-warning' : 'text-text-primary'

  function handleClick() {
    if (selectMode) {
      toggleSelected(request.id)
    } else {
      openModal({ type: 'request-detail', requestId: request.id })
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === 'Enter' ? handleClick() : undefined)}
      className={`group cursor-pointer rounded-card border bg-card p-3.5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover hover:brightness-95 dark:hover:brightness-110 ${
        isSelected ? 'border-primary ring-1 ring-primary' : `border-hairline ${COLUMN_HOVER_OUTLINE[column]}`
      }`}
    >
      {/* Zone A — Identity */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          {selectMode && (
            // No onClick/stopPropagation here — the click is meant to bubble
            // up to the card's own onClick (handleClick), which is already
            // the single source of truth for toggling selection. That's what
            // makes the whole card (checkbox included) one click target.
            <input type="checkbox" readOnly checked={isSelected} className="mr-1 h-4 w-4 accent-primary" />
          )}
          <span className="text-xl font-extrabold leading-none text-text-primary">{request.id}</span>
          <span className="rounded-md bg-panel px-1.5 py-0.5 text-[11px] font-semibold text-text-secondary">
            {floorLabel(request.floor)}
          </span>
        </div>
        {/* Muted further per Iteration §7 — the room ID stays the loudest element on the card */}
        <span className="shrink-0 text-[10px] font-normal text-text-secondary/70">{request.code}</span>
      </div>

      {/* Zone B — Task */}
      <div className="mt-1.5 text-[13px] text-text-secondary">
        {request.type} · <span className="font-semibold text-text-primary">{request.item}</span>
      </div>

      <div className="my-3 h-px bg-hairline" />

      {/* Zone C — Status */}
      <div className="flex items-center justify-between gap-2">
        <Pill tone={pill.tone}>{pill.label}</Pill>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-[13px] font-bold ${timerColor}`}>
            {status === 'breached' && <BellIcon size={13} className="animate-bell-ring text-danger" />}
            {timerLabel(request, now)}
          </span>
          <ChevronRight
            size={16}
            className="text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary"
          />
        </div>
      </div>
    </div>
  )
}
