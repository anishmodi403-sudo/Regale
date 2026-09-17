import { useAppState } from '../../state/AppStateContext'
import { SlideOverPanel } from '../common/Overlay'
import { formatClockTime } from '../../lib/format'

/** The Auto Mode action feed (Iteration 2 §5) — every autonomous
 * assignment is logged here so the coordinator can review and reverse
 * what AI did while they were away. Undo here works even after the
 * original toast has long since disappeared. */
export function AutoModeLogPanel() {
  const { autoModeLog, closeModal, undoAutoModeAction, autoMode } = useAppState()

  return (
    <SlideOverPanel
      title="Auto Mode Activity"
      titleAdornment={
        autoMode ? (
          <span className="rounded-pill bg-warning-tint px-2 py-0.5 text-[10px] font-bold text-warning">ON</span>
        ) : (
          <span className="rounded-pill bg-panel px-2 py-0.5 text-[10px] font-bold text-text-secondary">OFF</span>
        )
      }
      onClose={closeModal}
    >
      <div className="space-y-2">
        {autoModeLog.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No autonomous actions yet — turn Auto Mode on and AI will start building and assigning trips as servers free up.
          </p>
        ) : (
          autoModeLog.map((entry) => (
            <div key={entry.id} className="rounded-card border border-hairline bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <p className={`text-[13px] leading-snug ${entry.undone ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                  {entry.message}
                </p>
                {!entry.undone && (
                  <button
                    onClick={() => undoAutoModeAction(entry.id)}
                    className="shrink-0 text-[12px] font-semibold text-primary hover:underline"
                  >
                    Undo
                  </button>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-text-secondary">
                {formatClockTime(entry.at)}
                {entry.undone && <span className="font-semibold text-text-secondary">· Undone</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </SlideOverPanel>
  )
}
