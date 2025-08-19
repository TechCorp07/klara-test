// src/app/(dashboard)/patient/medications/[id]/log/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { usePatientMedications } from '@/hooks/patient/usePatientMedications';
import { Card } from '@/components/ui/card';
import { FormButton, FormAlert } from '@/components/ui/common';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Pill,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  MessageSquare,
  Camera,
  Plus,
  Minus,
  Save,
  Timer,
  Activity,
  Heart,
  Thermometer,
  Loader2
} from 'lucide-react';
import type { Prescription } from '@/types/patient.types';

interface MedicationLogEntry {
  taken_time: string;
  taken: boolean;
  dosage_taken?: string;
  effectiveness_rating?: number;
  side_effects?: string[];
  notes?: string;
  mood_before?: number;
  mood_after?: number;
  symptoms_before?: string[];
  symptoms_after?: string[];
  food_taken_with?: boolean;
  missed_reason?: string;
}

export default function IndividualMedicationLogPage() {
  const router = useRouter();
  const params = useParams();
  const medicationId = Number(params.id);
  const { getUserRole } = useAuth();
  
  const { medications, logMedicationTaken } = usePatientMedications();
  
  const [medication, setMedication] = useState<Prescription | null>(null);
  const [logEntry, setLogEntry] = useState<MedicationLogEntry>({
    taken_time: new Date().toISOString().slice(0, 16),
    taken: true,
    effectiveness_rating: 3,
    mood_before: 3,
    mood_after: 3,
    food_taken_with: false,
    side_effects: [],
    symptoms_before: [],
    symptoms_after: []
  });
  
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Role validation
  const userRole = getUserRole();
  useEffect(() => {
    if (userRole && userRole !== 'patient') {
      router.push(`/${userRole}`);
      return;
    }
  }, [userRole, router]);

  useEffect(() => {
    const med = medications.find(m => m.id === medicationId);
    setMedication(med || null);
  }, [medications, medicationId]);

  const handleSubmit = async () => {
    if (!medication) return;

    setLoading(true);
    setErrorMessage(null);
    
    try {
      await logMedicationTaken(
        medicationId,
        logEntry.taken_time,
        JSON.stringify({
          effectiveness_rating: logEntry.effectiveness_rating,
          side_effects: logEntry.side_effects,
          notes: logEntry.notes,
          mood_before: logEntry.mood_before,
          mood_after: logEntry.mood_after,
          symptoms_before: logEntry.symptoms_before,
          symptoms_after: logEntry.symptoms_after,
          food_taken_with: logEntry.food_taken_with,
          dosage_taken: logEntry.dosage_taken,
          missed_reason: logEntry.missed_reason
        })
      );
      
      setSuccessMessage('Medication logged successfully!');
      setTimeout(() => {
        router.push('/patient/medications');
      }, 2000);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to log medication';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSideEffect = (effect: string) => {
    if (effect && !logEntry.side_effects?.includes(effect)) {
      setLogEntry(prev => ({
        ...prev,
        side_effects: [...(prev.side_effects || []), effect]
      }));
    }
  };

  const handleRemoveSideEffect = (effect: string) => {
    setLogEntry(prev => ({
      ...prev,
      side_effects: prev.side_effects?.filter(e => e !== effect) || []
    }));
  };

  const handleAddSymptom = (symptom: string, type: 'before' | 'after') => {
    if (symptom) {
      const key = type === 'before' ? 'symptoms_before' : 'symptoms_after';
      const currentSymptoms = logEntry[key] || [];
      if (!currentSymptoms.includes(symptom)) {
        setLogEntry(prev => ({
          ...prev,
          [key]: [...currentSymptoms, symptom]
        }));
      }
    }
  };

  const handleRemoveSymptom = (symptom: string, type: 'before' | 'after') => {
    const key = type === 'before' ? 'symptoms_before' : 'symptoms_after';
    setLogEntry(prev => ({
      ...prev,
      [key]: prev[key]?.filter(s => s !== symptom) || []
    }));
  };

  const commonSideEffects = [
    'Nausea', 'Dizziness', 'Fatigue', 'Headache', 'Drowsiness', 
    'Stomach upset', 'Dry mouth', 'Constipation', 'Diarrhea', 'Insomnia'
  ];

  const commonSymptoms = [
    'Pain', 'Fever', 'Nausea', 'Fatigue', 'Dizziness', 'Headache',
    'Muscle aches', 'Joint pain', 'Shortness of breath', 'Anxiety'
  ];

  if (!medication) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Medication Not Found</h2>
            <p className="text-gray-600 mb-4">The medication you're trying to log doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Log Medication</h1>
            <p className="text-gray-600">{medication.medication.name} • {medication.dosage}</p>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <FormAlert type="success" message={successMessage} dismissible onDismiss={() => setSuccessMessage(null)} />
        )}

        {errorMessage && (
          <FormAlert type="error" message={errorMessage} dismissible onDismiss={() => setErrorMessage(null)} />
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="radio"
                    name="taken"
                    checked={logEntry.taken}
                    onChange={() => setLogEntry(prev => ({ ...prev, taken: true }))}
                    className="text-green-600"
                  />
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">I took this medication</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="taken"
                    checked={!logEntry.taken}
                    onChange={() => setLogEntry(prev => ({ ...prev, taken: false }))}
                    className="text-red-600"
                  />
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-900">I missed this dose</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  When did you take it?
                </label>
                <input
                  type="datetime-local"
                  value={logEntry.taken_time}
                  onChange={(e) => setLogEntry(prev => ({ ...prev, taken_time: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {!logEntry.taken && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why did you miss this dose?
                </label>
                <select
                  value={logEntry.missed_reason || ''}
                  onChange={(e) => setLogEntry(prev => ({ ...prev, missed_reason: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select a reason</option>
                  <option value="forgot">Forgot to take it</option>
                  <option value="side_effects">Experienced side effects</option>
                  <option value="feeling_better">Feeling better</option>
                  <option value="ran_out">Ran out of medication</option>
                  <option value="travel">Traveling/not at home</option>
                  <option value="cost">Cost concerns</option>
                  <option value="other">Other reason</option>
                </select>
              </div>
            )}

            {logEntry.taken && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage taken (if different from prescribed)
                  </label>
                  <input
                    type="text"
                    placeholder={medication.dosage}
                    value={logEntry.dosage_taken || ''}
                    onChange={(e) => setLogEntry(prev => ({ ...prev, dosage_taken: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={logEntry.food_taken_with}
                      onChange={(e) => setLogEntry(prev => ({ ...prev, food_taken_with: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Taken with food</span>
                  </label>
                </div>
              </div>
            )}
          </Card>

          {/* Effectiveness and Mood (only if taken) */}
          {logEntry.taken && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Effectiveness & Mood</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How effective was this medication? (1-5 scale)
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setLogEntry(prev => ({ ...prev, effectiveness_rating: rating }))}
                        className={`p-2 ${
                          (logEntry.effectiveness_rating || 0) >= rating
                            ? 'text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      >
                        <Star className="w-6 h-6" fill="currentColor" />
                      </button>
                    ))}
                    <span className="ml-4 text-sm text-gray-600">
                      {logEntry.effectiveness_rating === 1 && 'Not effective'}
                      {logEntry.effectiveness_rating === 2 && 'Slightly effective'}
                      {logEntry.effectiveness_rating === 3 && 'Moderately effective'}
                      {logEntry.effectiveness_rating === 4 && 'Very effective'}
                      {logEntry.effectiveness_rating === 5 && 'Extremely effective'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Mood before taking (1-5 scale)
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((mood) => (
                        <button
                          key={mood}
                          onClick={() => setLogEntry(prev => ({ ...prev, mood_before: mood }))}
                          className={`w-8 h-8 rounded-full border-2 ${
                            (logEntry.mood_before || 0) >= mood
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-gray-300 text-gray-400'
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Mood after taking (1-5 scale)
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((mood) => (
                        <button
                          key={mood}
                          onClick={() => setLogEntry(prev => ({ ...prev, mood_after: mood }))}
                          className={`w-8 h-8 rounded-full border-2 ${
                            (logEntry.mood_after || 0) >= mood
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 text-gray-400'
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Symptoms Tracking */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Symptoms Tracking</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Symptoms before medication</h3>
                <div className="space-y-2 mb-4">
                  {(logEntry.symptoms_before || []).map((symptom, index) => (
                    <div key={index} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded">
                      <span className="text-sm text-red-800">{symptom}</span>
                      <button
                        onClick={() => handleRemoveSymptom(symptom, 'before')}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => handleAddSymptom(symptom, 'before')}
                      disabled={logEntry.symptoms_before?.includes(symptom)}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Symptoms after medication</h3>
                <div className="space-y-2 mb-4">
                  {(logEntry.symptoms_after || []).map((symptom, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                      <span className="text-sm text-green-800">{symptom}</span>
                      <button
                        onClick={() => handleRemoveSymptom(symptom, 'after')}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => handleAddSymptom(symptom, 'after')}
                      disabled={logEntry.symptoms_after?.includes(symptom)}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Side Effects (only if taken) */}
          {logEntry.taken && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Side Effects</h2>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {(logEntry.side_effects || []).map((effect, index) => (
                    <div key={index} className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
                      <span className="text-sm">{effect}</span>
                      <button
                        onClick={() => handleRemoveSideEffect(effect)}
                        className="ml-2 text-yellow-600 hover:text-yellow-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Common side effects (click to add):</p>
                  <div className="flex flex-wrap gap-2">
                    {commonSideEffects.map((effect) => (
                      <button
                        key={effect}
                        onClick={() => handleAddSideEffect(effect)}
                        disabled={logEntry.side_effects?.includes(effect)}
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3 inline mr-1" />
                        {effect}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Additional Notes */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Notes</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Notes (optional)
              </label>
              <textarea
                value={logEntry.notes || ''}
                onChange={(e) => setLogEntry(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional observations, questions, or concerns..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <FormButton
              onClick={handleSubmit}
              isLoading={loading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Log Medication
            </FormButton>
          </div>
        </div>
      </div>
    </div>
  );
}