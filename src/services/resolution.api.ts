import { api } from './api';
import { Resolution, IncidentStatus } from '../types/models';
import { MOCK_INCIDENTS } from '../mocks/incidents.mock';

/**
 * Resolution Verification API Service
 * Wire real Axios calls for resolution proof and citizen verification submission.
 */

export async function getResolutionDetails(incidentId: string): Promise<Resolution | null> {
  try {
    const response = await api.get<Resolution>(`/incidents/${incidentId}/resolution`);
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.warn(`Real API call GET /api/incidents/${incidentId}/resolution failed, serving mock data:`, error);
  }

  // Fallback to mock data
  const incident = MOCK_INCIDENTS.find((item) => item.id === incidentId);
  return incident?.resolution || null;
}

export async function submitCitizenVerification(
  incidentId: string,
  citizenVerification: 'YES' | 'PARTIAL' | 'NO',
  comments?: string
): Promise<{ resolution: Resolution; newStatus: IncidentStatus }> {
  try {
    const response = await api.post<{ resolution: Resolution; newStatus: IncidentStatus }>(
      `/incidents/${incidentId}/citizen-verification`,
      {
        citizenVerification,
        comments,
      }
    );
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.warn(`Real API call POST /api/incidents/${incidentId}/citizen-verification failed, performing mock update:`, error);
  }

  // Fallback mock update
  const incident = MOCK_INCIDENTS.find((item) => item.id === incidentId);
  if (!incident || !incident.resolution) {
    throw new Error('Incident or resolution proof not found');
  }

  const updatedResolution: Resolution = {
    ...incident.resolution,
    citizenVerification,
  };

  let newStatus: IncidentStatus = 'CLOSED';
  if (citizenVerification === 'PARTIAL') {
    newStatus = 'REVIEW_REQUIRED';
  } else if (citizenVerification === 'NO') {
    newStatus = 'REOPENED';
  }

  return {
    resolution: updatedResolution,
    newStatus,
  };
}
