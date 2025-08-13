// src/app/(dashboard)/patient/appointments/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  User,
  FileText,
  Phone,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Download,
  MessageSquare,
  Stethoscope,
  Pill
} from 'lucide-react';
import { usePatientAppointments } from '@/hooks/patient/usePatientAppointments';
import { TelemedicineMeetingInfo } from '../../components/dashboard/TelemedicineMeetingInfo';
import type { Appointment } from '@/types/patient.types';
import config from '@/lib/config';

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = parseInt(params.id as string);
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { cancelAppointment } = usePatientAppointments();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        // Using the telemedicine endpoint for appointment details
        const response = await fetch(`${config.apiBaseUrl}/telemedicine/appointments/${appointmentId}/`, {
          headers: {
            'Authorization': `Session ${localStorage.getItem('session_token') || ''}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch appointment details');
        }
        
        const data = await response.json();
        setAppointment(data);
      } catch (err) {
        console.error('Failed to fetch appointment:', err);
        setError('Failed to load appointment details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
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
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
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

  const handleCancelAppointment = async () => {
    if (!appointment) return;
    
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        setActionLoading('cancel');
        await cancelAppointment(appointment.id, 'Patient cancellation');
        alert('Appointment cancelled successfully');
        router.push('/patient/appointments');
      } catch (error) {
        alert('Failed to cancel appointment. Please try again.');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleJoinCall = () => {
    if (appointment?.meeting_url) {
      window.open(appointment.meeting_url, '_blank');
    } else {
      alert('Meeting link is not available yet. Please check back closer to your appointment time.');
    }
  };

  const canCancel = appointment && ['scheduled', 'confirmed'].includes(appointment.status);
  const canJoin = appointment && appointment.status === 'in_progress' && ['video_consultation', 'phone_consultation'].includes(appointment.appointment_type);
  const isUpcoming = appointment && new Date(appointment.scheduled_time) > new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading appointment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Appointment Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'The appointment you\'re looking for could not be found.'}
            </p>
            <button
              onClick={() => router.push('/patient/appointments')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Appointments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push('/patient/appointments')}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Appointments
          </button>
          <div className="flex items-center">
            {getStatusIcon(appointment.status)}
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Appointment Details
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-4">
                    <User className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Provider</p>
                      <p className="font-semibold text-gray-900">
                        {appointment.provider_details ? 
                          `${appointment.provider_details.first_name} ${appointment.provider_details.last_name}` : 
                          'TBD'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(appointment.scheduled_time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <Clock className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-semibold text-gray-900">
                        {formatTime(appointment.scheduled_time)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-4">
                    {(['video_consultation', 'phone_consultation'].includes(appointment.appointment_type)) ? (
                      <Video className="w-5 h-5 text-gray-400 mr-2" />
                    ) : (
                      <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Visit Type</p>
                      <p className="font-semibold text-gray-900">
                        {(['video_consultation', 'phone_consultation'].includes(appointment.appointment_type)) ? 'Telemedicine' : 'In-person'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <Stethoscope className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Appointment Type</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {appointment.appointment_type_display || appointment.appointment_type}
                      </p>
                    </div>
                  </div>

                  {appointment.duration_minutes && (
                    <div className="flex items-center mb-4">
                      <Clock className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold text-gray-900">
                          {appointment.duration_minutes} minutes
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {appointment.reason && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Reason for Visit</h3>
                  <p className="text-gray-700">{appointment.reason}</p>
                </div>
              )}

              {appointment.symptoms && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Symptoms</h3>
                  <p className="text-gray-700">{appointment.symptoms}</p>
                </div>
              )}

              {appointment.notes && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Provider Notes</h3>
                  <p className="text-gray-700">{appointment.notes}</p>
                </div>
              )}

              {appointment.preparation_notes && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Preparation Instructions</h3>
                  <p className="text-gray-700">{appointment.preparation_notes}</p>
                </div>
              )}
            </div>

            {/* Follow-up Information */}
            {appointment.follow_up_required && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                  <h3 className="font-medium text-orange-900">Follow-up Required</h3>
                </div>
                <p className="text-orange-700 mt-1">
                  Your provider has recommended a follow-up appointment.
                </p>
                {isUpcoming && (
                  <button className="mt-2 bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700">
                    Schedule Follow-up
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {canJoin && (
                  <button
                    onClick={handleJoinCall}
                    className="w-full flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Video Call
                  </button>
                )}

                {appointment.provider_details && (
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message Provider
                    </button>
                    
                    {appointment.provider_details.phone_number && (
                      <button className="w-full flex items-center justify-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Provider
                      </button>
                    )}
                  </div>
                )}

                {canCancel && (
                  <button
                    onClick={handleCancelAppointment}
                    disabled={actionLoading === 'cancel'}
                    className="w-full flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading === 'cancel' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Cancel Appointment
                  </button>
                )}

                {isUpcoming && appointment.status !== 'cancelled' && (
                  <button className="w-full flex items-center justify-center bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Reschedule
                  </button>
                )}
              </div>
            </div>

            {/* Provider Information */}
            {appointment.provider_details && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Provider Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">
                      {`${appointment.provider_details.first_name} ${appointment.provider_details.last_name}`}
                    </p>
                  </div>
                  
                  {appointment.provider_details.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{appointment.provider_details.email}</p>
                    </div>
                  )}

                  {appointment.provider_details.phone_number && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{appointment.provider_details.phone_number}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Information */}
            {!['video_consultation', 'phone_consultation'].includes(appointment.appointment_type) && appointment.location && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Location</h3>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{appointment.location}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Related Documents */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Related Documents</h3>
              <div className="space-y-2">
                <button className="w-full text-left flex items-center text-blue-600 hover:text-blue-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Appointment Summary
                </button>
                
                {appointment.status === 'completed' && (
                  <>
                    <button className="w-full text-left flex items-center text-blue-600 hover:text-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      Visit Notes
                    </button>
                    
                    <button className="w-full text-left flex items-center text-blue-600 hover:text-blue-700">
                      <Pill className="w-4 h-4 mr-2" />
                      Prescriptions
                    </button>
                  </>
                )}
              </div>
            </div>
            <TelemedicineMeetingInfo appointment={appointment} compact={false} />
          </div>
        </div>
      </div>
    </div>
  );
}