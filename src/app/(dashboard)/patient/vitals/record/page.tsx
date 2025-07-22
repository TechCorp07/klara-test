// src/app/(dashboard)/patient/vitals/record/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function RecordVitalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [vitals, setVitals] = useState({
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    temperature: '',
    weight: '',
    height: '',
    blood_glucose: '',
    oxygen_saturation: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // API call to save vitals
      console.log('Recording vitals:', vitals);
      router.push('/patient?tab=health');
    } catch (error) {
      console.error('Failed to record vitals:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Record Vital Signs</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure (mmHg)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Systolic"
                    value={vitals.blood_pressure_systolic}
                    onChange={(e) => setVitals({...vitals, blood_pressure_systolic: e.target.value})}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  />
                  <span className="self-center">/</span>
                  <input
                    type="number"
                    placeholder="Diastolic"
                    value={vitals.blood_pressure_diastolic}
                    onChange={(e) => setVitals({...vitals, blood_pressure_diastolic: e.target.value})}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={vitals.heart_rate}
                  onChange={(e) => setVitals({...vitals, heart_rate: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.weight}
                  onChange={(e) => setVitals({...vitals, weight: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={vitals.notes}
                onChange={(e) => setVitals({...vitals, notes: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                Record Vitals
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}