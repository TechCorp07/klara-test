// File: /app/patient-profile/page.js

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { healthcare } from '../../lib/api';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';
import { format, parseISO } from 'date-fns';
import {
  FaFileMedical,
  FaPills,
  FaAllergies,
  FaHeartbeat,
  FaSyringe,
  FaFlask,
  FaExclamationTriangle,
  FaLock,
  FaDownload,
  FaPrint,
  FaShareAlt,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaUserMd
} from 'react-icons/fa';
import Link from 'next/link';

// HIPAA compliance banner component
const HIPAABanner = () => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <FaLock className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">HIPAA Protected Health Information</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              This page contains Protected Health Information (PHI) as defined by HIPAA regulations. 
              Access to this information is logged and monitored for compliance purposes.
            </p>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Last accessed: {format(new Date(), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Medical record section component
const MedicalRecordSection = ({ title, icon: Icon, children, onViewAll }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Icon className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          </div>
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

// Medication item component
const MedicationItem = ({ medication }) => {
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-md font-medium text-gray-900">{medication.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{medication.dosage} - {medication.frequency}</p>
          {medication.prescribing_provider_details && (
            <p className="text-sm text-gray-500 mt-1">
              Prescribed by Dr. {medication.prescribing_provider_details.first_name} {medication.prescribing_provider_details.last_name}
            </p>
          )}
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          medication.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {medication.active ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      <div className="mt-2 flex items-center text-sm text-gray-500">
        <FaCalendarAlt className="h-4 w-4 mr-1" />
        <span>Started: {format(parseISO(medication.start_date), 'MMM d, yyyy')}</span>
        {medication.end_date && (
          <>
            <span className="mx-1">•</span>
            <span>Ended: {format(parseISO(medication.end_date), 'MMM d, yyyy')}</span>
          </>
        )}
      </div>
      
      {medication.notes && (
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Notes:</span> {medication.notes}
        </p>
      )}
    </div>
  );
};

// Allergy item component
const AllergyItem = ({ allergy }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderate':
        return 'bg-orange-100 text-orange-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-md font-medium text-gray-900">{allergy.agent}</h3>
          <p className="text-sm text-gray-600 mt-1">Reaction: {allergy.reaction}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(allergy.severity)}`}>
          {allergy.severity.charAt(0).toUpperCase() + allergy.severity.slice(1)}
        </span>
      </div>
      
      <div className="mt-2 flex items-center text-sm text-gray-500">
        <FaCalendarAlt className="h-4 w-4 mr-1" />
        <span>Onset: {format(parseISO(allergy.onset_date), 'MMM d, yyyy')}</span>
      </div>
      
      {allergy.notes && (
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Notes:</span> {allergy.notes}
        </p>
      )}
    </div>
  );
};

// Condition item component
const ConditionItem = ({ condition }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-md font-medium text-gray-900">{condition.name}</h3>
          {condition.diagnosing_provider_details && (
            <p className="text-sm text-gray-500 mt-1">
              Diagnosed by Dr. {condition.diagnosing_provider_details.first_name} {condition.diagnosing_provider_details.last_name}
            </p>
          )}
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(condition.status)}`}>
          {condition.status.charAt(0).toUpperCase() + condition.status.slice(1)}
        </span>
      </div>
      
      <div className="mt-2 flex items-center text-sm text-gray-500">
        <FaCalendarAlt className="h-4 w-4 mr-1" />
        <span>Diagnosed: {format(parseISO(condition.diagnosed_date), 'MMM d, yyyy')}</span>
        {condition.resolved_date && (
          <>
            <span className="mx-1">•</span>
            <span>Resolved: {format(parseISO(condition.resolved_date), 'MMM d, yyyy')}</span>
          </>
        )}
      </div>
      
      {condition.notes && (
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Notes:</span> {condition.notes}
        </p>
      )}
    </div>
  );
};

// Immunization item component
const ImmunizationItem = ({ immunization }) => {
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-md font-medium text-gray-900">{immunization.vaccine}</h3>
          <p className="text-sm text-gray-600 mt-1">Administered by: {immunization.administered_by}</p>
        </div>
      </div>
      
      <div className="mt-2 flex items-center text-sm text-gray-500">
        <FaCalendarAlt className="h-4 w-4 mr-1" />
        <span>Date: {format(parseISO(immunization.date_administered), 'MMM d, yyyy')}</span>
        {immunization.lot_number && (
          <>
            <span className="mx-1">•</span>
            <span>Lot #: {immunization.lot_number}</span>
          </>
        )}
      </div>
      
      {immunization.notes && (
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Notes:</span> {immunization.notes}
        </p>
      )}
    </div>
  );
};

