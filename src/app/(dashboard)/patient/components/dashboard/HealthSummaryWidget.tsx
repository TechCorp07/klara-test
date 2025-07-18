// src/app/(dashboard)/patient/components/dashboard/HealthSummaryWidget.tsx
import React from 'react';

interface HealthSummaryProps {
  healthSummary: {
    overall_status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    last_checkup: string;
    next_appointment: string | null;
    identity_verified: boolean;
    days_until_verification_required: number | null;
  };
}

export function HealthSummaryWidget({ healthSummary }: HealthSummaryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Summary</h3>
      
      {/* Overall Status */}
      <div className={`rounded-lg p-4 mb-4 border ${getStatusColor(healthSummary.overall_status)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Overall Health Status</p>
            <p className="text-sm mt-1 capitalize">{healthSummary.overall_status}</p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            healthSummary.overall_status === 'excellent' || healthSummary.overall_status === 'good' ? 'bg-green-100' :
            healthSummary.overall_status === 'fair' ? 'bg-yellow-100' :
            healthSummary.overall_status === 'poor' ? 'bg-orange-100' : 'bg-red-100'
          }`}>
            {healthSummary.overall_status === 'excellent' || healthSummary.overall_status === 'good' ? (
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : healthSummary.overall_status === 'fair' ? (
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Key Dates */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Last Checkup</span>
          <span className="text-sm font-medium">
            {new Date(healthSummary.last_checkup).toLocaleDateString()}
          </span>
        </div>
        
        {healthSummary.next_appointment && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Next Appointment</span>
            <span className="text-sm font-medium text-blue-600">
              {new Date(healthSummary.next_appointment).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Identity Status</span>
          <span className={`text-sm font-medium ${healthSummary.identity_verified ? 'text-green-600' : 'text-orange-600'}`}>
            {healthSummary.identity_verified ? 'Verified' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
}