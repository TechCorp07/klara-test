// src/types/permissions.ts
export interface UserPermissions {
  // General Access
  has_dashboard_access: boolean;        // Can access dashboard layout (ALL users)
  
  // Administrative Permissions
  has_admin_access: boolean;            // Can access admin sections
  has_approval_permissions: boolean;    // Can approve/reject users
  has_user_management_access: boolean;  // Can manage users
  has_system_settings_access: boolean;  // Can modify system settings
  
  // Compliance & Security
  has_audit_access: boolean;            // Can view audit logs
  has_compliance_reports_access: boolean; // Can access compliance reports
  
  // Healthcare Data Access
  has_patient_data_access: boolean;     // Can access patient data
  has_medical_records_access: boolean;  // Can manage medical records
  
  // Feature-Specific Permissions
  can_view_own_data: boolean;           // Can view own profile/data
  can_manage_appointments: boolean;     // Can create/manage appointments
  can_access_telemedicine: boolean;     // Can use telemedicine features
  can_view_research_data: boolean;      // Can access research data
  can_access_clinical_trials: boolean;  // Can participate in/manage trials
  can_manage_medications: boolean;      // Can prescribe/manage medications
  
  // User role for reference
  user_role: string;
}

export interface UsePermissionsResult {
  permissions: UserPermissions | null;
  loading: boolean;
  error: string | null;
}

// Role definitions for easy reference
export const ALL_ROLES = [
  'patient', 'provider', 'researcher', 'pharmco', 'caregiver', 
  'compliance', 'admin', 'superadmin'
] as const;

export const ADMIN_ROLES = ['admin', 'superadmin'] as const;
export const COMPLIANCE_ROLES = ['admin', 'superadmin', 'compliance'] as const;
export const HEALTHCARE_ROLES = ['patient', 'provider', 'caregiver'] as const;
export const RESEARCH_ROLES = ['researcher', 'pharmco'] as const;

export type UserRole = typeof ALL_ROLES[number];
export type AdminRole = typeof ADMIN_ROLES[number];
export type ComplianceRole = typeof COMPLIANCE_ROLES[number];