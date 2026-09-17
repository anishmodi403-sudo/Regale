import { useAppState } from '../../state/AppStateContext'
import { TripCard } from './TripCard'

/** The hero block of the right rail (spec §6.3) — deliberately the most
 * visually weighted section: bigger heading, generous card padding, and a
 * stateful footer per trip (see §7). */
export function TripsList() {
  const { trips } = useAppState()

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-extrabold uppercase tracking-label text-text-primary">Trips</h2>
        <span className="rounded-pill bg-primary-tint px-2 py-0.5 text-[11px] font-semibold text-primary">{trips.length}</span>
      </div>
      <div className="space-y-3">
        {trips.length === 0 && (
          <div className="rounded-card border border-dashed border-hairline p-4 text-center text-xs text-text-secondary">
            No trips yet — group nearby requests to build one.
          </div>
        )}
        {trips.map((t) => (
          <TripCard key={t.id} trip={t} />
        ))}
      </div>
    </section>
  )
}
