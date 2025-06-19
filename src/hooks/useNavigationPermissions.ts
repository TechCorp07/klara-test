// src/hooks/useNavigationPermissions.ts
import { usePermissions } from './usePermissions';

export const useNavigationPermissions = () => {
  const { permissions, loading, error } = usePermissions();

  const canAccess = {
    // Admin-only navigation items
    userManagement: permissions?.has_user_management_access || false,
    approvals: permissions?.has_approval_permissions || false,
    systemSettings: permissions?.has_system_settings_access || false,
    
    // Compliance navigation items
    auditLogs: permissions?.has_audit_access || false,
    complianceReports: permissions?.has_compliance_reports_access || false,
    
    // Healthcare navigation items
    healthRecords: permissions?.has_patient_data_access || false,
    medicalRecords: permissions?.has_medical_records_access || false,
    appointments: permissions?.can_manage_appointments || false,
    telemedicine: permissions?.can_access_telemedicine || false,
    medications: permissions?.can_manage_medications || false,
    
    // Research navigation items
    research: permissions?.can_view_research_data || false,
    clinicalTrials: permissions?.can_access_clinical_trials || false,
    
    // General navigation items (all users)
    dashboard: permissions?.has_dashboard_access || false,
    profile: permissions?.can_view_own_data || false,
    messages: permissions?.has_dashboard_access || false, // All dashboard users can access messages
    settings: permissions?.can_view_own_data || false,
  };

  return {
    canAccess,
    permissions,
    loading,
    error,
    userRole: permissions?.user_role || 'unknown'
  };
};