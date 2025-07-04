// src/app/(dashboard)/admin/system-settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import FormButton from '@/components/ui/common/FormButton';
import { Spinner } from '@/components/ui/spinner';
import { AxiosError } from 'axios';

interface SystemSettings {
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

export default function AdminSystemSettingsPage() {
  return (
    <AdminGuard>
      <SystemSettingsInterface />
    </AdminGuard>
  );
}

function SystemSettingsInterface() {
  const { permissions } = usePermissions();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'security' | 'registration' | 'compliance' | 'features' | 'maintenance'>('security');

  const canModifySettings = permissions?.has_system_settings_access || false;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiClient.get('/api/admin/system-settings/');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch system settings:', error);
      setError('Failed to load system settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings || !canModifySettings) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.put('/api/admin/system-settings/', settings);
      setSuccess('System settings updated successfully');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      setError(axiosError.response?.data?.detail || 'Failed to update system settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: SystemSettings[keyof SystemSettings]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const addEmailDomain = () => {
    if (!settings) return;
    const domain = prompt('Enter email domain (e.g., hospital.com):');
    if (domain) {
      setSettings({
        ...settings,
        allowed_email_domains: [...settings.allowed_email_domains, domain]
      });
    }
  };

  const removeEmailDomain = (index: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      allowed_email_domains: settings.allowed_email_domains.filter((_, i) => i !== index)
    });
  };

  type TabId = 'security' | 'registration' | 'compliance' | 'features' | 'maintenance';
  
  const tabs: { id: TabId; name: string; icon: string }[] = [
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'registration', name: 'Registration', icon: '👥' },
    { id: 'compliance', name: 'HIPAA Compliance', icon: '🏥' },
    { id: 'features', name: 'Features', icon: '⚙️' },
    { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
  ];

  if (!canModifySettings) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">🚫 Insufficient Permissions</h3>
          <p className="mb-4">You don&apos;t have permission to modify system settings.</p>
          <p className="text-sm">Required: System settings access</p>
        </div>
      </div>
    );
  }

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={settings.max_login_attempts}
                    onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Number of failed attempts before account lockout</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Lockout Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.account_lockout_duration}
                    onChange={(e) => updateSetting('account_lockout_duration', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password Expiry (days)
                  </label>
                  <input
                    type="number"
                    value={settings.password_expiry_days}
                    onChange={(e) => updateSetting('password_expiry_days', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.session_timeout_minutes}
                    onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.require_2fa_for_admins}
                  onChange={(e) => updateSetting('require_2fa_for_admins', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Require 2FA for Admin Users
                </label>
              </div>
            </div>
          )}

          {/* Registration Settings */}
          {activeTab === 'registration' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Registration Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.enable_self_registration}
                    onChange={(e) => updateSetting('enable_self_registration', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable Self Registration
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.require_manual_approval}
                    onChange={(e) => updateSetting('require_manual_approval', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Require Manual Approval for New Users
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Default User Role
                  </label>
                  <select
                    value={settings.default_user_role}
                    onChange={(e) => updateSetting('default_user_role', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="patient">Patient</option>
                    <option value="provider">Provider</option>
                    <option value="researcher">Researcher</option>
                    <option value="caregiver">Caregiver</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Email Domains
                  </label>
                  <div className="space-y-2">
                    {settings.allowed_email_domains.map((domain, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">{domain}</span>
                        <button
                          onClick={() => removeEmailDomain(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addEmailDomain}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Domain
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HIPAA Compliance Settings */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">HIPAA Compliance Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Audit Log Retention (days)
                  </label>
                  <input
                    type="number"
                    value={settings.audit_log_retention_days}
                    onChange={(e) => updateSetting('audit_log_retention_days', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">HIPAA requires minimum 6 years (2190 days)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Emergency Access Timeout (hours)
                  </label>
                  <input
                    type="number"
                    value={settings.emergency_access_timeout_hours}
                    onChange={(e) => updateSetting('emergency_access_timeout_hours', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Consent Document Version
                  </label>
                  <input
                    type="text"
                    value={settings.consent_document_version}
                    onChange={(e) => updateSetting('consent_document_version', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Privacy Notice Version
                  </label>
                  <input
                    type="text"
                    value={settings.privacy_notice_version}
                    onChange={(e) => updateSetting('privacy_notice_version', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Admin Notification Email
                </label>
                <input
                  type="email"
                  value={settings.admin_notification_email}
                  onChange={(e) => updateSetting('admin_notification_email', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Email for compliance notifications and alerts</p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.email_notifications_enabled}
                  onChange={(e) => updateSetting('email_notifications_enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Enable Email Notifications
                </label>
              </div>
            </div>
          )}

          {/* Feature Settings */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Feature Flags</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Telemedicine</h4>
                    <p className="text-sm text-gray-500">Enable video consultations and remote appointments</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enable_telemedicine}
                    onChange={(e) => updateSetting('enable_telemedicine', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Research Participation</h4>
                    <p className="text-sm text-gray-500">Allow users to participate in clinical research</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enable_research_participation}
                    onChange={(e) => updateSetting('enable_research_participation', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Medication Tracking</h4>
                    <p className="text-sm text-gray-500">Enable medication adherence monitoring</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enable_medication_tracking}
                    onChange={(e) => updateSetting('enable_medication_tracking', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Wearable Integration</h4>
                    <p className="text-sm text-gray-500">Connect with fitness trackers and health devices</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enable_wearable_integration}
                    onChange={(e) => updateSetting('enable_wearable_integration', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Settings */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">System Maintenance</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.maintenance_mode}
                    onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable Maintenance Mode
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maintenance Message
                  </label>
                  <textarea
                    value={settings.maintenance_message}
                    onChange={(e) => updateSetting('maintenance_message', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Message to display to users during maintenance..."
                  />
                </div>

                {settings.maintenance_mode && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Maintenance Mode Active
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            The system is currently in maintenance mode. Regular users will see the maintenance message and be unable to access the platform.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <FormButton
              type="button"
              onClick={saveSettings}
              isLoading={isSaving}
            >
              Save Settings
            </FormButton>
          </div>
        </div>
      </div>
    </div>
  );
}
