'use client';

import React from 'react';

/**
 * Unified loading component supporting multiple variants
 * @param {Object} props
 * @param {string} props.variant - Loading variant ('spinner', 'skeleton', 'dots', 'pulse')
 * @param {string} props.size - Size ('small', 'medium', 'large')
 * @param {string} props.message - Optional loading message
 * @param {string} props.skeletonType - Type of skeleton ('text', 'card', 'table', 'profile', 'chart', 'list', 'detail')
 * @param {number} props.count - Number of skeleton items
 * @param {number} props.lines - Number of text lines in skeleton
 * @param {string} props.className - Additional CSS classes
 */
const LoadingComponent = ({
  variant = 'spinner',
  size = 'medium',
  message = null,
  skeletonType = 'text',
  count = 1,
  lines = 3,
  className = '',
  fullHeight = false
}) => {
  // Determine size classes for spinner
  const spinnerSizes = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3'
  };
  
  const spinnerSize = spinnerSizes[size] || spinnerSizes.medium;
  
  // Container class based on fullHeight
  const containerClasses = fullHeight 
    ? 'flex flex-col justify-center items-center min-h-[16rem]' 
    : 'flex flex-col justify-center items-center py-8';
  
  // Create an array of specified length
  const createRange = (length) => {
    return Array.from({ length }, (_, i) => i);
  };
  
  // Random width for realistic text lines
  const getRandomWidth = () => {
    const widths = ['w-1/4', 'w-1/3', 'w-1/2', 'w-2/3', 'w-3/4', 'w-full'];
    return widths[Math.floor(Math.random() * widths.length)];
  };
  
  // Render based on variant
  switch (variant) {
    case 'spinner':
      return (
        <div className={`${containerClasses} ${className}`}>
          <div className={`animate-spin rounded-full ${spinnerSize} border-t-blue-500 border-blue-500 border-opacity-25`}></div>
          {message && <p className="mt-4 text-sm text-gray-500">{message}</p>}
        </div>
      );
      
    case 'dots':
      return (
        <div className={`${containerClasses} ${className}`}>
          <div className="flex space-x-2">
            <div className={`bg-blue-500 rounded-full ${size === 'small' ? 'h-2 w-2' : size === 'large' ? 'h-4 w-4' : 'h-3 w-3'} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`bg-blue-500 rounded-full ${size === 'small' ? 'h-2 w-2' : size === 'large' ? 'h-4 w-4' : 'h-3 w-3'} animate-bounce`} style={{ animationDelay: '200ms' }}></div>
            <div className={`bg-blue-500 rounded-full ${size === 'small' ? 'h-2 w-2' : size === 'large' ? 'h-4 w-4' : 'h-3 w-3'} animate-bounce`} style={{ animationDelay: '400ms' }}></div>
          </div>
          {message && <p className="mt-4 text-sm text-gray-500">{message}</p>}
        </div>
      );
      
    case 'pulse':
      return (
        <div className={`${containerClasses} ${className}`}>
          <div className={`animate-pulse bg-blue-100 rounded-md ${size === 'small' ? 'h-8 w-24' : size === 'large' ? 'h-16 w-48' : 'h-12 w-32'}`}></div>
          {message && <p className="mt-4 text-sm text-gray-500">{message}</p>}
        </div>
      );
    
    case 'skeleton':
      return (
        <div className={className}>
          {renderSkeleton(skeletonType, count, lines)}
          {message && <p className="mt-4 text-sm text-gray-500 text-center">{message}</p>}
        </div>
      );
      
    default:
      return null;
  }
  
  // Helper function to render skeleton based on type
  function renderSkeleton(type, count, lines) {
    switch (type) {
      case 'text':
        return (
          <div className="space-y-2 animate-pulse">
            {createRange(lines).map((i) => (
              <div 
                key={i} 
                className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? getRandomWidth() : 'w-full'}`}
              ></div>
            ))}
          </div>
        );
        
      case 'card':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {createRange(count).map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'table':
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg animate-pulse">
            <div className="px-4 py-5 border-b border-gray-200">
              <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                {createRange(lines).map((i) => (
                  <div key={i} className={`px-4 py-5 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        );
        
      case 'profile':
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg animate-pulse">
            <div className="flex items-center p-4 border-b border-gray-200">
              <div className="mr-4 h-16 w-16 rounded-full bg-gray-200"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {createRange(4).map((i) => (
                  <div key={i} className="grid grid-cols-3 gap-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'chart':
        return (
          <div className="bg-white shadow rounded-lg p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="mt-4 flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        );
        
      case 'list':
        return (
          <ul className="divide-y divide-gray-200 bg-white shadow overflow-hidden sm:rounded-lg animate-pulse">
            {createRange(count).map((i) => (
              <li key={i} className="px-4 py-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
              </li>
            ))}
          </ul>
        );
        
      case 'detail':
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg animate-pulse">
            <div className="px-4 py-5 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="px-4 py-5">
              <div className="space-y-6">
                {createRange(5).map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-2 animate-pulse">
            {createRange(lines).map((i) => (
              <div 
                key={i} 
                className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? getRandomWidth() : 'w-full'}`}
              ></div>
            ))}
          </div>
        );
    }
  }
};

export default LoadingComponent;