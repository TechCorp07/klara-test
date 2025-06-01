// src/lib/utils/cookies.ts

/**
 * Utility functions for handling cookies on the client side
 * Used for audit logging and security monitoring
 */

/**
 * Get a cookie value by name
 * @param name - The name of the cookie to retrieve
 * @returns The cookie value or null if not found
 */
export const getCookieValue = (name: string): string | null => {
    if (typeof window === 'undefined') {
      return null; // Server-side, no cookies available
    }
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue || null;
    }
    
    return null;
  };
  
  /**
   * Set a cookie with security attributes for HIPAA compliance
   * @param name - Cookie name
   * @param value - Cookie value
   * @param days - Expiration in days (optional)
   * @param secure - Whether to set Secure flag (defaults to production mode)
   */
  export const setCookieValue = (
    name: string, 
    value: string, 
    days?: number,
    secure?: boolean
  ): void => {
    if (typeof window === 'undefined') return;
    
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    
    const secureFlag = secure !== false && process.env.NODE_ENV === 'production' ? '; Secure' : '';
    const sameSite = '; SameSite=Strict';
    const httpOnly = ''; // Client-side accessible cookies can't be HttpOnly
    
    document.cookie = `${name}=${value}${expires}; path=/${secureFlag}${sameSite}${httpOnly}`;
  };
  
  /**
   * Delete a cookie by setting it to expire immediately
   * @param name - The name of the cookie to delete
   */
  export const deleteCookie = (name: string): void => {
    if (typeof window === 'undefined') return;
    
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };
  
  /**
   * Get all cookies as an object
   * @returns Object with cookie names as keys and values as values
   */
  export const getAllCookies = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    
    const cookies: Record<string, string> = {};
    
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    
    return cookies;
  };
  
  /**
   * Check if a specific cookie exists
   * @param name - The name of the cookie to check
   * @returns True if cookie exists, false otherwise
   */
  export const cookieExists = (name: string): boolean => {
    return getCookieValue(name) !== null;
  };
  