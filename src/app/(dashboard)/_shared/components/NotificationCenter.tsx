// src/app/(dashboard)/_shared/components/NotificationCenter.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/use-auth';

interface Notification {
  id: string;
  type: 'emergency' | 'caregiver_request' | 'appointment' | 'medication' | 'verification' | 'system' | 'security';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  actionText?: string;
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    // In real implementation, this would fetch from /api/notifications/
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'emergency',
        title: 'Emergency Access Alert',
        message: 'Emergency PHI access has been initiated and requires review',
        timestamp: '2024-01-15T10:30:00Z',
        read: false,
        priority: 'high',
        actionUrl: '/dashboard/compliance/emergency-access',
        actionText: 'Review'
      },
      {
        id: '2',
        type: 'caregiver_request',
        title: 'New Caregiver Request',
        message: 'Jane Smith has requested caregiver access to your account',
        timestamp: '2024-01-15T09:15:00Z',
        read: false,
        priority: 'medium',
        actionUrl: '/dashboard/patient/caregiver-requests',
        actionText: 'Review Request'
      },
      {
        id: '3',
        type: 'verification',
        title: 'Identity Verification Required',
        message: 'Please verify your identity within 5 days to maintain account access',
        timestamp: '2024-01-14T14:20:00Z',
        read: true,
        priority: 'high',
        actionUrl: '/dashboard/patient/verify-identity',
        actionText: 'Verify Now'
      }
    ];
    
    // Filter notifications based on user role
    const filteredNotifications = mockNotifications.filter(notification => {
      switch (user?.role) {
        case 'patient':
          return ['caregiver_request', 'appointment', 'medication', 'verification', 'system'].includes(notification.type);
        case 'provider':
          return ['emergency', 'appointment', 'system', 'security'].includes(notification.type);
        case 'compliance':
          return ['emergency', 'security', 'system'].includes(notification.type);
        case 'admin':
          return true; // Admins see all notifications
        default:
          return ['system'].includes(notification.type);
      }
    });

    setNotifications(filteredNotifications);
    setUnreadCount(filteredNotifications.filter(n => !n.read).length);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // In real implementation, set up WebSocket connection for real-time notifications
      // setupWebSocketConnection(user.id);
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    // In real implementation, this would call /api/notifications/{id}/mark-read/
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    // In real implementation, this would call /api/notifications/mark-all-read/
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'emergency': return '🚨';
      case 'caregiver_request': return '👥';
      case 'appointment': return '📅';
      case 'medication': return '💊';
      case 'verification': return '🔒';
      case 'security': return '🛡️';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                    if (notification.actionUrl) {
                      // In real implementation: router.push(notification.actionUrl);
                      console.log(`Navigate to: ${notification.actionUrl}`);
                    }
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium text-gray-900 ${
                          !notification.read ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          getPriorityColor(notification.priority)
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                        {notification.actionText && (
                          <span className="text-xs text-blue-600 font-medium">
                            {notification.actionText} →
                          </span>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <button 
              onClick={() => {
                // In real implementation: router.push('/dashboard/notifications');
                console.log('Navigate to full notifications page');
                setIsOpen(false);
              }}
              className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close panel */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}