// hooks/notifications/useNotifications.ts
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { communication } from "@/api";
import { useAuth } from "@/context/AuthContext";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'approval' | 'alert';
  created_at: string;
  read_at: string | null;
  action_url?: string;
  action_text?: string;
}

export interface NotificationsResponse {
  results: Notification[];
  total: number;
  unread: number;
}

export interface NotificationsFilter {
  type?: string;
  read?: boolean;
  limit?: number;
  page?: number;
}

/**
 * Custom hook for fetching notifications with proper error handling
 * and authentication state management
 */
export function useNotifications(
  filter: NotificationsFilter = {},
  options?: Omit<UseQueryOptions<NotificationsResponse, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  const { user } = useAuth();
  
  return useQuery<NotificationsResponse, Error>({
    queryKey: ["notifications", filter],
    queryFn: () => communication.getNotifications(
      filter.type !== "all" && filter.type ? { type: filter.type, ...filter } : filter
    ),
    enabled: !!user,
    onError: () => {
      toast.error("Failed to load notifications");
    },
    ...options
  });
}

/**
 * Custom hook for marking notifications as read
 */
export function useMarkNotificationsAsRead() {
  const markAsRead = async (notificationId: string) => {
    try {
      await communication.markNotificationAsRead(notificationId);
      toast.success('Notification marked as read');
      return true;
    } catch (error) {
      toast.error('Failed to mark notification as read');
      return false;
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await communication.markAllNotificationsAsRead();
      toast.success('All notifications marked as read');
      return true;
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
      return false;
    }
  };
  
  return { markAsRead, markAllAsRead };
}