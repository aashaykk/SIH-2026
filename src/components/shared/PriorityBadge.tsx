import { getPriorityColorClass } from '../../utils'
import type { PriorityLevel } from '../../types'

interface Props { priority: PriorityLevel; score?: number; className?: string }

export function PriorityBadge({ priority, score, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-semibold tracking-wide ${getPriorityColorClass(priority)} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {priority}
      {score !== undefined && <span className="opacity-60 font-mono">·{score}</span>}
    </span>
  )
}
