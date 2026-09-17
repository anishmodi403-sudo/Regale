import type { KitchenItem } from '../../types'
import { useAppState } from '../../state/AppStateContext'
import { freshnessFor } from '../../lib/urgency'
import { minutesBetween } from '../../lib/format'
import { Pill } from '../common/Pill'

const FRESHNESS_META: Record<
  'fresh' | 'cooling' | 'urgent',
  { label: string; tone: 'success' | 'warning' | 'danger'; tile: string }
> = {
  fresh: { label: 'Fresh', tone: 'success', tile: 'bg-success-tint text-success' },
  cooling: { label: 'Cooling', tone: 'warning', tile: 'bg-warning-tint text-warning' },
  urgent: { label: 'Urgent', tone: 'danger', tile: 'bg-danger-tint text-danger' },
}

export function KitchenRow({ item }: { item: KitchenItem }) {
  const { now } = useAppState()
  const freshness = freshnessFor(item.readyAt, now)
  const meta = FRESHNESS_META[freshness]
  const elapsed = minutesBetween(item.readyAt, now)

  return (
    <div className="flex items-center gap-2.5 rounded-card border border-hairline bg-card p-2.5 shadow-card">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm ${meta.tile}`}>
        {item.type === 'Food' ? '🍽' : '☕'}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold text-text-primary">RM {item.room}</div>
        <div className="truncate text-[11px] text-text-secondary">
          {item.type} • {item.itemsCount} item{item.itemsCount === 1 ? '' : 's'}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="text-[11px] font-medium text-text-secondary">{elapsed}m</span>
        <Pill tone={meta.tone}>{meta.label}</Pill>
      </div>
    </div>
  )
}
