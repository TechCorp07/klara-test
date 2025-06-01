// src/app/(auth)/compliance-violation/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { AppLogo } from '@/components/ui/AppLogo';
import { config } from '@/lib/config';

/**
 * Compliance violation page component.
 * 
 * This page is displayed when a user attempts an action that violates 
 * HIPAA compliance rules or tries to access PHI without proper authorization.
 * It provides information about the violation and next steps.
 */
export default function ComplianceViolationPage() {
  const { user, logout } = useAuth();
  const [incidentId] = useState(() => `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // Log the compliance violation for audit trail
  useEffect(() => {
    // Log security incident details (sanitized for HIPAA)
    const incidentDetails = {
      incident_id: incidentId,
      timestamp: new Date().toISOString(),
      user_id: user?.id || 'unknown',
      user_role: user?.role || 'unknown',
      user_email: user?.email ? user.email.replace(/(.{2}).*(@.*)/, '$1***$2') : 'unknown', // Partially redact email
      page_url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      violation_type: 'HIPAA_ACCESS_VIOLATION',
      severity: 'HIGH'
    };
    
    console.error('HIPAA Compliance Violation Logged:', incidentDetails);
    
    // In production, send this to your security monitoring service
    // Example: securityMonitoringService.logIncident(incidentDetails);
  }, [incidentId, user]);
  
  const handleSecureLogout = async () => {
    try {
      await logout();
      // Clear any potentially sensitive data from browser
      if (typeof window !== 'undefined') {
        // Clear session storage
        sessionStorage.clear();
        
        // Clear any application-specific local storage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('klararety_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error during secure logout:', error);
      // Force redirect even if logout fails
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-red-50">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <AppLogo size='lg' />
        </div>
        
        <div className="bg-white p-8 shadow-lg rounded-lg border-l-4 border-red-500">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <svg 
                className="h-12 w-12 text-red-600" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-red-900">
                HIPAA Compliance Violation Detected
              </h1>
              <p className="text-red-700 text-sm mt-1">
                Incident ID: {incidentId}
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="bg-red-100 border border-red-300 rounded-md p-4 mb-4">
              <h2 className="text-lg font-semibold text-red-900 mb-2">Security Alert</h2>
              <p className="text-red-800 text-sm">
                Your recent action has been identified as a potential violation of HIPAA compliance rules. 
                This could include attempting to access Protected Health Information (PHI) without proper 
                authorization, or performing an action that violates patient privacy regulations.
              </p>
            </div>
            
            <div className="bg-yellow-100 border border-yellow-300 rounded-md p-4 mb-4">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">What Happened?</h2>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Your access attempt was blocked to protect patient privacy</li>
                <li>• This incident has been automatically logged for compliance review</li>
                <li>• Your session has been flagged for security review</li>
                <li>• No PHI was compromised during this incident</li>
              </ul>
            </div>
            
            <div className="bg-blue-100 border border-blue-300 rounded-md p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Next Steps</h2>
              <ol className="text-blue-800 text-sm space-y-2 list-decimal list-inside">
                <li>Your access session will be terminated for security purposes</li>
                <li>The compliance team has been notified of this incident</li>
                <li>You may be contacted for additional verification or training</li>
                <li>If this was an error, please contact the compliance team immediately</li>
              </ol>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSecureLogout}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Secure Logout
              </button>
              
              <Link
                href={`mailto:${config.supportEmail}?subject=HIPAA Compliance Incident ${incidentId}&body=I need assistance with compliance incident ${incidentId}. Please review this incident as I believe it may have been triggered in error.`}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Contact Compliance Team
              </Link>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This security measure is in place to protect patient privacy and ensure HIPAA compliance. 
              All access attempts are monitored and logged for audit purposes.
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            If you believe this is an error, please contact our compliance team immediately at{' '}
            <a 
              href={`mailto:${config.supportEmail}`}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              {config.supportEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}