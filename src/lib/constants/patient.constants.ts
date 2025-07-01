// src/lib/constants/patient.constants.ts

/**
 * Patient Dashboard Constants
 * Centralized configuration for the patient dashboard
 */

// Appointment related constants
export const APPOINTMENT_CONSTANTS = {
    TYPES: {
      consultation: { label: 'Consultation', icon: '👨‍⚕️', color: 'blue' },
      follow_up: { label: 'Follow-up', icon: '🔄', color: 'green' },
      procedure: { label: 'Procedure', icon: '🏥', color: 'purple' },
      lab_work: { label: 'Lab Work', icon: '🧪', color: 'yellow' },
      imaging: { label: 'Imaging', icon: '🔬', color: 'indigo' },
      therapy: { label: 'Therapy', icon: '🧘', color: 'pink' },
      emergency: { label: 'Emergency', icon: '🚨', color: 'red' },
    },
    
    VISIT_TYPES: {
      in_person: { label: 'In-Person', icon: '🏢', color: 'gray' },
      video: { label: 'Video Call', icon: '📹', color: 'blue' },
      phone: { label: 'Phone Call', icon: '📞', color: 'green' },
    },
    
    STATUSES: {
      scheduled: { label: 'Scheduled', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      confirmed: { label: 'Confirmed', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      checked_in: { label: 'Checked In', color: 'indigo', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
      in_progress: { label: 'In Progress', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
      completed: { label: 'Completed', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
      cancelled: { label: 'Cancelled', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
      no_show: { label: 'No Show', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
      rescheduled: { label: 'Rescheduled', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
    },
    
    PRIORITIES: {
      routine: { label: 'Routine', color: 'gray' },
      urgent: { label: 'Urgent', color: 'yellow' },
      emergency: { label: 'Emergency', color: 'red' },
    },
    
    // Timing constants
    JOIN_WINDOW_MINUTES: 15, // Can join 15 minutes before appointment
    REMINDER_INTERVALS: [24, 2, 0.25], // 24 hours, 2 hours, 15 minutes before
  } as const;
  
  // Medication related constants
  export const MEDICATION_CONSTANTS = {
    STATUSES: {
      active: { label: 'Active', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      completed: { label: 'Completed', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
      discontinued: { label: 'Discontinued', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
      on_hold: { label: 'On Hold', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      expired: { label: 'Expired', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
    },
    
    FREQUENCIES: {
      'once_daily': { label: 'Once Daily', short: '1x/day' },
      'twice_daily': { label: 'Twice Daily', short: '2x/day' },
      'three_times_daily': { label: 'Three Times Daily', short: '3x/day' },
      'four_times_daily': { label: 'Four Times Daily', short: '4x/day' },
      'every_other_day': { label: 'Every Other Day', short: 'EOD' },
      'weekly': { label: 'Weekly', short: '1x/week' },
      'as_needed': { label: 'As Needed', short: 'PRN' },
      'custom': { label: 'Custom Schedule', short: 'Custom' },
    },
    
    ADHERENCE_LEVELS: {
      excellent: { min: 95, label: 'Excellent', color: 'green' },
      good: { min: 85, label: 'Good', color: 'blue' },
      fair: { min: 70, label: 'Fair', color: 'yellow' },
      poor: { min: 0, label: 'Poor', color: 'red' },
    },
    
    REMINDER_TIMES: [
      { value: 0, label: 'At medication time' },
      { value: 15, label: '15 minutes before' },
      { value: 30, label: '30 minutes before' },
      { value: 60, label: '1 hour before' },
    ],
  } as const;
  
  // Health records constants
  export const HEALTH_RECORD_CONSTANTS = {
    TYPES: {
      lab_result: { label: 'Lab Result', icon: '🧪', color: 'green' },
      imaging: { label: 'Imaging', icon: '🔬', color: 'blue' },
      visit_note: { label: 'Visit Note', icon: '📝', color: 'purple' },
      test_result: { label: 'Test Result', icon: '📊', color: 'indigo' },
      prescription: { label: 'Prescription', icon: '💊', color: 'pink' },
      vaccination: { label: 'Vaccination', icon: '💉', color: 'green' },
      procedure: { label: 'Procedure', icon: '🏥', color: 'red' },
      discharge_summary: { label: 'Discharge Summary', icon: '📋', color: 'gray' },
    },
    
    STATUSES: {
      final: { label: 'Final', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      preliminary: { label: 'Preliminary', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      pending: { label: 'Pending', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      amended: { label: 'Amended', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
      cancelled: { label: 'Cancelled', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
    },
  } as const;
  
  // Vital signs constants
  export const VITAL_SIGNS_CONSTANTS = {
    NORMAL_RANGES: {
      blood_pressure: {
        systolic: { min: 90, max: 120, unit: 'mmHg' },
        diastolic: { min: 60, max: 80, unit: 'mmHg' },
      },
      heart_rate: { min: 60, max: 100, unit: 'bpm' },
      temperature: { min: 97.0, max: 99.0, unit: '°F' },
      oxygen_saturation: { min: 95, max: 100, unit: '%' },
      respiratory_rate: { min: 12, max: 20, unit: 'breaths/min' },
      blood_glucose: { min: 70, max: 140, unit: 'mg/dL' },
    },
    
    CATEGORIES: {
      cardiovascular: ['blood_pressure_systolic', 'blood_pressure_diastolic', 'heart_rate'],
      respiratory: ['respiratory_rate', 'oxygen_saturation'],
      metabolic: ['temperature', 'blood_glucose'],
      physical: ['weight', 'height'],
    },
    
    TRENDS: {
      increasing: { icon: '📈', color: 'red', label: 'Increasing' },
      decreasing: { icon: '📉', color: 'blue', label: 'Decreasing' },
      stable: { icon: '➡️', color: 'green', label: 'Stable' },
    },
  } as const;
  
  // Research participation constants
  export const RESEARCH_CONSTANTS = {
    STUDY_PHASES: {
      'I': { label: 'Phase I', description: 'Safety testing', color: 'blue' },
      'II': { label: 'Phase II', description: 'Effectiveness testing', color: 'green' },
      'III': { label: 'Phase III', description: 'Large-scale testing', color: 'yellow' },
      'IV': { label: 'Phase IV', description: 'Post-market surveillance', color: 'purple' },
      'Observational': { label: 'Observational', description: 'Observation study', color: 'gray' },
    },
    
    INTERVENTION_TYPES: {
      drug: { label: 'Drug/Treatment', icon: '💊' },
      device: { label: 'Medical Device', icon: '🔬' },
      behavioral: { label: 'Behavioral', icon: '🧠' },
      procedure: { label: 'Procedure', icon: '🏥' },
      other: { label: 'Other', icon: '📋' },
    },
    
    PARTICIPATION_STATUSES: {
      interested: { label: 'Interested', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      screening: { label: 'Screening', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      enrolled: { label: 'Enrolled', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      completed: { label: 'Completed', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
      withdrawn: { label: 'Withdrawn', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
    },
  } as const;
  
  // Communication preferences constants
  export const COMMUNICATION_CONSTANTS = {
    METHODS: {
      email: { label: 'Email', icon: '✉️' },
      sms: { label: 'Text Message', icon: '💬' },
      phone: { label: 'Phone Call', icon: '📞' },
      portal: { label: 'Patient Portal', icon: '🌐' },
      mail: { label: 'Postal Mail', icon: '📬' },
    },
    
    NOTIFICATION_TYPES: {
      appointment_reminders: { label: 'Appointment Reminders', category: 'appointments' },
      medication_reminders: { label: 'Medication Reminders', category: 'medications' },
      lab_result_notifications: { label: 'Lab Result Notifications', category: 'results' },
      prescription_updates: { label: 'Prescription Updates', category: 'medications' },
      care_team_messages: { label: 'Care Team Messages', category: 'communication' },
      billing_notifications: { label: 'Billing Notifications', category: 'billing' },
      marketing_communications: { label: 'Health Tips & News', category: 'marketing' },
      research_invitations: { label: 'Research Invitations', category: 'research' },
      security_alerts: { label: 'Security Alerts', category: 'security' },
    },
  } as const;
  
  // Privacy and consent constants
  export const PRIVACY_CONSTANTS = {
    CONSENT_TYPES: {
      terms_of_service: { label: 'Terms of Service', required: true },
      privacy_notice: { label: 'Privacy Notice', required: true },
      hipaa_authorization: { label: 'HIPAA Authorization', required: true },
      medication_monitoring: { label: 'Medication Monitoring', required: false },
      vitals_monitoring: { label: 'Vitals Monitoring', required: false },
      research_participation: { label: 'Research Participation', required: false },
      data_sharing: { label: 'Data Sharing', required: false },
      caregiver_access: { label: 'Caregiver Access', required: false },
      marketing_communications: { label: 'Marketing Communications', required: false },
    },
    
    DATA_RETENTION_PERIODS: {
      audit_logs: 6, // years
      consent_records: 6,
      medical_records: 6,
      email_logs: 2,
      session_data: 0.5, // 6 months
      emergency_access: 6,
      security_logs: 6,
      user_data: 6,
    },
  } as const;
  
  // Dashboard configuration constants
  export const DASHBOARD_CONSTANTS = {
    REFRESH_INTERVALS: {
      vitals: 300000, // 5 minutes
      appointments: 60000, // 1 minute
      medications: 180000, // 3 minutes
      notifications: 30000, // 30 seconds
    },
    
    PAGINATION: {
      DEFAULT_PAGE_SIZE: 10,
      MAX_PAGE_SIZE: 100,
      PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
    },
    
    CHART_COLORS: {
      primary: '#3B82F6', // blue-500
      success: '#10B981', // emerald-500
      warning: '#F59E0B', // amber-500
      error: '#EF4444', // red-500
      info: '#6366F1', // indigo-500
      gray: '#6B7280', // gray-500
    },
    
    BREAKPOINTS: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
  } as const;
  
  // Emergency access constants
  export const EMERGENCY_CONSTANTS = {
    ACCESS_DURATION_HOURS: 4,
    RATE_LIMIT_PER_HOUR: 3,
    REQUIRED_JUSTIFICATIONS: [
      'Life-threatening emergency',
      'Patient unable to provide consent',
      'Time-sensitive medical decision',
      'Legal guardian unavailable',
      'Other emergency circumstance',
    ],
  } as const;
  
  // Export combined constants for convenience
  export const PATIENT_CONSTANTS = {
    APPOINTMENTS: APPOINTMENT_CONSTANTS,
    MEDICATIONS: MEDICATION_CONSTANTS,
    HEALTH_RECORDS: HEALTH_RECORD_CONSTANTS,
    VITAL_SIGNS: VITAL_SIGNS_CONSTANTS,
    RESEARCH: RESEARCH_CONSTANTS,
    COMMUNICATION: COMMUNICATION_CONSTANTS,
    PRIVACY: PRIVACY_CONSTANTS,
    DASHBOARD: DASHBOARD_CONSTANTS,
    EMERGENCY: EMERGENCY_CONSTANTS,
  } as const;
  
  // Type exports for better TypeScript support
  export type AppointmentType = keyof typeof APPOINTMENT_CONSTANTS.TYPES;
  export type AppointmentStatus = keyof typeof APPOINTMENT_CONSTANTS.STATUSES;
  export type MedicationStatus = keyof typeof MEDICATION_CONSTANTS.STATUSES;
  export type HealthRecordType = keyof typeof HEALTH_RECORD_CONSTANTS.TYPES;
  export type HealthRecordStatus = keyof typeof HEALTH_RECORD_CONSTANTS.STATUSES;
  export type ResearchPhase = keyof typeof RESEARCH_CONSTANTS.STUDY_PHASES;
  export type ConsentType = keyof typeof PRIVACY_CONSTANTS.CONSENT_TYPES;
  