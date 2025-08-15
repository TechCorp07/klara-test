// src/lib/api/services/notification.service.ts
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export class NotificationService {
  // Get user notifications with filters
  async getNotifications(filters: {
    unread_only?: boolean;
    type?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
    
    const url = `${ENDPOINTS.NOTIFICATIONS.LIST}?${params.toString()}`;
    return apiClient.get(url);
  }

  // Mark notification as read
  async markAsRead(notificationId: number) {
    return apiClient.patch(ENDPOINTS.NOTIFICATIONS.UPDATE(notificationId), {
      read_at: new Date().toISOString()
    });
  }

  // Send wearable notification
  async sendWearableAlert(data: {
    patient_id: number;
    title: string;
    message: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
  }) {
    return apiClient.post(ENDPOINTS.NOTIFICATIONS.WEARABLE_ALERTS, data);
  }
}

export const notificationService = new NotificationService();
