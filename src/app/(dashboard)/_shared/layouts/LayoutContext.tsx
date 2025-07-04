// src/app/(dashboard)/_shared/layouts/LayoutContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/use-auth';

interface LayoutState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: {
    count: number;
    hasUnread: boolean;
  };
  emergencyAlerts: number;
  isOnline: boolean;
  lastUpdated: Date | null;
  isRefreshing: boolean;
}

interface LayoutContextType extends LayoutState {
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateNotifications: (count: number, hasUnread: boolean) => void;
  setEmergencyAlerts: (count: number) => void;
  setOnlineStatus: (online: boolean) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  refreshData: () => Promise<void>;
  markNotificationsAsRead: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

interface LayoutProviderProps {
  children: React.ReactNode;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const { user } = useAuth();
  const [state, setState] = useState<LayoutState>({
    sidebarOpen: false,
    theme: 'light',
    notifications: {
      count: 0,
      hasUnread: false
    },
    emergencyAlerts: 0,
    isOnline: navigator.onLine,
    lastUpdated: null,
    isRefreshing: false
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('klararety-theme') as 'light' | 'dark' | null;
    const savedSidebarState = localStorage.getItem('klararety-sidebar-open') === 'true';

    setState(prev => ({
      ...prev,
      theme: savedTheme || 'light',
      sidebarOpen: savedSidebarState && window.innerWidth >= 1024 // Only keep open on large screens
    }));
  }, []);

