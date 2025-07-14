// src/lib/auth/index.ts
export { AuthProvider } from '@/lib/auth/auth-provider';
export { default as useAuthHook } from '@/lib/auth/use-auth';

// Re-export types from auth types
export type { 
  User, 
  UserRole, 
  LoginCredentials, 
  LoginResponse, 
  RegisterRequest,
  RegisterResponse
} from '@/types/auth.types';