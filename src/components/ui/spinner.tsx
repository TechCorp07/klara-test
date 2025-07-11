// src/components/ui/spinner.tsx
import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerColor = 'primary' | 'secondary' | 'white';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  label?: string;
}

/**
 * Spinner component for loading states.
 * 
 * This component renders a visually appealing loading spinner with customizable size and color.
 * It also includes proper accessibility attributes for screen readers.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  label = 'Loading...',
}) => {
  // Size styles
  const sizeStyles: Record<SpinnerSize, string> = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  // Color styles
  const colorStyles: Record<SpinnerColor, string> = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
  };

  return (
    <div className={`flex items-center justify-center ${className}`} role="status">
      <svg
        className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
};

export default Spinner;