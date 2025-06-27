// src/lib/auth/use-auth.ts - FIXED TYPE COMPATIBILITY
import { useContext } from 'react';
import { AuthContext, EnhancedAuthContextType } from './auth-provider';

/**
 * Custom hook to access the authentication context
 * 
 * This hook provides access to:
 * - User information
 * - Authentication state
 * - Loading state
 * - Authentication methods (login, register, logout, etc.)
 * - Enhanced methods with proper type safety
 * 
 * @returns EnhancedAuthContextType object containing authentication state and methods
 * @throws Error if used outside of an AuthProvider
 */
export const useAuth = (): EnhancedAuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
