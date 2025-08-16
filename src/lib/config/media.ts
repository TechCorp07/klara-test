// src/lib/config/media.ts

/**
 * Media configuration that automatically adapts to environment
 */
export const mediaConfig = {
  /**
   * Get the base URL for API calls
   */
  getApiBaseUrl: (): string => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  },

  /**
   * Get the base URL for media files (derived from API URL)
   */
  getMediaBaseUrl: (): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    if (apiUrl.endsWith('/api')) {
      return apiUrl.slice(0, -4);
    }
    
    if (apiUrl.endsWith('/api/')) {
      return apiUrl.slice(0, -5);
    }
    
    return apiUrl.replace('/api', '');
  },

  /**
   * Check if we're in development mode
   */
  isDevelopment: (): boolean => {
    return process.env.NODE_ENV === 'development';
  },

  /**
   * Get full media URL from relative path
   */
  getFullMediaUrl: (relativePath: string | null): string | null => {
    if (!relativePath) return null;
    
    if (relativePath.startsWith('http')) {
      return relativePath;
    }
    
    const mediaBaseUrl = mediaConfig.getMediaBaseUrl();
    
    if (relativePath.startsWith('/media/')) {
      return `${mediaBaseUrl}${relativePath}`;
    }
    
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${mediaBaseUrl}/media${cleanPath}`;
  }
};