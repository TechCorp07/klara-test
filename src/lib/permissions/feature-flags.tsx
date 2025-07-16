// src/lib/permissions/feature-flags.tsx
'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/types/auth.types';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiredPermissions?: string[];
  requiredRoles?: UserRole[];
  environment?: 'development' | 'staging' | 'production' | 'all';
  rolloutPercentage?: number; // 0-100
  dependencies?: string[]; // Other feature flags this depends on
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

interface FeatureFlagConfig {
  userId?: number;
  userRole?: UserRole;
  permissions?: string[];
  environment?: string;
}

/**
 * Phase 3: Permission-Based Feature Flags System
 * Dynamic feature access based on permissions and other criteria
 */
export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private config: FeatureFlagConfig = {};
  private listeners: ((flagId: string, enabled: boolean) => void)[] = [];

  constructor(config?: FeatureFlagConfig) {
    if (config) {
      this.config = config;
    }
    this.initializeDefaultFlags();
  }

  /**
   * Check if a feature flag is enabled for the current user
   */
  public isEnabled(flagId: string): boolean {
    const flag = this.flags.get(flagId);
    if (!flag) {
      return false;
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return false;
    }

    // Check if flag has expired
    if (flag.expiresAt && new Date() > flag.expiresAt) {
      return false;
    }

    // Check environment
    if (flag.environment && flag.environment !== 'all') {
      const currentEnv = process.env.NODE_ENV || 'development';
      if (flag.environment !== currentEnv) {
        return false;
      }
    }

    // Check role requirements
    if (flag.requiredRoles && this.config.userRole) {
      if (!flag.requiredRoles.includes(this.config.userRole)) {
        return false;
      }
    }

    // Check permission requirements
    if (flag.requiredPermissions && this.config.permissions) {
      const hasAllPermissions = flag.requiredPermissions.every(permission =>
        this.config.permissions?.includes(permission)
      );
      if (!hasAllPermissions) {
        return false;
      }
    }

    // Check dependencies
    if (flag.dependencies) {
      const dependenciesMet = flag.dependencies.every(depId => this.isEnabled(depId));
      if (!dependenciesMet) {
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
   * Get a specific feature flag
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
   * Get all enabled feature flags for current user
   */
  public getEnabledFeatures(): string[] {
    return Array.from(this.flags.keys()).filter(flagId => this.isEnabled(flagId));
  }

  /**
   * Update a feature flag
   */
  public updateFlag(flagId: string, updates: Partial<FeatureFlag>): void {
    const existingFlag = this.flags.get(flagId);
    if (existingFlag) {
      const updatedFlag = { ...existingFlag, ...updates };
      this.flags.set(flagId, updatedFlag);
      this.notifyListeners(flagId, this.isEnabled(flagId));
    }
  }

  /**
   * Add a new feature flag
   */
  public addFlag(flag: FeatureFlag): void {
    this.flags.set(flag.id, flag);
    this.notifyListeners(flag.id, this.isEnabled(flag.id));
  }

  /**
   * Remove a feature flag
   */
  public removeFlag(flagId: string): void {
    this.flags.delete(flagId);
    this.notifyListeners(flagId, false);
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<FeatureFlagConfig>): void {
    this.config = { ...this.config, ...config };
    // Notify listeners for all flags as configuration change might affect enablement
    Array.from(this.flags.keys()).forEach(flagId => {
      this.notifyListeners(flagId, this.isEnabled(flagId));
    });
  }

  /**
   * Add listener for flag changes
   */
  public addListener(listener: (flagId: string, enabled: boolean) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove listener
   */
  public removeListener(listener: (flagId: string, enabled: boolean) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Initialize default feature flags
   */
  private initializeDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        id: 'advanced_dashboard',
        name: 'Advanced Dashboard',
        description: 'Enhanced dashboard with real-time analytics',
        enabled: true,
        requiredPermissions: ['can_access_admin'],
        environment: 'all',
        rolloutPercentage: 100
      },
      {
        id: 'beta_user_management',
        name: 'Beta User Management',
        description: 'New user management interface (beta)',
        enabled: true,
        requiredPermissions: ['can_manage_users'],
        requiredRoles: ['admin', 'superadmin'],
        environment: 'all',
        rolloutPercentage: 75
      },
      {
        id: 'emergency_access_module',
        name: 'Emergency Access Module',
        description: 'Advanced emergency access controls',
        enabled: true,
        requiredPermissions: ['can_emergency_access'],
        environment: 'all',
        rolloutPercentage: 100
      },
      {
        id: 'research_data_export',
        name: 'Research Data Export',
        description: 'Enhanced data export capabilities for researchers',
        enabled: true,
        requiredPermissions: ['can_access_research_data'],
        requiredRoles: ['researcher', 'admin'],
        environment: 'all',
        rolloutPercentage: 50
      },
      {
        id: 'patient_portal_v2',
        name: 'Patient Portal V2',
        description: 'Next generation patient portal with enhanced features',
        enabled: false,
        requiredRoles: ['patient'],
        environment: 'development',
        rolloutPercentage: 25
      },
      {
        id: 'ai_diagnostic_assistant',
        name: 'AI Diagnostic Assistant',
        description: 'AI-powered diagnostic recommendations',
        enabled: false,
        requiredPermissions: ['can_access_patient_data'],
        requiredRoles: ['provider', 'admin'],
        environment: 'development',
        rolloutPercentage: 10
      }
    ];

    defaultFlags.forEach(flag => {
      this.flags.set(flag.id, flag);
    });
  }

  /**
   * Hash user ID for consistent rollout percentages
   */
  private hashUserId(userId: number, flagId: string): number {
    const str = `${userId}-${flagId}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Notify all listeners of flag changes
   */
  private notifyListeners(flagId: string, enabled: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(flagId, enabled);
      } catch (error) {
        console.error('Error in feature flag listener:', error);
      }
    });
  }
}

/**
 * React hook for feature flags
 */
export function useFeatureFlags() {
  const { user, hasPermission, getUserRole } = useAuth();
  const [manager] = React.useState(() => {
    return new FeatureFlagManager({
      userId: user?.id,
      userRole: getUserRole(),
      permissions: [] // This would be populated from your permission system
    });
  });
  
  const [enabledFeatures, setEnabledFeatures] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Update manager configuration when user changes
    if (user) {
      const permissions: string[] = [];
      
      // Add permissions based on your JWT payload structure
      if (hasPermission('can_manage_users')) permissions.push('can_manage_users');
      if (hasPermission('can_access_admin')) permissions.push('can_access_admin');
      if (hasPermission('can_access_patient_data')) permissions.push('can_access_patient_data');
      if (hasPermission('can_access_research_data')) permissions.push('can_access_research_data');
      if (hasPermission('can_emergency_access')) permissions.push('can_emergency_access');
      
      manager.updateConfig({
        userId: user.id,
        userRole: getUserRole(),
        permissions
      });

      setEnabledFeatures(manager.getEnabledFeatures());
    }
  }, [user, hasPermission, getUserRole, manager]);

  React.useEffect(() => {
    const handleFlagChange = () => {
      setEnabledFeatures(manager.getEnabledFeatures());
    };

    manager.addListener(handleFlagChange);
    return () => manager.removeListener(handleFlagChange);
  }, [manager]);

  return {
    isEnabled: manager.isEnabled.bind(manager),
    getFlag: manager.getFlag.bind(manager),
    getAllFlags: manager.getAllFlags.bind(manager),
    enabledFeatures,
    updateFlag: manager.updateFlag.bind(manager),
    manager
  };
}

/**
 * Feature Flag component for conditional rendering
 */
interface FeatureFlagProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
  const { isEnabled } = useFeatureFlags();
  
  return isEnabled(flag) ? <>{children}</> : <>{fallback}</>;
}

/**
 * Multiple feature flags component (any enabled)
 */
interface FeatureFlagsProps {
  flags: string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlags({ 
  flags, 
  requireAll = false, 
  children, 
  fallback = null 
}: FeatureFlagsProps) {
  const { isEnabled } = useFeatureFlags();
  
  const hasAccess = requireAll 
    ? flags.every(flag => isEnabled(flag))
    : flags.some(flag => isEnabled(flag));
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Feature flag admin panel component
 */
export function FeatureFlagAdmin() {
  const { getAllFlags, updateFlag, isEnabled } = useFeatureFlags();
  const [flags, setFlags] = React.useState<FeatureFlag[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    setFlags(getAllFlags());
  }, [getAllFlags]);

  const filteredFlags = flags.filter(flag =>
    flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFlag = (flagId: string, enabled: boolean) => {
    updateFlag(flagId, { enabled });
    setFlags(getAllFlags());
  };

  const updateRollout = (flagId: string, percentage: number) => {
    updateFlag(flagId, { rolloutPercentage: percentage });
    setFlags(getAllFlags());
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Feature Flag Management</h2>
        <div className="w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search features..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredFlags.map((flag) => (
          <div key={flag.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-gray-900">{flag.name}</h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isEnabled(flag.id) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isEnabled(flag.id) ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                {flag.rolloutPercentage !== undefined && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Rollout:</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={flag.rolloutPercentage}
                      onChange={(e) => updateRollout(flag.id, Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-900 w-8">{flag.rolloutPercentage}%</span>
                  </div>
                )}
                <button
                  onClick={() => toggleFlag(flag.id, !flag.enabled)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    flag.enabled
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {flag.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-3">{flag.description}</p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {flag.requiredPermissions && (
                <div>
                  <span className="text-gray-600">Required Permissions:</span>
                  <div className="mt-1 space-x-1">
                    {flag.requiredPermissions.map(perm => (
                      <span key={perm} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {flag.requiredRoles && (
                <div>
                  <span className="text-gray-600">Required Roles:</span>
                  <div className="mt-1 space-x-1">
                    {flag.requiredRoles.map(role => (
                      <span key={role} className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {flag.environment && (
                <div>
                  <span className="text-gray-600">Environment:</span>
                  <span className="ml-2 font-medium">{flag.environment}</span>
                </div>
              )}
              
              {flag.dependencies && flag.dependencies.length > 0 && (
                <div>
                  <span className="text-gray-600">Dependencies:</span>
                  <div className="mt-1 space-x-1">
                    {flag.dependencies.map(dep => (
                      <span key={dep} className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredFlags.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No feature flags found matching your search.
        </div>
      )}
    </div>
  );
}

/**
 * Feature flag toggle component for settings
 */
interface FeatureFlagToggleProps {
  flagId: string;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function FeatureFlagToggle({ 
  flagId, 
  label, 
  description, 
  disabled = false 
}: FeatureFlagToggleProps) {
  const { isEnabled, updateFlag, getFlag } = useFeatureFlags();
  const flag = getFlag(flagId);
  const enabled = isEnabled(flagId);

  const toggle = () => {
    if (!disabled && flag) {
      updateFlag(flagId, { enabled: !flag.enabled });
    }
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">
          {label || flag?.name || flagId}
        </div>
        {(description || flag?.description) && (
          <div className="text-sm text-gray-500">
            {description || flag?.description}
          </div>
        )}
      </div>
      <button
        onClick={toggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled 
            ? 'bg-blue-600' 
            : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

/**
 * Feature flag debug component (development only)
 */
export function FeatureFlagDebug() {
  const { enabledFeatures, getAllFlags } = useFeatureFlags();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded text-xs max-w-xs">
      <h4 className="font-bold mb-2">🚩 Feature Flags</h4>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {getAllFlags().map(flag => (
          <div key={flag.id} className="flex justify-between">
            <span className="truncate">{flag.name}</span>
            <span className={enabledFeatures.includes(flag.id) ? 'text-green-400' : 'text-red-400'}>
              {enabledFeatures.includes(flag.id) ? '✅' : '❌'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeatureFlagManager;