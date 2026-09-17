import { useMemo } from 'react'
import { useAppState } from '../../state/AppStateContext'
import { useLiveKpis } from '../../state/useKpis'
import { columnFor, compareWithinColumn, timeStatus } from '../../lib/urgency'
import { KanbanColumn } from './KanbanColumn'
import { AfterRushView } from './AfterRushView'
import { SelectionBar } from '../common/SelectionBar'
import { Dot, Pill } from '../common/Pill'
import { ChevronRight } from '../common/Icons'
import { SelectChip } from '../common/SelectChip'

export function CommandView() {
  const { now, afterRush, toggleAfterRush, setView, selectMode, setSelectMode, filters, setFilters, servers } = useAppState()
  const kpis = useLiveKpis()

  const filtered = useMemo(() => {
    return kpis.live.filter((r) => {
      if (filters.breachedOnly && timeStatus(r, now) !== 'breached') return false
      if (filters.floor !== null && r.floor !== filters.floor) return false
      if (filters.serverId && r.assignedServerId !== filters.serverId) return false
      return true
    })
  }, [kpis.live, filters, now])

  const columns = useMemo(() => {
    const grouped: Record<'breached' | 'to_do' | 'in_progress', typeof filtered> = {
      breached: [],
      to_do: [],
      in_progress: [],
    }
    for (const r of filtered) grouped[columnFor(r, now)].push(r)
    grouped.breached.sort(compareWithinColumn('breached', now))
    grouped.to_do.sort(compareWithinColumn('to_do', now))
    grouped.in_progress.sort(compareWithinColumn('in_progress', now))
    return grouped
  }, [filtered, now])

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">{afterRush ? 'After the Rush' : 'Command View'}</h1>
          <button
            onClick={toggleAfterRush}
            className={`rounded-pill border px-3 py-1.5 text-xs font-semibold transition ${
              afterRush
                ? 'border-primary bg-primary text-primary-contrast'
                : 'border-hairline bg-card text-text-secondary hover:text-text-primary'
            }`}
          >
            ⟳ After the Rush
          </button>
        </div>

        {!afterRush && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-text-primary">{kpis.total} Live requests</span>
            <Pill tone="warning">{kpis.atRisk} At-risk</Pill>
            <Pill tone="danger">{kpis.breached} Breached</Pill>
            <Pill tone="info">{kpis.toDo} To Do</Pill>
          </div>
        )}
      </div>

      {afterRush ? (
        <div className="min-h-0 flex-1 overflow-y-auto thin-scroll">
          <AfterRushView />
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Dot tone="success" />
              Sorted by urgency
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilters({ breachedOnly: !filters.breachedOnly })}
                className={`rounded-button border px-2.5 py-1.5 text-xs font-semibold transition ${
                  filters.breachedOnly ? 'border-danger bg-danger-tint text-danger' : 'border-hairline text-text-secondary hover:text-text-primary'
                }`}
                title="Quick filter — breached only (b)"
              >
                Breached only
              </button>
              <SelectChip
                value={filters.floor !== null ? String(filters.floor) : ''}
                onChange={(v) => setFilters({ floor: v ? Number(v) : null })}
                options={[
                  { value: '', label: 'All floors' },
                  ...Array.from({ length: 12 }, (_, i) => i + 1).map((f) => ({ value: String(f), label: `F${f}` })),
                ]}
              />
              <SelectChip
                value={filters.serverId ?? ''}
                onChange={(v) => setFilters({ serverId: v || null })}
                options={[{ value: '', label: 'All servers' }, ...servers.map((s) => ({ value: s.id, label: s.name }))]}
              />
              <button
                onClick={() => setSelectMode(!selectMode)}
                className={`rounded-button border px-2.5 py-1.5 text-xs font-semibold transition ${
                  selectMode ? 'border-primary bg-primary-tint text-primary' : 'border-hairline text-text-secondary hover:text-text-primary'
                }`}
              >
                {selectMode ? 'Cancel select' : 'Select'}
              </button>
              <button
                onClick={() => setView('floor-cluster')}
                className="flex items-center gap-1.5 rounded-button border border-hairline px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition hover:text-text-primary"
              >
                ⧉ Floor-Cluster View <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="mt-4 min-h-0 flex-1">
            <div className="grid h-full grid-cols-3 gap-4">
              <KanbanColumn title="Breached Promise Time" tone="danger" count={columns.breached.length} requests={columns.breached} emptyHint="No breaches right now" />
              <KanbanColumn title="To Do" tone="info" count={columns.to_do.length} requests={columns.to_do} emptyHint="Nothing waiting" />
              <KanbanColumn title="In Progress" tone="warning" count={columns.in_progress.length} requests={columns.in_progress} emptyHint="Nothing on the way" />
            </div>
          </div>

          {selectMode && <SelectionBar />}
        </>
      )}
    </div>
  )
}
