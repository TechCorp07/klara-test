// src/lib/auth/auth-provider.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
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
import { getCookieValue } from '@/lib/utils/cookies';
import { DashboardStatsResponse } from '@/types/admin.types';

// Define the specific union types for better type safety
type IdentityVerificationMethod = "E_SIGNATURE" | "PROVIDER_VERIFICATION" | "DOCUMENT_UPLOAD" | "VIDEO_VERIFICATION";
type CaregiverRequestStatus = "PENDING" | "APPROVED" | "DENIED" | "EXPIRED";
type EmergencyAccessReason = "LIFE_THREATENING" | "URGENT_CARE" | "PATIENT_UNABLE" | "IMMINENT_DANGER" | "OTHER";

// Enhanced AuthContextType with corrected types - using Omit to avoid conflicts
export interface EnhancedAuthContextType extends Omit<AuthContextType, 
  'initiateIdentityVerification' | 
  'completeIdentityVerification' | 
  'getCaregiverRequests' | 
  'initiateEmergencyAccess' |
  'getDashboardStats'
> {
  // Identity verification methods with proper types (overriding base interface)
  initiateIdentityVerification: (method: IdentityVerificationMethod) => Promise<{ detail: string; method: string }>;
  completeIdentityVerification: (method: IdentityVerificationMethod) => Promise<{ detail: string; verified_at: string }>;
  
  // Profile completion methods for all roles
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
  
  // Caregiver request management with proper types (overriding base interface)
  getCaregiverRequests: (params?: { status?: CaregiverRequestStatus; ordering?: string }) => Promise<CaregiverRequest[]>;
  approveCaregiverRequest: (requestId: number) => Promise<{ detail: string }>;
  denyCaregiverRequest: (requestId: number, reason?: string) => Promise<{ detail: string }>;
  getCaregiverRequestDetails: (requestId: number) => Promise<CaregiverRequest>;
  
  // HIPAA document management
  getHipaaDocuments: (filters?: { document_type?: string; active?: boolean }) => Promise<HipaaDocument[]>;
  getHipaaDocumentDetails: (documentId: number) => Promise<HipaaDocument>;
  getLatestHipaaDocuments: () => Promise<HipaaDocument[]>;
  signHipaaDocument: (documentId: number) => Promise<{ detail: string; consent_id: number; signed_at: string }>;
  
  // Consent record management
  getConsentRecords: (filters?: { consent_type?: string; consented?: boolean }) => Promise<ConsentRecord[]>;
  getConsentAuditTrail: (days?: number) => Promise<ConsentAuditTrailResponse>;
  
  // Emergency access with proper types (overriding base interface)
  initiateEmergencyAccess: (data: {
    patient_identifier: string;
    reason: EmergencyAccessReason;
    detailed_reason: string;
  }) => Promise<{ detail: string; access_id: number; expires_in: string }>;
  endEmergencyAccess: (accessId: number, phiSummary: string) => Promise<{ detail: string }>;
  getEmergencyAccessRecords: (filters?: EmergencyAccessFilters) => Promise<EmergencyAccessRecord[]>;
  reviewEmergencyAccess: (accessId: number, reviewData: { notes: string; justified: boolean }) => Promise<{ detail: string }>;
  getEmergencyAccessSummary: () => Promise<EmergencyAccessSummary>;
  
  // Admin dashboard stats
  getDashboardStats: () => Promise<DashboardStatsResponse>;
}

