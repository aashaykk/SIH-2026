import { api } from './api';
import { CitizenNotification } from '../types/models';
import { MOCK_NOTIFICATIONS } from '../mocks/notifications.mock';

/**
 * Citizen Notifications API Service
 * Wire real Axios calls for fetching notifications and updating read state.
 */

export async function getNotifications(): Promise<CitizenNotification[]> {
  try {
    const response = await api.get<CitizenNotification[]>('/notifications');
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (error) {
    console.warn('Real API call GET /api/notifications failed, serving mock data:', error);
  }

  // Fallback to mock data
  return MOCK_NOTIFICATIONS;
}

export async function markNotificationAsRead(id: string): Promise<CitizenNotification> {
  try {
    const response = await api.patch<CitizenNotification>(`/notifications/${id}/read`);
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.warn(`Real API call PATCH /api/notifications/${id}/read failed, performing mock update:`, error);
  }

  // Fallback mock update
  const notification = MOCK_NOTIFICATIONS.find((n) => n.id === id);
  if (!notification) {
    throw new Error('Notification not found');
  }
  notification.read = true;
  return notification;
}
