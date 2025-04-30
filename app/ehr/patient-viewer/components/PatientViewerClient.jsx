"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ehrService } from '@/lib/services/ehr';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function EHRPatientViewer() {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [dataType, setDataType] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Fetch patient data
  const { 
    data: patientData, 
    isLoading: isLoadingPatient, 
    error: patientError,
    refetch: refetchPatient
  } = useQuery({
    queryKey: ['ehrPatient', patientId, dataType, dateRange],
    queryFn: () => ehrService.getPatientData(patientId, dataType),
    enabled: !!patientId,
    onError: (error) => {
      toast.error('Failed to load patient data');
      console.error('Error fetching patient data:', error);
    }
  });
  
  // Handle patient ID change
  const handlePatientIdChange = (e) => {
    setPatientId(e.target.value);
  };
  
  // Handle data type change
  const handleDataTypeChange = (e) => {
    setDataType(e.target.value);
  };
  
  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle fetch patient data
  const handleFetchPatient = () => {
    if (patientId) {
      refetchPatient();
    } else {
      toast.error('Please enter a patient ID');
    }
  };
  
  // Export patient data to FHIR
  const handleExportToFHIR = async () => {
    if (!patientId) {
      toast.error('Please enter a patient ID');
      return;
    }
    
    try {
      toast.info('Exporting patient data to FHIR...');
      const result = await ehrService.exportToFHIR(patientId);
      
      // Create a downloadable file
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient-${patientId}-fhir-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Patient data exported to FHIR successfully');
    } catch (error) {
      toast.error('Failed to export patient data to FHIR');
      console.error('Error exporting to FHIR:', error);
    }
  };
  
  // Render patient data section based on data type
  const renderPatientDataSection = () => {
    if (!patientData) return null;
    
    switch (dataType) {
      case 'medications':
        return renderMedications(patientData.medications);
      case 'allergies':
        return renderAllergies(patientData.allergies);
      case 'conditions':
        return renderConditions(patientData.conditions);
      case 'lab_results':
        return renderLabResults(patientData.lab_results);
      case 'vitals':
        return renderVitals(patientData.vitals);
      case 'encounters':
        return renderEncounters(patientData.encounters);
      case 'immunizations':
        return renderImmunizations(patientData.immunizations);
      case 'care_plans':
        return renderCarePlans(patientData.care_plans);
      case 'all':
      default:
        return (
          <div className="space-y-8">
            {patientData.demographics && renderDemographics(patientData.demographics)}
            {patientData.medications && renderMedications(patientData.medications)}
            {patientData.allergies && renderAllergies(patientData.allergies)}
            {patientData.conditions && renderConditions(patientData.conditions)}
            {patientData.lab_results && renderLabResults(patientData.lab_results)}
            {patientData.vitals && renderVitals(patientData.vitals)}
          </div>
        );
    }
  };
  
  // Render demographics section
  const renderDemographics = (demographics) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Patient Demographics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-medium">{demographics.first_name} {demographics.middle_name ? demographics.middle_name + ' ' : ''}{demographics.last_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Date of Birth</p>
          <p className="font-medium">{formatDate(demographics.date_of_birth)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Gender</p>
          <p className="font-medium">{demographics.gender}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">MRN</p>
          <p className="font-medium">{demographics.mrn}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Contact</p>
          <p className="font-medium">{demographics.phone || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{demographics.email || 'N/A'}</p>
        </div>
        {demographics.address && (
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">
              {demographics.address.street1}
              {demographics.address.street2 && `, ${demographics.address.street2}`}
              <br />
              {demographics.address.city}, {demographics.address.state} {demographics.address.zip_code}
            </p>
          </div>
        )}
      </div>
    </div>
  );
  
  // Render medications section
  const renderMedications = (medications) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Medications</h2>
      {medications && medications.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medication
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dosage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prescribed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medications.map((medication, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{medication.name}</div>
                    {medication.code && (
                      <div className="text-xs text-gray-500">{medication.code}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {medication.dosage} {medication.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {medication.frequency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      medication.status === 'active' ? 'bg-green-100 text-green-800' :
                      medication.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {medication.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(medication.prescribed_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No medications found.</p>
      )}
    </div>
  );
  
  // Render allergies section
  const renderAllergies = (allergies) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Allergies</h2>
      {allergies && allergies.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allergen
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reactions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Onset Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allergies.map((allergy, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{allergy.allergen}</div>
                    {allergy.code && (
                      <div className="text-xs text-gray-500">{allergy.code}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {allergy.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      allergy.severity === 'severe' ? 'bg-red-100 text-red-800' :
                      allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {allergy.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {allergy.reactions?.join(', ') || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(allergy.onset_date) || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No allergies found.</p>
      )}
    </div>
  );
  
  // Render conditions section
  const renderConditions = (conditions) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Conditions</h2>
      {conditions && conditions.length > 0 ? (
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
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Onset Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {conditions.map((condition, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{condition.name}</div>
                    {condition.code && (
                      <div className="text-xs text-gray-500">{condition.code}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      condition.status === 'active' ? 'bg-red-100 text-red-800' :
                      condition.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {condition.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {condition.category || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(condition.onset_date) || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(condition.last_updated) || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No conditions found.</p>
      )}
    </div>
  );
  
  // Render lab results section
  const renderLabResults = (labResults) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Lab Results</h2>
      {labResults && labResults.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference Range
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {labResults.map((lab, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{lab.test_name}</div>
                    {lab.code && (
                      <div className="text-xs text-gray-500">{lab.code}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lab.value} {lab.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lab.reference_range || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      lab.abnormal ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {lab.abnormal ? 'Abnormal' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lab.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No lab results found.</p>
      )}
    </div>
  );
  
  // Render vitals section
  const renderVitals = (vitals) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Vital Signs</h2>
      {vitals && vitals.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blood Pressure
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heart Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Respiratory Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temperature
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SpO2
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vitals.map((vital, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(vital.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vital.systolic}/{vital.diastolic} mmHg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vital.heart_rate} bpm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vital.respiratory_rate} /min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vital.temperature} °F
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vital.oxygen_saturation}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No vital signs found.</p>
      )}
    </div>
  );
  
  // Render encounters section
  const renderEncounters = (encounters) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Encounters</h2>
      {encounters && encounters.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {encounters.map((encounter, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(encounter.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {encounter.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {encounter.provider_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {encounter.location}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {encounter.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No encounters found.</p>
      )}
    </div>
  );
  
  // Render immunizations section
  const renderImmunizations = (immunizations) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Immunizations</h2>
      {immunizations && immunizations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vaccine
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dose
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {immunizations.map((immunization, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{immunization.vaccine}</div>
                    {immunization.code && (
                      <div className="text-xs text-gray-500">{immunization.code}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(immunization.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      immunization.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {immunization.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {immunization.dose_number || '1'} of {immunization.series_doses || '1'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {immunization.provider_name || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No immunizations found.</p>
      )}
    </div>
  );
  
  // Render care plans section
  const renderCarePlans = (carePlans) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Care Plans</h2>
      {carePlans && carePlans.length > 0 ? (
        <div className="space-y-6">
          {carePlans.map((plan, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{plan.title}</h3>
                  <p className="text-sm text-gray-500">
                    Created: {formatDate(plan.created_date)} | 
                    Status: <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      plan.status === 'active' ? 'bg-green-100 text-green-800' : 
                      plan.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>{plan.status}</span>
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {plan.category}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>
              
              {plan.goals && plan.goals.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Goals</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {plan.goals.map((goal, goalIndex) => (
                      <li key={goalIndex}>{goal.description}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {plan.activities && plan.activities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Activities</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {plan.activities.map((activity, activityIndex) => (
                      <li key={activityIndex}>{activity.description}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No care plans found.</p>
      )}
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">EHR Patient Viewer</h1>
        <Link href="/ehr/fhir-explorer" className="text-blue-600 hover:text-blue-800">
          Go to FHIR Explorer
        </Link>
      </div>
      
      {/* Patient selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
              Patient ID
            </label>
            <input
              type="text"
              id="patientId"
              value={patientId}
              onChange={handlePatientIdChange}
              placeholder="Enter patient ID"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 mb-1">
              Data Type
            </label>
            <select
              id="dataType"
              value={dataType}
              onChange={handleDataTypeChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Data</option>
              <option value="medications">Medications</option>
              <option value="allergies">Allergies</option>
              <option value="conditions">Conditions</option>
              <option value="lab_results">Lab Results</option>
              <option value="vitals">Vital Signs</option>
              <option value="encounters">Encounters</option>
              <option value="immunizations">Immunizations</option>
              <option value="care_plans">Care Plans</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleFetchPatient}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Fetch Patient Data
            </button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleExportToFHIR}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Export to FHIR
          </button>
        </div>
      </div>
      
      {/* Patient data display */}
      {isLoadingPatient ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : patientError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load patient data.</span>
        </div>
      ) : patientData ? (
        renderPatientDataSection()
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-center py-4">
            Enter a patient ID and click "Fetch Patient Data" to view patient information.
          </p>
        </div>
      )}
    </div>
  );
}
