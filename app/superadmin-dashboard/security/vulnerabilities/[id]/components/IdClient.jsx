"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { securityService } from '@/lib/services/securityService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';

/**
 * Client component for vulnerability details page
 */
export default function IdClient() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [remediationPlan, setRemediationPlan] = useState({
    action: 'patch',
    assignee: '',
    priority: 'high',
    notes: '',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  });
  
  // Redirect if user is not a superadmin
  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  // Fetch vulnerability details
  const { data: vulnerability, isLoading, error } = useQuery({
    queryKey: ['vulnerability', id],
    queryFn: () => securityService.getVulnerabilityDetails(id),
    enabled: !!id && !!user && user.role === 'superadmin',
    onError: (error) => {
      toast.error('Failed to load vulnerability details');
      console.error('Error fetching vulnerability details:', error);
    }
  });
  
  const handleRemediationChange = (e) => {
    const { name, value } = e.target;
    setRemediationPlan(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusUpdate(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateRemediationPlan = async () => {
    try {
      await securityService.createRemediationPlan(id, remediationPlan);
      toast.success('Remediation plan created successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to create remediation plan');
      console.error('Error creating remediation plan:', error);
    }
  };
  
  const handleUpdateStatus = async () => {
    try {
      await securityService.updateVulnerabilityStatus(id, statusUpdate);
      toast.success('Vulnerability status updated successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update vulnerability status');
      console.error('Error updating vulnerability status:', error);
    }
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
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !vulnerability) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load vulnerability details.</span>
        </div>
        <div className="mt-4">
          <Link href="/superadmin-dashboard/security" className="text-blue-600 hover:text-blue-800">
            ← Back to Security Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/superadmin-dashboard/security" className="text-blue-600 hover:text-blue-800">
          ← Back to Security Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-2">{vulnerability.title}</h1>
        <div className="flex items-center mt-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityClass(vulnerability.severity)} mr-2`}>
            {vulnerability.severity}
          </span>
          <span className="text-gray-600">ID: {vulnerability.vulnerability_id}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main vulnerability details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Vulnerability Details</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-700">{vulnerability.description}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Impact</h3>
              <p className="text-gray-700">{vulnerability.impact}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Location</h3>
              <p className="text-gray-700">{vulnerability.location}</p>
            </div>
            
            {vulnerability.affected_components && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Affected Components</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {vulnerability.affected_components.map((component, index) => (
                    <li key={index}>{component}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {vulnerability.cve_id && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">CVE ID</h3>
                <p className="text-gray-700">
                  <a 
                    href={`https://nvd.nist.gov/vuln/detail/${vulnerability.cve_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {vulnerability.cve_id}
                  </a>
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Remediation</h2>
            
            {vulnerability.remediation_steps ? (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Recommended Steps</h3>
                <p className="text-gray-700 whitespace-pre-line">{vulnerability.remediation_steps}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic mb-4">No remediation steps provided.</p>
            )}
            
            {vulnerability.references && vulnerability.references.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">References</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {vulnerability.references.map((reference, index) => (
                    <li key={index}>
                      <a 
                        href={reference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {reference.title || reference.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {vulnerability.remediation_plan && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Current Remediation Plan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Action</h3>
                  <p className="text-gray-900">{vulnerability.remediation_plan.action}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assignee</h3>
                  <p className="text-gray-900">{vulnerability.remediation_plan.assignee}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                  <p className="text-gray-900">{vulnerability.remediation_plan.priority}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                  <p className="text-gray-900">{new Date(vulnerability.remediation_plan.due_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="text-gray-900 whitespace-pre-line">{vulnerability.remediation_plan.notes}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar with status and actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Current Status</span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {vulnerability.status}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Discovered</span>
                <span className="text-gray-900">{new Date(vulnerability.discovered_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Last Updated</span>
                <span className="text-gray-900">{new Date(vulnerability.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {vulnerability.fixed_in_version && (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Fixed in Version</span>
                  <span className="text-gray-900">{vulnerability.fixed_in_version}</span>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Update Status</h3>
              
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  New Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={statusUpdate.status}
                  onChange={handleStatusChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="wont_fix">Won't Fix</option>
                  <option value="false_positive">False Positive</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={statusUpdate.notes}
                  onChange={handleStatusChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Add notes about this status change"
                ></textarea>
              </div>
              
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={!statusUpdate.status}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
          
          {!vulnerability.remediation_plan && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Create Remediation Plan</h2>
              
              <div className="mb-4">
                <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <select
                  id="action"
                  name="action"
                  value={remediationPlan.action}
                  onChange={handleRemediationChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="patch">Patch</option>
                  <option value="upgrade">Upgrade</option>
                  <option value="reconfigure">Reconfigure</option>
                  <option value="replace">Replace</option>
                  <option value="mitigate">Mitigate</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <input
                  type="text"
                  id="assignee"
                  name="assignee"
                  value={remediationPlan.assignee}
                  onChange={handleRemediationChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter assignee name or email"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={remediationPlan.priority}
                  onChange={handleRemediationChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={remediationPlan.due_date}
                  onChange={handleRemediationChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="remediation_notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="remediation_notes"
                  name="notes"
                  rows="3"
                  value={remediationPlan.notes}
                  onChange={handleRemediationChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Add notes about the remediation plan"
                ></textarea>
              </div>
              
              <button
                type="button"
                onClick={handleCreateRemediationPlan}
                disabled={!remediationPlan.assignee}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Remediation Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
