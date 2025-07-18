import { enhancedPatientService } from "@/lib/api/services/patient.service";
import { useState } from "react";

// src/app/(dashboard)/patient/components/EmergencyAssistance.tsx
export function EmergencyAssistance() {
    const [isEmergency, setIsEmergency] = useState(false);
    const [emergencyType, setEmergencyType] = useState<'medical' | 'medication' | 'mental_health'>('medical');
    const [emergencyMessage, setEmergencyMessage] = useState('');
  
    const handleEmergencyNotification = async () => {
      if (!emergencyMessage.trim()) {
        alert('Please describe your emergency situation.');
        return;
      }
  
      try {
        setIsEmergency(true);
        
        const result = await enhancedPatientService.triggerEmergencyNotification(
          emergencyType,
          emergencyMessage
        );
  
        alert(`Emergency notification sent. ID: ${result.notification_id}`);
        setEmergencyMessage('');
        
      } catch (error) {
        console.error('Emergency notification failed:', error);
        alert('Failed to send emergency notification. Please call 911 if this is a life-threatening emergency.');
      } finally {
        setIsEmergency(false);
      }
    };
  
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <svg className="w-8 h-8 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-xl font-bold text-red-900">Emergency Assistance</h3>
        </div>
  
        <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
          <div className="text-center">
            <p className="text-red-800 font-medium mb-2">
              ⚠️ For Life-Threatening Emergencies: Call 911 Immediately
            </p>
            <p className="text-sm text-red-700">
              Use this form for urgent but non-life-threatening situations related to your rare disease management.
            </p>
          </div>
        </div>
  
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-red-800 mb-2">
              Emergency Type
            </label>
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value as any)}
              className="block w-full border-red-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="medical">Medical Emergency</option>
              <option value="medication">Medication-Related Issue</option>
              <option value="mental_health">Mental Health Crisis</option>
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-red-800 mb-2">
              Describe Your Situation
            </label>
            <textarea
              value={emergencyMessage}
              onChange={(e) => setEmergencyMessage(e.target.value)}
              rows={4}
              className="block w-full border-red-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder="Please describe what's happening and any symptoms you're experiencing..."
            />
          </div>
  
          <button
            onClick={handleEmergencyNotification}
            disabled={isEmergency || !emergencyMessage.trim()}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isEmergency ? 'Sending Emergency Notification...' : 'Send Emergency Notification'}
          </button>
  
          <div className="text-xs text-red-700">
            <p className="font-medium mb-1">Who will be notified:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your primary care physician</li>
              <li>Emergency contacts on file</li>
              <li>Rare disease specialist (if applicable)</li>
              <li>Our 24/7 medical support team</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }