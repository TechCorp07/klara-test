// src/types/admin.types.ts

import { User } from './auth.types';

export interface UserFilters {
  page: number;
  page_size: number;
  search: string;
  role: string;
  is_active?: boolean;
  is_approved?: boolean;
  is_locked?: boolean;
  verification_status?: string;
  date_joined_after?: string;
  date_joined_before?: string;
  last_login_after?: string;
  last_login_before?: string;
  ordering: string;
}

export interface PaginatedUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface DashboardStatsResponse {
  total_users: number;
  pending_approvals: number;
  active_users_today: number;
  system_alerts: number;
  emergency_access_events: number;
  failed_logins_24h: number;
  new_registrations_7d: number;
  locked_accounts: number;
  verification_required: number;
  compliance_issues: number;
  uptime_percentage: number;
  response_time_ms: number;
  users_by_role: Record<string, number>;
  monthly_registrations: Array<{ month: string; count: number }>;
  daily_active_users: Array<{ date: string; count: number }>;
}

export interface AdminUserDetail extends Omit<User, 'profile'> {
  // Extended user information for admin view
  profile: {
    first_name: string;
    last_name: string;
    phone_number?: string;
    date_of_birth?: string;
    emergency_contact?: string;
    institution?: string;
    company_name?: string;
    license_number?: string;
    npi?: string;
    specialization?: string;
    department?: string;
    research_focus?: string;
    orcid?: string;
    regulatory_id?: string;
    company_address?: string;
    fda_registration?: string;
    verified_credentials?: boolean;
    verification_expiry?: string;
    days_until_verification_required?: number;
  };
  registration_data: {
    registration_ip: string;
    user_agent?: string;
    documents_submitted: string[];
    verification_status: string;
    approval_notes?: string;
    approved_by?: string;
    approved_at?: string;
    rejected_by?: string;
    rejected_at?: string;
    rejection_reason?: string;
  };
  security_info: {
    failed_login_attempts: number;
    last_failed_login?: string;
    account_locked_until?: string;
    password_changed_at?: string;
    two_factor_enabled: boolean;
    backup_codes_generated: boolean;
    emergency_access_granted?: boolean;
    emergency_access_expires?: string;
  };
  activity_summary: {
    login_count: number;
    last_activity?: string;
    sessions_count: number;
    documents_accessed: number;
    consent_records_count: number;
  };
}

export interface BulkActionRequest {
  action: 'approve' | 'reject' | 'activate' | 'deactivate' | 'lock' | 'unlock' | 'reset_password';
  user_ids: number[];
  note?: string;
}

export interface BulkActionResponse {
  success: boolean;
  message: string;
  processed_count: number;
  failed_count: number;
  errors?: Array<{
    user_id: number;
    error: string;
  }>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_id?: number;
  user_email?: string;
  user_role?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address: string;
  user_agent?: string;
  request_data?: Record<string, unknown>;
  response_status?: number;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  compliance_event: boolean;
  hipaa_event: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

type BulkActionType =
  | 'approve'
  | 'reject'
  | 'activate'
  | 'deactivate'
  | 'lock'
  | 'unlock'
  | 'reset_password';
export type { BulkActionType };

export interface SystemHealthData {
  overall_status: 'healthy' | 'warning' | 'critical';
  uptime_percentage: number;
  response_time_ms: number;
  active_sessions: number;
  database_health: {
    status: 'healthy' | 'slow' | 'error';
    connection_count: number;
    query_time_avg: number;
    slow_queries: number;
  };
  redis_health: {
    status: 'healthy' | 'slow' | 'error';
    memory_usage: number;
    cache_hit_ratio: number;
  };
  email_service: {
    status: 'healthy' | 'degraded' | 'error';
    queue_size: number;
    failed_emails_24h: number;
  };
  storage_health: {
    status: 'healthy' | 'warning' | 'full';
    usage_percentage: number;
    free_space_gb: number;
  };
  security_status: {
    failed_logins_rate: number;
    blocked_ips_count: number;
    suspicious_activity: number;
  };
  recent_alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
  last_backup: string;
  next_maintenance: string;
}

export interface SystemSettings {
  // Security Settings
  max_login_attempts: number;
  account_lockout_duration: number;
  password_expiry_days: number;
  session_timeout_minutes: number;
  require_2fa_for_admins: boolean;
  
  // Registration Settings
  require_manual_approval: boolean;
  allowed_email_domains: string[];
  default_user_role: string;
  enable_self_registration: boolean;
  
  // HIPAA Compliance Settings
  audit_log_retention_days: number;
  emergency_access_timeout_hours: number;
  consent_document_version: string;
  privacy_notice_version: string;
  
  // Email Settings
  email_notifications_enabled: boolean;
  admin_notification_email: string;
  
  // System Maintenance
  maintenance_mode: boolean;
  maintenance_message: string;
  
