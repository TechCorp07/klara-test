// src/app/(dashboard)/patient/components/dashboard/EmergencyFeaturesWidget.tsx
import React, { useState } from 'react';
import { Phone, AlertTriangle, MapPin, Clock, Users, FileText, Zap } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
}

interface EmergencyInfo {
  medical_id: string;
  allergies: string[];
  current_medications: string[];
  medical_conditions: string[];
  emergency_contacts: EmergencyContact[];
  blood_type: string;
  insurance_info: string;
}

interface EmergencyFeaturesProps {
  emergencyInfo?: EmergencyInfo;
  onUpdateEmergencyInfo?: () => void;
}

export function EmergencyFeaturesWidget({ emergencyInfo, onUpdateEmergencyInfo }: EmergencyFeaturesProps) {
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [showEmergencyInfo, setShowEmergencyInfo] = useState(false);

  const handleEmergencyAlert = async (severity: 'urgent' | 'critical') => {
    try {
      setSendingAlert(true);
      
      // Get current location if available
      let location = '';
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location = `${position.coords.latitude},${position.coords.longitude}`;
        } catch (error) {
          console.error('Geolocation error:', error);
          location = 'Location not available';
        }
      }

      await apiClient.post(ENDPOINTS.PATIENT.EMERGENCY_NOTIFICATION, {
        severity,
        description: severity === 'critical' 
          ? 'Critical health emergency - immediate assistance required'
          : 'Urgent health situation - need medical attention',
        location,
        timestamp: new Date().toISOString()
      });

      setAlertSent(true);
      setTimeout(() => setAlertSent(false), 5000);
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      alert('Failed to send emergency alert. Please call emergency services directly.');
    } finally {
      setSendingAlert(false);
    }
  };

  const callEmergencyServices = () => {
    window.open('tel:911', '_self');
  };

  const callPrimaryContact = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Emergency Features</h3>
        </div>
        <button
          onClick={() => setShowEmergencyInfo(!showEmergencyInfo)}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          {showEmergencyInfo ? 'Hide Info' : 'View Info'}
        </button>
      </div>

      {alertSent && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <Zap className="w-4 h-4 text-green-600 mr-2" />
            <p className="text-green-800 text-sm">
              Emergency alert sent successfully! Your care team has been notified.
            </p>
          </div>
        </div>
      )}

      {/* Emergency Actions */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {/* Call 911 */}
        <button
          onClick={callEmergencyServices}
          className="w-full bg-red-600 text-white py-4 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-lg font-medium"
        >
          <Phone className="w-6 h-6 mr-3" />
          Call 911 - Emergency Services
        </button>
        
        {/* Alert Care Team */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleEmergencyAlert('critical')}
            disabled={sendingAlert}
            className="bg-red-500 text-white py-3 px-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center text-sm"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {sendingAlert ? 'Sending...' : 'Critical Alert'}
          </button>
          
          <button
            onClick={() => handleEmergencyAlert('urgent')}
            disabled={sendingAlert}
            className="bg-orange-500 text-white py-3 px-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center text-sm"
          >
            <Clock className="w-4 h-4 mr-2" />
            {sendingAlert ? 'Sending...' : 'Urgent Alert'}
          </button>
        </div>
      </div>

      {/* Emergency Contacts */}
      {emergencyInfo?.emergency_contacts && emergencyInfo.emergency_contacts.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Emergency Contacts</h4>
          <div className="space-y-2">
            {emergencyInfo.emergency_contacts.slice(0, 2).map((contact, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    {contact.name}
                    {contact.is_primary && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Primary</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">{contact.relationship}</div>
                </div>
                <button
                  onClick={() => callPrimaryContact(contact.phone)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  <Phone className="w-3 h-3 inline mr-1" />
                  Call
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Information (Collapsible) */}
      {showEmergencyInfo && emergencyInfo && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Critical Medical Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Blood Type & Medical ID */}
            <div>
              <div className="mb-2">
                <strong className="text-gray-700">Medical ID:</strong>
                <div className="text-gray-600">{emergencyInfo.medical_id || 'Not provided'}</div>
              </div>
              <div className="mb-2">
                <strong className="text-gray-700">Blood Type:</strong>
                <div className="text-gray-600">{emergencyInfo.blood_type || 'Unknown'}</div>
              </div>
            </div>

            {/* Allergies */}
            <div>
              <strong className="text-gray-700">Allergies:</strong>
              <div className="text-gray-600">
                {emergencyInfo.allergies.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {emergencyInfo.allergies.slice(0, 3).map((allergy, index) => (
                      <li key={index}>{allergy}</li>
                    ))}
                    {emergencyInfo.allergies.length > 3 && (
                      <li>+{emergencyInfo.allergies.length - 3} more...</li>
                    )}
                  </ul>
                ) : (
                  'No known allergies'
                )}
              </div>
            </div>

            {/* Current Medications */}
            <div>
              <strong className="text-gray-700">Current Medications:</strong>
              <div className="text-gray-600">
                {emergencyInfo.current_medications.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {emergencyInfo.current_medications.slice(0, 3).map((medication, index) => (
                      <li key={index}>{medication}</li>
                    ))}
                    {emergencyInfo.current_medications.length > 3 && (
                      <li>+{emergencyInfo.current_medications.length - 3} more...</li>
                    )}
                  </ul>
                ) : (
                  'No current medications'
                )}
              </div>
            </div>

            {/* Medical Conditions */}
            <div>
              <strong className="text-gray-700">Medical Conditions:</strong>
              <div className="text-gray-600">
                {emergencyInfo.medical_conditions.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {emergencyInfo.medical_conditions.slice(0, 3).map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                    {emergencyInfo.medical_conditions.length > 3 && (
                      <li>+{emergencyInfo.medical_conditions.length - 3} more...</li>
                    )}
                  </ul>
                ) : (
                  'No known conditions'
                )}
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          {emergencyInfo.insurance_info && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <strong className="text-gray-700">Insurance:</strong>
              <div className="text-gray-600">{emergencyInfo.insurance_info}</div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onUpdateEmergencyInfo}
            className="flex items-center justify-center text-xs bg-blue-50 text-blue-700 px-2 py-2 rounded hover:bg-blue-100 transition-colors"
          >
            <FileText className="w-3 h-3 mr-1" />
            Update Info
          </button>
          
          <button
            onClick={() => navigator.share?.({ 
              title: 'Emergency Medical Info', 
              text: 'My emergency medical information' 
            })}
            className="flex items-center justify-center text-xs bg-green-50 text-green-700 px-2 py-2 rounded hover:bg-green-100 transition-colors"
          >
            <Users className="w-3 h-3 mr-1" />
            Share Info
          </button>
          
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const url = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
                    window.open(url, '_blank');
                  }
                );
              }
            }}
            className="flex items-center justify-center text-xs bg-purple-50 text-purple-700 px-2 py-2 rounded hover:bg-purple-100 transition-colors"
          >
            <MapPin className="w-3 h-3 mr-1" />
            Location
          </button>
        </div>
      </div>

      {/* Important Notice */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start">
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-yellow-800 text-xs">
            <strong>Important:</strong> This system notifies your care team but does not replace emergency services. 
            For life-threatening emergencies, always call 911 first.
          </div>
        </div>
      </div>
    </div>
  );
}