import { getSLAColorClass, formatDuration } from '../../utils'
import type { SLAStatus } from '../../types'

interface Props {
  status: SLAStatus
  remainingMs: number
  className?: string
}

export function SLABadge({ status, remainingMs, className = '' }: Props) {
  const isOverdue = remainingMs <= 0
  const label = isOverdue
    ? `${formatDuration(remainingMs)} overdue`
    : `${formatDuration(remainingMs)} left`

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-mono ${getSLAColorClass(status)} ${className}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {label}
    </span>
  )
}
