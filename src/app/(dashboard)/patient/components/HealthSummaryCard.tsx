// src/app/(dashboard)/patient/components/HealthSummaryCard.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HealthSummaryData {
  recent_vitals: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    weight?: number;
    last_updated: string;
  };
  active_conditions: Array<{
    id: number;
    name: string;
    severity: 'low' | 'moderate' | 'severe';
    diagnosed_date: string;
  }>;
  upcoming_appointments_count: number;
  medication_adherence_rate: number;
}

interface HealthSummaryCardProps {
  data?: HealthSummaryData;
}

export const HealthSummaryCard: React.FC<HealthSummaryCardProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get severity color for conditions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get adherence color
  const getAdherenceColor = (rate: number) => {
    if (rate >= 0.9) return 'text-green-600';
    if (rate >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Format vital signs
  const formatVital = (value: number | string | undefined, unit: string) => {
    if (value === undefined || value === null) return 'Not recorded';
    return `${value} ${unit}`;
  };

  // Loading state
  if (!data) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const { recent_vitals, active_conditions, upcoming_appointments_count, medication_adherence_rate } = data;

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Health Summary</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {upcoming_appointments_count}
            </div>
            <div className="text-sm text-blue-700">Upcoming Appointments</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className={`text-2xl font-bold ${getAdherenceColor(medication_adherence_rate)}`}>
              {Math.round(medication_adherence_rate * 100)}%
            </div>
            <div className="text-sm text-green-700">Medication Adherence</div>
          </div>
        </div>

        {/* Recent Vitals */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Recent Vitals</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Blood Pressure</span>
              <span className="text-sm text-gray-900">
                {recent_vitals.blood_pressure || 'Not recorded'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Heart Rate</span>
              <span className="text-sm text-gray-900">
                {formatVital(recent_vitals.heart_rate, 'bpm')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Temperature</span>
              <span className="text-sm text-gray-900">
                {formatVital(recent_vitals.temperature, '°F')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Weight</span>
              <span className="text-sm text-gray-900">
                {formatVital(recent_vitals.weight, 'lbs')}
              </span>
            </div>
          </div>
          {recent_vitals.last_updated && (
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {new Date(recent_vitals.last_updated).toLocaleString()}
            </p>
          )}
        </div>

        {/* Active Conditions */}
        {active_conditions && active_conditions.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Active Conditions</h4>
            <div className="space-y-2">
              {active_conditions.slice(0, isExpanded ? undefined : 3).map((condition) => (
                <div
                  key={condition.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{condition.name}</p>
                    <p className="text-xs text-gray-500">
                      Diagnosed: {new Date(condition.diagnosed_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(
                      condition.severity
                    )}`}
                  >
                    {condition.severity}
                  </span>
                </div>
              ))}
              {!isExpanded && active_conditions.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{active_conditions.length - 3} more conditions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/patient/health-records"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">View Full Records</p>
                  <p className="text-xs text-gray-500">Complete medical history</p>
                </div>
              </Link>

              <Link
                href="/dashboard/patient/appointments"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Manage Appointments</p>
                  <p className="text-xs text-gray-500">Schedule and view appointments</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer with last update */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <p className="text-xs text-gray-500">
          Health summary updates automatically based on your latest vitals and appointment data.
        </p>
      </div>
    </div>
  );
};
