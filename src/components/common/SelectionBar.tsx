import { useMemo } from 'react'
import { useAppState } from '../../state/AppStateContext'
import { floorLabel } from '../../lib/format'

/** Sticky selection summary shared by Floor-Cluster View and kanban select
 * mode (spec §5.3) — the entry point into the Trip Builder. */
export function SelectionBar() {
  const { selection, requests, createTripFromSelection, clearSelection } = useAppState()

  const summary = useMemo(() => {
    const selected = requests.filter((r) => selection.has(r.id))
    const byFloor = new Map<number, string[]>()
    for (const r of selected) {
      const list = byFloor.get(r.floor) ?? []
      list.push(r.id)
      byFloor.set(r.floor, list)
    }
    const floors = Array.from(byFloor.keys()).sort((a, b) => a - b)
    const breakdown = floors.map((f) => `${floorLabel(f)} (${byFloor.get(f)!.join(', ')})`).join(' • ')
    return { count: selected.length, breakdown, floorCount: floors.length }
  }, [selection, requests])

  if (summary.count === 0) return null

  return (
    <div className="sticky bottom-0 z-10 mt-4 flex flex-wrap items-center gap-3 rounded-card border border-hairline bg-card px-4 py-3 shadow-hover">
      <span className="text-[13px] text-text-primary">
        <span className="font-bold">☑ {summary.count} requests selected</span>
        {summary.breakdown && <span className="text-text-secondary"> · {summary.breakdown}</span>}
        <span className="text-text-secondary">
          {' '}
          · Est. stops: {summary.count} · Floors: {summary.floorCount}
        </span>
      </span>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={clearSelection} className="text-[12px] font-semibold text-text-secondary hover:text-text-primary">
          Clear
        </button>
        <button
          onClick={createTripFromSelection}
          className="flex items-center gap-1.5 rounded-button bg-primary px-4 py-2 text-[13px] font-semibold text-primary-contrast hover:bg-primary-alt"
        >
          👥 Create Trip — Assign to a free server ›
        </button>
      </div>
    </div>
  )
}
