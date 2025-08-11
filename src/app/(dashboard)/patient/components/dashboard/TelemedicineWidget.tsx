// src/app/(dashboard)/patient/components/dashboard/TelemedicineWidget.tsx
import React, { useState } from 'react';
import { Video, Clock, Monitor, Mic, Settings } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { useUpcomingAppointments } from '@/hooks/patient/usePatientAppointments';

interface TelemedicineSession {
  id: number;
  provider_name: string;
  provider_specialty: string;
  scheduled_time: string;
  duration_minutes: number;
  session_status: 'scheduled' | 'starting' | 'active' | 'completed' | 'cancelled';
  meeting_url?: string;
  meeting_id?: string;
  platform: 'zoom' | 'webex' | 'teams' | 'google-meet' | 'custom';
  preparation_notes?: string;
  can_join: boolean;
  minutes_until_start?: number;
}

interface TelemedicineProps {
  onRequestSession?: () => void;
  onJoinSession?: (sessionId: number) => void;
}

export function TelemedicineWidget({ onRequestSession, onJoinSession }: TelemedicineProps) {
  // Use the working appointments hook instead of local state
  const { appointments, loading, error } = useUpcomingAppointments(10);
  const [requesting, setRequesting] = useState(false);

  // Filter for telemedicine appointments using the correct property
  const telemedicineAppointments = appointments.filter(apt => 
    apt.appointment_type === 'video_consultation' || apt.appointment_type === 'phone_consultation'
  );

  // Convert appointments to TelemedicineSession format with proper type handling
  const sessions: TelemedicineSession[] = telemedicineAppointments.map(apt => ({
    id: apt.id,
    provider_name: String(apt.provider_name || apt.provider_details?.first_name + ' ' + apt.provider_details?.last_name || 'Unknown Provider'),
    provider_specialty: apt.provider_details?.specialty || 'General Medicine',
    scheduled_time: apt.scheduled_time,
    duration_minutes: apt.duration_minutes || 30,
    session_status: apt.status as 'scheduled' | 'starting' | 'active' | 'completed' | 'cancelled',
    meeting_url: apt.meeting_url,
    meeting_id: apt.meeting_url ? 'meeting-' + apt.id : undefined,
    platform: 'zoom', // Default platform, you can make this dynamic
    preparation_notes: apt.preparation_notes,
    can_join: !!apt.meeting_url && apt.status === 'scheduled',
    minutes_until_start: apt.meeting_url ? Math.max(0, Math.floor((new Date(apt.scheduled_time).getTime() - new Date().getTime()) / (1000 * 60))) : undefined
  }));

  const handleRequestSession = async () => {
    try {
      setRequesting(true);
      await apiClient.post(ENDPOINTS.PATIENT.TELEMEDICINE_REQUEST, {
        provider_id: null, // Let patient choose or use preferred provider
        session_type: 'consultation',
        preferred_date: new Date().toISOString(),
        reason: 'Regular checkup',
        is_urgent: false,
        platform_preference: 'zoom'
      });
      
      onRequestSession?.();
      // The hook will automatically refresh data
    } catch (err) {
      console.error('Error requesting session:', err);
    } finally {
      setRequesting(false);
    }
  };

  const handleJoinSession = (session: TelemedicineSession) => {
    if (session.meeting_url) {
      window.open(session.meeting_url, '_blank', 'width=1200,height=800');
    }
    onJoinSession?.(session.id);
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

  const getMinutesUntilStart = (scheduledTime: string): number => {
    return Math.max(0, Math.floor((new Date(scheduledTime).getTime() - new Date().getTime()) / (1000 * 60)));
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

      {sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => {
            const minutesUntil = getMinutesUntilStart(session.scheduled_time);
            const canJoinNow = session.can_join && minutesUntil <= 15; // Allow joining 15 minutes before
            
            return (
              <div
                key={session.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{session.provider_name}</div>
                    <div className="text-sm text-gray-600">{session.provider_specialty}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(session.scheduled_time)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(session.scheduled_time)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{session.duration_minutes} min</span>
                    <span className="mx-2">•</span>
                    <Monitor className="w-4 h-4 mr-1" />
                    <span className="capitalize">{session.platform}</span>
                    {minutesUntil > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{minutesUntil} min until start</span>
                      </>
                    )}
                  </div>

                  {canJoinNow && session.meeting_url && (
                    <button
                      onClick={() => handleJoinSession(session)}
                      className="flex items-center bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Join Now
                    </button>
                  )}
                </div>

                {session.preparation_notes && (
                  <div className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                    <strong>Preparation:</strong> {session.preparation_notes}
                  </div>
                )}

                {!canJoinNow && session.meeting_url && minutesUntil > 15 && (
                  <div className="mt-2 text-xs text-gray-500">
                    You can join {Math.max(15, minutesUntil)} minutes before your appointment
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