'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { FaCog, FaUserCircle, FaLock, FaKey, FaShieldAlt, FaMobile, FaLanguage, FaBell, FaExclamationTriangle } from 'react-icons/fa';

// Setting card component
const SettingCard = ({ icon: Icon, title, description, href, onClick }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {href ? (
        <Link href={href} className="block p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
          </div>
        </Link>
      ) : (
        <button 
          onClick={onClick} 
          className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

// Settings section component
const SettingsSection = ({ title, description, children }) => {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {children}
      </div>
    </div>
  );
};

export default function SettingsClient() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        
        {/* Account Settings */}
        <SettingsSection 
          title="Account Settings" 
          description="Manage your profile and account preferences"
        >
          <SettingCard
            icon={FaUserCircle}
            title="Profile Information"
            description="Update your personal information and profile details"
            href="/profile"
          />
          
          <SettingCard
            icon={FaLock}
            title="Password & Security"
            description="Manage your password and account security settings"
            href="/profile/security"
          />
          
          <SettingCard
            icon={FaKey}
            title="Two-Factor Authentication"
            description="Set up or manage two-factor authentication for your account"
            href="/settings/two-factor"
          />
        </SettingsSection>
        
        {/* Preferences */}
        <SettingsSection 
          title="Preferences" 
          description="Customize your experience"
        >
          <SettingCard
            icon={FaBell}
            title="Notifications"
            description="Configure email and in-app notification preferences"
            href="/settings/notifications"
          />
          
          <SettingCard
            icon={FaLanguage}
            title="Language & Region"
            description="Set your preferred language and regional settings"
            href="/settings/language"
          />
          
          <SettingCard
            icon={FaMobile}
            title="Mobile Preferences"
            description="Configure your mobile app settings and notifications"
            href="/settings/mobile"
          />
        </SettingsSection>
        
        {/* Privacy & Data */}
        <SettingsSection 
          title="Privacy & Data" 
          description="Manage your data and privacy settings"
        >
          <SettingCard
            icon={FaShieldAlt}
            title="Privacy Settings"
            description="Control who can see your information and how it's used"
            href="/settings/privacy"
          />
          
          <SettingCard
            icon={FaUserCircle}
            title="Data Export"
            description="Download a copy of your personal data"
            href="/settings/data-export"
          />
          
          <SettingCard
            icon={FaCog}
            title="Session Management"
            description="View and manage your active sessions across devices"
            href="/profile/security"
          />
        </SettingsSection>
        
        {/* Account Actions */}
        <SettingsSection 
          title="Account Actions" 
          description="Perform account-related actions"
        >
          <SettingCard
            icon={FaUserCircle}
            title="Sign Out"
            description="Sign out from your current session"
            onClick={() => setShowLogoutConfirm(true)}
          />
        </SettingsSection>
      </div>
      
      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          
          <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Sign Out</h3>
            </div>
            
            <div className="mb-5">
              <p className="text-sm text-gray-500">
                Are you sure you want to sign out? Any unsaved changes will be lost.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}