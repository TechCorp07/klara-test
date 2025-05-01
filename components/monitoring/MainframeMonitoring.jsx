import React, { useState, useEffect } from 'react';
import { useMobileOptimization } from '../../contexts/MobileOptimizationContext';

/**
 * MainframeMonitoring Component
 * Provides monitoring capabilities for healthcare mainframe systems
 */
const MainframeMonitoring = ({
  systemId = null,
  timeRange = 'day', // 'hour', 'day', 'week', 'month'
  refreshInterval = 60 // seconds
}) => {
  const { isMobile } = useMobileOptimization();
  const [monitoringData, setMonitoringData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedSystem, setSelectedSystem] = useState(systemId);
  const [availableSystems, setAvailableSystems] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  useEffect(() => {
    fetchAvailableSystems();
    fetchMonitoringData();
    
    // Set up auto-refresh interval
    let intervalId = null;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchMonitoringData();
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedTimeRange, selectedSystem, autoRefresh, refreshInterval]);

  const fetchAvailableSystems = async () => {
    try {
      // This would be an actual API call in a real implementation
      // const response = await mainframeAPI.getAvailableSystems();
      
      // Simulated response for demonstration
      const mockResponse = {
        systems: [
          {
            id: 'mainframe-1',
            name: 'Primary Healthcare Mainframe',
            type: 'IBM z15',
            status: 'online'
          },
          {
            id: 'mainframe-2',
            name: 'Backup Healthcare Mainframe',
            type: 'IBM z14',
            status: 'standby'
          },
          {
            id: 'legacy-1',
            name: 'Legacy Patient Records System',
            type: 'IBM System/390',
            status: 'online'
          }
        ]
      };
      
      setAvailableSystems(mockResponse.systems);
      
      // If no system is selected, select the first one
      if (!selectedSystem && mockResponse.systems.length > 0) {
        setSelectedSystem(mockResponse.systems[0].id);
      }
    } catch (err) {
      console.error('Error fetching available mainframe systems:', err);
      // Don't set error state here, as we'll still try to fetch monitoring data
    }
  };

  const fetchMonitoringData = async () => {
    if (!selectedSystem) return;
    
    setLoading(true);
    try {
      // This would be an actual API call in a real implementation
      // const response = await mainframeAPI.getMonitoringData({
      //   systemId,
      //   timeRange: selectedTimeRange
      // });
      
      // Simulated response for demonstration
      const mockResponse = {
        systemId,
        systemName: availableSystems.find(s => s.id === selectedSystem)?.name || 'Unknown System',
        timeRange,
        timestamp: new Date().toISOString(),
        metrics: {
          cpu: {
            current,
            average,
            peak,
            history: generateRandomHistory(24, 50, 95)
          },
          memory: {
            total, // GB
            used,  // GB
            available, // GB
            utilization, // percentage
            history: generateRandomHistory(24, 65, 85)
          },
          storage: {
            total, // TB
            used: 14.5, // TB
            available: 5.5, // TB
            utilization: 72.5, // percentage
            history: generateRandomHistory(24, 70, 75)
          },
          network: {
            bandwidth, // Gbps
            utilization, // percentage
            inbound: 2.2, // Gbps
            outbound: 2.3, // Gbps
            history: generateRandomHistory(24, 30, 60)
          },
          transactions: {
            total,
            perSecond,
            successful,
            failed,
            history: generateRandomHistory(24, 20, 50, true)
          }
        },
        alerts: [
          {
            id: 'alert-1',
            severity: 'warning',
            message: 'CPU utilization exceeded 90% for 5 minutes',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            metric: 'cpu',
            value,
            threshold,
            status: 'active'
          },
          {
            id: 'alert-2',
            severity: 'critical',
            message: 'Transaction failure rate above 1%',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            metric: 'transactions',
            value: 1.2,
            threshold: 1.0,
            status: 'acknowledged'
          },
          {
            id: 'alert-3',
            severity: 'info',
            message: 'Scheduled maintenance in 24 hours',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            status: 'active'
          }
        ],
        jobs: [
          {
            id: 'job-1',
            name: 'Daily Patient Data Backup',
            status: 'running',
            progress,
            startTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            estimatedCompletion: new Date(Date.now() + 1000 * 60 * 25).toISOString()
          },
          {
            id: 'job-2',
            name: 'Monthly Billing Processing',
            status: 'queued',
            startTime,
            estimatedCompletion: null
          },
          {
            id: 'job-3',
            name: 'Weekly System Maintenance',
            status: 'completed',
            progress,
            startTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            completionTime: new Date(Date.now() - 1000 * 60 * 120).toISOString()
          }
        ]
      };
      
      setMonitoringData(mockResponse);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching mainframe monitoring data:', err);
      setError('Failed to load monitoring data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate random history data for charts
  function generateRandomHistory(points, min, max, isInteger = false) {
    const history = [];
    for (let i = 0; i < points; i++) {
      const value = min + Math.random() * (max - min);
      history.push({
        timestamp: new Date(Date.now() - (points - i) * 1000 * 60 * 60).toISOString(),
        value: isInteger ? Math.round(value) : parseFloat(value.toFixed(1))
      });
    }
    return history;
  }

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  const handleSystemChange = (e) => {
    setSelectedSystem(e.target.value);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handleRefresh = () => {
    fetchMonitoringData();
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'online':
        return <span className="badge bg-success">Online</span>;
      case 'standby':
        return <span className="badge bg-info">Standby</span>;
      case 'offline':
        return <span className="badge bg-danger">Offline</span>;
      case 'maintenance':
        return <span className="badge bg-warning text-dark">Maintenance</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getAlertSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <span className="badge bg-danger">Critical</span>;
      case 'warning':
        return <span className="badge bg-warning text-dark">Warning</span>;
      case 'info':
        return <span className="badge bg-info">Info</span>;
      default:
        return <span className="badge bg-secondary">{severity}</span>;
    }
  };

  const getJobStatusBadge = (status) => {
    switch (status) {
      case 'running':
        return <span className="badge bg-primary">Running</span>;
      case 'queued':
        return <span className="badge bg-secondary">Queued</span>;
      case 'completed':
        return <span className="badge bg-success">Completed</span>;
      case 'failed':
        return <span className="badge bg-danger">Failed</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const renderUtilizationGauge = (title, value, thresholds = { warning, critical: 90 }) => {
    let gaugeClass = 'bg-success';
    if (value >= thresholds.critical) {
      gaugeClass = 'bg-danger';
    } else if (value >= thresholds.warning) {
      gaugeClass = 'bg-warning';
    }
    
    return (
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h6 className="mb-0">{title}</h6>
          <span className={`badge ${gaugeClass}`}>{value}%</span>
        </div>
        <div className="progress" style={{ height: '10px' }}>
          <div 
            className={`progress-bar ${gaugeClass}`} 
            role="progressbar" 
            style={{ width: `${value}%` }}
            aria-valuenow={value}
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>
      </div>
    );
  };

  if (loading && !monitoringData) {
    return (
      <div className="d-flex justify-content-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading monitoring data...</span>
        </div>
      </div>
    );
  }

  if (error && !monitoringData) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!monitoringData) {
    return (
      <div className="alert alert-info" role="alert">
        No monitoring data available. Please select a system to monitor.
      </div>
    );
  }

  return (
    <div className="mainframe-monitoring">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="bi bi-server me-2"></i>
          Mainframe Monitoring
        </h4>
        
        <div className="d-flex align-items-center">
          {lastRefreshed && (
            <small className="text-muted me-3">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </small>
          )}
          
          <div className="form-check form-switch me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="autoRefreshToggle"
              checked={autoRefresh}
              onChange={toggleAutoRefresh}
            />
            <label className="form-check-label" htmlFor="autoRefreshToggle">
              Auto-refresh
            </label>
          </div>
          
          <button 
            className="btn btn-outline-primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-arrow-repeat"></i>
            )}
          </button>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <label className="input-group-text" htmlFor="systemSelect">System</label>
            <select 
              className="form-select"
              id="systemSelect"
              value={selectedSystem}
              onChange={handleSystemChange}
            >
              {availableSystems.map(system => (
                <option key={system.id} value={system.id}>
                  {system.name} ({system.type})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="btn-group w-100">
            <button 
              type="button" 
              className={`btn btn-outline-secondary ${selectedTimeRange === 'hour' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('hour')}
            >
              Hour
            </button>
            <button 
              type="button" 
              className={`btn btn-outline-secondary ${selectedTimeRange === 'day' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('day')}
            >
              Day
            </button>
            <button 
              type="button" 
              className={`btn btn-outline-secondary ${selectedTimeRange === 'week' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('week')}
            >
              Week
            </button>
            <button 
              type="button" 
              className={`btn btn-outline-secondary ${selectedTimeRange === 'month' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('month')}
            >
              Month
            </button>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">System Utilization</h5>
            </div>
            <div className="card-body">
              {renderUtilizationGauge('CPU Utilization', monitoringData.metrics.cpu.current)}
              {renderUtilizationGauge('Memory Utilization', monitoringData.metrics.memory.utilization)}
              {renderUtilizationGauge('Storage Utilization', monitoringData.metrics.storage.utilization)}
              {renderUtilizationGauge('Network Utilization', monitoringData.metrics.network.utilization)}
              
              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Memory</h6>
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="h3 mb-0">{monitoringData.metrics.memory.used} GB</div>
                          <div className="text-muted">Used</div>
                        </div>
                        <div className="text-end">
                          <div className="h3 mb-0">{monitoringData.metrics.memory.total} GB</div>
                          <div className="text-muted">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Storage</h6>
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="h3 mb-0">{monitoringData.metrics.storage.used} TB</div>
                          <div className="text-muted">Used</div>
                        </div>
                        <div className="text-end">
                          <div className="h3 mb-0">{monitoringData.metrics.storage.total} TB</div>
                          <div className="text-muted">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h6>Transaction Rate</h6>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="h3 mb-0">{monitoringData.metrics.transactions.perSecond} tps</div>
                  <div>
                    <span className="badge bg-success me-2">
                      {monitoringData.metrics.transactions.successful} Successful
                    </span>
                    <span className="badge bg-danger">
                      {monitoringData.metrics.transactions.failed} Failed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Alerts</h5>
            </div>
            <div className="list-group list-group-flush">
              {monitoringData.alerts.length > 0 ? (
                monitoringData.alerts.map(alert => (
                  <div key={alert.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        {getAlertSeverityBadge(alert.severity)}
                      </div>
                      <small className="text-muted">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </small>
                    </div>
                    <p className="mb-1 mt-2">{alert.message}</p>
                    {alert.metric && (
                      <small className="d-block text-muted">
                        {alert.metric.toUpperCase()}: {alert.value}% (Threshold: {alert.threshold}%)
                      </small>
                    )}
                    <div className="d-flex justify-content-end mt-2">
                      <button className="btn btn-sm btn-outline-secondary me-2">
                        {alert.status === 'acknowledged' ? 'Acknowledged' : 'Acknowledge'}
                      </button>
                      <button className="btn btn-sm btn-outline-primary">
                        Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="list-group-item text-center py-4">
                  <i className="bi bi-check-circle text-success display-6"></i>
                  <p className="mt-3 mb-0">No active alerts</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Batch Jobs</h5>
            </div>
            <div className="list-group list-group-flush">
              {monitoringData.jobs.map(job => (
                <div key={job.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">{job.name}</h6>
                    {getJobStatusBadge(job.status)}
                  </div>
                  
                  {job.status === 'running' && (
                    <div className="mt-2">
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar progress-bar-striped progress-bar-animated" 
                          role="progressbar" 
                          style={{ width: `${job.progress}%` }}
                          aria-valuenow={job.progress}
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <div className="d-flex justify-content-between mt-1">
                        <small className="text-muted">
                          Started: {new Date(job.startTime).toLocaleTimeString()}
                        </small>
                        <small className="text-muted">
                          {job.progress}% Complete
                        </small>
                      </div>
                    </div>
                  )}
                  
                  {job.status === 'completed' && (
                    <div className="mt-2">
                      <small className="text-muted d-block">
                        Started: {new Date(job.startTime).toLocaleTimeString()}
                      </small>
                      <small className="text-muted d-block">
                        Completed: {new Date(job.completionTime).toLocaleTimeString()}
                      </small>
                    </div>
                  )}
                  
                  {job.status === 'queued' && (
                    <div className="mt-2">
                      <small className="text-muted">
                        Waiting to start...
                      </small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainframeMonitoring;
