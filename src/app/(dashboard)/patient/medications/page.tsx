// src/app/(dashboard)/patient/medications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePatientMedications } from '@/hooks/patient/usePatientMedications';
import { Spinner } from '@/components/ui/spinner';
import type { Prescription, MedicationAdherence } from '@/types/patient.types';

interface MedicationFilters {
  status: string;
  prescribedBy: string;
  drugClass: string;
  timeFrame: 'today' | 'week' | 'month' | 'all';
}

export default function MedicationsPage() {
  const { medications, todaySchedule, loading, error, refetch, markDoseAsTaken, getMedicationAdherence } = usePatientMedications();
  
  const [activeTab, setActiveTab] = useState<'current' | 'schedule' | 'history'>('current');
  const [selectedMedication, setSelectedMedication] = useState<Prescription | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [filters, setFilters] = useState<MedicationFilters>({
    status: 'active',
    prescribedBy: '',
    drugClass: '',
    timeFrame: 'all',
  });

  // Filter medications based on current filters
  const filteredMedications = medications.filter(medication => {
    if (filters.status && medication.status !== filters.status) return false;
    if (filters.prescribedBy && !medication.prescribed_by.name.toLowerCase().includes(filters.prescribedBy.toLowerCase())) return false;
    return true;
  });

  // Get today's medication schedule with adherence info
  const todayMedicationsWithSchedule = todaySchedule.map(scheduleItem => {
    const adherence = getMedicationAdherence(scheduleItem.prescription.id);
    return {
      ...scheduleItem,
      adherence,
    };
  });

  // Get medication status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'discontinued':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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

  // Check if dose is overdue
  const isDoseOverdue = (scheduledTime: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    return now > scheduled;
  };

  // Format time
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle dose marking
  const handleMarkDoseAsTaken = async (prescriptionId: number, scheduledTime: string) => {
    try {
      await markDoseAsTaken(prescriptionId, scheduledTime);
    } catch (err) {
      console.error('Failed to mark dose as taken:', err);
      // Show error message
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading your medications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Medications</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
            <p className="mt-2 text-gray-600">
              Track your prescriptions, manage doses, and monitor adherence.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => setShowReminderModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5z" />
              </svg>
              Set Reminders
            </button>
            <Link
              href="/dashboard/patient/medications/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Medication
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'current', label: 'Current Medications', count: filteredMedications.filter(m => m.status === 'active').length },
              { key: 'schedule', label: "Today's Schedule", count: todaySchedule.length },
              { key: 'history', label: 'Medication History', count: medications.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Today's Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Today's Progress */}
          {todayMedicationsWithSchedule.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
              <div className="space-y-4">
                {todayMedicationsWithSchedule.map(({ prescription, scheduled_times, adherence_data, adherence }) => {
                  const takenCount = adherence_data.filter(d => d.taken).length;
                  const totalCount = adherence_data.length;
                  const progressPercent = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

                  return (
                    <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{prescription.medication.name}</h4>
                          <p className="text-sm text-gray-600">{prescription.dosage} - {prescription.frequency}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {takenCount}/{totalCount} doses
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round(progressPercent)}% complete
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      {/* Scheduled Doses */}
                      <div className="space-y-2">
                        {adherence_data.map((dose, index) => {
                          const isOverdue = !dose.taken && isDoseOverdue(dose.scheduled_time);
                          
                          return (
                            <div 
                              key={index}
                              className={`flex items-center justify-between p-3 rounded border ${
                                dose.taken 
                                  ? 'bg-green-50 border-green-200' 
                                  : isOverdue 
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`h-3 w-3 rounded-full ${
                                  dose.taken ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-gray-400'
                                }`} />
                                <div>
                                  <span className="text-sm font-medium">
                                    {formatTime(dose.scheduled_time)}
                                  </span>
                                  {dose.taken && dose.taken_time && (
                                    <span className="text-xs text-green-600 ml-2">
                                      (taken at {formatTime(dose.taken_time)})
                                    </span>
                                  )}
                                  {isOverdue && (
                                    <span className="text-xs text-red-600 ml-2">
                                      (overdue)
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {!dose.taken && (
                                <button
                                  onClick={() => handleMarkDoseAsTaken(prescription.id, dose.scheduled_time)}
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
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {todayMedicationsWithSchedule.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 mb-4">No medications scheduled for today</p>
              <p className="text-sm text-gray-400">
                Your daily medication schedule will appear here
              </p>
            </div>
          )}
        </div>
      )}

      {/* Current Medications Tab */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Medications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prescribed By</label>
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={filters.prescribedBy}
                  onChange={(e) => setFilters({ ...filters, prescribedBy: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: 'active', prescribedBy: '', drugClass: '', timeFrame: 'all' })}
                  className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Medications List */}
          {filteredMedications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <p className="text-gray-500 mb-4">No medications found</p>
              <p className="text-sm text-gray-400">
                Your prescribed medications will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMedications.map(medication => {
                const adherence = getMedicationAdherence(medication.id);
                
                return (
                  <div key={medication.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{medication.medication.name}</h3>
                        <p className="text-sm text-gray-600">{medication.medication.generic_name}</p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(medication.status)}`}
                      >
                        {medication.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Dosage:</span>
                          <p className="text-gray-900">{medication.dosage}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Frequency:</span>
                          <p className="text-gray-900">{medication.frequency}</p>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700 text-sm">Instructions:</span>
                        <p className="text-sm text-gray-900 mt-1">{medication.instructions}</p>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700 text-sm">Prescribed by:</span>
                        <p className="text-sm text-gray-900">{medication.prescribed_by.name} - {medication.prescribed_by.specialty}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Start Date:</span>
                          <p className="text-gray-900">{new Date(medication.start_date).toLocaleDateString()}</p>
                        </div>
                        {medication.end_date && (
                          <div>
                            <span className="font-medium text-gray-700">End Date:</span>
                            <p className="text-gray-900">{new Date(medication.end_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Refills Remaining:</span>
                          <p className="text-gray-900">{medication.refills_remaining}</p>
                        </div>
                        {adherence && (
                          <div>
                            <span className="font-medium text-gray-700">Adherence Rate:</span>
                            <p className={`font-medium ${getAdherenceColor(adherence.rate)}`}>
                              {Math.round(adherence.rate * 100)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedMedication(medication)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Details
                      </button>
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/patient/medications/${medication.id}/refill`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Request Refill
                        </Link>
                        <Link
                          href={`/dashboard/patient/medications/${medication.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medication History</h3>
          <p className="text-gray-600">
            Complete medication history and adherence tracking will be implemented here.
          </p>
        </div>
      )}

      {/* Reminder Modal Placeholder */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Set Medication Reminders</h3>
              <p className="text-sm text-gray-600 mb-4">
                Reminder settings interface would go here.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
