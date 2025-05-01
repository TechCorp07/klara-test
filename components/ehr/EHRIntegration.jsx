import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ehr } from '../../api';

/**
 * EHR System Integration Component
 * Allows users to configure and manage integration with major EHR systems
 */
const EHRIntegration = () => {
  const [availableSystems, setAvailableSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [configForm, setConfigForm] = useState({
    apiUrl: '',
    apiKey: '',
    clientId: '',
    clientSecret: '',
    username: '',
    password: '',
    useOAuth: false
  });
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncHistory, setSyncHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch available EHR systems on component mount
  useEffect(() => {
    fetchAvailableSystems();
  }, []);

  // Fetch integration status when a system is selected
  useEffect(() => {
    if (selectedSystem) {
      fetchIntegrationStatus(selectedSystem.id);
      fetchSyncHistory(selectedSystem.id);
    }
  }, [selectedSystem]);

  const fetchAvailableSystems = async () => {
    setLoading(true);
    try {
      const response = await ehrAPI.getAvailableSystems();
      setAvailableSystems(response.systems || []);
      
      // Select the first system by default if available
      if (response.systems && response.systems.length > 0) {
        setSelectedSystem(response.systems[0]);
      }
    } catch (error) {
      console.error('Error fetching EHR systems:', error);
      toast.error(error.message || 'Failed to fetch available EHR systems');
    } finally {
      setLoading(false);
    }
  };

  const fetchIntegrationStatus = async (systemId) => {
    setLoading(true);
    try {
      const status = await ehrAPI.getIntegrationStatus(systemId);
      setIntegrationStatus(status);
      
      // Pre-fill configuration form with existing values if available
      if (status.config) {
        setConfigForm({
          apiUrl: status.config.apiUrl || '',
          apiKey: status.config.apiKey || '',
          clientId: status.config.clientId || '',
          clientSecret: status.config.clientSecret || '',
          username: status.config.username || '',
          password: status.config.password || '',
          useOAuth: status.config.useOAuth || false
        });
      }
    } catch (error) {
      console.error('Error fetching integration status:', error);
      toast.error(error.message || 'Failed to fetch integration status');
      setIntegrationStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncHistory = async (systemId) => {
    try {
      const history = await ehrAPI.getSyncHistory(systemId);
      setSyncHistory(history.items || []);
    } catch (error) {
      console.error('Error fetching sync history:', error);
      setSyncHistory([]);
    }
  };

  const handleSystemSelect = (system) => {
    setSelectedSystem(system);
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfigForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSystem) {
      toast.error('Please select an EHR system');
      return;
    }
    
    setLoading(true);
    try {
      await ehrAPI.configureIntegration(selectedSystem.id, configForm);
      toast.success('EHR integration configured successfully');
      
      // Refresh integration status
      await fetchIntegrationStatus(selectedSystem.id);
    } catch (error) {
      console.error('Error configuring integration:', error);
      toast.error(error.message || 'Failed to configure EHR integration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedSystem) {
      toast.error('Please select an EHR system');
      return;
    }
    
    setTestingConnection(true);
    try {
      const result = await ehrAPI.testConnection(selectedSystem.id);
      
      if (result.success) {
        toast.success('Connection test successful');
      } else {
        toast.error(`Connection test failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error(error.message || 'Failed to test EHR connection');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncData = async () => {
    if (!selectedSystem) {
      toast.error('Please select an EHR system');
      return;
    }
    
    setLoading(true);
    try {
      const result = await ehrAPI.syncData(selectedSystem.id);
      
      if (result.success) {
        toast.success('Data synchronized successfully');
        // Refresh sync history
        await fetchSyncHistory(selectedSystem.id);
      } else {
        toast.error(`Sync failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error(error.message || 'Failed to sync data with EHR system');
    } finally {
      setLoading(false);
    }
  };

  const renderSystemList = () => {
    if (availableSystems.length === 0) {
      return (
        <div className="alert alert-info">
          No EHR systems available for integration.
        </div>
      );
    }

    return (
      <div className="list-group mb-4">
        {availableSystems.map(system => (
          <button
            key={system.id}
            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedSystem && selectedSystem.id === system.id ? 'active' : ''}`}
            onClick={() => handleSystemSelect(system)}
          >
            <div>
              <img 
                src={system.logoUrl || '/images/ehr-default.png'} 
                alt={system.name} 
                className="ehr-logo me-3"
                width="30"
                height="30"
              />
              <span className="fw-bold">{system.name}</span>
            </div>
            {system.status && (
              <span className={`badge ${system.status === 'connected' ? 'bg-success' : 'bg-secondary'}`}>
                {system.status}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderConfigForm = () => {
    if (!selectedSystem) {
      return (
        <div className="alert alert-info">
          Please select an EHR system to configure.
        </div>
      );
    }

    return (
      <form onSubmit={handleConfigSubmit}>
        <h4>{selectedSystem.name} Configuration</h4>
        
        <div className="mb-3">
          <label htmlFor="apiUrl" className="form-label">API URL</label>
          <input
            type="text"
            id="apiUrl"
            name="apiUrl"
            className="form-control"
            value={configForm.apiUrl}
            onChange={handleConfigChange}
            disabled={loading}
            required
          />
          <div className="form-text">The base URL for the {selectedSystem.name} API</div>
        </div>
        
        <div className="mb-3 form-check">
          <input
            type="checkbox"
            id="useOAuth"
            name="useOAuth"
            className="form-check-input"
            checked={configForm.useOAuth}
            onChange={handleConfigChange}
            disabled={loading}
          />
          <label htmlFor="useOAuth" className="form-check-label">Use OAuth Authentication</label>
        </div>
        
        {configForm.useOAuth ? (
          <>
            <div className="mb-3">
              <label htmlFor="clientId" className="form-label">Client ID</label>
              <input
                type="text"
                id="clientId"
                name="clientId"
                className="form-control"
                value={configForm.clientId}
                onChange={handleConfigChange}
                disabled={loading}
                required={configForm.useOAuth}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="clientSecret" className="form-label">Client Secret</label>
              <input
                type="password"
                id="clientSecret"
                name="clientSecret"
                className="form-control"
                value={configForm.clientSecret}
                onChange={handleConfigChange}
                disabled={loading}
                required={configForm.useOAuth}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-3">
              <label htmlFor="apiKey" className="form-label">API Key</label>
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                className="form-control"
                value={configForm.apiKey}
                onChange={handleConfigChange}
                disabled={loading}
                required={!configForm.useOAuth}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username (Optional)</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-control"
                value={configForm.username}
                onChange={handleConfigChange}
                disabled={loading}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password (Optional)</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={configForm.password}
                onChange={handleConfigChange}
                disabled={loading}
              />
            </div>
          </>
        )}
        
        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
          
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleTestConnection}
            disabled={loading || testingConnection}
          >
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </button>
          
          {integrationStatus && integrationStatus.configured && (
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleSyncData}
              disabled={loading}
            >
              Sync Data
            </button>
          )}
        </div>
      </form>
    );
  };

  const renderIntegrationStatus = () => {
    if (!selectedSystem || !integrationStatus) {
      return null;
    }

    return (
      <div className="integration-status mb-4">
        <h4>Integration Status</h4>
        
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className="fw-bold">Status:</span> 
                <span className={`ms-2 badge ${integrationStatus.connected ? 'bg-success' : 'bg-danger'}`}>
                  {integrationStatus.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div>
                <span className="fw-bold">Configured:</span>
                <span className={`ms-2 badge ${integrationStatus.configured ? 'bg-success' : 'bg-warning'}`}>
                  {integrationStatus.configured ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            
            {integrationStatus.lastSync && (
              <div>
                <span className="fw-bold">Last Sync:</span> 
                <span className="ms-2">
                  {new Date(integrationStatus.lastSync).toLocaleString()}
                </span>
              </div>
            )}
            
            {integrationStatus.message && (
              <div className="alert alert-info mt-3">
                {integrationStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSyncHistory = () => {
    if (!selectedSystem || syncHistory.length === 0) {
      return null;
    }

    return (
      <div className="sync-history mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Sync History</h4>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>
        
        {showHistory && (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Records</th>
                  <th>Duration</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {syncHistory.map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${item.success ? 'bg-success' : 'bg-danger'}`}>
                        {item.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td>{item.recordCount || 0}</td>
                    <td>{item.duration ? `${item.duration}s` : 'N/A'}</td>
                    <td>{item.message || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ehr-integration">
      <h2 className="mb-4">EHR System Integration</h2>
      
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Available Systems</h3>
            </div>
            <div className="card-body">
              {loading && availableSystems.length === 0 ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                renderSystemList()
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Configuration</h3>
            </div>
            <div className="card-body">
              {renderIntegrationStatus()}
              {renderConfigForm()}
              {renderSyncHistory()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EHRIntegration;