  // Feature Flags
  enable_telemedicine: boolean;
  enable_research_participation: boolean;
  enable_medication_tracking: boolean;
  enable_wearable_integration: boolean;
}

export interface ComplianceReport {
  id: string;
  report_type: 'hipaa_audit' | 'user_activity' | 'security_summary' | 'consent_compliance';
  generated_at: string;
  generated_by: string;
  date_range: {
    start: string;
    end: string;
  };
  summary: {
    total_events: number;
    compliance_violations: number;
    resolved_issues: number;
    pending_issues: number;
  };
  file_url?: string;
  status: 'generating' | 'completed' | 'failed';
}

export interface EmergencyAccessEvent {
  id: string;
  user_id: number;
  user_email: string;
  granted_by?: string;
  reason: string;
  granted_at: string;
  expires_at: string;
  revoked_at?: string;
  revoked_by?: string;
  access_log: Array<{
    timestamp: string;
    action: string;
    resource: string;
  }>;
  reviewed: boolean;
  reviewer?: string;
  review_notes?: string;
  compliance_risk: 'low' | 'medium' | 'high';
}

export interface AdminUserCreateData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  role: 'admin' | 'superadmin';
  profile: {
    first_name: string;
    last_name: string;
    phone_number?: string;
  };
  permissions: {
    has_user_management_access: boolean;
    has_system_settings_access: boolean;
    has_audit_access: boolean;
    has_compliance_access: boolean;
    has_export_access: boolean;
  };
}

export interface AdminPermissions {
  has_admin_access: boolean;
  has_dashboard_access: boolean;
  has_approval_permissions?: boolean;
  has_user_management_access: boolean;
  has_system_settings_access: boolean;
  has_audit_access: boolean;
  has_compliance_access: boolean;
  has_compliance_reports_access: boolean;
  has_export_access: boolean;
  user_role: string;
  is_superadmin: boolean;
  has_patient_data_access?: boolean;
  has_medical_records_access?: boolean;
  can_manage_appointments?: boolean;
  can_view_own_data?: boolean;
  can_access_telemedicine?: boolean;
  can_manage_medications?: boolean;
  can_view_research_data?: boolean;
  can_access_clinical_trials?: boolean;
}

export interface UserActionLog {
  id: string;
  action: string;
  timestamp: string;
  admin_user: string;
  target_user: string;
  details: string;
  ip_address: string;
  success: boolean;
  error_message?: string;
}

export interface ConsentRecord {
  id: string;
  user_id: number;
  document_type: string;
  document_version: string;
  consented: boolean;
  signed_at: string;
  ip_address: string;
  user_agent?: string;
  expires_at?: string;
  revoked_at?: string;
  digital_signature?: string;
}

export interface SystemMonitoringData {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: {
    bytes_sent: number;
    bytes_received: number;
  };
  database_connections: number;
  active_users: number;
  request_rate: number;
  error_rate: number;
  response_times: {
    p50: number;
    p95: number;
    p99: number;
  };
  timestamp: string;
}

export interface SecurityAlert {
  id: string;
  type: 'brute_force' | 'suspicious_login' | 'data_breach' | 'unauthorized_access' | 'malware_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detected_at: string;
  source_ip?: string;
  affected_user?: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assigned_to?: string;
  resolution_notes?: string;
  resolved_at?: string;
}

// API Response Types
export interface AdminDashboardResponse {
  quick_stats: DashboardStatsResponse;
  recent_activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
    severity?: string;
    metadata?: Record<string, unknown>;
  }>;
  system_status: SystemHealthData;
}

export interface UserManagementResponse {
  users: PaginatedUsersResponse;
  stats: {
    total_users: number;
    users_by_role: Record<string, number>;
    recent_registrations: number;
    pending_approvals: number;
    locked_accounts: number;
    users_requiring_verification: number;
  };
}

export interface ExportRequest {
  export_type: 'users' | 'audit_logs' | 'compliance_report' | 'system_report';
  format: 'csv' | 'xlsx' | 'pdf';
  filters?: Record<string, unknown>;
  date_range?: {
    start: string;
    end: string;
  };
  include_sensitive_data?: boolean;
}

export interface ExportJobStatus {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimated_completion?: string;
  download_url?: string;
  error_message?: string;
  created_at: string;
}

// Form Types
export interface UserApprovalForm {
  note: string;
  send_notification: boolean;
}

export interface UserRejectionForm {
  reason: string;
  send_notification: boolean;
  block_email_domain: boolean;
}

export interface SystemMaintenanceForm {
  maintenance_mode: boolean;
  maintenance_message: string;
  scheduled_start?: string;
  scheduled_end?: string;
  notify_users: boolean;
}

export interface SecuritySettingsForm {
  max_login_attempts: number;
  account_lockout_duration: number;
  password_expiry_days: number;
  session_timeout_minutes: number;
  require_2fa_for_admins: boolean;
  enable_rate_limiting: boolean;
  block_suspicious_ips: boolean;
}

// Chart/Analytics Types
export interface AnalyticsData {
  user_registrations: Array<{ date: string; count: number }>;
  login_activity: Array<{ hour: number; count: number }>;
  role_distribution: Array<{ role: string; count: number; percentage: number }>;
  geographic_distribution: Array<{ country: string; count: number }>;
  device_types: Array<{ device: string; count: number }>;
  security_events: Array<{ date: string; type: string; count: number }>;
}

export interface PerformanceMetrics {
  api_response_times: Array<{ endpoint: string; avg_time: number; request_count: number }>;
  database_performance: Array<{ query: string; avg_time: number; execution_count: number }>;
  error_rates: Array<{ endpoint: string; error_rate: number; error_count: number }>;
  uptime_history: Array<{ date: string; uptime_percentage: number }>;
}
