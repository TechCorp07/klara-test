// Create src/components/ui/ProfileAvatar.tsx
import React from 'react';
import { User } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/image';

interface ProfileAvatarProps {
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  imageUrl, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}>
      {imageUrl ? (
        <img
          src={getImageUrl(imageUrl) || '/default-avatar.png'}
          alt="Profile"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default avatar if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : (
        <User className={`${iconSizes[size]} text-gray-400`} />
      )}
    </div>
  );
};