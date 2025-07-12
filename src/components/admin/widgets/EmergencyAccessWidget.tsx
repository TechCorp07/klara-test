// src/components/admin/widgets/EmergencyAccessWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';

interface EmergencyAccessSummary {
  total_requests: number;
  pending_review: number;
  active_sessions: number;
  recent_requests: number;
}

export function EmergencyAccessWidget() {
  const { getEmergencyAccessSummary } = useAuth();
  const [summary, setSummary] = useState<EmergencyAccessSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getEmergencyAccessSummary();
        setSummary(data);
      } catch (err) {
        setError('Failed to load emergency access data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getEmergencyAccessSummary]);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-center py-6">
          <Spinner size="md" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Emergency Access</h3>
        <div className="text-red-600 text-sm">{error || 'Unable to load data'}</div>
        <button 
          className="mt-2 text-sm text-blue-600 hover:text-blue-500"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const { total_requests, pending_review, active_sessions, recent_requests } = summary;
  const hasUrgentItems = pending_review > 0 || active_sessions > 0;

  return (
    <div className={`${hasUrgentItems ? 'bg-red-50 border border-red-200' : 'bg-white'} shadow rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-medium ${hasUrgentItems ? 'text-red-900' : 'text-gray-900'}`}>
          Emergency Access
        </h3>
        {hasUrgentItems && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Requires Attention
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{total_requests}</p>
          <p className="text-sm text-gray-500">Total Requests</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-semibold ${pending_review > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {pending_review}
          </p>
          <p className="text-sm text-gray-500">Pending Review</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className={`text-2xl font-semibold ${active_sessions > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
            {active_sessions}
          </p>
          <p className="text-sm text-gray-500">Active Sessions</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-semibold ${recent_requests > 0 ? 'text-blue-600' : 'text-gray-900'}`}>
            {recent_requests}
          </p>
          <p className="text-sm text-gray-500">Recent (24h)</p>
        </div>
      </div>
      
      {hasUrgentItems && (
        <div className="mt-4">
          <Link
            href="/dashboard/compliance/emergency-access"
            className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Review Now
          </Link>
        </div>
      )}
    </div>
  );
}