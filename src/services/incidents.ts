/**
 * Incident API service
 * All incident-related API calls centralised here.
 * Components never call axios directly.
 *
 * MOCK FALLBACK: if VITE_USE_MOCK=true, returns mock data instead.
 * This lets the dashboard run before backend is ready.
 */

import { api } from './api'
import { MOCK_INCIDENTS, MOCK_WARD_STATS, MOCK_DEPARTMENT_STATS } from '../utils/mockData'
import type {
  Incident, IncidentFilters, PaginatedResponse,
  WardDashboardStats, DepartmentStats, FieldWorker, IncidentTimeline
} from '../types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ─── Incidents ────────────────────────────────────────────────────────────────

export async function fetchIncidents(
  filters: IncidentFilters = {}
): Promise<PaginatedResponse<Incident>> {
  if (USE_MOCK) {
    // Simulate filter logic on mock data
    let data = [...MOCK_INCIDENTS]
    if (filters.priority?.length) {
      data = data.filter(i => filters.priority!.includes(i.priority))
    }
    if (filters.status?.length) {
      data = data.filter(i => filters.status!.includes(i.status))
    }
    return { data, total: data.length, page: 1, pageSize: 20, hasMore: false }
  }

  const { data } = await api.get<PaginatedResponse<Incident>>('/incidents', { params: filters })
  return data
}

export async function fetchIncidentById(id: string): Promise<Incident> {
  if (USE_MOCK) {
    const found = MOCK_INCIDENTS.find(i => i.id === id)
    if (!found) throw { message: 'Incident not found', code: 'NOT_FOUND', statusCode: 404 }
    return found
  }
  const { data } = await api.get<Incident>(`/incidents/${id}`)
  return data
}

export async function fetchIncidentTimeline(id: string): Promise<IncidentTimeline[]> {
  if (USE_MOCK) {
    // Return synthetic timeline for demo
    return [
      { id: 't1', incidentId: id, event: 'CREATED', description: 'Citizen report submitted via mobile app', actor: 'Citizen', actorType: 'USER', createdAt: new Date(Date.now() - 3_600_000 * 18).toISOString() },
      { id: 't2', incidentId: id, event: 'AI_ANALYZED', description: 'Garbage detected — 96% confidence', actor: 'AI System', actorType: 'AI', createdAt: new Date(Date.now() - 3_600_000 * 17.9).toISOString() },
      { id: 't3', incidentId: id, event: 'WARD_DETECTED', description: 'Assigned to Ward 17 via GPS point-in-polygon', actor: 'AI System', actorType: 'AI', createdAt: new Date(Date.now() - 3_600_000 * 17.8).toISOString() },
      { id: 't4', incidentId: id, event: 'DEDUPLICATED', description: '5 related reports merged — civic signal: 91/100', actor: 'AI System', actorType: 'AI', createdAt: new Date(Date.now() - 3_600_000 * 17.7).toISOString() },
      { id: 't5', incidentId: id, event: 'PRIORITY_ASSIGNED', description: 'HIGH priority — score 87/100', actor: 'AI System', actorType: 'AI', createdAt: new Date(Date.now() - 3_600_000 * 17.6).toISOString() },
      { id: 't6', incidentId: id, event: 'ASSIGNED', description: 'Assigned to Rahul Patel (Sanitation)', actor: 'Ward Authority', actorType: 'USER', createdAt: new Date(Date.now() - 3_600_000 * 1).toISOString() },
    ]
  }
  const { data } = await api.get<IncidentTimeline[]>(`/incidents/${id}/timeline`)
  return data
}

export async function assignWorker(
  incidentId: string, workerId: string
): Promise<Incident> {
  const { data } = await api.post<Incident>(`/incidents/${incidentId}/assign`, { workerId })
  return data
}

export async function updateIncidentStatus(
  incidentId: string, status: string
): Promise<Incident> {
  const { data } = await api.patch<Incident>(`/incidents/${incidentId}/status`, { status })
  return data
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function fetchWardDashboard(wardId: string): Promise<WardDashboardStats> {
  if (USE_MOCK) return { ...MOCK_WARD_STATS, wardId }
  const { data } = await api.get<WardDashboardStats>(`/wards/${wardId}/dashboard`)
  return data
}

export async function fetchDepartmentStats(): Promise<DepartmentStats[]> {
  if (USE_MOCK) return MOCK_DEPARTMENT_STATS
  const { data } = await api.get<DepartmentStats[]>('/analytics/departments')
  return data
}

export async function fetchAvailableWorkers(departmentId: string): Promise<FieldWorker[]> {
  if (USE_MOCK) {
    const { MOCK_WORKERS } = await import('../utils/mockData')
    return MOCK_WORKERS.filter(w => w.departmentId === departmentId && w.isActive)
  }
  const { data } = await api.get<FieldWorker[]>(`/departments/${departmentId}/workers?available=true`)
  return data
}
