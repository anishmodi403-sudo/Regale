import { useMemo } from 'react'
import { useAppState } from '../../state/AppStateContext'
import { SlideOverPanel } from '../common/Overlay'
import { minutesLate, overdueLabel, timeStatus } from '../../lib/urgency'
import { Dot } from '../common/Pill'

export function AlertsAllPanel() {
  const { requests, now, closeModal, openModal } = useAppState()

  const alerts = useMemo(
    () =>
      requests
        .filter((r) => !r.scheduled && timeStatus(r, now) === 'breached')
        .sort((a, b) => minutesLate(b, now) - minutesLate(a, now)),
    [requests, now],
  )

  return (
    <SlideOverPanel title={`Live Alerts (${alerts.length})`} onClose={closeModal}>
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <p className="text-sm text-text-secondary">No active alerts — all clear.</p>
        ) : (
          alerts.map((r) => (
            <button
              key={r.id}
              onClick={() => openModal({ type: 'request-detail', requestId: r.id })}
              className="flex w-full items-center gap-2.5 rounded-card border border-hairline bg-card py-2.5 pl-0 pr-3 text-left shadow-card transition hover:-translate-y-0.5 hover:border-danger hover:shadow-hover"
            >
              <span className="h-9 w-1 shrink-0 self-stretch rounded-full bg-danger" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-text-primary">
                  {r.id} · {r.type} · {r.item}
                </div>
                <div className="text-[11px] font-medium text-danger">{overdueLabel(r, now)}</div>
              </div>
              <Dot tone="danger" className="shrink-0" />
            </button>
          ))
        )}
      </div>
    </SlideOverPanel>
  )
}