// Lab test item component
const LabTestItem = ({ labTest }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ordered':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-md font-medium text-gray-900">{labTest.name}</h3>
          {labTest.ordered_by_details && (
            <p className="text-sm text-gray-500 mt-1">
              Ordered by Dr. {labTest.ordered_by_details.first_name} {labTest.ordered_by_details.last_name}
            </p>
          )}
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(labTest.status)}`}>
          {labTest.status === 'in_progress' ? 'In Progress' : 
            labTest.status.charAt(0).toUpperCase() + labTest.status.slice(1)}
        </span>
      </div>
      
      <div className="mt-2 flex items-center text-sm text-gray-500">
        <FaCalendarAlt className="h-4 w-4 mr-1" />
        <span>Ordered: {format(parseISO(labTest.ordered_date), 'MMM d, yyyy')}</span>
        {labTest.completed_date && (
          <>
            <span className="mx-1">•</span>
            <span>Completed: {format(parseISO(labTest.completed_date), 'MMM d, yyyy')}</span>
          </>
        )}
      </div>
      
      {labTest.notes && (
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Notes:</span> {labTest.notes}
        </p>
      )}
      
      {labTest.status === 'completed' && (
        <div className="mt-2">
          <Link 
            href={`/medical-records/lab-results/${labTest.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View Results
          </Link>
        </div>
      )}
    </div>
  );
};

