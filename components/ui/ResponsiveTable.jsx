import React from 'react';
import { useMobileOptimization } from '../../contexts/MobileOptimizationContext';

/**
 * ResponsiveTable Component
 * A mobile-optimized table component that adapts to different screen sizes
 */
const ResponsiveTable = ({ 
  headers, 
  data, 
  keyField = 'id',
  onRowClick = null,
  emptyMessage = 'No data available',
  loading = false,
  loadingRows = 3
}) => {
  const { isMobile, isTablet } = useMobileOptimization();

  // Generate skeleton loading rows
  const renderSkeletonRows = () => {
    return Array(loadingRows).fill(0).map((_, rowIndex) => (
      <tr key={`skeleton-${rowIndex}`}>
        {headers.map((_, colIndex) => (
          <td key={`skeleton-${rowIndex}-${colIndex}`}>
            <div className="skeleton-loader" style={{ width: `${Math.floor(Math.random() * 50) + 50}%` }}></div>
          </td>
        ))}
      </tr>
    ));
  };

  // Card view for mobile devices
  if (isMobile) {
    return (
      <div className="table-card-view">
        <div className="table-header">
          {headers.map((header, index) => (
            <div key={index} className="header-cell">{header.label || header}</div>
          ))}
        </div>
        
        {loading ? (
          Array(loadingRows).fill(0).map((_, rowIndex) => (
            <div key={`skeleton-card-${rowIndex}`} className="table-row">
              {headers.map((header, colIndex) => (
                <div key={`skeleton-card-${rowIndex}-${colIndex}`} className="table-cell">
                  <div className="cell-label">{header.label || header}</div>
                  <div className="skeleton-loader" style={{ width: `${Math.floor(Math.random() * 50) + 50}%` }}></div>
                </div>
              ))}
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="alert alert-info">{emptyMessage}</div>
        ) : (
          data.map((row, rowIndex) => (
            <div 
              key={row[keyField] || rowIndex} 
              className="table-row"
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={onRowClick ? { cursor: 'pointer' } : {}}
            >
              {headers.map((header, colIndex) => {
                const fieldName = header.field || header;
                const value = row[fieldName];
                const formattedValue = header.format ? header.format(value, row) : value;
                
                return (
                  <div key={`${rowIndex}-${colIndex}`} className="table-cell">
                    <div className="cell-label">{header.label || header}</div>
                    <div className="cell-value">
                      {header.render ? header.render(value, row) : formattedValue}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    );
  }

  // Responsive table for tablet and desktop
  return (
    <div className={isTablet ? "table-responsive-mobile" : ""}>
      <table className="table table-hover">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header.label || header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            renderSkeletonRows()
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={row[keyField] || rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: 'pointer' } : {}}
              >
                {headers.map((header, colIndex) => {
                  const fieldName = header.field || header;
                  const value = row[fieldName];
                  const formattedValue = header.format ? header.format(value, row) : value;
                  
                  return (
                    <td key={`${rowIndex}-${colIndex}`}>
                      {header.render ? header.render(value, row) : formattedValue}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResponsiveTable;
