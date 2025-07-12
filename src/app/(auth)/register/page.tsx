// src/app/(auth)/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/types/auth.types';
import { 
  RoleSelection, 
  PatientRegisterForm,
  ProviderRegisterForm,
  ResearcherRegisterForm, 
  CaregiverRegisterForm,
  PharmcoRegisterForm,
  ComplianceRegisterForm
} from '@/components/auth/RegisterForm';
import { AppLogo } from '@/components/ui/AppLogo';

/**
 * Registration page component.
 * 
 * This page handles the registration flow:
 * 1. User selects role
 * 2. User fills out role-specific registration form
 * 
 * It also handles redirecting authenticated users to dashboard.
 */
export default function RegisterPage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  
  // State for role selection
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isInitialized, router]);
  
  // Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };
  
  // Render the appropriate registration form based on selected role
const renderRegistrationForm = () => {
  switch (selectedRole) {
    case 'patient':
      return <PatientRegisterForm />;
    case 'provider':
      return <ProviderRegisterForm />;
    case 'researcher':
      return <ResearcherRegisterForm />;
    case 'caregiver':
      return <CaregiverRegisterForm />;
    case 'pharmco':
      return <PharmcoRegisterForm />;
    case 'compliance':
      return <ComplianceRegisterForm />;
    default:
      return null;
  }
};
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-3xl">
        <div className="flex justify-center mb-8">
          <AppLogo size='lg' />
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Create Your Account
          </h1>
          
          {!selectedRole ? (
            // Step 1: Role selection
            <RoleSelection
              selectedRole={selectedRole}
              onRoleSelect={handleRoleSelect}
            />
          ) : (
            // Step 2: Role-specific registration form
            <>
              <button
                onClick={() => setSelectedRole(null)}
                className="mb-6 flex items-center text-sm text-blue-600 hover:text-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to role selection
              </button>
              
              {renderRegistrationForm()}
            </>
          )}
        </div>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          <span>Protected health information is handled in accordance with HIPAA regulations.</span>
        </p>
      </div>
    </div>
  );
}