import React, { useState, useEffect } from 'react';
import { reports } from '../../api';
import { toast } from 'react-toastify';

/**
 * DashboardList Component
 * Displays a list of available dashboards and allows navigation to them
 */
const DashboardList = () => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getDashboards();
      setDashboards(response.dashboards || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboards:', err);
      setError('Failed to load dashboards. Please try again.');
      toast.error('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
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

  if (dashboards.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        No dashboards are currently available.
      </div>
    );
  }

  return (
    <div className="dashboard-list">
      <h3 className="mb-4">Analytics Dashboards</h3>
      <div className="row">
        {dashboards.map((dashboard) => (
          <div key={dashboard.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              {dashboard.thumbnailUrl && (
                <img 
                  src={dashboard.thumbnailUrl} 
                  className="card-img-top" 
                  alt={dashboard.name} 
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{dashboard.name}</h5>
                <p className="card-text">{dashboard.description}</p>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">
                    Last updated: {new Date(dashboard.updatedAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
              <div className="card-footer bg-transparent">
                <a href={`/reports/dashboards/${dashboard.id}`} className="btn btn-primary">
                  View Dashboard
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardList;
