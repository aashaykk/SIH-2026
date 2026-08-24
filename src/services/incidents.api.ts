import { Incident } from '../types/models';
import { MOCK_INCIDENTS } from '../mocks/incidents.mock';

/**
 * Incidents API Service
 * Handles fetching citizen reports, single incident details, and reopening requests.
 */

// TODO: Replace with real Axios call (e.g. axios.get('/api/incidents')) when backend is live
export async function getMyReports(filterStatus?: string): Promise<Incident[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
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

// TODO: Replace with real Axios call (e.g. axios.get(`/api/incidents/${id}`)) when backend is live
export async function getIncidentById(id: string): Promise<Incident | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const incident = MOCK_INCIDENTS.find((item) => item.id === id);
  return incident || null;
}

// TODO: Replace with real Axios call (e.g. axios.post(`/api/incidents/${id}/reopen`)) when backend is live
export async function reopenIncident(
  id: string,
  reason: string,
  photoUri?: string
): Promise<Incident> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const incident = MOCK_INCIDENTS.find((item) => item.id === id);
  if (!incident) {
    throw new Error('Incident not found');
  }
  
  const updatedTimeline = [
    ...incident.timeline,
    {
      label: 'Reopened',
      status: 'active' as const,
      timestamp: new Date().toLocaleString(),
    },
  ];

  const updatedIncident: Incident = {
    ...incident,
    status: 'REOPENED',
    timeline: updatedTimeline,
  };

  return updatedIncident;
}
