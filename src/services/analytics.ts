import { api } from './api'
import { MOCK_HOTSPOTS } from '../utils/mockData'
import type { HotspotPrediction, WardDashboardStats } from '../types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function fetchHotspots(wardId?: string): Promise<HotspotPrediction[]> {
  if (USE_MOCK) {
    return wardId ? MOCK_HOTSPOTS.filter(h => h.wardId === wardId) : MOCK_HOTSPOTS
  }
  const { data } = await api.get<HotspotPrediction[]>('/analytics/hotspots', {
    params: wardId ? { wardId } : undefined,
  })
  return data
}

export async function fetchAllWardsStats(): Promise<WardDashboardStats[]> {
  if (USE_MOCK) {
    const { MOCK_WARD_STATS } = await import('../utils/mockData')
    return [MOCK_WARD_STATS] // single ward demo
  }
  const { data } = await api.get<WardDashboardStats[]>('/analytics/wards')
  return data
}
