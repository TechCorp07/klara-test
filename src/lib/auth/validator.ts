// src/lib/auth/validator.ts
import { UserRole } from '@/types/auth.types';

/**
 * JWT Payload Interface - Updated to match backend structure
 */
export interface JWTPayload {
  // Core user identity
  user_id: number;
  username: string;    // Backend uses username as primary identifier
  email: string;       // Email is separate field
  role: UserRole;
  
  // JWT standard fields
  exp: number;           // Expiration timestamp (seconds since epoch)
  iat: number;           // Issued at timestamp
  jti: string;           // JWT ID for token tracking
  sub: string;           // Subject (usually user ID as string)
  iss: string;           // Issuer
  
  // Backend-specific fields
  is_approved: boolean;
  email_verified: boolean;
  two_factor_enabled: boolean;
  
  // Session and security tracking
  session_id: string;
  jwt_version: number;   // For token invalidation when needed
  last_password_change?: number;
  
  // Multi-tenant support
  primary_tenant_id?: number;
  tenant_ids?: number[];
  
  // Research participant
  research_participant_id?: number;
  
  // Emergency access
  emergency_access_enabled?: boolean;
  is_emergency_session?: boolean;
  
  // Device tracking
  device_fingerprint?: string;
  
  // Permission flags (embedded from backend for fast access)
  // Updated to match backend permission structure
  permissions?: {
    role: string;
    is_admin: boolean;
    is_superadmin: boolean;
    is_staff: boolean;
    can_access_admin: boolean;
    can_manage_users: boolean;
    can_access_patient_data: boolean;
    can_access_research_data: boolean;
    can_emergency_access: boolean;
    pharmaceutical_tenants: any[];
    
    // Additional permissions that might be added
    has_audit_access?: boolean;
    has_compliance_access?: boolean;
    has_export_access?: boolean;
    has_dashboard_access?: boolean;
    has_compliance_reports_access?: boolean;
    has_approval_permissions?: boolean;
    has_medical_records_access?: boolean;
    can_manage_appointments?: boolean;
    can_access_telemedicine?: boolean;
    can_manage_medications?: boolean;
    can_view_research_data?: boolean;
    can_access_clinical_trials?: boolean;
    can_view_own_data?: boolean;
    can_edit_own_profile?: boolean;
    can_approve_users?: boolean;
    can_view_phi?: boolean;
    can_manage_emergencies?: boolean;
    identity_verified?: boolean;
  };
}

/**
 * JWT Validation Result Interface
 */
export interface JWTValidationResult {
  isValid: boolean;
  payload?: JWTPayload;
  error?: string;
  expiresIn?: number;     // Seconds until expiration
  needsRefresh?: boolean; // True if token expires soon
}

/**
 * JWT Validation Error Types
 */
export enum JWTValidationError {
  INVALID_FORMAT = 'INVALID_FORMAT',
  MISSING_PARTS = 'MISSING_PARTS',
  DECODE_ERROR = 'DECODE_ERROR',
  MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_ROLE = 'INVALID_ROLE',
  MALFORMED_PAYLOAD = 'MALFORMED_PAYLOAD',
  FUTURE_TOKEN = 'FUTURE_TOKEN', // Token issued in the future
}

/**
 * JWT Validator Class
 */
export class JWTValidator {
  // Validation constants
  private static readonly REFRESH_THRESHOLD_MINUTES = 5; // Suggest refresh if expires in 5 min
  private static readonly VALID_ROLES: UserRole[] = [
    'patient', 'provider', 'admin', 'pharmco', 'caregiver', 
    'researcher', 'superadmin', 'compliance'
  ];

  /**
   * Primary validation method - validates JWT structure and content
   */
  static validateToken(token: string): JWTValidationResult {
    try {
      // Step 1: Basic format validation
      if (!token || typeof token !== 'string') {
        return {
          isValid: false,
          error: 'Token is required and must be a string',
        };
      }

      // Step 2: JWT structure validation (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return {
          isValid: false,
          error: JWTValidationError.MISSING_PARTS,
        };
      }

      // Step 3: Decode payload without signature verification
      const payload = this.decodePayload(parts[1]);
      if (!payload) {
        return {
          isValid: false,
          error: JWTValidationError.DECODE_ERROR,
        };
      }

      // Step 4: Validate required fields
      const fieldValidation = this.validateRequiredFields(payload);
      if (!fieldValidation.isValid) {
        return fieldValidation;
      }

      // Step 5: Time-based validations
      const timeValidation = this.validateTimestamps(payload);
      if (!timeValidation.isValid) {
        return timeValidation;
      }

      // Step 6: Role validation
      if (!this.VALID_ROLES.includes(payload.role)) {
        return {
          isValid: false,
          error: JWTValidationError.INVALID_ROLE,
        };
      }

      // Step 7: Calculate time until expiration
      const currentTime = Math.floor(Date.now() / 1000);
      const expiresIn = payload.exp - currentTime;
      const needsRefresh = expiresIn < (this.REFRESH_THRESHOLD_MINUTES * 60);

