'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { healthcare } from '../../lib/api';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';
import { format } from 'date-fns';
import {
  FaFileMedical,
  FaCapsules,
  FaAllergies,
  FaStethoscope,
  FaSyringe,
  FaFlask,
  FaHeartbeat,
  FaUserMd,
  FaExclamationTriangle,
} from 'react-icons/fa';

// Medical record section card component
const SectionCard = ({ title, icon: Icon, count, href, children }) => {
  return (
    <Link href={href} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-blue-100 text-blue-500">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="ml-4 text-lg font-medium text-gray-900">{title}</h3>
          </div>
          {count !== undefined && (
            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-sm font-medium">
              {count}
            </span>
          )}
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </Link>
  );
};

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [medications, setMedications] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [labTests, setLabTests] = useState([]);
  
  useEffect(() => {
    const fetchMedicalRecordData = async () => {
      try {
        // Fetch medical record for the patient
        const medicalRecords = await healthcare.getMedicalRecords(user.id);
        
        if (medicalRecords.length === 0) {
          setLoading(false);
          return;
        }
        
        const record = medicalRecords[0];
        setMedicalRecord(record);
        
        // Fetch related data
        const [medicationsData, allergiesData, conditionsData, vitalsData, labTestsData] = await Promise.all([
          healthcare.getMedications(record.id),
          healthcare.getAllergies(record.id),
          healthcare.getConditions(record.id),
          healthcare.getVitalSigns(record.id),
          healthcare.getLabTests(record.id),
        ]);
        
        setMedications(medicationsData);
        setAllergies(allergiesData);
        setConditions(conditionsData);
        setVitals(vitalsData);
        setLabTests(labTestsData);
      } catch (error) {
        console.error('Error fetching medical record data:', error);
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
  
  if (!medicalRecord) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No medical record found. Please contact your healthcare provider to set up your medical record.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  // Get the most recent vital signs
  const recentVitals = vitals.length > 0
    ? vitals.sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at)).slice(0, 1)[0]
    : null;
  
  // Get pending lab tests
  const pendingLabTests = labTests.filter(test => test.status === 'pending');
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Medical Record</h1>
          <div className="text-sm text-gray-500">
            Medical Record #: <span className="font-medium">{medicalRecord.medical_record_number}</span>
          </div>
        </div>
        
        {/* Medical Record Overview */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(medicalRecord.date_of_birth), 'MMMM d, yyyy')}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {medicalRecord.gender}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {medicalRecord.blood_type || 'Not recorded'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Height</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {medicalRecord.height ? `${medicalRecord.height} cm` : 'Not recorded'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Weight</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {medicalRecord.weight ? `${medicalRecord.weight} kg` : 'Not recorded'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Primary Physician</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {medicalRecord.primary_physician_details 
                    ? `Dr. ${medicalRecord.primary_physician_details.first_name} ${medicalRecord.primary_physician_details.last_name}`
                    : 'Not assigned'}
                </p>
              </div>
            </div>
            
            {recentVitals && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Vital Signs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-md">
                  {recentVitals.blood_pressure && (
                    <div>
                      <span className="text-xs text-gray-500">Blood Pressure</span>
                      <p className="text-sm font-medium">{recentVitals.blood_pressure}</p>
                    </div>
                  )}
                  
                  {recentVitals.heart_rate && (
                    <div>
                      <span className="text-xs text-gray-500">Heart Rate</span>
                      <p className="text-sm font-medium">{recentVitals.heart_rate} bpm</p>
                    </div>
                  )}
                  
                  {recentVitals.temperature && (
                    <div>
                      <span className="text-xs text-gray-500">Temperature</span>
                      <p className="text-sm font-medium">{recentVitals.temperature} °C</p>
                    </div>
                  )}
                  
                  {recentVitals.respiratory_rate && (
                    <div>
                      <span className="text-xs text-gray-500">Respiratory Rate</span>
                      <p className="text-sm font-medium">{recentVitals.respiratory_rate} breaths/min</p>
                    </div>
                  )}
                  
                  {recentVitals.oxygen_saturation && (
                    <div>
                      <span className="text-xs text-gray-500">Oxygen Saturation</span>
                      <p className="text-sm font-medium">{recentVitals.oxygen_saturation}%</p>
                    </div>
                  )}
                  
                  <div className="col-span-full text-xs text-right text-gray-500">
                    Measured on {format(new Date(recentVitals.measured_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Medical Record Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard
            title="Medications"
            icon={FaCapsules}
            count={medications.length}
            href="/medical-records/medications"
          >
            {medications.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {medications.slice(0, 3).map((medication) => (
                  <li key={medication.id} className="py-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">{medication.name}</span>
                      {medication.active ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{medication.dosage}, {medication.frequency}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No medications recorded</p>
            )}
          </SectionCard>
          
          <SectionCard
            title="Allergies"
            icon={FaAllergies}
            count={allergies.length}
            href="/medical-records/allergies"
          >
            {allergies.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {allergies.slice(0, 3).map((allergy) => (
                  <li key={allergy.id} className="py-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">{allergy.agent}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        allergy.severity === 'severe' ? 'bg-red-100 text-red-800' :
                        allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {allergy.severity.charAt(0).toUpperCase() + allergy.severity.slice(1)}
                      </span>
                    </div>
                    {allergy.reaction && (
                      <p className="text-sm text-gray-500">Reaction: {allergy.reaction}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No allergies recorded</p>
            )}
          </SectionCard>
          
          <SectionCard
            title="Conditions"
            icon={FaStethoscope}
            count={conditions.length}
            href="/medical-records/conditions"
          >
            {conditions.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {conditions.slice(0, 3).map((condition) => (
                  <li key={condition.id} className="py-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">{condition.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        condition.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                        condition.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {condition.status.charAt(0).toUpperCase() + condition.status.slice(1)}
                      </span>
                    </div>
                    {condition.diagnosed_date && (
                      <p className="text-sm text-gray-500">
                        Diagnosed: {format(new Date(condition.diagnosed_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No conditions recorded</p>
            )}
          </SectionCard>
          
          <SectionCard
            title="Lab Tests"
            icon={FaFlask}
            count={labTests.length}
            href="/medical-records/lab-results"
          >
            {labTests.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {labTests.slice(0, 3).map((test) => (
                  <li key={test.id} className="py-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">{test.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        test.status === 'completed' ? 'bg-green-100 text-green-800' :
                        test.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </span>
                    </div>
                    {test.ordered_date && (
                      <p className="text-sm text-gray-500">
                        Ordered: {format(new Date(test.ordered_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No lab tests recorded</p>
            )}
          </SectionCard>
        </div>
        
        {/* More sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <SectionCard
            title="Immunizations"
            icon={FaSyringe}
            href="/medical-records/immunizations"
          />
          
          <SectionCard
            title="Vital Signs"
            icon={FaHeartbeat}
            href="/medical-records/vital-signs"
          />
          
          <SectionCard
            title="Medical Notes"
            icon={FaFileMedical}
            href="/medical-records/medical-notes"
          />
        </div>
        
        {/* Alert for pending lab tests */}
        {pendingLabTests.length > 0 && (
          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You have {pendingLabTests.length} pending lab test{pendingLabTests.length !== 1 ? 's' : ''}.
                </p>
                <div className="mt-2">
                  <Link
                    href="/medical-records/lab-results"
                    className="text-sm font-medium text-yellow-700 hover:text-yellow-600"
                  >
                    View lab tests &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