// Empty state component
const EmptyState = ({ title, description, icon: Icon }) => {
  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-md font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [medications, setMedications] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [immunizations, setImmunizations] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchMedicalRecordData = async () => {
      try {
        // Fetch medical record for the patient
        const medicalRecords = await healthcare.getMedicalRecords(user.id);
        
        if (medicalRecords.length === 0) {
          setError('No medical record found for this patient.');
          setLoading(false);
          return;
        }
        
        const record = medicalRecords[0];
        setMedicalRecord(record);
        
        // Fetch medications
        const medicationsData = await healthcare.getMedications(record.id);
        setMedications(medicationsData);
        
        // Fetch allergies
        const allergiesData = await healthcare.getAllergies(record.id);
        setAllergies(allergiesData);
        
        // Fetch conditions
        const conditionsData = await healthcare.getConditions(record.id);
        setConditions(conditionsData);
        
        // Fetch immunizations
        const immunizationsData = await healthcare.getImmunizations(record.id);
        setImmunizations(immunizationsData);
        
        // Fetch lab tests
        const labTestsData = await healthcare.getLabTests(record.id);
        setLabTests(labTestsData);
      } catch (error) {
        console.error('Error fetching medical record data:', error);
        setError('Failed to load medical record data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedicalRecordData();
  }, [user.id]);
  
  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          
          <div className="flex space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaFilter className="mr-2 h-4 w-4 text-gray-500" />
              Filter
            </button>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaSearch className="mr-2 h-4 w-4 text-gray-500" />
              Search
            </button>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPrint className="mr-2 h-4 w-4 text-gray-500" />
              Print
            </button>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaDownload className="mr-2 h-4 w-4 text-gray-500" />
              Export
            </button>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaShareAlt className="mr-2 h-4 w-4" />
              Share
            </button>
          </div>
        </div>
        
        {/* HIPAA Compliance Banner */}
        <HIPAABanner />
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('medications')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'medications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Medications
            </button>
            
            <button
              onClick={() => setActiveTab('allergies')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'allergies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Allergies
            </button>
            
            <button
              onClick={() => setActiveTab('conditions')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'conditions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Conditions
            </button>
            
            <button
              onClick={() => setActiveTab('immunizations')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'immunizations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Immunizations
            </button>
            
            <button
              onClick={() => setActiveTab('lab_tests')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lab_tests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lab Tests
            </button>
          </nav>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Medications Section */}
            <MedicalRecordSection 
              title="Medications" 
              icon={FaPills}
              onViewAll={() => setActiveTab('medications')}
            >
              {medications.length === 0 ? (
                <EmptyState
                  title="No medications"
                  description="You don't have any medications on record."
                  icon={FaPills}
                />
              ) : (
                <div className="space-y-4">
                  {medications.slice(0, 3).map((medication) => (
                    <MedicationItem key={medication.id} medication={medication} />
                  ))}
                  {medications.length > 3 && (
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('medications')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View all {medications.length} medications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </MedicalRecordSection>
            
            {/* Allergies Section */}
            <MedicalRecordSection 
              title="Allergies" 
              icon={FaAllergies}
              onViewAll={() => setActiveTab('allergies')}
            >
              {allergies.length === 0 ? (
                <EmptyState
                  title="No allergies"
                  description="You don't have any allergies on record."
                  icon={FaAllergies}
                />
              ) : (
                <div className="space-y-4">
                  {allergies.slice(0, 3).map((allergy) => (
                    <AllergyItem key={allergy.id} allergy={allergy} />
                  ))}
                  {allergies.length > 3 && (
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('allergies')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View all {allergies.length} allergies
                      </button>
                    </div>
                  )}
                </div>
              )}
            </MedicalRecordSection>
            
            {/* Conditions Section */}
            <MedicalRecordSection 
              title="Conditions" 
              icon={FaHeartbeat}
              onViewAll={() => setActiveTab('conditions')}
            >
              {conditions.length === 0 ? (
                <EmptyState
                  title="No conditions"
                  description="You don't have any conditions on record."
                  icon={FaHeartbeat}
                />
              ) : (
                <div className="space-y-4">
                  {conditions.slice(0, 3).map((condition) => (
                    <ConditionItem key={condition.id} condition={condition} />
                  ))}
                  {conditions.length > 3 && (
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('conditions')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View all {conditions.length} conditions
                      </button>
                    </div>
                  )}
                </div>
              )}
            </MedicalRecordSection>
          </div>
        )}
        
        {activeTab === 'medications' && (
          <MedicalRecordSection title="Medications" icon={FaPills}>
            {medications.length === 0 ? (
              <EmptyState
                title="No medications"
                description="You don't have any medications on record."
                icon={FaPills}
              />
            ) : (
              <div className="space-y-4">
                {medications.map((medication) => (
                  <MedicationItem key={medication.id} medication={medication} />
                ))}
              </div>
            )}
          </MedicalRecordSection>
        )}
        
        {activeTab === 'allergies' && (
          <MedicalRecordSection title="Allergies" icon={FaAllergies}>
            {allergies.length === 0 ? (
              <EmptyState
                title="No allergies"
                description="You don't have any allergies on record."
                icon={FaAllergies}
              />
            ) : (
              <div className="space-y-4">
                {allergies.map((allergy) => (
                  <AllergyItem key={allergy.id} allergy={allergy} />
                ))}
              </div>
            )}
          </MedicalRecordSection>
        )}
        
        {activeTab === 'conditions' && (
          <MedicalRecordSection title="Conditions" icon={FaHeartbeat}>
            {conditions.length === 0 ? (
              <EmptyState
                title="No conditions"
                description="You don't have any conditions on record."
                icon={FaHeartbeat}
              />
            ) : (
              <div className="space-y-4">
                {conditions.map((condition) => (
                  <ConditionItem key={condition.id} condition={condition} />
                ))}
              </div>
            )}
          </MedicalRecordSection>
        )}
        
        {activeTab === 'immunizations' && (
          <MedicalRecordSection title="Immunizations" icon={FaSyringe}>
            {immunizations.length === 0 ? (
              <EmptyState
                title="No immunizations"
                description="You don't have any immunizations on record."
                icon={FaSyringe}
              />
            ) : (
              <div className="space-y-4">
                {immunizations.map((immunization) => (
                  <ImmunizationItem key={immunization.id} immunization={immunization} />
                ))}
              </div>
            )}
          </MedicalRecordSection>
        )}
        
        {activeTab === 'lab_tests' && (
          <MedicalRecordSection title="Lab Tests" icon={FaFlask}>
            {labTests.length === 0 ? (
              <EmptyState
                title="No lab tests"
                description="You don't have any lab tests on record."
                icon={FaFlask}
              />
            ) : (
              <div className="space-y-4">
                {labTests.map((labTest) => (
                  <LabTestItem key={labTest.id} labTest={labTest} />
                ))}
              </div>
            )}
          </MedicalRecordSection>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
