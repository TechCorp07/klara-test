// src/components/emergency-access/EmergencyAccessPanel.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import FormButton from '@/components/ui/common/FormButton';
import { Spinner } from '@/components/ui/spinner';
import { EmergencyAccessReason } from '@/types/auth.types';

interface EmergencyAccessPanelProps {
  mode: 'initiate' | 'review' | 'summary';
  onComplete?: (result: Record<string, unknown>) => void;
}

interface EmergencyAccessRecord {
  id: number;
  requester_name?: string;
  requested_at: string;
  reason: string;
  patient_identifier: string;
  duration: string;
  detailed_reason?: string;
}

interface EmergencyAccessSummary {
  total_requests: number;
  pending_review: number;
  justified_access: number;
  active_sessions: number;
  by_reason: Record<string, number>;
  recent_requests: number;
}

export function EmergencyAccessPanel({ mode, onComplete }: EmergencyAccessPanelProps) {
  const { initiateEmergencyAccess, endEmergencyAccess, reviewEmergencyAccess, getEmergencyAccessRecords, getEmergencyAccessSummary } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [patientIdentifier, setPatientIdentifier] = useState('');
  const [reason, setReason] = useState<EmergencyAccessReason | ''>('');
  const [detailedReason, setDetailedReason] = useState('');
  const [phiSummary, ] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isJustified, setIsJustified] = useState(true);
  const [selectedAccessId, setSelectedAccessId] = useState<number | null>(null);
  
  // Records for review
  const [records, setRecords] = useState<EmergencyAccessRecord[]>([]);
  const [summary, setSummary] = useState<EmergencyAccessSummary | null>(null);

  // Load records or summary based on mode
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (mode === 'review') {
        const data = await getEmergencyAccessRecords({ reviewed: false });
        setRecords(data);
      } else if (mode === 'summary') {
        const data = await getEmergencyAccessSummary();
        setSummary(data);
      }
    } catch (err) {
      setError('Failed to load emergency access data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle initiate emergency access
  const handleInitiateAccess = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!patientIdentifier || !reason) {
        setError('Patient identifier and reason are required');
        return;
      }
      
      const result = await initiateEmergencyAccess({
        patient_identifier: patientIdentifier,
        reason,
        detailed_reason: detailedReason
      });
      
      setSuccess(`Emergency access granted. Access ID: ${result.access_id}. Expires in ${result.expires_in}.`);
      
      if (onComplete) {
        onComplete(result as Record<string, unknown>);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to initiate emergency access');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle end emergency access
  const handleEndAccess = async (accessId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await endEmergencyAccess(accessId, phiSummary);
      setSuccess('Emergency access ended successfully');
      
      // Refresh records
      if (mode === 'review') {
        await loadData();
      }
      
      if (onComplete) {
        onComplete({ accessId, ended: true });
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to end emergency access');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle review emergency access
  const handleReviewAccess = async () => {
    if (!selectedAccessId) {
      setError('No access record selected for review');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await reviewEmergencyAccess(selectedAccessId, {
        notes: reviewNotes,
        justified: isJustified
      });
      
      setSuccess('Emergency access review submitted successfully');
      
      // Refresh records
      await loadData();
      
      if (onComplete) {
        onComplete({ accessId: selectedAccessId, reviewed: true, justified: isJustified });
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to submit review');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render different UI based on mode
  const renderContent = () => {
    switch (mode) {
      case 'initiate':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Initiate Emergency Access</h2>
            <p className="text-sm text-gray-600">
              Emergency access should only be used in situations where immediate access to patient data
              is necessary for patient care and normal authorization processes cannot be followed.
            </p>
            <div className="space-y-3">
              <div>
                <label htmlFor="patient-id" className="block text-sm font-medium text-gray-700">
                  Patient Identifier
                </label>
                <input
                  id="patient-id"
                  type="text"
                  value={patientIdentifier}
                  onChange={(e) => setPatientIdentifier(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Patient ID, MRN, or email"
                />
              </div>
              
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Reason for Emergency Access
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as EmergencyAccessReason)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a reason</option>
                  <option value="LIFE_THREATENING">Life-threatening emergency</option>
                  <option value="URGENT_CARE">Urgent medical care</option>
                  <option value="PATIENT_UNABLE">Patient unable to provide consent</option>
                  <option value="IMMINENT_DANGER">Imminent danger to patient or others</option>
                  <option value="OTHER">Other (specify)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="detailed-reason" className="block text-sm font-medium text-gray-700">
                  Detailed Justification
                </label>
                <textarea
                  id="detailed-reason"
                  value={detailedReason}
                  onChange={(e) => setDetailedReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide detailed justification for emergency access"
                />
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      All emergency access will be logged and reviewed by compliance. 
                      Misuse of emergency access may result in disciplinary action.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <FormButton 
                onClick={handleInitiateAccess}
                disabled={isLoading || !patientIdentifier || !reason}
                variant="danger"
              >
                {isLoading ? <Spinner size="sm" /> : 'Initiate Emergency Access'}
              </FormButton>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Review Emergency Access</h2>
            <p className="text-sm text-gray-600">
              Review emergency access events to determine if they were justified based on the provided reason and context.
            </p>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reviews</h3>
                <p className="mt-1 text-sm text-gray-500">There are no emergency access events pending review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden bg-white shadow sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {records.map((record) => (
                      <li key={record.id} className={`cursor-pointer ${selectedAccessId === record.id ? 'bg-blue-50' : ''}`} onClick={() => setSelectedAccessId(record.id)}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <p className="text-sm font-medium text-blue-600 truncate">
                                {record.requester_name || 'Unknown user'}
                              </p>
                              <p className="sm:ml-2 flex-shrink-0 text-xs text-gray-500">
                                {new Date(record.requested_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="ml-2 flex-shrink-0">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {record.reason.replace(/_/g, ' ').toLowerCase()}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                Patient: {record.patient_identifier}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                Duration: {record.duration}
                              </p>
                            </div>
                          </div>
                          {record.detailed_reason && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                <span className="font-medium">Justification:</span> {record.detailed_reason}
                              </p>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {selectedAccessId && (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Submit Review</h3>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="review-notes" className="block text-sm font-medium text-gray-700">
                          Review Notes
                        </label>
                        <textarea
                          id="review-notes"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          rows={3}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Notes about this emergency access review"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="justified"
                          type="checkbox"
                          checked={isJustified}
                          onChange={(e) => setIsJustified(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="justified" className="ml-2 block text-sm text-gray-900">
                          Emergency access was justified
                        </label>
                      </div>
                      
                      <div className="flex justify-between pt-3">
                        <FormButton
                          onClick={() => handleEndAccess(selectedAccessId)}
                          variant="secondary"
                          disabled={isLoading}
                        >
                          End Access
                        </FormButton>
                        <FormButton
                          onClick={handleReviewAccess}
                          variant={isJustified ? "success" : "danger"}
                          disabled={isLoading || !reviewNotes}
                        >
                          {isJustified ? 'Approve Access' : 'Mark as Unjustified'}
                        </FormButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Emergency Access Summary</h2>
            <p className="text-sm text-gray-600">
              Summary of all emergency access events and their outcomes.
            </p>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : !summary ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No summary available</h3>
                <p className="mt-1 text-sm text-gray-500">Unable to load emergency access summary data.</p>
                <button
                  className="mt-4 text-sm text-blue-600 hover:text-blue-500"
                  onClick={loadData}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white shadow rounded-lg p-4 text-center">
                    <div className="text-2xl font-semibold text-blue-600">{summary.total_requests}</div>
                    <div className="text-sm text-gray-500">Total Requests</div>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 text-center">
                    <div className="text-2xl font-semibold text-red-600">{summary.pending_review}</div>
                    <div className="text-sm text-gray-500">Pending Review</div>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 text-center">
                    <div className="text-2xl font-semibold text-green-600">{summary.justified_access}</div>
                    <div className="text-sm text-gray-500">Justified</div>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 text-center">
                    <div className="text-2xl font-semibold text-orange-600">{summary.active_sessions}</div>
                    <div className="text-sm text-gray-500">Active Sessions</div>
                  </div>
                </div>
                
                <div className="bg-white shadow rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Access by Reason</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(summary.by_reason).map(([reason, count]) => (
                      <div key={reason} className="border border-gray-200 rounded-md p-3">
                        <div className="text-sm font-medium text-gray-500">
                          {reason.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-xl font-semibold text-gray-900">{count as number}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {summary.recent_requests > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Notice</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            {summary.recent_requests} emergency access events have occurred in the last 24 hours. 
                            {summary.pending_review > 0 && ` ${summary.pending_review} still require review.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}
        
        {renderContent()}
      </div>
    </div>
  );
}