// src/lib/auth/index.ts - Single export point
export { AuthProvider } from './auth-provider';
export { useAuth } from './use-auth';
export { AuthGuard } from './guards/auth-guard';

// Export types from existing files
export type { 
  User, 
  UserRole, 
  LoginCredentials, 
  LoginResponse, 
  AuthContextType
} from '@/types/auth.types';