/**
 * PriorityExplainer — shows WHY AI gave this priority.
 * This is the "Explainable AI" requirement from the spec.
 * Judges must see reasoning, not just a label.
 */
import type { PriorityLevel } from '../../types'
import { getPriorityColorClass } from '../../utils'

interface Props {
  priority: PriorityLevel
  score: number
  reasons: string[]
}

export function PriorityExplainer({ priority, score, reasons }: Props) {
  return (
    <div className="bg-surface-elevated border border-surface-border rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className={`px-3 py-1 rounded-full border text-sm font-bold ${getPriorityColorClass(priority)}`}>
          {priority}
        </span>
        <span className="text-2xl font-bold text-white font-mono">{score}/100</span>
        <span className="text-xs text-slate-500">AI Priority Score</span>
      </div>
      <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Why this priority?</p>
      <ul className="space-y-1.5">
        {reasons.map((reason, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
            <span className="text-primary mt-0.5">•</span>
            {reason}
          </li>
        ))}
      </ul>
    </div>
  )
}