// Create context with null as initial value
export const AuthContext = createContext<EnhancedAuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  
  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authToken = getCookieValue(config.authCookieName);
        
        console.error('🔍 AuthProvider initializing:', {
          hasToken: !!authToken,
          cookieName: config.authCookieName
        });
        
        if (authToken) {
          console.error('✅ Token found, checking user data...');
          const userData = await authService.getCurrentUser();
          setUser(userData);
          console.error('✅ User data loaded:', userData);
        } else {
          console.error('❌ No token found, user remains unauthenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize authentication state:', error);
        setUser(null);
        
        // Clear potentially invalid cookies
        if (typeof window !== 'undefined') {
          document.cookie = `${config.authCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${config.userRoleCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${config.emailVerifiedCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${config.isApprovedCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        console.error('🏁 AuthProvider initialization complete');
      }
    };

    initializeAuth();
  }, []);
  
  // Auto-logout functionality for HIPAA compliance
  useEffect(() => {
    if (!user) return;
    
    const updateActivity = () => {
      setLastActivity(Date.now());
    };
    
    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      const inactiveTimeoutMs = config.sessionTimeoutMinutes * 60 * 1000;
      
      if (inactiveTime > inactiveTimeoutMs) {
        logout();
        if (typeof window !== 'undefined') {
          alert('Your session has expired due to inactivity. Please log in again.');
          window.location.href = '/login';
        }
      }
    };
    
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity));
    
    const intervalId = setInterval(checkInactivity, 60 * 1000);
    
    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(intervalId);
    };
  }, [user, lastActivity]);

  // Helper function to refresh user data
  const refreshUserData = async (): Promise<void> => {
    if (user) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  /**
   * Core Authentication Methods
   */
  const login = async (username: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ username, password });
      
      if (!response.requires_2fa) {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response),
          credentials: 'include'
        });
        
        setUser(response.user);
        setLastActivity(Date.now());
      }
      
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
      await authService.logout();
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
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
      
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
        credentials: 'include'
      });
      
      setUser(response.user);
      setLastActivity(Date.now());
      
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
      
      if (user) {
        await refreshUserData();
        
        if (user.email_verified) {
          document.cookie = `${config.emailVerifiedCookieName}=true; path=/; max-age=604800; SameSite=Strict${config.secureCookies ? '; Secure' : ''}`;
        }
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Identity Verification Methods (for patients) - FIXED TYPES
   */
  const initiateIdentityVerification = async (method: IdentityVerificationMethod): Promise<{ detail: string; method: string }> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get patient profile ID from user data
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

  /**
   * Profile Completion Methods
   */
  const completePatientProfile = async (profileData: Partial<PatientProfile>): Promise<PatientProfile> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User not found');
      }
      
      let profileId: number;
      if (user.patient_profile) {
        profileId = user.patient_profile.id;
      } else {
        profileId = user.id;
      }
      
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
      if (!user) {
        throw new Error('User not found');
      }
      
      let profileId: number;
      if (user.patient_profile) {
        profileId = user.patient_profile.id;
      } else {
        profileId = user.id;
      }
      
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
      if (!user) {
        throw new Error('User not found');
      }
      
      let profileId: number;
      if (user.provider_profile) {
        profileId = user.provider_profile.id;
      } else {
        profileId = user.id;
      }
      
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
      if (!user) {
        throw new Error('User not found');
      }
      
      let profileId: number;
      if (user.pharmco_profile) {
        profileId = user.pharmco_profile.id;
      } else {
        profileId = user.id;
      }
      
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
      if (!user) {
        throw new Error('User not found');
      }
      
      let profileId: number;
      if (user.caregiver_profile) {
        profileId = user.caregiver_profile.id;
      } else {
        profileId = user.id;
      }
      
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
      if (!user) {
        throw new Error('User not found');
      }
      
      let profileId: number;
      if (user.researcher_profile) {
        profileId = user.researcher_profile.id;
      } else {
        profileId = user.id;
      }
      
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
      if (!user) {
        throw new Error('User not found');
      }
      
      let profileId: number;
      if (user.compliance_profile) {
        profileId = user.compliance_profile.id;
      } else {
        profileId = user.id;
      }
      
      const response = await authService.completeComplianceProfile(profileId, profileData);
      await refreshUserData();
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Caregiver Request Management Methods - FIXED TYPES
   */
  const getCaregiverRequests = async (params?: { 
    status?: CaregiverRequestStatus; 
    ordering?: string 
  }): Promise<CaregiverRequest[]> => {
    setIsLoading(true);
    try {
      return await authService.getCaregiverRequests(params);
    } finally {
      setIsLoading(false);
    }
  };

  const approveCaregiverRequest = async (requestId: number): Promise<{ detail: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.approveCaregiverRequest(requestId);
      // Refresh user data to update pending requests
      await refreshUserData();
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const denyCaregiverRequest = async (requestId: number, reason?: string): Promise<{ detail: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.denyCaregiverRequest(requestId, reason);
      await refreshUserData();
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const getCaregiverRequestDetails = async (requestId: number): Promise<CaregiverRequest> => {
    setIsLoading(true);
    try {
      return await authService.getCaregiverRequestDetails(requestId);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * HIPAA Document Management Methods
   */
  const getHipaaDocuments = async (filters?: { 
    document_type?: string; 
    active?: boolean 
  }): Promise<HipaaDocument[]> => {
    setIsLoading(true);
    try {
      return await authService.getHipaaDocuments(filters);
    } finally {
      setIsLoading(false);
    }
  };

  const getHipaaDocumentDetails = async (documentId: number): Promise<HipaaDocument> => {
    setIsLoading(true);
    try {
      return await authService.getHipaaDocumentDetails(documentId);
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestHipaaDocuments = async (): Promise<HipaaDocument[]> => {
    setIsLoading(true);
    try {
      return await authService.getLatestHipaaDocuments();
    } finally {
      setIsLoading(false);
    }
  };

  const signHipaaDocument = async (documentId: number): Promise<{ 
    detail: string; 
    consent_id: number; 
    signed_at: string 
  }> => {
    setIsLoading(true);
    try {
      const response = await authService.signHipaaDocument(documentId);
      await refreshUserData(); // Refresh to update signed documents
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Consent Record Management Methods
   */
  const getConsentRecords = async (filters?: { 
    consent_type?: string; 
    consented?: boolean 
  }): Promise<ConsentRecord[]> => {
    setIsLoading(true);
    try {
      return await authService.getConsentRecords(filters);
    } finally {
      setIsLoading(false);
    }
  };

  const getConsentAuditTrail = async (days?: number): Promise<ConsentAuditTrailResponse> => {
    setIsLoading(true);
    try {
      return await authService.getConsentAuditTrail(days);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Emergency Access Methods (for providers/compliance) - FIXED TYPES
   */
  const initiateEmergencyAccess = async (data: {
    patient_identifier: string;
    reason: EmergencyAccessReason;
    detailed_reason: string;
  }): Promise<{ detail: string; access_id: number; expires_in: string }> => {
    setIsLoading(true);
    try {
      return await authService.initiateEmergencyAccess(data);
    } finally {
      setIsLoading(false);
    }
  };

  const endEmergencyAccess = async (accessId: number, phiSummary: string): Promise<{ detail: string }> => {
    setIsLoading(true);
    try {
      return await authService.endEmergencyAccess(accessId, phiSummary);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmergencyAccessRecords = async (filters?: EmergencyAccessFilters): Promise<EmergencyAccessRecord[]> => {
    setIsLoading(true);
    try {
      return await authService.getEmergencyAccessRecords(filters);
    } finally {
      setIsLoading(false);
    }
  };

  const reviewEmergencyAccess = async (
    accessId: number, 
    reviewData: { notes: string; justified: boolean }
  ): Promise<{ detail: string }> => {
    setIsLoading(true);
    try {
      return await authService.reviewEmergencyAccess(accessId, reviewData);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmergencyAccessSummary = async (): Promise<EmergencyAccessSummary> => {
    setIsLoading(true);
    try {
      return await authService.getEmergencyAccessSummary();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Admin Dashboard Methods
   */
  const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
    setIsLoading(true);
    try {
      const stats = await authService.getDashboardStats();
      return stats as unknown as DashboardStatsResponse;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Legacy Consent Update Method (for backward compatibility)
   */
  const updateConsent = async (consentType: string, consented: boolean): Promise<ConsentUpdateResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.updateConsent(consentType, consented);
      
      if (user) {
        await refreshUserData();
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete context value with all methods
  const contextValue: EnhancedAuthContextType = {
    // Core state
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    
    // Core authentication methods
    login,
    register,
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
    updateConsent
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;