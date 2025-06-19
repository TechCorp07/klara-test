// src/hooks/useAuth.ts
export const useAuth = () => {
  // Your auth logic here
  return {
    user: null, // or your user object
    isLoading: false,
    isAuthenticated: false
  };
};