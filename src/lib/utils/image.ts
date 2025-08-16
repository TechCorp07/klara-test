// src/lib/utils/image.ts

/**
 * Get the media base URL by removing /api from the API URL
 * Example: http://localhost:8000/api -> http://localhost:8000
 * Example: https://api.domain.com/api -> https://api.domain.com
 */
const _getMediaBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  // Remove /api suffix to get the base URL for media files
  if (apiUrl.endsWith('/api')) {
    return apiUrl.slice(0, -4); // Remove last 4 characters (/api)
  }
  
  // If it ends with /api/, remove the last 5 characters
  if (apiUrl.endsWith('/api/')) {
    return apiUrl.slice(0, -5);
  }
  
  // Fallback - assume media is served from same origin as API
  return apiUrl.replace('/api', '');
};

export const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  const mediaBaseUrl = _getMediaBaseUrl();
  
  // If path already starts with /media/, use it directly
  if (imagePath.startsWith('/media/')) {
    return `${mediaBaseUrl}${imagePath}`;
  }
  
  // If path doesn't start with /, add /media/ prefix
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${mediaBaseUrl}/media${cleanPath}`;
};

// Export the media base URL for other uses
export const getMediaBaseUrl = _getMediaBaseUrl;