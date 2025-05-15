// src/app/(dashboard)/settings/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { FormButton, FormAlert } from '@/components/auth/common';
import { Spinner } from '@/components/ui/spinner';
import { config } from '@/lib/config';

/**
 * Settings page component.
 * 
 * This page allows users to manage their account settings, including:
 * - Account preferences
 * - Notification settings
 * - Security settings
 * - Data privacy options
 */
export default function SettingsPage() {
  const { user, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('account');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Sample notification preferences (would be fetched from API in a real app)
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_appointment_reminders: true,
    email_account_updates: true,
    email_health_records: true,
    sms_appointment_reminders: false,
    sms_account_updates: false,
    in_app_notifications: true,
  });
  
  // Sample privacy preferences (would be fetched from API in a real app)
  const [privacyPrefs, setPrivacyPrefs] = useState({
    share_data_for_research: false,
    share_data_with_providers: true,
    allow_marketing_communications: false,
  });
  
  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setErrorMessage(null);
      
      await logout();
      // Redirect happens in the auth context
    } catch (error: unknown) {
      setErrorMessage('Failed to log out. Please try again.');
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };
  
  // Handle notification preference change
  const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setNotificationPrefs({
      ...notificationPrefs,
      [name]: checked,
    });
    
    // In a real app, this would call an API to update preferences
    setSuccessMessage('Notification preferences updated successfully.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  // Handle privacy preference change
  const handlePrivacyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setPrivacyPrefs({
      ...privacyPrefs,
      [name]: checked,
    });
    
    // In a real app, this would call an API to update preferences
    setSuccessMessage('Privacy preferences updated successfully.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }
  
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
            {[
              { name: 'Account', id: 'account' },
              { name: 'Notifications', id: 'notifications' },
              { name: 'Security', id: 'security' },
              { name: 'Privacy', id: 'privacy' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <FormAlert
            type="success"
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
          
          <FormAlert
            type="error"
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
          
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Account Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  View and update your basic account information
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-5">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.first_name} {user?.last_name}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                    <dd className="mt-1 text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
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
                  Manage how you receive notifications and communications
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-5">
                <div className="space-y-6">
                  <fieldset>
                    <legend className="text-base font-medium text-gray-900">Email Notifications</legend>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="email_appointment_reminders"
                            name="email_appointment_reminders"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={notificationPrefs.email_appointment_reminders}
                            onChange={handleNotificationChange}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="email_appointment_reminders" className="font-medium text-gray-700">
                            Appointment Reminders
                          </label>
                          <p className="text-gray-500">Receive email reminders about upcoming appointments</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="email_account_updates"
                            name="email_account_updates"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={notificationPrefs.email_account_updates}
                            onChange={handleNotificationChange}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="email_account_updates" className="font-medium text-gray-700">
                            Account Updates
                          </label>
                          <p className="text-gray-500">Receive emails about account changes and security updates</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="email_health_records"
                            name="email_health_records"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={notificationPrefs.email_health_records}
                            onChange={handleNotificationChange}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="email_health_records" className="font-medium text-gray-700">
                            Health Record Updates
                          </label>
                          <p className="text-gray-500">Receive email notifications when your health records are updated</p>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                  
                  <fieldset>
                    <legend className="text-base font-medium text-gray-900">SMS Notifications</legend>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="sms_appointment_reminders"
                            name="sms_appointment_reminders"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={notificationPrefs.sms_appointment_reminders}
                            onChange={handleNotificationChange}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="sms_appointment_reminders" className="font-medium text-gray-700">
                            Appointment Reminders
                          </label>
                          <p className="text-gray-500">Receive SMS reminders about upcoming appointments</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="sms_account_updates"
                            name="sms_account_updates"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={notificationPrefs.sms_account_updates}
                            onChange={handleNotificationChange}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="sms_account_updates" className="font-medium text-gray-700">
                            Account Alerts
                          </label>
                          <p className="text-gray-500">Receive SMS alerts for important account security events</p>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                  
                  <fieldset>
                    <legend className="text-base font-medium text-gray-900">In-App Notifications</legend>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="in_app_notifications"
                            name="in_app_notifications"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={notificationPrefs.in_app_notifications}
                            onChange={handleNotificationChange}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="in_app_notifications" className="font-medium text-gray-700">
                            Enable In-App Notifications
                          </label>
                          <p className="text-gray-500">Receive real-time notifications within the application</p>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-5">
                <div className="flex justify-end">
                  <FormButton
                    type="button"
                    variant="primary"
                    onClick={() => {
                      setSuccessMessage('Notification preferences saved successfully.');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                  >
                    Save Preferences
                  </FormButton>
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
                  Manage your account security and authentication options
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
                        {user?.two_factor_enabled ? 'Manage 2FA' : 'Enable 2FA'}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="pt-5 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">Session Management</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Manage your active sessions and sign out from other devices
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => {
                          setSuccessMessage('All other sessions have been signed out.');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }}
                      >
                        Sign Out Other Devices
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-5 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">Login History</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          View recent login activity on your account
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => {
                          // In a real app, this would navigate to a login history page
                          // or open a modal with login history
                          alert('This would show your login history in a real application.');
                        }}
                      >
                        View Login History
                      </button>
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
                <h3 className="text-lg font-medium leading-6 text-gray-900">Privacy Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage how your data is used and shared
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-5">
                <div className="space-y-6">
                  <fieldset>
                    <legend className="text-base font-medium text-gray-900">Data Sharing Preferences</legend>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="share_data_for_research"
                            name="share_data_for_research"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={privacyPrefs.share_data_for_research}
                            onChange={handlePrivacyChange}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="share_data_for_research" className="font-medium text-gray-700">
                            Research Data Sharing
                          </label>
                          <p className="text-gray-500">
                            Allow your de-identified health data to be used for medical research purposes
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="share_data_with_providers"
                            name="share_data_with_providers"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={privacyPrefs.share_data_with_providers}
                            onChange={handlePrivacyChange}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="share_data_with_providers" className="font-medium text-gray-700">
                            Provider Data Sharing
                          </label>
                          <p className="text-gray-500">
                            Allow your health information to be shared with authorized healthcare providers
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="allow_marketing_communications"
                            name="allow_marketing_communications"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={privacyPrefs.allow_marketing_communications}
                            onChange={handlePrivacyChange}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="allow_marketing_communications" className="font-medium text-gray-700">
                            Marketing Communications
                          </label>
                          <p className="text-gray-500">
                            Receive marketing communications and newsletters
                          </p>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                  
                  <div className="pt-5 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">HIPAA Authorization</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Review and manage your HIPAA authorization settings
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => {
                          // In a real app, this would navigate to a HIPAA authorization details page
                          window.location.href = config.hipaaNoticeUrl;
                        }}
                      >
                        View Authorization
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-5 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">Data Export</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Request a copy of your personal data
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => {
                          setSuccessMessage('Data export has been requested. You will receive an email when it is ready.');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }}
                      >
                        Request Data Export
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-5">
                <div className="flex justify-end">
                  <FormButton
                    type="button"
                    variant="primary"
                    onClick={() => {
                      setSuccessMessage('Privacy preferences saved successfully.');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                  >
                    Save Preferences
                  </FormButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Account Section */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Account</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Once you delete your account, you will lose all data associated with it.
              This action cannot be undone.
            </p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  // In a real app, this would call an API to delete the account
                  alert('In a real application, this would delete your account.');
                }
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}