// src/app/(dashboard)/patient/appointments/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePatientAppointments } from '@/hooks/patient/usePatientAppointments';
import { Spinner } from '@/components/ui/spinner';
import type { Appointment } from '@/types/patient.types';

interface AppointmentFilters {
  status: string;
  appointmentType: string;
  provider: string;
  dateRange: 'upcoming' | 'past' | 'today' | 'this_week' | 'this_month' | 'custom';
  customStartDate: string;
  customEndDate: string;
}

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const [filters, setFilters] = useState<AppointmentFilters>({
    status: '',
    appointmentType: '',
    provider: '',
    dateRange: 'upcoming',
    customStartDate: '',
    customEndDate: '',
  });

  // Get date range based on filter
  const getDateRange = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    switch (filters.dateRange) {
      case 'upcoming':
        return { startDate: today.toISOString().split('T')[0], endDate: '' };
      case 'past':
        return { startDate: '', endDate: today.toISOString().split('T')[0] };
      case 'today':
        return { 
          startDate: today.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0] 
        };
        case 'this_week': {
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + 7);
          return { 
            startDate: today.toISOString().split('T')[0], 
            endDate: weekEnd.toISOString().split('T')[0] 
          };
        }
        case 'this_month': {
          const monthEnd = new Date(today);
          monthEnd.setMonth(today.getMonth() + 1);
          return { 
            startDate: today.toISOString().split('T')[0], 
            endDate: monthEnd.toISOString().split('T')[0] 
          };
        }
      case 'custom':
        return { 
          startDate: filters.customStartDate, 
          endDate: filters.customEndDate 
        };
      default:
        return { startDate: '', endDate: '' };
    }
  };

  const dateRange = getDateRange();
  const appointmentOptions = {
    status: filters.status || undefined,
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
    autoRefresh: activeTab === 'upcoming',
    refreshInterval: 60000, // 1 minute
  };

  const { appointments, loading, error, refetch, cancelAppointment } = usePatientAppointments(appointmentOptions);

  // Filter appointments based on tab and filters
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.scheduled_datetime);
    const now = new Date();

    // Tab filtering
    if (activeTab === 'upcoming' && appointmentDate < now) return false;
    if (activeTab === 'past' && appointmentDate >= now) return false;

    // Additional filters
    if (filters.appointmentType && appointment.appointment_type !== filters.appointmentType) return false;
    if (filters.provider && !appointment.provider.name.toLowerCase().includes(filters.provider.toLowerCase())) return false;

    return true;
  });

  // Group appointments by date
  const groupedAppointments = filteredAppointments.reduce((groups, appointment) => {
    const date = new Date(appointment.scheduled_datetime).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => {
    return activeTab === 'past' 
      ? new Date(b).getTime() - new Date(a).getTime()
      : new Date(a).getTime() - new Date(b).getTime();
  });

  // Get appointment status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'checked_in':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get appointment type icon
  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return '👨‍⚕️';
      case 'follow_up':
        return '🔄';
      case 'procedure':
        return '🏥';
      case 'lab_work':
        return '🧪';
      case 'imaging':
        return '🔬';
      case 'therapy':
        return '🧘';
      default:
        return '📅';
    }
  };

  // Get visit type icon
  const getVisitTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '📹';
      case 'phone':
        return '📞';
      case 'in_person':
        return '🏢';
      default:
        return '📅';
    }
  };

  // Check if appointment can be joined
  const canJoinAppointment = (appointment: Appointment) => {
    if (appointment.visit_type !== 'video') return false;
    
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduled_datetime);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    return minutesDiff <= 15 && minutesDiff >= -30 && 
           ['confirmed', 'checked_in'].includes(appointment.status);
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await cancelAppointment(selectedAppointment.id, cancellationReason);
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancellationReason('');
      refetch();
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      // Show error message
    }
  };

  // Format relative date
  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading your appointments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Appointments</h3>
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
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="mt-2 text-gray-600">
              Manage your healthcare appointments and consultations.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Schedule Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'upcoming', label: 'Upcoming', count: appointments.filter(a => new Date(a.scheduled_datetime) >= new Date()).length },
              { key: 'past', label: 'Past', count: appointments.filter(a => new Date(a.scheduled_datetime) < new Date()).length },
              { key: 'all', label: 'All', count: appointments.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'upcoming' | 'past' | 'all')}
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Appointments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  dateRange: e.target.value as 'upcoming' | 'past' | 'today' | 'this_week' | 'this_month' | 'custom'
                })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
              <select
                value={filters.appointmentType}
                onChange={(e) => setFilters({ ...filters, appointmentType: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="consultation">Consultation</option>
                <option value="follow_up">Follow-up</option>
                <option value="procedure">Procedure</option>
                <option value="lab_work">Lab Work</option>
                <option value="imaging">Imaging</option>
                <option value="therapy">Therapy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <input
                type="text"
                placeholder="Search providers..."
                value={filters.provider}
                onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ 
                  status: '', appointmentType: '', provider: '', 
                  dateRange: 'upcoming', customStartDate: '', customEndDate: '' 
                })}
                className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Custom date range inputs */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.customStartDate}
                  onChange={(e) => setFilters({ ...filters, customStartDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.customEndDate}
                  onChange={(e) => setFilters({ ...filters, customEndDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 mb-4">
            {activeTab === 'upcoming' ? 'No upcoming appointments' : 
             activeTab === 'past' ? 'No past appointments' : 'No appointments found'}
          </p>
          {activeTab === 'upcoming' && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Schedule Your First Appointment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(dateStr => (
            <div key={dateStr} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {formatRelativeDate(dateStr)}
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {groupedAppointments[dateStr].map(appointment => {
                  const canJoin = canJoinAppointment(appointment);
                  const appointmentTime = new Date(appointment.scheduled_datetime);

                  return (
                    <div key={appointment.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Type and Visit Icons */}
                          <div className="flex flex-col items-center space-y-1">
                            <div className="text-2xl">
                              {getAppointmentTypeIcon(appointment.appointment_type)}
                            </div>
                            <div className="text-lg">
                              {getVisitTypeIcon(appointment.visit_type)}
                            </div>
                          </div>

                          {/* Appointment Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-medium text-gray-900">
                                {appointment.provider.name}
                              </h4>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}
                              >
                                {appointment.status.replace('_', ' ')}
                              </span>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                <span className="font-medium">Specialty:</span> {appointment.provider.specialty}
                              </p>
                              <p>
                                <span className="font-medium">Type:</span> {appointment.appointment_type.replace('_', ' ')} 
                                ({appointment.visit_type.replace('_', ' ')})
                              </p>
                              <p>
                                <span className="font-medium">Time:</span> {appointmentTime.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })} - {new Date(appointmentTime.getTime() + appointment.duration_minutes * 60000).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                              <p>
                                <span className="font-medium">Reason:</span> {appointment.reason_for_visit}
                              </p>
                              {appointment.location && (
                                <p>
                                  <span className="font-medium">Location:</span> {appointment.location.name}
                                  {appointment.location.room && `, Room ${appointment.location.room}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2 ml-4">
                          {canJoin && (
                            <Link
                              href={`/dashboard/patient/telemedicine?appointment=${appointment.id}`}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              Join Now
                            </Link>
                          )}

                          <Link
                            href={`/dashboard/patient/appointments/${appointment.id}`}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View Details
                          </Link>

                          {['scheduled', 'confirmed'].includes(appointment.status) && (
                            <>
                              <Link
                                href={`/dashboard/patient/appointments/${appointment.id}/reschedule`}
                                className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                              >
                                Reschedule
                              </Link>
                              <button
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowCancelModal(true);
                                }}
                                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Appointment</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel your appointment with {selectedAppointment.provider.name} 
                on {new Date(selectedAppointment.scheduled_datetime).toLocaleDateString()}?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please let us know why you're cancelling..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedAppointment(null);
                    setCancellationReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancelAppointment}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal Placeholder */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule New Appointment</h3>
              <p className="text-sm text-gray-600 mb-4">
                Appointment scheduling form would go here.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
