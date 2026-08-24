/**
 * AssignWorkerModal — assign or reassign a field worker to an incident.
 *
 * FAILURE CASES:
 * - No available workers → shows empty state with guidance
 * - API error → shows error with retry
 * - Worker already at capacity → shown in list (still assignable by authority)
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAssignWorker } from '../../hooks/useIncidents'
import { fetchAvailableWorkers } from '../../services/incidents'
import { Skeleton } from '../shared/Skeleton'
import type { Incident } from '../../types'

interface Props {
  incident: Incident
  onClose: () => void
  onSuccess?: () => void
}

export function AssignWorkerModal({ incident, onClose, onSuccess }: Props) {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('')
  const { mutate: assign, isPending, error } = useAssignWorker()

  const { data: workers, isLoading } = useQuery({
    queryKey: ['workers', incident.departmentId],
    queryFn: () => fetchAvailableWorkers(incident.departmentId),
  })

  function handleAssign() {
    if (!selectedWorkerId) return
    assign(
      { incidentId: incident.id, workerId: selectedWorkerId },
      { onSuccess: () => { onSuccess?.(); onClose() } }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div>
            <h2 className="font-semibold text-white">Assign Field Worker</h2>
            <p className="text-xs text-slate-500 mt-0.5">{incident.id} · {incident.departmentName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">✕</button>
        </div>

        {/* Workers list */}
        <div className="p-5">
          {isLoading && <Skeleton lines={3} />}

          {!isLoading && !workers?.length && (
            <div className="text-center py-6 text-slate-400 text-sm">
              <p>No available workers in {incident.departmentName}.</p>
              <p className="text-slate-500 text-xs mt-1">Contact department supervisor to reassign workload.</p>
            </div>
          )}

          {workers && workers.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {workers.map(worker => (
                <label key={worker.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedWorkerId === worker.id
                    ? 'border-primary bg-orange-950/30'
                    : 'border-surface-border hover:border-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="worker"
                    value={worker.id}
                    checked={selectedWorkerId === worker.id}
                    onChange={() => setSelectedWorkerId(worker.id)}
                    className="text-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{worker.name}</p>
                    <p className="text-xs text-slate-500">{worker.currentTaskCount} active tasks</p>
                  </div>
                  {worker.currentTaskCount >= 3 && (
                    <span className="text-xs text-amber-400 bg-amber-950 border border-amber-800 px-1.5 py-0.5 rounded">High load</span>
                  )}
                </label>
              ))}
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm mt-2">
              {(error as { message?: string }).message || 'Failed to assign. Try again.'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-surface-border">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-surface-border text-slate-300 hover:text-white text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedWorkerId || isPending}
            className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? 'Assigning…' : 'Assign Worker'}
          </button>
        </div>
      </div>
    </div>
  )
}
