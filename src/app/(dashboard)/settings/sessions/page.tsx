// src/app/(dashboard)/settings/sessions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FormButton, FormAlert } from '@/components/ui/common';
import { Spinner } from '@/components/ui/spinner';
import { 
  ArrowLeft, 
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock, 
  Shield, 
  X,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { isAxiosError } from 'axios';

interface Session {
  session_id: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  ip_address: string;
  location?: string;
  created_at: string;
  last_activity: string;
  is_current: boolean;
  expires_at: string;
  user_agent: string;

  // Optional fields from backend
  device_fingerprint?: string;
  is_active?: boolean;
  is_emergency_session?: boolean;
  pharmaceutical_tenant?: string;
}

const detectDeviceType = (userAgent: string): 'desktop' | 'mobile' | 'tablet' => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  return 'desktop';
};

const extractBrowserName = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
  if (ua.includes('ie') || ua.includes('trident')) return 'Internet Explorer';
  
  return 'Unknown Browser';
};

const extractOSName = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows nt 10')) return 'Windows 10/11';
  if (ua.includes('windows nt 6.3')) return 'Windows 8.1';
  if (ua.includes('windows nt 6.2')) return 'Windows 8';
  if (ua.includes('windows nt 6.1')) return 'Windows 7';
  if (ua.includes('windows')) return 'Windows';
  
  if (ua.includes('mac os x')) return 'macOS';
  if (ua.includes('macintosh')) return 'Mac';
  
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone os') || ua.includes('ios')) return 'iOS';
  if (ua.includes('ipad')) return 'iPadOS';
  
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('ubuntu')) return 'Ubuntu';
  if (ua.includes('debian')) return 'Debian';
  
  return 'Unknown OS';
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [terminating, setTerminating] = useState<string | null>(null);
  const [terminatingAll, setTerminatingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const response = await apiClient.get(ENDPOINTS.AUTH.ACTIVE_SESSIONS);
      const data = response.data as { sessions: Session[] };
      
      const mappedSessions = (data.sessions || []).map(session => ({
        ...session,
        device_type: detectDeviceType(session.user_agent),
        browser: extractBrowserName(session.user_agent),
        os: extractOSName(session.user_agent)
      }));
      
      setSessions(mappedSessions);
    } catch (error: unknown) {
      console.error('❌ Failed to load sessions:', error);
      
      // Fix: Properly type check the error before accessing properties
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            status?: number; 
            data?: unknown; 
          } 
        };
        
        if (axiosError.response) {
          console.error('Response status:', axiosError.response.status);
          console.error('Response data:', axiosError.response.data);
        }
      }
      
      setErrorMessage('Failed to load active sessions');
    } finally {
      setIsLoading(false);
    }
  };

const terminateSession = async (sessionId: string) => {
  try {
    setTerminating(sessionId);
    setErrorMessage(null);
    
    await apiClient.post(ENDPOINTS.AUTH.TERMINATE_SESSION, {
      session_id: sessionId
    });
    
    // Remove the session from the list
    setSessions(prev => prev.filter(session => session.session_id !== sessionId));
    setSuccessMessage('Session terminated successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  } catch (error: unknown) {
    console.error('Failed to terminate session:', error);
    
    if (isAxiosError(error) && error.response) {
      const message = error.response.data?.detail || error.response.data?.error || 'Failed to terminate session';
      setErrorMessage(message as string);
    } else {
      setErrorMessage('Failed to terminate session');
    }
  } finally {
    setTerminating(null);
  }
};

  const terminateAllOtherSessions = async () => {
    try {
      setTerminatingAll(true);
      setErrorMessage(null);
      
      await apiClient.post(ENDPOINTS.AUTH.TERMINATE_ALL_SESSIONS, {
              exclude_current: true,
              reason: 'Terminated all other sessions from security page'
      });
      
      // Keep only the current session
      setSessions(prev => prev.filter(session => session.is_current));
      setSuccessMessage('All other sessions terminated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Failed to terminate all sessions:', error);
      
      if (isAxiosError(error) && error.response) {
        const message = error.response.data?.detail || error.response.data?.error || 'Failed to terminate all sessions';
        setErrorMessage(message as string);
      } else {
        setErrorMessage('Failed to terminate all sessions');
      }
    } finally {
      setTerminatingAll(false);
    }
  };

  const getDeviceIcon = (deviceType: 'desktop' | 'mobile' | 'tablet') => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-gray-500" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-gray-500" />;
      default:
        return <Monitor className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Link
            href="/settings?tab=security"
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your active login sessions across all devices
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(errorMessage || successMessage) && (
        <div className="mb-6">
          <FormAlert
            type={errorMessage ? 'error' : 'success'}
            message={errorMessage || successMessage || ''}
          />
        </div>
      )}

      {/* Security Notice */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Security Reminder
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                If you see any sessions you don't recognize, terminate them immediately 
                and consider changing your password. Always log out from shared or public devices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {sessions.filter(s => !s.is_current).length > 0 && (
        <div className="mb-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Bulk Actions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Terminate all sessions except your current one
                </p>
              </div>
              <FormButton
                variant="danger"
                onClick={terminateAllOtherSessions}
                isLoading={terminatingAll}
              >
                Terminate All Other Sessions
              </FormButton>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Active Sessions ({sessions.length})
          </h3>

          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active sessions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`border rounded-lg p-4 ${
                    session.is_current ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getDeviceIcon(session.device_type || 'desktop')}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {session.browser} on {session.os}
                          </p>
                          {session.is_current && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Current Session
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{session.ip_address}</span>
                            {session.location && <span>({session.location})</span>}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Last active {formatLastActivity(session.last_activity)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-1 text-xs text-gray-400">
                          Created {new Date(session.created_at).toLocaleDateString()} at{' '}
                          {new Date(session.created_at).toLocaleTimeString()}
                        </div>
                        
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View technical details
                          </summary>
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 font-mono">
                            <div>Session ID: {session.session_id}</div>
                            <div>User Agent: {session.user_agent}</div>
                          </div>
                        </details>
                      </div>
                    </div>

                    {!session.is_current && (
                      <button
                        onClick={() => terminateSession(session.session_id)}
                        disabled={terminating === session.session_id}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                      >
                        {terminating === session.session_id ? (
                          <Spinner size="sm" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>Terminate</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HIPAA Notice */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Privacy & Security Notice
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Session information is logged for security and compliance purposes under HIPAA regulations. 
                This data helps protect your health information and detect unauthorized access attempts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}