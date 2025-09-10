// src/app/(dashboard)/patient/components/dashboard/TelemedicineWidget.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Video, Phone, Clock, Send, AlertCircle } from 'lucide-react';
import { usePatientAppointments } from '@/hooks/patient/usePatientAppointments';
import type { Appointment } from '@/types/patient.types';

interface TelemedicineProps {
  onRequestSession?: () => void;
  onJoinSession?: (sessionId: number) => void;
}

export function TelemedicineWidget({ onRequestSession, onJoinSession }: TelemedicineProps) {
  const router = useRouter();
  
  // Use the EXACT same hook call as the working appointments page
  const { 
    appointments, 
    loading, 
    error 
  } = usePatientAppointments({
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Use the EXACT same filtering logic as the working page, then filter for telemedicine
  const now = new Date();
  
  const upcomingAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.scheduled_time);
    return (appointmentDate >= now || appointment.status === 'in_progress') && 
           ['scheduled', 'confirmed', 'in_progress', 'checked_in'].includes(appointment.status);
  });

  // Filter for telemedicine appointments using the same helper as the working page
  const telemedicineAppointments = upcomingAppointments.filter(appointment => 
    ['video_consultation', 'phone_consultation'].includes(appointment.appointment_type)
  ).slice(0, 3); // Limit to 3 for the widget

  // Use the same helper functions as the working page
  const getProviderName = (appointment: Appointment): string => {
    if (appointment.provider_details) {
      return `${appointment.provider_details.first_name} ${appointment.provider_details.last_name}`;
    }
    return 'Provider TBD';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMinutesUntilStart = (scheduledTime: string): number => {
    return Math.max(0, Math.floor((new Date(scheduledTime).getTime() - new Date().getTime()) / (1000 * 60)));
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'confirmed':
        return 'Confirmed';
      case 'checked_in':
        return 'Checked In';
      case 'in_progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'checked_in':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestSession = () => {
    // Navigate to the existing telemedicine request page
    router.push('/patient/telemedicine/request');
    onRequestSession?.();
  };

  const handleJoinSession = (appointment: Appointment) => {
    if (appointment.meeting_url) {
      window.open(appointment.meeting_url, '_blank', 'width=1200,height=800');
    }
    onJoinSession?.(appointment.id);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Video className="w-5 h-5 mr-2 text-blue-600" />
            Telemedicine
          </h3>
          <button
            onClick={handleRequestSession}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Request Session
          </button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {telemedicineAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">No upcoming telemedicine appointments</p>
            <button
              onClick={handleRequestSession}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              Request your first session
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {telemedicineAppointments.map((appointment) => {
              const minutesUntilStart = getMinutesUntilStart(appointment.scheduled_time);
              const canJoin = minutesUntilStart <= 15 && appointment.meeting_url && 
                            ['confirmed', 'checked_in', 'in_progress'].includes(appointment.status);

              return (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {appointment.appointment_type === 'video_consultation' ? (
                          <Video className="w-4 h-4 text-blue-500 mr-2" />
                        ) : (
                          <Phone className="w-4 h-4 text-green-500 mr-2" />
                        )}
                        <span className="font-medium text-gray-900">
                          {getProviderName(appointment)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(appointment.scheduled_time)} at {formatTime(appointment.scheduled_time)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{appointment.duration_minutes} minutes</span>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                          {getStatusDisplay(appointment.status)}
                        </span>
                      </div>
                    </div>

                    <div className="ml-4">
                      {canJoin ? (
                        <button
                          onClick={() => handleJoinSession(appointment)}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center"
                        >
                          <Video className="w-4 h-4 mr-1" />
                          Join Now
                        </button>
                      ) : appointment.status === 'scheduled' ? (
                        <span className="text-xs text-amber-600 font-medium">
                          Awaiting Confirmation
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {minutesUntilStart > 15 
                            ? `Starts in ${Math.round(minutesUntilStart / 60)}h ${minutesUntilStart % 60}m` 
                            : 'Starting soon'
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* View All Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <button
                onClick={() => router.push('/patient/appointments')}
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                View All Appointments
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}