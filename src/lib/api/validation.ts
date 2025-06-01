// src/lib/api/validation.ts

import { LoginResponse, User } from "@/types/auth.types";

export const validateUserResponse = (data: unknown): data is User => {
    if (!data || typeof data !== 'object') return false;
    
    const user = data as Record<string, unknown>;
    
    return (
      typeof user.id === 'number' &&
      typeof user.email === 'string' &&
      typeof user.role === 'string' &&
      typeof user.email_verified === 'boolean' &&
      ['patient', 'provider', 'pharmco', 'caregiver', 'researcher', 'admin', 'superadmin', 'compliance'].includes(user.role as string)
    );
  };
  
  export const validateLoginResponse = (data: unknown): data is LoginResponse => {
    if (!data || typeof data !== 'object') return false;
    
    const response = data as Record<string, unknown>;
    
    return (
      typeof response.token === 'string' &&
      response.token.length > 0 &&
      validateUserResponse(response.user)
    );
  };
