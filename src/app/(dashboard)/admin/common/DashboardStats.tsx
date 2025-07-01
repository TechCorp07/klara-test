// src/app/(dashboard)/admin/common/DashboardStats.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export interface DashboardStatsData {
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
}

interface StatCard {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  description?: string;
  link?: string;
}

interface DashboardStatsProps {
  data?: DashboardStatsData;
  onRefresh?: () => void;
  showRefresh?: boolean;
  layout?: 'grid' | 'row';
  size?: 'sm' | 'md' | 'lg';
}

export function DashboardStats({ 
  data, 
  onRefresh, 
  showRefresh = true,
  layout = 'grid',
  size = 'md'
}: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStatsData | null>(data || null);
  const [isLoading, setIsLoading] = useState(!data);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (!data) {
      fetchStats();
    }
  }, [data]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/users/admin/dashboard-stats/');
      setStats(response.data);
      setLastUpdated(new Date());
      onRefresh?.();
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatCards = (stats: DashboardStatsData): StatCard[] => {
    return [
      {
        title: 'Total Users',
        value: stats.total_users.toLocaleString(),
        icon: '👥',
        color: 'blue',
        description: 'All registered users',
        link: '/dashboard/admin/users',
      },
      {
        title: 'Pending Approvals',
        value: stats.pending_approvals,
        icon: '⏳',
        color: stats.pending_approvals > 0 ? 'yellow' : 'green',
        description: 'Users awaiting approval',
        link: '/dashboard/admin/approvals',
      },
      {
        title: 'Active Today',
        value: stats.active_users_today,
        icon: '🟢',
        color: 'green',
        description: 'Users active in last 24h',
      },
      {
        title: 'New Registrations',
        value: stats.new_registrations_7d,
        icon: '📈',
        color: 'purple',
        description: 'Last 7 days',
        link: '/dashboard/admin/users?date_joined_after=' + 
               new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        title: 'System Alerts',
        value: stats.system_alerts,
        icon: '🚨',
        color: stats.system_alerts > 0 ? 'red' : 'green',
        description: 'Active system issues',
        link: '/dashboard/admin/monitoring',
      },
      {
        title: 'Emergency Access',
        value: stats.emergency_access_events,
        icon: '🆘',
        color: stats.emergency_access_events > 0 ? 'red' : 'green',
        description: 'Events requiring review',
        link: '/dashboard/admin/compliance/emergency-access',
      },
      {
        title: 'Failed Logins',
        value: stats.failed_logins_24h,
        icon: '🔒',
        color: stats.failed_logins_24h > 10 ? 'red' : stats.failed_logins_24h > 5 ? 'yellow' : 'green',
        description: 'Last 24 hours',
        link: '/dashboard/admin/security',
      },
      {
        title: 'Locked Accounts',
        value: stats.locked_accounts,
        icon: '🚫',
        color: stats.locked_accounts > 0 ? 'red' : 'green',
        description: 'Temporarily locked',
        link: '/dashboard/admin/users?is_locked=true',
      },
      {
        title: 'Verification Required',
        value: stats.verification_required,
        icon: '📋',
        color: stats.verification_required > 0 ? 'yellow' : 'green',
        description: 'Users needing verification',
        link: '/dashboard/admin/users?verification_status=pending',
      },
      {
        title: 'Compliance Issues',
        value: stats.compliance_issues,
        icon: '⚖️',
        color: stats.compliance_issues > 0 ? 'red' : 'green',
        description: 'Items requiring attention',
        link: '/dashboard/admin/compliance',
      },
      {
        title: 'System Uptime',
        value: `${stats.uptime_percentage}%`,
        icon: '⚡',
        color: stats.uptime_percentage >= 99 ? 'green' : stats.uptime_percentage >= 95 ? 'yellow' : 'red',
        description: 'Last 30 days',
      },
      {
        title: 'Response Time',
        value: `${stats.response_time_ms}ms`,
        icon: '🚀',
        color: stats.response_time_ms <= 200 ? 'green' : stats.response_time_ms <= 500 ? 'yellow' : 'red',
        description: 'Average API response',
      },
    ];
  };

  const formatLastUpdated = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return lastUpdated.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className={`grid ${
        layout === 'grid' 
          ? size === 'sm' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
          : 'grid-cols-1'
      } gap-4`}>
        {Array.from({ length: layout === 'grid' ? 8 : 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">Failed to load dashboard statistics</p>
        <button
          onClick={fetchStats}
          className="mt-2 text-blue-600 hover:text-blue-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statCards = getStatCards(stats);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Dashboard Overview</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Updated {formatLastUpdated()}
          </span>
          {showRefresh && (
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-500 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid ${
        layout === 'grid' 
          ? size === 'sm' 
            ? 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-6' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      } gap-4`}>
        {statCards.map((card, index) => (
          <StatCardComponent key={index} card={card} size={size} />
        ))}
      </div>

      {/* Quick Actions for Critical Items */}
      {(stats.pending_approvals > 0 || stats.system_alerts > 0 || stats.emergency_access_events > 0) && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Items Requiring Attention</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            {stats.pending_approvals > 0 && (
              <div>• {stats.pending_approvals} user approval{stats.pending_approvals !== 1 ? 's' : ''} pending</div>
            )}
            {stats.system_alerts > 0 && (
              <div>• {stats.system_alerts} system alert{stats.system_alerts !== 1 ? 's' : ''} active</div>
            )}
            {stats.emergency_access_events > 0 && (
              <div>• {stats.emergency_access_events} emergency access event{stats.emergency_access_events !== 1 ? 's' : ''} need review</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCardComponent({ card, size }: { card: StatCard; size: 'sm' | 'md' | 'lg' }) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
    gray: 'text-gray-600 bg-gray-100',
  };

  const CardContent = () => (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-md p-2 ${colorClasses[card.color]}`}>
          <span className={size === 'sm' ? 'text-lg' : 'text-xl'}>{card.icon}</span>
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <p className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium text-gray-900 truncate`}>
            {card.title}
          </p>
          <p className={`${size === 'sm' ? 'text-lg' : 'text-2xl'} font-semibold text-gray-900`}>
            {card.value}
          </p>
          {card.description && (
            <p className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-gray-500 truncate`}>
              {card.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (card.link) {
    return (
      <a href={card.link} className="block hover:opacity-75 transition-opacity">
        <CardContent />
      </a>
    );
  }

  return <CardContent />;
}

export default DashboardStats;