// src/hooks/patient/index.ts

// Main dashboard hook
export { usePatientDashboard } from './usePatientDashboard';

// Appointments hooks
export {
  usePatientAppointments,
  useUpcomingAppointments,
  useAppointmentHistory,
  useTodayAppointments,
  useTelemedicineAppointments,
} from './usePatientAppointments';

// Medications hooks
export {
  usePatientMedications,
  useActiveMedications,
  useTodayMedicationSchedule,
  useMedicationReminders,
} from './usePatientMedications';

// Health records hooks
export {
  usePatientHealthRecords,
  useCriticalHealthRecords,
  useRecentLabResults,
  usePendingResults,
  useRecordsWithAttachments,
} from './usePatientHealthRecords';

// Vitals hooks
export {
  usePatientVitals,
  useLatestVitals,
  useVitalAlerts,
  useVitalTrend,
} from './usePatientVitals';

// Profile hooks
export {
  usePatientProfile,
  useProfileValidation,
  useEmergencyContacts,
  useInsuranceInfo,
} from './usePatientProfile';

// Re-export types for convenience
export type {
  UsePatientAppointmentsReturn,
  UsePatientMedicationsReturn,
  UsePatientHealthRecordsReturn,
  UsePatientVitalsReturn,
  UsePatientProfileReturn,
} from './types';
