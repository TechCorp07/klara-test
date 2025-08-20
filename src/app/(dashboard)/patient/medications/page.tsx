// src/app/(dashboard)/patient/medications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { usePatientMedications } from '@/hooks/patient/usePatientMedications';
import { Card } from '@/components/ui/card';
import {
  Pill,
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Bell,
  Eye,
  Download,
  RefreshCw,
  Loader2,
  ChevronDown,
  Heart,
  Activity,
  Shield,
  Timer
} from 'lucide-react';

type MedicationFilter = 'all' | 'active' | 'completed' | 'discontinued' | 'pending';
type StatusFilter = 'all' | 'due_now' | 'overdue' | 'taken_today';

interface MedicationStats {
  total_medications: number;
  active_medications: number;
  due_today: number;
  overdue: number;
  adherence_rate: number;
  streak_days: number;
}

export default function MedicationsPage() {
  const router = useRouter();
  const { user, getUserRole } = useAuth();
  
  // Error boundary states
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [medicationFilter, setMedicationFilter] = useState<MedicationFilter>('active');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<MedicationStats | null>(null);
  const [isComponentMounted, setIsComponentMounted] = useState(false);

  const {
    medications,
    todaySchedule,
    loading,
    error,
    refetch,
    markDoseAsTaken,
    markDoseAsSkipped,
    getMedicationAdherence,
    setStatus,
    setPrescribedBy
  } = usePatientMedications({
    status: medicationFilter === 'all' ? undefined : medicationFilter,
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Role validation
  const userRole = getUserRole();
  useEffect(() => {
    if (userRole && userRole !== 'patient') {
      router.push(`/${userRole}`);
      return;
    }
  }, [userRole, router]);

  // Error boundary reset effect
  useEffect(() => {
    setHasError(false);
    setErrorMessage('');
  }, []);

  useEffect(() => {
    setIsComponentMounted(true);
  }, []);

  // Error handling for hook errors
  useEffect(() => {
    if (error) {
      setHasError(true);
      setErrorMessage(error);
    }
  }, [error]);

  // Calculate stats
  useEffect(() => {
    const medsArray = Array.isArray(medications) ? medications : [];
    const scheduleArray = Array.isArray(todaySchedule) ? todaySchedule : [];
    
    if (medsArray.length > 0 || scheduleArray.length > 0) {
      const activeMeds = medsArray.filter(med => med?.status === 'active');
      const dueToday = scheduleArray.length;
      
      const overdue = scheduleArray.filter(item => {
        if (!item || !Array.isArray(item.adherence_data)) return false;
        return item.adherence_data.some(adherence => 
          !adherence.taken && new Date(adherence.scheduled_time) < new Date()
        );
      }).length;

      // Calculate overall adherence rate
      const totalDoses = scheduleArray.reduce((acc, item) => {
        if (!item || !Array.isArray(item.adherence_data)) return acc;
        return acc + item.adherence_data.length;
      }, 0);
      
      const takenDoses = scheduleArray.reduce((acc, item) => {
        if (!item || !Array.isArray(item.adherence_data)) return acc;
        return acc + item.adherence_data.filter(adherence => adherence.taken).length;
      }, 0);
      
      const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

      setStats({
        total_medications: medsArray.length,
        active_medications: activeMeds.length,
        due_today: dueToday,
        overdue,
        adherence_rate: Math.round(adherenceRate),
        streak_days: 0
      });
    } else {
      // Set default stats when no data
      setStats({
        total_medications: 0,
        active_medications: 0,
        due_today: 0,
        overdue: 0,
        adherence_rate: 0,
        streak_days: 0
      });
    }
  }, [medications, todaySchedule]);

  // Filter medications based on search and filters
  const filteredMedications = React.useMemo(() => {
    const medsArray = Array.isArray(medications) ? medications : [];
    
    return medsArray.filter(medication => {
      // Safety check for medication structure
      if (!medication) return false;
      
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const name = medication.medication?.name || '';
        const dosage = medication.dosage || '';
        const prescriber = medication.prescribed_by?.name || '';
        
        const matchesSearch = 
          name.toLowerCase().includes(searchLower) ||
          dosage.toLowerCase().includes(searchLower) ||
          prescriber.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [medications, searchQuery]);

  // Filter today's schedule based on status
  const filteredTodaySchedule = React.useMemo(() => {
    // Ensure todaySchedule is always an array
    const scheduleArray = Array.isArray(todaySchedule) ? todaySchedule : [];
    
    if (statusFilter === 'all') return scheduleArray;
    
    return scheduleArray.filter(item => {
      // Safety check for item structure
      if (!item || !Array.isArray(item.adherence_data)) return false;
      
      const hasOverdue = item.adherence_data.some(adherence => 
        !adherence.taken && new Date(adherence.scheduled_time) < new Date()
      );
      const hasDueNow = item.adherence_data.some(adherence => {
        const scheduledTime = new Date(adherence.scheduled_time);
        const now = new Date();
        const diffMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60);
        return !adherence.taken && diffMinutes >= -30 && diffMinutes <= 30;
      });
      const hasTakenToday = item.adherence_data.some(adherence => adherence.taken);

      switch (statusFilter) {
        case 'overdue':
          return hasOverdue;
        case 'due_now':
          return hasDueNow;
        case 'taken_today':
          return hasTakenToday;
        default:
          return true;
      }
    });
  }, [todaySchedule, statusFilter]);

  const handleMedicationClick = (medicationId: number) => {
    router.push(`/patient/medications/${medicationId}`);
  };

  const handleMarkAsTaken = async (prescriptionId: number, scheduledTime: string) => {
    try {
      await markDoseAsTaken(prescriptionId, scheduledTime);
    } catch (error) {
      console.error('Failed to mark dose as taken:', error);
    }
  };

  const handleMarkAsSkipped = async (prescriptionId: number, scheduledTime: string, reason: string) => {
    try {
      await markDoseAsSkipped(prescriptionId, scheduledTime, reason);
    } catch (error) {
      console.error('Failed to mark dose as skipped:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh medications:', error);
    }
  };

  // Error boundary render
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {errorMessage || 'We encountered an error loading your medications.'}
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading || todaySchedule === undefined || medications === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading medications...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Medications</h1>
            <p className="text-gray-600">Track and manage your medication regimen</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => router.push('/patient/medications/log')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Medication
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <Pill className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Medications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_medications}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active_medications}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Due Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.due_today}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Adherence Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.adherence_rate}%</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.streak_days} days</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Today's Schedule */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
            
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="due_now">Due Now</option>
                <option value="overdue">Overdue</option>
                <option value="taken_today">Taken</option>
              </select>
            </div>
          </div>
          
          {filteredTodaySchedule.length === 0 ? (
            <div className="text-center py-8">
              <Timer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No medications scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTodaySchedule.map((scheduleItem) => (
                <div key={scheduleItem.prescription.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {scheduleItem.prescription.medication.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {scheduleItem.prescription.dosage} • {scheduleItem.prescription.frequency}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleMedicationClick(scheduleItem.prescription.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Scheduled Times */}
                  <div className="space-y-2">
                    {scheduleItem.adherence_data.map((adherence, index) => {
                      const scheduledTime = new Date(adherence.scheduled_time);
                      const isOverdue = !adherence.taken && scheduledTime < new Date();
                      const isDueNow = !adherence.taken && Math.abs(new Date().getTime() - scheduledTime.getTime()) <= 30 * 60 * 1000;
                      
                      return (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              adherence.taken 
                                ? 'bg-green-500' 
                                : isOverdue 
                                  ? 'bg-red-500' 
                                  : isDueNow 
                                    ? 'bg-yellow-500' 
                                    : 'bg-gray-300'
                            }`} />
                            
                            <span className="text-sm font-medium">
                              {scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            
                            {adherence.taken && (
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                Taken {adherence.taken_time ? new Date(adherence.taken_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            )}
                            
                            {isOverdue && (
                              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                Overdue
                              </span>
                            )}
                            
                            {isDueNow && (
                              <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                Due Now
                              </span>
                            )}
                          </div>
                          
                          {!adherence.taken && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleMarkAsTaken(scheduleItem.prescription.id, adherence.scheduled_time)}
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                              >
                                Mark Taken
                              </button>
                              <button
                                onClick={() => handleMarkAsSkipped(scheduleItem.prescription.id, adherence.scheduled_time, 'Skipped by patient')}
                                className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                              >
                                Skip
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search medications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={medicationFilter}
              onChange={(e) => {
                const newFilter = e.target.value as MedicationFilter;
                setMedicationFilter(newFilter);
                setStatus(newFilter === 'all' ? '' : newFilter);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Medications</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </div>

        {/* Medications List */}
        <div className="space-y-4">
          {loading && (
            <Card className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading medications...</p>
            </Card>
          )}
          
          {!loading && (!filteredMedications || filteredMedications.length === 0) && (
            <Card className="p-8 text-center">
              <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No medications found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search terms or filters.' : 'You don\'t have any medications in this category.'}
              </p>
            </Card>
          )}
          
          {!loading && filteredMedications && filteredMedications.length > 0 && (
            <>
              {filteredMedications
                .filter(medication => {
                  // Filter out any null/undefined items
                  if (!medication || typeof medication !== 'object') {
                    console.warn('Invalid medication data found:', medication);
                    return false;
                  }
                  return true;
                })
                .map((medication, index) => {
                  // Get adherence stats safely
                  const adherenceStats = getMedicationAdherence(medication.id);
                  const isRareCondition = medication.reason_for_prescription?.toLowerCase().includes('rare') || false;

                  return (
                    <Card key={medication.id || `medication-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1" onClick={() => handleMedicationClick(medication.id)}>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {/* Handle different possible data structures */}
                              {medication.medication.name || 
                              medication.medication?.name || 
                              medication.medication.name || 
                              'Unknown Medication'}
                            </h3>
                            {isRareCondition && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                Rare Condition
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            {medication.dosage || 'No dosage specified'} • {medication.frequency || 'No frequency specified'}
                          </p>
                            
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              medication.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : medication.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : medication.status === 'completed'
                                ? 'bg-gray-200 text-gray-800'
                                : medication.status === 'discontinued'
                                ? 'bg-red-100 text-red-800'
                                : medication.status === 'on_hold'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {medication.status || 'Unknown'}
                            </span>
                            
                            {adherenceStats && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                adherenceStats.adherence_rate >= 90 
                                  ? 'bg-green-100 text-green-800'
                                  : adherenceStats.adherence_rate >= 70
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {adherenceStats.adherence_rate}% adherence
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/patient/medications/${medication.id}`);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/patient/medications/${medication.id}/log`);
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Log dose"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Additional info */}
                      <div className="space-y-2 text-sm text-gray-600">
                        {medication.instructions && (
                          <p><strong>Instructions:</strong> {medication.instructions}</p>
                        )}
                        
                        {medication.prescribed_date && (
                          <p><strong>Prescribed:</strong> {new Date(medication.prescribed_date).toLocaleDateString()}</p>
                        )}
                        
                        {medication.medication.pharmacy_name && (
                          <p><strong>Pharmacy:</strong> {medication.medication.pharmacy_name}</p>
                        )}
                      </div>
                    </Card>
                  );
                })}
            </>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Debug Info:</h4>
            <pre className="text-xs text-yellow-700 overflow-auto max-h-40">
              {JSON.stringify({
                medications_length: medications?.length || 0,
                filtered_length: filteredMedications?.length || 0,
                loading,
                error,
                sample_medication: medications?.[0] || 'No medications',
                medications_type: typeof medications,
                is_array: Array.isArray(medications)
              }, null, 2)}
            </pre>
          </Card>
        )}  

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={() => router.push('/patient/medications/analytics')}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </button>
          
          <button
            onClick={() => router.push('/patient/medications/reminders')}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            <Bell className="w-4 h-4 mr-2" />
            Manage Reminders
          </button>
          
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Print List
          </button>
        </div>
      </div>
    </div>
  );
}