import { Resolution, IncidentStatus } from '../types/models';
import { MOCK_INCIDENTS } from '../mocks/incidents.mock';

/**
 * Resolution Verification API Service
 * Handles fetching resolution proof (before/after photos, AI confidence score) and submitting citizen verification.
 */

// TODO: Replace with real Axios call (e.g. axios.get(`/api/incidents/${incidentId}/resolution`)) when backend is live
export async function getResolutionDetails(incidentId: string): Promise<Resolution | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const incident = MOCK_INCIDENTS.find((item) => item.id === incidentId);
  return incident?.resolution || null;
}

// TODO: Replace with real Axios call (e.g. axios.post(`/api/incidents/${incidentId}/verify`)) when backend is live
export async function submitCitizenVerification(
  incidentId: string,
  citizenVerification: 'YES' | 'PARTIAL' | 'NO',
  comments?: string
): Promise<{ resolution: Resolution; newStatus: IncidentStatus }> {
  await new Promise((resolve) => setTimeout(resolve, 400));
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
