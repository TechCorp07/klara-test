// src/components/admin/DashboardStats.tsx
import { DashboardStatsResponse } from '@/types/admin.types';

interface DashboardStatsProps {
  stats: DashboardStatsResponse;
  isLoading?: boolean;
}

export const DashboardStats = ({ stats, isLoading = false }: DashboardStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-300 rounded"></div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: (
        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Pending Approvals',
      value: stats.pending_approvals,
      icon: (
        <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      urgent: stats.pending_approvals > 10,
    },
    {
      title: 'Recent Registrations',
      value: stats.recent_registrations,
      icon: (
        <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      bgColor: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Emergency Access',
      value: stats.unreviewed_emergency_access,
      icon: (
        <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      bgColor: 'bg-red-500',
      textColor: 'text-red-600',
      urgent: stats.unreviewed_emergency_access > 0,
    },
  ];

  return (
    <>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md ${
              stat.urgent ? 'ring-2 ring-red-200 ring-opacity-50' : ''
            }`}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {stat.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                      {stat.urgent && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Needs Attention
                        </span>
                      )}
                    </dt>
                    <dd className={`text-lg font-medium ${stat.textColor}`}>
                      {stat.value.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            {stat.urgent && (
              <div className={`${stat.bgColor} px-5 py-3`}>
                <div className="text-sm text-white">
                  {stat.title === 'Pending Approvals' && 'High volume of pending approvals'}
                  {stat.title === 'Emergency Access' && 'Unreviewed emergency access requests'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Stats - User Role Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Users by Role */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Users by Role
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.users_by_role).map(([role, count]) => {
                const percentage = stats.total_users > 0 ? (count / stats.total_users) * 100 : 0;
                return (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Pending Caregiver Requests</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.pending_caregiver_requests}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Unverified Patients</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.unverified_patients}
                </span>
              </div>
              <div className="mt-4">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
                  Generate Admin Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};