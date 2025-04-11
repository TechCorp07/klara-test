'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FaShieldAlt, FaUserShield, FaExclamationTriangle, FaSave, FaEye, FaEyeSlash, FaShare, FaLock, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import AuthenticatedLayout from '../../../components/layout/AuthenticatedLayout';
import HIPAABanner from '../../../components/ui/HIPAABanner';

export default function PrivacySettingsPage() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Privacy settings state
  const [settings, setSettings] = useState({
    profile_visibility: 'limited',
    share_medical_data: false,
    allow_provider_access: true,
    allow_appointment_reminders: true,
    allow_medical_alerts: true,
    allow_marketing: false,
    allow_research: false,
    allow_third_party: false,
    show_in_provider_directory: true
  });
  
  // Load current settings on mount
  useEffect(() => {
    // This would fetch from user preferences in a real implementation
    // For now we'll use mock settings or defaults
    if (user?.privacy_settings) {
      setSettings(user.privacy_settings);
    }
  }, [user]);
  
  // Handle toggle changes
  const handleToggle = (settingName) => {
    setSettings({
      ...settings,
      [settingName]: !settings[settingName]
    });
  };
  
  // Handle radio button changes
  const handleRadioChange = (settingName, value) => {
    setSettings({
      ...settings,
      [settingName]: value
    });
  };
  
  // Handle form submission
  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would update the user's privacy settings
      // For now, we'll just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user object with new settings
      if (updateProfile) {
        await updateProfile({ privacy_settings: settings });
      }
      
      toast.success('Privacy settings saved successfully');
    } catch (err) {
      console.error('Error saving privacy settings:', err);
      setError('Failed to save privacy settings. Please try again later.');
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle component for boolean settings
  const ToggleSetting = ({ id, title, description, value, onChange, disabled = false }) => (
    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">
        {title}
      </dt>
      <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
        <div className="flex-grow">
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <div className="relative inline-block w-10 mr-2 align-middle select-none">
            <input
              type="checkbox"
              name={id}
              id={id}
              checked={value}
              onChange={() => onChange(id)}
              disabled={disabled}
              className="sr-only"
            />
            <label
              htmlFor={id}
              className={`block overflow-hidden h-6 rounded-full ${disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-300 cursor-pointer'}`}
            >
              <span
                className={`dot absolute left-1 top-1 h-4 w-4 rounded-full transition-transform duration-200 ease-in ${
                  value 
                    ? 'transform translate-x-4 bg-blue-600' 
                    : 'bg-white'
                }`}
              ></span>
            </label>
          </div>
        </div>
      </dd>
    </div>
  );
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Privacy Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Control how your personal and health information is used and shared
            </p>
          </div>
          
          <div className="flex">
            <Link
              href="/settings"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Back to Settings
            </Link>
            
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
        
        <HIPAABanner type="security" message="Your privacy is protected under HIPAA regulations. Changes to privacy settings are logged for security and compliance purposes." />
        
        {error && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Profile Visibility */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center">
                <FaEye className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Profile Visibility</h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">Control who can see your profile information</p>
            </div>
            
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <fieldset>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="visibility-public"
                      name="profile_visibility"
                      type="radio"
                      checked={settings.profile_visibility === 'public'}
                      onChange={() => handleRadioChange('profile_visibility', 'public')}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="visibility-public" className="ml-3">
                      <span className="block text-sm font-medium text-gray-700">Public</span>
                      <span className="block text-sm text-gray-500">Your profile is visible to all users of the platform</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="visibility-limited"
                      name="profile_visibility"
                      type="radio"
                      checked={settings.profile_visibility === 'limited'}
                      onChange={() => handleRadioChange('profile_visibility', 'limited')}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="visibility-limited" className="ml-3">
                      <span className="block text-sm font-medium text-gray-700">Limited</span>
                      <span className="block text-sm text-gray-500">Your profile is only visible to your healthcare providers and administrators</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="visibility-private"
                      name="profile_visibility"
                      type="radio"
                      checked={settings.profile_visibility === 'private'}
                      onChange={() => handleRadioChange('profile_visibility', 'private')}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="visibility-private" className="ml-3">
                      <span className="block text-sm font-medium text-gray-700">Private</span>
                      <span className="block text-sm text-gray-500">Your profile is only visible to your assigned healthcare provider</span>
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
            
            <div className="px-4 py-5 sm:px-6">
              <div className="space-y-4">
                <ToggleSetting
                  id="show_in_provider_directory"
                  title="Provider Directory"
                  description="Show your profile in the provider directory (only applies to healthcare providers)"
                  value={settings.show_in_provider_directory}
                  onChange={handleToggle}
                  disabled={user?.role !== 'provider'}
                />
              </div>
            </div>
          </div>
          
          {/* Data Sharing */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center">
                <FaShare className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Data Sharing</h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">Control how your health data is shared with providers and services</p>
            </div>
            
            <div className="px-4 py-5 sm:px-6">
              <dl className="divide-y divide-gray-200">
                <ToggleSetting
                  id="share_medical_data"
                  title="Share Medical Data"
                  description="Allow sharing your medical data between healthcare providers within the network for better coordination of care"
                  value={settings.share_medical_data}
                  onChange={handleToggle}
                />
                
                <ToggleSetting
                  id="allow_provider_access"
                  title="Provider Access"
                  description="Allow your assigned healthcare providers to access your health records"
                  value={settings.allow_provider_access}
                  onChange={handleToggle}
                />
                
                <ToggleSetting
                  id="allow_research"
                  title="Research Participation"
                  description="Allow your de-identified health data to be used for medical research purposes"
                  value={settings.allow_research}
                  onChange={handleToggle}
                />
                
                <ToggleSetting
                  id="allow_third_party"
                  title="Third-Party Services"
                  description="Allow third-party services to access your health data (e.g., wearable devices, health apps)"
                  value={settings.allow_third_party}
                  onChange={handleToggle}
                />
              </dl>
            </div>
          </div>
          
          {/* Communication Preferences */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center">
                <FaUserShield className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Communication Preferences</h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">Control what types of communications you receive</p>
            </div>
            
            <div className="px-4 py-5 sm:px-6">
              <dl className="divide-y divide-gray-200">
                <ToggleSetting
                  id="allow_appointment_reminders"
                  title="Appointment Reminders"
                  description="Receive reminders about upcoming appointments and follow-ups"
                  value={settings.allow_appointment_reminders}
                  onChange={handleToggle}
                />
                
                <ToggleSetting
                  id="allow_medical_alerts"
                  title="Medical Alerts"
                  description="Receive important alerts about lab results, prescriptions, and other medical information"
                  value={settings.allow_medical_alerts}
                  onChange={handleToggle}
                />
                
                <ToggleSetting
                  id="allow_marketing"
                  title="Marketing Communications"
                  description="Receive marketing communications, newsletters, and promotional offers"
                  value={settings.allow_marketing}
                  onChange={handleToggle}
                />
              </dl>
            </div>
          </div>
          
          {/* HIPAA Privacy Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center">
                <FaLock className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">HIPAA Privacy Information</h2>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:px-6">
              <div className="space-y-4 text-sm text-gray-500">
                <p>
                  Under the Health Insurance Portability and Accountability Act (HIPAA), you have certain rights regarding your protected health information (PHI):
                </p>
                
                <ul className="list-disc pl-5 space-y-2">
                  <li>Right to access and review your health information</li>
                  <li>Right to request corrections to your health information</li>
                  <li>Right to know who has accessed your information</li>
                  <li>Right to limit who can access your information</li>
                  <li>Right to be notified if there is a breach of your unsecured PHI</li>
                </ul>
                
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaInfoCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Privacy Policy</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          For more information about how we collect, use, and protect your health information, please see our <Link href="/privacy-policy" className="font-medium underline">Privacy Policy</Link>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Save button at bottom */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
