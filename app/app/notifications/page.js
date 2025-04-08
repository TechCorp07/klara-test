'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { FaBell, FaEnvelope, FaCalendarAlt, FaFileMedical, FaExclamationTriangle, FaCheck, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { communication } from '../../lib/api';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';

// Notification type icon component
const NotificationTypeIcon = ({ type }) => {
  switch (type) {
    case 'appointment':
      return <FaCalendarAlt className="h-5 w-5 text-blue-500" />;
    case 'message':
      return <FaEnvelope className="h-5 w-5 text-green-500" />;
    case 'lab_result':
      return <FaFileMedical className="h-5 w-5 text-purple-500" />;
    case 'system':
      return <FaBell className="h-5 w-5 text-yellow-500" />;
    default:
      return <FaBell className="h-5 w-5 text-gray-500" />;
  }
};

// Individual notification item component
const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const isRead = !!notification.read_at;
  
  return (
    <div className={`border-b border-gray-200 p-4 ${isRead ? 'bg-white' : 'bg-blue-50'}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-1">
          <NotificationTypeIcon type={notification.notification_type} />
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`text-sm font-medium ${isRead ? 'text-gray-900' : 'text-blue-700'}`}>
                {notification.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{notification.body}</p>
            </div>
            <span className="text-xs text-gray-500">
              {format(parseISO(notification.created_at), 'MMM d, h:mm a')}
            </span>
          </div>
          
          <div className="mt-2 flex justify-between items-center">
            {notification.action_url && (
              <Link 
                href={notification.action_url}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View Details
              </Link>
            )}
            
            <div className="flex space-x-2">
              {!isRead && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaCheck className="mr-1 h-3 w-3" /> Mark as Read
                </button>
              )}
              
              <button
                onClick={() => onDelete(notification.id)}
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaTrash className="mr-1 h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = () => (
  <div className="text-center py-12">
    <FaBell className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-lg font-medium text-gray-900">No Notifications</h3>
    <p className="mt-1 text-sm text-gray-500">You don't have any notifications at this time.</p>
  </div>
);

// Main notifications page component
export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch notifications on load
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await communication.getNotifications();
        setNotifications(response);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);
  
  // Filter notifications based on active tab
  const filteredNotifications = () => {
    if (activeTab === 'all') {
      return notifications;
    } else if (activeTab === 'unread') {
      return notifications.filter(notification => !notification.read_at);
    } else {
      return notifications.filter(notification => notification.notification_type === activeTab);
    }
  };
  
  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await communication.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await communication.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(notifications.map(notification => ({
        ...notification,
        read_at: notification.read_at || new Date().toISOString()
      })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  // Delete notification
  const handleDelete = async (notificationId) => {
    try {
      await communication.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };
  
  // Get counts for tabs
  const getTabCounts = () => {
    const unreadCount = notifications.filter(n => !n.read_at).length;
    const appointmentCount = notifications.filter(n => n.notification_type === 'appointment').length;
    const messageCount = notifications.filter(n => n.notification_type === 'message').length;
    const labResultCount = notifications.filter(n => n.notification_type === 'lab_result').length;
    const systemCount = notifications.filter(n => n.notification_type === 'system').length;
    
    return {
      unread: unreadCount,
      appointment: appointmentCount,
      message: messageCount,
      lab_result: labResultCount,
      system: systemCount
    };
  };
  
  const tabCounts = getTabCounts();
  
  // Tab component
  const Tab = ({ id, label, count, icon: Icon }) => (
    <button
      className={`flex items-center px-3 py-2 font-medium text-sm rounded-md ${
        activeTab === id 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }`}
      onClick={() => setActiveTab(id)}
    >
      <Icon className="mr-2 h-5 w-5" />
      {label}
      {count > 0 && (
        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
          activeTab === id
            ? 'bg-blue-200 text-blue-800'
            : 'bg-gray-200 text-gray-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          
          {tabCounts.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaCheck className="mr-2 h-4 w-4 text-gray-500" />
              Mark All as Read
            </button>
          )}
        </div>
        
        {error && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Tabs sidebar */}
          <div className="w-full md:w-64 flex flex-col space-y-2">
            <Tab id="all" label="All Notifications" count={notifications.length} icon={FaBell} />
            <Tab id="unread" label="Unread" count={tabCounts.unread} icon={FaExclamationTriangle} />
            <Tab id="appointment" label="Appointments" count={tabCounts.appointment} icon={FaCalendarAlt} />
            <Tab id="message" label="Messages" count={tabCounts.message} icon={FaEnvelope} />
            <Tab id="lab_result" label="Lab Results" count={tabCounts.lab_result} icon={FaFileMedical} />
            <Tab id="system" label="System" count={tabCounts.system} icon={FaBell} />
          </div>
          
          {/* Notifications list */}
          <div className="flex-1">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {loading ? (
                <div className="p-6 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredNotifications().length === 0 ? (
                <EmptyState />
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredNotifications().map((notification) => (
                    <li key={notification.id}>
                      <NotificationItem 
                        notification={notification} 
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
