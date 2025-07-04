// src/app/(dashboard)/_shared/hooks/useCommonDashboard.ts
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/use-auth';

interface DashboardError {
  message: string;
  type: 'error' | 'warning' | 'info';
}

interface CommonDashboardState {
  isLoading: boolean;
  error: DashboardError | null;
  lastUpdated: Date | null;
  hasUnreadNotifications: boolean;
  emergencyAlerts: number;
  systemStatus: 'online' | 'maintenance' | 'degraded';
}

interface UseCommonDashboardReturn extends CommonDashboardState {
  refreshData: () => Promise<void>;
  clearError: () => void;
  markNotificationsAsRead: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export function useCommonDashboard(): UseCommonDashboardReturn {
  const { user } = useAuth();
  const [state, setState] = useState<CommonDashboardState>({
    isLoading: true,
    error: null,
    lastUpdated: null,
    hasUnreadNotifications: false,
    emergencyAlerts: 0,
    systemStatus: 'online'
  });

  // Toast state
  const [, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>>([]);

  const fetchCommonData = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // In real implementation, these would be actual API calls
      const [
        notificationResponse,
        systemStatusResponse,
        emergencyResponse
      ] = await Promise.all([
        // fetch('/api/notifications/unread-count'),
        // fetch('/api/system/status'),
        // fetch('/api/emergency/active-count')
        Promise.resolve({ unread_count: 3 }),
        Promise.resolve({ status: 'online' }),
        Promise.resolve({ active_alerts: 0 })
      ]);

      setState(prev => ({
        ...prev,
        isLoading: false,
        hasUnreadNotifications: notificationResponse.unread_count > 0,
        emergencyAlerts: emergencyResponse.active_alerts,
        systemStatus: systemStatusResponse.status as 'online' | 'maintenance' | 'degraded',
        lastUpdated: new Date()
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to load dashboard data',
          type: 'error'
        }
      }));
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    await fetchCommonData();
  }, [fetchCommonData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const markNotificationsAsRead = useCallback(() => {
    setState(prev => ({ ...prev, hasUnreadNotifications: false }));
  }, []);

  const showToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  // Check for role-specific alerts
  useEffect(() => {
    if (!user) return;

    switch (user.role) {
      case 'patient':
        // Check for identity verification deadline
        if (user.profile?.days_until_verification_required !== null && 
            user.profile?.days_until_verification_required !== undefined && 
            user.profile?.days_until_verification_required <= 3) {
          setState(prev => ({
            ...prev,
            error: {
              message: `Identity verification required within ${user.profile?.days_until_verification_required} days`,
              type: 'warning'
            }
          }));
        }
        break;
        
      case 'compliance':
        // Check for pending emergency access reviews
        if (state.emergencyAlerts > 0) {
          setState(prev => ({
            ...prev,
            error: {
              message: `${state.emergencyAlerts} emergency access events require review`,
              type: 'warning'
            }
          }));
        }
        break;
        
      case 'admin':
        // Check for pending user approvals
        // This would typically come from the API response
        break;
    }
  }, [user, state.emergencyAlerts]);

  // Initial data fetch
  useEffect(() => {
    fetchCommonData();
  }, [fetchCommonData]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchCommonData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCommonData]);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!user) return;

    // In real implementation, set up WebSocket connection
    // const ws = new WebSocket(`ws://localhost:8000/ws/user/${user.id}/`);
    // 
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   
    //   switch (data.type) {
    //     case 'notification':
    //       setState(prev => ({ ...prev, hasUnreadNotifications: true }));
    //       showToast(data.message, 'info');
    //       break;
    //       
    //     case 'emergency_access':
    //       setState(prev => ({ ...prev, emergencyAlerts: prev.emergencyAlerts + 1 }));
    //       showToast('Emergency access event requires review', 'warning');
    //       break;
    //       
    //     case 'system_status':
    //       setState(prev => ({ ...prev, systemStatus: data.status }));
    //       if (data.status !== 'online') {
    //         showToast(`System status: ${data.status}`, 'warning');
    //       }
    //       break;
    //   }
    // };
    // 
    // return () => ws.close();
  }, [user, showToast]);

  return {
    ...state,
    refreshData,
    clearError,
    markNotificationsAsRead,
    showToast
  };
}

// Toast component to display notifications
export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
      default:
        return 'bg-blue-500 text-white';
    }
  };

  // Using React.createElement instead of JSX syntax
  return React.createElement(
    'div',
    { className: 'fixed top-4 right-4 z-50 space-y-2' },
    toasts.map((toast) => 
      React.createElement(
        'div',
        { 
          key: toast.id,
          className: `px-4 py-3 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${getToastStyles(toast.type)}`
        },
        React.createElement(
          'div',
          { className: 'flex items-center justify-between' },
          React.createElement(
            'span',
            { className: 'text-sm font-medium' },
            toast.message
          ),
          React.createElement(
            'button',
            { 
              onClick: () => removeToast(toast.id),
              className: 'ml-3 text-white hover:text-gray-200'
            },
            React.createElement(
              'svg',
              { 
                className: 'w-4 h-4',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24'
              },
              React.createElement(
                'path',
                {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M6 18L18 6M6 6l12 12'
                }
              )
            )
          )
        )
      )
    )
  );
}

// Hook for managing dashboard refresh
export function useDashboardRefresh(refreshFunction: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshFunction();
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFunction]);

  return {
    isRefreshing,
    lastRefresh,
    refresh
  };
}