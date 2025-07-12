// src/app/(dashboard)/compliance/emergency-access/page.tsx
'use client';

import { useState } from 'react';
import { EmergencyAccessPanel } from '@/components/emergency-access/EmergencyAccessPanel';
import { useAuth } from '@/lib/auth';

export default function EmergencyAccessPage() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'review' | 'summary'>('review');
  
  if (!user || user.role !== 'compliance') {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded max-w-md">
          <h3 className="font-bold mb-2">Access Denied</h3>
          <p className="mb-4">
            You don&apos;t have permission to access this page. Compliance officer role is required.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Access Management</h1>
        <p className="text-lg text-gray-600">Review and manage emergency PHI access events</p>
      </div>
      
      {/* View Selector */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveView('review')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'review'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Review Requests
            </button>
            <button
              onClick={() => setActiveView('summary')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Access Summary
            </button>
          </nav>
        </div>
      </div>
      
      {/* Content */}
      <EmergencyAccessPanel
        mode={activeView}
        onComplete={(result) => {
          console.log('Action completed:', result);
        }}
      />
    </div>
  );
}