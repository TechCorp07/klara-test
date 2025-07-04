// src/app/(dashboard)/patient/components/MedicationTracker.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  prescribed_by: {
    name: string;
    specialty: string;
  };
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'discontinued';
  next_dose_time?: string;
  adherence_rate: number;
  missed_doses_count: number;
  total_doses_count: number;
}

interface DoseTaking {
  medication_id: number;
  scheduled_time: string;
  taken: boolean;
  taken_time?: string;
  skipped_reason?: string;
}

export const MedicationTracker: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayDoses, setTodayDoses] = useState<DoseTaking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedicationData = async () => {
      try {
        setLoading(true);
        
        // Fetch active medications
        const medicationsResponse = await fetch('/medication/medications/?status=active', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!medicationsResponse.ok) {
          throw new Error('Failed to fetch medications');
        }

        const medicationsData = await medicationsResponse.json();
        setMedications(medicationsData.results || []);

        // Fetch today's doses
        const today = new Date().toISOString().split('T')[0];
        const dosesResponse = await fetch(`/medication/dose-schedules/?date=${today}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (dosesResponse.ok) {
          const dosesData = await dosesResponse.json();
          setTodayDoses(dosesData.results || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Medication fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicationData();
  }, []);

  // Mark dose as taken
  const markDoseAsTaken = async (medicationId: number, scheduledTime: string) => {
    try {
      const response = await fetch('/medication/dose-logs/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medication: medicationId,
          scheduled_time: scheduledTime,
          taken_time: new Date().toISOString(),
          taken: true,
        }),
      });

      if (response.ok) {
        // Update local state
        setTodayDoses(prev => 
          prev.map(dose => 
            dose.medication_id === medicationId && dose.scheduled_time === scheduledTime
              ? { ...dose, taken: true, taken_time: new Date().toISOString() }
              : dose
          )
        );
      }
    } catch (err) {
      console.error('Error marking dose as taken:', err);
    }
  };

  // Get adherence color
  const getAdherenceColor = (rate: number) => {
    if (rate >= 0.9) return 'text-green-600 bg-green-100';
    if (rate >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Format time
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if dose is overdue
  const isDoseOverdue = (scheduledTime: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    return now > scheduled;
  };

  // Get today's medication doses
  const getTodayMedicationDoses = (medicationId: number) => {
    return todayDoses.filter(dose => dose.medication_id === medicationId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Medication Tracker</h3>
          <Link
            href="/dashboard/patient/medications"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Failed to load medications</div>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-8">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <p className="text-gray-500 mb-4">No active medications</p>
            <p className="text-sm text-gray-400">
              Your prescribed medications will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Today's Doses Summary */}
            {todayDoses.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Today&apos;s Doses</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    {todayDoses.filter(d => d.taken).length} of {todayDoses.length} doses taken
                  </span>
                  <div className="flex-1 mx-4 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${todayDoses.length > 0 ? (todayDoses.filter(d => d.taken).length / todayDoses.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-blue-900">
                    {todayDoses.length > 0 ? Math.round((todayDoses.filter(d => d.taken).length / todayDoses.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            )}

            {/* Medication List */}
            {medications.slice(0, 3).map((medication) => {
              const medicationDoses = getTodayMedicationDoses(medication.id);
              
              return (
                <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{medication.name}</h4>
                      <p className="text-sm text-gray-600">{medication.dosage} - {medication.frequency}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Prescribed by {medication.prescribed_by.name}
                      </p>
                    </div>
                    
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAdherenceColor(medication.adherence_rate)}`}>
                      {Math.round(medication.adherence_rate * 100)}% adherence
                    </div>
                  </div>

                  {/* Today's doses for this medication */}
                  {medicationDoses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Today&apos;s Schedule:</p>
                      {medicationDoses.map((dose, index) => {
                        const isOverdue = !dose.taken && isDoseOverdue(dose.scheduled_time);
                        
                        return (
                          <div 
                            key={index}
                            className={`flex items-center justify-between p-2 rounded border ${
                              dose.taken 
                                ? 'bg-green-50 border-green-200' 
                                : isOverdue 
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`h-3 w-3 rounded-full ${
                                dose.taken ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-gray-400'
                              }`} />
                              <span className="text-sm">
                                {formatTime(dose.scheduled_time)}
                                {dose.taken && dose.taken_time && (
                                  <span className="text-xs text-green-600 ml-2">
                                    (taken at {formatTime(dose.taken_time)})
                                  </span>
                                )}
                              </span>
                            </div>
                            
                            {!dose.taken && (
                              <button
                                onClick={() => markDoseAsTaken(medication.id, dose.scheduled_time)}
                                className={`px-3 py-1 text-xs font-medium rounded ${
                                  isOverdue
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                Mark Taken
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Next dose info */}
                  {medication.next_dose_time && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        Next dose: {new Date(medication.next_dose_time).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {medications.length > 3 && (
              <div className="text-center pt-4 border-t border-gray-200">
                <Link
                  href="/dashboard/patient/medications"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View {medications.length - 3} more medications
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Medication tracking helps improve adherence</span>
          <Link 
            href="/dashboard/patient/medications"
            className="text-blue-600 hover:text-blue-700"
          >
            Set reminders →
          </Link>
        </div>
      </div>
    </div>
  );
};
