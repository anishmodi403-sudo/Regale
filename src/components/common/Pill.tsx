import type { ReactNode } from 'react'

export type PillTone = 'danger' | 'warning' | 'success' | 'info' | 'primary' | 'neutral'

const toneClasses: Record<PillTone, string> = {
  danger: 'bg-danger-tint text-danger',
  warning: 'bg-warning-tint text-warning',
  success: 'bg-success-tint text-success',
  info: 'bg-info-tint text-info',
  primary: 'bg-primary-tint text-primary',
  neutral: 'bg-panel text-text-secondary',
}

export function Pill({
  tone = 'neutral',
  children,
  icon,
  className = '',
}: {
  tone?: PillTone
  children: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold leading-none whitespace-nowrap ${toneClasses[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  )
}

export function Dot({ tone = 'neutral', className = '' }: { tone?: PillTone; className?: string }) {
  const dotClasses: Record<PillTone, string> = {
    danger: 'bg-danger',
    warning: 'bg-warning',
    success: 'bg-success',
    info: 'bg-info',
    primary: 'bg-primary',
    neutral: 'bg-text-secondary',
  }
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotClasses[tone]} ${className}`} />
}
