import { useAppState } from '../../state/AppStateContext'

/** Plain-language confirmation for risky actions and recoverable errors
 * (spec §10.5) — never a bare error code, always a way forward. */
export function ConfirmDialog({
  message,
  confirmLabel,
  onConfirm,
}: {
  message: string
  confirmLabel?: string
  onConfirm: () => void
}) {
  const { closeModal } = useAppState()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/30 p-6" onClick={closeModal}>
      <div
        className="w-full max-w-sm animate-fade-in rounded-card border border-hairline bg-card p-5 shadow-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[14px] leading-relaxed text-text-primary">{message}</p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={closeModal} className="rounded-button border border-hairline px-3.5 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary">
            Dismiss
          </button>
          <button
            onClick={onConfirm}
            className="rounded-button bg-primary px-3.5 py-2 text-sm font-semibold text-primary-contrast hover:bg-primary-alt"
          >
            {confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
