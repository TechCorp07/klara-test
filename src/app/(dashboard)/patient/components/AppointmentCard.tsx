// src/app/(dashboard)/patient/components/AppointmentCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Appointment {
  id: number;
  provider: {
    id: number;
    name: string;
    specialty: string;
  };
  scheduled_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  appointment_type: 'in_person' | 'video_consultation' | 'phone_consultation';
  reason: string;
  notes?: string;
  reminder_sent: boolean;
  can_join?: boolean;
  join_url?: string;
}

export const AppointmentCard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // Get upcoming appointments for the next 30 days
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const response = await fetch(
          `/api/telemedicine/appointments/?start_date=${today.toISOString().split('T')[0]}&end_date=${thirtyDaysFromNow.toISOString().split('T')[0]}&status=scheduled,confirmed`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const data = await response.json();
        setAppointments(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Appointments fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get appointment type icon
  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'video_consultation':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'phone_consultation':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    let dateLabel = '';
    if (isToday) dateLabel = 'Today';
    else if (isTomorrow) dateLabel = 'Tomorrow';
    else dateLabel = date.toLocaleDateString();

    const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return { dateLabel, timeLabel, isToday, isTomorrow };
  };

  // Check if appointment can be joined (within 15 minutes)
  const canJoinAppointment = (appointment: Appointment) => {
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduled_time);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    return minutesDiff <= 15 && minutesDiff >= -30 && appointment.appointment_type === 'video_consultation';
  };

  // Handle join appointment
  const handleJoinAppointment = (appointment: Appointment) => {
    if (appointment.join_url) {
      window.open(appointment.join_url, '_blank');
    } else {
      // Redirect to telemedicine page
      window.location.href = `/dashboard/patient/telemedicine?appointment=${appointment.id}`;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
          <Link
            href="/dashboard/patient/appointments"
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
            <div className="text-red-600 mb-2">Failed to load appointments</div>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 mb-4">No upcoming appointments</p>
            <Link
              href="/dashboard/patient/appointments"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Schedule Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.slice(0, 3).map((appointment) => {
              const { dateLabel, timeLabel, isToday, isTomorrow } = formatDateTime(appointment.scheduled_time);
              const canJoin = canJoinAppointment(appointment);

              return (
                <div
                  key={appointment.id}
                  className={`border rounded-lg p-4 ${
                    isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="text-gray-500">
                          {getAppointmentTypeIcon(appointment.appointment_type)}
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {appointment.provider.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {appointment.provider.specialty}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        {appointment.reason}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={isToday || isTomorrow ? 'font-medium' : ''}>
                          {dateLabel} at {timeLabel}
                        </span>
                        <span className="ml-2 text-gray-500">
                          ({appointment.duration_minutes} min)
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {canJoin ? (
                        <button
                          onClick={() => handleJoinAppointment(appointment)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                        >
                          Join Now
                        </button>
                      ) : appointment.appointment_type === 'video_consultation' && isToday ? (
                        <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded">
                          Available 15 min before
                        </span>
                      ) : null}
                      
                      <Link
                        href={`/dashboard/patient/appointments/${appointment.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {appointments.length > 3 && (
              <div className="text-center pt-4 border-t border-gray-200">
                <Link
                  href="/dashboard/patient/appointments"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View {appointments.length - 3} more appointments
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
