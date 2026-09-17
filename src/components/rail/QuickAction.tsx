import { useAppState } from '../../state/AppStateContext'
import { SparkleIcon, PlusIcon } from '../common/Icons'

export function QuickAction() {
  const { openModal, suggestTripWithAI, autoMode, toggleAutoMode, autoModeLog } = useAppState()
  const pendingCount = autoModeLog.filter((e) => !e.undone).length

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-label text-text-secondary">Quick Action</h2>
      <div className="rounded-card border border-hairline bg-card p-3.5 shadow-card">
        <button
          onClick={() => openModal({ type: 'add-request' })}
          className="flex w-full items-center gap-2.5 rounded-button border border-hairline px-3 py-2.5 text-left transition hover:border-text-secondary/40 hover:bg-panel"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
            <PlusIcon size={15} />
          </span>
          <span>
            <div className="text-[13px] font-semibold text-text-primary">Add New Request</div>
            <div className="text-[11px] text-text-secondary">Create a new request</div>
          </span>
        </button>

        <button
          onClick={suggestTripWithAI}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-button bg-primary px-3 py-2.5 text-[13px] font-semibold text-primary-contrast shadow-card transition hover:bg-primary-alt"
        >
          <SparkleIcon size={14} />
          Suggest with AI
        </button>

        {/* Auto Mode (Iteration 2 §5): AI builds AND assigns trips to free
            servers on its own, breach-first, with no click needed —
            for when the coordinator is away or it's off-peak. */}
        <button
          onClick={toggleAutoMode}
          title="Auto Mode — AI builds & assigns trips"
          role="switch"
          aria-checked={autoMode}
          className={`mt-2 flex w-full items-center justify-between gap-2 rounded-button border px-3 py-2 text-[12px] font-semibold transition ${
            autoMode ? 'border-warning bg-warning-tint text-warning' : 'border-hairline text-text-secondary hover:text-text-primary'
          }`}
        >
          <span className="flex items-center gap-1.5">
            {autoMode && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warning" />
              </span>
            )}
            Auto Mode
          </span>
          <span
            className={`rounded-pill px-2 py-0.5 text-[10px] font-bold ${
              autoMode ? 'bg-warning text-white' : 'bg-panel text-text-secondary'
            }`}
          >
            {autoMode ? 'ON' : 'OFF'}
          </span>
        </button>
        <p className="mt-1 text-[10px] leading-snug text-text-secondary">AI builds & assigns trips to free servers automatically</p>

        {autoModeLog.length > 0 && (
          <button
            onClick={() => openModal({ type: 'auto-mode-log' })}
            className="mt-2 text-[11px] font-semibold text-primary hover:underline"
          >
            View Auto Mode Activity ({pendingCount}) ›
          </button>
        )}
      </div>
    </section>
  )
}
