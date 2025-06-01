import Image from 'next/image';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xlg' | '_8xlg' |'_10xlg';
  variant?: 'default' | 'white' | 'colored';
  onClick?: () => void;
}

export function AppLogo({ className = '', size = 'lg' }: AppLogoProps) {
  const dimensions = {
    sm: { width: 32, height: 32, className: 'h-8' },
    md: { width: 48, height: 48, className: 'h-12' },
    lg: { width: 64, height: 64, className: 'h-16' },
    xlg: { width: 80, height: 80, className: 'h-20' },
    _8xlg: { width: 192, height: 192, className: 'h-48' },
    _10xlg: { width: 224, height: 224, className: 'h-56' }
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
