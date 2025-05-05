"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityService } from '@/lib/services/securityService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';

/**
 * Client component for security page
 */
export default function SecurityClient() {
  const { user } = useAuth();
  const [scanConfig, setScanConfig] = useState({
    scanType: 'full',
    includeDependencies: true,
    includeConfigurations: true,
    priority: 'normal'
  });
  const queryClient = useQueryClient();
  
  // Redirect if user is not a superadmin
  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      window.location.href = '/dashboard';
    }
  }, [user]);
  
  // Fetch security metrics
  const { data: securityMetrics } = useQuery({
    queryKey: ['securityMetrics'],
    queryFn: () => securityService.getSecurityMetrics(),
    enabled: !!user && user.role === 'superadmin',
    onError: (error) => {
      toast.error('Failed to load security metrics');
      console.error('Error fetching security metrics:', error);
    }
  });
  
  // Fetch vulnerabilities
  const { data: vulnerabilities, isLoading: isLoadingVulnerabilities } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: () => securityService.getVulnerabilities({ limit: 5, sort: 'severity:desc' }),
    enabled: !!user && user.role === 'superadmin',
    onError: (error) => {
      toast.error('Failed to load vulnerabilities');
      console.error('Error fetching vulnerabilities:', error);
    }
  });
  
  // Fetch scan history
  const { data: scanHistory, isLoading: isLoadingScanHistory } = useQuery({
    queryKey: ['scanHistory'],
    queryFn: () => securityService.getSecurityScanHistory({ limit: 5 }),
    enabled: !!user && user.role === 'superadmin',
    onError: (error) => {
      toast.error('Failed to load scan history');
      console.error('Error fetching scan history:', error);
    }
  });
  
  // Start security scan mutation
  const startScanMutation = useMutation({
    mutationFn: (config) => securityService.startSecurityScan(config),
    onSuccess: () => {
      toast.success('Security scan started successfully');
      queryClient.invalidateQueries(['scanHistory']);
    },
    onError: (error) => {
      toast.error('Failed to start security scan');
      console.error('Error starting security scan:', error);
    }
  });
  
  const handleStartScan = () => {
    startScanMutation.mutate(scanConfig);
  };
  
  const handleScanConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setScanConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Get severity class for styling
  const getSeverityClass = (severity) => {
    switch(severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get scan status class for styling
  const getScanStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (!user || user.role !== 'superadmin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">You do not have permission to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Security Vulnerability Dashboard</h1>
        <p className="text-gray-600">Monitor and manage system security vulnerabilities</p>
      </div>
      
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Total Vulnerabilities</h2>
          <p className="text-3xl font-bold text-red-600">
            {securityMetrics?.total_vulnerabilities || 0}
          </p>
          <Link href="/superadmin-dashboard/security/vulnerabilities" className="text-blue-600 hover:text-blue-800 text-sm">
            View all →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Critical Issues</h2>
          <p className="text-3xl font-bold text-red-600">
            {securityMetrics?.critical_vulnerabilities || 0}
          </p>
          <Link href="/superadmin-dashboard/security/vulnerabilities?severity=critical" className="text-blue-600 hover:text-blue-800 text-sm">
            View critical →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Last Scan</h2>
          <p className="text-3xl font-bold text-blue-600">
            {securityMetrics?.last_scan_date ? new Date(securityMetrics.last_scan_date).toLocaleDateString() : 'Never'}
          </p>
          <Link href="/superadmin-dashboard/security/scans" className="text-blue-600 hover:text-blue-800 text-sm">
            View history →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Security Score</h2>
          <p className="text-3xl font-bold text-green-600">
            {securityMetrics?.security_score || 0}/100
          </p>
          <Link href="/superadmin-dashboard/security/compliance" className="text-blue-600 hover:text-blue-800 text-sm">
            View details →
          </Link>
        </div>
      </div>
      
      {/* Start Scan Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Start Security Scan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label htmlFor="scanType" className="block text-sm font-medium text-gray-700 mb-1">
              Scan Type
            </label>
            <select
              id="scanType"
              name="scanType"
              value={scanConfig.scanType}
              onChange={handleScanConfigChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="full">Full System Scan</option>
              <option value="quick">Quick Scan</option>
              <option value="dependencies">Dependencies Only</option>
              <option value="configuration">Configuration Only</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={scanConfig.priority}
              onChange={handleScanConfigChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-4">
          <div className="flex items-center">
            <input
              id="includeDependencies"
              name="includeDependencies"
              type="checkbox"
              checked={scanConfig.includeDependencies}
              onChange={handleScanConfigChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeDependencies" className="ml-2 block text-sm text-gray-700">
              Include Dependencies
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="includeConfigurations"
              name="includeConfigurations"
              type="checkbox"
              checked={scanConfig.includeConfigurations}
              onChange={handleScanConfigChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeConfigurations" className="ml-2 block text-sm text-gray-700">
              Include Configurations
            </label>
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleStartScan}
          disabled={startScanMutation.isPending}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {startScanMutation.isPending ? 'Starting Scan...' : 'Start Security Scan'}
        </button>
      </div>
      
      {/* Recent Vulnerabilities */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Vulnerabilities</h2>
          <Link href="/superadmin-dashboard/security/vulnerabilities" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
        </div>
        
        {isLoadingVulnerabilities ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : vulnerabilities && vulnerabilities.results && vulnerabilities.results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vulnerability
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vulnerabilities.results.map((vulnerability) => (
                  <tr key={vulnerability.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vulnerability.title}</div>
                      <div className="text-sm text-gray-500">{vulnerability.vulnerability_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityClass(vulnerability.severity)}`}>
                        {vulnerability.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vulnerability.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {vulnerability.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/superadmin-dashboard/security/vulnerabilities/${vulnerability.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No vulnerabilities found.</p>
        )}
      </div>
      
      {/* Recent Scans */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Scans</h2>
          <Link href="/superadmin-dashboard/security/scans" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
        </div>
        
        {isLoadingScanHistory ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : scanHistory && scanHistory.results && scanHistory.results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scan ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Findings
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scanHistory.results.map((scan) => (
                  <tr key={scan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {scan.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {scan.scan_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(scan.started_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getScanStatusClass(scan.status)}`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {scan.findings_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/superadmin-dashboard/security/scans/${scan.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No scan history found.</p>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/superadmin-dashboard/security/vulnerabilities" className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>All Vulnerabilities</span>
            </div>
          </Link>
          
          <Link href="/superadmin-dashboard/security/compliance" className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Compliance Report</span>
            </div>
          </Link>
          
          <Link href="/superadmin-dashboard/security/remediation" className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Remediation Plans</span>
            </div>
          </Link>
          
          <Link href="/superadmin-dashboard/security/settings" className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Security Settings</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
