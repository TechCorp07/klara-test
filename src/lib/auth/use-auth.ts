// src/lib/auth/use-auth.ts
import { useContext } from 'react';
import { AuthContext } from './auth-provider';

/**
 * Custom hook to access the authentication context
 * 
 * This hook provides access to:
 * - User information
 * - Authentication state
 * - Loading state
 * - isAuthReady - indicates when cookies are verified and ready for API calls
 * - Authentication methods (login, register, logout, etc.)
 * 
 * @returns AuthContextType object containing authentication state and methods
 * @throws Error if used outside of an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;