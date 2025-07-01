// src/app/(dashboard)/patient/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatientProfile } from '@/hooks/patient/usePatientProfile';
import { FormInput, FormButton, FormAlert } from '@/components/auth/common';
import { Spinner } from '@/components/ui/spinner';
import type { PatientProfile, PatientPreferences, EmergencyContact } from '@/types/patient.types';

// Validation schemas
const profileSchema = z.object({
  user: z.object({
    first_name: z.string().min(1, 'First name is required').max(50),
    last_name: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Valid email is required'),
    phone_number: z.string().optional(),
  }),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['M', 'F', 'O', 'P']),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'ZIP code is required'),
  emergency_contact_name: z.string().min(1, 'Emergency contact name is required'),
  emergency_contact_phone: z.string().min(1, 'Emergency contact phone is required'),
  insurance_provider: z.string().optional(),
  insurance_policy_number: z.string().optional(),
  primary_care_provider: z.string().optional(),
  preferred_language: z.string().min(1, 'Preferred language is required'),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone_primary: z.string().min(1, 'Primary phone is required'),
  phone_secondary: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  can_make_medical_decisions: z.boolean(),
  power_of_attorney: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;

export default function PatientProfilePage() {
  const { profile, preferences, loading, error, updateProfile, updatePreferences } = usePatientProfile();
  
  const [activeTab, setActiveTab] = useState<'personal' | 'emergency' | 'preferences' | 'privacy'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Emergency contact form
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);

  const emergencyForm = useForm<EmergencyContactFormData>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      can_make_medical_decisions: false,
      power_of_attorney: false,
    },
  });

  // Communication preferences
  const [communicationPrefs, setCommunicationPrefs] = useState({
    email_reminders: true,
    sms_reminders: true,
    phone_calls: false,
    appointment_reminders: true,
    medication_reminders: true,
    lab_result_notifications: true,
    marketing_communications: false,
    research_invitations: false,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    share_with_family: false,
    research_participation: false,
    marketing_communications: false,
    directory_listing: false,
    photo_consent: false,
    share_data_for_research: false,
    allow_family_access: false,
  });

  // Load profile data
  useEffect(() => {
    if (profile) {
      profileForm.reset(profile);
      
      // Set communication preferences
      if (profile.communication_preferences) {
        setCommunicationPrefs(prev => ({
          ...prev,
          ...profile.communication_preferences,
        }));
      }
      
      // Set privacy settings
      if (profile.privacy_settings) {
        setPrivacySettings(prev => ({
          ...prev,
          ...profile.privacy_settings,
        }));
      }
    }
  }, [profile, profileForm]);

  // Handle profile update
  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      setSaveError(null);
      await updateProfile(data);
      setSaveMessage('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  // Handle emergency contact operations
  const onSubmitEmergencyContact = async (data: EmergencyContactFormData) => {
    try {
      setSaveError(null);
      // This would call the emergency contact API
      console.log('Emergency contact data:', data);
      setSaveMessage('Emergency contact saved successfully');
      setShowAddContact(false);
      setEditingContactId(null);
      emergencyForm.reset();
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save emergency contact');
    }
  };

  // Handle preferences update
  const handlePreferencesUpdate = async () => {
    try {
      setSaveError(null);
      await updatePreferences({
        communication: communicationPrefs,
        privacy: privacySettings,
      } as any);
      setSaveMessage('Preferences updated successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading your profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Profile</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your personal information, emergency contacts, and privacy preferences.
        </p>
      </div>

      {/* Success/Error Messages */}
      {saveMessage && (
        <FormAlert type="success" message={saveMessage} className="mb-6" />
      )}
      {saveError && (
        <FormAlert type="error" message={saveError} className="mb-6" />
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'personal', label: 'Personal Information' },
              { key: 'emergency', label: 'Emergency Contacts' },
              { key: 'preferences', label: 'Communication' },
              { key: 'privacy', label: 'Privacy Settings' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Personal Information Tab */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="First Name"
                  type="text"
                  {...profileForm.register('user.first_name')}
                  error={profileForm.formState.errors.user?.first_name?.message}
                  disabled={!isEditing}
                />
                <FormInput
                  label="Last Name"
                  type="text"
                  {...profileForm.register('user.last_name')}
                  error={profileForm.formState.errors.user?.last_name?.message}
                  disabled={!isEditing}
                />
                <FormInput
                  label="Email"
                  type="email"
                  {...profileForm.register('user.email')}
                  error={profileForm.formState.errors.user?.email?.message}
                  disabled={!isEditing}
                />
                <FormInput
                  label="Phone Number"
                  type="tel"
                  {...profileForm.register('user.phone_number')}
                  error={profileForm.formState.errors.user?.phone_number?.message}
                  disabled={!isEditing}
                />
                <FormInput
                  label="Date of Birth"
                  type="date"
                  {...profileForm.register('date_of_birth')}
                  error={profileForm.formState.errors.date_of_birth?.message}
                  disabled={!isEditing}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    {...profileForm.register('gender')}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                    <option value="P">Prefer not to say</option>
                  </select>
                  {profileForm.formState.errors.gender && (
                    <p className="text-red-600 text-sm mt-1">{profileForm.formState.errors.gender.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Address</h3>
              <div className="space-y-4">
                <FormInput
                  label="Street Address"
                  type="text"
                  {...profileForm.register('address')}
                  error={profileForm.formState.errors.address?.message}
                  disabled={!isEditing}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="City"
                    type="text"
                    {...profileForm.register('city')}
                    error={profileForm.formState.errors.city?.message}
                    disabled={!isEditing}
                  />
                  <FormInput
                    label="State"
                    type="text"
                    {...profileForm.register('state')}
                    error={profileForm.formState.errors.state?.message}
                    disabled={!isEditing}
                  />
                  <FormInput
                    label="ZIP Code"
                    type="text"
                    {...profileForm.register('zip_code')}
                    error={profileForm.formState.errors.zip_code?.message}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Healthcare Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Healthcare Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Primary Care Provider"
                  type="text"
                  {...profileForm.register('primary_care_provider')}
                  error={profileForm.formState.errors.primary_care_provider?.message}
                  disabled={!isEditing}
                />
                <FormInput
                  label="Insurance Provider"
                  type="text"
                  {...profileForm.register('insurance_provider')}
                  error={profileForm.formState.errors.insurance_provider?.message}
                  disabled={!isEditing}
                />
                <FormInput
                  label="Insurance Policy Number"
                  type="text"
                  {...profileForm.register('insurance_policy_number')}
                  error={profileForm.formState.errors.insurance_policy_number?.message}
                  disabled={!isEditing}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                  <select
                    {...profileForm.register('preferred_language')}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <FormButton
                  type="submit"
                  loading={profileForm.formState.isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </FormButton>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Emergency Contacts Tab */}
      {activeTab === 'emergency' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Emergency Contacts</h2>
            <button
              onClick={() => setShowAddContact(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Contact
            </button>
          </div>

          {/* Emergency Contact Form */}
          {(showAddContact || editingContactId) && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                {editingContactId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </h3>
              
              <form onSubmit={emergencyForm.handleSubmit(onSubmitEmergencyContact)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Full Name"
                    type="text"
                    {...emergencyForm.register('name')}
                    error={emergencyForm.formState.errors.name?.message}
                  />
                  <FormInput
                    label="Relationship"
                    type="text"
                    placeholder="e.g., Spouse, Parent, Sibling"
                    {...emergencyForm.register('relationship')}
                    error={emergencyForm.formState.errors.relationship?.message}
                  />
                  <FormInput
                    label="Primary Phone"
                    type="tel"
                    {...emergencyForm.register('phone_primary')}
                    error={emergencyForm.formState.errors.phone_primary?.message}
                  />
                  <FormInput
                    label="Secondary Phone (Optional)"
                    type="tel"
                    {...emergencyForm.register('phone_secondary')}
                    error={emergencyForm.formState.errors.phone_secondary?.message}
                  />
                  <FormInput
                    label="Email (Optional)"
                    type="email"
                    {...emergencyForm.register('email')}
                    error={emergencyForm.formState.errors.email?.message}
                  />
                </div>
                
                <FormInput
                  label="Address (Optional)"
                  type="text"
                  {...emergencyForm.register('address')}
                  error={emergencyForm.formState.errors.address?.message}
                />

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...emergencyForm.register('can_make_medical_decisions')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Can make medical decisions on my behalf
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...emergencyForm.register('power_of_attorney')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Has power of attorney for healthcare
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddContact(false);
                      setEditingContactId(null);
                      emergencyForm.reset();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <FormButton
                    type="submit"
                    loading={emergencyForm.formState.isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Save Contact
                  </FormButton>
                </div>
              </form>
            </div>
          )}

          {/* Emergency Contacts List */}
          <div className="space-y-4">
            {emergencyContacts.length === 0 ? (
              <div className="text-center py-8">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500">No emergency contacts added yet</p>
                <p className="text-sm text-gray-400 mt-1">Add emergency contacts for peace of mind</p>
              </div>
            ) : (
              emergencyContacts.map((contact, index) => (
                <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{contact.name}</h4>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>📞 {contact.phone_primary}</p>
                        {contact.phone_secondary && <p>📞 {contact.phone_secondary}</p>}
                        {contact.email && <p>✉️ {contact.email}</p>}
                      </div>
                      {(contact.can_make_medical_decisions || contact.power_of_attorney) && (
                        <div className="mt-2 flex space-x-2">
                          {contact.can_make_medical_decisions && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Medical Decisions
                            </span>
                          )}
                          {contact.power_of_attorney && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Power of Attorney
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingContactId(contact.id)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          // Handle delete
                          console.log('Delete contact:', contact.id);
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Communication Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Communication Preferences</h2>
          
          <div className="space-y-6">
            {/* Notification Methods */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">How would you like to receive notifications?</h3>
              <div className="space-y-3">
                {[
                  { key: 'email_reminders', label: 'Email notifications', description: 'Receive updates via email' },
                  { key: 'sms_reminders', label: 'Text messages (SMS)', description: 'Receive SMS notifications on your phone' },
                  { key: 'phone_calls', label: 'Phone calls', description: 'Receive important updates via phone calls' },
                ].map(item => (
                  <div key={item.key} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={communicationPrefs[item.key as keyof typeof communicationPrefs]}
                      onChange={(e) => setCommunicationPrefs(prev => ({
                        ...prev,
                        [item.key]: e.target.checked
                      }))}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <label className="text-sm font-medium text-gray-700">{item.label}</label>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Types */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">What notifications would you like to receive?</h3>
              <div className="space-y-3">
                {[
                  { key: 'appointment_reminders', label: 'Appointment reminders', description: 'Reminders about upcoming appointments' },
                  { key: 'medication_reminders', label: 'Medication reminders', description: 'Reminders to take your medications' },
                  { key: 'lab_result_notifications', label: 'Lab result notifications', description: 'Alerts when new test results are available' },
                  { key: 'research_invitations', label: 'Research study invitations', description: 'Invitations to participate in relevant research studies' },
                  { key: 'marketing_communications', label: 'Marketing communications', description: 'Updates about new services and health tips' },
                ].map(item => (
                  <div key={item.key} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={communicationPrefs[item.key as keyof typeof communicationPrefs]}
                      onChange={(e) => setCommunicationPrefs(prev => ({
                        ...prev,
                        [item.key]: e.target.checked
                      }))}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <label className="text-sm font-medium text-gray-700">{item.label}</label>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePreferencesUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings Tab */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h2>
          
          <div className="space-y-6">
            {/* HIPAA Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-blue-800">Your Privacy Rights</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your health information is protected under HIPAA. You have the right to control how your information is shared and used.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Controls */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Data Sharing Preferences</h3>
              <div className="space-y-4">
                {[
                  {
                    key: 'share_data_for_research',
                    label: 'Share data for medical research',
                    description: 'Allow your de-identified health data to be used for medical research studies'
                  },
                  {
                    key: 'allow_family_access',
                    label: 'Allow family member access',
                    description: 'Allow designated family members to access your health information'
                  },
                  {
                    key: 'directory_listing',
                    label: 'Include in facility directory',
                    description: 'Allow your name to be included in hospital/clinic directories'
                  },
                  {
                    key: 'photo_consent',
                    label: 'Photography consent',
                    description: 'Allow photos to be taken during medical procedures for educational purposes'
                  },
                ].map(item => (
                  <div key={item.key} className="flex items-start p-4 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      checked={privacySettings[item.key as keyof typeof privacySettings]}
                      onChange={(e) => setPrivacySettings(prev => ({
                        ...prev,
                        [item.key]: e.target.checked
                      }))}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <label className="text-sm font-medium text-gray-700">{item.label}</label>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Actions */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Download my data</p>
                      <p className="text-sm text-gray-500">Get a copy of all your health information</p>
                    </div>
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Request data correction</p>
                      <p className="text-sm text-gray-500">Request changes to your health information</p>
                    </div>
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePreferencesUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Save Privacy Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
