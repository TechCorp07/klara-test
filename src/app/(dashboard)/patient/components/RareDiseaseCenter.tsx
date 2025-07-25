// src/app/(dashboard)/patient/components/RareDiseaseCenter.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { patientService } from '@/lib/api/services/patient.service';

interface RareCondition {
  name: string;
  diagnosed_date: string;
  severity: 'mild' | 'moderate' | 'severe';
  specialist_provider?: string;
  orpha_code?: string;
  symptoms: string[];
  current_medications: string[];
  clinical_trials_eligible: number;
}

interface RareDiseaseCenterProps {
  rareConditions: RareCondition[];
}

export function RareDiseaseCenter({ rareConditions }: RareDiseaseCenterProps) {
  const [selectedCondition, setSelectedCondition] = useState<RareCondition | null>(null);
  const [familyHistory, setFamilyHistory] = useState<{
    immediate_family: { relationship: string; conditions: string[]; age_of_onset?: number; notes?: string }[];
    extended_family: { relationship: string; conditions: string[]; age_of_onset?: number; notes?: string }[];
    } | null>(null);
  const [isLoadingFamily, setIsLoadingFamily] = useState(false);

  useEffect(() => {
    if (rareConditions.length > 0) {
      setSelectedCondition(rareConditions[0]);
      loadFamilyHistory();
    }
  }, [rareConditions]);

  const loadFamilyHistory = async () => {
    try {
      setIsLoadingFamily(true);
      const history = await patientService.getFamilyMedicalHistory();
      setFamilyHistory(history);
    } catch (error) {
      console.error('Failed to load family history:', error);
    } finally {
      setIsLoadingFamily(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-50 border-green-200 text-green-800';
      case 'moderate': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'severe': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (!rareConditions.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Rare Disease Center</h2>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No rare conditions on record</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Rare Disease Center</h2>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive monitoring and support for rare conditions
        </p>
      </div>

      <div className="p-6">
        {/* Condition Selector */}
        {rareConditions.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Condition
            </label>
            <select
              value={selectedCondition?.name || ''}
              onChange={(e) => {
                const condition = rareConditions.find(c => c.name === e.target.value);
                setSelectedCondition(condition || null);
              }}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {rareConditions.map((condition) => (
                <option key={condition.name} value={condition.name}>
                  {condition.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedCondition && (
          <div className="space-y-6">
            {/* Condition Overview */}
            <div className={`rounded-lg p-4 border ${getSeverityColor(selectedCondition.severity)}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{selectedCondition.name}</h3>
                  {selectedCondition.orpha_code && (
                    <p className="text-sm">ORPHA Code: {selectedCondition.orpha_code}</p>
                  )}
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium capitalize">
                  {selectedCondition.severity}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium">Diagnosed</p>
                  <p className="text-sm">{new Date(selectedCondition.diagnosed_date).toLocaleDateString()}</p>
                </div>
                {selectedCondition.specialist_provider && (
                  <div>
                    <p className="text-sm font-medium">Specialist</p>
                    <p className="text-sm">{selectedCondition.specialist_provider}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Symptoms */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Current Symptoms</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCondition.symptoms.map((symptom, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Condition-Specific Medications</h4>
              <div className="space-y-2">
                {selectedCondition.current_medications.map((medication, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm font-medium">{medication}</span>
                    <button className="text-blue-600 text-xs hover:underline">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Trials */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-purple-900">Clinical Trials</h4>
                <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {selectedCondition.clinical_trials_eligible} eligible
                </span>
              </div>
              <p className="text-sm text-purple-700 mb-3">
                You may be eligible for clinical trials related to {selectedCondition.name}
              </p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors">
                Explore Clinical Trials
              </button>
            </div>

            {/* Family History */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Family Medical History</h4>
                <button 
                  onClick={() => window.location.href = '/patient/family-history'}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Update
                </button>
              </div>
              
              {isLoadingFamily ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : familyHistory ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">
                    ✓ Family history documented
                  </p>
                  <p className="text-xs text-gray-600">
                    Genetic counseling may be recommended
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Family medical history not yet documented
                  </p>
                  <button 
                    onClick={() => window.location.href = '/patient/family-history'}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Add Family History
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-blue-600 text-white p-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Schedule Specialist
              </button>
              <button className="bg-green-600 text-white p-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                Join Support Group
              </button>
              <button className="bg-purple-600 text-white p-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                Research Resources
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}