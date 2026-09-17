import { useAppState } from '../../state/AppStateContext'
import { CloseIcon } from './Icons'

export function ToastHost() {
  const { toast, dismissToast } = useAppState()
  if (!toast) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-3 rounded-button bg-text-primary px-4 py-3 text-sm text-canvas shadow-hover">
        <span>{toast.message}</span>
        {toast.undo && (
          <button
            className="font-semibold text-primary-alt underline underline-offset-2"
            onClick={() => {
              toast.undo?.()
              dismissToast()
            }}
          >
            Undo
          </button>
        )}
        <button aria-label="Dismiss" onClick={dismissToast} className="text-canvas/60 hover:text-canvas">
          <CloseIcon size={14} />
        </button>
      </div>
    </div>
  )
}
