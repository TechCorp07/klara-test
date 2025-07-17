// src/components/auth/LogoutControls.tsx
'use client';

import React, { useState } from 'react';
import { useJWTAuth } from '@/lib/auth/use-auth';

interface LogoutControlsProps {
  variant?: 'dropdown' | 'buttons' | 'simple';
  className?: string;
  showUserInfo?: boolean;
}

export default function LogoutControls({ 
  variant = 'dropdown', 
  className = '',
  showUserInfo = true 
}: LogoutControlsProps) {
  const { logout, logoutAllTabs, user, tabId, isAuthenticated } = useJWTAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Simple logout button
  if (variant === 'simple') {
    return (
      <button
        onClick={logout}
        className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors ${className}`}
      >
        Logout
      </button>
    );
  }

  // Side-by-side buttons
  if (variant === 'buttons') {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {showUserInfo && (
          <div className="flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md">
            {user.email} ({user.role})
          </div>
        )}
        <button
          onClick={logout}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
        >
          Logout Tab
        </button>
        <button
          onClick={logoutAllTabs}
          className="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
        >
          Logout All
        </button>
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {showUserInfo ? user.email : 'Account'}
        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
            <div className="py-1">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-sm text-gray-500">Role: {user.role}</p>
                <p className="text-xs text-gray-400">Tab: {tabId}</p>
              </div>
              
              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="font-medium">Logout This Tab</div>
                <div className="text-xs text-gray-500">Keep other tabs active</div>
              </button>

              <button
                onClick={() => {
                  logoutAllTabs();
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="font-medium text-red-600">Logout All Tabs</div>
                <div className="text-xs text-gray-500">End all sessions</div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}