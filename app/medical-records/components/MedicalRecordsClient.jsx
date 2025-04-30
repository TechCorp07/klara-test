"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { toast } from 'react-toastify';

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Fetch medical record data
    const fetchMedicalData = async () => {
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          setMedicalRecord({
            id: 1,
            medical_record_number: 'MRN12345',
            date_of_birth: '1980-01-01',
            gender: 'Male',
            blood_type: 'O+',
            height: 180.5,
            weight: 75.2,
            ethnicity: 'Caucasian',
            preferred_language: 'English',
            emergency_contact_name: 'Jane Doe',
            emergency_contact_phone: '+1234567890',
            emergency_contact_relationship: 'Spouse',
            primary_physician: 'Dr. Smith',
            has_rare_condition: true,
            data_sharing_authorized: true,
            research_participation_consent: false,
            created_at: '2023-01-10T14:30:00Z',
            updated_at: '2023-06-15T09:45:00Z'
          });
          
          setConditions([
            {
              id: 1,
              name: 'Hypertension',
              status: 'active',
              category: 'chronic',
              diagnosed_date: '2020-03-15',
              resolved_date: null,
              notes: 'Well controlled with medication',
              icd10_code: 'I10',
              is_primary: true,
              diagnosing_provider: 'Dr. Smith',
              is_rare_condition: false,
              biomarker_status: {
                blood_pressure: '140/90'
              },
              progression_metrics: {
                severity: 2,
                trend: 'improving'
              },
              last_assessment_date: '2023-05-10'
            },
            {
              id: 2,
              name: 'Type 2 Diabetes',
              status: 'active',
              category: 'chronic',
              diagnosed_date: '2019-06-22',
              resolved_date: null,
              notes: 'Managing with diet and medication',
              icd10_code: 'E11',
              is_primary: false,
              diagnosing_provider: 'Dr. Johnson',
              is_rare_condition: false,
              biomarker_status: {
                hba1c: '6.8%',
                fasting_glucose: '125 mg/dL'
              },
              progression_metrics: {
                severity: 2,
                trend: 'stable'
              },
              last_assessment_date: '2023-04-18'
            }
          ]);
          
          setAllergies([
            {
              id: 1,
              allergen: 'Penicillin',
              reaction: 'Rash, hives',
              severity: 'moderate',
              diagnosed_date: '2015-08-10',
              notes: 'Avoid all penicillin-based antibiotics'
            },
            {
              id: 2,
              allergen: 'Peanuts',
              reaction: 'Anaphylaxis',
              severity: 'severe',
              diagnosed_date: '2010-03-22',
              notes: 'Carries EpiPen'
            }
          ]);
          
          setMedications([
            {
              id: 1,
              name: 'Lisinopril',
              dosage: '10mg',
              frequency: 'Once daily',
              start_date: '2020-04-01',
              end_date: null,
              prescribed_by: 'Dr. Smith',
              purpose: 'Hypertension management',
              instructions: 'Take in the morning with food',
              refills_remaining: 2,
              pharmacy: 'City Pharmacy',
              side_effects: 'Occasional dry cough'
            },
            {
              id: 2,
              name: 'Metformin',
              dosage: '500mg',
              frequency: 'Twice daily',
              start_date: '2019-07-15',
              end_date: null,
              prescribed_by: 'Dr. Johnson',
              purpose: 'Diabetes management',
              instructions: 'Take with meals',
              refills_remaining: 3,
              pharmacy: 'City Pharmacy',
              side_effects: 'Mild stomach discomfort initially'
            }
          ]);
          
          setLabResults([
            {
              id: 1,
              test_name: 'Comprehensive Metabolic Panel',
              test_date: '2023-03-15',
              result_date: '2023-03-17',
              ordered_by: 'Dr. Smith',
              status: 'completed',
              results: {
                glucose: {
                  value: 118,
                  unit: 'mg/dL',
                  reference_range: '70-99',
                  flag: 'high'
                },
                creatinine: {
                  value: 0.9,
                  unit: 'mg/dL',
                  reference_range: '0.6-1.2',
                  flag: 'normal'
                },
                potassium: {
                  value: 4.2,
                  unit: 'mmol/L',
                  reference_range: '3.5-5.1',
                  flag: 'normal'
                },
                sodium: {
                  value: 140,
                  unit: 'mmol/L',
                  reference_range: '136-145',
                  flag: 'normal'
                }
              },
              notes: 'Overall results normal except for elevated glucose'
            },
            {
              id: 2,
              test_name: 'Lipid Panel',
              test_date: '2023-03-15',
              result_date: '2023-03-17',
              ordered_by: 'Dr. Smith',
              status: 'completed',
              results: {
                total_cholesterol: {
                  value: 195,
                  unit: 'mg/dL',
                  reference_range: '<200',
                  flag: 'normal'
                },
                hdl: {
                  value: 45,
                  unit: 'mg/dL',
                  reference_range: '>40',
                  flag: 'normal'
                },
                ldl: {
                  value: 130,
                  unit: 'mg/dL',
                  reference_range: '<100',
                  flag: 'high'
                },
                triglycerides: {
                  value: 150,
                  unit: 'mg/dL',
                  reference_range: '<150',
                  flag: 'borderline'
                }
              },
              notes: 'LDL cholesterol elevated, consider dietary changes'
            }
          ]);
          
          setVitalSigns([
            {
              id: 1,
              date: '2023-04-10',
              type: 'blood_pressure',
              value: '138/88',
              unit: 'mmHg',
              notes: 'Slightly elevated, continue monitoring',
              measured_by: 'Dr. Smith',
              measurement_method: 'office'
            },
            {
              id: 2,
              date: '2023-04-10',
              type: 'heart_rate',
              value: '72',
              unit: 'bpm',
              notes: 'Normal resting heart rate',
              measured_by: 'Dr. Smith',
              measurement_method: 'office'
            },
            {
              id: 3,
              date: '2023-04-10',
              type: 'temperature',
              value: '98.6',
              unit: '°F',
              notes: 'Normal',
              measured_by: 'Dr. Smith',
              measurement_method: 'office'
            },
            {
              id: 4,
              date: '2023-04-10',
              type: 'respiratory_rate',
              value: '16',
              unit: 'breaths/min',
              notes: 'Normal',
              measured_by: 'Dr. Smith',
              measurement_method: 'office'
            },
            {
              id: 5,
              date: '2023-04-10',
              type: 'oxygen_saturation',
              value: '98',
              unit: '%',
              notes: 'Normal',
              measured_by: 'Dr. Smith',
              measurement_method: 'office'
            }
          ]);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching medical data:', error);
        toast.error('Failed to load medical records');
        setIsLoading(false);
      }
    };

    fetchMedicalData();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <DashboardLayout 
        title="Medical Records" 
        subtitle="View and manage your health information"
        role={user?.role || 'patient'}
      >
        <div className="flex items-center justify-center h-64">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600">Loading medical records...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Medical Records" 
      subtitle="View and manage your health information"
      role={user?.role || 'patient'}
    >
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('overview')}
          >
            Overview
          </button>
          <button
            className={`${
              activeTab === 'conditions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('conditions')}
          >
            Conditions
          </button>
          <button
            className={`${
              activeTab === 'medications'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('medications')}
          >
            Medications
          </button>
          <button
            className={`${
              activeTab === 'allergies'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('allergies')}
          >
            Allergies
          </button>
          <button
            className={`${
              activeTab === 'lab-results'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('lab-results')}
          >
            Lab Results
          </button>
          <button
            className={`${
              activeTab === 'vital-signs'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('vital-signs')}
          >
            Vital Signs
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Patient Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and medical record information.</p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Medical Record Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{medicalRecord.medical_record_number}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(medicalRecord.date_of_birth)}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{medicalRecord.gender}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Blood Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{medicalRecord.blood_type}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Height</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{medicalRecord.height} cm</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Weight</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{medicalRecord.weight} kg</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Primary Physician</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{medicalRecord.primary_physician}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Emergency Contact</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {medicalRecord.emergency_contact_name} ({medicalRecord.emergency_contact_relationship}) - {medicalRecord.emergency_contact_phone}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Active Conditions</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {conditions.map((condition) => (
                  <li key={condition.id} className="px-4 py-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{condition.name}</p>
                        <p className="text-sm text-gray-500">Diagnosed: {formatDate(condition.diagnosed_date)}</p>
                      </div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        condition.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {condition.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Current Medications</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {medications.map((medication) => (
                  <li key={medication.id} className="px-4 py-4">
                    <p className="text-sm font-medium text-gray-900">{medication.name} {medication.dosage}</p>
                    <p className="text-sm text-gray-500">{medication.frequency} - {medication.instructions}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Allergies</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {allergies.map((allergy) => (
                  <li key={allergy.id} className="px-4 py-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{allergy.allergen}</p>
                        <p className="text-sm text-gray-500">Reaction: {allergy.reaction}</p>
                      </div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        allergy.severity === 'severe' ? 'bg-red-100 text-red-800' : 
                        allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {allergy.severity}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Vital Signs</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {vitalSigns.slice(0, 3).map((vital) => (
                  <li key={vital.id} className="px-4 py-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {vital.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(vital.date)}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{vital.value} {vital.unit}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'conditions' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Medical Conditions</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Comprehensive list of all diagnosed conditions.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosed Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conditions.map((condition) => (
                  <tr key={condition.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{condition.name}</div>
                          <div className="text-sm text-gray-500">ICD-10: {condition.icd10_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        condition.status === 'active' ? 'bg-green-100 text-green-800' : 
                        condition.status === 'resolved' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {condition.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(condition.diagnosed_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {condition.diagnosing_provider}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {condition.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Condition
            </button>
          </div>
        </div>
      )}

      {activeTab === 'medications' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Medications</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Current and past medications.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medication
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosage & Frequency
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prescribed By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refills
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medications.map((medication) => (
                  <tr key={medication.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{medication.name}</div>
                      <div className="text-sm text-gray-500">{medication.purpose}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medication.dosage}, {medication.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(medication.start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medication.prescribed_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medication.refills_remaining} remaining
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-4">
                        Request Refill
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Medication
            </button>
          </div>
        </div>
      )}

      {activeTab === 'allergies' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Allergies</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Known allergies and reactions.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allergen
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reaction
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosed Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allergies.map((allergy) => (
                  <tr key={allergy.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {allergy.allergen}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allergy.reaction}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        allergy.severity === 'severe' ? 'bg-red-100 text-red-800' : 
                        allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {allergy.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(allergy.diagnosed_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {allergy.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Allergy
            </button>
          </div>
        </div>
      )}

      {activeTab === 'lab-results' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Lab Results</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Laboratory test results and reports.</p>
          </div>
          <div className="overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              {labResults.map((labResult) => (
                <div key={labResult.id} className="mb-8 border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h4 className="text-base font-medium text-gray-900">{labResult.test_name}</h4>
                      <p className="text-sm text-gray-500">
                        Test Date: {formatDate(labResult.test_date)} | Result Date: {formatDate(labResult.result_date)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      labResult.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      labResult.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {labResult.status}
                    </span>
                  </div>
                  <div className="px-4 py-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Test
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Result
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reference Range
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(labResult.results).map(([key, value]) => (
                          <tr key={key}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {value.value} {value.unit}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {value.reference_range}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                value.flag === 'normal' ? 'bg-green-100 text-green-800' : 
                                value.flag === 'high' ? 'bg-red-100 text-red-800' : 
                                value.flag === 'low' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {value.flag}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {labResult.notes && (
                      <div className="mt-4 text-sm text-gray-500">
                        <strong>Notes:</strong> {labResult.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vital-signs' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Vital Signs</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Record of vital sign measurements.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vital Sign
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Measured By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vitalSigns.map((vital) => (
                  <tr key={vital.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(vital.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vital.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vital.value} {vital.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vital.measured_by} ({vital.measurement_method})
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {vital.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Vital Signs
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
