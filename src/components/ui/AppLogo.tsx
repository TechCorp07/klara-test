// src/components/ui/AppLogo.tsx
import Image from 'next/image';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white' | 'colored';  // For different color versions
  onClick?: () => void;  // For clickable logos
}

export function AppLogo({ className = '', size = 'md' }: AppLogoProps) {
  const dimensions = {
    sm: { width: 32, height: 32, className: 'h-8' },
    md: { width: 48, height: 48, className: 'h-12' },
    lg: { width: 64, height: 64, className: 'h-16' }
  };
  
  return (
    <Image
      src="/images/logo.svg"
      alt="Klararety Healthcare Platform"
      width={dimensions[size].width}
      height={dimensions[size].height}
      className={`${dimensions[size].className} w-auto ${className}`}
    />
  );
}