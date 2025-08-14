// src/types/health-records.types.ts

// Base health record interface
export interface HealthRecord {
  id: number;
  record_type: 'lab_result' | 'imaging' | 'visit_note' | 'test_result' | 'prescription' | 'vaccination' | 'procedure' | 'discharge_summary' | 'condition' | 'medication' | 'allergy' | 'vital_sign' | 'family_history' | 'immunization' | 'treatment';
  title: string;
  date: string;
  provider?: {
    id: number;
    name: string;
    specialty: string;
    credentials?: string;
    contact_info?: {
      phone?: string;
      email?: string;
      address?: string;
    };
  };
  status: 'final' | 'preliminary' | 'pending' | 'amended' | 'cancelled' | 'active' | 'inactive' | 'resolved' | 'chronic';
  has_attachments: boolean;
  is_critical: boolean;
  summary?: string;
  document_url?: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

// Detailed health record interface for individual record pages
export interface HealthRecordDetail extends HealthRecord {
  content?: string;
  notes?: string;
  attachments?: Array<{
    id: number;
    filename: string;
    file_size: number;
    mime_type: string;
    uploaded_at: string;
    document_url?: string;
  }>;
  related_records?: Array<{
    id: number;
    title: string;
    record_type: string;
    date: string;
  }>;
  
  // Condition-specific fields
  diagnosis_code?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'critical';
  is_rare_condition?: boolean;
  rare_condition_details?: {
    orpha_code?: string;
    omim_code?: string;
    prevalence?: string;
    inheritance_pattern?: string;
    specialty_required?: string;
    known_treatments?: string;
    biomarkers?: string;
  };
  
  // Lab result-specific fields
  result_value?: string;
  reference_range?: string;
  unit?: string;
  is_abnormal?: boolean;
  test_method?: string;
  lab_name?: string;
  
  // Medication-specific fields
  dosage?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  route?: string;
  instructions?: string;
  side_effects?: string[];
  is_specialty_medication?: boolean;
  for_rare_condition?: boolean;
  
  // Vital signs-specific fields
  measurements?: {
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    heart_rate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    oxygen_saturation?: number;
    pain_level?: number;
    [key: string]: number | undefined;
  };
  
  // Allergy-specific fields
  allergen?: string;
  allergy_type?: 'food' | 'medication' | 'environmental' | 'other';
  reaction_description?: string;
  first_occurrence_date?: string;
  verified_by_provider?: boolean;
  
  // Family history-specific fields
  relationship?: string;
  condition?: string;
  diagnosed_age?: number;
  is_deceased?: boolean;
  deceased_age?: number;
  deceased_reason?: string;
  
