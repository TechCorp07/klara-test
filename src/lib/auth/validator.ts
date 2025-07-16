// src/lib/auth/validator.ts
import { UserRole } from '@/types/auth.types';

/**
 * JWT Payload Interface
 */
export interface JWTPayload {
  // Core user identity
  user_id: number;
  email: string;
  role: UserRole;
  
  // JWT standard fields
  exp: number;           // Expiration timestamp (seconds since epoch)
  iat: number;           // Issued at timestamp
  jti: string;           // JWT ID for token tracking
  sub: string;           // Subject (usually user ID as string)
  
  // Session and security tracking
  session_id: string;
  jwt_version: number;   // For token invalidation when needed
  last_password_change?: number;
  
  // Multi-tenant support
  primary_tenant_id?: number;
  pharmaceutical_tenant_id?: number;
  
  // Permission flags (embedded from backend for fast access)
  permissions?: {
    // Administrative permissions
    has_admin_access?: boolean;
    has_user_management_access?: boolean;
    has_system_settings_access?: boolean;
    
    // Audit and compliance permissions
    has_audit_access?: boolean;
    has_compliance_access?: boolean;
    has_export_access?: boolean;
    
    // Special access levels
    is_superadmin?: boolean;
    emergency_access?: boolean;
    
    // Feature-specific permissions (extensible)
    can_approve_users?: boolean;
    can_view_phi?: boolean;
    can_manage_emergencies?: boolean;
  };
  
  // Emergency access tracking
  emergency_access?: boolean;
  emergency_reason?: string;
  emergency_expires?: number;
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
    const requiredFields = ['user_id', 'email', 'role', 'exp', 'iat', 'jti'];
    
    for (const field of requiredFields) {
      if (!(field in payload) || payload[field as keyof JWTPayload] === null) {
        return {
          isValid: false,
          error: `${JWTValidationError.MISSING_REQUIRED_FIELDS}: Missing ${field}`,
        };
      }
    }

    // Validate field types
    if (typeof payload.user_id !== 'number' || payload.user_id <= 0) {
      return {
        isValid: false,
        error: `${JWTValidationError.MISSING_REQUIRED_FIELDS}: Invalid user_id`,
      };
    }

    if (typeof payload.email !== 'string' || !payload.email.includes('@')) {
      return {
        isValid: false,
        error: `${JWTValidationError.MISSING_REQUIRED_FIELDS}: Invalid email format`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate JWT timestamps (expiration, issued at)
   */
  private static validateTimestamps(payload: JWTPayload): JWTValidationResult {
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token has expired
    if (payload.exp <= currentTime) {
      return {
        isValid: false,
        error: JWTValidationError.TOKEN_EXPIRED,
      };
    }

    // Check if token was issued in the future (with small tolerance for clock skew)
    const clockSkewToleranceSeconds = 60; // 1 minute tolerance
    if (payload.iat > currentTime + clockSkewToleranceSeconds) {
      return {
        isValid: false,
        error: JWTValidationError.FUTURE_TOKEN,
      };
    }

    return { isValid: true };
  }

  /**
   * Extract user permissions from JWT payload
   */
  static extractPermissions(payload: JWTPayload): JWTPayload['permissions'] {
    return payload.permissions || {};
  }

  /**
   * Check if user has a specific permission
   */
  static hasPermission(
    payload: JWTPayload, 
    permission: keyof NonNullable<JWTPayload['permissions']>
  ): boolean {
    return Boolean(payload.permissions?.[permission]);
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
    if (routePath.startsWith('/admin') && !payload.permissions?.has_admin_access) {
      return {
        isValid: false,
        error: 'Insufficient permissions for admin access',
      };
    }

    return validationResult;
  }
}

/**
 * FIXED: Added missing convenience functions that were causing import errors
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
  permission: keyof NonNullable<JWTPayload['permissions']>
): boolean {
  const payload = extractJWTPayload(token);
  return payload ? JWTValidator.hasPermission(payload, permission) : false;
}

export function getJWTUserRole(token: string): UserRole | null {
  const payload = extractJWTPayload(token);
  return payload ? payload.role : null;
}

export default JWTValidator;