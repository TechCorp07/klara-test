// src/app/(dashboard)/provider/emergency-access/page.tsx
'use client';

import { EmergencyAccessPanel } from '@/components/emergency-access/EmergencyAccessPanel';
import { useAuth } from '@/lib/auth/use-auth';
import { useRouter } from 'next/navigation';

export default function ProviderEmergencyAccessPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  if (!user || user.role !== 'provider') {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">Access Denied</h3>
          <p className="mb-4">
            You don&apos;t have permission to access this page. Healthcare provider role is required.
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Access</h1>
        <p className="text-lg text-gray-600">Request emergency access to patient records</p>
      </div>
      
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Emergency access should only be used in situations where immediate access to patient data
                is necessary for patient care and normal authorization processes cannot be followed.
                All emergency access is logged, monitored, and will be reviewed by compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <EmergencyAccessPanel
        mode="initiate"
        onComplete={(result) => {
          console.log('Emergency access initiated:', result);
          // In a real implementation, you might redirect to the patient's record here
        }}
      />
    </div>
  );
}