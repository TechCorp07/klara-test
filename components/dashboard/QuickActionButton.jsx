// components/dashboard/QuickActionButton.jsx
// Reusable quick action button component for dashboards

import React from 'react';
import Link from 'next/link';

/**
 * QuickActionButton component for dashboard quick actions
 * 
 * @param {Object} props - Component props
 * @param {string} props.href - URL for the action link
 * @param {string} props.label - Button label text
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.bgColor - Background color class (e.g., 'bg-blue-100')
 * @param {string} props.textColor - Text color class (e.g., 'text-blue-800')
 * @param {string} props.hoverColor - Hover background color class (e.g., 'hover:bg-blue-200')
 */
const QuickActionButton = ({ 
  href, 
  label, 
  icon, 
  bgColor = 'bg-blue-100', 
  textColor = 'text-blue-800', 
  hoverColor = 'hover:bg-blue-200' 
}) => {
  return (
    <Link href={href} className={`${bgColor} ${hoverColor} ${textColor} p-4 rounded-lg text-center`}>
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 mb-2">
          {icon}
        </div>
        <span>{label}</span>
      </div>
    </Link>
  );
};

export default QuickActionButton;
