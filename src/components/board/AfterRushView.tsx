import { useMemo, type ReactNode } from 'react'
import { useAppState } from '../../state/AppStateContext'
import { computeRushStats, formatMinutes, formatPercent } from '../../lib/rushStats'
import { floorLabel } from '../../lib/format'

/** A calm, reflective review of the rush just finished — deliberately the
 * opposite register of the live board: generous whitespace, large numbers,
 * nothing ticking or pulsing (Iteration §8). Toggling "After the Rush"
 * off returns to the live Command View. */
export function AfterRushView() {
  const { requests, trips } = useAppState()
  const stats = useMemo(() => computeRushStats(requests, trips, Date.now()), [requests, trips])

  const hasAnyData = requests.some((r) => !r.scheduled)

  return (
    <div className="mx-auto w-full max-w-3xl py-10">
      <p className="text-center text-sm text-text-secondary">
        A calmer look back at the shift so far — no timers, no urgency, just the numbers.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile value={formatPercent(stats.onTimeRate)} label="On-time completion rate" />
        <StatTile value={formatMinutes(stats.avgDoneMinutes)} label="Avg request-to-done time" />
        <StatTile value={String(stats.breachedCount)} label="Breached this rush" tone={stats.breachedCount > 0 ? 'danger' : undefined} />
        <StatTile
          value={stats.requestsPerTrip !== null ? stats.requestsPerTrip.toFixed(1) : '—'}
          label="Requests per trip"
          highlight
        />
        <StatTile value={formatMinutes(stats.avgClearingMinutes)} label="Avg tray / pickup clearing time" />
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-center text-[11px] font-bold uppercase tracking-label text-text-secondary">Patterns</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PatternCard title="Busiest floors">
            {stats.busiestFloors.length === 0 ? (
              <EmptyLine />
            ) : (
              stats.busiestFloors.map((f) => <PatternRow key={f.floor} label={floorLabel(f.floor)} value={`${f.count} requests`} />)
            )}
          </PatternCard>

          <PatternCard title="Most breaches by type">
            {stats.breachesByType.length === 0 ? (
              <EmptyLine text="No breaches — clean rush." />
            ) : (
              stats.breachesByType.map((b) => <PatternRow key={b.type} label={b.type} value={`${b.count}`} />)
            )}
          </PatternCard>

          <PatternCard title="Fullest trips">
            {stats.fullestTrips.length === 0 ? (
              <EmptyLine text="No trips built yet." />
            ) : (
              stats.fullestTrips.map((t) => <PatternRow key={t.label} label={t.label} value={`${t.stops} stops`} />)
            )}
          </PatternCard>
        </div>
      </div>

      {!hasAnyData && (
        <p className="mt-10 text-center text-xs text-text-secondary">
          Nothing has come through yet — these numbers will fill in as the shift runs.
        </p>
      )}
    </div>
  )
}

function StatTile({
  value,
  label,
  tone,
  highlight,
}: {
  value: string
  label: string
  tone?: 'danger'
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-card border p-6 text-center ${
        highlight ? 'border-primary/30 bg-primary-tint' : 'border-hairline bg-card'
      }`}
    >
      <div className={`text-3xl font-extrabold ${tone === 'danger' ? 'text-danger' : highlight ? 'text-primary' : 'text-text-primary'}`}>
        {value}
      </div>
      <div className="mt-1.5 text-[12px] leading-snug text-text-secondary">{label}</div>
    </div>
  )
}

function PatternCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-card border border-hairline bg-card p-4">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-label text-text-secondary">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function PatternRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="font-medium text-text-primary">{label}</span>
      <span className="text-text-secondary">{value}</span>
    </div>
  )
}

function EmptyLine({ text = 'Not enough data yet.' }: { text?: string }) {
  return <p className="text-[12px] text-text-secondary">{text}</p>
}
