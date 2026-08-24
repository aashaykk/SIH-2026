import { api } from './api';
import { Incident } from '../types/models';
import { MOCK_INCIDENTS } from '../mocks/incidents.mock';

/**
 * Incidents API Service
 * Wire real Axios endpoints to backend with fallback to mock data during local offline dev.
 */

export async function getMyReports(filterStatus?: string): Promise<Incident[]> {
  try {
    const response = await api.get<Incident[]>('/reports/my', {
      params: { status: filterStatus !== 'all' ? filterStatus : undefined },
    });
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (error) {
    console.warn('Real API call GET /api/reports/my failed, serving mock data:', error);
  }

  // Fallback to mock data for local testing
  if (!filterStatus || filterStatus === 'all') {
    return MOCK_INCIDENTS;
  }
  return MOCK_INCIDENTS.filter((item) => {
    if (filterStatus === 'active') {
      return item.status !== 'CLOSED';
    }
    if (filterStatus === 'resolved' || filterStatus === 'closed') {
      return item.status === 'CLOSED';
    }
    return item.status === filterStatus;
  });
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  try {
    const response = await api.get<Incident>(`/incidents/${id}`);
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.warn(`Real API call GET /api/incidents/${id} failed, serving mock data:`, error);
  }

  // Fallback to mock data
  const incident = MOCK_INCIDENTS.find((item) => item.id === id);
  return incident || null;
}

export async function reopenIncident(
  id: string,
  reason: string,
  photoUri?: string
): Promise<Incident> {
  try {
    const response = await api.post<Incident>(`/incidents/${id}/reopen`, {
      reason,
      photoUri,
    });
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.warn(`Real API call POST /api/incidents/${id}/reopen failed, performing mock update:`, error);
  }

  // Fallback mock update
  const incident = MOCK_INCIDENTS.find((item) => item.id === id);
  if (!incident) {
    throw new Error('Incident not found');
  }

  const updatedIncident: Incident = {
    ...incident,
    status: 'REOPENED',
    timeline: [
      ...incident.timeline,
      {
        label: 'Reopened',
        status: 'active',
        timestamp: new Date().toLocaleString(),
      },
    ],
  };

  return updatedIncident;
}
