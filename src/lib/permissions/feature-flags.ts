// src/lib/permissions/feature-flags.ts
'use client';

import { UserRole } from '@/types/auth.types';

interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  requiredPermissions?: string[];
  requiredRoles?: UserRole[];
  rolloutPercentage?: number;
}

interface FeatureFlagConfig {
  userId?: number;
  userRole?: UserRole;
  permissions?: string[];
}

export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private config: FeatureFlagConfig = {};

  constructor(config?: FeatureFlagConfig) {
    this.config = config || {};
    this.initializeDefaultFlags();
  }

  /**
   * Initialize basic feature flags
   */
  private initializeDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        id: 'user_management',
        name: 'User Management',
        enabled: true,
        requiredPermissions: ['can_manage_users']
      },
      {
        id: 'emergency_access',
        name: 'Emergency Access',
        enabled: true,
        requiredPermissions: ['can_emergency_access']
      },
      {
        id: 'patient_data_access',
        name: 'Patient Data Access',
        enabled: true,
        requiredPermissions: ['can_access_patient_data']
      },
      {
        id: 'research_data_access',
        name: 'Research Data Access',
        enabled: true,
        requiredPermissions: ['can_access_research_data']
      },
      {
        id: 'system_monitoring',
        name: 'System Monitoring',
        enabled: true,
        requiredPermissions: ['can_access_admin']
      },
      {
        id: 'audit_logs',
        name: 'Audit Logs',
        enabled: true,
        requiredPermissions: ['can_access_admin']
      }
    ];

    defaultFlags.forEach(flag => {
      this.flags.set(flag.id, flag);
    });
  }

  /**
   * Check if a feature flag is enabled
   */
  public isEnabled(flagId: string): boolean {
    const flag = this.flags.get(flagId);
    if (!flag || !flag.enabled) {
      return false;
    }

    // Check required roles
    if (flag.requiredRoles && this.config.userRole) {
      if (!flag.requiredRoles.includes(this.config.userRole)) {
        return false;
      }
    }

    // Check required permissions
    if (flag.requiredPermissions && this.config.permissions) {
      const hasAllPermissions = flag.requiredPermissions.every(permission =>
        this.config.permissions!.includes(permission)
      );
      if (!hasAllPermissions) {
        return false;
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && this.config.userId) {
      const userHash = this.hashUserId(this.config.userId, flagId);
      const userPercentile = userHash % 100;
      if (userPercentile >= flag.rolloutPercentage) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all enabled features
   */
  public getEnabledFeatures(): string[] {
    return Array.from(this.flags.keys()).filter(flagId => this.isEnabled(flagId));
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<FeatureFlagConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Update a feature flag
   */
  public updateFlag(flagId: string, updates: Partial<FeatureFlag>): void {
    const existingFlag = this.flags.get(flagId);
    if (existingFlag) {
      const updatedFlag = { ...existingFlag, ...updates };
      this.flags.set(flagId, updatedFlag);
    }
  }

  /**
   * Get feature flag details
   */
  public getFlag(flagId: string): FeatureFlag | undefined {
    return this.flags.get(flagId);
  }

  /**
   * Get all feature flags
   */
  public getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Hash user ID for consistent rollout
   */
  private hashUserId(userId: number, flagId: string): number {
    const str = `${userId}_${flagId}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export default FeatureFlagManager;