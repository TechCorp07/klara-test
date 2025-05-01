// components/dashboard/DataPanel.jsx
// Reusable data panel component for dashboards

import React from 'react';
import Link from 'next/link';

/**
 * DataPanel component for displaying data lists with headers and "View all" links
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Panel title
 * @param {Array} props.data - Array of data items to display
 * @param {Function} props.renderItem - Function to render each item
 * @param {string} props.emptyMessage - Message to display when data is empty
 * @param {string} props.viewAllLink - URL for "View all" link
 * @param {string} props.viewAllText - Text for "View all" link
 * @param {number} props.maxItems - Maximum number of items to display
 */
const DataPanel = ({ 
  title, 
  data = [], 
  renderItem, 
  emptyMessage = "No data available.", 
  viewAllLink, 
  viewAllText = "View all", 
  maxItems = 5 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-blue-600 hover:text-blue-800 text-sm">
            {viewAllText}
          </Link>
        )}
      </div>
      
      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.slice(0, maxItems).map((item, index) => (
            <div key={item.id || index} className="border-b pb-3">
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">{emptyMessage}</p>
      )}
    </div>
  );
};

export default DataPanel;
