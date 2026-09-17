import type { ReactNode } from 'react'
import type { ServiceRequest } from '../../types'
import { RequestCard } from '../cards/RequestCard'
import { Dot, type PillTone } from '../common/Pill'

// Column body tint is deliberately faint in light mode — just enough to
// group Breached / To Do / In Progress (Iteration §5) — and removed
// entirely in dark mode (Iteration 2 §3): all three columns share the same
// neutral dark panel there, so color never washes across a whole column.
// The header dot is the only column color that survives into dark mode.
const TINT_BG: Record<PillTone, string> = {
  danger: 'bg-danger-wash dark:bg-panel',
  warning: 'bg-warning-wash dark:bg-panel',
  info: 'bg-info-wash dark:bg-panel',
  success: 'bg-success-wash dark:bg-panel',
  primary: 'bg-primary-wash dark:bg-panel',
  neutral: 'bg-panel',
}

export function KanbanColumn({
  title,
  tone,
  count,
  requests,
  emptyHint,
}: {
  title: string
  tone: PillTone
  count: number
  requests: ServiceRequest[]
  emptyHint: string
}) {
  return (
    <div className={`flex h-full flex-col rounded-card border border-hairline ${TINT_BG[tone]}`}>
      <div className="flex items-center gap-2 border-b border-text-secondary/20 px-4 py-3">
        <Dot tone={tone} />
        <h3 className="text-sm font-bold text-text-primary">{title}</h3>
        <span className="ml-auto rounded-pill bg-card px-2 py-0.5 text-xs font-semibold text-text-secondary shadow-card">
          {count}
        </span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto thin-scroll p-3">
        {requests.length === 0 ? (
          <EmptyState hint={emptyHint} />
        ) : (
          requests.map((r) => <RequestCard key={r.id} request={r} />)
        )}
      </div>
    </div>
  )
}

function EmptyState({ hint }: { hint: string }) {
  return (
    <div className="flex h-32 flex-col items-center justify-center rounded-card border border-dashed border-hairline text-center text-xs text-text-secondary">
      {hint}
    </div>
  )
}

export function ColumnScaffold({ children }: { children: ReactNode }) {
  return <div className="grid h-full grid-cols-3 gap-4">{children}</div>
}
