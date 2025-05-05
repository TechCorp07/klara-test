"use client";

import { useState } from 'react';

// Helper function to format measurement values
const formatValue = (value, unit) => {
  if (unit === 'bpm') return `${value} bpm`;
  if (unit === 'kg') return `${value} kg`;
  if (unit === 'lb') return `${value} lb`;
  if (unit === 'steps' || unit === 'count') return value.toLocaleString();
  if (unit === 'calories') return `${value} cal`;
  if (unit === 'minutes' || unit === 'min') return `${value} min`;
  if (unit === 'hours' || unit === 'hr') return `${value} hr`;
  if (unit === '%') return `${value}%`;
  return `${value} ${unit}`;
};

// Helper function to get UI labels for measurement types
const getMeasurementTypeLabel = (type) => {
  const labels = {
    'heart_rate': 'Heart Rate',
    'steps': 'Steps',
    'weight': 'Weight',
    'sleep': 'Sleep Duration',
    'sleep_stages': 'Sleep Stages',
    'distance': 'Distance',
    'calories': 'Calories',
    'active_minutes': 'Active Minutes',
    'blood_pressure': 'Blood Pressure',
    'blood_glucose': 'Blood Glucose',
    'hydration': 'Hydration',
    'oxygen_saturation': 'Oxygen Saturation',
    'ecg': 'ECG'
  };
  
  return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function DeviceData({ 
  device, 
  dateRange, 
  deviceData, 
  isLoading, 
  onDateRangeChange, 
  onRefresh,
  fullWidth = false
}) {
  const [displayMode, setDisplayMode] = useState('table'); // 'table', 'summary', 'chart'
  
  if (!device) {
    return null;
  }
  
  // Group measurements by type for summary view
  const getMeasurementSummary = () => {
    if (!deviceData || !deviceData.results) return [];
    
    // Group by measurement type
    const measurementsByType = {};
    deviceData.results.forEach(m => {
      const type = m.measurement_type || m.metric_type;
      if (!measurementsByType[type]) {
        measurementsByType[type] = [];
      }
      measurementsByType[type].push(m);
    });
    
    // Calculate stats for each type
    return Object.keys(measurementsByType).map(type => {
      const measurements = measurementsByType[type];
      const values = measurements.map(m => m.value);
      
      // Get min, max, avg
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      // Get unit (assuming all same unit for same type)
      const unit = measurements[0].unit;
      
      // Get most recent value
      const mostRecent = measurements.sort((a, b) => {
        return new Date(b.measured_at || b.timestamp) - new Date(a.measured_at || a.timestamp);
      })[0];
      
      return {
        type,
        typeLabel: getMeasurementTypeLabel(type),
        count: measurements.length,
        min,
        max,
        avg,
        unit,
        mostRecent: mostRecent.value,
        lastUpdated: mostRecent.measured_at || mostRecent.timestamp
      };
    });
  };
  
  const summaryData = getMeasurementSummary();
  
  return (
    <div className={fullWidth ? "w-full" : "md:col-span-2"}>
      <div className={fullWidth ? "w-full" : "bg-white rounded-lg shadow-md p-6"}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {device.name || device.device_name || `${device.integration_type} Data`}
          </h2>
          
          <div className="mt-2 sm:mt-0 flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              className={`px-3 py-1 text-xs rounded-md ${displayMode === 'table' ? 'bg-white shadow' : ''}`}
              onClick={() => setDisplayMode('table')}
            >
              Table
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md ${displayMode === 'summary' ? 'bg-white shadow' : ''}`}
              onClick={() => setDisplayMode('summary')}
            >
              Summary
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md ${displayMode === 'chart' ? 'bg-white shadow' : ''}`}
              onClick={() => setDisplayMode('chart')}
            >
              Charts
            </button>
          </div>
        </div>
        
        {/* Date range selector */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) => onDateRangeChange(e, 'startDate')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) => onDateRangeChange(e, 'endDate')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-end">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              onClick={onRefresh}
            >
              Apply
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : deviceData && deviceData.results && deviceData.results.length > 0 ? (
          <div>
            {/* Summary View */}
            {displayMode === 'summary' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summaryData.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{item.typeLabel}</h4>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {formatValue(item.mostRecent, item.unit)}
                    </p>
                    <div className="mt-1 text-xs text-gray-500">
                      Last updated: {new Date(item.lastUpdated).toLocaleString()}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center border-t border-gray-200 pt-2">
                      <div>
                        <p className="text-xs text-gray-500">Min</p>
                        <p className="font-medium">{formatValue(item.min, item.unit)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Avg</p>
                        <p className="font-medium">{formatValue(item.avg.toFixed(1), item.unit)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Max</p>
                        <p className="font-medium">{formatValue(item.max, item.unit)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Table View */}
            {displayMode === 'table' && (
              <div>
                {/* Data visualization would go here */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="font-medium mb-2">Data Summary</p>
                  <p className="text-sm text-gray-600">
                    {deviceData.results.length} data points collected between {dateRange.startDate} and {dateRange.endDate}
                  </p>
                </div>
                
                {/* Data table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metric
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {deviceData.results.slice(0, 10).map((dataPoint, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(dataPoint.timestamp || dataPoint.measured_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getMeasurementTypeLabel(dataPoint.metric_type || dataPoint.measurement_type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dataPoint.value}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dataPoint.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {deviceData.results.length > 10 && (
                    <div className="py-3 flex items-center justify-center">
                      <p className="text-sm text-gray-500">
                        Showing 10 of {deviceData.results.length} records
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Chart View */}
            {displayMode === 'chart' && (
              <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-gray-500">Data visualization charts would be displayed here.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    This would include time-series charts for each measurement type.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500">No data available for the selected date range.</p>
            <p className="mt-2 text-sm text-gray-400">Try selecting a different date range or sync your device data.</p>
            <button 
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm"
              onClick={onRefresh}
            >
              Sync Device Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}