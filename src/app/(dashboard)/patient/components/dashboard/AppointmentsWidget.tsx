// src/app/(dashboard)/patient/components/dashboard/AppointmentsWidget.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Video, MapPin, Phone } from 'lucide-react';
import { useUpcomingAppointments } from '@/hooks/patient/usePatientAppointments';

interface AppointmentsWidgetProps {
  onScheduleAppointment?: () => void;
}

export function AppointmentsWidget({ 
  onScheduleAppointment 
}: AppointmentsWidgetProps) {
  const router = useRouter();
  
  // Use the same hook that works for the appointments page
  const { appointments, loading, error } = useUpcomingAppointments(5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getUrgency = (scheduledTime: string) => {
    const appointmentDate = new Date(scheduledTime);
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff <= 1) return 'today';
    if (hoursDiff <= 24) return 'tomorrow';
    if (hoursDiff <= 168) return 'week';
    return 'later';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
        </div>
        <div className="text-center py-4 text-red-500">
          <p className="text-sm">Failed to load appointments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
        <button
          onClick={() => router.push('/patient/appointments')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">
          Upcoming ({appointments.length})
        </h4>
        
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((appointment) => {
              const urgency = getUrgency(appointment.scheduled_time);
              
              return (
                <div
                  key={appointment.id}
                  className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                    urgency === 'today' 
                      ? 'bg-red-50 border-red-400'
                      : urgency === 'tomorrow'
                      ? 'bg-amber-50 border-amber-400'
                      : 'bg-blue-50 border-blue-400'
                  }`}
                  onClick={() => router.push(`/patient/appointments/${appointment.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.provider}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatDate(appointment.scheduled_time)} at {formatTime(appointment.scheduled_time)}
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-gray-600 mb-1">
                    {appointment.appointment_type === 'video_consultation' || appointment.appointment_type === 'phone_consultation' ? (
                      <div className="flex items-center">
                        <Video className="w-4 h-4 mr-1" />
                        <span>Telemedicine</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{appointment.location || 'In-person'}</span>
                      </div>
                    )}
                    <span className="mx-2">•</span>
                    <span className="capitalize">{appointment.appointment_type.replace('_', ' ')}</span>
                  </div>

                  {appointment.preparation_notes && (
                    <div className="text-xs text-gray-600 bg-white p-2 rounded border-l-2 border-blue-300 mt-2">
                      <strong>Preparation:</strong> {appointment.preparation_notes}
                    </div>
                  )}

                  {urgency === 'today' && appointment.priority && appointment.meeting_url && (
                    <div className="mt-2 flex space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(appointment.meeting_url, '_blank');
                        }}
                        className="flex items-center text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Join Call
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No upcoming appointments</p>
            <button
              onClick={onScheduleAppointment || (() => router.push('/patient/appointments/schedule'))}
              className="text-blue-600 hover:text-blue-700 text-sm mt-1"
            >
              Schedule your first appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}