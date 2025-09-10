// src/app/(dashboard)/patient/emergency/contact/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  AlertTriangle, 
  Shield, 
  Users, 
  Clock,
  MapPin,
  Zap,
  Heart,
  Plus,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { patientService } from '@/lib/api/services/patient.service';

interface EmergencyContact {
  id?: number;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary: boolean;
  can_make_decisions: boolean;
}

interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  phone?: string;
  email?: string;
  contact_method: 'phone' | 'email' | 'message';
  is_primary: boolean;
  available_hours: string;
  last_contact: string;
}

export default function EmergencyContactPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertSent, setAlertSent] = useState<string | null>(null);

  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = async () => {
    try {
      setLoading(true);
      
      // Load emergency contacts from profile
      const profileResponse = await patientService.getProfile();
      if (profileResponse.emergency_contact_name) {
        setEmergencyContacts([{
          name: profileResponse.emergency_contact_name,
          relationship: profileResponse.emergency_contact_relationship || 'Emergency Contact',
          phone: profileResponse.emergency_contact_phone || '',
          is_primary: true,
          can_make_decisions: false
        }]);
      }
      
      // Load care team - this would come from your care team API
      // For now using mock data based on your existing structure
      setCareTeam([
        {
          id: '1',
          name: 'Dr. Sarah Johnson',
          role: 'Primary Care Provider',
          specialty: 'Rare Disease Specialist',
          phone: '+1-555-0123',
          email: 'dr.johnson@hospital.com',
          contact_method: 'phone',
          is_primary: true,
          available_hours: '9 AM - 5 PM',
          last_contact: '2025-01-15'
        },
        {
          id: '2', 
          name: 'Nurse Janet Smith',
          role: 'Care Coordinator',
          phone: '+1-555-0124',
          email: 'janet.smith@hospital.com',
          contact_method: 'phone',
          is_primary: false,
          available_hours: '24/7',
          last_contact: '2025-01-14'
        }
      ]);
      
    } catch (error) {
      console.error('Failed to load emergency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyAlert = async (severity: 'urgent' | 'critical') => {
    try {
      setSendingAlert(true);
      
      await patientService.sendEmergencyNotification({
        severity,
        description: severity === 'critical' 
          ? 'Critical health emergency - immediate assistance required'
          : 'Urgent health situation - need medical attention',
        location: 'Patient initiated emergency contact',
      });

      setAlertSent(severity);
      setTimeout(() => setAlertSent(null), 5000);
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      alert('Failed to send emergency alert. Please call emergency services directly.');
    } finally {
      setSendingAlert(false);
    }
  };

  const callNumber = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const sendMessage = (providerId: string) => {
    router.push(`/patient/messages/providers/${providerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading emergency contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-red-500 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Emergency Contacts</h1>
                <p className="text-gray-600">Quick access to your care team and emergency contacts</p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              ← Back
            </button>
          </div>

          {/* Alert Status */}
          {alertSent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-green-600 mr-2" />
                <p className="text-green-800 text-sm">
                  {alertSent === 'critical' ? 'Critical' : 'Urgent'} alert sent successfully! 
                  Your care team has been notified and will respond as soon as possible.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            Emergency Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Call 911 */}
            <button
              onClick={() => callNumber('911')}
              className="w-full bg-red-600 text-white py-4 px-4 rounded-lg hover:bg-red-700 transition-colors flex flex-col items-center text-center"
            >
              <Phone className="w-8 h-8 mb-2" />
              <span className="text-lg font-medium">Call 911</span>
              <span className="text-sm opacity-90">Life-threatening emergency</span>
            </button>

            {/* Critical Alert */}
            <button
              onClick={() => handleEmergencyAlert('critical')}
              disabled={sendingAlert}
              className="w-full bg-red-500 text-white py-4 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex flex-col items-center text-center"
            >
              <AlertTriangle className="w-8 h-8 mb-2" />
              <span className="text-lg font-medium">Critical Alert</span>
              <span className="text-sm opacity-90">
                {sendingAlert ? 'Sending...' : 'Notify care team immediately'}
              </span>
            </button>

            {/* Urgent Alert */}
            <button
              onClick={() => handleEmergencyAlert('urgent')}
              disabled={sendingAlert}
              className="w-full bg-orange-500 text-white py-4 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex flex-col items-center text-center"
            >
              <Heart className="w-8 h-8 mb-2" />
              <span className="text-lg font-medium">Urgent Alert</span>
              <span className="text-sm opacity-90">
                {sendingAlert ? 'Sending...' : 'Need medical attention'}
              </span>
            </button>
          </div>

          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <p>For life-threatening emergencies, always call 911 first. Alert buttons notify your care team but may not provide immediate emergency response.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Care Team */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                Care Team
              </h2>
              <span className="text-sm text-gray-500">{careTeam.length} members</span>
            </div>

            {careTeam.length > 0 ? (
              <div className="space-y-4">
                {careTeam.map((member) => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900 flex items-center">
                          {member.name}
                          {member.is_primary && (
                            <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                              Primary
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        {member.specialty && (
                          <p className="text-xs text-gray-500">{member.specialty}</p>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {member.available_hours}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {member.phone && (
                        <button
                          onClick={() => callNumber(member.phone!)}
                          className="flex items-center bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </button>
                      )}
                      
                      {member.email && (
                        <button
                          onClick={() => sendEmail(member.email!)}
                          className="flex items-center bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </button>
                      )}
                      
                      <button
                        onClick={() => sendMessage(member.id)}
                        className="flex items-center bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Message
                      </button>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Last contact: {new Date(member.last_contact).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No care team members found</p>
              </div>
            )}
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Phone className="w-5 h-5 text-green-600 mr-2" />
                Emergency Contacts
              </h2>
              <button
                onClick={() => router.push('/patient/emergency/update')}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add/Edit
              </button>
            </div>

            {emergencyContacts.length > 0 ? (
              <div className="space-y-4">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900 flex items-center">
                          {contact.name}
                          {contact.is_primary && (
                            <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                              Primary
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{contact.relationship}</p>
                        {contact.can_make_decisions && (
                          <p className="text-xs text-orange-600 font-medium">
                            Authorized for medical decisions
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {contact.phone && (
                        <button
                          onClick={() => callNumber(contact.phone)}
                          className="flex items-center bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          {contact.phone}
                        </button>
                      )}
                      
                      {contact.email && (
                        <button
                          onClick={() => sendEmail(contact.email!)}
                          className="flex items-center bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Phone className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm mb-2">No emergency contacts found</p>
                <button
                  onClick={() => router.push('/patient/emergency/update')}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center mx-auto"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Emergency Contact
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/patient/emergency/update')}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-sm">Update Emergency Info</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => router.push('/patient/appointments/schedule')}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-sm">Schedule Appointment</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <a
              href="tel:911"
              className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm text-red-700">Call 911</span>
              </div>
              <ExternalLink className="w-4 h-4 text-red-600" />
            </a>

            <button
              onClick={() => router.push('/contact')}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-sm">Contact Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}