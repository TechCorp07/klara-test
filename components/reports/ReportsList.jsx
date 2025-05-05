import React, { useState, useEffect } from 'react';
import { reports } from '../../api';
import { toast } from 'react-toastify';

/**
 * ReportsList Component
 * Displays a list of available reports and allows generation of new reports
 */
const ReportsList = () => {
  const [reportTypes, setReportTypes] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [reportParameters, setReportParameters] = useState({});

  useEffect(() => {
    fetchReportTypes();
    fetchUserReports();
  }, []);

  const fetchReportTypes = async () => {
    setTypesLoading(true);
    try {
      const response = await reportsAPI.getReportTypes();
      setReportTypes(response.types || []);
    } catch (err) {
      console.error('Error fetching report types:', err);
      toast.error('Failed to load report types');
    } finally {
      setTypesLoading(false);
    }
  };

  const fetchUserReports = async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getUserReports();
      setUserReports(response.reports || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching user reports:', err);
      setError('Failed to load reports. Please try again.');
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (e) => {
    setSelectedReportType(e.target.value);
    // Reset parameters when report type changes
    setReportParameters({});
  };

  const handleParameterChange = (e) => {
    const { name, value } = e.target;
    setReportParameters({
      ...reportParameters,
      [name]: value
    });
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!selectedReportType) {
      toast.error('Please select a report type');
      return;
    }

    try {
      await reportsAPI.generateReport(selectedReportType, reportParameters);
      toast.success('Report generation initiated');
      setShowNewReportForm(false);
      setSelectedReportType('');
      setReportParameters({});
      // Refresh the reports list after a short delay to allow for processing
      setTimeout(() => {
        fetchUserReports();
      }, 2000);
    } catch (err) {
      console.error('Error generating report:', err);
      toast.error('Failed to generate report');
    }
  };

  const handleExportReport = async (reportId, format) => {
    try {
      const response = await reportsAPI.exportReport(reportId, format);
      if (response && response.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      } else {
        toast.error('Export URL not available');
      }
    } catch (err) {
      console.error('Error exporting report:', err);
      toast.error(`Failed to export report to ${format}`);
    }
  };

  // Get parameter fields for the selected report type
  const getParameterFields = () => {
    if (!selectedReportType) return null;
    
    const reportType = reportTypes.find(type => type.id === selectedReportType);
    if (!reportType || !reportType.parameters) return null;
    
    return reportType.parameters.map(param => (
      <div className="mb-3" key={param.name}>
        <label htmlFor={param.name} className="form-label">{param.label}</label>
        {param.type === 'date' ? (
          <input
            type="date"
            className="form-control"
            id={param.name}
            name={param.name}
            value={reportParameters[param.name] || ''}
            onChange={handleParameterChange}
            required={param.required}
          />
        ) : param.type === 'select' ? (
          <select
            className="form-select"
            id={param.name}
            name={param.name}
            value={reportParameters[param.name] || ''}
            onChange={handleParameterChange}
            required={param.required}
          >
            <option value="">Select {param.label}</option>
            {param.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            className="form-control"
            id={param.name}
            name={param.name}
            value={reportParameters[param.name] || ''}
            onChange={handleParameterChange}
            placeholder={param.placeholder || ''}
            required={param.required}
          />
        )}
        {param.description && (
          <div className="form-text">{param.description}</div>
        )}
      </div>
    ));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge bg-success">Completed</span>;
      case 'processing':
        return <span className="badge bg-primary">Processing</span>;
      case 'failed':
        return <span className="badge bg-danger">Failed</span>;
      case 'queued':
        return <span className="badge bg-secondary">Queued</span>;
      default:
        return <span className="badge bg-info">{status}</span>;
    }
  };

  if (loading && typesLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error && userReports.length === 0) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="reports-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Reports</h3>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowNewReportForm(!showNewReportForm)}
        >
          {showNewReportForm ? 'Cancel' : 'Generate New Report'}
        </button>
      </div>

      {showNewReportForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Generate New Report</h5>
          </div>
          <div className="card-body">
            {typesLoading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading report types...</span>
                </div>
              </div>
            ) : reportTypes.length === 0 ? (
              <div className="alert alert-info">
                No report types available.
              </div>
            ) : (
              <form onSubmit={handleGenerateReport}>
                <div className="mb-3">
                  <label htmlFor="reportType" className="form-label">Report Type</label>
                  <select
                    className="form-select"
                    id="reportType"
                    value={selectedReportType}
                    onChange={handleReportTypeChange}
                    required
                  >
                    <option value="">Select a report type</option>
                    {reportTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedReportType && (
                  <>
                    <div className="mb-3">
                      <h6>Report Parameters</h6>
                      {getParameterFields()}
                    </div>
                    <button type="submit" className="btn btn-success">
                      Generate Report
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Your Reports</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading reports...</span>
              </div>
            </div>
          ) : userReports.length === 0 ? (
            <div className="alert alert-info">
              You haven't generated any reports yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Type</th>
                    <th>Generated</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userReports.map(report => (
                    <tr key={report.id}>
                      <td>{report.name}</td>
                      <td>{report.type}</td>
                      <td>{new Date(report.createdAt).toLocaleString()}</td>
                      <td>{getStatusBadge(report.status)}</td>
                      <td>
                        {report.status === 'completed' ? (
                          <div className="btn-group" role="group">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => window.location.href = `/reports/${report.id}`}
                            >
                              View
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleExportReport(report.id, 'pdf')}
                            >
                              PDF
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleExportReport(report.id, 'csv')}
                            >
                              CSV
                            </button>
                          </div>
                        ) : report.status === 'failed' ? (
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => window.location.href = `/reports/${report.id}`}
                          >
                            View Error
                          </button>
                        ) : (
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            disabled
                          >
                            {report.status === 'processing' ? 'Processing...' : 'Queued'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsList;
