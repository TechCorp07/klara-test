// src/app/(dashboard)/patient/components/dashboard/TelemedicineWidget.tsx
import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, Monitor, Phone, Mic, MicOff, VideoOff, Settings } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

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
  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTelemedicineSessions();
    // Set up real-time updates for session status
    const interval = setInterval(fetchTelemedicineSessions, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTelemedicineSessions = async () => {
    try {
      setLoading(true);
      // This would fetch from your telemedicine endpoints
      // For now, showing the structure based on your backend
      setSessions([]);
    } catch (err) {
      setError('Failed to load telemedicine sessions');
      console.error('Error fetching telemedicine sessions:', err);
    } finally {
      setLoading(false);
    }
  };

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
      await fetchTelemedicineSessions();
    } catch (err) {
      setError('Failed to request telemedicine session');
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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'zoom':
        return '📹';
      case 'teams':
        return '💼';
      case 'webex':
        return '🌐';
      case 'google-meet':
        return '📱';
      default:
        return '💻';
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'starting':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'scheduled':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'completed':
        return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'cancelled':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const formatSessionTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes < 0) return 'Started';
    if (diffMinutes < 5) return 'Starting soon';
    if (diffMinutes < 60) return `In ${diffMinutes} minutes`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `In ${diffHours} hours`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-5 w-32 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Video className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Telemedicine</h3>
        </div>
        <button
          onClick={handleRequestSession}
          disabled={requesting}
          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {requesting ? 'Requesting...' : 'Request Session'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Active/Upcoming Sessions */}
      {sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.filter(s => ['scheduled', 'starting', 'active'].includes(s.session_status)).map((session) => (
            <div
              key={session.id}
              className={`border rounded-lg p-4 ${
                session.session_status === 'active' ? 'border-green-500 bg-green-50' :
                session.session_status === 'starting' ? 'border-blue-500 bg-blue-50' :
                'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">{getPlatformIcon(session.platform)}</span>
                    <h4 className="font-medium text-gray-900">{session.provider_name}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{session.provider_specialty}</p>
                </div>
                
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded border ${getSessionStatusColor(session.session_status)}`}>
                    {session.session_status.toUpperCase()}
                  </span>
                  <div className="text-xs text-gray-600 mt-1">
                    {formatSessionTime(session.scheduled_time)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{session.duration_minutes} minutes</span>
                </div>
                
                {session.meeting_id && (
                  <div className="text-xs">
                    Meeting ID: {session.meeting_id}
                  </div>
                )}
              </div>

              {session.preparation_notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Preparation:</strong> {session.preparation_notes}
                  </p>
                </div>
              )}

              {session.can_join && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleJoinSession(session)}
                    className={`flex-1 flex items-center justify-center py-2 px-3 rounded text-sm transition-colors ${
                      session.session_status === 'active' 
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : session.session_status === 'starting'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {session.session_status === 'active' ? 'Join Now' : 
                     session.session_status === 'starting' ? 'Join Session' : 
                     'Join When Ready'}
                  </button>
                  
                  <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Technical Check */}
          <div className="border-t border-gray-200 pt-3 mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Technical Check</h4>
            <div className="grid grid-cols-3 gap-2">
              <button className="flex items-center justify-center text-xs bg-green-50 text-green-700 px-2 py-2 rounded border border-green-200">
                <Mic className="w-3 h-3 mr-1" />
                Test Mic
              </button>
              <button className="flex items-center justify-center text-xs bg-blue-50 text-blue-700 px-2 py-2 rounded border border-blue-200">
                <Video className="w-3 h-3 mr-1" />
                Test Camera
              </button>
              <button className="flex items-center justify-center text-xs bg-purple-50 text-purple-700 px-2 py-2 rounded border border-purple-200">
                <Monitor className="w-3 h-3 mr-1" />
                Connection
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm mb-2">No upcoming telemedicine sessions</p>
          <p className="text-xs text-gray-400 mb-4">
            Schedule a video consultation with your healthcare provider
          </p>
          
          {/* Quick Setup Guide */}
          <div className="bg-blue-50 rounded-lg p-3 text-left">
            <h4 className="font-medium text-blue-900 mb-2 text-sm">Getting Started:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Request a session with your provider</li>
              <li>• Test your camera and microphone</li>
              <li>• Join from a quiet, well-lit location</li>
              <li>• Have your medication list ready</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}