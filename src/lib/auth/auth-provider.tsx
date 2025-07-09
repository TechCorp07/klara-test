// src/lib/auth/auth-provider.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  LoginRequest,
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  ResetPasswordRequest, 
  VerifyEmailRequest, 
  SetupTwoFactorResponse,
  AuthContextType,
  PatientProfile,
  ProviderProfile,
  PharmcoProfile,
  CaregiverProfile,
  ResearcherProfile,
  ComplianceProfile,
  CaregiverRequest,
  HipaaDocument,
  ConsentRecord,
  EmergencyAccessRecord,
  ConsentAuditTrailResponse,
  EmergencyAccessFilters,
  EmergencyAccessSummary,
} from '@/types/auth.types';
import { authService } from '../api/services/auth.service';
import { config } from '@/lib/config';
import { ConsentUpdateResponse } from '@/types/auth.types';
import { DashboardStatsResponse } from '@/types/admin.types';
import { usePathname } from 'next/navigation';

// Define public routes that don't need authentication checks
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register', 
  '/verify-email',
  '/reset-password',
  '/forgot-password',
  '/two-factor',
  '/approval-pending',
  '/unauthorized',
  '/compliance-violation',
  '/terms-of-service',
  '/privacy-policy', 
  '/hipaa-notice',
  '/contact',
  '/about',
  '/help',
  '/support',
  '/faq',
];

const PROTECTED_ROUTE_PREFIXES = [
  '/patient',
  '/provider', 
  '/admin',
  '/pharmco',
  '/caregiver',
  '/researcher',
  '/compliance',
  '/dashboard',
  '/profile',
  '/settings',
  '/messages'
];

// Define the specific union types for better type safety
type IdentityVerificationMethod = "E_SIGNATURE" | "PROVIDER_VERIFICATION" | "DOCUMENT_UPLOAD" | "VIDEO_VERIFICATION";
type CaregiverRequestStatus = "PENDING" | "APPROVED" | "DENIED" | "EXPIRED";
type EmergencyAccessReason = "LIFE_THREATENING" | "URGENT_CARE" | "PATIENT_UNABLE" | "IMMINENT_DANGER" | "OTHER";

// Enhanced AuthContextType with corrected types
export interface EnhancedAuthContextType extends Omit<AuthContextType, 
  'initiateIdentityVerification' | 
  'completeIdentityVerification' | 
  'getCaregiverRequests' | 
  'initiateEmergencyAccess' |
  'getDashboardStats' |
  'login'
> {
  // Override login method with correct signature
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  initiateIdentityVerification: (method: IdentityVerificationMethod) => Promise<{ detail: string; method: string }>;
  completeIdentityVerification: (method: IdentityVerificationMethod) => Promise<{ detail: string; verified_at: string }>;
  
  completePatientProfile: (profileData: Partial<PatientProfile>) => Promise<PatientProfile>;
  updatePatientConsent: (consents: {
    medication_adherence_monitoring_consent: boolean;
    vitals_monitoring_consent: boolean;
    research_participation_consent: boolean;
  }) => Promise<PatientProfile>;
  
  completeProviderProfile: (profileData: Partial<ProviderProfile>) => Promise<ProviderProfile>;
  completePharmcoProfile: (profileData: Partial<PharmcoProfile>) => Promise<PharmcoProfile>;
  completeCaregiverProfile: (profileData: Partial<CaregiverProfile>) => Promise<CaregiverProfile>;
  completeResearcherProfile: (profileData: Partial<ResearcherProfile>) => Promise<ResearcherProfile>;
  completeComplianceProfile: (profileData: Partial<ComplianceProfile>) => Promise<ComplianceProfile>;
  
  getCaregiverRequests: (params?: { status?: CaregiverRequestStatus; ordering?: string }) => Promise<CaregiverRequest[]>;
  approveCaregiverRequest: (requestId: number) => Promise<{ detail: string }>;
  denyCaregiverRequest: (requestId: number, reason?: string) => Promise<{ detail: string }>;
  getCaregiverRequestDetails: (requestId: number) => Promise<CaregiverRequest>;
  
  getHipaaDocuments: (filters?: { document_type?: string; active?: boolean }) => Promise<HipaaDocument[]>;
  getHipaaDocumentDetails: (documentId: number) => Promise<HipaaDocument>;
  getLatestHipaaDocuments: () => Promise<HipaaDocument[]>;
  signHipaaDocument: (documentId: number) => Promise<{ detail: string; consent_id: number; signed_at: string }>;
  
  getConsentRecords: (filters?: { consent_type?: string; consented?: boolean }) => Promise<ConsentRecord[]>;
  getConsentAuditTrail: (days?: number) => Promise<ConsentAuditTrailResponse>;
  
  initiateEmergencyAccess: (data: {
    patient_identifier: string;
    reason: EmergencyAccessReason;
    detailed_reason: string;
  }) => Promise<{ detail: string; access_id: number; expires_in: string }>;
  endEmergencyAccess: (accessId: number, phiSummary: string) => Promise<{ detail: string }>;
  getEmergencyAccessRecords: (filters?: EmergencyAccessFilters) => Promise<EmergencyAccessRecord[]>;
  reviewEmergencyAccess: (accessId: number, reviewData: { notes: string; justified: boolean }) => Promise<{ detail: string }>;
  getEmergencyAccessSummary: () => Promise<EmergencyAccessSummary>;
  
  getDashboardStats: () => Promise<DashboardStatsResponse>;
  updateConsent: (consentType: string, consented: boolean) => Promise<ConsentUpdateResponse>;
}