    // Toast management
    const showToast = useCallback((
      message: string, 
      type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newToast: Toast = {
        id,
        message,
        type,
        timestamp: new Date()
      };
      
      setToasts(prev => [...prev, newToast]);
      
      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 5000);
    }, []);
    
  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('klararety-theme', state.theme);
    localStorage.setItem('klararety-sidebar-open', state.sidebarOpen.toString());
  }, [state.theme, state.sidebarOpen]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      showToast('Connection restored', 'success');
    };
    
    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      showToast('Connection lost', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Apply theme to document
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Close sidebar on mobile when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setState(prev => ({ ...prev, sidebarOpen: false }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user || state.isRefreshing) return;

    setState(prev => ({ ...prev, isRefreshing: true }));

    try {
      // In real implementation, these would be actual API calls based on user role
      const promises = [];

      // Common data for all users
      promises.push(
        // fetch('/api/notifications/unread-count'),
        // fetch('/api/system/status'),
        Promise.resolve({ unread_count: 3, has_unread: true }),
        Promise.resolve({ status: 'online' })
      );

      // Role-specific data
      if (user.role === 'compliance' || user.role === 'admin') {
        promises.push(
          // fetch('/api/emergency/active-count')
          Promise.resolve({ active_alerts: 1 })
        );
      }

      const results = await Promise.all(promises);
      
      const notificationData = results[0] as { unread_count: number; has_unread: boolean };
      //const systemData = results[1] as { status: string };
      const emergencyData = results[2] as { active_alerts: number } | undefined;

      setState(prev => ({
        ...prev,
        notifications: {
          count: notificationData.unread_count,
          hasUnread: notificationData.has_unread
        },
        emergencyAlerts: emergencyData?.active_alerts || 0,
        lastUpdated: new Date(),
        isRefreshing: false
      }));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setState(prev => ({ ...prev, isRefreshing: false }));
      
      if (state.isOnline) {
        showToast('Failed to refresh data', 'error');
      }
    }
  }, [user, state.isRefreshing, state.isOnline, showToast]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (user) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, fetchDashboardData]);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!user || !state.isOnline) return;

    // In real implementation, set up WebSocket connection
    // const ws = new WebSocket(`ws://localhost:8000/ws/user/${user.id}/`);
    // 
    // ws.onopen = () => {
    //   console.log('WebSocket connected');
    // };
    // 
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   
    //   switch (data.type) {
    //     case 'notification':
    //       setState(prev => ({ 
    //         ...prev, 
    //         notifications: { 
    //           count: prev.notifications.count + 1, 
    //           hasUnread: true 
    //         } 
    //       }));
    //       showToast(data.message, 'info');
    //       break;
    //       
    //     case 'emergency_access':
    //       if (user.role === 'compliance' || user.role === 'admin') {
    //         setState(prev => ({ 
    //           ...prev, 
    //           emergencyAlerts: prev.emergencyAlerts + 1 
    //         }));
    //         showToast('Emergency access event requires review', 'warning');
    //       }
    //       break;
    //       
    //     case 'caregiver_request':
    //       if (user.role === 'patient') {
    //         showToast('New caregiver authorization request', 'info');
    //       }
    //       break;
    //       
    //     case 'identity_verification_reminder':
    //       if (user.role === 'patient') {
    //         showToast('Identity verification deadline approaching', 'warning');
    //       }
    //       break;
    //   }
    // };
    // 
    // ws.onclose = () => {
    //   console.log('WebSocket disconnected');
    //   if (state.isOnline) {
    //     showToast('Real-time updates disconnected', 'warning');
    //   }
    // };
    // 
    // ws.onerror = (error) => {
    //   console.error('WebSocket error:', error);
    // };
    // 
    // return () => ws.close();
  }, [user, state.isOnline]);

  // Context value
  const contextValue: LayoutContextType = {
    ...state,
    setSidebarOpen: (open: boolean) => {
      setState(prev => ({ ...prev, sidebarOpen: open }));
    },
    setTheme: (theme: 'light' | 'dark') => {
      setState(prev => ({ ...prev, theme }));
    },
    updateNotifications: (count: number, hasUnread: boolean) => {
      setState(prev => ({
        ...prev,
        notifications: { count, hasUnread }
      }));
    },
    setEmergencyAlerts: (count: number) => {
      setState(prev => ({ ...prev, emergencyAlerts: count }));
    },
    setOnlineStatus: (online: boolean) => {
      setState(prev => ({ ...prev, isOnline: online }));
    },
    toggleSidebar: () => {
      setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
    },
    toggleTheme: () => {
      setState(prev => ({ 
        ...prev, 
        theme: prev.theme === 'light' ? 'dark' : 'light' 
      }));
    },
    refreshData: fetchDashboardData,
    markNotificationsAsRead: () => {
      setState(prev => ({
        ...prev,
        notifications: { ...prev.notifications, hasUnread: false }
      }));
    },
    showToast
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={(id) => 
        setToasts(prev => prev.filter(toast => toast.id !== id))
      } />
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

// Toast Container Component
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getToastStyles = (type: Toast['type']) => {
    const baseStyles = "flex items-center w-full max-w-xs p-4 mb-4 text-sm rounded-lg shadow-lg transform transition-all duration-300 ease-in-out";
    
    switch (type) {
      case 'success':
        return `${baseStyles} text-green-800 bg-green-100 border border-green-200`;
      case 'error':
        return `${baseStyles} text-red-800 bg-red-100 border border-red-200`;
      case 'warning':
        return `${baseStyles} text-yellow-800 bg-yellow-100 border border-yellow-200`;
      case 'info':
      default:
        return `${baseStyles} text-blue-800 bg-blue-100 border border-blue-200`;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={getToastStyles(toast.type)}
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
            {getToastIcon(toast.type)}
          </div>
          <div className="ml-3 text-sm font-normal flex-1">
            {toast.message}
          </div>
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 hover:bg-white hover:bg-opacity-20"
            onClick={() => onRemove(toast.id)}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// Additional utility components that can be used across dashboards

// Header component that can be shared across all dashboards
export function DashboardHeader() {
  const { user } = useAuth();
  const { 
    toggleSidebar, 
    theme, 
    toggleTheme,
    emergencyAlerts,
    isOnline,
    lastUpdated 
  } = useLayout();

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'patient': return 'Patient';
      case 'provider': return 'Healthcare Provider';
      case 'researcher': return 'Researcher';
      case 'pharmco': return 'Pharmaceutical';
      case 'caregiver': return 'Caregiver';
      case 'compliance': return 'Compliance Officer';
      case 'admin': return 'Administrator';
      case 'superadmin': return 'Super Administrator';
      default: return 'User';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Klararety Health Platform
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getRoleDisplayName(user?.role)} Dashboard
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Online status indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Last updated */}
          {lastUpdated && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          {/* Emergency alerts (for compliance/admin) */}
          {emergencyAlerts > 0 && (user?.role === 'compliance' || user?.role === 'admin') && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm font-medium">{emergencyAlerts}</span>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {/* User profile info */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Status bar component
export function StatusBar() {
  const { isOnline, emergencyAlerts, notifications, lastUpdated } = useLayout();
  const { user } = useAuth();

  if (!user) return null;

  const hasAlerts = emergencyAlerts > 0 || notifications.hasUnread;

  return (
    <div className={`px-4 py-2 text-sm border-b ${
      hasAlerts 
        ? 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700' 
        : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>System {isOnline ? 'Online' : 'Offline'}</span>
          </span>

          {notifications.hasUnread && (
            <span>{notifications.count} unread notifications</span>
          )}

          {emergencyAlerts > 0 && (
            <span className="font-medium">
              {emergencyAlerts} emergency alert{emergencyAlerts > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
        </div>
      </div>
    </div>
  );
}