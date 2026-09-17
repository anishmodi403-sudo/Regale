import { useMemo, useState } from 'react'
import { useAppState } from '../../state/AppStateContext'
import { useLiveKpis } from '../../state/useKpis'
import { timeStatus } from '../../lib/urgency'
import { FloorGroup } from './FloorGroup'
import { AfterRushView } from '../board/AfterRushView'
import { SelectionBar } from '../common/SelectionBar'
import { Pill } from '../common/Pill'
import { InfoIcon } from '../common/Icons'
import { SelectChip } from '../common/SelectChip'

type GroupMode = 'smart' | 'all'
type SortMode = 'urgency' | 'floor'

export function FloorClusterView() {
  const { setView, afterRush, toggleAfterRush } = useAppState()
  const kpis = useLiveKpis()
  const [autoGroup, setAutoGroup] = useState(true)
  const [groupMode, setGroupMode] = useState<GroupMode>('smart')
  const [sortMode, setSortMode] = useState<SortMode>('urgency')

  const byFloor = useMemo(() => {
    const map = new Map<number, typeof kpis.live>()
    for (const r of kpis.live) {
      const list = map.get(r.floor) ?? []
      list.push(r)
      map.set(r.floor, list)
    }
    return map
  }, [kpis.live])

  // "Nearby floors (Smart)" only surfaces floors that actually have
  // something happening; "All floors" lists every floor 1–12 so the
  // coordinator can see the whole building at a glance, empty ones included.
  const floorsSorted = useMemo(() => {
    const floors = groupMode === 'all' ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from(byFloor.keys())
    return floors.sort((a, b) => {
      if (sortMode === 'floor') return a - b
      const sevA = severityRank(byFloor.get(a) ?? [])
      const sevB = severityRank(byFloor.get(b) ?? [])
      if (sevA !== sevB) return sevB - sevA
      return a - b
    })
  }, [byFloor, groupMode, sortMode])

  const [expandedFloors, setExpandedFloors] = useState<Set<number>>(
    () => new Set(floorsSorted.filter((f) => severityRank(byFloor.get(f)!) > 0)),
  )

  function severityRank(list: ReturnType<typeof useLiveKpis>['live']) {
    const now = Date.now()
    if (list.some((r) => timeStatus(r, now) === 'breached')) return 2
    if (list.some((r) => timeStatus(r, now) === 'at_risk')) return 1
    return 0
  }

  function toggleFloor(floor: number) {
    setExpandedFloors((prev) => {
      const next = new Set(prev)
      if (next.has(floor)) next.delete(floor)
      else next.add(floor)
      return next
    })
  }

  if (afterRush) {
    return (
      <div className="flex h-full flex-col p-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">After the Rush</h1>
          <button
            onClick={toggleAfterRush}
            className="rounded-pill border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-contrast transition"
          >
            ⟳ After the Rush
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto thin-scroll">
          <AfterRushView />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="flex items-center gap-1.5 text-2xl font-bold text-text-primary">
            Floor-Cluster View <InfoIcon size={16} className="text-text-secondary" />
          </h1>
          <button
            onClick={toggleAfterRush}
            className={`rounded-pill border px-3 py-1.5 text-xs font-semibold transition ${
              afterRush ? 'border-primary bg-primary text-primary-contrast' : 'border-hairline bg-card text-text-secondary hover:text-text-primary'
            }`}
          >
            ⟳ After the Rush
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-text-primary">{kpis.total} Live requests</span>
          <Pill tone="warning">{kpis.atRisk} At-risk</Pill>
          <Pill tone="danger">{kpis.breached} Breached</Pill>
          <Pill tone="info">{kpis.toDo} To Do</Pill>
        </div>
      </div>

      <p className="mt-1.5 text-[13px] italic text-text-secondary">
        Nearby floors with active requests. Select requests to create a trip.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SelectChip
          prefixLabel="Grouped by"
          value={groupMode}
          onChange={(v) => setGroupMode(v as GroupMode)}
          options={[
            { value: 'smart', label: 'Nearby floors (Smart)' },
            { value: 'all', label: 'All floors (1–12)' },
          ]}
        />
        <SelectChip
          prefixLabel="Sort by"
          value={sortMode}
          onChange={(v) => setSortMode(v as SortMode)}
          options={[
            { value: 'urgency', label: 'Urgency' },
            { value: 'floor', label: 'Floor' },
          ]}
        />
        <button
          onClick={() => setAutoGroup((v) => !v)}
          className="flex items-center gap-1.5 rounded-button border border-hairline bg-card px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition hover:text-text-primary"
        >
          Auto group
          <span className={`h-2.5 w-2.5 rounded-full ${autoGroup ? 'bg-success' : 'bg-hairline'}`} />
        </button>
        <button onClick={() => setView('command')} className="ml-auto text-xs font-semibold text-primary hover:underline">
          ‹ Back to Command View
        </button>
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto thin-scroll pb-2">
        {floorsSorted.map((floor) => (
          <FloorGroup
            key={floor}
            floor={floor}
            requests={byFloor.get(floor) ?? []}
            expanded={expandedFloors.has(floor)}
            onToggle={() => toggleFloor(floor)}
          />
        ))}
        {floorsSorted.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-card border border-dashed border-hairline text-sm text-text-secondary">
            No active requests right now.
          </div>
        )}
      </div>

      <SelectionBar />
    </div>
  )
}
