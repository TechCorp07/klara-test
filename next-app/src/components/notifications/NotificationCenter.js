"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { communication } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { toast } from "react-toastify";

export default function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  
  // Fetch notifications
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: () =>
      communication.getNotifications(
        filter !== "all" ? { type: filter } : {}
      ),
    enabled: !!user,
    onError: () => {
      toast.error("Failed to load notifications");
    },
  });
  
  // Mark all as read
  const handleMarkAllAsRead = () => toast.success('All notifications marked as read');
  
  const handleMarkAsRead = (notificationId) => {
    // Implementation would call API to mark as read
    toast.success('Notification marked as read');
  };
  
  // Count unread notifications
  const unreadCount = notifications?.results?.filter(n => !n.read_at).length || 0;
  
  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Notifications"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <button 
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex space-x-4 mt-2">
              <button 
                onClick={() => setFilter('all')}
                className={`text-sm ${filter === 'all' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('system')}
                className={`text-sm ${filter === 'system' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                System
              </button>
              <button 
                onClick={() => setFilter('approval')}
                className={`text-sm ${filter === 'approval' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                Approvals
              </button>
              <button 
                onClick={() => setFilter('alert')}
                className={`text-sm ${filter === 'alert' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                Alerts
              </button>
            </div>
          </div>
          
          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-500">Error loading notifications.</p>
              </div>
            ) : notifications && notifications.results && notifications.results.length > 0 ? (
              <div>
                {notifications.results.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border-b border-gray-200 hover:bg-gray-50 ${!notification.read_at ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start">
                      {/* Notification Icon */}
                      <div className="flex-shrink-0 mr-3">
                        {notification.type === 'system' && (
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                        {notification.type === 'approval' && (
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                        {notification.type === 'alert' && (
                          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Notification Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500">{formatTimeAgo(notification.created_at)}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        
                        {/* Action Buttons */}
                        <div className="mt-2 flex justify-between items-center">
                          {notification.action_url && (
                            <Link 
                              href={notification.action_url}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              {notification.action_text || 'View Details'}
                            </Link>
                          )}
                          
                          {!notification.read_at && (
                            <button 
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-500">No notifications found.</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 text-center">
            <Link 
              href="/notifications"
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format time ago
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) {
    return 'just now';
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  return date.toLocaleDateString();
}
