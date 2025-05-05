import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { fhirService } from '../../lib/services/ehr/fhirService';

/**
 * FHIR Export Component
 * Allows users to export FHIR data in various formats
 */
const FHIRExport = ({ patientId = null }) => {
  const [exportType, setExportType] = useState('patient');
  const [exportFormat, setExportFormat] = useState('json');
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [downloadUrls, setDownloadUrls] = useState([]);
  const [parameters, setParameters] = useState({
    _since: '',
    _type: '',
    _elements: ''
  });

  const handleParameterChange = (e) => {
    const { name, value } = e.target;
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setExportStatus('initiating');
    setDownloadUrls([]);

    try {
      // Filter out empty parameters
      const exportParams = Object.entries(parameters)
        .filter(([_, value]) => value.trim() !== '')
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});

      // Add export format
      exportParams._format = exportFormat;

      // Initiate export
      const exportResponse = await fhirService.exportData(
        exportType,
        exportType === "patient" ? patientId : null,
        exportParams,
      );

      if (exportResponse && exportResponse.statusUrl) {
        setExportStatus('processing');
        
        // Poll for export status
        const checkStatus = async () => {
          try {
            const statusResponse = await fhirService.checkExportStatus(exportResponse.statusUrl);
            
            if (statusResponse.status === 'completed') {
              setExportStatus('completed');
              setDownloadUrls(statusResponse.output || []);
              toast.success('Export completed successfully');
            } else if (statusResponse.status === 'failed') {
              setExportStatus('failed');
              toast.error(`Export failed: ${statusResponse.error || 'Unknown error'}`);
            } else {
              // Still processing, check again in 2 seconds
              setTimeout(checkStatus, 2000);
            }
          } catch (error) {
            console.error('Error checking export status:', error);
            setExportStatus('failed');
            toast.error('Failed to check export status');
          }
        };
        
        // Start polling
        checkStatus();
      } else {
        throw new Error('Invalid export response');
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('failed');
      toast.error(error.message || 'Failed to initiate export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fhir-export card">
      <div className="card-header">
        <h3>FHIR Data Export</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleExport}>
          <div className="mb-3">
            <label htmlFor="exportType" className="form-label">Export Type</label>
            <select
              id="exportType"
              className="form-select"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              disabled={loading}
            >
              {patientId && <option value="patient">Patient Export</option>}
              <option value="system">System Export</option>
              <option value="group">Group Export</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="exportFormat" className="form-label">Export Format</label>
            <select
              id="exportFormat"
              className="form-select"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              disabled={loading}
            >
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="ndjson">NDJSON</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="_since" className="form-label">Since Date (Optional)</label>
            <input
              type="datetime-local"
              id="_since"
              name="_since"
              className="form-control"
              value={parameters._since}
              onChange={handleParameterChange}
              disabled={loading}
            />
            <div className="form-text">Only include resources modified after this date</div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="_type" className="form-label">Resource Types (Optional)</label>
            <input
              type="text"
              id="_type"
              name="_type"
              className="form-control"
              value={parameters._type}
              onChange={handleParameterChange}
              disabled={loading}
              placeholder="Patient,Observation,MedicationRequest"
            />
            <div className="form-text">Comma-separated list of resource types to include</div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="_elements" className="form-label">Elements (Optional)</label>
            <input
              type="text"
              id="_elements"
              name="_elements"
              className="form-control"
              value={parameters._elements}
              onChange={handleParameterChange}
              disabled={loading}
              placeholder="id,meta,identifier"
            />
            <div className="form-text">Comma-separated list of elements to include</div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || (exportType === 'patient' && !patientId)}
          >
            {loading ? 'Processing...' : 'Export Data'}
          </button>
        </form>
        
        {exportStatus && (
          <div className="mt-4">
            <h4>Export Status</h4>
            
            {exportStatus === 'initiating' && (
              <div className="alert alert-info">
                Initiating export...
              </div>
            )}
            
            {exportStatus === 'processing' && (
              <div className="alert alert-info">
                Export in progress. This may take a few minutes...
                <div className="progress mt-2">
                  <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}
            
            {exportStatus === 'completed' && (
              <div className="alert alert-success">
                <p>Export completed successfully!</p>
                {downloadUrls.length > 0 ? (
                  <div>
                    <p>Download exported files:</p>
                    <ul className="list-group">
                      {downloadUrls.map((url, index) => (
                        <li key={index} className="list-group-item">
                          <a href={url.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                            Download {url.type || `File ${index + 1}`}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>No files were generated.</p>
                )}
              </div>
            )}
            
            {exportStatus === 'failed' && (
              <div className="alert alert-danger">
                Export failed. Please try again or contact support.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FHIRExport;
