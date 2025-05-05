import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * WearableDeviceConnection Component
 * Allows patients to connect and manage their wearable devices
 */
const WearableDeviceConnection = ({ userId, onDeviceConnected }) => {
  const [availableDevices, setAvailableDevices] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [syncStatus, setSyncStatus] = useState({});

  // Fetch available and connected devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setIsLoading(true);
        
        // Fetch available devices
        const availableResponse = await fetch('/api/wearables/available-devices', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin'
        });
        
        if (!availableResponse.ok) {
          throw new Error('Failed to fetch available devices');
        }
        
        const availableData = await availableResponse.json();
        setAvailableDevices(availableData.devices || []);
        
        // Fetch connected devices
        const connectedResponse = await fetch(`/api/wearables/user/${userId}/devices`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin'
        });
        
        if (!connectedResponse.ok) {
          throw new Error('Failed to fetch connected devices');
        }
        
        const connectedData = await connectedResponse.json();
        setConnectedDevices(connectedData.devices || []);
        
        // Initialize sync status for connected devices
        const initialSyncStatus = {};
        connectedData.devices.forEach(device => {
          initialSyncStatus[device.id] = {
            lastSync: device.lastSyncTime,
            isSyncing,
            error: null
          };
        });
        setSyncStatus(initialSyncStatus);
        
      } catch (error) {
        console.error('Error fetching devices:', error);
        toast.error('Failed to load devices. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDevices();
  }, [userId]);

  // Connect a device
  const connectDevice = async (deviceType) => {
    try {
      setIsConnecting(true);
      setSelectedDevice(deviceType);
      
      // API call to initiate device connection
      const response = await fetch('/api/wearables/connect-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          deviceType,
          connectionMethod: 'oauth' // or 'direct' depending on device
        }),
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to connect device');
      }
      
      const data = await response.json();
      
      // If OAuth flow is needed, redirect user
      if (data.authUrl) {
        window.location.href = data.authUrl;
        return;
      }
      
      // If direct connection, update the UI
      toast.success(`Successfully connected ${deviceType}`);
      
      // Update connected devices list
      setConnectedDevices(prev => [...prev, data.device]);
      
      // Initialize sync status for the new device
      setSyncStatus(prev => ({
        ...prev,
        [data.device.id]: {
          lastSync: data.device.lastSyncTime || null,
          isSyncing,
          error: null
        }
      }));
      
      // Notify parent component
      if (onDeviceConnected) {
        onDeviceConnected(data.device);
      }
      
    } catch (error) {
      console.error('Error connecting device:', error);
      toast.error(error.message || 'Failed to connect device. Please try again.');
    } finally {
      setIsConnecting(false);
      setSelectedDevice(null);
    }
  };

  // Disconnect a device
  const disconnectDevice = async (deviceId) => {
    try {
      const response = await fetch(`/api/wearables/devices/${deviceId}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to disconnect device');
      }
      
      toast.success('Device disconnected successfully');
      
      // Update connected devices list
      setConnectedDevices(prev => prev.filter(device => device.id !== deviceId));
      
      // Remove from sync status
      setSyncStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[deviceId];
        return newStatus;
      });
      
    } catch (error) {
      console.error('Error disconnecting device:', error);
      toast.error(error.message || 'Failed to disconnect device. Please try again.');
    }
  };

  // Sync data from a device
  const syncDeviceData = async (deviceId) => {
    try {
      // Update sync status to show syncing
      setSyncStatus(prev => ({
        ...prev,
        [deviceId]: {
          ...prev[deviceId],
          isSyncing,
          error: null
        }
      }));
      
      const response = await fetch(`/api/wearables/devices/${deviceId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sync device data');
      }
      
      const data = await response.json();
      
      toast.success('Device data synced successfully');
      
      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        [deviceId]: {
          lastSync: new Date().toISOString(),
          isSyncing,
          error: null
        }
      }));
      
    } catch (error) {
      console.error('Error syncing device data:', error);
      toast.error(error.message || 'Failed to sync device data. Please try again.');
      
      // Update sync status with error
      setSyncStatus(prev => ({
        ...prev,
        [deviceId]: {
          ...prev[deviceId],
          isSyncing,
          error: error.message || 'Sync failed'
        }
      }));
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="wearable-connection loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading devices...</p>
      </div>
    );
  }

  return (
    <div className="wearable-connection">
      <h3>Wearable Devices</h3>
      
      {/* Connected Devices Section */}
      <div className="connected-devices mb-4">
        <h4>Connected Devices</h4>
        
        {connectedDevices.length === 0 ? (
          <p>No devices connected. Connect a device below to sync your health data.</p>
        ) : (
          <div className="row">
            {connectedDevices.map(device => (
              <div key={device.id} className="col-md-6 col-lg-4 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">
                      {device.name}
                      {device.deviceType && (
                        <small className="text-muted ms-2">({device.deviceType})</small>
                      )}
                    </h5>
                    
                    <p className="card-text">
                      <strong>Status:</strong> {device.status || 'Connected'}
                    </p>
                    
                    <p className="card-text">
                      <strong>Last Synced:</strong> {formatDate(syncStatus[device.id]?.lastSync)}
                    </p>
                    
                    {syncStatus[device.id]?.error && (
                      <p className="text-danger">
                        <small>{syncStatus[device.id].error}</small>
                      </p>
                    )}
                    
                    <div className="d-flex justify-content-between mt-3">
                      <button 
                        className="btn btn-primary"
                        onClick={() => syncDeviceData(device.id)}
                        disabled={syncStatus[device.id]?.isSyncing}
                      >
                        {syncStatus[device.id]?.isSyncing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Syncing...
                          </>
                        ) : 'Sync Data'}
                      </button>
                      
                      <button 
                        className="btn btn-outline-danger"
                        onClick={() => disconnectDevice(device.id)}
                        disabled={syncStatus[device.id]?.isSyncing}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Available Devices Section */}
      <div className="available-devices">
        <h4>Connect a New Device</h4>
        
        {availableDevices.length === 0 ? (
          <p>No available devices found.</p>
        ) : (
          <div className="row">
            {availableDevices.map(device => (
              <div key={device.id} className="col-md-6 col-lg-4 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{device.name}</h5>
                    
                    <p className="card-text">
                      {device.description || `Connect your ${device.name} to sync health data.`}
                    </p>
                    
                    <button 
                      className="btn btn-success w-100"
                      onClick={() => connectDevice(device.type)}
                      disabled={isConnecting && selectedDevice === device.type}
                    >
                      {isConnecting && selectedDevice === device.type ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Connecting...
                        </>
                      ) : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WearableDeviceConnection;
