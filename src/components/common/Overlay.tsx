import type { ReactNode } from 'react'
import { CloseIcon } from './Icons'

/** Right-slide panel: overlays the right rail, dims the rest with a light
 * scrim (spec §1 / §9). Width is configurable — modals ~420px, the Trip
 * Detail panel a touch wider so its stat tiles and timeline breathe. */
export function SlideOverPanel({
  title,
  titleAdornment,
  onClose,
  children,
  footer,
  width = 420,
}: {
  title: string
  titleAdornment?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number
}) {
  return (
    <div className="fixed inset-0 z-40 animate-fade-in bg-text-primary/20" onClick={onClose}>
      <div
        className="animate-slide-in-right absolute right-0 top-0 flex h-full flex-col border-l border-hairline bg-card shadow-hover"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            {titleAdornment}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-panel hover:text-text-primary"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto thin-scroll px-6 py-5">{children}</div>
        {footer && <div className="border-t border-hairline px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}
