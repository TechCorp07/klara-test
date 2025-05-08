// src/lib/auth/use-auth.ts
import { useContext } from 'react';
import { AuthContext } from './auth-provider';
import { AuthContextType } from '@/types/auth.types';

/**
 * Custom hook to access the authentication context
 * 
 * This hook provides access to:
 * - User information
 * - Authentication state
 * - Loading state
 * - Authentication methods (login, register, logout, etc.)
 * 
 * @returns AuthContextType object containing authentication state and methods
 * @throws Error if used outside of an AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;