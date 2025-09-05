// src/app/(dashboard)/patient/vitals/record/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { patientService } from '@/lib/api/services/patient.service';
import { VitalSignsEntry } from '@/lib/api/services/patient.service';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Heart,
  Activity,
  Thermometer,
  Scale,
  Droplets,
  FileText,
  Save,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp
} from 'lucide-react';

export default function RecordVitalsPage() {
  const router = useRouter();
  
  // Form state - matches your current structure but with proper types
  const [vitals, setVitals] = useState<VitalSignsEntry>({
    blood_pressure_systolic: undefined,
    blood_pressure_diastolic: undefined,
    heart_rate: undefined,
    temperature: undefined,
    weight: undefined,
    oxygen_saturation: undefined,
    pain_level: undefined,
    notes: ''
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recentVitals, setRecentVitals] = useState<VitalSignsEntry | null>(null);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Form validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const validateField = (name: string, value: string): string | null => {
    const numValue = parseFloat(value);
    
    if (value && isNaN(numValue)) {
      return 'Please enter a valid number';
    }

    switch (name) {
      case 'blood_pressure_systolic':
        if (numValue && (numValue < 70 || numValue > 250)) {
          return 'Systolic BP should be between 70-250 mmHg';
        }
        break;
      case 'blood_pressure_diastolic':
        if (numValue && (numValue < 40 || numValue > 150)) {
          return 'Diastolic BP should be between 40-150 mmHg';
        }
        break;
      case 'heart_rate':
        if (numValue && (numValue < 30 || numValue > 250)) {
          return 'Heart rate should be between 30-250 bpm';
        }
        break;
      case 'temperature':
        if (numValue && (numValue < 90 || numValue > 115)) {
          return 'Temperature should be between 90-115°F';
        }
        break;
      case 'weight':
        if (numValue && (numValue < 50 || numValue > 800)) {
          return 'Weight should be between 50-800 lbs';
        }
        break;
      case 'oxygen_saturation':
        if (numValue && (numValue < 70 || numValue > 100)) {
          return 'Oxygen saturation should be between 70-100%';
        }
        break;
      case 'pain_level':
        if (numValue && (numValue < 0 || numValue > 10)) {
          return 'Pain level should be between 0-10';
        }
        break;
    }
    return null;
  };

  const handleInputChange = (name: keyof VitalSignsEntry, value: string) => {
    setVitals(prev => ({
      ...prev,
      [name]: name === 'notes' ? value : value
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFieldBlur = (name: keyof VitalSignsEntry, value: string) => {
    const error = validateField(name, value);
    if (error) {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const hasValidData = (): boolean => {
    const numericFields = ['blood_pressure_systolic', 'blood_pressure_diastolic', 'heart_rate', 
                          'temperature', 'weight', 'oxygen_saturation', 'pain_level'];
    const hasNumeric = numericFields.some(field => {
      const value = vitals[field as keyof VitalSignsEntry];
      return value !== undefined && value !== null && value !== '';
    });
    const hasNotes = !!(vitals.notes && vitals.notes.trim().length > 0);
    return hasNumeric || hasNotes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate form has some data
    if (!hasValidData()) {
      setError('Please enter at least one vital sign measurement');
      return;
    }

    // Check for field errors
    const hasErrors = Object.values(fieldErrors).some(error => error);
    if (hasErrors) {
      setError('Please correct the highlighted errors before submitting');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for API - values are already numbers
      const vitalsData: VitalSignsEntry = {
        blood_pressure_systolic: vitals.blood_pressure_systolic,
        blood_pressure_diastolic: vitals.blood_pressure_diastolic,
        heart_rate: vitals.heart_rate,
        temperature: vitals.temperature,
        weight: vitals.weight,
        oxygen_saturation: vitals.oxygen_saturation,
        pain_level: vitals.pain_level,
        notes: vitals.notes || '',
        recorded_at: new Date().toISOString()
      };

      // THIS SAVES TO DATABASE AND WILL APPEAR IN VITALS HISTORY
      await patientService.recordVitalSigns(vitalsData);
      
      setSuccess(true);
      
      // Auto-redirect after success
      setTimeout(() => {
        router.push('/patient?tab=health');
      }, 2000);
      
    } catch (err) {
      console.error('Failed to record vitals:', err);
      setError(err instanceof Error ? err.message : 'Failed to save vital signs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getComparisonIndicator = (currentValue: number | undefined, previousValue: number | undefined) => {
    if (!currentValue || !previousValue) return null;
    
    const diff = currentValue - previousValue;
    if (Math.abs(diff) < 0.1) return null;
    
    return (
      <span className={`text-xs ml-2 ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
        ({diff > 0 ? '+' : ''}{diff.toFixed(1)})
      </span>
    );
  };

  const VitalInput = ({ 
    name, 
    label, 
    unit, 
    placeholder, 
    icon: Icon, 
    type = 'number',
    step = '0.1'
  }: {
    name: keyof VitalSignsEntry;
    label: string;
    unit?: string;
    placeholder: string;
    icon: React.ElementType;
    type?: string;
    step?: string;
  }) => (
    <div>
      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
        <Icon className="h-4 w-4 mr-2 text-blue-600" />
        {label} {unit && <span className="text-gray-500 ml-1">({unit})</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          step={type === 'number' ? step : undefined}
          placeholder={placeholder}
          value={vitals[name] || ''}
          onChange={(e) => handleInputChange(name, e.target.value)}
          onBlur={(e) => handleFieldBlur(name, e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            fieldErrors[name] ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {recentVitals && name !== 'notes' && getComparisonIndicator(
          parseFloat(vitals[name] as string) || undefined, 
          recentVitals[name] as number
        )}
      </div>
      {fieldErrors[name] && (
        <p className="text-red-600 text-xs mt-1 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {fieldErrors[name]}
        </p>
      )}
    </div>
  );

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
              {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                    <p className="text-green-800 font-medium">Vital signs recorded successfully!</p>
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
                  <h3 className="font-medium text-blue-900 mb-4 flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Blood Pressure
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <VitalInput
                      name="blood_pressure_systolic"
                      label="Systolic"
                      unit="mmHg"
                      placeholder="120"
                      icon={TrendingUp}
                    />
                    <VitalInput
                      name="blood_pressure_diastolic"
                      label="Diastolic"
                      unit="mmHg"
                      placeholder="80"
                      icon={Activity}
                    />
                  </div>
                </div>

                {/* Other Vitals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <VitalInput
                    name="heart_rate"
                    label="Heart Rate"
                    unit="bpm"
                    placeholder="72"
                    icon={Heart}
                  />
                  <VitalInput
                    name="temperature"
                    label="Temperature"
                    unit="°F"
                    placeholder="98.6"
                    icon={Thermometer}
                  />
                  <VitalInput
                    name="weight"
                    label="Weight"
                    unit="lbs"
                    placeholder="150"
                    icon={Scale}
                  />
                  <VitalInput
                    name="oxygen_saturation"
                    label="Oxygen Saturation"
                    unit="%"
                    placeholder="98"
                    icon={Droplets}
                  />
                </div>

                {/* Pain Level */}
                <VitalInput
                  name="pain_level"
                  label="Pain Level (0-10 scale)"
                  unit="0=no pain, 10=worst pain"
                  placeholder="0"
                  icon={AlertCircle}
                />

                {/* Notes */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Notes (optional)
                  </label>
                  <textarea
                    placeholder="Any additional notes about your current condition, symptoms, or context for these measurements..."
                    value={vitals.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Submit Button */}
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
                    disabled={loading || !hasValidData()}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Saving...' : 'Record Vitals'}
                  </button>
                </div>
              </form>
            </Card>
          </div>

          {/* Sidebar - Recent Vitals Comparison */}
          <div className="space-y-6">
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

            {/* Quick Tips */}
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