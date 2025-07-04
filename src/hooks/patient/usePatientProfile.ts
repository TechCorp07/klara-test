// src/hooks/patient/usePatientProfile.ts

import { useState, useEffect, useCallback } from 'react';
import { patientService } from '@/lib/api/services/patient.service';
import type { PatientProfile, PatientPreferences, EmergencyContact, HealthInsurance } from '@/types/patient.types';

interface ProfileValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

interface UsePatientProfileReturn {
  // Data
  profile: PatientProfile | null;
  preferences: PatientPreferences | null;
  emergencyContacts: EmergencyContact[];
  insuranceInfo: HealthInsurance[];
  loading: boolean;
  error: string | null;
  
  // Profile actions
  updateProfile: (updates: Partial<PatientProfile>) => Promise<PatientProfile>;
  updatePreferences: (updates: Partial<PatientPreferences>) => Promise<PatientPreferences>;
  
  // Emergency contacts
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id' | 'patient'>) => Promise<EmergencyContact>;
  updateEmergencyContact: (id: number, updates: Partial<EmergencyContact>) => Promise<EmergencyContact>;
  deleteEmergencyContact: (id: number) => Promise<void>;
  
  // Insurance
  addInsurance: (insurance: Omit<HealthInsurance, 'id' | 'patient'>) => Promise<HealthInsurance>;
  updateInsurance: (id: number, updates: Partial<HealthInsurance>) => Promise<HealthInsurance>;
  deleteInsurance: (id: number) => Promise<void>;
  
  // Utilities
  validateProfile: (profileData: Partial<PatientProfile>) => ProfileValidation;
  refetch: () => Promise<void>;
  
  // Profile completeness
  getProfileCompleteness: () => { percentage: number; missingFields: string[] };
  isProfileComplete: () => boolean;
}

