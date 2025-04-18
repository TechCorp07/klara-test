"use client";

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/lib/services/auditService';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function AdminSystemAlerts() {
  const { user } = useAuth();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Fetch system alerts with filters
  const { data: alerts, isLoading, error, refetch } = useQuery({
    queryKey: ['systemAlerts', severityFilter, statusFilter],
    queryFn: () => auditService.getSystemAlerts({ 
      severity: severityFilter !== 'all' ? severityFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined
    }),
    enabled: !!user && (user.role === 'admin' || user.role === 'superadmin'),
    onError: (error) => {
      toast.error('Failed to load system alerts');
      console.error('Error fetching alerts:', error);
    }
  });
  
  // Redirect if user is not an admin or superadmin
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
      window.location.href = '/dashboard';
    }
  }, [user]);
  
  const handleSeverityFilterChange = (e) => {
    setSeverityFilter(e.target.value);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  const handleResolveAlert = (alertId) => {
    // Implementation would call API to resolve alert
    toast.success('Alert marked as resolved');
  };
  
  const handleAcknowledgeAlert = (alertId) => {
    // Implementation would call API to acknowledge alert
    toast.success('Alert acknowledged');
  };
  
  const handleIgnoreAlert = (alertId) => {
    // Implementation would call API to ignore alert
    toast.success('Alert ignored');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Alerts</h1>
        <p className="text-gray-600">Monitor and manage system alerts and notifications</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div>
            <label htmlFor="severityFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              id="severityFilter"
              value={severityFilter}
              onChange={handleSeverityFilterChange}
              className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
              <option value="ignored">Ignored</option>
            </select>
          </div>
          
          <div className="flex-1 md:text-right">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500">Error loading alerts. Please try again.</p>
          </div>
        ) : alerts && alerts.results && alerts.results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alert
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.results.map((alert) => (
                  <tr key={alert.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                      <div className="text-sm text-gray-500">{alert.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        alert.severity === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : alert.severity === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        alert.status === 'active'
                          ? 'bg-red-100 text-red-800'
                          : alert.status === 'acknowledged'
                          ? 'bg-yellow-100 text-yellow-800'
                          : alert.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(alert.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/admin/alerts/${alert.id}`} className="text-blue-600 hover:text-blue-900">
                          Details
                        </Link>
                        {alert.status === 'active' && (
                          <button 
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Acknowledge
                          </button>
                        )}
                        {(alert.status === 'active' || alert.status === 'acknowledged') && (
                          <button 
                            onClick={() => handleResolveAlert(alert.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Resolve
                          </button>
                        )}
                        {alert.status === 'active' && (
                          <button 
                            onClick={() => handleIgnoreAlert(alert.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Ignore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No system alerts found matching your criteria.</p>
          </div>
        )}
        
        {/* Pagination */}
        {alerts && alerts.total_pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{alerts.results.length > 0 ? 1 : 0}</span> to <span className="font-medium">{alerts.results.length}</span> of{' '}
                  <span className="font-medium">{alerts.total_count}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {/* Page numbers would be dynamically generated here */}
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
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