      // All validations passed
      return {
        isValid: true,
        payload,
        expiresIn,
        needsRefresh,
      };

    } catch (error) {
      return {
        isValid: false,
        error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Decode JWT payload from base64
   */
  private static decodePayload(payloadBase64: string): JWTPayload | null {
    try {
      // Handle base64 padding - JWT often omits padding characters
      const paddedPayload = payloadBase64.padEnd(
        payloadBase64.length + (4 - payloadBase64.length % 4) % 4,
        '='
      );

      // Decode base64 and parse JSON
      const payloadJson = atob(paddedPayload);
      const payload = JSON.parse(payloadJson) as JWTPayload;

      return payload;
    } catch (error) {
      console.error('JWT payload decode error:', error);
      return null;
    }
  }

  /**
   * Validate that all required fields are present in the JWT payload
   */
  private static validateRequiredFields(payload: JWTPayload): JWTValidationResult {
    const requiredFields = ['user_id', 'username', 'email', 'role', 'exp', 'iat', 'jti'];
    
    for (const field of requiredFields) {
      if (!(field in payload) || payload[field as keyof JWTPayload] === undefined) {
        return {
          isValid: false,
          error: `${JWTValidationError.MISSING_REQUIRED_FIELDS}: Missing required field '${field}'`,
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate timestamp fields (expiration and issued at)
   */
  private static validateTimestamps(payload: JWTPayload): JWTValidationResult {
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token is expired
    if (payload.exp <= currentTime) {
      return {
        isValid: false,
        error: JWTValidationError.TOKEN_EXPIRED,
      };
    }

    // Check if token was issued in the future (clock skew protection)
    if (payload.iat > currentTime + 60) { // Allow 60 seconds of clock skew
      return {
        isValid: false,
        error: JWTValidationError.FUTURE_TOKEN,
      };
    }

    return { isValid: true };
  }

  /**
   * Check if user has specific permission
   * Updated to handle both backend permission names and frontend permission names
   */
  static hasPermission(
    payload: JWTPayload, 
    permission: string
  ): boolean {
    if (!payload.permissions) return false;

    // Direct permission check
    if (payload.permissions[permission as keyof typeof payload.permissions] === true) {
      return true;
    }

    // Map frontend permission names to backend permission names
    const permissionMap: Record<string, string> = {
      'has_admin_access': 'can_access_admin',
      'has_user_management_access': 'can_manage_users',
      'has_audit_access': 'has_audit_access',
      'has_compliance_access': 'has_compliance_access',
      'has_system_settings_access': 'can_access_admin',
      'has_export_access': 'has_export_access',
      'is_superadmin': 'is_superadmin',
      'has_patient_data_access': 'can_access_patient_data',
      'has_research_data_access': 'can_access_research_data',
      'can_emergency_access': 'can_emergency_access',
    };

    const backendPermission = permissionMap[permission];
    if (backendPermission) {
      return payload.permissions[backendPermission as keyof typeof payload.permissions] === true;
    }

    return false;
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(
    payload: JWTPayload,
    permissions: string[]
  ): boolean {
    return permissions.some(permission => this.hasPermission(payload, permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  static hasAllPermissions(
    payload: JWTPayload,
    permissions: string[]
  ): boolean {
    return permissions.every(permission => this.hasPermission(payload, permission));
  }

  /**
   * Get user role from JWT payload
   */
  static getUserRole(payload: JWTPayload): UserRole {
    return payload.role;
  }

  /**
   * Check if token needs refresh soon
   */
  static needsRefresh(payload: JWTPayload): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = payload.exp - currentTime;
    return expiresIn < (this.REFRESH_THRESHOLD_MINUTES * 60);
  }

  /**
   * Get remaining token lifetime in seconds
   */
  static getTimeToExpiration(payload: JWTPayload): number {
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  }

  /**
   * Validate token for specific route access
   */
  static validateForRoute(token: string, routePath: string): JWTValidationResult {
    // First validate the token structure
    const validationResult = this.validateToken(token);
    if (!validationResult.isValid || !validationResult.payload) {
      return validationResult;
    }

    const { payload } = validationResult;

    // Add route-specific permission checks here
    if (routePath.startsWith('/admin') && !this.hasPermission(payload, 'has_admin_access')) {
      return {
        isValid: false,
        error: 'Insufficient permissions for admin access',
      };
    }

    return validationResult;
  }
}

/**
 * Convenience functions for easier usage
 */

export function validateJWT(token: string): JWTValidationResult {
  return JWTValidator.validateToken(token);
}

export function extractJWTPayload(token: string): JWTPayload | null {
  const result = JWTValidator.validateToken(token);
  return result.isValid ? result.payload || null : null;
}

export function checkJWTPermission(
  token: string, 
  permission: string
): boolean {
  const payload = extractJWTPayload(token);
  return payload ? JWTValidator.hasPermission(payload, permission) : false;
}

export function getJWTUserRole(token: string): UserRole | null {
  const payload = extractJWTPayload(token);
  return payload ? payload.role : null;
}

export default JWTValidator;