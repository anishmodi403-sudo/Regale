import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from './Icons'

/** A custom listbox dropdown used everywhere a select-like control appears
 * — Command View's floor/server filters, Floor-Cluster's Grouped by / Sort
 * by, and the "chip"-look ones; and, in "field" variant, full-width form
 * fields like Add New Request's Request Type / Assign Server (styled to
 * match the modal's text inputs instead of looking like a pill).
 *
 * This is a fully custom listbox, not a native <select> — a native
 * dropdown's option rows can't be given real hover states, a distinct
 * soft-tinted "selected" treatment, or a rounded/shadowed menu panel
 * (only background-color, color, and padding are stylable, and even
 * those are inconsistently honored across browsers). Building it from our
 * own themed tokens instead means the open menu is exactly as themed —
 * light and dark — as everything else in the app, and identical between
 * both variants since they share this same panel/option rendering. */
export function SelectChip({
  value,
  onChange,
  options,
  prefixLabel,
  variant = 'chip',
  placeholder,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  prefixLabel?: string
  /** 'chip' — compact pill trigger (filter bars). 'field' — full-width
   * form-field trigger matching the modal's text inputs. */
  variant?: 'chip' | 'field'
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder ?? ''
  const isField = variant === 'field'

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={`relative ${isField ? 'w-full' : ''} ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={prefixLabel ?? selectedLabel}
        onClick={() => setOpen((v) => !v)}
        className={
          isField
            ? `flex w-full items-center justify-between gap-2 rounded-button border bg-canvas px-3 py-2 text-left text-[13px] text-text-primary outline-none transition ${
                open ? 'border-primary' : 'border-hairline'
              }`
            : `flex items-center gap-1.5 rounded-button border bg-card py-1.5 pl-3.5 pr-3 text-xs text-text-secondary transition hover:text-text-primary ${
                open ? 'border-primary' : 'border-hairline hover:border-text-secondary/40'
              }`
        }
      >
        {prefixLabel && <span className="shrink-0 text-text-secondary">{prefixLabel}</span>}
        <span className={`truncate ${isField ? 'font-normal' : 'font-semibold'} text-text-primary`}>{selectedLabel}</span>
        <ChevronDown size={12} className={`shrink-0 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-full overflow-hidden rounded-card border border-hairline bg-card py-1.5 shadow-hover"
        >
          <div className="max-h-64 overflow-y-auto thin-scroll">
            {options.map((o) => {
              const isSelected = o.value === value
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                  className={`block w-full whitespace-nowrap px-4 py-2.5 text-left text-xs transition ${
                    isSelected ? 'bg-primary-tint font-semibold text-primary' : 'font-medium text-text-primary hover:bg-panel'
                  }`}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
