// src/app/(dashboard)/patient/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useDashboard, usePatientActions, useRealTimeAlerts } from '@/hooks/useDashboard';
import { NotificationProvider, useNotifications, LiveUpdateIndicator } from '@/components/notifications/NotificationProvider';
import { DashboardErrorBoundary, DashboardLoader, NetworkStatus } from '@/components/dashboard/DashboardErrorBoundary';

// Import all dashboard widgets
import { HealthSummaryWidget } from './components/dashboard/HealthSummaryWidget';
import { MedicationAdherenceWidget } from './components/dashboard/MedicationAdherenceWidget';
import { RareDiseaseMonitoringWidget } from './components/dashboard/RareDiseaseMonitoringWidget';
import { AppointmentsWidget } from './components/dashboard/AppointmentsWidget';
import { VitalsWidget } from './components/dashboard/VitalsWidget';
import { SmartWatchDataWidget } from './components/dashboard/SmartWatchDataWidget';
import { ResearchParticipationWidget } from './components/dashboard/ResearchParticipationWidget';
import { CareTeamWidget } from './components/dashboard/CareTeamWidget';
import { HealthAlertsWidget } from './components/dashboard/HealthAlertsWidget';
import { CommunityGroupsWidget } from './components/dashboard/CommunityGroupsWidget';
import { FHIRDataWidget } from './components/dashboard/FHIRDataWidget';
import { TelemedicineWidget } from './components/dashboard/TelemedicineWidget';
import { FamilyHistoryWidget } from './components/dashboard/FamilyHistoryWidget';
import { EmergencyFeaturesWidget } from './components/dashboard/EmergencyFeaturesWidget';
import { QuickActionsWidget } from './components/dashboard/QuickActionsWidget';

import { RefreshCw, Menu, X, Bell, Settings, User } from 'lucide-react';

