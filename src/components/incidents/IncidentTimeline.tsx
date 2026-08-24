/**
 * IncidentTimeline — visual lifecycle of an incident.
 * Shows the full journey: Reported → AI → Ward → Worker → Closed
 */
import { format } from 'date-fns'
import { useIncidentTimeline } from '../../hooks/useIncidents'
import { Skeleton } from '../shared/Skeleton'
import { ErrorState } from '../shared/ErrorState'

const ACTOR_ICONS: Record<'AI' | 'SYSTEM' | 'USER', string> = {
  AI: '🤖',
  SYSTEM: '⚙️',
  USER: '👤',
}

interface Props { incidentId: string }

export function IncidentTimeline({ incidentId }: Props) {
  const { data: events, isLoading, isError, refetch } = useIncidentTimeline(incidentId)

  if (isLoading) return <Skeleton lines={4} />
  if (isError) return <ErrorState message="Could not load timeline" onRetry={refetch} />
  if (!events?.length) return <p className="text-slate-500 text-sm">No timeline events yet.</p>

  return (
    <div className="relative space-y-0">
      {events.map((event, idx) => (
        <div key={event.id} className="flex gap-3 pb-4">
          {/* Vertical line */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center text-xs shrink-0">
              {ACTOR_ICONS[event.actorType]}
            </div>
            {idx < events.length - 1 && (
              <div className="w-px flex-1 bg-surface-border mt-1" />
            )}
          </div>

          {/* Content */}
          <div className="pb-1">
            <p className="text-xs font-semibold text-slate-300">{event.event.replace(/_/g, ' ')}</p>
            <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
            <p className="text-xs text-slate-600 font-mono mt-1">
              {event.actor} · {format(new Date(event.createdAt), 'HH:mm:ss, dd MMM')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
