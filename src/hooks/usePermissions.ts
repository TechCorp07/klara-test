// src/hooks/usePermissions.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import type { UserPermissions, UsePermissionsResult } from '@/types/permissions';

export const usePermissions = (): UsePermissionsResult => {
  const { user, isLoading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculatePermissions = () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          setPermissions(null);
          return;
        }

        // Role-based permission logic
        const userRole = user.role?.toLowerCase() || '';
        
        // Define role categories
        const allAuthenticatedRoles = [
          'patient', 'provider', 'researcher', 'pharmco', 'caregiver', 
          'compliance', 'admin', 'superadmin'
        ];
        const adminRoles = ['admin', 'superadmin'];
        const complianceRoles = ['admin', 'superadmin', 'compliance'];
        const patientDataRoles = ['patient', 'provider', 'caregiver', 'admin', 'superadmin'];

        // Calculate comprehensive permissions
        const calculatedPermissions: UserPermissions = {
          // General dashboard access - ALL authenticated users
          has_dashboard_access: allAuthenticatedRoles.includes(userRole),
          
          // Admin-specific permissions
          has_approval_permissions: adminRoles.includes(userRole),
          has_admin_access: adminRoles.includes(userRole),
          has_user_management_access: adminRoles.includes(userRole),
          has_system_settings_access: adminRoles.includes(userRole),
          
          // Compliance permissions
          has_audit_access: complianceRoles.includes(userRole),
          has_compliance_reports_access: complianceRoles.includes(userRole),
          
          // Healthcare permissions
          has_patient_data_access: patientDataRoles.includes(userRole),
          has_medical_records_access: patientDataRoles.includes(userRole),
          
          // Role-specific permissions
          can_view_own_data: true, // All users can view their own data
          can_manage_appointments: ['patient', 'provider', 'caregiver', 'admin', 'superadmin'].includes(userRole),
          can_access_telemedicine: ['patient', 'provider', 'caregiver', 'admin', 'superadmin'].includes(userRole),
          can_view_research_data: ['researcher', 'admin', 'superadmin'].includes(userRole),
          can_access_clinical_trials: ['researcher', 'pharmco', 'provider', 'admin', 'superadmin'].includes(userRole),
          can_manage_medications: ['provider', 'pharmco', 'caregiver', 'admin', 'superadmin'].includes(userRole),
          
          // User role for reference
          user_role: userRole,
        };

        // Debug logging (only in development)
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('🔍 Comprehensive Permission Check:', {
            user_email: user.email,
            user_role: userRole,
            is_approved: user.is_approved,
            key_permissions: {
              dashboard_access: calculatedPermissions.has_dashboard_access,
              admin_access: calculatedPermissions.has_admin_access,
              approval_permissions: calculatedPermissions.has_approval_permissions,
              audit_access: calculatedPermissions.has_audit_access,
            }
          });
        }

        setPermissions(calculatedPermissions);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to calculate permissions';
        setError(errorMessage);
        
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Permission calculation error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    // Only calculate permissions when auth is not loading
    if (!authLoading) {
      calculatePermissions();
    }
  }, [user, authLoading]);

  return { 
    permissions, 
    loading: loading || authLoading, 
    error
  };
};