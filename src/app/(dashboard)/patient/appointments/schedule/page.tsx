// src/app/(dashboard)/patient/appointments/schedule/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video } from 'lucide-react';

export default function ScheduleAppointmentPage() {
  const router = useRouter();
  const [appointment, setAppointment] = useState({
    provider_id: '',
    appointment_type: 'consultation',
    is_telemedicine: false,
    preferred_date: '',
    preferred_time: '',
    reason: '',
    urgency: 'routine'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      router.push('/patient?tab=care');
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Schedule Appointment</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider
              </label>
              <select
                value={appointment.provider_id}
                onChange={(e) => setAppointment({...appointment, provider_id: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select a provider</option>
                <option value="1">Dr. Sarah Johnson - Oncology</option>
                <option value="2">Dr. Michael Chen - Neurology</option>
                <option value="3">Dr. Emily Davis - Genetics</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type
                </label>
                <select
                  value={appointment.appointment_type}
                  onChange={(e) => setAppointment({...appointment, appointment_type: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine">Routine Check-up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <select
                  value={appointment.urgency}
                  onChange={(e) => setAppointment({...appointment, urgency: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={appointment.is_telemedicine}
                  onChange={(e) => setAppointment({...appointment, is_telemedicine: e.target.checked})}
                  className="mr-2"
                />
                <Video className="w-4 h-4 mr-1" />
                Telemedicine appointment
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={appointment.preferred_date}
                  onChange={(e) => setAppointment({...appointment, preferred_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={appointment.preferred_time}
                  onChange={(e) => setAppointment({...appointment, preferred_time: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit
              </label>
              <textarea
                value={appointment.reason}
                onChange={(e) => setAppointment({...appointment, reason: e.target.value})}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Please describe your symptoms or reason for the appointment..."
                required
              />
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Schedule Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}