export const usePatientProfile = (): UsePatientProfileReturn => {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [preferences, setPreferences] = useState<PatientPreferences | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [insuranceInfo, setInsuranceInfo] = useState<HealthInsurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all profile-related data
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileResponse, emergencyResponse, insuranceResponse] = await Promise.all([
        patientService.getProfile(),
        patientService.getEmergencyContacts(),
        patientService.getInsuranceInfo(),
      ]);

      setProfile(profileResponse);
      setEmergencyContacts(emergencyResponse);
      setInsuranceInfo(insuranceResponse);

      // Extract preferences from profile if they exist
      if (profileResponse.communication_preferences || profileResponse.privacy_settings) {
        const defaultCommunication = {
          preferred_contact_method: 'email' as 'email' | 'phone' | 'sms' | 'portal',
          appointment_reminders: true,
          medication_reminders: true,
          lab_result_notifications: true,
          marketing_communications: false,
          research_invitations: false,
          email_reminders: true,
          sms_reminders: true,
          phone_calls: false,
        };
        
        const defaultPrivacy = {
          share_with_family: false,
          research_participation: false,
          marketing_communications: false,
          share_data_for_research: false,
          allow_family_access: false,
          directory_listing: false,
          photo_consent: false,
        };
        
        setPreferences({
          id: profileResponse.id,
          patient: profileResponse.id,
          communication: {
            ...defaultCommunication,
            ...profileResponse.communication_preferences,
          },
          privacy: {
            ...defaultPrivacy,
            ...profileResponse.privacy_settings,
          },
          accessibility: {
            large_text: false,
            high_contrast: false,
            screen_reader_compatible: false,
            preferred_language: profileResponse.preferred_language || 'en',
            interpreter_needed: false,
          },
          scheduling: {
            preferred_appointment_time: 'any',
            preferred_days: [],
            advance_booking_days: 14,
            same_day_appointments: true,
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<PatientProfile>) => {
    try {
      const updatedProfile = await patientService.updateProfile(updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update profile');
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<PatientPreferences>) => {
    try {
      const updatedPreferences = await patientService.updatePreferences(updates);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  }, []);

  // Emergency contact management
  const addEmergencyContact = useCallback(async (contact: Omit<EmergencyContact, 'id' | 'patient'>) => {
    try {
      const newContact = await patientService.addEmergencyContact(contact);
      setEmergencyContacts(prev => [...prev, newContact]);
      return newContact;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add emergency contact');
    }
  }, []);

  const updateEmergencyContact = useCallback(async (id: number, updates: Partial<EmergencyContact>) => {
    try {
      const updatedContact = await patientService.updateEmergencyContact(id, updates);
      setEmergencyContacts(prev =>
        prev.map(contact => contact.id === id ? updatedContact : contact)
      );
      return updatedContact;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update emergency contact');
    }
  }, []);

  const deleteEmergencyContact = useCallback(async (id: number) => {
    try {
      await patientService.deleteEmergencyContact(id);
      setEmergencyContacts(prev => prev.filter(contact => contact.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete emergency contact');
    }
  }, []);

  // Insurance management
  const addInsurance = useCallback(async (insurance: Omit<HealthInsurance, 'id' | 'patient'>) => {
    try {
      const newInsurance = await patientService.addInsurance(insurance);
      setInsuranceInfo(prev => [...prev, newInsurance]);
      return newInsurance;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add insurance');
    }
  }, []);

  const updateInsurance = useCallback(async (id: number, updates: Partial<HealthInsurance>) => {
    try {
      const updatedInsurance = await patientService.updateInsurance(id, updates);
      setInsuranceInfo(prev =>
        prev.map(insurance => insurance.id === id ? updatedInsurance : insurance)
      );
      return updatedInsurance;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update insurance');
    }
  }, []);

  const deleteInsurance = useCallback(async (id: number) => {
    try {
      // In practice, you might want to deactivate rather than delete
      setInsuranceInfo(prev => prev.filter(insurance => insurance.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete insurance');
    }
  }, []);

  // Profile validation
  const validateProfile = useCallback((profileData: Partial<PatientProfile>): ProfileValidation => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Required fields validation
    if (profileData.user) {
      if (!profileData.user.first_name?.trim()) {
        errors.first_name = 'First name is required';
      }
      if (!profileData.user.last_name?.trim()) {
        errors.last_name = 'Last name is required';
      }
      if (!profileData.user.email?.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.user.email)) {
        errors.email = 'Invalid email format';
      }
    }

    if (!profileData.date_of_birth) {
      errors.date_of_birth = 'Date of birth is required';
    } else {
      const birthDate = new Date(profileData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 150) {
        errors.date_of_birth = 'Invalid date of birth';
      } else if (age < 18) {
        warnings.date_of_birth = 'Minor patients may require guardian consent';
      }
    }

    if (!profileData.address?.trim()) {
      errors.address = 'Address is required';
    }

    if (!profileData.city?.trim()) {
      errors.city = 'City is required';
    }

    if (!profileData.state?.trim()) {
      errors.state = 'State is required';
    }

    if (!profileData.zip_code?.trim()) {
      errors.zip_code = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(profileData.zip_code)) {
      errors.zip_code = 'Invalid ZIP code format';
    }

    if (!profileData.emergency_contact_name?.trim()) {
      errors.emergency_contact_name = 'Emergency contact name is required';
    }

    if (!profileData.emergency_contact_phone?.trim()) {
      errors.emergency_contact_phone = 'Emergency contact phone is required';
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(profileData.emergency_contact_phone)) {
      errors.emergency_contact_phone = 'Invalid phone number format';
    }

    // Optional field warnings
    if (!profileData.insurance_provider?.trim()) {
      warnings.insurance_provider = 'Insurance information is recommended';
    }

    if (!profileData.primary_care_provider?.trim()) {
      warnings.primary_care_provider = 'Primary care provider information is recommended';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    };
  }, []);

  // Profile completeness calculation
  const getProfileCompleteness = useCallback(() => {
    if (!profile) return { percentage: 0, missingFields: [] };

    const requiredFields = [
      'user.first_name',
      'user.last_name',
      'user.email',
      'date_of_birth',
      'gender',
      'address',
      'city',
      'state',
      'zip_code',
      'emergency_contact_name',
      'emergency_contact_phone',
    ];

    const optionalFields = [
      'user.phone_number',
      'insurance_provider',
      'insurance_policy_number',
      'primary_care_provider',
      'preferred_language',
    ];

    const allFields = [...requiredFields, ...optionalFields];
    const missingFields: string[] = [];
    let completedFields = 0;

    allFields.forEach(field => {
      const fieldPath = field.split('.');
      let value: unknown = profile;
      
      for (const path of fieldPath) {
        value = (value as Record<string, unknown>)?.[path];
      }

      if (value && value.toString().trim()) {
        completedFields++;
      } else {
        missingFields.push(field);
      }
    });

    return {
      percentage: Math.round((completedFields / allFields.length) * 100),
      missingFields,
    };
  }, [profile]);

  // Check if profile is complete
  const isProfileComplete = useCallback(() => {
    const { percentage } = getProfileCompleteness();
    return percentage >= 80; // 80% completion threshold
  }, [getProfileCompleteness]);

  // Refetch all data
  const refetch = useCallback(async () => {
    await fetchProfileData();
  }, [fetchProfileData]);

  return {
    profile,
    preferences,
    emergencyContacts,
    insuranceInfo,
    loading,
    error,
    updateProfile,
    updatePreferences,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    addInsurance,
    updateInsurance,
    deleteInsurance,
    validateProfile,
    refetch,
    getProfileCompleteness,
    isProfileComplete,
  };
};

// Helper hook for profile validation during editing
export const useProfileValidation = (profileData: Partial<PatientProfile>) => {
  const { validateProfile } = usePatientProfile();
  
  const validation = validateProfile(profileData);
  
  return {
    ...validation,
    hasErrors: Object.keys(validation.errors).length > 0,
    hasWarnings: Object.keys(validation.warnings).length > 0,
    getFieldError: (fieldName: string) => validation.errors[fieldName],
    getFieldWarning: (fieldName: string) => validation.warnings[fieldName],
  };
};

// Helper hook for emergency contacts only
export const useEmergencyContacts = () => {
  const {
    emergencyContacts,
    loading,
    error,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
  } = usePatientProfile();

  // Get primary emergency contact
  const primaryContact = emergencyContacts.find(contact => contact.is_primary_contact);
  
  // Get contacts who can make medical decisions
  const authorizedContacts = emergencyContacts.filter(contact => contact.can_make_medical_decisions);

  return {
    emergencyContacts,
    primaryContact,
    authorizedContacts,
    loading,
    error,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    hasEmergencyContacts: emergencyContacts.length > 0,
    hasPrimaryContact: !!primaryContact,
    hasAuthorizedContacts: authorizedContacts.length > 0,
  };
};

// Helper hook for insurance information only
export const useInsuranceInfo = () => {
  const {
    insuranceInfo,
    loading,
    error,
    addInsurance,
    updateInsurance,
    deleteInsurance,
  } = usePatientProfile();

  // Get primary insurance
  const primaryInsurance = insuranceInfo.find(ins => ins.insurance_type === 'primary' && ins.is_active);
  
  // Get active insurance policies
  const activeInsurance = insuranceInfo.filter(ins => ins.is_active);

  return {
    insuranceInfo,
    primaryInsurance,
    activeInsurance,
    loading,
    error,
    addInsurance,
    updateInsurance,
    deleteInsurance,
    hasInsurance: insuranceInfo.length > 0,
    hasPrimaryInsurance: !!primaryInsurance,
    hasActiveInsurance: activeInsurance.length > 0,
  };
};
