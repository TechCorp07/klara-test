// src/components/ui/ProfileDropdown.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { User, Settings, Lock, Camera, Bell, LogOut, ChevronDown } from 'lucide-react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export default function ProfileDropdown({ isOpen, onClose, triggerRef }: ProfileDropdownProps) {
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const profileItems = [
    {
      icon: User,
      label: 'View Profile',
      href: '/profile',
      description: 'Manage your personal information'
    },
    {
      icon: Settings,
      label: 'Account Settings',
      href: '/settings',
      description: 'Preferences and configuration'
    },
    {
      icon: Lock,
      label: 'Change Password',
      href: '/settings?tab=security',
      description: 'Update your security settings'
    },
    {
      icon: Camera,
      label: 'Profile Photo',
      href: '/profile?section=photo',
      description: 'Update your profile picture'
    },
    {
      icon: Bell,
      label: 'Notification Settings',
      href: '/settings?tab=notifications',
      description: 'Manage notification preferences'
    }
  ];

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      {/* User info header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-2">
        {profileItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <item.icon className="w-4 h-4 text-gray-400 mr-3" />
            <div>
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100 py-2">
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          <div>
            <div className="font-medium">Sign Out</div>
            <div className="text-xs text-red-500">Log out of your account</div>
          </div>
        </button>
      </div>
    </div>
  );
}