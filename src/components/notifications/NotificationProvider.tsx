// src/components/notifications/NotificationProvider.tsx
import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
}

interface NotificationState {
  notifications: Notification[];
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' };

const NotificationContext = createContext<{
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
} | null>(null);

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: []
      };
    default:
      return state;
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, { notifications: [] });

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? (notification.type === 'error' ? 8000 : 5000)
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // Auto-remove notification after duration (unless persistent)
    if (!notification.persistent && newNotification.duration) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications: state.notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({ 
  notification, 
  onRemove 
}: { 
  notification: Notification; 
  onRemove: () => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`${getBgColor()} border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={onRemove}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Real-time medication reminder component
export function MedicationReminder({ 
  medication, 
  onTaken, 
  onSkipped 
}: {
  medication: {
    id: number;
    name: string;
    dosage: string;
    scheduledTime: string;
  };
  onTaken: (medicationId: number) => void;
  onSkipped: (medicationId: number) => void;
}) {
  const { addNotification } = useNotifications();

  const handleTaken = () => {
    onTaken(medication.id);
    addNotification({
      type: 'success',
      title: 'Medication Logged',
      message: `${medication.name} marked as taken`,
      duration: 3000
    });
  };

  const handleSkipped = () => {
    onSkipped(medication.id);
    addNotification({
      type: 'warning',
      title: 'Dose Skipped',
      message: `${medication.name} marked as skipped`,
      duration: 3000
    });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-blue-900">Time for your medication</h4>
          <p className="text-sm text-blue-700">
            {medication.name} - {medication.dosage}
          </p>
          <p className="text-xs text-blue-600">
            Scheduled for {medication.scheduledTime}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleTaken}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            Taken
          </button>
          <button
            onClick={handleSkipped}
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// Real-time vital signs alerts
export function VitalSignsAlert({ 
  alert,
}: {
  alert: {
    id: string;
    vital: string;
    value: number | string;
    threshold: string;
    severity: 'warning' | 'critical';
  };
  onDismiss: (alertId: string) => void;
}) {
  const { addNotification } = useNotifications();

  useEffect(() => {
    addNotification({
      type: alert.severity === 'critical' ? 'error' : 'warning',
      title: 'Vital Signs Alert',
      message: `${alert.vital}: ${alert.value} (${alert.threshold})`,
      persistent: alert.severity === 'critical',
      action: {
        label: 'View Details',
        onClick: () => {
          // Navigate to vitals page
          window.location.href = '/patient/vitals';
        }
      }
    });
  }, [alert, addNotification]);

  return null;
}

// Live update indicator
export function LiveUpdateIndicator({ 
  lastUpdated, 
  isUpdating 
}: { 
  lastUpdated: Date | null; 
  isUpdating: boolean; 
}) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
      
      if (diffSeconds < 60) {
        setTimeAgo('Just now');
      } else if (diffSeconds < 3600) {
        setTimeAgo(`${Math.floor(diffSeconds / 60)}m ago`);
      } else {
        setTimeAgo(`${Math.floor(diffSeconds / 3600)}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center text-xs text-gray-500">
      <div className={`w-2 h-2 rounded-full mr-2 ${
        isUpdating ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
      }`}></div>
      <span>
        {isUpdating ? 'Updating...' : `Last updated ${timeAgo}`}
      </span>
    </div>
  );
}

// Appointment reminder component
export function AppointmentReminder({ 
  appointment,
  minutesUntil 
}: {
  appointment: {
    id: number;
    provider: string;
    time: string;
    type: string;
    isTelemedicine: boolean;
  };
  minutesUntil: number;
}) {
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (minutesUntil <= 15 && minutesUntil > 0) {
      addNotification({
        type: 'info',
        title: 'Upcoming Appointment',
        message: `${appointment.provider} in ${minutesUntil} minutes`,
        persistent: true,
        action: appointment.isTelemedicine ? {
          label: 'Join Now',
          onClick: () => {
            // Navigate to telemedicine join page
            window.location.href = `/patient/appointments/${appointment.id}/join`;
          }
        } : undefined
      });
    }
  }, [appointment, minutesUntil, addNotification]);

  return null;
}