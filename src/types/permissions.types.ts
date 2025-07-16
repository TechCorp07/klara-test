// src/types/jwt-permissions.types.ts
/**
 * JWT Permission Types - Permission System Type Definitions
 * 
 */

/**
 * Core Permission Flags
 * 
 * These are the fundamental permission flags that control access to
 * major functional areas of your application. They're embedded in
 * JWT tokens and can be checked instantly without HTTP requests.
 */
export interface CorePermissions {
    // Administrative Access
    has_admin_access: boolean;           // General admin panel access
    has_user_management_access: boolean; // User creation, editing, approval
    has_system_settings_access: boolean; // System configuration changes
    
    // Audit and Compliance
    has_audit_access: boolean;           // Audit log viewing and management
    has_compliance_access: boolean;      // Compliance monitoring and reporting
    has_export_access: boolean;          // Data export capabilities
    
    // Special Access Levels
    is_superadmin: boolean;              // Highest level access
    emergency_access: boolean;           // Emergency override capabilities
    
    // Feature-Specific Permissions
    can_approve_users: boolean;          // User approval workflow
    can_view_phi: boolean;               // Protected Health Information access
    can_manage_emergencies: boolean;     // Emergency access management
    can_manage_research: boolean;        // Research study management
    can_manage_clinical_trials: boolean; // Clinical trial oversight
    
    // Data Access Permissions
    can_view_all_patients: boolean;      // Cross-patient data access
    can_modify_patient_data: boolean;    // Patient data editing
    can_delete_records: boolean;         // Record deletion capabilities
    
    // Reporting Permissions
    can_generate_reports: boolean;       // Report generation access
    can_view_analytics: boolean;         // Analytics dashboard access
    can_export_bulk_data: boolean;       // Bulk data export capabilities
  }
  
  /**
   * Role-Specific Permission Sets
   * 
   * These interfaces define the permission sets that are typically
   * associated with each user role, providing a clear structure for
   * role-based access control while maintaining flexibility.
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
   * 
   * This interface combines all permission types and matches the structure
   * that your backend embeds in JWT tokens. It provides a comprehensive
   * permission system that can be extended as needed.
   */
  export interface JWTPermissions extends CorePermissions {
    // Role-specific permission sets (optional, included based on user role)
    patient_permissions?: PatientPermissions;
    provider_permissions?: ProviderPermissions;
    admin_permissions?: Partial<AdminPermissions>;
    researcher_permissions?: ResearcherPermissions;
    compliance_permissions?: CompliancePermissions;
    
    // Dynamic permission flags (can be added by backend based on business logic)
    custom_permissions?: Record<string, boolean>;
  }
  
  /**
   * Permission Context Interface
   * 
   * This interface defines the context in which permissions are evaluated,
   * including user information and environmental factors that might affect
   * permission decisions.
   */
  export interface PermissionContext {
    user_id: number;
    user_role: string;
    session_id: string;
    
    // Tenant context for multi-tenant applications
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
   * 
   * This interface defines the structure for permission check requests,
   * though with JWT permissions, these checks are typically synchronous
   * and don't require separate requests.
   */
  export interface PermissionCheckRequest {
    permission: keyof JWTPermissions;
    context?: Partial<PermissionContext>;
    resource_id?: string | number;
    action?: 'view' | 'create' | 'update' | 'delete' | 'execute';
  }
  
  /**
   * Permission Check Result Interface
   * 
   * This interface defines the result of permission checks, including
   * the decision and reasoning for audit purposes.
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
   * 
   * This interface defines feature flags that can be embedded in JWT tokens
   * to control access to experimental or gradually rolled-out features.
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
   * Permission Utility Types
   * 
   * These utility types provide helpful type operations for working with
   * permissions throughout your application.
   */
  
  // Extract permission names as a union type
  export type PermissionName = keyof JWTPermissions;
  
  // Extract core permission names
  export type CorePermissionName = keyof CorePermissions;
  
  // Create a type for permission checking functions
  export type PermissionChecker = (permission: PermissionName) => boolean;
  
  // Create a type for feature flag checking functions
  export type FeatureFlagChecker = (flag: keyof FeatureFlags) => boolean;
  
  /**
   * Dashboard Permission Interface
   * 
   * This interface defines the permissions specifically related to dashboard
   * access and functionality, supporting your new permission-based dashboard system.
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
   * 
   * This interface defines permissions for navigation elements,
   * enabling dynamic menu generation based on user permissions.
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
   * Permission Constants
   * 
   * These constants define commonly used permission combinations and
   * hierarchies for easier permission management.
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
  
  // Export permission hierarchy types
  export type PermissionHierarchy = typeof PERMISSION_HIERARCHIES;
  export type PermissionHierarchyName = keyof PermissionHierarchy;
  
  // Export the main permissions interface as default
  export default JWTPermissions;