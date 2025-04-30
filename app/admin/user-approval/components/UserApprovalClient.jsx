"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

/**
 * Enhanced client component for user approval page
 * Allows administrators to review and manage pending user registration requests
 */
export default function UserApprovalClient() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Fetch pending users
    const fetchPendingUsers = async () => {
      try {
        // This would be replaced with actual API call
        setTimeout(() => {
          setPendingUsers([
            {
              id: 101,
              name: 'John Smith',
              email: 'john.smith@example.com',
              role: 'patient',
              registration_date: '2023-04-10T14:30:00Z',
              status: 'pending'
            },
            {
              id: 102,
              name: 'Emily Johnson',
              email: 'emily.johnson@example.com',
              role: 'provider',
              registration_date: '2023-04-11T09:15:00Z',
              status: 'pending'
            },
            {
              id: 103,
              name: 'Michael Brown',
              email: 'michael.brown@example.com',
              role: 'pharmco',
              registration_date: '2023-04-12T16:45:00Z',
              status: 'pending'
            }
          ]);
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching pending users:', error);
        toast.error('Failed to load pending user approvals');
        setIsLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  const handleApproveUser = async (userId) => {
    setIsProcessing(true);
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user status
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      
      toast.success('User approved successfully');
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectUser = async (userId) => {
    setIsProcessing(true);
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove user from pending list
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      
      toast.success('User rejected');
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    return formatDate(dateString);
  };

  if (isLoading) {
    return (
      <DashboardLayout 
        title="User Approval" 
        subtitle="Review and approve new user registrations"
        role={user?.role || 'admin'}
      >
        <div className="flex items-center justify-center h-64">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600">Loading pending approvals...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="User Approval" 
      subtitle="Review and approve new user registrations"
      role={user?.role || 'admin'}
    >
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Approvals</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Review and approve new user registrations.
          </p>
        </div>
        
        {pendingUsers.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
            <p className="mt-1 text-sm text-gray-500">
              All user registration requests have been processed.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {pendingUsers.map((user) => (
              <li key={user.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-800 text-lg font-medium">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'provider' ? 'bg-blue-100 text-blue-800' : 
                      user.role === 'patient' ? 'bg-green-100 text-green-800' : 
                      user.role === 'pharmco' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                    <span className="mt-1 text-sm text-gray-500">
                      Registered: {getRelativeTime(user.registration_date)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => {
                      // View user details
                      toast.info(`Viewing details for ${user.name}`);
                    }}
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={() => handleRejectUser(user.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => handleApproveUser(user.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
