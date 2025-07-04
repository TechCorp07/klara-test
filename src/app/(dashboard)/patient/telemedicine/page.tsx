// src/app/(dashboard)/patient/telemedicine/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { patientService } from '@/lib/api/services/patient.service';
import { Spinner } from '@/components/ui/spinner';
import type { Appointment } from '@/types/patient.types';

interface TelemedicineSession {
  id: number;
  appointment: Appointment;
  status: 'waiting' | 'active' | 'ended' | 'cancelled';
  platform: 'zoom' | 'teams' | 'custom';
  meeting_id: string;
  join_url: string;
  passcode?: string;
  can_join: boolean;
  provider_joined: boolean;
  patient_joined: boolean;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  connection_quality?: number;
  technical_issues?: string;
  session_notes?: string;
}

interface ConnectionTest {
  camera: boolean;
  microphone: boolean;
  internet_speed: number;
  browser_compatible: boolean;
  recommended_actions: string[];
}

export default function TelemedicinePage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams?.get('appointment');
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [connectionTest, setConnectionTest] = useState<ConnectionTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showPreJoinChecklist, setShowPreJoinChecklist] = useState(false);
  const [inSession, setInSession] = useState(false);

    // Check session status for selected appointment
    const checkSessionStatus = useCallback(async (appointmentId: number) => {
      try {
        const status = await patientService.getTelemedicineSessionStatus(appointmentId);
        // Create a mock session object for demo purposes
        const mockSession: TelemedicineSession = {
          id: 1,
          appointment: selectedAppointment!,
          status: status.status,
          platform: 'zoom',
          meeting_id: '123456789',
          join_url: 'https://zoom.us/j/123456789',
          passcode: 'patient123',
          can_join: status.can_join,
          provider_joined: status.provider_joined,
          patient_joined: false,
        };
        setSession(mockSession);
      } catch (err) {
        console.error('Failed to check session status:', err);
      }
    }, [selectedAppointment]);
    
  // Fetch telemedicine appointments
  useEffect(() => {
    const fetchTelemedicineAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get upcoming video appointments
        const today = new Date();
        const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const response = await patientService.getTelemedicineAppointments({
          status: 'scheduled,confirmed,checked_in',
          start_date: today.toISOString().split('T')[0],
          end_date: futureDate.toISOString().split('T')[0],
        });

        const videoAppointments = response.results.filter(apt => apt.visit_type === 'video');
        setAppointments(videoAppointments);

        // If appointment ID is provided, select it
        if (appointmentId) {
          const targetAppointment = videoAppointments.find(apt => apt.id.toString() === appointmentId);
          if (targetAppointment) {
            setSelectedAppointment(targetAppointment);
            await checkSessionStatus(targetAppointment.id);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load telemedicine appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchTelemedicineAppointments();
  }, [appointmentId, checkSessionStatus]);

  // Test connection
  const testConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock connection test results
      const testResults: ConnectionTest = {
        camera: true,
        microphone: true,
        internet_speed: 25.5, // Mbps
        browser_compatible: true,
        recommended_actions: [],
      };

      // Add recommendations based on test results
      if (testResults.internet_speed < 5) {
        testResults.recommended_actions.push('Your internet connection is slow. Consider using a wired connection or moving closer to your router.');
      }
      if (!testResults.camera) {
        testResults.recommended_actions.push('Camera access is required for video consultations. Please allow camera permissions.');
      }
      if (!testResults.microphone) {
        testResults.recommended_actions.push('Microphone access is required. Please allow microphone permissions.');
      }

      setConnectionTest(testResults);
    } catch (err) {
      console.error('Connection test failed:', err);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Join session
  const joinSession = async () => {
    if (!selectedAppointment || !session) return;

    try {
      const sessionData = await patientService.joinTelemedicineSession(selectedAppointment.id);
      
      // Open session in new window/tab
      window.open(sessionData.join_url, '_blank', 'width=1200,height=800');
      
      setInSession(true);
      
      // Start polling for session updates
      const pollInterval = setInterval(async () => {
        try {
          const status = await patientService.getTelemedicineSessionStatus(selectedAppointment.id);
          if (status.status === 'ended') {
            setInSession(false);
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error('Failed to poll session status:', err);
        }
      }, 10000); // Poll every 10 seconds

      // Clean up interval after 2 hours
      setTimeout(() => clearInterval(pollInterval), 2 * 60 * 60 * 1000);
    } catch (err) {
      console.error('Failed to join session:', err);
      // Show error message
    }
  };

  // Check if appointment can be joined (within 15 minutes)
  const canJoinAppointment = (appointment: Appointment) => {
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduled_datetime);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    return minutesDiff <= 15 && minutesDiff >= -30 && 
           ['confirmed', 'checked_in'].includes(appointment.status);
  };

  // Format time until appointment
  const getTimeUntilAppointment = (appointment: Appointment) => {
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduled_datetime);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff < 0) return 'Started';
    if (minutesDiff < 60) return `${minutesDiff} minutes`;
    
    const hours = Math.floor(minutesDiff / 60);
    const remainingMinutes = minutesDiff % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading telemedicine appointments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Telemedicine</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
        <h1 className="text-3xl font-bold text-gray-900">Telemedicine</h1>
        <p className="mt-2 text-gray-600">
          Join video consultations with your healthcare providers.
        </p>
      </div>

      {/* System Requirements Notice */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-blue-800">System Requirements</p>
              <div className="text-sm text-blue-700 mt-1">
                <p>• Stable internet connection (minimum 5 Mbps)</p>
                <p>• Modern web browser with camera and microphone access</p>
                <p>• Quiet, private space for your consultation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Test */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Connection Test</h2>
            <button
              onClick={testConnection}
              disabled={isTestingConnection}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {isTestingConnection ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Test Connection
                </>
              )}
            </button>
          </div>

          {connectionTest && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg border ${connectionTest.camera ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center">
                  <svg className={`h-5 w-5 mr-2 ${connectionTest.camera ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className={`font-medium ${connectionTest.camera ? 'text-green-800' : 'text-red-800'}`}>
                    Camera {connectionTest.camera ? 'Ready' : 'Not Available'}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${connectionTest.microphone ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center">
                  <svg className={`h-5 w-5 mr-2 ${connectionTest.microphone ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span className={`font-medium ${connectionTest.microphone ? 'text-green-800' : 'text-red-800'}`}>
                    Microphone {connectionTest.microphone ? 'Ready' : 'Not Available'}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${connectionTest.internet_speed >= 5 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center">
                  <svg className={`h-5 w-5 mr-2 ${connectionTest.internet_speed >= 5 ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                  <span className={`font-medium ${connectionTest.internet_speed >= 5 ? 'text-green-800' : 'text-yellow-800'}`}>
                    {connectionTest.internet_speed} Mbps
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${connectionTest.browser_compatible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center">
                  <svg className={`h-5 w-5 mr-2 ${connectionTest.browser_compatible ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className={`font-medium ${connectionTest.browser_compatible ? 'text-green-800' : 'text-red-800'}`}>
                    Browser {connectionTest.browser_compatible ? 'Compatible' : 'Incompatible'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {(connectionTest?.recommended_actions?.length ?? 0) > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Recommendations:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {(connectionTest?.recommended_actions ?? []).map((action, index) => (
                  <li key={index}>• {action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Video Appointments */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Video Appointments</h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 mb-4">No upcoming video appointments</p>
            <Link
              href="/dashboard/patient/appointments"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Schedule Video Consultation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {appointments.map(appointment => {
              const canJoin = canJoinAppointment(appointment);
              const timeUntil = getTimeUntilAppointment(appointment);
              const isSelected = selectedAppointment?.id === appointment.id;

              return (
                <div
                  key={appointment.id}
                  className={`bg-white border rounded-lg p-6 transition-all duration-200 ${
                    isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  } ${canJoin ? 'ring-2 ring-green-200' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{appointment.provider.name}</h3>
                      <p className="text-sm text-gray-600">{appointment.provider.specialty}</p>
                    </div>
                    {canJoin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ready to Join
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(appointment.scheduled_datetime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {new Date(appointment.scheduled_datetime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {appointment.duration_minutes} minutes
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>{appointment.reason_for_visit}</span>
                    </div>
                    <div className="flex items-center font-medium">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={canJoin ? 'text-green-600' : 'text-gray-600'}>
                        {timeUntil === 'Started' ? 'In Progress' : `Starts in ${timeUntil}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    {canJoin ? (
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowPreJoinChecklist(true);
                        }}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Join Video Call
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed"
                      >
                        Available 15 min before
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSelectedAppointment(appointment)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pre-Join Checklist Modal */}
      {showPreJoinChecklist && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pre-Join Checklist</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-3" defaultChecked />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Camera and microphone tested</p>
                    <p className="text-xs text-gray-500">Ensure your camera and microphone are working properly</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-3" defaultChecked />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Quiet, private space</p>
                    <p className="text-xs text-gray-500">Find a quiet location for your consultation</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Insurance card and ID ready</p>
                    <p className="text-xs text-gray-500">Have your documents ready if needed</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Questions prepared</p>
                    <p className="text-xs text-gray-500">List any questions or concerns you want to discuss</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreJoinChecklist(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowPreJoinChecklist(false);
                    joinSession();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Active Indicator */}
      {inSession && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="animate-pulse bg-green-300 h-3 w-3 rounded-full mr-3"></div>
            <span className="font-medium">Video session active</span>
          </div>
        </div>
      )}

      {/* Help and Support */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">Technical Support</p>
              <p className="text-sm text-gray-600">Call (555) 123-4567 for immediate assistance</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">User Guide</p>
              <Link href="/help/telemedicine" className="text-sm text-blue-600 hover:text-blue-700">
                Learn how to use telemedicine
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
