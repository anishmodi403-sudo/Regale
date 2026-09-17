import type { ServiceRequest } from '../../types'
import { useAppState } from '../../state/AppStateContext'
import { minutesLate, minutesLeft, timeStatus } from '../../lib/urgency'
import { floorLabel, formatClockTime } from '../../lib/format'
import { Pill, type PillTone } from '../common/Pill'
import { ChevronDown } from '../common/Icons'

const TYPE_ICON: Record<ServiceRequest['type'], string> = {
  'Meal Request': '🍽',
  Beverage: '☕',
  Supplies: '🧺',
  'Room Task': '🛎',
  Pickup: '📦',
}

function statusMeta(status: 'on_time' | 'at_risk' | 'breached', inProgress: boolean): { label: string; tone: PillTone } {
  if (status === 'breached') return { label: 'BREACHED', tone: 'danger' }
  if (status === 'at_risk') return { label: 'AT RISK', tone: 'warning' }
  return inProgress ? { label: 'ON THE WAY', tone: 'warning' } : { label: 'TO DO', tone: 'info' }
}

export function FloorGroup({
  floor,
  requests,
  expanded,
  onToggle,
}: {
  floor: number
  requests: ServiceRequest[]
  expanded: boolean
  onToggle: () => void
}) {
  const { now, selection, toggleSelected } = useAppState()

  const breachedCount = requests.filter((r) => timeStatus(r, now) === 'breached').length
  const atRiskCount = requests.filter((r) => timeStatus(r, now) === 'at_risk').length
  const toDoCount = requests.length - breachedCount - atRiskCount
  const isEmpty = requests.length === 0

  const severity = breachedCount > 0 ? 'High' : atRiskCount > 0 ? 'At risk' : isEmpty ? 'Quiet' : 'Normal'
  const barTone = breachedCount > 0 ? 'bg-danger' : atRiskCount > 0 ? 'bg-warning' : isEmpty ? 'bg-hairline' : 'bg-success'

  const summaryParts = [
    breachedCount > 0 ? `${breachedCount} Breached` : null,
    atRiskCount > 0 ? `${atRiskCount} At-risk` : null,
    toDoCount > 0 ? `${toDoCount} To Do` : null,
  ].filter(Boolean)

  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-card shadow-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-panel"
      >
        <span className={`h-8 w-1 shrink-0 rounded-full ${barTone}`} />
        <span className="text-[14px] font-bold text-text-primary">{floorLabel(floor)}</span>
        <span className="text-[12px] text-text-secondary">· {requests.length} · {severity} urgency</span>
        <span className="ml-auto text-[12px] text-text-secondary">{summaryParts.join(' · ')}</span>
        <ChevronDown size={14} className={`shrink-0 text-text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && isEmpty && (
        <div className="border-t border-hairline px-4 py-4 text-center text-[12px] text-text-secondary">
          No active requests on this floor.
        </div>
      )}

      {expanded && !isEmpty && (
        <div className="overflow-x-auto border-t border-hairline">
          <table className="w-full min-w-[560px] text-left text-[12px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-label text-text-secondary">
                <th className="w-8 px-3 py-2"></th>
                <th className="px-2 py-2">ID</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Room</th>
                <th className="px-2 py-2">Requested</th>
                <th className="px-2 py-2">Promise</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const status = timeStatus(r, now)
                const meta = statusMeta(status, r.progressState === 'in_progress')
                const rowTint = status === 'breached' ? 'bg-danger-wash' : status === 'at_risk' ? 'bg-warning-wash' : ''
                const promiseAt = r.requestedAt + r.promiseMinutes * 60_000
                const promiseText =
                  status === 'breached'
                    ? `${formatClockTime(promiseAt)} (${minutesLate(r, now)}m late)`
                    : `${formatClockTime(promiseAt)} (${minutesLeft(r, now)}m left)`

                return (
                  <tr key={r.id} className={`border-t border-hairline/60 transition hover:brightness-95 dark:hover:brightness-110 ${rowTint}`}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selection.has(r.id)}
                        onChange={() => toggleSelected(r.id)}
                        className="h-4 w-4 accent-primary"
                      />
                    </td>
                    <td className="px-2 py-2 font-bold text-text-primary">{r.id}</td>
                    <td className="px-2 py-2 text-text-secondary">
                      {TYPE_ICON[r.type]} {r.type}
                    </td>
                    <td className="px-2 py-2 text-text-secondary">{r.room}</td>
                    <td className="px-2 py-2 text-text-secondary">{formatClockTime(r.requestedAt)}</td>
                    <td className="px-2 py-2 text-text-secondary">{promiseText}</td>
                    <td className="px-2 py-2">
                      <Pill tone={meta.tone}>{meta.label}</Pill>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