// Create context with null as initial value
export const AuthContext = createContext<EnhancedAuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  
  // Get current pathname to check if we're on a public route
  const pathname = usePathname();
  
  // Helper function to check if current route is public
  const isPublicRoute = (path: string): boolean => {
    return PUBLIC_ROUTES.some(route => 
      path === route || 
      path.startsWith(route + '/') ||
      path.startsWith('/reset-password/') 
    );
  };

  const isProtectedRoute = (path: string): boolean => {
    return PROTECTED_ROUTE_PREFIXES.some(prefix => 
      path.startsWith(prefix)
    );
  };

  // 🔧 KEY INSIGHT: Middleware-coordinated authentication initialization
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // 🟢 PUBLIC ROUTES: Skip auth check (same as before)
        if (isPublicRoute(pathname)) {
          console.log('🟢 AuthProvider: Public route, no auth needed:', pathname);
          setUser(null);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }
        
      // 🛡️ PROTECTED ROUTES: Trust middleware validation with better error handling
      if (isProtectedRoute(pathname)) {
        console.log('🛡️ AuthProvider: Protected route detected, trusting middleware auth:', pathname);
        
        try {
          // Primary attempt: Get user data from the main endpoint
          const userData = await authService.getCurrentUser();
          setUser(userData);
          console.log('✅ AuthProvider: User data retrieved successfully:', {
            id: userData.id,
            email: userData.email,
            role: userData.role
          });
        } catch (error) {
          console.log('⚠️ AuthProvider: Primary user data fetch failed, investigating...', error);
          
          // Check if this is a temporary network issue vs authentication issue
          if (error instanceof Error) {
            // If it's a 401, the token might be invalid - let middleware handle it
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
              console.log('🔓 AuthProvider: Authentication appears invalid, letting middleware redirect');
              // Don't set any user state - let the middleware handle the redirect
              setIsLoading(false);
              setIsInitialized(true);
              return;
            }
            
            // For other errors (network, server errors), we'll trust the middleware
            // and set a minimal user object to prevent infinite redirects
            console.log('🔄 AuthProvider: Non-auth error, trusting middleware validation');
          }
          
          // Create a minimal user object based on the route pattern
          // Since middleware validated them, we know they're authenticated
          const roleFromPath = pathname.split('/')[1]; // Extract role from /patient, /provider, etc.
          const validRoles = ['patient', 'provider', 'admin', 'pharmco', 'caregiver', 'researcher', 'compliance'];
          const detectedRole = validRoles.includes(roleFromPath) ? roleFromPath : 'patient';
          
          setUser({
            id: 0, // Temporary ID
            email: 'middleware-validated-user',
            role: detectedRole,
            is_active: true,
            is_approved: true,
            email_verified: true,
            first_name: '',
            last_name: '',
            date_joined: new Date().toISOString()
          } as User);
          
          console.log(`🛡️ AuthProvider: Set fallback user with role: ${detectedRole}`);
        }
        
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }
        
        // 🔍 OTHER ROUTES: Check authentication normally
        console.log('🔍 AuthProvider: Non-categorized route, checking auth:', pathname);
        
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          console.log('✅ AuthProvider: User authenticated on misc route:', {
            id: userData.id,
            email: userData.email,
            role: userData.role
          });
        } catch (error: any) {
          console.log('❌ AuthProvider: User not authenticated on misc route:', error.message);
          setUser(null);
        }
        
      } catch (error) {
        console.error('❌ AuthProvider: Initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        console.log('🏁 AuthProvider: Initialization complete for:', pathname);
      }
    };

    initializeAuth();
  }, [pathname]);
  
  // 🔒 Activity tracking (only on protected routes where we have a real user)
  useEffect(() => {
    // Skip activity tracking on public routes or when no user
    if (!user || isPublicRoute(pathname) || user.email === 'middleware-validated-user') return;
    
    const updateActivity = () => {
      setLastActivity(Date.now());
    };
    
    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      const inactiveTimeoutMs = config.sessionTimeoutMinutes * 60 * 1000;
      
      if (inactiveTime > inactiveTimeoutMs) {
        console.log('⏰ Session timeout due to inactivity');
        logout();
        if (typeof window !== 'undefined') {
          alert('Your session has expired due to inactivity. Please log in again.');
        }
      }
    };
    
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity, true));
    
    const inactivityTimer = setInterval(checkInactivity, 60 * 1000);
    
    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity, true));
      clearInterval(inactivityTimer);
    };
  }, [user, lastActivity, pathname]);

  // Helper function to refresh user data
  const refreshUserData = async (): Promise<void> => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  /**
   * 🔒 SECURE: Core Authentication Methods
   */
  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      // Step 1: Authenticate with backend
      const response = await authService.login(credentials);
      
      // Step 2: Set HttpOnly cookie
      const cookieResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: response.token,
          user: response.user
        }),
        credentials: 'include'
      });
      
      if (!cookieResponse.ok) {
        throw new Error('Failed to set authentication cookies');
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setUser(response.user);
      setLastActivity(Date.now());
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    setIsLoading(true);
    try {
      return await authService.register(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // 🔒 SECURE: Clear HttpOnly cookies via server API
      const logoutResponse = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!logoutResponse.ok) {
        console.warn('Logout API call failed, but continuing with client cleanup');
      }
      
      // Clear client state
      setUser(null);
      
      console.log('✅ Logout completed successfully');
      
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Even if logout fails, clear cookies and user state for security
      try {
        await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include'
        });

      // Clear local state
      setUser(null);
      setLastActivity(Date.now());
      console.log('✅ Logout successful');

      } catch (error) {
        console.error('Logout error:', error);
        // Even if API call fails, clear local state
      }
      
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Two-Factor Authentication Methods
   */
  const verifyTwoFactor = async (userIdOrToken: string, code: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const userId = parseInt(userIdOrToken, 10);
      if (isNaN(userId)) {
        throw new Error('Invalid user ID for two-factor verification');
      }
      
      const response = await authService.verifyTwoFactor(userId, code);
      
      // 🔒 SECURE: Set cookies after 2FA verification
      const cookieResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: response.token,
          user: response.user
        }),
        credentials: 'include'
      });
      
      if (cookieResponse.ok) {
        setUser(response.user);
        setLastActivity(Date.now());
      } else {
        throw new Error('Failed to set authentication cookies after 2FA');
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const setupTwoFactor = async (): Promise<SetupTwoFactorResponse> => {
    setIsLoading(true);
    try {
      return await authService.setupTwoFactor();
    } finally {
      setIsLoading(false);
    }
  };

  const confirmTwoFactor = async (code: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.confirmTwoFactor(code);
      
      if (response.success) {
        await refreshUserData();
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async (password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.disableTwoFactor(password);
      
      if (response.success) {
        await refreshUserData();
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Password Management Methods
   */
  const requestPasswordReset = async (email: string): Promise<{ detail: string }> => {
    setIsLoading(true);
    try {
      return await authService.forgotPassword(email);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest): Promise<{ detail: string }> => {
    setIsLoading(true);
    try {
      return await authService.resetPassword(data);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Email Verification Methods
   */
  const requestEmailVerification = async (): Promise<{ detail: string }> => {
    setIsLoading(true);
    try {
      return await authService.requestEmailVerification();
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (data: VerifyEmailRequest): Promise<{ detail: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.verifyEmail(data);
      
      // Refresh user data to get updated email verification status
      await refreshUserData();
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔒 All other methods remain the same but without cookie manipulation
  // Just API calls that rely on HttpOnly cookies being sent automatically

  const initiateIdentityVerification = async (method: IdentityVerificationMethod): Promise<{ detail: string; method: string }> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User not found');
      }
      
      let profileId: number;
      if (user.role === 'patient' && user.patient_profile) {
        profileId = user.patient_profile.id;
      } else {
        profileId = user.id;
      }
      
      const response = await authService.initiateIdentityVerification(profileId, method);
      await refreshUserData();
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const completeIdentityVerification = async (method: IdentityVerificationMethod): Promise<{ detail: string; verified_at: string }> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User not found');
      }
      
      let profileId: number;
      if (user.role === 'patient' && user.patient_profile) {
        profileId = user.patient_profile.id;
      } else {
        profileId = user.id;
      }
      
      const response = await authService.completeIdentityVerification(profileId, method);
      await refreshUserData();
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  // Profile completion methods (abbreviated for space)
  const completePatientProfile = async (profileData: Partial<PatientProfile>): Promise<PatientProfile> => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not found');
      
      const profileId = user.patient_profile?.id || user.id;
      const response = await authService.completePatientProfile(profileId, profileData);
      await refreshUserData();
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePatientConsent = async (consents: {
    medication_adherence_monitoring_consent: boolean;
    vitals_monitoring_consent: boolean;
    research_participation_consent: boolean;
  }): Promise<PatientProfile> => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not found');
      
      const profileId = user.patient_profile?.id || user.id;
      const response = await authService.updatePatientConsent(profileId, consents);
      await refreshUserData();
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const completeProviderProfile = async (profileData: Partial<ProviderProfile>): Promise<ProviderProfile> => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not found');
      const profileId = user.provider_profile?.id || user.id;
      const response = await authService.completeProviderProfile(profileId, profileData);
      await refreshUserData();
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const completePharmcoProfile = async (profileData: Partial<PharmcoProfile>): Promise<PharmcoProfile> => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not found');
      const profileId = user.pharmco_profile?.id || user.id;
      const response = await authService.completePharmcoProfile(profileId, profileData);
      await refreshUserData();
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const completeCaregiverProfile = async (profileData: Partial<CaregiverProfile>): Promise<CaregiverProfile> => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not found');
      const profileId = user.caregiver_profile?.id || user.id;
      const response = await authService.completeCaregiverProfile(profileId, profileData);
      await refreshUserData();
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const completeResearcherProfile = async (profileData: Partial<ResearcherProfile>): Promise<ResearcherProfile> => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not found');
      const profileId = user.researcher_profile?.id || user.id;
      const response = await authService.completeResearcherProfile(profileId, profileData);
      await refreshUserData();
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const completeComplianceProfile = async (profileData: Partial<ComplianceProfile>): Promise<ComplianceProfile> => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not found');
      const profileId = user.compliance_profile?.id || user.id;
      const response = await authService.completeComplianceProfile(profileId, profileData);
      await refreshUserData();
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  // All other methods follow the same pattern - API calls without cookie manipulation
  // (abbreviated for space, but they all use the same secure pattern)

  const getCaregiverRequests = async (params?: { 
    status?: CaregiverRequestStatus; 
    ordering?: string 
  }): Promise<CaregiverRequest[]> => {
    return await authService.getCaregiverRequests(params);
  };

  const approveCaregiverRequest = async (requestId: number): Promise<{ detail: string }> => {
    const response = await authService.approveCaregiverRequest(requestId);
    await refreshUserData();
    return response;
  };

  const denyCaregiverRequest = async (requestId: number, reason?: string): Promise<{ detail: string }> => {
    const response = await authService.denyCaregiverRequest(requestId, reason);
    await refreshUserData();
    return response;
  };

  const getCaregiverRequestDetails = async (requestId: number): Promise<CaregiverRequest> => {
    return await authService.getCaregiverRequestDetails(requestId);
  };

  const getHipaaDocuments = async (filters?: { 
    document_type?: string; 
    active?: boolean 
  }): Promise<HipaaDocument[]> => {
    return await authService.getHipaaDocuments(filters);
  };

  const getHipaaDocumentDetails = async (documentId: number): Promise<HipaaDocument> => {
    return await authService.getHipaaDocumentDetails(documentId);
  };

  const getLatestHipaaDocuments = async (): Promise<HipaaDocument[]> => {
    return await authService.getLatestHipaaDocuments();
  };

  const signHipaaDocument = async (documentId: number): Promise<{ 
    detail: string; 
    consent_id: number; 
    signed_at: string 
  }> => {
    const response = await authService.signHipaaDocument(documentId);
    await refreshUserData();
    return response;
  };

  const getConsentRecords = async (filters?: { 
    consent_type?: string; 
    consented?: boolean 
  }): Promise<ConsentRecord[]> => {
    return await authService.getConsentRecords(filters);
  };

  const getConsentAuditTrail = async (days?: number): Promise<ConsentAuditTrailResponse> => {
    return await authService.getConsentAuditTrail(days);
  };

  const initiateEmergencyAccess = async (data: {
    patient_identifier: string;
    reason: EmergencyAccessReason;
    detailed_reason: string;
  }): Promise<{ detail: string; access_id: number; expires_in: string }> => {
    return await authService.initiateEmergencyAccess(data);
  };

  const endEmergencyAccess = async (accessId: number, phiSummary: string): Promise<{ detail: string }> => {
    return await authService.endEmergencyAccess(accessId, phiSummary);
  };

  const getEmergencyAccessRecords = async (filters?: EmergencyAccessFilters): Promise<EmergencyAccessRecord[]> => {
    return await authService.getEmergencyAccessRecords(filters);
  };

  const reviewEmergencyAccess = async (
    accessId: number, 
    reviewData: { notes: string; justified: boolean }
  ): Promise<{ detail: string }> => {
    return await authService.reviewEmergencyAccess(accessId, reviewData);
  };

  const getEmergencyAccessSummary = async (): Promise<EmergencyAccessSummary> => {
    return await authService.getEmergencyAccessSummary();
  };

  const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
    const stats = await authService.getDashboardStats();
    return stats as unknown as DashboardStatsResponse;
  };

  const updateConsent = async (consentType: string, consented: boolean): Promise<ConsentUpdateResponse> => {
    const response = await authService.updateConsent(consentType, consented);
    await refreshUserData();
    return response;
  };
    // Computed properties for easier access
    const isAuthenticated = !!user && user.email !== 'middleware-validated-user';
    const isMiddlewareValidated = user?.email === 'middleware-validated-user';

  // Complete context value with all methods
  const contextValue: EnhancedAuthContextType = {
    // Core state
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    //lastActivity,
    
    // Core authentication methods
    login,
    register: async () => { throw new Error('Register method not implemented') },
    logout,
    verifyTwoFactor,
    setupTwoFactor,
    confirmTwoFactor,
    disableTwoFactor,
    
    // Password management
    requestPasswordReset,
    resetPassword,
    
    // Email verification
    requestEmailVerification,
    verifyEmail,
    
    // Identity verification
    initiateIdentityVerification,
    completeIdentityVerification,
    
    // Profile completion methods
    completePatientProfile,
    updatePatientConsent,
    completeProviderProfile,
    completePharmcoProfile,
    completeCaregiverProfile,
    completeResearcherProfile,
    completeComplianceProfile,
    
    // Caregiver request management
    getCaregiverRequests,
    approveCaregiverRequest,
    denyCaregiverRequest,
    getCaregiverRequestDetails,
    
    // HIPAA document management
    getHipaaDocuments,
    getHipaaDocumentDetails,
    getLatestHipaaDocuments,
    signHipaaDocument,
    
    // Consent record management
    getConsentRecords,
    getConsentAuditTrail,
    
    // Emergency access
    initiateEmergencyAccess,
    endEmergencyAccess,
    getEmergencyAccessRecords,
    reviewEmergencyAccess,
    getEmergencyAccessSummary,
    
    // Admin dashboard
    getDashboardStats,
    
    // Legacy methods
    updateConsent,
    //refreshUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;