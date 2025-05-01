"use client";

import React from 'react';
import Link from 'next/link';

/**
 * Dashboard Layout component
 * @param {Object} props - Component props
 * @param {string} props.title - Dashboard title
 * @param {React.ReactNode} props.children - Dashboard content
 * @returns {React.ReactElement} Dashboard layout component
 */
export const DashboardLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
        {children}
      </div>
    </div>
  );
};

/**
 * Stats Card component
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Card value
 * @param {string} props.linkText - Link text
 * @param {string} props.linkHref - Link URL
 * @param {string} props.valueColor - Value text color class
 * @returns {React.ReactElement} Stats card component
 */
export const StatsCard = ({ title, value, linkText, linkHref, valueColor = 'text-blue-600' }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`text-3xl font-semibold ${valueColor} mt-2`}>{value}</p>
      {linkText && linkHref && (
        <div className="mt-4">
          <Link href={linkHref} className="text-sm text-blue-600 hover:text-blue-800">
            {linkText} →
          </Link>
        </div>
      )}
    </div>
  );
};

/**
 * Data Panel component
 * @param {Object} props - Component props
 * @param {string} props.title - Panel title
 * @param {Array} props.data - Data array
 * @param {Function} props.renderItem - Function to render each item
 * @param {string} props.emptyMessage - Message to display when data is empty
 * @param {string} props.viewAllLink - Link to view all items
 * @param {number} props.maxItems - Maximum number of items to display
 * @returns {React.ReactElement} Data panel component
 */
export const DataPanel = ({ title, data, renderItem, emptyMessage, viewAllLink, maxItems = 5 }) => {
  const displayData = data?.slice(0, maxItems) || [];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-blue-600 hover:text-blue-800 text-sm">
            View all
          </Link>
        )}
      </div>
      
      {displayData.length > 0 ? (
        <div className="space-y-4">
          {displayData.map((item, index) => (
            <div key={item.id || index} className="border-b pb-3 last:border-b-0">
              {renderItem(item)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">{emptyMessage}</p>
      )}
    </div>
  );
};

/**
 * Quick Action Button component
 * @param {Object} props - Component props
 * @param {string} props.href - Button link URL
 * @param {string} props.label - Button label
 * @param {React.ReactNode} props.icon - Button icon
 * @param {string} props.bgColor - Background color class
 * @param {string} props.textColor - Text color class
 * @param {string} props.hoverColor - Hover background color class
 * @returns {React.ReactElement} Quick action button component
 */
export const QuickActionButton = ({ href, label, icon, bgColor, textColor, hoverColor }) => {
  return (
    <Link 
      href={href}
      className={`flex flex-col items-center justify-center p-4 rounded-lg ${bgColor} ${textColor} ${hoverColor} transition-colors duration-200`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};
