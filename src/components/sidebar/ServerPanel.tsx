import { useAppState } from '../../state/AppStateContext'
import { ServerRow } from './ServerRow'

export function ServerPanel() {
  const { servers } = useAppState()

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-label text-text-secondary">Server Panel</h2>
        <span className="rounded-pill bg-success-tint px-2 py-0.5 text-[11px] font-semibold text-success">
          {servers.length} servers
        </span>
      </div>
      <div className="space-y-2">
        {servers.map((s) => (
          <ServerRow key={s.id} server={s} />
        ))}
      </div>
    </section>
  )
}
