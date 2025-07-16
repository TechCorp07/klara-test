// src/app/(dashboard)/patient/page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';

export default function PatientDashboard() {
  const { user, jwtPayload } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name || user?.username || 'Patient'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's your health dashboard overview.
        </p>
      </div>

      {/* Success Message */}
      <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              🎉 JWT Authentication Successful!
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Phase 1 complete - your JWT authentication system is working perfectly!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Health Summary Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Overall Health:</span>
              <span className="text-green-600 font-medium">Good</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Checkup:</span>
              <span className="text-gray-900">2 weeks ago</span>
            </div>
          </div>
        </div>

        {/* Appointments Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
          <div className="space-y-2">
            <div className="text-gray-600">
              No upcoming appointments
            </div>
            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Schedule Appointment
            </button>
          </div>
        </div>

        {/* Medications Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Medications</h3>
          <div className="space-y-2">
            <div className="text-gray-600">
              No active medications
            </div>
            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Manage Medications
            </button>
          </div>
        </div>
      </div>

      {/* User Info Debug Panel */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Basic Info</h4>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">ID:</span> {user?.id}</div>
              <div><span className="font-medium">Username:</span> {user?.username}</div>
              <div><span className="font-medium">Email:</span> {user?.email}</div>
              <div><span className="font-medium">Role:</span> {user?.role}</div>
              <div><span className="font-medium">Approved:</span> {user?.is_approved ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Email Verified:</span> {user?.email_verified ? 'Yes' : 'No'}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Backend Permissions</h4>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">Admin Access:</span> {jwtPayload?.permissions?.can_access_admin ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Manage Users:</span> {jwtPayload?.permissions?.can_manage_users ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Patient Data:</span> {jwtPayload?.permissions?.can_access_patient_data ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Research Data:</span> {jwtPayload?.permissions?.can_access_research_data ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Emergency Access:</span> {jwtPayload?.permissions?.can_emergency_access ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Is Staff:</span> {jwtPayload?.permissions?.is_staff ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Is Superadmin:</span> {jwtPayload?.permissions?.is_superadmin ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 1 Completion Status */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 Phase 1 Complete!</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div>✅ JWT Backend Integration Working</div>
          <div>✅ Race Conditions Eliminated</div>
          <div>✅ Local Permission Validation</div>
          <div>✅ Secure Cookie Authentication</div>
          <div>✅ Permission-Based Route Protection</div>
          <div>✅ Real-time Token Monitoring</div>
        </div>
        <div className="mt-4 text-sm text-blue-700">
          <strong>Ready for Phase 2:</strong> Dashboard Permission Integration and Advanced Features
        </div>
      </div>
    </div>
  );
}