"use client";

import Link from 'next/link';

/**
 * Reusable stats card component for dashboards
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.link - Link URL for "View details" 
 * @param {string} props.linkText - Text for the link (defaults to "View details →")
 * @param {string} props.bgColorClass - Tailwind background color class
 * @param {string} props.textColorClass - Tailwind text color class
 * @param {React.ReactNode} props.icon - Optional icon component
 * @param {string} props.trend - Optional trend direction ('up', 'down', or null)
 * @param {string} props.trendValue - Optional trend value text
 * @param {string} props.trendType - Optional trend type ('positive' or 'negative')
 */
const StatsCard = ({ 
  title, 
  value, 
  link, 
  linkText = "View details →",
  bgColorClass = "bg-white",
  textColorClass = "text-blue-600",
  icon = null,
  trend = null,
  trendValue = null,
  trendType = 'positive'
}) => {
  // Generate trend display
  const renderTrend = () => {
    if (!trend || !trendValue) return null;
    
    const isPositive = trendType === 'positive';
    const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`mt-1 flex items-center ${trendColor}`}>
        <span className="text-xs font-medium">
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </span>
      </div>
    );
  };

  return (
    <div className={`rounded-lg shadow-md p-6 ${bgColorClass}`}>
      <div className="flex items-center justify-between">
        {icon && <div className="flex-shrink-0 mr-3">{icon}</div>}
        <div className="flex-grow">
          <h2 className="text-lg font-medium text-gray-600 mb-2">{title}</h2>
          <div className="flex items-end">
            <p className={`text-3xl font-bold ${textColorClass}`}>
              {value}
            </p>
            {renderTrend()}
          </div>
        </div>
      </div>
      
      {link && (
        <Link href={link} className="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm">
          {linkText}
        </Link>
      )}
    </div>
  );
};

export default StatsCard;