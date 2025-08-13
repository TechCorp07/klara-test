// src/types/patient.types.ts

export interface PatientProfile {
    id: number;
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      phone_number?: string;
    };
    date_of_birth: string;
    gender: 'M' | 'F' | 'O' | 'P';
    address: string;
    city: string;
    state: string;
    zip_code: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    insurance_provider?: string;
    insurance_policy_number?: string;
    primary_care_provider?: string;
    allergies: string[];
    medical_conditions: string[];
    medications: string[];
    preferred_language: string;
    communication_preferences: {
      email_reminders: boolean;
      sms_reminders: boolean;
      phone_calls: boolean;
    };
    privacy_settings: {
      share_with_family: boolean;
      research_participation: boolean;
      marketing_communications: boolean;
    };
  }
  
  export interface VitalSigns {
    id: number;
    patient: number;
    recorded_date: string;
    recorded_by: {
      id: number;
      name: string;
      role: string;
    };
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    heart_rate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    oxygen_saturation?: number;
    respiratory_rate?: number;
    blood_glucose?: number;
    notes?: string;
    data_source: 'manual' | 'device' | 'wearable';
    device_info?: {
      device_type: string;
      manufacturer: string;
      model: string;
    };
  }
  
  export interface MedicalCondition {
    id: number;
    patient: number;
    condition_name: string;
    diagnosis_date: string;
    diagnosed_by: {
      id: number;
      name: string;
      specialty: string;
    };
    severity: 'mild' | 'moderate' | 'severe' | 'critical';
    status: 'active' | 'resolved' | 'chronic' | 'monitoring';
    description?: string;
    treatment_plan?: string;
    follow_up_required: boolean;
    next_follow_up_date?: string;
    icd10_code?: string;
    related_medications: number[];
    notes?: string;
    family_history: boolean;
  }
  
  export interface Prescription {
    id: number;
    patient: number;
    medication: {
      id: number;
      name: string;
      generic_name: string;
      drug_class: string;
      form: string; // tablet, capsule, liquid, etc.
    };
    prescribed_by: {
      id: number;
      name: string;
      specialty: string;
      npi_number: string;
    };
    prescribed_date: string;
    start_date: string;
    end_date?: string;
    dosage: string;
    frequency: string;
    instructions: string;
    quantity: number;
    refills_remaining: number;
    status: 'active' | 'completed' | 'discontinued' | 'on_hold';
    reason_for_prescription: string;
    side_effects_notes?: string;
    pharmacy?: {
      name: string;
      phone: string;
      address: string;
    };
    insurance_covered: boolean;
    cost_estimate?: number;
  }
  
  export interface MedicationAdherence {
    id: number;
    prescription: number;
    date: string;
    scheduled_time: string;
    taken: boolean;
    taken_time?: string;
    missed_reason?: string;
    side_effects_reported?: string;
    effectiveness_rating?: number; // 1-5 scale
    notes?: string;
    reminder_sent: boolean;
    data_source: 'self_reported' | 'device' | 'caregiver';
  }
  
  export interface Appointment {
    id: number;
    patient: number;
    provider: number;
    medical_record?: number;
    related_condition?: number;
    
    // Time fields matching backend
    scheduled_time: string;
    end_time: string;
    duration_minutes: number;
    timezone?: string;
    
    // Status and type fields
    status: 'scheduled' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    appointment_type: 'consultation' | 'follow_up' | 'procedure' | 'lab_work' | 'imaging' | 'therapy' | 'video_consultation' | 'phone_consultation';
    priority: 'routine' | 'urgent' | 'emergency';
    
    // Content fields
    reason: string;
    notes?: string;
    symptoms?: string;
    
    // Backend nested details (from serializer)
    patient_details?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone_number?: string;
    };
    provider_details?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone_number?: string;
      specialty?: string;
    };
    
    // Display fields from backend
    status_display?: string;
    appointment_type_display?: string;
    priority_display?: string;
    
    // Insurance and payment
    insurance_verified?: boolean;
    copay_amount?: number;
    copay_collected?: boolean;
    
    // Reminder fields
    reminders_enabled?: boolean;
    reminder_sent?: boolean;
    reminder_sent_time?: string;
    
    // Related data
    medical_record_details?: {
      id: number;
      patient: number;
      has_rare_condition: boolean;
    };
    related_condition_details?: {
      id: number;
      name: string;
      is_rare_condition: boolean;
    };
    availability_details?: {
      id: number;
      provider: number;
      start_time: string;
      end_time: string;
    };
    
    // Metadata
    created_at: string;
    updated_at: string;
    created_by?: number;
    updated_by?: number;
    
    // Computed/helper fields for frontend
    provider_name?: string;        // Computed from provider_details
    is_telemedicine?: boolean;     // Computed from appointment_type
    telemedicine_ready?: boolean;  // If telemedicine link is ready
    reason_for_visit?: string;     // Alias for reason
    preferred_datetime?: string;   // Alias for scheduled_time
    meeting_url?: string;          // For telemedicine appointments
    meeting_id?: string;           // Unique ID for telemedicine session
    location?: string;             // For in-person appointments
    preparation_notes?: string;    // Additional instructions
    follow_up_required?: boolean;  // If follow-up is needed
  }
    
  export interface LabResult {
    id: number;
    patient: number;
    test_name: string;
    test_code: string;
    ordered_by: {
      id: number;
      name: string;
      specialty: string;
    };
    ordered_date: string;
    collection_date: string;
    result_date: string;
    result_value: string;
    reference_range: string;
    unit: string;
    status: 'pending' | 'completed' | 'cancelled';
    abnormal_flag: 'normal' | 'high' | 'low' | 'critical_high' | 'critical_low';
    interpretation?: string;
    comments?: string;
    lab_facility: {
      name: string;
      address: string;
      certification: string;
    };
    fasting_required: boolean;
    specimen_type: string;
    methodology?: string;
  }
  
  export interface HealthInsurance {
    id: number;
    patient: number;
    insurance_type: 'primary' | 'secondary' | 'tertiary';
    provider_name: string;
    policy_number: string;
    group_number?: string;
    subscriber_id: string;
    subscriber_name: string;
    relationship_to_patient: 'self' | 'spouse' | 'child' | 'parent' | 'other';
    effective_date: string;
    expiration_date?: string;
    copay_amount?: number;
    deductible_amount?: number;
    out_of_pocket_max?: number;
    coverage_details: {
      medical: boolean;
      dental: boolean;
      vision: boolean;
      mental_health: boolean;
      prescription: boolean;
    };
    prior_authorization_required: string[];
    customer_service_phone: string;
    claims_address?: string;
    is_active: boolean;
  }
  
  export interface CareTeamMember {
    id: number;
    patient: number;
    provider: {
      id: number;
      name: string;
      specialty: string;
      credentials: string;
      contact_info: {
        phone: string;
        email: string;
        address: string;
      };
    };
    role: 'primary_care' | 'specialist' | 'therapist' | 'nurse' | 'pharmacist' | 'other';
    relationship_start_date: string;
    relationship_end_date?: string;
    is_primary_contact: boolean;
    can_prescribe: boolean;
    access_level: 'full' | 'limited' | 'emergency_only';
    communication_preferences: {
      direct_messaging: boolean;
      appointment_scheduling: boolean;
      test_results: boolean;
      care_coordination: boolean;
    };
    last_interaction_date?: string;
    notes?: string;
  }
  
  export interface PatientDocument {
    id: number;
    patient: number;
    document_type: 'consent_form' | 'insurance_card' | 'id_verification' | 'medical_record' | 'prescription' | 'lab_result' | 'imaging' | 'other';
    title: string;
    description?: string;
    file_url: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    uploaded_by: {
      id: number;
      name: string;
      role: string;
    };
    upload_date: string;
    expiration_date?: string;
    is_verified: boolean;
    verification_date?: string;
    access_level: 'patient_only' | 'care_team' | 'emergency' | 'public';
    encryption_status: 'encrypted' | 'not_encrypted';
    audit_trail: {
      created_date: string;
      last_accessed: string;
      access_count: number;
    };
  }
  
  export interface EmergencyContact {
    id: number;
    patient: number;
    name: string;
    relationship: string;
    phone_primary: string;
    phone_secondary?: string;
    email?: string;
    address?: string;
    is_primary_contact: boolean;
    can_make_medical_decisions: boolean;
    power_of_attorney: boolean;
    contact_order: number;
    notes?: string;
  }
  
  // Dashboard-specific types
  export interface PatientDashboardStats {
    upcoming_appointments: number;
    pending_lab_results: number;
    active_prescriptions: number;
    overdue_medications: number;
    unread_messages: number;
    care_gaps: number;
    health_score?: number;
    last_visit_date?: string;
    next_appointment_date?: string;
    medication_adherence_rate: number;
  }
  
  export interface HealthAlert {
    id: number;
    patient: number;
    alert_type: 'medication_reminder' | 'lab_result' | 'appointment_reminder' | 'health_metric' | 'care_gap' | 'emergency';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    action_required: boolean;
    action_url?: string;
    created_date: string;
    acknowledged: boolean;
    acknowledged_date?: string;
    expires_date?: string;
    related_record_type?: string;
    related_record_id?: number;
  }
  
  export interface PatientPreferences {
    id: number;
    patient: number;
    communication: {
      preferred_contact_method: 'email' | 'phone' | 'sms' | 'portal';
      appointment_reminders: boolean;
      medication_reminders: boolean;
      lab_result_notifications: boolean;
      marketing_communications: boolean;
      research_invitations: boolean;
    };
    privacy: {
      share_data_for_research: boolean;
      allow_family_access: boolean;
      directory_listing: boolean;
      photo_consent: boolean;
    };
    accessibility: {
      large_text: boolean;
      high_contrast: boolean;
      screen_reader_compatible: boolean;
      preferred_language: string;
      interpreter_needed: boolean;
    };
    scheduling: {
      preferred_appointment_time: 'morning' | 'afternoon' | 'evening' | 'any';
      preferred_days: string[];
      advance_booking_days: number;
      same_day_appointments: boolean;
    };
  }
  
  export interface ClinicalStudy {
    id: number;
    title: string;
    description: string;
    phase: 'I' | 'II' | 'III' | 'IV' | 'Observational';
    status: 'recruiting' | 'active' | 'completed' | 'suspended' | 'terminated';
    sponsor: {
      name: string;
      type: 'academic' | 'industry' | 'government';
    };
    principal_investigator: {
      name: string;
      affiliation: string;
    };
    condition: string;
    intervention_type: 'drug' | 'device' | 'behavioral' | 'procedure' | 'other';
    intervention_name: string;
    duration_weeks: number;
    location: {
      city: string;
      state: string;
      facility: string;
    };
    eligibility_criteria: {
      min_age: number;
      max_age: number;
      gender: 'all' | 'male' | 'female';
      conditions: string[];
      exclusions: string[];
    };
    compensation: {
      provided: boolean;
      amount?: number;
      description?: string;
    };
    estimated_enrollment: number;
    start_date: string;
    completion_date: string;
    contact_info: {
      name: string;
      phone: string;
      email: string;
    };
    nct_number?: string; // ClinicalTrials.gov identifier
    irb_approved: boolean;
    user_interested: boolean;
    user_eligible: boolean | null; // null = not assessed yet
  }

  export interface ResearchParticipation {
    id: number;
    study: ClinicalStudy;
    status: 'interested' | 'screening' | 'enrolled' | 'completed' | 'withdrawn';
    enrolled_date?: string;
    completion_date?: string;
    withdrawal_reason?: string;
    notes?: string;
  }
  export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  }
  
  export interface Study {
    id: number;
    title: string;
    condition: string;
    phase: string;
    location: string;
    description: string;
  }
  
  export interface Message {
    id: number;
    thread_id: number;
    sender: string;
    recipient: string;
    subject: string;
    message: string;
    timestamp: string;
    read: boolean;
  }
  
  export interface SendMessageResponse {
    id: number;
    status: string;
    timestamp: string;
  }

  export interface LogMedicationTakenPayload {
    prescription: number;
    scheduled_time: string;
    taken_time: string;
    taken: boolean;
    notes?: string;
    data_source?: string;
  }

export interface ConnectedDevice {
  id: number;
  device_type: string;
  device_id: string;
  manufacturer: string;
  model: string;
  connected_at: string;
  [key: string]: unknown;
}

export interface BillingStatement {
  id: number;
  amount_due: number;
  due_date: string;
  status: string;
  [key: string]: unknown; 
}

export interface PaymentResponse {
  payment_id: number;
  status: string;
  amount: number;
  [key: string]: unknown;
}

export interface AutoPayResponse {
  autopay_id: number;
  enabled: boolean;
  [key: string]: unknown;
}
