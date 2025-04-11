"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthcare } from '@/lib/services/healthcareService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const queryClient = useQueryClient();
  
  // Fetch medical records
  const { data: medicalRecords, isLoading, error } = useQuery({
    queryKey: ['medicalRecords', user?.id],
    queryFn: () => healthcare.getMedicalRecords(user?.id),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load medical records');
      console.error('Error fetching medical records:', error);
    }
  });
  
  // Fetch conditions for selected medical record
  const { data: conditions } = useQuery({
    queryKey: ['conditions', selectedRecord?.id],
    queryFn: () => healthcare.getConditions(selectedRecord?.id),
    enabled: !!selectedRecord,
    onError: (error) => {
      toast.error('Failed to load conditions');
      console.error('Error fetching conditions:', error);
    }
  });
  
  // Fetch allergies for selected medical record
  const { data: allergies } = useQuery({
    queryKey: ['allergies', selectedRecord?.id],
    queryFn: () => healthcare.getAllergies(selectedRecord?.id),
    enabled: !!selectedRecord,
    onError: (error) => {
      toast.error('Failed to load allergies');
      console.error('Error fetching allergies:', error);
    }
  });
  
  // Fetch medications for selected medical record
  const { data: medications } = useQuery({
    queryKey: ['medications', selectedRecord?.id],
    queryFn: () => healthcare.getMedications(selectedRecord?.id),
    enabled: !!selectedRecord,
    onError: (error) => {
      toast.error('Failed to load medications');
      console.error('Error fetching medications:', error);
    }
  });
  
  // Mutation for updating medical record
  const updateMedicalRecordMutation = useMutation({
    mutationFn: ({ id, data }) => healthcare.updateMedicalRecord(id, data),
    onSuccess: () => {
      toast.success('Medical record updated successfully');
      queryClient.invalidateQueries(['medicalRecords', user?.id]);
    },
    onError: (error) => {
      toast.error('Failed to update medical record');
      console.error('Error updating medical record:', error);
    }
  });
  
  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Medical Records</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Medical Records</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading medical records. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Medical Records</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Medical Records List */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Your Records</h2>
            
            {medicalRecords && medicalRecords.results && medicalRecords.results.length > 0 ? (
              <div className="space-y-4">
                {medicalRecords.results.map((record) => (
                  <div 
                    key={record.id} 
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedRecord?.id === record.id 
                        ? 'bg-blue-100 border border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                    onClick={() => handleRecordSelect(record)}
                  >
                    <p className="font-medium">Record #{record.medical_record_number}</p>
                    <p className="text-sm text-gray-600">
                      Last updated: {new Date(record.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No medical records found.</p>
            )}
          </div>
        </div>
        
        {/* Medical Record Details */}
        <div className="md:col-span-2">
          {selectedRecord ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Record #{selectedRecord.medical_record_number}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600">Date of Birth</p>
                  <p className="font-medium">{selectedRecord.date_of_birth}</p>
                </div>
                <div>
                  <p className="text-gray-600">Gender</p>
                  <p className="font-medium">{selectedRecord.gender}</p>
                </div>
                <div>
                  <p className="text-gray-600">Blood Type</p>
                  <p className="font-medium">{selectedRecord.blood_type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Height</p>
                  <p className="font-medium">{selectedRecord.height} cm</p>
                </div>
                <div>
                  <p className="text-gray-600">Weight</p>
                  <p className="font-medium">{selectedRecord.weight} kg</p>
                </div>
                <div>
                  <p className="text-gray-600">Ethnicity</p>
                  <p className="font-medium">{selectedRecord.ethnicity}</p>
                </div>
              </div>
              
              {/* Tabs for different sections */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Conditions
                  </button>
                  <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Allergies
                  </button>
                  <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Medications
                  </button>
                </nav>
              </div>
              
              {/* Conditions Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Conditions</h3>
                
                {conditions && conditions.results && conditions.results.length > 0 ? (
                  <div className="space-y-4">
                    {conditions.results.map((condition) => (
                      <div key={condition.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{condition.name}</p>
                            <p className="text-sm text-gray-600">
                              Status: <span className={`${condition.status === 'active' ? 'text-red-600' : 'text-green-600'}`}>
                                {condition.status}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Diagnosed: {new Date(condition.diagnosed_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            condition.is_primary 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {condition.is_primary ? 'Primary' : 'Secondary'}
                          </span>
                        </div>
                        
                        {condition.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">{condition.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No conditions recorded.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-full">
              <p className="text-gray-500">Select a medical record to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
