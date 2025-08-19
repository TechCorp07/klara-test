// src/app/(dashboard)/patient/medications/reminders/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { usePatientMedications } from '@/hooks/patient/usePatientMedications';
import { patientService } from '@/lib/api/services/patient.service';
import { Card } from '@/components/ui/card';
import { FormButton, FormAlert } from '@/components/ui/common';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Clock,
  Smartphone,
  Mail,
  MessageSquare,
  Watch,
  Plus,
  Edit,
  Trash2,
  Settings,
  Save,
  Calendar,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import type { Prescription } from '@/types/patient.types';

interface ReminderPreferences {
  enabled: boolean;
  methods: ('email' | 'sms' | 'push' | 'smartwatch')[];
  frequency: 'immediate' | '15min' | '30min' | '1hour';
  quiet_hours?: { start: string; end: string };
  sound_enabled: boolean;
  vibration_enabled: boolean;
}

interface MedicationReminder {
  id: number;
  medication_id: number;
  medication_name: string;
  reminder_times: string[];
  enabled: boolean;
  methods: string[];
  custom_message?: string;
  snooze_duration: number;
  advance_notice: number;
}

export default function MedicationRemindersPage() {
  const router = useRouter();
  const { getUserRole } = useAuth();
  
  const { medications, loading: medicationsLoading } = usePatientMedications();
  
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    enabled: true,
    methods: ['push', 'email'],
    frequency: '15min',
    quiet_hours: { start: '22:00', end: '07:00' },
    sound_enabled: true,
    vibration_enabled: true
  });
  
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingReminder, setEditingReminder] = useState<number | null>(null);

  // Role validation
  const userRole = getUserRole();
  useEffect(() => {
    if (userRole && userRole !== 'patient') {
      router.push(`/${userRole}`);
      return;
    }
  }, [userRole, router]);

  // Load reminder preferences and existing reminders
  useEffect(() => {
    if (medications.length > 0) {
      loadRemindersData();
    }
  }, [medications]);

  const loadRemindersData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockReminders: MedicationReminder[] = medications
        .filter(med => med.status === 'active')
        .map(med => ({
          id: med.id,
          medication_id: med.id,
          medication_name: med.medication.name,
          reminder_times: ['08:00', '20:00'], // Default twice daily
          enabled: true,
          methods: ['push', 'email'],
          snooze_duration: 15,
          advance_notice: 5
        }));
      
      setReminders(mockReminders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setError(null);
    
    try {
      await patientService.updateMedicationReminders(preferences);
      setSuccessMessage('Reminder preferences updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleReminder = async (reminderId: number) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === reminderId
        ? { ...reminder, enabled: !reminder.enabled }
        : reminder
    );
    setReminders(updatedReminders);
    
    // Save to backend
    try {
      // Mock API call - replace with actual implementation
      console.log('Toggling reminder:', reminderId);
    } catch (err) {
      setError('Failed to update reminder');
    }
  };

  const handleUpdateReminderTimes = (reminderId: number, times: string[]) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === reminderId
        ? { ...reminder, reminder_times: times }
        : reminder
    );
    setReminders(updatedReminders);
  };

  const handleAddReminderTime = (reminderId: number) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (reminder) {
      const newTime = '12:00'; // Default time
      handleUpdateReminderTimes(reminderId, [...reminder.reminder_times, newTime]);
    }
  };

  const handleRemoveReminderTime = (reminderId: number, timeIndex: number) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (reminder) {
      const newTimes = reminder.reminder_times.filter((_, index) => index !== timeIndex);
      handleUpdateReminderTimes(reminderId, newTimes);
    }
  };

  const handleUpdateReminderTime = (reminderId: number, timeIndex: number, newTime: string) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (reminder) {
      const newTimes = reminder.reminder_times.map((time, index) =>
        index === timeIndex ? newTime : time
      );
      handleUpdateReminderTimes(reminderId, newTimes);
    }
  };

  const testReminder = async () => {
    try {
      // Mock test notification
      setSuccessMessage('Test reminder sent! Check your notifications.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to send test reminder');
    }
  };

  if (loading || medicationsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Medication Reminders</h1>
              <p className="text-gray-600">Set up notifications to never miss a dose</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={testReminder}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <Zap className="w-4 h-4 mr-2" />
              Test Reminder
            </button>
            
            <FormButton
              onClick={handleSavePreferences}
              isLoading={saving}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save All
            </FormButton>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <FormAlert type="success" message={successMessage} dismissible onDismiss={() => setSuccessMessage(null)} />
        )}

        {error && (
          <FormAlert type="error" message={error} dismissible onDismiss={() => setError(null)} />
        )}

        {/* Global Preferences */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Global Reminder Settings</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Notification Methods */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Methods</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.methods.includes('push')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferences(prev => ({ ...prev, methods: [...prev.methods, 'push'] }));
                      } else {
                        setPreferences(prev => ({ ...prev, methods: prev.methods.filter(m => m !== 'push') }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Smartphone className="w-5 h-5 text-blue-600 ml-3 mr-2" />
                  <span className="text-gray-700">Push Notifications</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.methods.includes('email')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferences(prev => ({ ...prev, methods: [...prev.methods, 'email'] }));
                      } else {
                        setPreferences(prev => ({ ...prev, methods: prev.methods.filter(m => m !== 'email') }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Mail className="w-5 h-5 text-green-600 ml-3 mr-2" />
                  <span className="text-gray-700">Email</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.methods.includes('sms')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferences(prev => ({ ...prev, methods: [...prev.methods, 'sms'] }));
                      } else {
                        setPreferences(prev => ({ ...prev, methods: prev.methods.filter(m => m !== 'sms') }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <MessageSquare className="w-5 h-5 text-purple-600 ml-3 mr-2" />
                  <span className="text-gray-700">SMS Text</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.methods.includes('smartwatch')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferences(prev => ({ ...prev, methods: [...prev.methods, 'smartwatch'] }));
                      } else {
                        setPreferences(prev => ({ ...prev, methods: prev.methods.filter(m => m !== 'smartwatch') }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Watch className="w-5 h-5 text-orange-600 ml-3 mr-2" />
                  <span className="text-gray-700">Smart Watch</span>
                </label>
              </div>
            </div>

            {/* Timing and Sound Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Timing & Sound</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Frequency
                  </label>
                  <select
                    value={preferences.frequency}
                    onChange={(e) => setPreferences(prev => ({ ...prev, frequency: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="immediate">Immediate only</option>
                    <option value="15min">Every 15 minutes</option>
                    <option value="30min">Every 30 minutes</option>
                    <option value="1hour">Every hour</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quiet Hours Start
                    </label>
                    <input
                      type="time"
                      value={preferences.quiet_hours?.start || '22:00'}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        quiet_hours: { ...prev.quiet_hours!, start: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quiet Hours End
                    </label>
                    <input
                      type="time"
                      value={preferences.quiet_hours?.end || '07:00'}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        quiet_hours: { ...prev.quiet_hours!, end: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.sound_enabled}
                      onChange={(e) => setPreferences(prev => ({ ...prev, sound_enabled: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {preferences.sound_enabled ? (
                      <Volume2 className="w-5 h-5 text-blue-600 ml-3 mr-2" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-gray-400 ml-3 mr-2" />
                    )}
                    <span className="text-gray-700">Sound notifications</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.vibration_enabled}
                      onChange={(e) => setPreferences(prev => ({ ...prev, vibration_enabled: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Smartphone className="w-5 h-5 text-purple-600 ml-3 mr-2" />
                    <span className="text-gray-700">Vibration</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Individual Medication Reminders */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Medication Reminders</h2>
          
          {reminders.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Medications</h3>
              <p className="text-gray-600">You don't have any active medications that need reminders.</p>
            </Card>
          ) : (
            reminders.map((reminder) => (
              <Card key={reminder.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleReminder(reminder.id)}
                      className={`p-2 rounded-full ${
                        reminder.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {reminder.enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </button>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{reminder.medication_name}</h3>
                      <p className="text-sm text-gray-600">
                        {reminder.reminder_times.length} reminder{reminder.reminder_times.length !== 1 ? 's' : ''} per day
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setEditingReminder(editingReminder === reminder.id ? null : reminder.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>

                {/* Reminder Times */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Reminder Times</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {reminder.reminder_times.map((time, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => handleUpdateReminderTime(reminder.id, index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                          disabled={!reminder.enabled}
                        />
                        {reminder.reminder_times.length > 1 && (
                          <button
                            onClick={() => handleRemoveReminderTime(reminder.id, index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={!reminder.enabled}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      onClick={() => handleAddReminderTime(reminder.id)}
                      disabled={!reminder.enabled}
                      className="flex items-center justify-center space-x-2 border border-dashed border-gray-300 rounded px-3 py-2 text-sm text-gray-600 hover:border-gray-400 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Time</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Settings */}
                {editingReminder === reminder.id && (
                  <div className="mt-6 pt-6 border-t space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Message (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Take with food"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        defaultValue={reminder.custom_message}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Snooze Duration (minutes)
                        </label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option value="5">5 minutes</option>
                          <option value="10">10 minutes</option>
                          <option value="15" selected>15 minutes</option>
                          <option value="30">30 minutes</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Advance Notice (minutes)
                        </label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option value="0">No advance notice</option>
                          <option value="5" selected>5 minutes</option>
                          <option value="10">10 minutes</option>
                          <option value="15">15 minutes</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Smart Watch Integration */}
        <Card className="p-6 mt-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Watch className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Watch Integration</h3>
              <p className="text-gray-600 mb-4">
                Connect your smart watch to receive gentle vibration reminders directly on your wrist. 
                Perfect for discrete medication reminders throughout the day.
              </p>
              
              <div className="flex items-center space-x-4">
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Connect Device
                </button>
                
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>Compatible with Apple Watch, Samsung Galaxy Watch, and Fitbit</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Important Notes for Rare Disease Patients */}
        <Card className="p-6 bg-purple-50 border-purple-200">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-purple-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Important for Rare Disease Medications</h3>
              <div className="text-sm text-purple-800 space-y-2">
                <p>• Consistency is crucial for rare disease treatments - never skip doses without consulting your healthcare provider</p>
                <p>• Set multiple reminder methods for critical medications to ensure you never miss a dose</p>
                <p>• Consider setting up caregiver notifications for emergency situations</p>
                <p>• Keep emergency contact information readily available in case of severe side effects</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}