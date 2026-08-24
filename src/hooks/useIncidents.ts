/**
 * useIncidents — TanStack Query hook for incidents list
 * Automatically invalidates on Socket.IO events.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchIncidents, fetchIncidentById, assignWorker, fetchIncidentTimeline } from '../services/incidents'
import type { IncidentFilters } from '../types'

export const INCIDENTS_QUERY_KEY = 'incidents' as const

export function useIncidents(filters: IncidentFilters = {}) {
  return useQuery({
    queryKey: [INCIDENTS_QUERY_KEY, filters],
    queryFn: () => fetchIncidents(filters),
  })
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: [INCIDENTS_QUERY_KEY, id],
    queryFn: () => fetchIncidentById(id),
    enabled: Boolean(id),
  })
}

export function useIncidentTimeline(id: string) {
  return useQuery({
    queryKey: [INCIDENTS_QUERY_KEY, id, 'timeline'],
    queryFn: () => fetchIncidentTimeline(id),
    enabled: Boolean(id),
  })
}

export function useAssignWorker() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ incidentId, workerId }: { incidentId: string; workerId: string }) =>
      assignWorker(incidentId, workerId),
    onSuccess: (_, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: [INCIDENTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [INCIDENTS_QUERY_KEY, incidentId] })
    },
  })
}
