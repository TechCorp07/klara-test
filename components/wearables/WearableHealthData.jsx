import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * WearableHealthData Component
 * Displays health data synced from wearable devices and analyzes it against medication plan
 */
const WearableHealthData = ({ userId, medicationPlan }) => {
  const [healthData, setHealthData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week'); // 'day', 'week', 'month'
  const [selectedMetrics, setSelectedMetrics] = useState(['heartRate', 'steps', 'sleep']);
  const [analysis, setAnalysis] = useState(null);

  // Fetch health data
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/wearables/user/${userId}/health-data?range=${dateRange}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch health data');
        }
        
        const data = await response.json();
        setHealthData(data.healthData || []);
        
      } catch (error) {
        console.error('Error fetching health data:', error);
        toast.error('Failed to load health data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHealthData();
  }, [userId, dateRange]);

  // Analyze health data against medication plan
  useEffect(() => {
    const analyzeHealthData = async () => {
      if (!healthData.length || !medicationPlan) return;
      
      try {
        const response = await fetch('/api/wearables/analyze-health-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            healthData,
            medicationPlan
          }),
          credentials: 'same-origin'
        });
        
        if (!response.ok) {
          throw new Error('Failed to analyze health data');
        }
        
        const data = await response.json();
        setAnalysis(data.analysis);
        
      } catch (error) {
        console.error('Error analyzing health data:', error);
        toast.error('Failed to analyze health data. Please try again later.');
      }
    };
    
    analyzeHealthData();
  }, [userId, healthData, medicationPlan]);

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Toggle selected metrics
  const toggleMetric = (metric) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric) 
        : [...prev, metric]
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="wearable-health-data loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading health data...</p>
      </div>
    );
  }

  return (
    <div className="wearable-health-data">
      <h3>Health Data Analysis</h3>
      
      {/* Date Range Selector */}
      <div className="date-range-selector mb-4">
        <div className="btn-group" role="group" aria-label="Date range">
          <button 
            type="button" 
            className={`btn ${dateRange === 'day' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleDateRangeChange('day')}
          >
            Day
          </button>
          <button 
            type="button" 
            className={`btn ${dateRange === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleDateRangeChange('week')}
          >
            Week
          </button>
          <button 
            type="button" 
            className={`btn ${dateRange === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleDateRangeChange('month')}
          >
            Month
          </button>
        </div>
      </div>
      
      {/* Metrics Selector */}
      <div className="metrics-selector mb-4">
        <h5>Metrics</h5>
        <div className="form-check form-check-inline">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="heartRateCheck" 
            checked={selectedMetrics.includes('heartRate')} 
            onChange={() => toggleMetric('heartRate')}
          />
          <label className="form-check-label" htmlFor="heartRateCheck">Heart Rate</label>
        </div>
        <div className="form-check form-check-inline">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="stepsCheck" 
            checked={selectedMetrics.includes('steps')} 
            onChange={() => toggleMetric('steps')}
          />
          <label className="form-check-label" htmlFor="stepsCheck">Steps</label>
        </div>
        <div className="form-check form-check-inline">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="sleepCheck" 
            checked={selectedMetrics.includes('sleep')} 
            onChange={() => toggleMetric('sleep')}
          />
          <label className="form-check-label" htmlFor="sleepCheck">Sleep</label>
        </div>
        <div className="form-check form-check-inline">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="bloodPressureCheck" 
            checked={selectedMetrics.includes('bloodPressure')} 
            onChange={() => toggleMetric('bloodPressure')}
          />
          <label className="form-check-label" htmlFor="bloodPressureCheck">Blood Pressure</label>
        </div>
        <div className="form-check form-check-inline">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="bloodGlucoseCheck" 
            checked={selectedMetrics.includes('bloodGlucose')} 
            onChange={() => toggleMetric('bloodGlucose')}
          />
          <label className="form-check-label" htmlFor="bloodGlucoseCheck">Blood Glucose</label>
        </div>
      </div>
      
      {/* Health Data Display */}
      {healthData.length === 0 ? (
        <div className="alert alert-info">
          No health data available for the selected time period. Connect a wearable device and sync data to see your health metrics.
        </div>
      ) : (
        <div className="health-data-display">
          {/* Heart Rate Data */}
          {selectedMetrics.includes('heartRate') && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Heart Rate</h5>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  {/* Chart would be rendered here using a library like Chart.js */}
                  <div className="placeholder-chart">
                    <p className="text-center">Heart Rate Chart</p>
                  </div>
                </div>
                <div className="metrics-summary mt-3">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Average</h6>
                        <p className="h3">{healthData.reduce((sum, data) => sum + (data.heartRate?.avg || 0), 0) / healthData.length} bpm</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Maximum</h6>
                        <p className="h3">{Math.max(...healthData.map(data => data.heartRate?.max || 0))} bpm</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Minimum</h6>
                        <p className="h3">{Math.min(...healthData.filter(data => data.heartRate?.min > 0).map(data => data.heartRate?.min || 999))} bpm</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Steps Data */}
          {selectedMetrics.includes('steps') && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Steps</h5>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  {/* Chart would be rendered here using a library like Chart.js */}
                  <div className="placeholder-chart">
                    <p className="text-center">Steps Chart</p>
                  </div>
                </div>
                <div className="metrics-summary mt-3">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Daily Average</h6>
                        <p className="h3">{Math.round(healthData.reduce((sum, data) => sum + (data.steps || 0), 0) / healthData.length)}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Total Steps</h6>
                        <p className="h3">{healthData.reduce((sum, data) => sum + (data.steps || 0), 0)}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Goal Achievement</h6>
                        <p className="h3">{Math.round((healthData.reduce((sum, data) => sum + (data.steps || 0), 0) / (10000 * healthData.length)) * 100)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Sleep Data */}
          {selectedMetrics.includes('sleep') && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Sleep</h5>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  {/* Chart would be rendered here using a library like Chart.js */}
                  <div className="placeholder-chart">
                    <p className="text-center">Sleep Chart</p>
                  </div>
                </div>
                <div className="metrics-summary mt-3">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Average Duration</h6>
                        <p className="h3">{Math.round(healthData.reduce((sum, data) => sum + (data.sleep?.duration || 0), 0) / healthData.length / 60)} hrs</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Deep Sleep</h6>
                        <p className="h3">{Math.round(healthData.reduce((sum, data) => sum + (data.sleep?.deepSleep || 0), 0) / healthData.length / 60)} hrs</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Sleep Quality</h6>
                        <p className="h3">{Math.round(healthData.reduce((sum, data) => sum + (data.sleep?.quality || 0), 0) / healthData.length)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Blood Pressure Data */}
          {selectedMetrics.includes('bloodPressure') && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Blood Pressure</h5>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  {/* Chart would be rendered here using a library like Chart.js */}
                  <div className="placeholder-chart">
                    <p className="text-center">Blood Pressure Chart</p>
                  </div>
                </div>
                <div className="metrics-summary mt-3">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Average Systolic</h6>
                        <p className="h3">{Math.round(healthData.reduce((sum, data) => sum + (data.bloodPressure?.systolic || 0), 0) / healthData.filter(data => data.bloodPressure).length)} mmHg</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Average Diastolic</h6>
                        <p className="h3">{Math.round(healthData.reduce((sum, data) => sum + (data.bloodPressure?.diastolic || 0), 0) / healthData.filter(data => data.bloodPressure).length)} mmHg</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Status</h6>
                        <p className="h3">{
                          (() => {
                            const avgSystolic = Math.round(healthData.reduce((sum, data) => sum + (data.bloodPressure?.systolic || 0), 0) / healthData.filter(data => data.bloodPressure).length);
                            const avgDiastolic = Math.round(healthData.reduce((sum, data) => sum + (data.bloodPressure?.diastolic || 0), 0) / healthData.filter(data => data.bloodPressure).length);
                            
                            if (avgSystolic < 120 && avgDiastolic < 80) return 'Normal';
                            if (avgSystolic < 130 && avgDiastolic < 80) return 'Elevated';
                            if (avgSystolic < 140 || avgDiastolic < 90) return 'Stage 1';
                            return 'Stage 2';
                          })()
                        }</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Blood Glucose Data */}
          {selectedMetrics.includes('bloodGlucose') && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Blood Glucose</h5>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  {/* Chart would be rendered here using a library like Chart.js */}
                  <div className="placeholder-chart">
                    <p className="text-center">Blood Glucose Chart</p>
                  </div>
                </div>
                <div className="metrics-summary mt-3">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Average</h6>
                        <p className="h3">{Math.round(healthData.reduce((sum, data) => sum + (data.bloodGlucose?.value || 0), 0) / healthData.filter(data => data.bloodGlucose).length)} mg/dL</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Maximum</h6>
                        <p className="h3">{Math.max(...healthData.filter(data => data.bloodGlucose).map(data => data.bloodGlucose?.value || 0))} mg/dL</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="metric-card text-center p-3 border rounded">
                        <h6>Minimum</h6>
                        <p className="h3">{Math.min(...healthData.filter(data => data.bloodGlucose && data.bloodGlucose.value > 0).map(data => data.bloodGlucose?.value || 999))} mg/dL</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Medication Plan Analysis */}
      {analysis && (
        <div className="medication-analysis mt-4">
          <h4>Health Data Analysis with Medication Plan</h4>
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Analysis Results</h5>
            </div>
            <div className="card-body">
              {/* Overall Adherence */}
              <div className="adherence-summary mb-4">
                <h6>Medication Adherence</h6>
                <div className="progress">
                  <div 
                    className={`progress-bar ${analysis.adherencePercentage >= 80 ? 'bg-success' : analysis.adherencePercentage >= 60 ? 'bg-warning' : 'bg-danger'}`} 
                    role="progressbar" 
                    style={{ width: `${analysis.adherencePercentage}%` }} 
                    aria-valuenow={analysis.adherencePercentage} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {analysis.adherencePercentage}%
                  </div>
                </div>
                <p className="mt-2">{analysis.adherenceMessage}</p>
              </div>
              
              {/* Health Metrics Impact */}
              <div className="health-impact">
                <h6>Health Metrics Impact</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Medication</th>
                        <th>Expected Impact</th>
                        <th>Actual Impact</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.medicationImpacts.map((impact, index) => (
                        <tr key={index}>
                          <td>{impact.medication}</td>
                          <td>{impact.expectedImpact}</td>
                          <td>{impact.actualImpact}</td>
                          <td>
                            <span className={`badge ${impact.status === 'Good' ? 'bg-success' : impact.status === 'Moderate' ? 'bg-warning' : 'bg-danger'}`}>
                              {impact.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Recommendations */}
              <div className="recommendations mt-4">
                <h6>Recommendations</h6>
                <ul className="list-group">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="list-group-item">
                      <i className={`bi bi-${recommendation.type === 'warning' ? 'exclamation-triangle text-warning' : recommendation.type === 'danger' ? 'exclamation-circle text-danger' : 'info-circle text-info'} me-2`}></i>
                      {recommendation.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WearableHealthData;
