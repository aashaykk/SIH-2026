import { CitizenNotification } from '../types/models';
import { MOCK_NOTIFICATIONS } from '../mocks/notifications.mock';

/**
 * Citizen Notifications API Service
 * Handles fetching citizen updates and updating read statuses.
 */

// TODO: Replace with real Axios call (e.g. axios.get('/api/notifications')) when backend is live
export async function getNotifications(): Promise<CitizenNotification[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_NOTIFICATIONS;
}

// TODO: Replace with real Axios call (e.g. axios.patch(`/api/notifications/${id}/read`)) when backend is live
export async function markNotificationAsRead(id: string): Promise<CitizenNotification> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const notification = MOCK_NOTIFICATIONS.find((n) => n.id === id);
  if (!notification) {
    throw new Error('Notification not found');
  }
  notification.read = true;
  return notification;
}
