import React from 'react';

/**
 * Loading skeleton component for displaying loading states
 */
const LoadingSkeleton = ({ count = 1, height = '20px', className = '' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className={`animate-pulse bg-gray-200 rounded ${className}`} 
          style={{ height }}
        />
      ))}
    </>
  );
};

export default LoadingSkeleton;
