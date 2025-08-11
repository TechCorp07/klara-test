// src/app/(dashboard)/patient/appointments/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Plus, 
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Phone,
  MessageSquare
} from 'lucide-react';
import { usePatientAppointments } from '@/hooks/patient/usePatientAppointments';
import type { Appointment } from '@/types/patient.types';

interface FilterState {
  status: string;
  type: string;
  timeframe: string;
  searchTerm: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    type: 'all',
    timeframe: 'all',
    searchTerm: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { 
    appointments, 
    loading, 
    error, 
    cancelAppointment,
    rescheduleAppointment 
  } = usePatientAppointments({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800 animate-pulse';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getProviderName = (appointment: Appointment): string => {
    if (appointment.provider_details) {
      return `${appointment.provider_details.first_name} ${appointment.provider_details.last_name}`;
    }
    return 'Provider TBD';
  };

  const isTelemedicineAppointment = (appointment: Appointment): boolean => {
    return ['video_consultation', 'phone_consultation'].includes(appointment.appointment_type);
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(appointmentId, 'Patient cancellation');
        alert('Appointment cancelled successfully');
      } catch (error) {
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };

  const filterAppointments = (appointmentsList: Appointment[]) => {
    return appointmentsList.filter(appointment => {
      // Status filter
      if (filters.status !== 'all' && appointment.status !== filters.status) {
        return false;
      }

      // Type filter
      if (filters.type !== 'all' && appointment.appointment_type !== filters.type) {
        return false;
      }

      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const providerName = getProviderName(appointment).toLowerCase();
        const searchableText = `
          ${providerName} 
          ${appointment.appointment_type} 
          ${appointment.reason || ''}
        `.toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  };

  // Separate appointments into upcoming and past based on scheduled_time and status
  const now = new Date();
  const allFilteredAppointments = filterAppointments(appointments);
  
  const upcomingAppointments = allFilteredAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.scheduled_time);
    return (appointmentDate >= now || appointment.status === 'in_progress') && 
           ['scheduled', 'confirmed', 'in_progress', 'checked_in'].includes(appointment.status);
  });

  const pastAppointments = allFilteredAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.scheduled_time);
    return appointmentDate < now && 
           ['completed', 'cancelled', 'no_show'].includes(appointment.status);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading your appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600">Manage your healthcare appointments</p>
          </div>
          <button
            onClick={() => router.push('/patient/appointments/schedule')}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Appointment
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'upcoming'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'past'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past Appointments ({pastAppointments.length})
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Type Filter */}
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="consultation">Consultation</option>
                <option value="follow_up">Follow-up</option>
                <option value="video_consultation">Video Consultation</option>
                <option value="phone_consultation">Phone Consultation</option>
                <option value="procedure">Procedure</option>
                <option value="lab_work">Lab Work</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-4">
          {activeTab === 'upcoming' && (
            <>
              {upcomingAppointments.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No upcoming appointments
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Schedule your next appointment to stay on top of your health.
                  </p>
                  <button
                    onClick={() => router.push('/patient/appointments/schedule')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Schedule Appointment
                  </button>
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {getStatusIcon(appointment.status)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                            {appointment.status_display || appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {getProviderName(appointment)}
                        </h3>
                        
                        <div className="flex items-center text-gray-600 mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(appointment.scheduled_time)}</span>
                          <Clock className="w-4 h-4 ml-4 mr-1" />
                          <span>{formatTime(appointment.scheduled_time)}</span>
                        </div>

                        <div className="flex items-center text-gray-600 mb-2">
                          {isTelemedicineAppointment(appointment) ? (
                            <>
                              <Video className="w-4 h-4 mr-1" />
                              <span>Telemedicine</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>In-person</span>
                            </>
                          )}
                          <span className="mx-2">•</span>
                          <span className="capitalize">{appointment.appointment_type_display || appointment.appointment_type.replace('_', ' ')}</span>
                        </div>

                        {appointment.reason && (
                          <p className="text-gray-600 text-sm">
                            <strong>Reason:</strong> {appointment.reason}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => router.push(`/patient/appointments/${appointment.id}`)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          View Details
                        </button>
                        
                        {appointment.status === 'in_progress' && isTelemedicineAppointment(appointment) && (
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center">
                            <Video className="w-3 h-3 mr-1" />
                            Join Call
                          </button>
                        )}
                        
                        {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'past' && (
            <>
              {pastAppointments.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No past appointments
                  </h3>
                  <p className="text-gray-600">
                    Your appointment history will appear here.
                  </p>
                </div>
              ) : (
                pastAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {getStatusIcon(appointment.status)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                            {appointment.status_display || appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {getProviderName(appointment)}
                        </h3>
                        
                        <div className="flex items-center text-gray-600 mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(appointment.scheduled_time)}</span>
                          <Clock className="w-4 h-4 ml-4 mr-1" />
                          <span>{formatTime(appointment.scheduled_time)}</span>
                        </div>

                        <div className="flex items-center text-gray-600 mb-2">
                          {isTelemedicineAppointment(appointment) ? (
                            <>
                              <Video className="w-4 h-4 mr-1" />
                              <span>Telemedicine</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>In-person</span>
                            </>
                          )}
                          <span className="mx-2">•</span>
                          <span className="capitalize">{appointment.appointment_type_display || appointment.appointment_type.replace('_', ' ')}</span>
                        </div>

                        {appointment.reason && (
                          <p className="text-gray-600 text-sm mb-2">
                            <strong>Reason:</strong> {appointment.reason}
                          </p>
                        )}

                        {appointment.notes && (
                          <p className="text-gray-600 text-sm">
                            <strong>Notes:</strong> {appointment.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => router.push(`/patient/appointments/${appointment.id}`)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}