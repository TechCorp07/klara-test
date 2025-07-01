// src/app/(dashboard)/patient/components/index.ts

// Main dashboard components
export { HealthSummaryCard } from './HealthSummaryCard';
export { AppointmentCard } from './AppointmentCard';
export { MedicationTracker } from './MedicationTracker';
export { HealthRecordsAccess } from './HealthRecordsAccess';

// Form components
export { PatientProfileForm } from './forms/PatientProfileForm';
export { EmergencyContactForm } from './forms/EmergencyContactForm';
export { AppointmentRequestForm } from './forms/AppointmentRequestForm';
export { MedicationLogForm } from './forms/MedicationLogForm';
export { VitalSignsForm } from './forms/VitalSignsForm';

// UI components
export { PatientCard } from './ui/PatientCard';
export { HealthMetricCard } from './ui/HealthMetricCard';
export { AdherenceChart } from './ui/AdherenceChart';
export { VitalsChart } from './ui/VitalsChart';
export { AppointmentCalendar } from './ui/AppointmentCalendar';

// Modal components
export { AppointmentDetailsModal } from './modals/AppointmentDetailsModal';
export { MedicationDetailsModal } from './modals/MedicationDetailsModal';
export { HealthRecordModal } from './modals/HealthRecordModal';
export { ConsentModal } from './modals/ConsentModal';

// Navigation components
export { PatientSidebar } from './navigation/PatientSidebar';
export { PatientBreadcrumb } from './navigation/PatientBreadcrumb';

// Feature-specific components
export { TelemedicineControls } from './telemedicine/TelemedicineControls';
export { ResearchStudyCard } from './research/ResearchStudyCard';
export { InsuranceCard } from './insurance/InsuranceCard';
export { CareTeamMember } from './care-team/CareTeamMember';

// Utility components
export { PatientErrorBoundary } from './PatientErrorBoundary';
export { PatientLoadingSpinner } from './PatientLoadingSpinner';
export { HIPAANotice } from './HIPAANotice';
export { VerificationWarning } from './VerificationWarning';
