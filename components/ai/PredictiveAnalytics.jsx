import React, { useState, useEffect } from 'react';
import { useMobileOptimization } from '../../contexts/MobileOptimizationContext';

/**
 * PredictiveAnalytics Component
 * Displays predictive analytics for patient admissions and resource needs
 */
const PredictiveAnalytics = ({
  departmentId = null,
  timeRange = 'week', // 'day', 'week', 'month'
  predictionType = 'all' // 'all', 'admissions', 'resources', 'staffing'
}) => {
  const { isMobile } = useMobileOptimization();
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedType, setSelectedType] = useState(predictionType);

  useEffect(() => {
    fetchPredictions();
  }, [departmentId, selectedTimeRange, selectedType]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      // This would be an actual API call in a real implementation
      // const response = await aiAPI.getPredictions({
      //   departmentId,
      //   timeRange,
      //   type: selectedType
      // });
      
      // Simulated response for demonstration
      const mockResponse = {
        predictions: {
          admissions: {
            current,
            predicted,
            percentChange: 28.9,
            trend: 'increasing',
            confidence: 0.87,
            byDay: [
              { day: 'Monday', value: 8 },
              { day: 'Tuesday', value: 7 },
              { day: 'Wednesday', value: 9 },
              { day: 'Thursday', value: 10 },
              { day: 'Friday', value: 12 },
              { day: 'Saturday', value: 7 },
              { day: 'Sunday', value: 5 }
            ],
            byCategory: [
              { category: 'Emergency', value: 22 },
              { category: 'Scheduled', value: 18 },
              { category: 'Transfer', value: 12 },
              { category: 'Other', value: 6 }
            ]
          },
          resources: {
            current: {
              beds: { total, occupied: 98 },
              equipment: { total, inUse: 32 }
            },
            predicted: {
              beds: { total, needed: 110 },
              equipment: { total, needed: 40 }
            },
            criticalShortages: [
              { resource: 'ICU Beds', current, predicted, deficit: 3 },
              { resource: 'Ventilators', current, predicted, deficit: 2 }
            ],
            confidence: 0.82
          },
          staffing: {
            current: {
              physicians,
              nurses,
              technicians: 18
            },
            predicted: {
              physicians,
              nurses,
              technicians: 20
            },
            recommendations: [
              { role: 'Nurse', shift: 'Evening', count, priority: 'high' },
              { role: 'Physician', shift: 'Morning', count, priority: 'medium' },
              { role: 'Technician', shift: 'Night', count, priority: 'low' }
            ],
            confidence: 0.79
          }
        },
        timestamp: new Date().toISOString(),
        timeRange: selectedTimeRange
      };
      
      setPredictions(mockResponse.predictions);
      setError(null);
    } catch (err) {
      console.error('Error fetching predictive analytics:', err);
      setError('Failed to load predictions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  const renderAdmissionsPredictions = () => {
    if (!predictions || !predictions.admissions) return null;
    
    const { admissions } = predictions;
    const trendIcon = admissions.trend === 'increasing' 
      ? <i className="bi bi-arrow-up-circle-fill text-danger"></i>
      : <i className="bi bi-arrow-down-circle-fill text-success"></i>;
    
    return (
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-hospital me-2"></i>
            Predicted Admissions
          </h5>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4 text-center">
              <h2 className="display-4">{admissions.predicted}</h2>
              <p className="text-muted">Predicted Admissions</p>
              <div className={`badge bg-${admissions.trend === 'increasing' ? 'danger' : 'success'} p-2`}>
                {trendIcon} {Math.abs(admissions.percentChange)}% {admissions.trend}
              </div>
            </div>
            <div className="col-md-8">
              <h6>Current vs. Predicted Admissions</h6>
              <div className="progress mb-3" style={{ height: '25px' }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${(admissions.current / admissions.predicted) * 100}%` }}
                  aria-valuenow={admissions.current}
                  aria-valuemin="0" 
                  aria-valuemax={admissions.predicted}
                >
                  Current: {admissions.current}
                </div>
              </div>
              <p className="text-muted">
                <small>Prediction confidence: {Math.round(admissions.confidence * 100)}%</small>
              </p>
              
              <div className="row mt-4">
                <div className="col-md-6">
                  <h6>Admissions by Day</h6>
                  <ul className="list-group">
                    {admissions.byDay.map((day, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {day.day}
                        <span className="badge bg-primary rounded-pill">{day.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Admissions by Category</h6>
                  <ul className="list-group">
                    {admissions.byCategory.map((category, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {category.category}
                        <span className="badge bg-primary rounded-pill">{category.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResourcesPredictions = () => {
    if (!predictions || !predictions.resources) return null;
    
    const { resources } = predictions;
    const bedUtilization = Math.round((resources.predicted.beds.needed / resources.current.beds.total) * 100);
    const equipmentUtilization = Math.round((resources.predicted.equipment.needed / resources.current.equipment.total) * 100);
    
    return (
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <i className="bi bi-gear me-2"></i>
            Resource Predictions
          </h5>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <h6>Bed Utilization</h6>
              <div className="progress mb-2" style={{ height: '25px' }}>
                <div 
                  className={`progress-bar ${bedUtilization > 90 ? 'bg-danger' : bedUtilization > 75 ? 'bg-warning' : 'bg-success'}`}
                  role="progressbar" 
                  style={{ width: `${bedUtilization}%` }}
                  aria-valuenow={resources.predicted.beds.needed}
                  aria-valuemin="0" 
                  aria-valuemax={resources.current.beds.total}
                >
                  {bedUtilization}%
                </div>
              </div>
              <p className="text-muted">
                <small>Predicted: {resources.predicted.beds.needed} of {resources.current.beds.total} beds needed</small>
              </p>
            </div>
            <div className="col-md-6">
              <h6>Equipment Utilization</h6>
              <div className="progress mb-2" style={{ height: '25px' }}>
                <div 
                  className={`progress-bar ${equipmentUtilization > 90 ? 'bg-danger' : equipmentUtilization > 75 ? 'bg-warning' : 'bg-success'}`}
                  role="progressbar" 
                  style={{ width: `${equipmentUtilization}%` }}
                  aria-valuenow={resources.predicted.equipment.needed}
                  aria-valuemin="0" 
                  aria-valuemax={resources.current.equipment.total}
                >
                  {equipmentUtilization}%
                </div>
              </div>
              <p className="text-muted">
                <small>Predicted: {resources.predicted.equipment.needed} of {resources.current.equipment.total} equipment items needed</small>
              </p>
            </div>
          </div>
          
          <h6>Critical Resource Shortages</h6>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Resource</th>
                  <th>Current Available</th>
                  <th>Predicted Need</th>
                  <th>Deficit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {resources.criticalShortages.map((shortage, index) => (
                  <tr key={index}>
                    <td>{shortage.resource}</td>
                    <td>{shortage.current}</td>
                    <td>{shortage.predicted}</td>
                    <td>{shortage.deficit}</td>
                    <td>
                      <span className="badge bg-danger">Critical</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className="text-muted mt-3">
            <small>Prediction confidence: {Math.round(resources.confidence * 100)}%</small>
          </p>
        </div>
      </div>
    );
  };

  const renderStaffingPredictions = () => {
    if (!predictions || !predictions.staffing) return null;
    
    const { staffing } = predictions;
    
    return (
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">
            <i className="bi bi-people me-2"></i>
            Staffing Predictions
          </h5>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4">
              <h6>Physicians</h6>
              <div className="d-flex align-items-center">
                <div className="display-5 me-3">{staffing.current.physicians}</div>
                <div className="d-flex flex-column">
                  <span className="text-muted">Current</span>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-arrow-right me-2"></i>
                    <span className="h5 mb-0">{staffing.predicted.physicians}</span>
                    <span className="text-muted ms-2">Needed</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <h6>Nurses</h6>
              <div className="d-flex align-items-center">
                <div className="display-5 me-3">{staffing.current.nurses}</div>
                <div className="d-flex flex-column">
                  <span className="text-muted">Current</span>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-arrow-right me-2"></i>
                    <span className="h5 mb-0">{staffing.predicted.nurses}</span>
                    <span className="text-muted ms-2">Needed</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <h6>Technicians</h6>
              <div className="d-flex align-items-center">
                <div className="display-5 me-3">{staffing.current.technicians}</div>
                <div className="d-flex flex-column">
                  <span className="text-muted">Current</span>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-arrow-right me-2"></i>
                    <span className="h5 mb-0">{staffing.predicted.technicians}</span>
                    <span className="text-muted ms-2">Needed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <h6>Staffing Recommendations</h6>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Shift</th>
                  <th>Additional Staff Needed</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {staffing.recommendations.map((rec, index) => (
                  <tr key={index}>
                    <td>{rec.role}</td>
                    <td>{rec.shift}</td>
                    <td>{rec.count}</td>
                    <td>
                      <span className={`badge bg-${rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'info'}`}>
                        {rec.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className="text-muted mt-3">
            <small>Prediction confidence: {Math.round(staffing.confidence * 100)}%</small>
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading predictions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!predictions) {
    return (
      <div className="alert alert-info" role="alert">
        No predictive analytics available at this time.
      </div>
    );
  }

  return (
    <div className="predictive-analytics">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="bi bi-graph-up me-2"></i>
          Predictive Analytics
        </h4>
        
        <div className="d-flex">
          <div className="btn-group me-2">
            <button 
              type="button" 
              className={`btn btn-outline-primary ${selectedTimeRange === 'day' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('day')}
            >
              Day
            </button>
            <button 
              type="button" 
              className={`btn btn-outline-primary ${selectedTimeRange === 'week' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('week')}
            >
              Week
            </button>
            <button 
              type="button" 
              className={`btn btn-outline-primary ${selectedTimeRange === 'month' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('month')}
            >
              Month
            </button>
          </div>
          
          <div className="btn-group">
            <button 
              type="button" 
              className={`btn btn-outline-secondary ${selectedType === 'all' ? 'active' : ''}`}
              onClick={() => handleTypeChange('all')}
            >
              All
            </button>
            <button 
              type="button" 
              className={`btn btn-outline-secondary ${selectedType === 'admissions' ? 'active' : ''}`}
              onClick={() => handleTypeChange('admissions')}
            >
              Admissions
            </button>
            <button 
              type="button" 
              className={`btn btn-outline-secondary ${selectedType === 'resources' ? 'active' : ''}`}
              onClick={() => handleTypeChange('resources')}
            >
              Resources
            </button>
            <button 
              type="button" 
              className={`btn btn-outline-secondary ${selectedType === 'staffing' ? 'active' : ''}`}
              onClick={() => handleTypeChange('staffing')}
            >
              Staffing
            </button>
          </div>
        </div>
      </div>
      
      {(selectedType === 'all' || selectedType === 'admissions') && renderAdmissionsPredictions()}
      {(selectedType === 'all' || selectedType === 'resources') && renderResourcesPredictions()}
      {(selectedType === 'all' || selectedType === 'staffing') && renderStaffingPredictions()}
      
      <div className="d-flex justify-content-end mt-3">
        <button 
          className="btn btn-primary"
          onClick={fetchPredictions}
        >
          <i className="bi bi-arrow-repeat me-2"></i>
          Refresh Predictions
        </button>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
