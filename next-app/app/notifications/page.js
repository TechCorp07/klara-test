"use client";

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/lib/services/auditService';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  // Fetch notifications with pagination
  const { data: notifications, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', filter, page],
    queryFn: () => auditService.getNotifications({ 
      type: filter !== 'all' ? filter : undefined,
      page: page,
      limit: 20
    }),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load notifications');
      console.error('Error fetching notifications:', error);
    }
  });
  
  // Mark all as read
  const handleMarkAllAsRead = () => {
    // Implementation would call API to mark all as read
    toast.success('All notifications marked as read');
  };
  
  // Mark single notification as read
  const handleMarkAsRead = (notificationId) => {
    // Implementation would call API to mark as read
    toast.success('Notification marked as read');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-gray-600">View and manage your notifications</p>
      </div>
      
      {/* Filter and Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${filter === 'all' 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('system')}
              className={`px-4 py-2 rounded-md ${filter === 'system' 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              System
            </button>
            <button 
              onClick={() => setFilter('approval')}
              className={`px-4 py-2 rounded-md ${filter === 'approval' 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Approvals
            </button>
            <button 
              onClick={() => setFilter('alert')}
              className={`px-4 py-2 rounded-md ${filter === 'alert' 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Alerts
            </button>
          </div>
          
          <div>
            <button 
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Mark all as read
            </button>
          </div>
        </div>
      </div>
      
      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500">Error loading notifications. Please try again.</p>
          </div>
        ) : notifications && notifications.results && notifications.results.length > 0 ? (
          <div>
            {notifications.results.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 border-b border-gray-200 hover:bg-gray-50 ${!notification.read_at ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start">
                  {/* Notification Icon */}
                  <div className="flex-shrink-0 mr-4">
                    {notification.type === 'system' && (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                    {notification.type === 'approval' && (
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                    {notification.type === 'alert' && (
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Notification Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{notification.title}</h3>
                      <p className="text-sm text-gray-500">{formatTimeAgo(notification.created_at)}</p>
                    </div>
                    <p className="text-md text-gray-600 mt-1">{notification.message}</p>
                    
                    {/* Additional Details */}
                    {notification.details && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">{notification.details}</p>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="mt-4 flex justify-between items-center">
                      <div className="space-x-2">
                        {notification.action_url && (
                          <Link 
                            href={notification.action_url}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {notification.action_text || 'View Details'}
                          </Link>
                        )}
                        
                        {notification.secondary_action_url && (
                          <Link 
                            href={notification.secondary_action_url}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {notification.secondary_action_text || 'More Info'}
                          </Link>
                        )}
                      </div>
                      
                      {!notification.read_at && (
                        <button 
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
          <div className="p-6 text-center">
            <p className="text-gray-500">No notifications found.</p>
          </div>
        )}
        
        {/* Pagination */}
        {notifications && notifications.total_pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === 1 ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(Math.min(notifications.total_pages, page + 1))}
                disabled={page === notifications.total_pages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === notifications.total_pages ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to <span className="font-medium">{Math.min(page * 20, notifications.total_count)}</span> of{' '}
                  <span className="font-medium">{notifications.total_count}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${
                      page === 1 ? 'text-gray-400 bg-gray-100' : 'text-gray-500 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Generate page numbers */}
                  {Array.from({ length: Math.min(5, notifications.total_pages) }, (_, i) => {
                    // Calculate page number to show (centered around current page)
                    let pageNum;
                    if (notifications.total_pages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= notifications.total_pages - 2) {
                      pageNum = notifications.total_pages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          page === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPage(Math.min(notifications.total_pages, page + 1))}
                    disabled={page === notifications.total_pages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${
                      page === notifications.total_pages ? 'text-gray-400 bg-gray-100' : 'text-gray-500 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
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
