// src/app/(dashboard)/patient/vitals/record/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { patientService } from '@/lib/api/services/patient.service';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface FormData {
  blood_pressure_systolic: string;
  blood_pressure_diastolic: string;
  heart_rate: string;
  temperature: string;
  weight: string;
  oxygen_saturation: string;
  pain_level: string;
  notes: string;
}

interface RecentVitals {
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  oxygen_saturation?: number;
  pain_level?: number;
  recorded_at?: string;
}

export default function RecordVitalsPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    temperature: '',
    weight: '',
    oxygen_saturation: '',
    pain_level: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recentVitals, setRecentVitals] = useState<RecentVitals | null>(null);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load recent vitals for comparison
  useEffect(() => {
    const fetchRecentVitals = async () => {
      try {
        setLoadingRecent(true);
        const latest = await patientService.getLatestVitals();
        setRecentVitals(latest);
      } catch (err) {
        console.error('Failed to fetch recent vitals:', err);
      } finally {
        setLoadingRecent(false);
      }
    };

    fetchRecentVitals();
  }, []);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Convert to API format
      const vitalsData = {
        blood_pressure_systolic: formData.blood_pressure_systolic ? Number(formData.blood_pressure_systolic) : undefined,
        blood_pressure_diastolic: formData.blood_pressure_diastolic ? Number(formData.blood_pressure_diastolic) : undefined,
        heart_rate: formData.heart_rate ? Number(formData.heart_rate) : undefined,
        temperature: formData.temperature ? Number(formData.temperature) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        oxygen_saturation: formData.oxygen_saturation ? Number(formData.oxygen_saturation) : undefined,
        pain_level: formData.pain_level ? Number(formData.pain_level) : undefined,
        notes: formData.notes,
        recorded_at: new Date().toISOString()
      };

      await patientService.recordVitalSigns(vitalsData);
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/patient?tab=health');
      }, 2000);
      
    } catch (err) {
      setError('Failed to save vital signs. Please try again.');
      console.error('Error saving vitals:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Record Vital Signs</h1>
                <p className="text-gray-600 mt-1">Enter your vitals from your recent hospital visit or checkup</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {currentTime.toLocaleDateString()} at {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-green-800 font-medium">Vitals recorded successfully!</p>
                    <p className="text-green-700 text-sm">Your vitals have been saved and will appear in your history. Redirecting...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Blood Pressure */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-4">Blood Pressure</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Systolic (mmHg)
                      </label>
                      <input
                        type="number"
                        name="blood_pressure_systolic"
                        value={formData.blood_pressure_systolic}
                        onChange={handleChange}
                        placeholder="120"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diastolic (mmHg)
                      </label>
                      <input
                        type="number"
                        name="blood_pressure_diastolic"
                        value={formData.blood_pressure_diastolic}
                        onChange={handleChange}
                        placeholder="80"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Other Vitals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      name="heart_rate"
                      value={formData.heart_rate}
                      onChange={handleChange}
                      placeholder="72"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature (°F)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleChange}
                      placeholder="98.6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="150"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Oxygen Saturation (%)
                    </label>
                    <input
                      type="number"
                      name="oxygen_saturation"
                      value={formData.oxygen_saturation}
                      onChange={handleChange}
                      placeholder="98"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Pain Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pain Level (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    name="pain_level"
                    value={formData.pain_level}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional notes about your condition or these measurements..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Saving...' : 'Save Vitals'}
                  </button>
                </div>
              </form>
            </Card>
          </div>

          {/* Sidebar - Recent Vitals and Tips */}
          <div className="space-y-6">
            {/* Recent Vitals */}
            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                Recent Vitals
              </h3>
              
              {loadingRecent ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : recentVitals ? (
                <div className="space-y-3 text-sm">
                  {recentVitals.blood_pressure_systolic && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Pressure:</span>
                      <span className="font-medium">
                        {recentVitals.blood_pressure_systolic}/{recentVitals.blood_pressure_diastolic}
                      </span>
                    </div>
                  )}
                  {recentVitals.heart_rate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heart Rate:</span>
                      <span className="font-medium">{recentVitals.heart_rate} bpm</span>
                    </div>
                  )}
                  {recentVitals.temperature && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature:</span>
                      <span className="font-medium">{recentVitals.temperature}°F</span>
                    </div>
                  )}
                  {recentVitals.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{recentVitals.weight} lbs</span>
                    </div>
                  )}
                  {recentVitals.oxygen_saturation && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">O2 Saturation:</span>
                      <span className="font-medium">{recentVitals.oxygen_saturation}%</span>
                    </div>
                  )}
                  {recentVitals.pain_level !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pain Level:</span>
                      <span className="font-medium">{recentVitals.pain_level}/10</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent vitals recorded</p>
              )}
            </Card>

            {/* Recording Tips */}
            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">📋 Recording Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Enter values exactly as recorded by medical staff</li>
                <li>• Include all available measurements from your visit</li>
                <li>• Add notes about any symptoms or context</li>
                <li>• This data helps track your condition progress</li>
                <li>• Your care team can see these measurements</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}