// src/lib/audit/permission-audit.tsx
'use client';

import React from 'react';
import { UserRole } from '@/types/auth.types';

interface PermissionAuditEntry {
  id: string;
  timestamp: Date;
  userId: number;
  userEmail: string;
  userRole: UserRole;
  action: 'permission_check' | 'permission_granted' | 'permission_revoked' | 'permission_modified' | 'login' | 'logout' | 'emergency_access';
  permission?: string;
  resourceId?: string;
  resourceType?: string;
  granted: boolean;
  changedBy?: number;
  changedByEmail?: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'system' | 'emergency';
}

interface AuditQuery {
  userId?: number;
  userRole?: UserRole;
  permission?: string;
  action?: string;
  category?: string;
  severity?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

interface AuditSummary {
  totalEvents: number;
  successfulAccess: number;
  deniedAccess: number;
  emergencyAccess: number;
  permissionChanges: number;
  uniqueUsers: number;
  topPermissions: Array<{ permission: string; count: number }>;
  topUsers: Array<{ userId: number; email: string; count: number }>;
  securityAlerts: number;
}

interface SecurityPattern {
  id: string;
  name: string;
  description: string;
  pattern: (entries: PermissionAuditEntry[]) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertThreshold: number;
}

/**
 * Phase 3: Permission Audit and Monitoring System
 * Comprehensive tracking and analysis of permission usage
 */
export class PermissionAuditSystem {
  private entries: PermissionAuditEntry[] = [];
  private listeners: ((entry: PermissionAuditEntry) => void)[] = [];
  private securityPatterns: SecurityPattern[] = [];
  private alerts: PermissionAuditEntry[] = [];
  
  constructor() {
    this.initializeSecurityPatterns();
    this.loadMockData();
  }

  /**
   * Log a permission check or action
   */
  public logPermissionCheck(
    userId: number,
    userEmail: string,
    userRole: UserRole,
    permission: string,
    granted: boolean,
    metadata?: Record<string, unknown>
  ): void {
    const entry: PermissionAuditEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      userId,
      userEmail,
      userRole,
      action: 'permission_check',
      permission,
      granted,
      severity: granted ? 'low' : 'medium',
      category: 'authorization',
      sessionId: metadata?.sessionId as string,
      ipAddress: metadata?.ipAddress as string,
      userAgent: metadata?.userAgent as string,
      metadata
    };

    this.addEntry(entry);
  }

  /**
   * Log permission change
   */
  public logPermissionChange(
    targetUserId: number,
    targetUserEmail: string,
    targetUserRole: UserRole,
    permission: string,
    action: 'permission_granted' | 'permission_revoked' | 'permission_modified',
    changedBy: number,
    changedByEmail: string,
    reason?: string,
    metadata?: Record<string, unknown>
  ): void {
    const entry: PermissionAuditEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: targetUserId,
      userEmail: targetUserEmail,
      userRole: targetUserRole,
      action,
      permission,
      granted: action === 'permission_granted',
      changedBy,
      changedByEmail,
      reason,
      severity: 'high',
      category: 'authorization',
      metadata
    };

