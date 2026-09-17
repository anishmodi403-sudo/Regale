import { ChevronDown } from './Icons'

/** A pill-shaped filter/control dropdown used across the board — Command
 * View's floor/server filters, Floor-Cluster's Grouped by / Sort by. One
 * shared component so every chip gets the same chevron clearance and
 * label-to-chevron spacing instead of each screen tuning its own padding. */
export function SelectChip({
  value,
  onChange,
  options,
  prefixLabel,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  prefixLabel?: string
  className?: string
}) {
  return (
    <label
      className={`relative flex items-center gap-1.5 rounded-button border border-hairline bg-card py-1.5 pl-2.5 pr-7 text-xs text-text-secondary transition hover:border-text-secondary/40 hover:text-text-primary ${className}`}
    >
      {prefixLabel && <span className="shrink-0">{prefixLabel}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent font-semibold text-text-primary outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-2.5 shrink-0 text-text-secondary" />
    </label>
  )
}
