import { useQuery } from '@tanstack/react-query'
import { fetchWardDashboard, fetchDepartmentStats } from '../services/incidents'
import { fetchHotspots } from '../services/analytics'

export function useWardDashboard(wardId: string) {
  return useQuery({
    queryKey: ['ward-dashboard', wardId],
    queryFn: () => fetchWardDashboard(wardId),
    refetchInterval: 60_000, // refresh every 1min (Socket.IO handles real-time)
  })
}

export function useDepartmentStats() {
  return useQuery({
    queryKey: ['department-stats'],
    queryFn: fetchDepartmentStats,
    refetchInterval: 60_000,
  })
}

export function useHotspots(wardId?: string) {
  return useQuery({
    queryKey: ['hotspots', wardId],
    queryFn: () => fetchHotspots(wardId),
  })
}
