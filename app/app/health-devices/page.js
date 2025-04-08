'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { wearables, healthcare } from '../../lib/api';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';
import { format, subDays } from 'date-fns';
import {
  FaHeartbeat,
  FaLink,
  FaUnlink,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaWeight,
  FaRunning,
  FaBed,
  FaPlus,
} from 'react-icons/fa';

// Measurement card component
const MeasurementCard = ({ title, icon: Icon, value, unit, date, trend }) => {
  let trendColor = 'text-gray-500';
  let TrendIcon = null;
  
  if (trend) {
    if (trend === 'up') {
      trendColor = 'text-red-500';
      TrendIcon = () => (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else if (trend === 'down') {
      trendColor = 'text-green-500';
      TrendIcon = () => (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="rounded-full p-3 bg-blue-100 text-blue-500">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">{title}</h3>
        </div>
        
        {trend && TrendIcon && (
          <div className={`flex items-center ${trendColor}`}>
            <TrendIcon />
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex items-end">
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
          {unit && <p className="ml-1 text-xl text-gray-500">{unit}</p>}
        </div>
        
        {date && (
          <p className="mt-1 text-xs text-gray-500">
            Measured on {format(new Date(date), 'MMM d, yyyy')} at {format(new Date(date), 'h:mm a')}
          </p>
        )}
      </div>
    </div>
  );
};

// Device connection card component
const DeviceConnectionCard = ({ connected, onConnect, onSync, onDisconnect, lastSync, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/images/withings-logo.png" 
            alt="Withings" 
            className="h-8 w-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }} 
          />
          <h3 className="ml-3 text-lg font-medium text-gray-900">Withings Health Devices</h3>
        </div>
        
        {connected ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1 h-3 w-3" />
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <FaExclamationTriangle className="mr-1 h-3 w-3" />
            Not Connected
          </span>
        )}
      </div>
      
      <div className="px-6 py-4">
        <p className="text-sm text-gray-600">
          {connected 
            ? 'Your Withings account is connected and syncing data automatically.' 
            : 'Connect your Withings account to automatically sync your health data.'}
        </p>
        
        {connected && lastSync && (
          <p className="mt-1 text-xs text-gray-500">
            Last synced: {format(new Date(lastSync), 'MMMM d, yyyy h:mm a')}
          </p>
        )}
        
        <div className="mt-4 flex space-x-3">
          {connected ? (
            <>
              <button
                onClick={onSync}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </>
                ) : (
                  <>
                    <FaSyncAlt className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </button>
              
              <button
                onClick={onDisconnect}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <FaUnlink className="mr-2 h-4 w-4" />
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={onConnect}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <FaLink className="mr-2 h-4 w-4" />
                  Connect Withings
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700">Supported Devices</h4>
        <ul className="mt-2 text-sm text-gray-600 space-y-1">
          <li>Body+ Scale</li>
          <li>BPM Connect Blood Pressure Monitor</li>
          <li>Sleep Tracking Mat</li>
          <li>ScanWatch</li>
          <li>And other Withings devices</li>
        </ul>
      </div>
    </div>
  );
};

export default function HealthDevicesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [withingsConnected, setWithingsConnected] = useState(false);
  const [withingsProfile, setWithingsProfile] = useState(null);
  const [measurements, setMeasurements] = useState({
    weight: null,
    bloodPressure: null,
    heartRate: null,
    sleep: null,
    steps: null,
  });
  
  // Check if Withings is connected
  useEffect(() => {
    const checkWithingsConnection = async () => {
      try {
        const profile = await wearables.getWithingsProfile();
        setWithingsConnected(!!profile);
        setWithingsProfile(profile);
        
        if (profile) {
          // Automatically fetch recent data
          fetchWithingsData();
        }
      } catch (error) {
        console.error('Error checking Withings connection:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkWithingsConnection();
  }, []);
  
  // Connect Withings
  const handleConnectWithings = async () => {
    setConnecting(true);
    
    try {
      const response = await wearables.connectWithings();
      
      if (response && response.authorize_url) {
        // Redirect to Withings authorization page
        window.location.href = response.authorize_url;
      }
    } catch (error) {
      console.error('Error connecting Withings:', error);
    } finally {
      setConnecting(false);
    }
  };
  
  // Fetch Withings data
  const fetchWithingsData = async () => {
    setSyncing(true);
    
    try {
      // Fetch data for the last 30 days
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');
      
      const response = await wearables.fetchWithingsData(startDate, endDate);
      
      if (response && response.saved_entries_ids && response.saved_entries_ids.length > 0) {
        // Get the actual measurements
        const vitalSigns = await healthcare.getVitalSigns(null, { measurement_ids: response.saved_entries_ids.join(',') });
        
        // Process measurements
        const weightMeasurements = vitalSigns.filter(v => v.measurement_type === 'weight');
        const bpMeasurements = vitalSigns.filter(v => v.measurement_type === 'blood_pressure');
        const hrMeasurements = vitalSigns.filter(v => v.measurement_type === 'heart_rate');
        const sleepMeasurements = vitalSigns.filter(v => v.measurement_type === 'sleep');
        const stepMeasurements = vitalSigns.filter(v => v.measurement_type === 'steps');
        
        setMeasurements({
          weight: weightMeasurements.length > 0 
            ? weightMeasurements.sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at))[0] 
            : null,
          bloodPressure: bpMeasurements.length > 0 
            ? bpMeasurements.sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at))[0] 
            : null,
          heartRate: hrMeasurements.length > 0 
            ? hrMeasurements.sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at))[0] 
            : null,
          sleep: sleepMeasurements.length > 0 
            ? sleepMeasurements.sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at))[0] 
            : null,
          steps: stepMeasurements.length > 0 
            ? stepMeasurements.sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at))[0] 
            : null,
        });
      }
    } catch (error) {
      console.error('Error fetching Withings data:', error);
    } finally {
      setSyncing(false);
    }
  };
  
  // Disconnect Withings
  const handleDisconnectWithings = async () => {
    // This would be implemented if the backend supports it
    console.log('Disconnect Withings clicked');
  };
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Health Devices</h1>
        
        {/* Withings connection */}
        <div className="mb-8">
          <DeviceConnectionCard
            connected={withingsConnected}
            onConnect={handleConnectWithings}
            onSync={fetchWithingsData}
            onDisconnect={handleDisconnectWithings}
            lastSync={withingsProfile?.updated_at}
            loading={loading || connecting || syncing}
          />
        </div>
        
        {/* Measurement data */}
        {withingsConnected && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Measurements</h2>
            
            {Object.values(measurements).every(m => m === null) ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <FaSyncAlt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No measurements found</h3>
                <p className="mt-1 text-gray-500">Sync your Withings devices to see your health data.</p>
                <button
                  onClick={fetchWithingsData}
                  disabled={syncing}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {syncing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <FaSyncAlt className="mr-2 h-4 w-4" />
                      Sync Now
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {measurements.weight && (
                  <MeasurementCard
                    title="Weight"
                    icon={FaWeight}
                    value={measurements.weight.value}
                    unit="kg"
                    date={measurements.weight.measured_at}
                  />
                )}
                
                {measurements.bloodPressure && (
                  <MeasurementCard
                    title="Blood Pressure"
                    icon={FaHeartbeat}
                    value={measurements.bloodPressure.value}
                    unit="mmHg"
                    date={measurements.bloodPressure.measured_at}
                  />
                )}
                
                {measurements.heartRate && (
                  <MeasurementCard
                    title="Heart Rate"
                    icon={FaHeartbeat}
                    value={measurements.heartRate.value}
                    unit="bpm"
                    date={measurements.heartRate.measured_at}
                  />
                )}
                
                {measurements.sleep && (
                  <MeasurementCard
                    title="Sleep Duration"
                    icon={FaBed}
                    value={`${Math.floor(measurements.sleep.value / 60)}h ${measurements.sleep.value % 60}m`}
                    date={measurements.sleep.measured_at}
                  />
                )}
                
                {measurements.steps && (
                  <MeasurementCard
                    title="Daily Steps"
                    icon={FaRunning}
                    value={measurements.steps.value.toLocaleString()}
                    unit="steps"
                    date={measurements.steps.measured_at}
                  />
                )}
              </div>
            )}
          </>
        )}
        
        {/* Connect more devices section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connect More Devices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
              <FaPlus className="h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Coming Soon</h3>
              <p className="mt-1 text-sm text-gray-500">Support for more health devices is coming soon.</p>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
