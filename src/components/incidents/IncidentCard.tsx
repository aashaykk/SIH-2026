/**
 * IncidentCard — compact incident row for the list view.
 * Clicking opens the detail drawer/page.
 */
import { CATEGORY_LABELS, timeAgo, truncate } from '../../utils'
import { PriorityBadge } from '../shared/PriorityBadge'
import { SLABadge } from '../shared/SLABadge'
import { StatusBadge } from '../shared/StatusBadge'
import type { Incident } from '../../types'

interface Props {
  incident: Incident
  onClick?: (incident: Incident) => void
  isSelected?: boolean
}

export function IncidentCard({ incident, onClick, isSelected }: Props) {
  return (
    <button
      onClick={() => onClick?.(incident)}
      className={`w-full text-left p-4 rounded-xl border transition-all hover:border-primary/50 ${
        isSelected
          ? 'bg-surface-elevated border-primary/70'
          : 'bg-surface-card border-surface-border hover:bg-surface-elevated'
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-500">{incident.id}</span>
          <PriorityBadge priority={incident.priority} score={incident.priorityScore} />
          <StatusBadge status={incident.status} />
        </div>
        <SLABadge status={incident.slaStatus} remainingMs={incident.slaRemainingMs} />
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-white mb-1">{truncate(incident.title, 60)}</p>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
        <span>{CATEGORY_LABELS[incident.category]}</span>
        <span>·</span>
        <span>{incident.wardName}</span>
        <span>·</span>
        <span>{incident.departmentName}</span>
        <span>·</span>
        <span>{incident.reportCount} reports</span>
        {incident.assignedWorkerName && (
          <>
            <span>·</span>
            <span className="text-slate-400">👤 {incident.assignedWorkerName}</span>
          </>
        )}
      </div>

      {/* AI confidence */}
      <div className="mt-2 text-xs text-slate-600">
        AI confidence: <span className="text-slate-400 font-mono">{Math.round(incident.aiConfidence * 100)}%</span>
        <span className="mx-2">·</span>
        Signal: <span className="text-slate-400 font-mono">{incident.civicSignalStrength}/100</span>
        <span className="mx-2">·</span>
        {timeAgo(incident.createdAt)}
      </div>
    </button>
  )
}
