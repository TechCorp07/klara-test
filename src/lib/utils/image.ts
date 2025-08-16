// src/lib/utils/image.ts
export const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Use Next.js media proxy instead of direct backend URL
  if (imagePath.startsWith('/media/')) {
    return `${imagePath}`; // /media/profile_images/x.png -> /api/media/profile_images/x.png
  }
  
  // Handle other media paths
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `/media/${cleanPath}`;
};