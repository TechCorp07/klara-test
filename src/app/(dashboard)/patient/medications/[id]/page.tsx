// src/app/(dashboard)/patient/medications/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { usePatientMedications } from '@/hooks/patient/usePatientMedications';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Pill,
  AlertTriangle,
  TrendingUp,
  Shield,
  Edit,
  Bell,
  Download,
  Share2,
  Activity,
  Heart,
  CheckCircle,
  XCircle,
  Timer,
  MapPin,
  Phone,
  Mail,
  FileText,
  Star,
  BarChart3,
  Loader2
} from 'lucide-react';
import type { Prescription } from '@/types/patient.types';

interface MedicationDetail extends Prescription {
  side_effects?: string[];
  interactions?: string[];
  food_restrictions?: string[];
  storage_instructions?: string;
  missed_dose_instructions?: string;
  contraindications?: string[];
}

export default function MedicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const medicationId = Number(params.id);
  const { getUserRole } = useAuth();
  
  const {
    medications,
    loading,
    error,
    getMedicationAdherence,
    getAdherenceHistory,
    markDoseAsTaken,
    markDoseAsSkipped
  } = usePatientMedications();

  const [medication, setMedication] = useState<MedicationDetail | null>(null);
  const [adherenceHistory, setAdherenceHistory] = useState<Array<any>>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'adherence' | 'information'>('overview');
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Role validation
  const userRole = getUserRole();
  useEffect(() => {
    if (userRole && userRole !== 'patient') {
      router.push(`/${userRole}`);
      return;
    }
  }, [userRole, router]);

  // Find medication and load adherence history
  useEffect(() => {
    const med = medications.find(m => m.id === medicationId);
    if (med) {
      setMedication(med as MedicationDetail);
      loadAdherenceHistory();
    }
  }, [medications, medicationId]);

  const loadAdherenceHistory = async () => {
    if (!medicationId) return;
    
    setLoadingHistory(true);
    try {
      const history = await getAdherenceHistory(medicationId, 30);
      setAdherenceHistory(history);
    } catch (error) {
      console.error('Failed to load adherence history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleMarkAsTaken = async (scheduledTime: string) => {
    try {
      await markDoseAsTaken(medicationId, scheduledTime);
      await loadAdherenceHistory(); // Refresh history
    } catch (error) {
      console.error('Failed to mark dose as taken:', error);
    }
  };

  const handleMarkAsSkipped = async (scheduledTime: string, reason: string) => {
    try {
      await markDoseAsSkipped(medicationId, scheduledTime, reason);
      await loadAdherenceHistory(); // Refresh history
    } catch (error) {
      console.error('Failed to mark dose as skipped:', error);
    }
  };

  if (loading) {
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

  if (!medication) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Medication Not Found</h2>
            <p className="text-gray-600 mb-4">The medication you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </Card>
        </div>
      </div>
    );
  }

  const adherenceStats = getMedicationAdherence(medicationId);
  const isRareCondition = medication.reason_for_prescription?.toLowerCase().includes('rare') || false;

  // Calculate recent adherence trend
  const recentAdherence = adherenceHistory.slice(0, 7);
  const recentAdherenceRate = recentAdherence.length > 0 
    ? (recentAdherence.filter(a => a.taken).length / recentAdherence.length) * 100 
    : 0;

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
              <h1 className="text-3xl font-bold text-gray-900">{medication.medication.name}</h1>
              <p className="text-gray-600">{medication.dosage} • {medication.frequency}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Bell className="w-4 h-4 mr-2" />
              Set Reminder
            </button>
          </div>
        </div>

        {/* Status and Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                medication.status === 'active' ? 'bg-green-500' :
                medication.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
              }`} />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-gray-900 capitalize">{medication.status}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(medication.start_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <User className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Prescribed by</p>
                <p className="font-semibold text-gray-900">{medication.prescribed_by.name}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Refills Left</p>
                <p className="font-semibold text-gray-900">{medication.refills_remaining}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Rare Condition Banner */}
        {isRareCondition && (
          <Card className="p-4 bg-purple-50 border-purple-200 mb-8">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-purple-900">Rare Condition Medication</p>
                <p className="text-sm text-purple-700">
                  This medication is prescribed for a rare condition. Please follow all instructions carefully 
                  and contact your healthcare provider if you have any concerns.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: FileText },
                { id: 'schedule', name: 'Schedule', icon: Clock },
                { id: 'adherence', name: 'Adherence', icon: BarChart3 },
                { id: 'information', name: 'Information', icon: AlertTriangle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className={`mr-2 w-5 h-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Medication Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Generic Name</p>
                      <p className="font-medium">{medication.medication.generic_name || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Strength</p>
                      <p className="font-medium">{medication.dosage}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Route</p>
                      <p className="font-medium capitalize">{medication.medication.form || 'Oral'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Quantity</p>
                      <p className="font-medium">{medication.quantity}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
                  <p className="text-gray-700 leading-relaxed">{medication.instructions}</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reason for Prescription</h3>
                  <p className="text-gray-700">{medication.reason_for_prescription}</p>
                </Card>
              </div>
            )}

            {activeTab === 'schedule' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dosing Schedule</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-blue-900">Frequency</p>
                        <p className="text-sm text-blue-700">{medication.frequency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-900">{medication.dosage}</p>
                      <p className="text-sm text-blue-700">per dose</p>
                    </div>
                  </div>
                  
                  {/* Add more scheduling details here */}
                  <div className="text-sm text-gray-600 mt-4">
                    <p className="mb-2"><strong>Best taken:</strong> With food to reduce stomach irritation</p>
                    <p className="mb-2"><strong>Timing:</strong> Try to take at the same time each day</p>
                    <p><strong>Missed dose:</strong> Take as soon as you remember, unless it's almost time for your next dose</p>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'adherence' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Adherence Overview</h3>
                  {adherenceStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{adherenceStats.percentage}%</p>
                        <p className="text-sm text-gray-600">Overall Rate</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{adherenceStats.takenDoses}</p>
                        <p className="text-sm text-gray-600">Doses Taken</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{adherenceStats.missedDoses}</p>
                        <p className="text-sm text-gray-600">Missed Doses</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{adherenceStats.streak}</p>
                        <p className="text-sm text-gray-600">Day Streak</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">7-Day Adherence Rate</p>
                    <div className="flex items-center space-x-2">
                      <div className={`text-lg font-bold ${
                        recentAdherenceRate >= 80 ? 'text-green-600' :
                        recentAdherenceRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round(recentAdherenceRate)}%
                      </div>
                      <div className={`w-4 h-4 ${
                        recentAdherenceRate >= 80 ? 'text-green-600' :
                        recentAdherenceRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {recentAdherenceRate >= 80 ? <TrendingUp /> : 
                         recentAdherenceRate >= 60 ? <Activity /> : <AlertTriangle />}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent History</h3>
                  {loadingHistory ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adherenceHistory.slice(0, 10).map((adherence, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            {adherence.taken ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            
                            <div>
                              <p className="font-medium">
                                {new Date(adherence.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(adherence.scheduled_time).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              adherence.taken ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {adherence.taken ? 'Taken' : 'Missed'}
                            </p>
                            {adherence.taken_time && (
                              <p className="text-xs text-gray-500">
                                at {new Date(adherence.taken_time).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'information' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Common Side Effects</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Nausea or stomach upset</li>
                        <li>• Dizziness or lightheadedness</li>
                        <li>• Fatigue or drowsiness</li>
                        <li>• Headache</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Food Interactions</h4>
                      <p className="text-sm text-gray-700">
                        Take with food to reduce stomach irritation. Avoid alcohol while taking this medication.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Storage</h4>
                      <p className="text-sm text-gray-700">
                        Store at room temperature away from light and moisture. Keep out of reach of children.
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-900 mb-1">Important Warning</h4>
                          <p className="text-sm text-yellow-800">
                            Contact your healthcare provider immediately if you experience severe side effects 
                            or allergic reactions. Do not stop taking this medication without consulting your doctor.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prescribing Provider</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{medication.prescribed_by.name}</p>
                    <p className="text-sm text-gray-600">{medication.prescribed_by.specialty}</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>Contact for questions about this medication</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Pharmacy Information */}
            {medication.pharmacy && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pharmacy</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">{medication.pharmacy.name}</p>
                    <p className="text-sm text-gray-600">{medication.pharmacy.address}</p>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{medication.pharmacy.phone}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/patient/medications/${medicationId}/log`)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Pill className="w-4 h-4 mr-2" />
                  Log Dose
                </button>
                
                <button
                  onClick={() => router.push(`/patient/medications/${medicationId}/reminders`)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Set Reminders
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Print Info
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}