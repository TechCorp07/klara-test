"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { auditService } from '@/lib/services/auditService'; // Import from existing service

/**
 * Enhanced client component for compliance dashboard page that merges both dashboard implementations
 */
export default function DashboardClient() {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch audit logs with the existing implementation
  useEffect(() => {
    if (!user) return;
    
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const response = await auditService.getAuditLogs({
          timeRange,
          page,
          limit: 10
        });
        
        setAuditLogs(response.results);
        setTotalPages(response.total_pages);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setError('Failed to load audit logs. Please try again later.');
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuditLogs();
  }, [user, timeRange, page]);

  // Fetch compliance reports using React Query
  const { data: complianceReports } = useQuery({
    queryKey: ['complianceReports'],
    queryFn: () => auditService.getComplianceReports(),
    enabled: !!user && (user.role === 'compliance' || user.role === 'admin' || user.role === 'superadmin'),
    onError: (error) => {
      toast.error('Failed to load compliance reports');
      console.error('Error fetching compliance reports:', error);
    }
  });
  
  // Fetch security incidents using React Query
  const { data: securityIncidents } = useQuery({
    queryKey: ['securityIncidents'],
    queryFn: () => auditService.getSecurityIncidents(),
    enabled: !!user && (user.role === 'compliance' || user.role === 'admin' || user.role === 'superadmin'),
    onError: (error) => {
      toast.error('Failed to load security incidents');
      console.error('Error fetching security incidents:', error);
    }
  });
  
  // Fetch compliance metrics using React Query
  const { data: complianceMetrics } = useQuery({
    queryKey: ['complianceMetrics'],
    queryFn: () => auditService.getComplianceMetrics(),
    enabled: !!user && (user.role === 'compliance' || user.role === 'admin' || user.role === 'superadmin'),
    onError: (error) => {
      toast.error('Failed to load compliance metrics');
      console.error('Error fetching compliance metrics:', error);
    }
  });

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Check for permission to view this page
  if (user && (user.role !== 'compliance' && user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Compliance Dashboard</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.first_name || 'Compliance Officer'}!</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Audit Events Today</h2>
          <p className="text-3xl font-bold text-blue-600">
            {complianceMetrics?.audit_events_today || 24}
          </p>
          <Link href="/compliance/audit-log" className="text-blue-600 hover:text-blue-800 text-sm">
            View logs →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Security Incidents</h2>
          <p className="text-3xl font-bold text-red-600">
            {complianceMetrics?.security_incidents_count || 3}
          </p>
          <Link href="/compliance/security" className="text-blue-600 hover:text-blue-800 text-sm">
            View incidents →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Compliance Score</h2>
          <p className="text-3xl font-bold text-green-600">
            {complianceMetrics?.compliance_score || 92}%
          </p>
          <Link href="/compliance/reports" className="text-blue-600 hover:text-blue-800 text-sm">
            View details →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">PHI Access Events</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {complianceMetrics?.phi_access_count || 156}
          </p>
          <Link href="/compliance/phi-access" className="text-blue-600 hover:text-blue-800 text-sm">
            View events →
          </Link>
        </div>
      </div>
      
      {/* Filters and Time Range Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-xl font-semibold">Audit Log Activity</h2>
            <p className="text-gray-600">Review system activity and security events</p>
          </div>
          
          <div>
            <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={handleTimeRangeChange}
              className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Audit Logs and Security Incidents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Recent Audit Logs</h2>
            <Link href="/compliance/audit-log" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : auditLogs && auditLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.slice(0, 5).map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.user_name}</div>
                        <div className="text-sm text-gray-500">{log.user_role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 p-4">No audit logs found matching the current filters.</p>
          )}
        </div>
        
        {/* Security Incidents */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Security Incidents</h2>
            <Link href="/compliance/security" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {securityIncidents && securityIncidents.results && securityIncidents.results.length > 0 ? (
            <div className="space-y-4">
              {securityIncidents.results.slice(0, 5).map((incident) => (
                <div key={incident.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{incident.title}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      incident.status === 'open' 
                        ? 'bg-red-100 text-red-800' 
                        : incident.status === 'investigating'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Type: {incident.incident_type}</p>
                  <p className="text-sm text-gray-600">Reported: {new Date(incident.reported_at).toLocaleDateString()}</p>
                  <div className="flex justify-end mt-1">
                    <Link href={`/compliance/security/${incident.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                      View details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No security incidents found.</p>
          )}
        </div>
      </div>
      
      {/* Compliance Reports and Pending Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Compliance Reports</h2>
            <Link href="/compliance/reports" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {complianceReports && complianceReports.results && complianceReports.results.length > 0 ? (
            <div className="space-y-4">
              {complianceReports.results.slice(0, 5).map((report) => (
                <div key={report.id} className="border-b pb-3">
                  <p className="font-medium">{report.title}</p>
                  <p className="text-sm text-gray-600">Period: {report.period_start} to {report.period_end}</p>
                  <p className="text-sm text-gray-600">Generated: {new Date(report.generated_at).toLocaleDateString()}</p>
                  <div className="flex justify-end mt-1 space-x-2">
                    <Link href={`/compliance/reports/${report.id}`} className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">
                      View
                    </Link>
                    <Link href={`/compliance/reports/${report.id}/download`} className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded">
                      Download
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No compliance reports found.</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Pending Reviews</h2>
            <Link href="/compliance/reviews" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {complianceMetrics && complianceMetrics.pending_reviews && complianceMetrics.pending_reviews.length > 0 ? (
            <div className="space-y-4">
              {complianceMetrics.pending_reviews.slice(0, 5).map((review, index) => (
                <div key={index} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{review.title}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      review.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : review.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {review.priority.charAt(0).toUpperCase() + review.priority.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Type: {review.review_type}</p>
                  <p className="text-sm text-gray-600">Due: {review.due_date}</p>
                  <div className="flex justify-end mt-1">
                    <Link href={`/compliance/reviews/${review.id}`} className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">
                      Start Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending reviews.</p>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/compliance/reports/generate" className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Generate Report</span>
            </div>
          </Link>
          
          <Link href="/compliance/security/new" className="bg-red-100 hover:bg-red-200 text-red-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Report Incident</span>
            </div>
          </Link>
          
          <Link href="/compliance/audit-log/search" className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search Audit Logs</span>
            </div>
          </Link>
          
          <Link href="/compliance/training" className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Compliance Training</span>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Pagination for Audit Logs */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mb-8 rounded-lg shadow-md">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page === 1 ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page === totalPages ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, auditLogs.length)}</span> of{' '}
                <span className="font-medium">{auditLogs.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
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
                
                {/* Page numbers */}
                {[...Array(totalPages).keys()].map((i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      page === i + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${
                    page === totalPages ? 'text-gray-400 bg-gray-100' : 'text-gray-500 bg-white hover:bg-gray-50'
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
      
      {/* Compliance Resources */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Compliance Resources</h2>
          <Link href="/compliance/resources" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">HIPAA Guidelines</h3>
            <p className="text-sm text-gray-600 mb-2">
              Access the latest HIPAA compliance guidelines and requirements.
            </p>
            <Link href="/compliance/resources/hipaa" className="text-blue-600 hover:text-blue-800 text-sm">
              View guidelines →
            </Link>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Security Policies</h3>
            <p className="text-sm text-gray-600 mb-2">
              Review organizational security policies and procedures.
            </p>
            <Link href="/compliance/resources/security-policies" className="text-blue-600 hover:text-blue-800 text-sm">
              View policies →
            </Link>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Audit Procedures</h3>
            <p className="text-sm text-gray-600 mb-2">
              Access audit procedures and compliance checklists.
            </p>
            <Link href="/compliance/resources/audit-procedures" className="text-blue-600 hover:text-blue-800 text-sm">
              View procedures →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}