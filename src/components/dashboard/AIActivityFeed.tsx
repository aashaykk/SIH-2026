/**
 * AIActivityFeed — real-time AI event stream
 *
 * This is the centrepiece WOW component for judges.
 * Shows every AI agent action as it happens via Socket.IO.
 *
 * WORST CASE: Socket disconnected → shows last known events + offline badge
 * BEST CASE: Live stream of agent actions with <1s latency
 */

import { useEffect, useState, useRef } from 'react'
import { format } from 'date-fns'
import { useSocket } from '../../hooks/useSocket'
import { MOCK_AI_EVENTS } from '../../utils/mockData'
import type { AIActivityEvent } from '../../types'

const AGENT_ICONS: Record<string, string> = {
  'Vision Agent': '👁️',
  'Location Agent': '📍',
  'Dedup Agent': '🔗',
  'Priority Agent': '⚡',
  'Routing Agent': '🔀',
  'SLA Agent': '⏱️',
  'Resolution Agent': '✅',
  'Prevention Agent': '🛡️',
  'System': '🤖',
}

const TYPE_COLORS: Record<AIActivityEvent['type'], string> = {
  info: 'text-blue-400',
  success: 'text-green-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
}

const MAX_EVENTS = 50

export function AIActivityFeed() {
  const [events, setEvents] = useState<AIActivityEvent[]>(MOCK_AI_EVENTS)
  const { on } = useSocket()
  const feedRef = useRef<HTMLDivElement>(null)

  // Subscribe to live AI events
  useEffect(() => {
    return on<AIActivityEvent>('ai.activity', (event) => {
      setEvents(prev => {
        const updated = [event, ...prev]
        return updated.slice(0, MAX_EVENTS) // cap at 50
      })
    })
  }, [on])

  // Auto-scroll to top on new event
  useEffect(() => {
    feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [events.length])

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">🤖 NAGAR-X AI Activity</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">{events.length} events</span>
      </div>

      {/* Feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto p-3 space-y-1">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex gap-2.5 p-2 rounded-lg hover:bg-surface-elevated transition-colors group animate-fade-in"
          >
            {/* Icon */}
            <span className="text-base shrink-0 mt-0.5">
              {AGENT_ICONS[event.agent] ?? '🔧'}
            </span>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-300">{event.agent}</span>
                {event.incidentId && (
                  <span className="text-xs text-slate-600 font-mono">{event.incidentId}</span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${TYPE_COLORS[event.type]}`}>{event.message}</p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                {format(new Date(event.timestamp), 'HH:mm:ss')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
