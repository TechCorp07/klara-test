// src/app/(dashboard)/patient/emergency/update/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle, Phone } from 'lucide-react';
import { patientService } from '@/lib/api/services/patient.service';

interface EmergencyInfo {
  medical_id: string;
  blood_type: string;
  allergies: string[];
  current_medications: string[];
  medical_conditions: string[];
  emergency_contacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    is_primary: boolean;
    can_make_decisions: boolean;
  }>;
  preferred_hospital: string;
  insurance_provider: string;
  insurance_id: string;
  physician_name: string;
  physician_phone: string;
  special_instructions: string;
  advance_directives: boolean;
  organ_donor: boolean;
  emergency_medications: string[];
  medical_devices: string[];
}

export default function UpdateEmergencyInfoPage() {
  const router = useRouter();
  const [info, setInfo] = useState<EmergencyInfo>({
    medical_id: '',
    blood_type: '',
    allergies: [],
    current_medications: [],
    medical_conditions: [],
    emergency_contacts: [
      {
        name: '',
        relationship: '',
        phone: '',
        is_primary: true,
        can_make_decisions: true
      }
    ],
    preferred_hospital: '',
    insurance_provider: '',
    insurance_id: '',
    physician_name: '',
    physician_phone: '',
    special_instructions: '',
    advance_directives: false,
    organ_donor: false,
    emergency_medications: [],
    medical_devices: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
  const commonAllergies = [
    'Penicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Codeine',
    'Latex', 'Peanuts', 'Shellfish', 'Eggs', 'Dairy', 'Contrast dye'
  ];

  const medicalDeviceOptions = [
    'Pacemaker', 'Insulin pump', 'Hearing aids', 'Prosthetics',
    'Feeding tube', 'Tracheostomy', 'Catheter', 'Shunt'
  ];

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    if (checked) {
      setInfo({...info, allergies: [...info.allergies, allergy]});
    } else {
      setInfo({...info, allergies: info.allergies.filter(a => a !== allergy)});
    }
  };

  const handleDeviceChange = (device: string, checked: boolean) => {
    if (checked) {
      setInfo({...info, medical_devices: [...info.medical_devices, device]});
    } else {
      setInfo({...info, medical_devices: info.medical_devices.filter(d => d !== device)});
    }
  };

  const addEmergencyContact = () => {
    setInfo({
      ...info,
      emergency_contacts: [
        ...info.emergency_contacts,
        {
          name: '',
          relationship: '',
          phone: '',
          is_primary: false,
          can_make_decisions: false
        }
      ]
    });
  };

  const removeEmergencyContact = (index: number) => {
    setInfo({
      ...info,
      emergency_contacts: info.emergency_contacts.filter((_, i) => i !== index)
    });
  };

  const updateEmergencyContact = (index: number, field: string, value: string | boolean) => {
    const updatedContacts = [...info.emergency_contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setInfo({ ...info, emergency_contacts: updatedContacts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Validate required fields
      if (!info.blood_type) {
        throw new Error('Blood type is required');
      }

      if (info.emergency_contacts.length === 0 || !info.emergency_contacts[0].name || !info.emergency_contacts[0].phone) {
        throw new Error('At least one emergency contact with name and phone number is required');
      }

      // Save emergency information to backend
      const result = await patientService.updateEmergencyInfo({
        medical_id: info.medical_id,
        blood_type: info.blood_type,
        allergies: info.allergies,
        current_medications: info.current_medications,
        medical_conditions: info.medical_conditions,
        emergency_contacts: info.emergency_contacts.filter(contact => contact.name && contact.phone),
        preferred_hospital: info.preferred_hospital,
        insurance_provider: info.insurance_provider,
        insurance_id: info.insurance_id,
        physician_name: info.physician_name,
        physician_phone: info.physician_phone,
        special_instructions: info.special_instructions,
        advance_directives: info.advance_directives,
        organ_donor: info.organ_donor,
        emergency_medications: info.emergency_medications,
        medical_devices: info.medical_devices
      });

      setSuccessMessage('Emergency information updated successfully!');
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        router.push('/patient?tab=care');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to update emergency info:', error);
      setError(error instanceof Error ? error.message : 'Failed to update emergency information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadExistingEmergencyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const emergencyData = await patientService.getEmergencyInfo();
      
      // Extract data from profile (main source of truth)
      if (emergencyData.profile) {
        const profile = emergencyData.profile as any;
        
        // Build emergency contacts array from profile data and additional contacts
        const contacts: any[] = [];
        
        // Add primary emergency contact from profile if exists
        if (profile.emergency_contact_name) {
          contacts.push({
            name: profile.emergency_contact_name,
            relationship: profile.emergency_contact_relationship || '',
            phone: profile.emergency_contact_phone || '',
            is_primary: true,
            can_make_decisions: true
          });
        }
        
        // Add additional emergency contacts if they exist and are an array
        if (Array.isArray(emergencyData.emergency_contacts)) {
          emergencyData.emergency_contacts.forEach(contact => {
            // Skip if this is the same as the primary contact
            if (contact.name !== profile.emergency_contact_name) {
              contacts.push({
                name: contact.name,
                relationship: contact.relationship,
                phone: contact.phone_primary || '',
                is_primary: contact.is_primary_contact || false,
                can_make_decisions: contact.can_make_medical_decisions || contact.can_make_decisions || false
              });
            }
          });
        }
        
        // Ensure we have at least one empty contact if none exist
        if (contacts.length === 0) {
          contacts.push({
            name: '',
            relationship: '',
            phone: '',
            is_primary: true,
            can_make_decisions: true
          });
        }
        
        // Populate form with existing data
        setInfo({
          medical_id: profile.medical_id || '',
          blood_type: profile.blood_type || '',
          allergies: profile.allergies ? profile.allergies.split(', ').filter(Boolean) : [],
          current_medications: profile.current_medications ? profile.current_medications.split(', ').filter(Boolean) : [],
          medical_conditions: profile.medical_conditions ? profile.medical_conditions.split(', ').filter(Boolean) : [],
          emergency_contacts: contacts,
          preferred_hospital: profile.preferred_hospital || '',
          insurance_provider: profile.insurance_provider || '',
          insurance_id: profile.insurance_id || '',
          physician_name: profile.physician_name || '',
          physician_phone: profile.physician_phone || '',
          special_instructions: profile.special_instructions || '',
          advance_directives: profile.advance_directives || false,
          organ_donor: profile.organ_donor || false,
          emergency_medications: profile.emergency_medications ? profile.emergency_medications.split(', ').filter(Boolean) : [],
          medical_devices: profile.medical_devices ? profile.medical_devices.split(', ').filter(Boolean) : []
        });
      }
    } catch (error) {
      console.error('Failed to load emergency data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load existing emergency information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExistingEmergencyData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading emergency information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-red-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Update Emergency Information</h1>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 mb-1">Critical for Emergency Care</h3>
                <p className="text-sm text-red-800">
                  This information is vital for first responders and emergency medical personnel. 
                  Keep it current and accurate, especially for rare disease conditions.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900 mb-1">Error</h3>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message Display */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-medium text-green-900 mb-1">Success</h3>
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
      
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Medical Info */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Medical Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical ID Number
                  </label>
                  <input
                    type="text"
                    value={info.medical_id}
                    onChange={(e) => setInfo({...info, medical_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Medical record number or ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Type *
                  </label>
                  <select
                    value={info.blood_type}
                    onChange={(e) => setInfo({...info, blood_type: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select blood type</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Allergies</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {commonAllergies.map((allergy) => (
                  <label key={allergy} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={info.allergies.includes(allergy)}
                      onChange={(e) => handleAllergyChange(allergy, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">{allergy}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Allergies
                </label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="List any other allergies not mentioned above..."
                />
              </div>
            </div>

            {/* Current Medications */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Medications</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List All Current Medications *
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Include medication name, dosage, frequency (e.g., Metformin 500mg twice daily)..."
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Medications (if applicable)
                </label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Rescue medications, EpiPens, inhalers, etc..."
                />
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Conditions</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Medical Conditions *
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Include rare diseases, chronic conditions, and any other relevant medical history..."
                  required
                />
              </div>
            </div>

            {/* Medical Devices */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Devices</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {medicalDeviceOptions.map((device) => (
                  <label key={device} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={info.medical_devices.includes(device)}
                      onChange={(e) => handleDeviceChange(device, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">{device}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Emergency Contacts</h3>
                <button
                  type="button"
                  onClick={addEmergencyContact}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  <Phone className="w-4 h-4 inline mr-1" />
                  Add Contact
                </button>
              </div>

              {info.emergency_contacts.map((contact, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-900">
                      Contact {index + 1}
                      {contact.is_primary && <span className="text-blue-600 text-sm ml-2">(Primary)</span>}
                    </h4>
                    {info.emergency_contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEmergencyContact(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship
                      </label>
                      <input
                        type="text"
                        value={contact.relationship}
                        onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="e.g., Spouse, Parent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={contact.is_primary}
                        onChange={(e) => updateEmergencyContact(index, 'is_primary', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Primary contact</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={contact.can_make_decisions}
                        onChange={(e) => updateEmergencyContact(index, 'can_make_decisions', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Can make medical decisions</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Healthcare Providers */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Healthcare Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Physician
                  </label>
                  <input
                    type="text"
                    value={info.physician_name}
                    onChange={(e) => setInfo({...info, physician_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Dr. Name, Specialty"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Physician Phone
                  </label>
                  <input
                    type="tel"
                    value={info.physician_phone}
                    onChange={(e) => setInfo({...info, physician_phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Hospital
                  </label>
                  <input
                    type="text"
                    value={info.preferred_hospital}
                    onChange={(e) => setInfo({...info, preferred_hospital: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    value={info.insurance_provider}
                    onChange={(e) => setInfo({...info, insurance_provider: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Special Instructions</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Emergency Instructions
                </label>
                <textarea
                  value={info.special_instructions}
                  onChange={(e) => setInfo({...info, special_instructions: e.target.value})}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Include any special handling instructions, communication preferences, or other important information for emergency responders..."
                />
              </div>

              <div className="flex space-x-6 mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={info.advance_directives}
                    onChange={(e) => setInfo({...info, advance_directives: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">I have advance directives on file</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={info.organ_donor}
                    onChange={(e) => setInfo({...info, organ_donor: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">I am an organ donor</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !info.blood_type}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Emergency Info'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}