  // Immunization-specific fields
  vaccine_name?: string;
  vaccine_type?: string;
  dose_number?: number;
  series_complete?: boolean;
  vaccination_site?: string;
  lot_number?: string;
  expiration_date?: string;
}

// Medical condition interface
export interface MedicalCondition {
  id: number;
  medical_record: number;
  name: string;
  diagnosis_date: string;
  status: 'active' | 'inactive' | 'resolved' | 'chronic';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  is_rare_condition: boolean;
  rare_condition?: {
    id: number;
    name: string;
    orpha_code?: string;
    omim_code?: string;
    prevalence?: string;
    inheritance_pattern?: string;
    specialty_category?: string;
  };
  diagnosis_code?: string;
  provider: {
    id: number;
    name: string;
    specialty: string;
    credentials?: string;
  };
  symptoms: string[];
  current_treatment?: string;
  notes?: string;
  last_flare_date?: string;
  flare_frequency?: string;
  medications_count: number;
  related_conditions: string[];
  created_at: string;
  updated_at: string;
}

// Medication interface
export interface Medication {
  id: number;
  medical_record: number;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  start_date: string;
  end_date?: string;
  active: boolean;
  reason: string;
  instructions?: string;
  side_effects?: string[];
  for_rare_condition: boolean;
  is_specialty_medication: boolean;
  requires_monitoring: boolean;
  provider: {
    id: number;
    name: string;
    specialty: string;
  };
  adherence_rate?: number;
  last_taken?: string;
  next_dose?: string;
  created_at: string;
  updated_at: string;
}

// Lab result interface
export interface LabResult {
  id: number;
  medical_record: number;
  test_name: string;
  ordered_date: string;
  result_date?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'in_progress';
  result_value?: string;
  reference_range?: string;
  unit?: string;
  is_abnormal: boolean;
  is_critical: boolean;
  provider: {
    id: number;
    name: string;
    specialty: string;
  };
  lab_name?: string;
  test_method?: string;
  notes?: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
}

// Vital sign interface
export interface VitalSign {
  id: number;
  medical_record: number;
  measured_at: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygen_saturation?: number;
  pain_level?: number;
  recorded_by?: string;
  notes?: string;
  is_critical: boolean;
  created_at: string;
  updated_at: string;
}

// Allergy interface
export interface Allergy {
  id: number;
  medical_record: number;
  allergen: string;
  allergy_type: 'food' | 'medication' | 'environmental' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  symptoms: string[];
  reaction_description?: string;
  first_occurrence_date?: string;
  verified_by_provider: boolean;
  provider?: {
    id: number;
    name: string;
    specialty: string;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Family history interface
export interface FamilyHistory {
  id: number;
  medical_record: number;
  relationship: 'mother' | 'father' | 'sister' | 'brother' | 'daughter' | 'son' | 'grandmother_maternal' | 'grandfather_maternal' | 'grandmother_paternal' | 'grandfather_paternal' | 'aunt_maternal' | 'uncle_maternal' | 'aunt_paternal' | 'uncle_paternal' | 'cousin' | 'other';
  condition: string;
  diagnosed_age?: number;
  notes?: string;
  is_deceased: boolean;
  deceased_age?: number;
  deceased_reason?: string;
  is_rare_condition: boolean;
  rare_condition?: {
    id: number;
    name: string;
    orpha_code?: string;
    prevalence?: string;
  };
  created_at: string;
  updated_at: string;
}

// Immunization interface
export interface Immunization {
  id: number;
  medical_record: number;
  vaccine_name: string;
  vaccine_type: string;
  administration_date: string;
  dose_number?: number;
  series_complete: boolean;
  provider: {
    id: number;
    name: string;
    specialty: string;
  };
  vaccination_site?: string;
  lot_number?: string;
  expiration_date?: string;
  reactions?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Treatment interface
export interface Treatment {
  id: number;
  medical_record: number;
  treatment_type: 'surgery' | 'therapy' | 'procedure' | 'intervention' | 'other';
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  provider: {
    id: number;
    name: string;
    specialty: string;
  };
  location?: string;
  outcome?: string;
  complications?: string;
  follow_up_required: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Health records summary interface
export interface HealthRecordsSummary {
  total_records: number;
  recent_records: number; // Last 30 days
  pending_results: number;
  critical_alerts: number;
  last_updated: string;
  records_by_type: {
    condition?: number;
    medication?: number;
    lab_result?: number;
    vital_sign?: number;
    allergy?: number;
    family_history?: number;
    immunization?: number;
    treatment?: number;
    [key: string]: number | undefined;
  };
  records_by_provider: {
    [providerId: string]: number;
  };
  records_by_status: {
    active?: number;
    pending?: number;
    completed?: number;
    cancelled?: number;
    [key: string]: number | undefined;
  };
}

// Filters interface
export interface HealthRecordFilters {
  record_type?: string;
  start_date?: string;
  end_date?: string;
  provider?: number;
  status?: string;
  is_critical?: boolean;
  has_attachments?: boolean;
  search_query?: string;
  severity?: string;
  is_rare_condition?: boolean;
}

// Record request interface
export interface RecordRequest {
  record_types: string[];
  date_range?: {
    start_date: string;
    end_date: string;
  };
  delivery_method: 'email' | 'mail' | 'pickup' | 'portal';
  purpose: string;
  notes?: string;
  include_attachments?: boolean;
  format?: 'pdf' | 'fhir' | 'hl7' | 'ccda';
}

// Record request response interface
export interface RecordRequestResponse {
  request_id: string;
  estimated_completion: string;
  tracking_number?: string;
  status: 'submitted' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  delivery_info?: {
    method: string;
    address?: string;
    email?: string;
    portal_link?: string;
  };
}

// Shared record access interface
export interface SharedRecordAccess {
  id: number;
  record_id: number;
  record_title: string;
  recipient_email: string;
  recipient_type: 'provider' | 'caregiver' | 'family' | 'emergency_contact' | 'researcher';
  access_level: 'view_only' | 'download' | 'full';
  shared_at: string;
  accessed_at?: string;
  expires_at: string;
  is_active: boolean;
  message?: string;
  created_at: string;
}

// Health data consent interface
export interface HealthDataConsent {
  id: number;
  patient: number;
  consent_type: 'health_data_access' | 'telemedicine' | 'research_participation' | 'data_sharing' | 'emergency_access';
  is_active: boolean;
  consented_at: string;
  expires_at?: string;
  scope: string[];
  authorized_entities?: number[];
  revoked_at?: string;
  revocation_reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

// Audit log interface
export interface HealthDataAuditLog {
  id: number;
  user: number;
  user_name: string;
  user_role: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'download' | 'share' | 'export';
  resource_type: string;
  resource_id: number;
  resource_title?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

// EHR integration interface
export interface EHRIntegration {
  id: number;
  patient: number;
  integration_type: 'epic' | 'cerner' | 'allscripts' | 'athenahealth' | 'eclinicalworks' | 'other';
  integration_name: string;
  status: 'connected' | 'pending' | 'disconnected' | 'error';
  last_sync?: string;
  sync_frequency: number; // in hours
  enabled_resources: string[];
  credentials_valid: boolean;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// Wearable integration interface
export interface WearableIntegration {
  id: number;
  patient: number;
  device_type: 'fitbit' | 'apple_watch' | 'garmin' | 'samsung_health' | 'google_fit' | 'withings' | 'other';
  device_name: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  last_sync?: string;
  sync_enabled: boolean;
  data_types: string[];
  consent_granted: boolean;
  consent_date?: string;
  authorization_expires?: string;
  created_at: string;
  updated_at: string;
}

// FHIR resource interfaces
export interface FHIRPatient {
  id: number;
  identifier: string;
  family_name: string;
  given_name: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birth_date: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FHIRObservation {
  id: number;
  patient: number;
  code: string;
  display: string;
  value: string;
  unit?: string;
  effective_date: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'cancelled';
  category?: string;
  created_at: string;
  updated_at: string;
}

// Hook options interface
export interface UsePatientHealthRecordsOptions {
  filters?: HealthRecordFilters;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Hook return interface
export interface UsePatientHealthRecordsReturn {
  // Data
  records: HealthRecord[];
  conditions: MedicalCondition[];
  medications: Medication[];
  labResults: LabResult[];
  vitalSigns: VitalSign[];
  allergies: Allergy[];
  familyHistory: FamilyHistory[];
  summary: HealthRecordsSummary | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  
  // Actions
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  downloadRecord: (recordId: number) => Promise<void>;
  requestRecords: (requestData: RecordRequest) => Promise<RecordRequestResponse>;
  shareRecord: (recordId: number, recipientEmail: string, message?: string) => Promise<void>;
  
  // Filtering
  setFilters: (filters: HealthRecordFilters) => void;
  clearFilters: () => void;
  searchRecords: (query: string) => void;
  
  // Utilities
  getRecordsByType: (type: string) => HealthRecord[];
  getCriticalRecords: () => HealthRecord[];
  getRecentRecords: (days?: number) => HealthRecord[];
}

// Rare condition registry interface
export interface RareConditionRegistry {
  id: number;
  name: string;
  identifier?: string; // ORPHA, OMIM or other code
  description: string;
  prevalence?: string;
  inheritance_pattern?: string;
  onset_age?: string;
  specialty_category?: string;
  known_treatments?: string;
  biomarkers?: string;
  research_resources?: string;
  patient_organizations?: string;
  created_at: string;
  updated_at: string;
}

// Provider referral network interface
export interface ReferralNetwork {
  id: number;
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
  specializes_in_rare_conditions: boolean;
  specific_conditions: RareConditionRegistry[];
  accepts_new_patients: boolean;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  languages_spoken: string[];
  telemedicine_available: boolean;
  average_wait_time?: number; // in days
  patient_rating?: number;
  created_at: string;
  updated_at: string;
}