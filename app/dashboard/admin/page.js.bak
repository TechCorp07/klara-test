"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import QuickActionButton from '@/components/dashboard/QuickActionButton';
import DataPanel from '@/components/dashboard/DataPanel';
import HIPAABanner from '@/components/ui/HIPAABanner';
import LoadingComponent from '@/components/ui/LoadingComponent';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Simulate fetching admin-specific data
    const fetchAdminData = async () => {
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          setMetrics({
            totalUsers: 1245,
            activeProviders: 42,
            pendingApprovals: 8,
            systemAlerts: 3,
            dataUsage: '78%'
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <DashboardLayout 
      title="Admin Dashboard" 
      subtitle={`Welcome back, ${user?.first_name || 'Admin'}!`}
      role="admin"
    >
      <HIPAABanner />
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <StatsCard 
          title="Total Users" 
          value={metrics.totalUsers} 
          icon="users" 
          trend="up"
          linkTo="/admin/users"
        />
        <StatsCard 
          title="Active Providers" 
          value={metrics.activeProviders} 
          icon="user-md" 
          trend="neutral"
          linkTo="/admin/providers"
        />
        <StatsCard 
          title="Pending Approvals" 
          value={metrics.pendingApprovals} 
          icon="user-check" 
          trend="up"
          linkTo="/admin/approvals"
        />
        <StatsCard 
          title="System Alerts" 
          value={metrics.systemAlerts} 
          icon="exclamation-triangle" 
          trend="down"
          linkTo="/admin/alerts"
        />
        <StatsCard 
          title="Data Usage" 
          value={metrics.dataUsage} 
          icon="database" 
          trend="up"
          linkTo="/admin/usage"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <DashboardMetrics 
              metrics={[
                { label: 'API Uptime', value: '99.98%' },
                { label: 'Database Status', value: 'Healthy' },
                { label: 'Storage Usage', value: '42.3 GB / 100 GB' },
                { label: 'Active Sessions', value: '87' },
                { label: 'Last Backup', value: '2 hours ago' }
              ]}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <DataPanel 
              items={[
                { title: 'New Provider Registration', description: 'Dr. Jennifer Lawrence - Cardiology', date: '1 hour ago', type: 'user' },
                { title: 'System Update', description: 'Security patch applied successfully', date: '3 hours ago', type: 'system' },
                { title: 'User Report', description: 'Compliance report generated', date: '5 hours ago', type: 'report' },
                { title: 'Data Export', description: 'Research data exported by Dr. Thompson', date: 'Yesterday', type: 'data' },
                { title: 'API Integration', description: 'New EHR system connected', date: '2 days ago', type: 'integration' }
              ]}
            />
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickActionButton 
                label="Approve New Users" 
                icon="user-check" 
                href="/admin/approvals" 
              />
              <QuickActionButton 
                label="System Configuration" 
                icon="cogs" 
                href="/admin/settings" 
              />
              <QuickActionButton 
                label="Generate Reports" 
                icon="chart-bar" 
                href="/admin/reports" 
              />
              <QuickActionButton 
                label="Audit Logs" 
                icon="clipboard-list" 
                href="/admin/audit" 
              />
              <QuickActionButton 
                label="Manage Integrations" 
                icon="plug" 
                href="/admin/integrations" 
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Compliance Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">HIPAA Compliance</span>
                  <span className="text-sm font-medium text-green-600">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Data Encryption</span>
                  <span className="text-sm font-medium text-green-600">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">User Verification</span>
                  <span className="text-sm font-medium text-yellow-600">87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Audit Logging</span>
                  <span className="text-sm font-medium text-green-600">98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              
              <div className="mt-4">
                <a 
                  href="/admin/compliance" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  View Full Report
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
