import { CitizenNotification } from '../types/models';

export const MOCK_NOTIFICATIONS: CitizenNotification[] = [
  {
    id: 'NOTIF-001',
    incidentId: 'INC-2026-002',
    title: 'Resolution Pending Verification',
    message: 'Worker submitted resolution for "Uncollected Garbage Pile outside Market". Please verify the work.',
    type: 'VERIFICATION_REQUEST',
    read: false,
    createdAt: '2026-08-24T12:45:00Z',
  },
  {
    id: 'NOTIF-002',
    incidentId: 'INC-2026-001',
    title: 'Worker Assigned',
    message: 'Field technician assigned to repair pothole at Central Park Main Rd.',
    type: 'STATUS_UPDATE',
    read: true,
    createdAt: '2026-08-23T08:15:00Z',
  },
  {
    id: 'NOTIF-003',
    incidentId: 'INC-2026-003',
    title: 'Issue Closed',
    message: 'Thank you for confirming resolution for Greenwood Lane streetlight.',
    type: 'GENERAL',
    read: true,
    createdAt: '2026-08-21T16:00:00Z',
  },
];
