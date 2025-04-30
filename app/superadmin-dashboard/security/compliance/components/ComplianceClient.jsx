"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { securityService } from '@/lib/services/securityService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';

/**
 * Client component for compliance page
 */
export default function ComplianceClient() {
  const { user } = useAuth();
  
  // Redirect if user is not a superadmin
  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      window.location.href = '/dashboard';
    }
  }, [user]);
  
  // Fetch compliance report
  const { data: complianceReport, isLoading, error } = useQuery({
    queryKey: ['complianceReport'],
    queryFn: () => securityService.getComplianceReport(),
    enabled: !!user && user.role === 'superadmin',
    onError: (error) => {
      toast.error('Failed to load compliance report');
      console.error('Error fetching compliance report:', error);
    }
  });
  
  // Get status class for styling
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partially_compliant': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'not_applicable': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Calculate compliance percentage
  const calculateCompliancePercentage = (category) => {
    if (!category || !category.checks || category.checks.length === 0) return 0;
    
    const compliantChecks = category.checks.filter(check => 
      check.status.toLowerCase() === 'compliant'
    ).length;
    
    return Math.round((compliantChecks / category.checks.length) * 100);
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
        <Link href="/superadmin-dashboard/security" className="text-blue-600 hover:text-blue-800">
          ← Back to Security Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-2">Security Compliance Report</h1>
        <p className="text-gray-600">Comprehensive security compliance status for healthcare standards</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load compliance report.</span>
        </div>
      ) : complianceReport ? (
        <>
          {/* Overall Compliance Score */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Overall Compliance Score</h2>
                <p className="text-gray-600">Last updated: {new Date(complianceReport.last_updated).toLocaleString()}</p>
              </div>
              <div className="mt-4 md:mt-0 text-center">
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-50 text-blue-600 text-3xl font-bold">
                  {complianceReport.overall_score}%
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {complianceReport.overall_score >= 90 ? 'Excellent' : 
                   complianceReport.overall_score >= 75 ? 'Good' : 
                   complianceReport.overall_score >= 60 ? 'Fair' : 'Poor'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Compliance Categories */}
          {complianceReport.categories && complianceReport.categories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">{category.name}</h2>
                  <p className="text-gray-600">{category.description}</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-4 mr-2">
                    <div 
                      className="bg-blue-600 h-4 rounded-full" 
                      style={{ width: `${calculateCompliancePercentage(category)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{calculateCompliancePercentage(category)}%</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Checked
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {category.checks && category.checks.map((check, checkIndex) => (
                      <tr key={checkIndex}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{check.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(check.status)}`}>
                            {check.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{check.details}</div>
                          {check.remediation_steps && (
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Remediation: </span>
                              {check.remediation_steps}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(check.last_checked).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          
          {/* Recommendations */}
          {complianceReport.recommendations && complianceReport.recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
              
              <ul className="space-y-4">
                {complianceReport.recommendations.map((recommendation, index) => (
                  <li key={index} className="bg-yellow-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">{recommendation.title}</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>{recommendation.description}</p>
                        </div>
                        {recommendation.priority && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Priority: {recommendation.priority}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  toast.info('Generating PDF report...');
                  // This would typically trigger an API call to generate a PDF
                }}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export PDF Report
              </button>
              
              <button
                type="button"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => {
                  toast.info('Scheduling new compliance scan...');
                  // This would typically trigger an API call to schedule a scan
                }}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run Compliance Scan
              </button>
              
              <button
                type="button"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                onClick={() => window.location.href = '/superadmin-dashboard/security/vulnerabilities'}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                View Vulnerabilities
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-center py-4">No compliance report data available.</p>
        </div>
      )}
    </div>
  );
}