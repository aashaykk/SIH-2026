import type { IncidentStatus } from '../../types'
import { STATUS_LABELS } from '../../utils'

const STATUS_COLORS: Record<IncidentStatus, string> = {
  REPORTED: 'text-blue-400 bg-blue-950 border-blue-800',
  ACKNOWLEDGED: 'text-purple-400 bg-purple-950 border-purple-800',
  ASSIGNED: 'text-amber-400 bg-amber-950 border-amber-800',
  IN_PROGRESS: 'text-orange-400 bg-orange-950 border-orange-800',
  WORK_COMPLETED: 'text-cyan-400 bg-cyan-950 border-cyan-800',
  VERIFIED: 'text-teal-400 bg-teal-950 border-teal-800',
  CLOSED: 'text-green-400 bg-green-950 border-green-800',
  REOPENED: 'text-red-400 bg-red-950 border-red-800',
}

interface Props { status: IncidentStatus; className?: string }

export function StatusBadge({ status, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${STATUS_COLORS[status]} ${className}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
