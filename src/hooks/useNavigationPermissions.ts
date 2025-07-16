// src/hooks/useNavigationPermissions.ts
import { useAuth } from '@/lib/auth';

export const useNavigationPermissions = () => {
  const { user, jwtPayload, hasPermission, isLoading } = useAuth();

  const canAccess = {
    // Admin-only navigation items
    userManagement: hasPermission('has_user_management_access'),
    approvals: hasPermission('has_approval_permissions'),
    systemSettings: hasPermission('has_system_settings_access'),
    
    // Compliance navigation items
    auditLogs: hasPermission('has_audit_access'),
    complianceReports: hasPermission('has_compliance_reports_access'),
    
    // Healthcare navigation items
    healthRecords: hasPermission('has_patient_data_access'),
    medicalRecords: hasPermission('has_medical_records_access'),
    appointments: hasPermission('can_manage_appointments'),
    telemedicine: hasPermission('can_access_telemedicine'),
    medications: hasPermission('can_manage_medications'),
    
    // Research navigation items
    research: hasPermission('has_research_data_access'),
    clinicalTrials: hasPermission('can_access_clinical_trials'),
    
    // General navigation items (all authenticated users)
    dashboard: true, // All authenticated users can access their dashboard
    profile: true,   // All users can view their own profile
    messages: true,  // All users can access messages
    settings: true,  // All users can access settings
  };

  return {
    canAccess,
    permissions: jwtPayload?.permissions || null,
    loading: isLoading,
    error: null, // No more async permission loading, so no errors
    userRole: user?.role || 'unknown'
  };
};