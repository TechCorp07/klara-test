// src/app/(dashboard)/patient/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useDashboard, usePatientActions, useRealTimeAlerts } from '@/hooks/useDashboard';
import { NotificationProvider, useNotifications, LiveUpdateIndicator } from '@/components/notifications/NotificationProvider';
import { DashboardErrorBoundary, DashboardLoader, WidgetError, NetworkStatus } from '@/components/dashboard/DashboardErrorBoundary';

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
import { QuickActionsWidget } from './components/dashboard/QuickActionsWidget';

import { RefreshCw, Menu, X, Bell, Settings, User } from 'lucide-react';

function PatientDashboardContent() {
  const { user, getUserRole, hasPermission } = useAuth();
  const router = useRouter();
  const { addNotification } = useNotifications();
  
  // Dashboard data and actions
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshData, 
    isRefreshing 
  } = useDashboard(5 * 60 * 1000); // Auto-refresh every 5 minutes

  const { 
    isSubmitting, 
    actionError, 
    actionSuccess, 
    logMedication, 
    recordVitals, 
    acknowledgeAlert, 
    requestAppointment, 
    connectDevice,
    clearMessages 
  } = usePatientActions();

  const { alerts: realTimeAlerts, unreadCount } = useRealTimeAlerts();

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'health' | 'care' | 'research'>('overview');

  // Role validation
  const userRole = getUserRole();
  
  useEffect(() => {
    if (userRole && userRole !== 'patient') {
      router.push(`/${userRole}/dashboard`);
      return;
    }
  }, [userRole, router]);

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
  if (isLoading && !dashboardData) {
    return <DashboardLoader />;
  }

  // Error state
  if (error && !dashboardData) {
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
    switch (selectedView) {
      case 'health':
        return (
          <>
            <HealthSummaryWidget healthSummary={dashboardData.health_summary} />
            <MedicationAdherenceWidget 
              medications={dashboardData.medications}
              onLogMedication={handleLogMedication}
            />
            <VitalsWidget 
              vitals={dashboardData.vitals}
              onRecordVitals={() => router.push('/patient/vitals/record')}
            />
            {dashboardData.patient_info.has_rare_condition && (
              <RareDiseaseMonitoringWidget 
                rareConditions={dashboardData.patient_info.rare_conditions}
                vitals={dashboardData.vitals}
              />
            )}
          </>
        );
      
      case 'care':
        return (
          <>
            <AppointmentsWidget
              appointments={dashboardData.appointments}
              onScheduleAppointment={() => router.push('/patient/appointments/schedule')}
            />
            <CareTeamWidget 
              careTeam={dashboardData.care_team}
              onContactProvider={(providerId) => {
                // Handle provider contact
                addNotification({
                  type: 'info',
                  title: 'Contacting Provider',
                  message: 'Connecting you with your care team member'
                });
              }}
            />
            <HealthAlertsWidget 
              alerts={dashboardData.alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />
          </>
        );
      
      case 'research':
        return (
          <>
            <ResearchParticipationWidget 
              researchData={dashboardData.research_participation}
              onJoinStudy={(studyId) => router.push(`/patient/research/studies/${studyId}`)}
            />
            <SmartWatchDataWidget 
              wearableData={dashboardData.wearable_data}
              onConnectDevice={() => router.push('/patient/devices/connect')}
            />
          </>
        );
      
      default: // overview
        return (
          <>
            <HealthSummaryWidget healthSummary={dashboardData.health_summary} />
            <MedicationAdherenceWidget 
              medications={dashboardData.medications}
              onLogMedication={handleLogMedication}
            />
            <AppointmentsWidget
              appointments={dashboardData.appointments}
              onScheduleAppointment={() => router.push('/patient/appointments/schedule')}
            />
            <HealthAlertsWidget 
              alerts={dashboardData.alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />
            <QuickActionsWidget quickActions={dashboardData.quick_actions} />
            {dashboardData.patient_info.has_rare_condition && (
              <RareDiseaseMonitoringWidget 
                rareConditions={dashboardData.patient_info.rare_conditions}
                vitals={dashboardData.vitals}
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
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'health', label: 'Health & Vitals', icon: '❤️' },
            { id: 'care', label: 'Care Team', icon: '👥' },
            { id: 'research', label: 'Research', icon: '🔬' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedView(item.id as typeof selectedView);
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedView === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
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
                { id: 'health', label: 'Health & Vitals' },
                { id: 'care', label: 'Care Team' },
                { id: 'research', label: 'Research' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedView(item.id as typeof selectedView)}
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