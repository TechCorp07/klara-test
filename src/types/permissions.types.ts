// src/types/permissions.types.ts
export interface CorePermissions {
  // Administrative Access
  has_admin_access: boolean;
  has_user_management_access: boolean;
  has_system_settings_access: boolean;
  
  // Audit and Compliance
  has_audit_access: boolean;
  has_compliance_access: boolean;
  has_export_access: boolean;
  
  // Special Access Levels
  is_superadmin: boolean;
  emergency_access: boolean;
  
  // Feature-Specific Permissions
  can_approve_users: boolean;
  can_view_phi: boolean;
  can_manage_emergencies: boolean;
  can_manage_research: boolean;
  can_manage_clinical_trials: boolean;
  
  // Data Access Permissions
  can_view_all_patients: boolean;
  can_modify_patient_data: boolean;
  can_delete_records: boolean;
  
  // Reporting Permissions
  can_generate_reports: boolean;
  can_view_analytics: boolean;
  can_export_bulk_data: boolean;
}

/**
 * Role-Specific Permission Sets
 */
export interface PatientPermissions {
  can_view_own_records: boolean;
  can_modify_own_profile: boolean;
  can_request_appointments: boolean;
  can_view_test_results: boolean;
  can_communicate_with_providers: boolean;
  can_participate_in_research: boolean;
  can_manage_consent: boolean;
}

export interface ProviderPermissions {
  can_view_assigned_patients: boolean;
  can_modify_patient_records: boolean;
  can_prescribe_medications: boolean;
  can_order_tests: boolean;
  can_create_appointments: boolean;
  can_access_emergency_records: boolean;
  can_supervise_staff: boolean;
}

export interface AdminPermissions extends CorePermissions {
  can_manage_provider_accounts: boolean;
  can_configure_system_settings: boolean;
  can_view_system_metrics: boolean;
  can_manage_security_settings: boolean;
}

export interface ResearcherPermissions {
  can_access_research_data: boolean;
  can_create_studies: boolean;
  can_recruit_participants: boolean;
  can_analyze_aggregated_data: boolean;
  can_publish_findings: boolean;
}

export interface CompliancePermissions {
  can_audit_user_activity: boolean;
  can_review_emergency_access: boolean;
  can_manage_consent_records: boolean;
  can_generate_compliance_reports: boolean;
  can_investigate_violations: boolean;
}

/**
 * Combined Permission Interface
 */
export interface JWTPermissions extends CorePermissions {
  // Role-specific permission sets
  patient_permissions?: PatientPermissions;
  provider_permissions?: ProviderPermissions;
  admin_permissions?: Partial<AdminPermissions>;
  researcher_permissions?: ResearcherPermissions;
  compliance_permissions?: CompliancePermissions;
  
  // Dynamic permission flags
  custom_permissions?: Record<string, boolean>;
}

/**
 * Permission Context Interface
 */
export interface PermissionContext {
  user_id: number;
  user_role: string;
  session_id: string;
  
  // Tenant context
  tenant_id?: number;
  tenant_type?: 'pharmaceutical' | 'healthcare_system' | 'research_institution';
  
  // Emergency context
  is_emergency_access?: boolean;
  emergency_reason?: string;
  emergency_expires?: number;
  
  // Session context
  login_method?: 'password' | 'two_factor' | 'emergency';
  device_verified?: boolean;
  ip_address?: string;
}

/**
 * Permission Check Request Interface
 */
export interface PermissionCheckRequest {
  permission: keyof JWTPermissions;
  context?: Partial<PermissionContext>;
  resource_id?: string | number;
  action?: 'view' | 'create' | 'update' | 'delete' | 'execute';
}

/**
 * Permission Check Result Interface
 */
export interface PermissionCheckResult {
  granted: boolean;
  reason?: string;
  requires_additional_verification?: boolean;
  expires_at?: number;
  conditions?: string[];
}

/**
 * Feature Flag Interface
 */
export interface FeatureFlags {
  // Beta features
  enable_advanced_analytics: boolean;
  enable_ai_insights: boolean;
  enable_telemedicine: boolean;
  
  // Experimental features
  enable_blockchain_verification: boolean;
  enable_ml_predictions: boolean;
  enable_voice_notes: boolean;
  
  // Gradual rollout features
  enable_new_dashboard: boolean;
  enable_enhanced_search: boolean;
  enable_mobile_app_integration: boolean;
  
  // Administrative features
  enable_bulk_operations: boolean;
  enable_advanced_reporting: boolean;
  enable_api_access: boolean;
}

/**
 * Dashboard Permission Interface
 */
export interface DashboardPermissions {
  // Dashboard section access
  can_access_patient_dashboard: boolean;
  can_access_provider_dashboard: boolean;
  can_access_admin_dashboard: boolean;
  can_access_research_dashboard: boolean;
  can_access_compliance_dashboard: boolean;
  
  // Dashboard feature access
  can_view_dashboard_analytics: boolean;
  can_customize_dashboard: boolean;
  can_export_dashboard_data: boolean;
  can_share_dashboard_views: boolean;
  
  // Widget permissions
  can_view_user_metrics: boolean;
  can_view_system_health: boolean;
  can_view_financial_data: boolean;
  can_view_clinical_metrics: boolean;
  can_view_research_progress: boolean;
}

/**
 * Navigation Permission Interface
 */
export interface NavigationPermissions {
  // Main navigation sections
  show_admin_menu: boolean;
  show_user_management: boolean;
  show_system_settings: boolean;
  show_audit_logs: boolean;
  show_compliance_tools: boolean;
  show_reports_section: boolean;
  
  // Quick action permissions
  can_create_users: boolean;
  can_generate_reports: boolean;
  can_initiate_emergency_access: boolean;
  can_bulk_approve_users: boolean;
  can_system_backup: boolean;
}

/**
 * Permission Utility Types
 */
export type PermissionName = keyof JWTPermissions;
export type CorePermissionName = keyof CorePermissions;
export type PermissionChecker = (permission: PermissionName) => boolean;
export type FeatureFlagChecker = (flag: keyof FeatureFlags) => boolean;

/**
 * Permission Constants
 */
export const PERMISSION_HIERARCHIES = {
  // Admin hierarchy
  FULL_ADMIN: [
    'has_admin_access',
    'has_user_management_access',
    'has_system_settings_access',
    'has_audit_access',
    'has_compliance_access',
    'has_export_access',
  ] as const,
  
  // User management hierarchy
  USER_MANAGER: [
    'has_user_management_access',
    'can_approve_users',
    'has_audit_access',
  ] as const,
  
  // Compliance hierarchy
  COMPLIANCE_OFFICER: [
    'has_compliance_access',
    'has_audit_access',
    'can_manage_emergencies',
    'has_export_access',
  ] as const,
  
  // Research hierarchy
  RESEARCH_LEAD: [
    'can_manage_research',
    'can_manage_clinical_trials',
    'can_view_analytics',
    'can_export_bulk_data',
  ] as const,
} as const;

export type PermissionHierarchy = typeof PERMISSION_HIERARCHIES;
export type PermissionHierarchyName = keyof PermissionHierarchy;

export default JWTPermissions;