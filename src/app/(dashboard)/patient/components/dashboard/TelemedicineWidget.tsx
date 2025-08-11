// src/app/(dashboard)/patient/components/dashboard/TelemedicineWidget.tsx
'use client';

import React, { useState } from 'react';
import { Video, Clock, Monitor, Phone } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { usePatientAppointments } from '@/hooks/patient/usePatientAppointments';
import type { Appointment } from '@/types/patient.types';

interface TelemedicineProps {
  onRequestSession?: () => void;
  onJoinSession?: (sessionId: number) => void;
}

export function TelemedicineWidget({ onRequestSession, onJoinSession }: TelemedicineProps) {
  const [requesting, setRequesting] = useState(false);
  
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

  const handleRequestSession = async () => {
    try {
      setRequesting(true);
      await apiClient.post(ENDPOINTS.PATIENT.TELEMEDICINE_REQUEST, {
        provider_id: null,
        session_type: 'consultation',
        preferred_date: new Date().toISOString(),
        reason: 'Regular checkup',
        is_urgent: false,
        platform_preference: 'zoom'
      });
      
      onRequestSession?.();
    } catch (err) {
      console.error('Error requesting session:', err);
    } finally {
      setRequesting(false);
    }
  };

  const handleJoinSession = (appointment: Appointment) => {
    if (appointment.meeting_url) {
      window.open(appointment.meeting_url, '_blank', 'width=1200,height=800');
    }
    onJoinSession?.(appointment.id);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Telemedicine</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Telemedicine</h3>
        <div className="text-center py-4 text-red-500">
          <p className="text-sm">Failed to load sessions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Video className="w-5 h-5 mr-2 text-blue-600" />
          Telemedicine
        </h3>
        <button
          onClick={handleRequestSession}
          disabled={requesting}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {requesting ? 'Requesting...' : 'Request Session'}
        </button>
      </div>

      {telemedicineAppointments.length > 0 ? (
        <div className="space-y-3">
          {telemedicineAppointments.map((appointment) => {
            const minutesUntil = getMinutesUntilStart(appointment.scheduled_time);
            const canJoinNow = appointment.meeting_url && minutesUntil <= 15; // Allow joining 15 minutes before
            
            return (
              <div
                key={appointment.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{getProviderName(appointment)}</div>
                    <div className="text-sm text-gray-600">
                      {appointment.appointment_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(appointment.scheduled_time)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(appointment.scheduled_time)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{appointment.duration_minutes || 30} min</span>
                    <span className="mx-2">•</span>
                    <Monitor className="w-4 h-4 mr-1" />
                    <span>Video Call</span>
                    {minutesUntil > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{minutesUntil} min until start</span>
                      </>
                    )}
                  </div>

                  {canJoinNow && (
                    <button
                      onClick={() => handleJoinSession(appointment)}
                      className="flex items-center bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Join Now
                    </button>
                  )}
                </div>

                {appointment.preparation_notes && (
                  <div className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                    <strong>Preparation:</strong> {appointment.preparation_notes}
                  </div>
                )}

                {!canJoinNow && appointment.meeting_url && minutesUntil > 15 && (
                  <div className="mt-2 text-xs text-gray-500">
                    You can join 15 minutes before your appointment
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm mb-2">No telemedicine sessions scheduled</p>
          <button
            onClick={handleRequestSession}
            disabled={requesting}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
          >
            {requesting ? 'Requesting...' : 'Request your first session'}
          </button>
        </div>
      )}
    </div>
  );
}