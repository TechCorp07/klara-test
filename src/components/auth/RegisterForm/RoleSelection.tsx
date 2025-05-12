// src/components/auth/RegisterForm/RoleSelection.tsx
'use client';

import React from 'react';
import { UserRole } from '@/types/auth.types';

interface RoleSelectionProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
}

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  requiresApproval?: boolean;
}

/**
 * Component for selecting a user role during registration.
 * 
 * This component displays role options with descriptions and icons,
 * allowing users to select their appropriate role during registration.
 */
const RoleSelection: React.FC<RoleSelectionProps> = ({ selectedRole, onRoleSelect }) => {
  // Define role options with descriptions and icons
  const roles: RoleOption[] = [
    {
      role: 'patient',
      title: 'Patient',
      description: 'Access your health records, schedule appointments, and manage prescriptions.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      requiresApproval: true,
    },
    {
      role: 'caregiver',
      title: 'Caregiver',
      description: 'Help manage care for your loved ones and coordinate with healthcare providers.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      requiresApproval: true,
    },
    {
      role: 'provider',
      title: 'Healthcare Provider',
      description: 'Manage patient care, access medical records, and provide telemedicine services.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      requiresApproval: true,
    },
    {
      role: 'pharmco',
      title: 'Pharmaceutical Company',
      description: 'Manage medication information, clinical trials, and research partnerships.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      requiresApproval: true,
    },
    {
      role: 'researcher',
      title: 'Researcher',
      description: 'Access de-identified data, analyze health trends, and conduct clinical research.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      requiresApproval: true,
    },
    {
      role: 'compliance',
      title: 'Compliance Officer',
      description: 'Monitor HIPAA compliance, conduct audits, and ensure regulatory requirements are met.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      requiresApproval: true,
    },
  ];

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Select User Type</h3>
      <p className="text-sm text-gray-600 mb-4">
        Choose the role that best describes how you will use the Klararety Healthcare Platform.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((roleOption) => (
          <div
            key={roleOption.role}
            className={`
              p-4 border rounded-lg cursor-pointer transition-all
              ${selectedRole === roleOption.role
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }
            `}
            onClick={() => onRoleSelect(roleOption.role)}
          >
            <div className="flex items-start space-x-4">
              <div className={`
                p-2 rounded-full 
                ${selectedRole === roleOption.role ? 'text-blue-600 bg-blue-100' : 'text-gray-500 bg-gray-100'}
              `}>
                {roleOption.icon}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{roleOption.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{roleOption.description}</p>
                
                {roleOption.requiresApproval && (
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Requires Approval
                  </div>
                )}
              </div>
              
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  checked={selectedRole === roleOption.role}
                  onChange={() => onRoleSelect(roleOption.role)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 mt-4">
        Note: Certain roles require additional verification and approval before full access is granted.
        This helps us maintain the security and integrity of the Klararety Healthcare Platform.
      </p>
    </div>
  );
};

export default RoleSelection;