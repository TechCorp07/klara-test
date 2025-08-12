// src/app/(dashboard)/patient/appointments/schedule/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Calendar, AlertCircle, CheckCircle, Loader2, FileText } from 'lucide-react';
import { patientService } from '@/lib/api/services/patient.service';
import { usePatientAppointments } from '@/hooks/patient/usePatientAppointments';
import apiClient from '@/lib/api/client';

interface AppointmentFormData {
  provider_id: string;
  appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'screening';
  is_telemedicine: boolean;
  preferred_date: string;
  preferred_time: string;
  reason_for_visit: string;
  symptoms: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  duration?: number;
}

interface SubmissionState {
  isSubmitting: boolean;
  success: boolean;
  error: string | null;
  appointmentDetails: any | null;
}

interface ConsentState {
  loading: boolean;
  hasConsent: boolean;
  needsConsent: boolean;
  providing: boolean;
}

export default function ScheduleAppointmentPage() {
  const router = useRouter();
  
  const [appointment, setAppointment] = useState<AppointmentFormData>({
    provider_id: '',
    appointment_type: 'consultation',
    is_telemedicine: false,
    preferred_date: '',
    preferred_time: '',
    reason_for_visit: '',
    symptoms: '',
    urgency: 'routine',
    duration: 30
  });

  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isSubmitting: false,
    success: false,
    error: null,
    appointmentDetails: null
  });

  const [consentState, setConsentState] = useState<ConsentState>({
    loading: true,
    hasConsent: false,
    needsConsent: false,
    providing: false
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [providers, setProviders] = useState<Array<{id: number, name: string, specialty?: string}>>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  const { scheduleAppointment: hookScheduleAppointment } = usePatientAppointments({
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Check consent status on component mount
  useEffect(() => {
    checkConsentStatus();
  }, []);
  
  useEffect(() => {
  const loadProviders = async () => {
    try {
      setLoadingProviders(true);
      // This endpoint should return available providers
      const response = await apiClient.get('/users/provider/available/');
      
      console.log('🔍 Loaded providers:', response.data);
      setProviders(response.data as Array<{id: number, name: string, specialty?: string}>);

    } catch (error) {
      console.error('Error loading providers:', error);
      // Fallback providers for testing
      setProviders([
        { id: 2, name: 'Dr. Sarah Johnson', specialty: 'Cardiology' },
        { id: 3, name: 'Dr. Michael Chen', specialty: 'Neurology' },
        { id: 4, name: 'Dr. Emily Davis', specialty: 'Oncology' }
      ]);
    } finally {
      setLoadingProviders(false);
    }
  };
  
  loadProviders();
}, []);

  const checkConsentStatus = async () => {
    try {
      setConsentState(prev => ({ ...prev, loading: true }));
      const consentStatus = await patientService.getTelemedicineConsentStatus();
      
      setConsentState(prev => ({
        ...prev,
        loading: false,
        hasConsent: consentStatus.has_consent,
        needsConsent: !consentStatus.has_consent
      }));
    } catch (error) {
      console.error('Failed to check consent status:', error);
      setConsentState(prev => ({
        ...prev,
        loading: false,
        hasConsent: false,
        needsConsent: true
      }));
    }
  };

  const handleProvideConsent = async () => {
    try {
      setConsentState(prev => ({ ...prev, providing: true }));
      
      await patientService.provideTelemedicineConsent({
        consented: true,
      });
      
      setConsentState(prev => ({
        ...prev,
        providing: false,
        hasConsent: true,
        needsConsent: false
      }));
      
      alert('Consent provided successfully! You can now schedule appointments.');
      
    } catch (error) {
      console.error('Failed to provide consent:', error);
      setConsentState(prev => ({ ...prev, providing: false }));
      alert('Failed to provide consent. Please try again.');
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!appointment.provider_id) {
      errors.provider_id = 'Please select a provider';
    }
    if (!appointment.preferred_date) {
      errors.preferred_date = 'Please select a date';
    }
    if (!appointment.preferred_time) {
      errors.preferred_time = 'Please select a time';
    }
    if (!appointment.reason_for_visit.trim()) {
      errors.reason_for_visit = 'Please provide a reason for your visit';
    }
    if (appointment.reason_for_visit.length > 500) {
      errors.reason_for_visit = 'Reason must be less than 500 characters';
    }

    // Check if date is in the past
    const selectedDateTime = new Date(`${appointment.preferred_date}T${appointment.preferred_time}`);
    if (selectedDateTime <= new Date()) {
      errors.preferred_datetime = 'Please select a future date and time';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check consent before proceeding
    if (consentState.needsConsent) {
      alert('Please provide telemedicine consent first.');
      return;
    }

    setSubmissionState(prev => ({ 
      ...prev, 
      isSubmitting: true, 
      error: null 
    }));

    try {
      // Convert form data to API format
      const appointmentData = {
        provider: parseInt(appointment.provider_id),
        appointment_type: appointment.appointment_type,
        is_telemedicine: appointment.is_telemedicine,
        visit_type: appointment.is_telemedicine ? 'telemedicine' : 'in_person',
        preferred_datetime: `${appointment.preferred_date}T${appointment.preferred_time}:00`,
        reason_for_visit: appointment.reason_for_visit,
        symptoms: appointment.symptoms || '',
        urgency: appointment.urgency,
        duration_minutes: appointment.duration || 30
      };

      // 🔍 ADD DEBUG LOGGING
      console.log('🔍 Form data before API call:', {
        original_provider_id: appointment.provider_id,
        parsed_provider_id: parseInt(appointment.provider_id),
        appointmentData
      });

      // 🔍 CRITICAL: Check if we're accidentally sending patient ID as provider
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('🔍 Current user (should NOT match provider):', currentUser);
      
      if (currentUser.id === parseInt(appointment.provider_id)) {
        console.error('❌ ERROR: Provider ID matches patient ID - this is wrong!');
        setSubmissionState({
          isSubmitting: false,
          success: false,
          error: 'Invalid provider selection. Please try again.',
          appointmentDetails: null
        });
        return;
      }

      // Make API call
      const response = await hookScheduleAppointment(appointmentData);
      // LOG THE RESPONSE TO SEE ITS STRUCTURE
      console.log('Appointment creation response:', response);
      
      // Store the response for display
      setSubmissionState({
        isSubmitting: false,
        success: true,
        error: null,
        appointmentDetails: response
      });
      
      const appointmentId = response.id;

      // Auto-redirect after showing success for 10 seconds
      setTimeout(() => {
        if (appointmentId && !isNaN(appointmentId)) {
          router.push(`/patient/appointments/${appointmentId}`);
        } else {
          router.push('/patient/appointments');
        }
      }, 10000);

    } catch (error: unknown) {
      console.error('Failed to schedule appointment:', error);
      
      // Check for consent errors
      if (error && typeof error === 'object' && 'response' in error &&
          error.response && typeof error.response === 'object' && 'status' in error.response &&
          error.response.status === 403 && 
          'data' in error.response && error.response.data && 
          typeof error.response.data === 'object' && 'detail' in error.response.data &&
          typeof error.response.data.detail === 'string' &&
          error.response.data.detail.includes('telemedicine services')) {
        setConsentState(prev => ({ ...prev, needsConsent: true, hasConsent: false }));
        setSubmissionState({
          isSubmitting: false,
          success: false,
          error: 'You need to provide consent for telemedicine services first.',
          appointmentDetails: null
        });
        return;
      }

      let errorMessage = 'Failed to schedule appointment. Please try again.';

      // Handle specific error types
      if (typeof error === 'object' && error !== null && 'message' in error && typeof (error).message === 'string') {
        const errMsg = typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : '';
        if (errMsg.includes('conflict')) {
          errorMessage = 'This time slot has been taken. Please select another time.';
        } else if (errMsg.includes('validation')) {
          errorMessage = 'Please check the form data and try again.';
        } else if (errMsg.includes('network')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }

      setSubmissionState({
        isSubmitting: false,
        success: false,
        error: errorMessage,
        appointmentDetails: null
      });
    }
  };

  // Show loading state while checking consent
  if (consentState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Checking consent status...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show consent requirement if needed
  if (consentState.needsConsent) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Telemedicine Consent Required
              </h1>
              <p className="text-gray-600 mb-6">
                Before scheduling appointments, you need to provide consent for telemedicine services. 
                This is required for HIPAA compliance and ensures we can provide you with the best care possible.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">Telemedicine Services Include:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Video consultations with healthcare providers</li>
                  <li>• Remote monitoring of your health data</li>
                  <li>• Digital sharing of medical information</li>
                  <li>• Electronic prescription management</li>
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleProvideConsent}
                  disabled={consentState.providing}
                  className={`w-full py-3 px-6 rounded-md text-white font-medium ${
                    consentState.providing
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {consentState.providing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                      Providing Consent...
                    </>
                  ) : (
                    'I Consent to Telemedicine Services'
                  )}
                </button>
                
                <button
                  onClick={() => router.back()}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (submissionState.success && submissionState.appointmentDetails) {
    const details = submissionState.appointmentDetails;
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
          {/* Consent status indicator */}
          {consentState.hasConsent && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-sm text-green-800">Telemedicine consent provided</span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Schedule Appointment</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
              disabled={submissionState.isSubmitting}
            >
              ← Back
            </button>
          </div>

            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Appointment Scheduled Successfully!
              </h1>
              <p className="text-gray-600 mb-6">
                Your appointment has been requested and is pending confirmation.
              </p>
              
              {/* Appointment Details Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-3">Appointment Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Appointment ID:</strong> #{details.id}</p>
                  <p><strong>Provider:</strong> {details.provider?.name || 'Provider'}</p>
                  <p><strong>Date & Time:</strong> {new Date(details.scheduled_time || details.preferred_datetime).toLocaleString()}</p>
                  <p><strong>Type:</strong> {details.appointment_type}</p>
                  <p><strong>Visit Type:</strong> {details.is_telemedicine ? 'Telemedicine' : 'In-Person'}</p>
                  {details.is_telemedicine && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-blue-800 font-medium text-sm">✓ Telemedicine Setup Complete</p>
                    <p className="text-blue-600 text-xs mt-1">
                      Meeting link and calendar invites have been sent to your email
                    </p>
                  </div>
                )}
                  <p><strong>Status:</strong> <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">{details.status}</span></p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/patient/appointments/${details.id}`)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  View Appointment Details
                </button>
                <button
                  onClick={() => router.push('/patient/appointments')}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                >
                  View All Appointments
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Redirecting to appointment details in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Schedule Appointment</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
              disabled={submissionState.isSubmitting}
            >
              ← Back
            </button>
          </div>

          {/* Error Message */}
          {submissionState.error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{submissionState.error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider *
              </label>
              {loadingProviders ? (
                <div className="w-full border rounded-md px-3 py-2 bg-gray-50">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Loading providers...
                </div>
              ) : (
                <select
                  value={appointment.provider_id}
                  onChange={(e) => {
                    console.log('🔍 Provider selected:', e.target.value);
                    setAppointment({...appointment, provider_id: e.target.value});
                    if (validationErrors.provider_id) {
                      setValidationErrors(prev => ({...prev, provider_id: ''}));
                    }
                  }}
                  className={`w-full border rounded-md px-3 py-2 ${
                    validationErrors.provider_id 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a provider...</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} {provider.specialty ? `- ${provider.specialty}` : ''}
                    </option>
                  ))}
                </select>
              )}
              {validationErrors.provider_id && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.provider_id}</p>
              )}
              
              {/* 🔍 DEBUG: Show selected provider ID */}
              {appointment.provider_id && (
                <p className="mt-1 text-xs text-blue-600">
                  Selected Provider ID: {appointment.provider_id}
                </p>
              )}
            </div>

            {/* Appointment Type and Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type
                </label>
                <select
                  value={appointment.appointment_type}
                  onChange={(e) => setAppointment({...appointment, appointment_type: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  disabled={submissionState.isSubmitting}
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="screening">Screening</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <select
                  value={appointment.urgency}
                  onChange={(e) => setAppointment({...appointment, urgency: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  disabled={submissionState.isSubmitting}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>

            {/* Telemedicine Option */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={appointment.is_telemedicine}
                  onChange={(e) => setAppointment({...appointment, is_telemedicine: e.target.checked})}
                  className="mr-2"
                  disabled={submissionState.isSubmitting}
                />
                <Video className="w-4 h-4 mr-1" />
                Telemedicine appointment
              </label>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={appointment.preferred_date}
                  onChange={(e) => {
                    setAppointment({...appointment, preferred_date: e.target.value});
                    if (validationErrors.preferred_date) {
                      setValidationErrors(prev => ({...prev, preferred_date: ''}));
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full border rounded-md px-3 py-2 ${
                    validationErrors.preferred_date 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  required
                  disabled={submissionState.isSubmitting}
                />
                {validationErrors.preferred_date && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.preferred_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time *
                </label>
                <input
                  type="time"
                  value={appointment.preferred_time}
                  onChange={(e) => {
                    setAppointment({...appointment, preferred_time: e.target.value});
                    if (validationErrors.preferred_time) {
                      setValidationErrors(prev => ({...prev, preferred_time: ''}));
                    }
                  }}
                  className={`w-full border rounded-md px-3 py-2 ${
                    validationErrors.preferred_time 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  required
                  disabled={submissionState.isSubmitting}
                />
                {validationErrors.preferred_time && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.preferred_time}</p>
                )}
              </div>
            </div>

            {/* Validation error for datetime combination */}
            {validationErrors.preferred_datetime && (
              <p className="text-sm text-red-600">{validationErrors.preferred_datetime}</p>
            )}

            {/* Reason for Visit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit *
              </label>
              <textarea
                value={appointment.reason_for_visit}
                onChange={(e) => {
                  setAppointment({...appointment, reason_for_visit: e.target.value});
                  if (validationErrors.reason_for_visit) {
                    setValidationErrors(prev => ({...prev, reason_for_visit: ''}));
                  }
                }}
                rows={4}
                maxLength={500}
                className={`w-full border rounded-md px-3 py-2 ${
                  validationErrors.reason_for_visit 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Please describe your symptoms or reason for the appointment..."
                required
                disabled={submissionState.isSubmitting}
              />
              <div className="flex justify-between mt-1">
                {validationErrors.reason_for_visit && (
                  <p className="text-sm text-red-600">{validationErrors.reason_for_visit}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {appointment.reason_for_visit.length}/500
                </p>
              </div>
            </div>

            {/* Symptoms (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Symptoms (Optional)
              </label>
              <textarea
                value={appointment.symptoms}
                onChange={(e) => setAppointment({...appointment, symptoms: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Any additional symptoms or concerns..."
                disabled={submissionState.isSubmitting}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={submissionState.isSubmitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submissionState.isSubmitting}
                className={`px-6 py-2 rounded-md text-white flex items-center ${
                  submissionState.isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {submissionState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}