function PatientDashboardContent() {
  const { user, getUserRole } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addNotification } = useNotifications();
  
  const { alerts: realTimeAlerts, unreadCount } = useRealTimeAlerts();
  // Mobile sidebar state
  const currentTab = searchParams.get('tab') || 'overview';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'health' | 'care' | 'research'>(currentTab as any || 'overview');
  const dashboardInitialized = useRef(false);
  
  // Dashboard data and actions
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshData, 
    isRefreshing 
  } = useDashboard();

  useEffect(() => {
    dashboardInitialized.current = true;
  }, []);

  const {
    actionError, 
    actionSuccess, 
    logMedication, 
    acknowledgeAlert, 
    clearMessages 
  } = usePatientActions();

  // Role validation
  const userRole = getUserRole();
  
  useEffect(() => {
    if (userRole && userRole !== 'patient') {
      router.push(`/${userRole}/dashboard`);
      return;
    }
  }, [userRole, router]);

  useEffect(() => {
  }, [dashboardData, isLoading, error]);

  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    setSelectedView(tab as any);
  }, [searchParams]);
  
  // Handle action notifications
  useEffect(() => {
    if (actionSuccess) {
      addNotification({
        type: 'success',
        title: 'Success',
        message: actionSuccess
      });
      clearMessages();
    }
  }, [actionSuccess, addNotification, clearMessages]);

  const handleTabChange = (tabId: string) => {
    setSelectedView(tabId as any);
    const newUrl = tabId === 'overview' ? '/patient' : `/patient?tab=${tabId}`;
    router.push(newUrl, { scroll: false });
  };

  useEffect(() => {
    if (actionError) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: actionError
      });
      clearMessages();
    }
  }, [actionError, addNotification, clearMessages]);

  // Loading state
  if (isLoading) {
    return <DashboardLoader />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refreshData()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <DashboardLoader />;
  }

  const handleLogMedication = async (medicationId: number) => {
    await logMedication(medicationId, true);
    await refreshData(); // Refresh dashboard after logging medication
  };

  const handleAcknowledgeAlert = async (alertId: number) => {
    await acknowledgeAlert(alertId);
    await refreshData(); // Refresh dashboard after acknowledging alert
  };

  const renderWidgetsByView = () => {
    // Add comprehensive safety checks for all data
    if (!dashboardData) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      );
    }
  
    // Safe data extraction with fallbacks
    const safeAppointments = dashboardData?.appointments || [];
    const safeMedications = dashboardData?.medications || [];
    const safeVitals = dashboardData?.vitals || [];
    const safeAlerts = dashboardData?.alerts || [];
    const safeQuickActions = dashboardData?.quick_actions || [];
    const safeHealthSummary = dashboardData?.health_summary || {};
    const safeResearchData = dashboardData?.research_participation || {};
    const safeWearableData = dashboardData?.wearable_data || {};
    const safeCareTeam = dashboardData?.care_team || [];
    const safePatientInfo = dashboardData?.patient_info || {};
    const safeRareConditions = safePatientInfo?.rare_conditions || [];
  
    switch (selectedView) {
      case 'health':
        return (
          <>
            <HealthSummaryWidget healthSummary={safeHealthSummary} />
            <MedicationAdherenceWidget 
              medications={safeMedications}
              onLogMedication={handleLogMedication}
            />
            <VitalsWidget 
              vitals={safeVitals}
              onRecordVitals={() => router.push('/patient/vitals/record')}
            />
            {safePatientInfo?.has_rare_condition && (
              <RareDiseaseMonitoringWidget 
                rareConditions={safeRareConditions}
                vitals={safeVitals}
              />
            )}
            <FamilyHistoryWidget 
              onAddMember={() => router.push('/patient/family-history/add')}
              onEditMember={(memberId) => router.push(`/patient/family-history/${memberId}/edit`)}
              onViewGenetics={() => router.push('/patient/genetics/analysis')}
            />
            <FHIRDataWidget 
              onRequestImport={() => router.push('/patient/fhir/import')}
            />
          </>
        );
      
      case 'care':
        return (
          <>
            <AppointmentsWidget
              appointments={safeAppointments}
              onScheduleAppointment={() => router.push('/patient/appointments/schedule')}
            />
            <CareTeamWidget 
              careTeam={safeCareTeam}
              onContactProvider={(providerId) => router.push(`/patient/messages/providers/${providerId}`)}
            />
            <TelemedicineWidget 
              onRequestSession={() => router.push('/patient/telemedicine/request')}
            />
            <EmergencyFeaturesWidget 
              emergencyInfo={{
                medical_id: safePatientInfo?.email || 'Not provided',
                allergies: ['Penicillin', 'Shellfish'], // This would come from patient profile
                current_medications: safeMedications?.active_medications?.map((m: any) => `${m.name} ${m.dosage}`) || [],
                medical_conditions: safeRareConditions?.map((c: any) => c.name) || [],
                emergency_contacts: [
                  { name: 'Emergency Contact', relationship: 'Spouse', phone: '555-0123', is_primary: true }
                ],
                blood_type: 'O+',
                insurance_info: 'Health Insurance Inc.'
              }}
              onUpdateEmergencyInfo={() => router.push('/patient/emergency/update')}
            />
          </>
        );
      
      case 'research':
        return (
          <>
            <ResearchParticipationWidget 
              researchData={safeResearchData}
              onJoinStudy={(studyId) => router.push(`/patient/research/studies/${studyId}`)}
            />
            <SmartWatchDataWidget 
              wearableData={safeWearableData}
              onConnectDevice={() => router.push('/patient/devices/connect')}
            />
            <CommunityGroupsWidget 
              onViewGroup={(groupId) => router.push(`/patient/community/groups/${groupId}`)}
            />
            <FHIRDataWidget 
              onRequestImport={() => router.push('/patient/fhir/import')}
            />
          </>
        );
      
      default: // overview
        return (
          <>
            <HealthSummaryWidget healthSummary={safeHealthSummary} />
            <MedicationAdherenceWidget 
              medications={safeMedications}
              onLogMedication={handleLogMedication}
            />
            <AppointmentsWidget
              appointments={safeAppointments}
              onScheduleAppointment={() => router.push('/patient/appointments/schedule')}
            />
            <HealthAlertsWidget 
              alerts={safeAlerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />
            <QuickActionsWidget quickActions={safeQuickActions} />
            <CommunityGroupsWidget 
            />
            {safePatientInfo?.has_rare_condition && (
              <RareDiseaseMonitoringWidget 
                rareConditions={safeRareConditions}
                vitals={safeVitals}
              />
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: '📊', description: 'Quick summary of your health' },
            { id: 'health', label: 'Health & Records', icon: '❤️', description: 'Vitals, medications, family history' },
            { id: 'care', label: 'Care & Communication', icon: '👥', description: 'Providers, appointments, emergency' },
            { id: 'research', label: 'Research & Community', icon: '🔬', description: 'Studies, data sharing, patient groups' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleTabChange(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                selectedView === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start">
                <span className="text-lg mr-3">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-400 hover:text-gray-600 mr-3"
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Welcome back, {dashboardData.patient_info.name.split(' ')[0]}
                  </h1>
                  <p className="text-sm text-gray-600 hidden sm:block">
                    {dashboardData.patient_info.has_rare_condition 
                      ? 'Rare Disease Patient Dashboard' 
                      : 'Patient Health Dashboard'
                    }
                  </p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-3">
                <LiveUpdateIndicator 
                  lastUpdated={lastUpdated} 
                  isUpdating={isRefreshing} 
                />
                
                <button
                  onClick={refreshData}
                  disabled={isRefreshing}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="Refresh dashboard"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile menu */}
                <div className="relative">
                  <button className="flex items-center p-2 text-gray-400 hover:text-gray-600">
                    <User className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop view selector */}
        <div className="hidden lg:block bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 py-4">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'health', label: 'Health & Records' },
                { id: 'care', label: 'Care & Communication' },
                { id: 'research', label: 'Research & Community' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedView === item.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main dashboard content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Critical alerts banner */}
            {dashboardData.alerts.some((alert: any) => alert.severity === 'critical' && !alert.acknowledged) && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Critical Health Alerts Require Attention
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      You have {dashboardData.alerts.filter((alert: any) => alert.severity === 'critical' && !alert.acknowledged).length} critical alerts that need immediate attention.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Widgets grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {renderWidgetsByView()}
            </div>
          </div>
        </main>
      </div>

      {/* Network status indicator */}
      <NetworkStatus />
    </div>
  );
}

export default function PatientDashboardPage() {
  return (
    <DashboardErrorBoundary>
      <NotificationProvider>
        <PatientDashboardContent />
      </NotificationProvider>
    </DashboardErrorBoundary>
  );
}