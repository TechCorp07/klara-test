// src/components/ui/AppLogo.tsx
import Image from 'next/image';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xlg' | '_8xlg' | '_10xlg';
  variant?: 'default' | 'white' | 'colored';
  onClick?: () => void;
}

const AppLogo: React.FC<AppLogoProps> = ({ 
  className = '', 
  size = 'lg',
  variant = 'default',
  onClick 
}) => {
  const dimensions = {
    sm: { width: 32, height: 32, className: 'h-8' },
    md: { width: 48, height: 48, className: 'h-12' },
    lg: { width: 64, height: 64, className: 'h-16' },
    xlg: { width: 80, height: 80, className: 'h-20' },
    _8xlg: { width: 192, height: 192, className: 'h-48' },
    _10xlg: { width: 224, height: 224, className: 'h-56' }
  };

  const logoSrc = variant === 'white' ? '/images/logo-white.svg' : '/images/logo.svg';

  return (
    <Image
      src={logoSrc}
      alt="Klararety Healthcare Platform"
      width={dimensions[size].width}
      height={dimensions[size].height}
      className={`${dimensions[size].className} w-auto ${className}`}
      onClick={onClick}
      priority={size === 'lg' || size === 'xlg'} // Prioritize loading for larger logos
    />
  );
};

// Named export
export { AppLogo };

// Default export
export default AppLogo;