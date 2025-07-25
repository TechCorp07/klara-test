// src/app/(dashboard)/patient/telemedicine/request/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Phone, MessageSquare } from 'lucide-react';

interface TelemedicineRequest {
  provider_id: string;
  session_type: 'video' | 'audio' | 'chat';
  urgency: 'routine' | 'urgent' | 'emergency';
  preferred_date: string;
  preferred_time: string;
  reason: string;
  symptoms: string;
  duration_needed: string;
  requires_interpreter: boolean;
  interpreter_language: string;
  medical_records_needed: string[];
}

export default function TelemedicineRequestPage() {
  const router = useRouter();
  const [request, setRequest] = useState<TelemedicineRequest>({
    provider_id: '',
    session_type: 'video',
    urgency: 'routine',
    preferred_date: '',
    preferred_time: '',
    reason: '',
    symptoms: '',
    duration_needed: '30',
    requires_interpreter: false,
    interpreter_language: '',
    medical_records_needed: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMedicalRecordChange = (record: string, checked: boolean) => {
    if (checked) {
      setRequest({
        ...request,
        medical_records_needed: [...request.medical_records_needed, record]
      });
    } else {
      setRequest({
        ...request,
        medical_records_needed: request.medical_records_needed.filter(r => r !== record)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Telemedicine session request submitted successfully! You will receive a confirmation email shortly.');
      router.push('/patient?tab=care');
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Video className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Request Telemedicine Session</h1>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Telemedicine Benefits</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Access specialized rare disease experts from anywhere</li>
              <li>• Reduced travel time and costs</li>
              <li>• Secure, HIPAA-compliant video consultations</li>
              <li>• Real-time access to your medical records during the session</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Healthcare Provider *
                </label>
                <select
                  value={request.provider_id}
                  onChange={(e) => setRequest({...request, provider_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select a provider</option>
                  <option value="1">Dr. Sarah Johnson - Rare Cancer Specialist</option>
                  <option value="2">Dr. Michael Chen - Neurological Rare Diseases</option>
                  <option value="3">Dr. Emily Davis - Genetic Disorders</option>
                  <option value="4">Dr. Robert Wilson - Rare Autoimmune Conditions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Type *
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'video', label: 'Video Call', icon: Video },
                    { value: 'audio', label: 'Audio Only', icon: Phone },
                    { value: 'chat', label: 'Text Chat', icon: MessageSquare }
                  ].map(({ value, label, icon: Icon }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        value={value}
                        checked={request.session_type === value}
                        onChange={(e) => setRequest({...request, session_type: e.target.value as 'video' | 'audio' | 'chat'})}
                        className="mr-2"
                      />
                      <Icon className="w-4 h-4 mr-2" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level *
                </label>
                <select
                  value={request.urgency}
                  onChange={(e) => setRequest({...request, urgency: e.target.value as 'routine' | 'urgent' | 'emergency'})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent (within 24 hours)</option>
                  <option value="emergency">Emergency (immediate)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={request.preferred_date}
                  onChange={(e) => setRequest({...request, preferred_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time *
                </label>
                <input
                  type="time"
                  value={request.preferred_time}
                  onChange={(e) => setRequest({...request, preferred_time: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Duration
              </label>
              <select
                value={request.duration_needed}
                onChange={(e) => setRequest({...request, duration_needed: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Session *
              </label>
              <textarea
                value={request.reason}
                onChange={(e) => setRequest({...request, reason: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Please describe the main reason for this telemedicine session..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Symptoms or Concerns
              </label>
              <textarea
                value={request.symptoms}
                onChange={(e) => setRequest({...request, symptoms: e.target.value})}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Describe any symptoms, changes in condition, medication side effects, or other concerns..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Medical Records to Share During Session
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'recent_lab_results', 'imaging_scans', 'medication_list',
                  'symptom_diary', 'vital_signs', 'genetic_test_results',
                  'previous_consultations', 'hospital_records'
                ].map((record) => (
                  <label key={record} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={request.medical_records_needed.includes(record)}
                      onChange={(e) => handleMedicalRecordChange(record, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">
                      {record.replace(/_/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="interpreter"
                  checked={request.requires_interpreter}
                  onChange={(e) => setRequest({...request, requires_interpreter: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="interpreter" className="text-sm font-medium text-gray-700">
                  I need an interpreter for this session
                </label>
              </div>

              {request.requires_interpreter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language Needed
                  </label>
                  <input
                    type="text"
                    value={request.interpreter_language}
                    onChange={(e) => setRequest({...request, interpreter_language: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Spanish, Mandarin, ASL"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Request Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}