// src/app/(dashboard)/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { FormButton, FormAlert } from '@/components/ui/common';
import { Spinner } from '@/components/ui/spinner';
import { User, Bell, Shield, Lock, Eye, Globe, Settings as SettingsIcon } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { notificationService } from '@/lib/api/services/notification.service';

interface NotificationPreferences {
  email_appointment_reminders: boolean;
  email_medication_reminders: boolean;
  email_health_records: boolean;
  email_research_updates: boolean;
  sms_appointment_reminders: boolean;
  sms_medication_reminders: boolean;
  sms_emergency_alerts: boolean;
  in_app_notifications: boolean;
  smartwatch_notifications: boolean;
  push_notifications: boolean;
}

interface PrivacyPreferences {
  share_data_for_research: boolean;
  share_data_with_providers: boolean;
  allow_marketing_communications: boolean;
  data_retention_consent: boolean;
  anonymous_usage_analytics: boolean;
}

export default function SettingsPage() {
  const { user, isLoading, logout, refreshToken } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get active tab from URL parameter or default to 'account'
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || 'account');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    email_appointment_reminders: true,
    email_medication_reminders: true,
    email_health_records: true,
    email_research_updates: false,
    sms_appointment_reminders: false,
    sms_medication_reminders: true,
    sms_emergency_alerts: true,
    in_app_notifications: true,
    smartwatch_notifications: false,
    push_notifications: true,
  });

  // Privacy preferences
  const [privacyPrefs, setPrivacyPrefs] = useState<PrivacyPreferences>({
    share_data_for_research: false,
    share_data_with_providers: true,
    allow_marketing_communications: false,
    data_retention_consent: true,
    anonymous_usage_analytics: false,
  });

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    router.push(url.pathname + url.search);
  };

  // Load preferences from API
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load notification preferences
        const notifResponse = await apiClient.get(ENDPOINTS.NOTIFICATIONS.PREFERENCES);
        if (notifResponse.data) {
          setNotificationPrefs(prev => ({ ...prev, ...(notifResponse.data as Partial<NotificationPreferences>) }));
        }

        // Load privacy preferences
        const privacyResponse = await apiClient.get(ENDPOINTS.PATIENT.PRIVACY_SETTINGS);
        if (privacyResponse.data) {
          setPrivacyPrefs(prev => ({ ...prev, ...(privacyResponse.data as Partial<PrivacyPreferences>) }));
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };

    if (user) {
      loadPreferences();
    }
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setErrorMessage(null);
      
      await logout();
    } catch (error: unknown) {
      setErrorMessage('Failed to log out. Please try again.');
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  // Handle notification preference change
  const handleNotificationChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const newPrefs = {
      ...notificationPrefs,
      [name]: checked,
    };
    
    setNotificationPrefs(newPrefs);
    
    try {
      setSaving(true);
      await apiClient.patch(ENDPOINTS.NOTIFICATIONS.PREFERENCES, { [name]: checked });
      setSuccessMessage('Notification preferences updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      setErrorMessage('Failed to update notification preferences');
      // Revert the change
      setNotificationPrefs(notificationPrefs);
    } finally {
      setSaving(false);
    }
  };

  // Handle privacy preference change
  const handlePrivacyChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const newPrefs = {
      ...privacyPrefs,
      [name]: checked,
    };
    
    setPrivacyPrefs(newPrefs);
    
    try {
      setSaving(true);
      await apiClient.patch(ENDPOINTS.PATIENT.PRIVACY_SETTINGS, { [name]: checked });
      setSuccessMessage('Privacy preferences updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update privacy preferences:', error);
      setErrorMessage('Failed to update privacy preferences');
      // Revert the change
      setPrivacyPrefs(privacyPrefs);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: 'account', name: 'Account', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'privacy', name: 'Privacy', icon: Eye },
  ];

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Alerts */}
        {(errorMessage || successMessage) && (
          <div className="px-6 py-4">
            <FormAlert
              type={errorMessage ? 'error' : 'success'}
              message={errorMessage || successMessage || ''}
            />
          </div>
        )}

        {/* Tab Content */}
        <div className="px-6 py-6">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Account Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage your basic account information
                </p>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Account status</dt>
                    <dd className="mt-1">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Member since</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last login</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <div className="flex justify-between">
                  <Link
                    href="/profile"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit Profile
                  </Link>

                  <FormButton
                    type="button"
                    variant="danger"
                    isLoading={isLoggingOut}
                    onClick={handleLogout}
                  >
                    Sign Out
                  </FormButton>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Notification Preferences</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose how you want to receive notifications and alerts
                </p>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <div className="space-y-8">
                  {/* Email Notifications */}
                  <fieldset>
                    <legend className="text-base font-medium text-gray-900">Email Notifications</legend>
                    <div className="mt-4 space-y-4">
                      {[
                        { key: 'email_appointment_reminders', label: 'Appointment Reminders', desc: 'Get notified about upcoming appointments' },
                        { key: 'email_medication_reminders', label: 'Medication Reminders', desc: 'Reminders to take your medications' },
                        { key: 'email_health_records', label: 'Health Record Updates', desc: 'Notifications when your health records are updated' },
                        { key: 'email_research_updates', label: 'Research Updates', desc: 'Updates about relevant research and clinical trials' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={item.key}
                              name={item.key}
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={notificationPrefs[item.key as keyof NotificationPreferences] as boolean}
                              onChange={handleNotificationChange}
                              disabled={saving}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor={item.key} className="font-medium text-gray-700">
                              {item.label}
                            </label>
                            <p className="text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>

                  {/* SMS Notifications */}
                  <fieldset>
                    <legend className="text-base font-medium text-gray-900">SMS Notifications</legend>
                    <div className="mt-4 space-y-4">
                      {[
                        { key: 'sms_appointment_reminders', label: 'Appointment Reminders', desc: 'Text reminders for upcoming appointments' },
                        { key: 'sms_medication_reminders', label: 'Medication Reminders', desc: 'Text reminders to take medications' },
                        { key: 'sms_emergency_alerts', label: 'Emergency Alerts', desc: 'Critical health alerts via SMS' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={item.key}
                              name={item.key}
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={notificationPrefs[item.key as keyof NotificationPreferences] as boolean}
                              onChange={handleNotificationChange}
                              disabled={saving}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor={item.key} className="font-medium text-gray-700">
                              {item.label}
                            </label>
                            <p className="text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>

                  {/* App & Device Notifications */}
                  <fieldset>
                    <legend className="text-base font-medium text-gray-900">App & Device Notifications</legend>
                    <div className="mt-4 space-y-4">
                      {[
                        { key: 'in_app_notifications', label: 'In-App Notifications', desc: 'Show notifications within the application' },
                        { key: 'push_notifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                        { key: 'smartwatch_notifications', label: 'Smartwatch Alerts', desc: 'Send alerts to connected smartwatch devices' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={item.key}
                              name={item.key}
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={notificationPrefs[item.key as keyof NotificationPreferences] as boolean}
                              onChange={handleNotificationChange}
                              disabled={saving}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor={item.key} className="font-medium text-gray-700">
                              {item.label}
                            </label>
                            <p className="text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Security Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account security and authentication
                </p>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-900">Password</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Change your password to maintain account security
                      </p>
                    </div>
                    <Link
                      href="/settings/password"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Link>
                  </div>

                  <div className="pt-5 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          {user?.two_factor_enabled
                            ? 'Two-factor authentication is currently enabled'
                            : 'Add an extra layer of security to your account'}
                        </p>
                      </div>
                      <Link
                        href="/two-factor"
                        className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          user?.two_factor_enabled
                            ? 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        {user?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
                      </Link>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">Active Sessions</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          View and manage your active login sessions
                        </p>
                      </div>
                      <Link
                        href="/settings/sessions"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Manage Sessions
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Privacy Preferences</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Control how your data is used and shared
                </p>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <div className="space-y-6">
                  <fieldset>
                    <legend className="text-base font-medium text-gray-900">Data Sharing</legend>
                    <div className="mt-4 space-y-4">
                      {[
                        { 
                          key: 'share_data_for_research', 
                          label: 'Research Participation', 
                          desc: 'Allow anonymized data to be used for medical research',
                          notice: 'This helps advance rare disease research and treatments'
                        },
                        { 
                          key: 'share_data_with_providers', 
                          label: 'Provider Access', 
                          desc: 'Share health data with your healthcare providers',
                          notice: 'Required for coordinated care'
                        },
                        { 
                          key: 'allow_marketing_communications', 
                          label: 'Marketing Communications', 
                          desc: 'Receive information about new treatments and services',
                          notice: 'You can unsubscribe at any time'
                        },
                      ].map((item) => (
                        <div key={item.key} className="space-y-2">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id={item.key}
                                name={item.key}
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={privacyPrefs[item.key as keyof PrivacyPreferences] as boolean}
                                onChange={handlePrivacyChange}
                                disabled={saving}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor={item.key} className="font-medium text-gray-700">
                                {item.label}
                              </label>
                              <p className="text-gray-500">{item.desc}</p>
                              {item.notice && (
                                <p className="text-xs text-blue-600 mt-1">{item.notice}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="text-base font-medium text-gray-900">Data Management</legend>
                    <div className="mt-4 space-y-4">
                      {[
                        { 
                          key: 'data_retention_consent', 
                          label: 'Data Retention', 
                          desc: 'Consent to retain your data as required by HIPAA regulations',
                          notice: 'Required by law for healthcare records'
                        },
                        { 
                          key: 'anonymous_usage_analytics', 
                          label: 'Usage Analytics', 
                          desc: 'Help improve the platform with anonymous usage data',
                          notice: 'No personal health information is collected'
                        },
                      ].map((item) => (
                        <div key={item.key} className="space-y-2">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id={item.key}
                                name={item.key}
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={privacyPrefs[item.key as keyof PrivacyPreferences] as boolean}
                                onChange={handlePrivacyChange}
                                disabled={saving || item.key === 'data_retention_consent'}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor={item.key} className="font-medium text-gray-700">
                                {item.label}
                              </label>
                              <p className="text-gray-500">{item.desc}</p>
                              {item.notice && (
                                <p className="text-xs text-blue-600 mt-1">{item.notice}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>

              {/* HIPAA Notice */}
              <div className="border-t border-gray-200 pt-5">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        HIPAA Privacy Notice
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Your privacy preferences are protected under HIPAA regulations. 
                          Any changes to data sharing must comply with federal privacy laws. 
                          <Link href="/privacy-policy" className="underline ml-1">
                            View our complete privacy policy
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}