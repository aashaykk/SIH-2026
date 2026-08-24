import { useState, useEffect } from 'react'
import { useIncidents } from '../hooks/useIncidents'
import { useWardDashboard } from '../hooks/useDashboard'
import { useSocket } from '../hooks/useSocket'
import { useQueryClient } from '@tanstack/react-query'
import { INCIDENTS_QUERY_KEY } from '../hooks/useIncidents'
import { KPICard } from '../components/dashboard/KPICard'
import { AIActivityFeed } from '../components/dashboard/AIActivityFeed'
import { DepartmentStatus } from '../components/dashboard/DepartmentStatus'
import { IncidentMap } from '../components/map/IncidentMap'
import { IncidentCard } from '../components/incidents/IncidentCard'
import { AssignWorkerModal } from '../components/incidents/AssignWorkerModal'
import { ConnectionIndicator } from '../components/shared/ConnectionIndicator'
import { ErrorState } from '../components/shared/ErrorState'
import { Skeleton } from '../components/shared/Skeleton'
import type { Incident, IncidentFilters, PriorityLevel } from '../types'

const DEFAULT_WARD = 'ward-17'

export function Dashboard() {
  const [filters, setFilters] = useState<IncidentFilters>({ sortBy: 'priorityScore', sortOrder: 'desc' })
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [newIncidentAlert, setNewIncidentAlert] = useState<string | null>(null)

  const { data: stats, isLoading: statsLoading } = useWardDashboard(DEFAULT_WARD)
  const { data: incidentsPage, isLoading: incLoading, isError, refetch } = useIncidents(filters)
  const { isConnected, on } = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsub1 = on<{ incident: Incident }>('incident.created', ({ incident }) => {
      queryClient.invalidateQueries({ queryKey: [INCIDENTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['ward-dashboard'] })
      setNewIncidentAlert(`🔴 New incident: ${incident.title}`)
      setTimeout(() => setNewIncidentAlert(null), 5000)
    })
    const unsub2 = on('incident.status_changed', () => {
      queryClient.invalidateQueries({ queryKey: [INCIDENTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['ward-dashboard'] })
    })
    return () => { unsub1(); unsub2() }
  }, [on, queryClient])

  const incidents = incidentsPage?.data ?? []
  const PRIORITY_FILTERS: PriorityLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

  return (
    /**
     * Layout: normal document flow, NO fixed positioning on content panels.
     * Structure:
     *   header (sticky)
     *   main (scrollable)
     *     kpi row
     *     filter pills
     *     split row: [incident list | map]  ← fixed height 480px
     *     bottom row: [AI feed | dept]      ← min-height, auto grows
     *   detail panel: slides in from right as PART of flow (not fixed)
     */
    <div className="min-h-screen bg-surface flex flex-col">

      {/* ── Header (sticky) ─────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-surface-border bg-surface-card">
        <div>
          <h1 className="font-bold text-white text-lg tracking-tight">NAGAR-X</h1>
          <p className="text-xs text-slate-500">Ward 17 — Civic Command Center</p>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionIndicator isConnected={isConnected} />
          <span className="text-xs text-slate-500 font-mono">{new Date().toLocaleTimeString()}</span>
        </div>
      </header>

      {/* ── Toast (fixed, above everything, right side) ──── */}
      {newIncidentAlert && (
        <div className="fixed top-4 right-4 z-50 bg-red-950 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-200 animate-slide-in shadow-2xl">
          {newIncidentAlert}
        </div>
      )}

      {/* ── Main layout: two-column when detail panel open ─ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Scrollable content area ──────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 flex flex-col gap-4">

            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <KPICard label="Open Issues" value={stats?.totalOpen ?? '—'} icon="📂" accentColor="border-blue-500" isLoading={statsLoading} />
              <KPICard label="Critical" value={stats?.critical ?? '—'} icon="🔴" accentColor="border-red-500" isLoading={statsLoading} />
              <KPICard label="Overdue" value={stats?.overdue ?? '—'} icon="⏰" accentColor="border-amber-500" isLoading={statsLoading} />
              <KPICard label="Resolved Today" value={stats?.resolvedToday ?? '—'} icon="✅" accentColor="border-green-500" isLoading={statsLoading} />
              <KPICard
                label="Civic Health"
                value={stats ? `${stats.civicHealthScore}/100` : '—'}
                trend={stats?.civicHealthTrend}
                trendLabel="this week"
                icon="🏙️"
                accentColor="border-primary"
                isLoading={statsLoading}
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500">Filter:</span>
              <button
                onClick={() => setFilters(f => ({ ...f, priority: undefined }))}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${!filters.priority ? 'bg-primary text-white border-primary' : 'border-surface-border text-slate-400 hover:border-slate-500'}`}
              >All</button>
              {PRIORITY_FILTERS.map(p => (
                <button key={p}
                  onClick={() => setFilters(f => ({ ...f, priority: [p] }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filters.priority?.[0] === p ? 'bg-primary text-white border-primary' : 'border-surface-border text-slate-400 hover:border-slate-500'}`}
                >{p}</button>
              ))}
            </div>

            {/* ── Split: list + map ── fixed 480px height ──── */}
            <div className="flex gap-4" style={{ height: '480px' }}>

              {/* Incident list — scrolls internally */}
              <div className="w-72 shrink-0 overflow-y-auto flex flex-col gap-2 pr-1">
                {incLoading && [1,2,3].map(i => <div key={i} className="h-32 bg-surface-card border border-surface-border rounded-xl animate-pulse" />)}
                {isError && <ErrorState message="Failed to load incidents" onRetry={refetch} />}
                {!incLoading && !isError && incidents.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-sm">No incidents match filter</div>
                )}
                {incidents.map(incident => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onClick={setSelectedIncident}
                    isSelected={selectedIncident?.id === incident.id}
                  />
                ))}
              </div>

              {/* Map — fills remaining width, fixed height */}
              <div className="flex-1 min-w-0 rounded-xl overflow-hidden border border-surface-border">
                <IncidentMap
                  incidents={incidents}
                  selectedId={selectedIncident?.id}
                  onSelectIncident={setSelectedIncident}
                />
              </div>
            </div>

            {/* ── Bottom: AI feed + dept ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '300px' }}>
              <div className="lg:col-span-2" style={{ height: '300px' }}>
                <AIActivityFeed />
              </div>
              <div>
                <DepartmentStatus onSelectDepartment={(id) => setFilters(f => ({ ...f, departmentId: id }))} />
              </div>
            </div>

          </div>
        </div>

        {/* ── Detail panel — slides in as flex sibling, NOT fixed ── */}
        {selectedIncident && (
          <div className="w-96 shrink-0 border-l border-surface-border bg-surface-card overflow-y-auto animate-slide-in">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-mono text-slate-500">{selectedIncident.id}</p>
                  <h2 className="font-bold text-white mt-1 text-base leading-snug">{selectedIncident.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-slate-400 hover:text-white p-1 shrink-0 ml-2"
                >✕</button>
              </div>

              <p className="text-sm text-slate-400 mb-4 leading-relaxed">{selectedIncident.description}</p>

              {/* Meta rows */}
              <div className="space-y-2 text-xs text-slate-400 mb-4">
                {[
                  ['Ward', selectedIncident.wardName],
                  ['Department', selectedIncident.departmentName],
                  ['Status', selectedIncident.status],
                  ['Reports', `${selectedIncident.reportCount} (${selectedIncident.uniqueReporterCount} unique)`],
                  ['Signal Strength', `${selectedIncident.civicSignalStrength}/100`],
                  ['AI Confidence', `${Math.round(selectedIncident.aiConfidence * 100)}%`],
                  ...(selectedIncident.assignedWorkerName ? [['Assigned to', `👤 ${selectedIncident.assignedWorkerName}`]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span>{label}</span>
                    <span className="text-slate-200 text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Priority reasoning */}
              <div className="bg-surface-elevated rounded-xl p-3 mb-4">
                <p className="text-xs font-semibold text-slate-400 mb-2">
                  Priority Reasoning ({selectedIncident.priorityScore}/100)
                </p>
                <ul className="space-y-1">
                  {selectedIncident.priorityReasons.map((r, i) => (
                    <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                      <span className="text-primary shrink-0">•</span>{r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Before image */}
              {selectedIncident.beforeImageUrl && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-1">Before photo</p>
                  <img
                    src={selectedIncident.beforeImageUrl}
                    alt="Before"
                    className="w-full rounded-lg border border-surface-border"
                  />
                </div>
              )}

              {/* Assign button */}
              {!selectedIncident.assignedWorkerId && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Assign Worker
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Assign modal */}
      {showAssignModal && selectedIncident && (
        <AssignWorkerModal
          incident={selectedIncident}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => setShowAssignModal(false)}
        />
      )}
    </div>
  )
}