    this.addEntry(entry);
  }

  /**
   * Log emergency access
   */
  public logEmergencyAccess(
    userId: number,
    userEmail: string,
    userRole: UserRole,
    resourceType: string,
    resourceId: string,
    reason: string,
    metadata?: Record<string, unknown>
  ): void {
    const entry: PermissionAuditEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      userId,
      userEmail,
      userRole,
      action: 'emergency_access',
      resourceType,
      resourceId,
      granted: true,
      reason,
      severity: 'critical',
      category: 'emergency',
      metadata
    };

    this.addEntry(entry);
  }

  /**
   * Log authentication events
   */
  public logAuthentication(
    userId: number,
    userEmail: string,
    userRole: UserRole,
    action: 'login' | 'logout',
    sessionId: string,
    metadata?: Record<string, unknown>
  ): void {
    const entry: PermissionAuditEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      userId,
      userEmail,
      userRole,
      action,
      granted: true,
      sessionId,
      severity: 'low',
      category: 'authentication',
      metadata
    };

    this.addEntry(entry);
  }

  /**
   * Query audit entries
   */
  public queryEntries(query: AuditQuery = {}): PermissionAuditEntry[] {
    let filteredEntries = [...this.entries];

    if (query.userId !== undefined) {
      filteredEntries = filteredEntries.filter(entry => entry.userId === query.userId);
    }

    if (query.userRole) {
      filteredEntries = filteredEntries.filter(entry => entry.userRole === query.userRole);
    }

    if (query.permission) {
      filteredEntries = filteredEntries.filter(entry => entry.permission === query.permission);
    }

    if (query.action) {
      filteredEntries = filteredEntries.filter(entry => entry.action === query.action);
    }

    if (query.category) {
      filteredEntries = filteredEntries.filter(entry => entry.category === query.category);
    }

    if (query.severity) {
      filteredEntries = filteredEntries.filter(entry => entry.severity === query.severity);
    }

    if (query.startDate) {
      filteredEntries = filteredEntries.filter(entry => entry.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      filteredEntries = filteredEntries.filter(entry => entry.timestamp <= query.endDate!);
    }

    // Sort by timestamp (newest first)
    filteredEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    if (query.offset !== undefined || query.limit !== undefined) {
      const offset = query.offset || 0;
      const limit = query.limit || 50;
      filteredEntries = filteredEntries.slice(offset, offset + limit);
    }

    return filteredEntries;
  }

  /**
   * Get audit summary for dashboard
   */
  public getAuditSummary(timeRange?: { start: Date; end: Date }): AuditSummary {
    let entries = this.entries;

    if (timeRange) {
      entries = entries.filter(entry => 
        entry.timestamp >= timeRange.start && entry.timestamp <= timeRange.end
      );
    }

    const summary: AuditSummary = {
      totalEvents: entries.length,
      successfulAccess: entries.filter(entry => entry.granted && entry.action === 'permission_check').length,
      deniedAccess: entries.filter(entry => !entry.granted && entry.action === 'permission_check').length,
      emergencyAccess: entries.filter(entry => entry.action === 'emergency_access').length,
      permissionChanges: entries.filter(entry => 
        ['permission_granted', 'permission_revoked', 'permission_modified'].includes(entry.action)
      ).length,
      uniqueUsers: new Set(entries.map(entry => entry.userId)).size,
      topPermissions: this.getTopPermissions(entries),
      topUsers: this.getTopUsers(entries),
      securityAlerts: this.alerts.length
    };

    return summary;
  }

  /**
   * Get security alerts
   */
  public getSecurityAlerts(): PermissionAuditEntry[] {
    return [...this.alerts];
  }

  /**
   * Add event listener for new audit entries
   */
  public addEventListener(listener: (entry: PermissionAuditEntry) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(listener: (entry: PermissionAuditEntry) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Export audit data
   */
  public exportAuditData(
    format: 'json' | 'csv',
    query: AuditQuery = {}
  ): string {
    const data = this.queryEntries(query);

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // CSV format
    const headers = [
      'Timestamp', 'User ID', 'User Email', 'User Role', 'Action', 
      'Permission', 'Granted', 'Changed By', 'Reason', 'IP Address', 
      'Severity', 'Category'
    ];

    const rows = data.map(entry => [
      entry.timestamp.toISOString(),
      entry.userId.toString(),
      entry.userEmail,
      entry.userRole,
      entry.action,
      entry.permission || '',
      entry.granted.toString(),
      entry.changedByEmail || '',
      entry.reason || '',
      entry.ipAddress || '',
      entry.severity,
      entry.category
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * Clear old entries
   */
  public clearOldEntries(olderThan: Date): number {
    const initialCount = this.entries.length;
    this.entries = this.entries.filter(entry => entry.timestamp > olderThan);
    return initialCount - this.entries.length;
  }

  /**
   * Private method to add entry and check for security patterns
   */
  private addEntry(entry: PermissionAuditEntry): void {
    this.entries.push(entry);
    
    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(entry);
      } catch (error) {
        console.error('Error in audit listener:', error);
      }
    });

    // Check for security patterns
    this.checkSecurityPatterns(entry);
  }

  /**
   * Initialize security pattern detection
   */
  private initializeSecurityPatterns(): void {
    this.securityPatterns = [
      {
        id: 'multiple_failed_access',
        name: 'Multiple Failed Permission Checks',
        description: 'User has multiple denied permission checks in short time',
        severity: 'medium',
        alertThreshold: 5,
        pattern: (entries: PermissionAuditEntry[]) => {
          const recentEntries = entries.filter(entry => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            return entry.timestamp > fiveMinutesAgo && !entry.granted && entry.action === 'permission_check';
          });
          return recentEntries.length >= 5;
        }
      },
      {
        id: 'unusual_permission_pattern',
        name: 'Unusual Permission Access Pattern',
        description: 'User accessing permissions outside normal hours or pattern',
        severity: 'medium',
        alertThreshold: 1,
        pattern: (entries: PermissionAuditEntry[]) => {
          const now = new Date();
          const isOutsideHours = now.getHours() < 6 || now.getHours() > 22;
          return isOutsideHours && entries.some(entry => entry.granted && entry.severity === 'high');
        }
      },
      {
        id: 'emergency_access_spike',
        name: 'Emergency Access Spike',
        description: 'Multiple emergency access events in short timeframe',
        severity: 'critical',
        alertThreshold: 3,
        pattern: (entries: PermissionAuditEntry[]) => {
          const recentEmergencyAccess = entries.filter(entry => {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return entry.timestamp > oneHourAgo && entry.action === 'emergency_access';
          });
          return recentEmergencyAccess.length >= 3;
        }
      }
    ];
  }

  /**
   * Check for security patterns and generate alerts
   */
  private checkSecurityPatterns(newEntry: PermissionAuditEntry): void {
    const recentEntries = this.entries.filter(entry => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return entry.timestamp > oneHourAgo && entry.userId === newEntry.userId;
    });

    this.securityPatterns.forEach(pattern => {
      if (pattern.pattern(recentEntries)) {
        const alertEntry: PermissionAuditEntry = {
          ...newEntry,
          id: this.generateId(),
          action: 'permission_check',
          severity: pattern.severity,
          category: 'system',
          reason: `Security pattern detected: ${pattern.name}`,
          metadata: {
            patternId: pattern.id,
            patternDescription: pattern.description,
            triggeringUserId: newEntry.userId
          }
        };

        // Only add if not already alerted for this pattern recently
        const existingAlert = this.alerts.find(alert => 
          alert.metadata?.patternId === pattern.id &&
          alert.userId === newEntry.userId &&
          alert.timestamp > new Date(Date.now() - 60 * 60 * 1000)
        );

        if (!existingAlert) {
          this.alerts.push(alertEntry);
        }
      }
    });
  }

  /**
   * Generate unique ID for entries
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  /**
   * Get top permissions by usage
   */
  private getTopPermissions(entries: PermissionAuditEntry[]): Array<{ permission: string; count: number }> {
    const permissionCounts = new Map<string, number>();

    entries
      .filter(entry => entry.permission && entry.action === 'permission_check')
      .forEach(entry => {
        const permission = entry.permission!;
        permissionCounts.set(permission, (permissionCounts.get(permission) || 0) + 1);
      });

    return Array.from(permissionCounts.entries())
      .map(([permission, count]) => ({ permission, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Get top users by audit events
   */
  private getTopUsers(entries: PermissionAuditEntry[]): Array<{ userId: number; email: string; count: number }> {
    const userCounts = new Map<number, { email: string; count: number }>();

    entries.forEach(entry => {
      const existing = userCounts.get(entry.userId);
      userCounts.set(entry.userId, {
        email: entry.userEmail,
        count: (existing?.count || 0) + 1
      });
    });

    return Array.from(userCounts.entries())
      .map(([userId, { email, count }]) => ({ userId, email, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Load mock data for testing
   * FIXED: Reordered spread operator to prevent property overwriting
   */
  private loadMockData(): void {
    const now = new Date();
    const mockEntries = [
      {
        userId: 1,
        userEmail: 'admin@example.com',
        userRole: 'admin' as UserRole,
        action: 'permission_check' as const,
        permission: 'can_manage_users',
        granted: true,
        severity: 'low' as const,
        category: 'authorization' as const,
        timestamp: new Date(now.getTime() - 60000)
      },
      {
        userId: 2,
        userEmail: 'provider@example.com',
        userRole: 'provider' as UserRole,
        action: 'permission_check' as const,
        permission: 'can_access_patient_data',
        granted: true,
        severity: 'low' as const,
        category: 'authorization' as const,
        timestamp: new Date(now.getTime() - 120000)
      },
      {
        userId: 3,
        userEmail: 'patient@example.com',
        userRole: 'patient' as UserRole,
        action: 'permission_check' as const,
        permission: 'can_manage_users',
        granted: false,
        severity: 'medium' as const,
        category: 'authorization' as const,
        timestamp: new Date(now.getTime() - 180000)
      },
      {
        userId: 1,
        userEmail: 'admin@example.com',
        userRole: 'admin' as UserRole,
        action: 'emergency_access' as const,
        resourceType: 'patient_record',
        resourceId: '12345',
        granted: true,
        reason: 'Medical emergency - patient unresponsive',
        severity: 'critical' as const,
        category: 'emergency' as const,
        timestamp: new Date(now.getTime() - 240000)
      }
    ];

    mockEntries.forEach(partial => {
      const entry: PermissionAuditEntry = {
        id: this.generateId(),
        ...partial
      } as PermissionAuditEntry;
    
      this.entries.push(entry);
    });
  }
}

export function usePermissionAudit() {
  const [auditSystem] = React.useState(() => new PermissionAuditSystem());
  const [recentEntries, setRecentEntries] = React.useState<PermissionAuditEntry[]>([]);
  const [alerts, setAlerts] = React.useState<PermissionAuditEntry[]>([]);

  React.useEffect(() => {
    const handleNewEntry = (entry: PermissionAuditEntry) => {
      setRecentEntries(prev => [entry, ...prev.slice(0, 49)]); // Keep last 50
      setAlerts(auditSystem.getSecurityAlerts());
    };

    auditSystem.addEventListener(handleNewEntry);
    
    // Initialize with existing data
    setRecentEntries(auditSystem.queryEntries({ limit: 50 }));
    setAlerts(auditSystem.getSecurityAlerts());

    return () => {
      auditSystem.removeEventListener(handleNewEntry);
    };
  }, [auditSystem]);

  return {
    auditSystem,
    recentEntries,
    alerts,
    logPermissionCheck: auditSystem.logPermissionCheck.bind(auditSystem),
    logPermissionChange: auditSystem.logPermissionChange.bind(auditSystem),
    logEmergencyAccess: auditSystem.logEmergencyAccess.bind(auditSystem),
    logAuthentication: auditSystem.logAuthentication.bind(auditSystem),
    queryEntries: auditSystem.queryEntries.bind(auditSystem),
    getAuditSummary: auditSystem.getAuditSummary.bind(auditSystem),
    exportAuditData: auditSystem.exportAuditData.bind(auditSystem)
  };
}

export default PermissionAuditSystem;