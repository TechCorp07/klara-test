// src/lib/audit/permission-audit.ts
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
  metadata?: Record<string, any>;
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
    metadata?: Record<string, any>
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
      sessionId: metadata?.sessionId,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
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
    metadata?: Record<string, any>
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
    metadata?: Record<string, any>
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
    metadata?: Record<string, any>
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
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      metadata
    };

    this.addEntry(entry);
  }

  /**
   * Query audit entries
   */
  public queryEntries(query: AuditQuery = {}): PermissionAuditEntry[] {
    let filtered = [...this.entries];

    if (query.userId) {
      filtered = filtered.filter(entry => entry.userId === query.userId);
    }

    if (query.userRole) {
      filtered = filtered.filter(entry => entry.userRole === query.userRole);
    }

    if (query.permission) {
      filtered = filtered.filter(entry => entry.permission === query.permission);
    }

    if (query.action) {
      filtered = filtered.filter(entry => entry.action === query.action);
    }

    if (query.category) {
      filtered = filtered.filter(entry => entry.category === query.category);
    }

    if (query.severity) {
      filtered = filtered.filter(entry => entry.severity === query.severity);
    }

    if (query.startDate) {
      filtered = filtered.filter(entry => entry.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      filtered = filtered.filter(entry => entry.timestamp <= query.endDate!);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    if (query.offset) {
      filtered = filtered.slice(query.offset);
    }

    if (query.limit) {
      filtered = filtered.slice(0, query.limit);
    }

    return filtered;
  }

  /**
   * Get audit summary
   */
  public getAuditSummary(timeRange?: { start: Date; end: Date }): AuditSummary {
    let entries = this.entries;

    if (timeRange) {
      entries = entries.filter(entry => 
        entry.timestamp >= timeRange.start && entry.timestamp <= timeRange.end
      );
    }

    const totalEvents = entries.length;
    const successfulAccess = entries.filter(entry => entry.granted).length;
    const deniedAccess = entries.filter(entry => !entry.granted).length;
    const emergencyAccess = entries.filter(entry => entry.category === 'emergency').length;
    const permissionChanges = entries.filter(entry => 
      ['permission_granted', 'permission_revoked', 'permission_modified'].includes(entry.action)
    ).length;

    const uniqueUsers = new Set(entries.map(entry => entry.userId)).size;

    // Top permissions
    const permissionCounts = new Map<string, number>();
    entries.forEach(entry => {
      if (entry.permission) {
        permissionCounts.set(entry.permission, (permissionCounts.get(entry.permission) || 0) + 1);
      }
    });
    const topPermissions = Array.from(permissionCounts.entries())
      .map(([permission, count]) => ({ permission, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top users
    const userCounts = new Map<string, { userId: number; email: string; count: number }>();
    entries.forEach(entry => {
      const key = `${entry.userId}_${entry.userEmail}`;
      const existing = userCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        userCounts.set(key, { userId: entry.userId, email: entry.userEmail, count: 1 });
      }
    });
    const topUsers = Array.from(userCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const securityAlerts = this.alerts.length;

    return {
      totalEvents,
      successfulAccess,
      deniedAccess,
      emergencyAccess,
      permissionChanges,
      uniqueUsers,
      topPermissions,
      topUsers,
      securityAlerts
    };
  }

  /**
   * Get security alerts
   */
  public getSecurityAlerts(): PermissionAuditEntry[] {
    return [...this.alerts];
  }

  /**
   * Add event listener
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
  public exportAuditData(format: 'json' | 'csv', query?: AuditQuery): string {
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
          const recentEntries = entries.filter(e => 
            e.timestamp > new Date(Date.now() - 5 * 60 * 1000) && // Last 5 minutes
            e.action === 'permission_check' && 
            !e.granted
          );
          return recentEntries.length >= 5;
        }
      },
      {
        id: 'privilege_escalation',
        name: 'Potential Privilege Escalation',
        description: 'Admin permissions granted to non-admin user',
        severity: 'high',
        alertThreshold: 1,
        pattern: (entries: PermissionAuditEntry[]) => {
          return entries.some(e => 
            e.action === 'permission_granted' &&
            e.permission?.includes('admin') &&
            e.userRole !== 'admin' &&
            e.userRole !== 'superadmin'
          );
        }
      },
      {
        id: 'emergency_access_spike',
        name: 'Emergency Access Spike',
        description: 'Unusual number of emergency access events',
        severity: 'critical',
        alertThreshold: 3,
        pattern: (entries: PermissionAuditEntry[]) => {
          const recentEmergencyAccess = entries.filter(e => 
            e.category === 'emergency' &&
            e.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
          );
          return recentEmergencyAccess.length >= 3;
        }
      },
      {
        id: 'after_hours_access',
        name: 'After Hours Administrative Access',
        description: 'Administrative actions performed outside business hours',
        severity: 'medium',
        alertThreshold: 1,
        pattern: (entries: PermissionAuditEntry[]) => {
          const now = new Date();
          const hour = now.getHours();
          const isWeekend = now.getDay() === 0 || now.getDay() === 6;
          const isAfterHours = hour < 8 || hour > 18 || isWeekend;
          
          return entries.some(e => 
            isAfterHours &&
            e.permission?.includes('admin') &&
            e.granted &&
            e.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
          );
        }
      }
    ];
  }

  /**
   * Check entry against security patterns
   */
  private checkSecurityPatterns(newEntry: PermissionAuditEntry): void {
    const recentEntries = this.entries.filter(e => 
      e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );

    this.securityPatterns.forEach(pattern => {
      if (pattern.pattern([newEntry, ...recentEntries])) {
        const alertEntry: PermissionAuditEntry = {
          ...newEntry,
          id: this.generateId(),
          action: 'permission_check',
          permission: `SECURITY_ALERT_${pattern.id}`,
          granted: false,
          severity: pattern.severity,
          category: 'system',
          reason: `Security pattern detected: ${pattern.description}`,
          metadata: {
            ...newEntry.metadata,
            securityPattern: pattern.id,
            patternName: pattern.name
          }
        };

        this.alerts.push(alertEntry);
        
        // Keep only recent alerts (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        this.alerts = this.alerts.filter(alert => alert.timestamp > thirtyDaysAgo);
      }
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Load mock data for demonstration
   */
  private loadMockData(): void {
    const now = new Date();
    const mockEntries: Partial<PermissionAuditEntry>[] = [
      {
        userId: 1,
        userEmail: 'admin@example.com',
        userRole: 'admin',
        action: 'login',
        granted: true,
        severity: 'low',
        category: 'authentication',
        timestamp: new Date(now.getTime() - 60000)
      },
      {
        userId: 2,
        userEmail: 'doctor@example.com',
        userRole: 'provider',
        action: 'permission_check',
        permission: 'can_access_patient_data',
        granted: true,
        severity: 'low',
        category: 'authorization',
        timestamp: new Date(now.getTime() - 120000)
      },
      {
        userId: 3,
        userEmail: 'patient@example.com',
        userRole: 'patient',
        action: 'permission_check',
        permission: 'can_manage_users',
        granted: false,
        severity: 'medium',
        category: 'authorization',
        timestamp: new Date(now.getTime() - 180000)
      },
      {
        userId: 1,
        userEmail: 'admin@example.com',
        userRole: 'admin',
        action: 'emergency_access',
        resourceType: 'patient_record',
        resourceId: '12345',
        granted: true,
        reason: 'Medical emergency - patient unresponsive',
        severity: 'critical',
        category: 'emergency',
        timestamp: new Date(now.getTime() - 240000)
      }
    ];

    mockEntries.forEach(partial => {
      const entry: PermissionAuditEntry = {
        id: this.generateId(),
        timestamp: new Date(),
        userId: 0,
        userEmail: '',
        userRole: 'patient',
        action: 'permission_check',
        granted: false,
        severity: 'low',
        category: 'authorization',
        ...partial
      } as PermissionAuditEntry;

      this.entries.push(entry);
    });
  }
}

/**
 * React hook for audit system
 */
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

/**
 * Audit dashboard component
 */
export function AuditDashboard() {
  const { recentEntries, alerts, getAuditSummary, queryEntries, exportAuditData } = usePermissionAudit();
  const [summary, setSummary] = React.useState<AuditSummary | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('24h');
  const [activeTab, setActiveTab] = React.useState<'overview' | 'entries' | 'alerts'>('overview');

  React.useEffect(() => {
    const now = new Date();
    let startDate: Date;

    switch (selectedTimeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    setSummary(getAuditSummary({ start: startDate, end: now }));
  }, [selectedTimeRange, getAuditSummary]);

  const handleExport = (format: 'json' | 'csv') => {
    const data = exportAuditData(format);
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Alerts Bar */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-red-800 font-medium">
                {alerts.length} Security Alert{alerts.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-red-600 hover:text-red-800"
            >
              View Details →
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('entries')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'entries'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Audit Entries ({recentEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security Alerts ({alerts.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Total Events</h3>
            <p className="text-3xl font-bold text-blue-600">{summary.totalEvents}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Successful Access</h3>
            <p className="text-3xl font-bold text-green-600">{summary.successfulAccess}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Denied Access</h3>
            <p className="text-3xl font-bold text-red-600">{summary.deniedAccess}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Emergency Access</h3>
            <p className="text-3xl font-bold text-orange-600">{summary.emergencyAccess}</p>
          </div>
        </div>
      )}

      {activeTab === 'entries' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Audit Entries</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(entry.severity)}`}>
                        {entry.severity}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{entry.action}</span>
                      {entry.permission && (
                        <span className="text-sm text-gray-600">• {entry.permission}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      User: {entry.userEmail} ({entry.userRole})
                    </p>
                    <p className={`text-sm ${entry.granted ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.granted ? 'Granted' : 'Denied'}
                    </p>
                    {entry.reason && (
                      <p className="text-sm text-gray-600 mt-1">Reason: {entry.reason}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {entry.timestamp.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Security Alerts</h3>
          </div>
          {alerts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {alert.metadata?.patternName || 'Security Alert'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        User: {alert.userEmail} ({alert.userRole})
                      </p>
                      <p className="text-sm text-gray-800">{alert.reason}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {alert.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No security alerts at this time.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PermissionAuditSystem;