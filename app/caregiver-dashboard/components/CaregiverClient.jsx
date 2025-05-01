"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { healthcare } from '@/lib/services/healthcareService';
import { telemedicine } from '@/lib/services/telemedicineService';

// Dashboard Components
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import QuickActionButton from '@/components/dashboard/QuickActionButton';
import HIPAABanner from '@/components/ui/HIPAABanner';
import LoadingComponent from '@/components/ui/LoadingComponent';

// Helpers
import { 
  formatDateTime, 
  calculateAge,
  getStatusColorClasses,
  capitalizeFirstLetter
} from '@/utils/helpers';

export default function CaregiverDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Redirect if user is not a caregiver
  useEffect(() => {
    if (user && user.role !== 'caregiver') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Fetch patients under care
  const { data: patients } = useQuery({
    queryKey: ['caregiverPatients'],
    queryFn: () => healthcare.getCaregiverPatients(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load patients');
      console.error('Error fetching patients:', error);
    }
  });
  
  // Fetch upcoming appointments
  const { data: appointments } = useQuery({
    queryKey: ['caregiverAppointments'],
    queryFn: () => telemedicine.getCaregiverAppointments(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load appointments');
      console.error('Error fetching appointments:', error);
    }
  });
  
  // Fetch medication schedules
  const { data: medications } = useQuery({
    queryKey: ['caregiverMedications'],
    queryFn: () => healthcare.getCaregiverMedications(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load medications');
      console.error('Error fetching medications:', error);
    }
  });
  
  // Fetch care tasks
  const { data: careTasks } = useQuery({
    queryKey: ['caregiverTasks'],
    queryFn: () => healthcare.getCaregiverTasks(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load care tasks');
      console.error('Error fetching care tasks:', error);
    }
  });
  
  // Fetch health logs for recent activity
  const { data: healthLogs } = useQuery({
    queryKey: ['caregiverHealthLogs'],
    queryFn: () => healthcare.getCaregiverHealthLogs(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load health logs');
      console.error('Error fetching health logs:', error);
    }
  });

  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ['caregiverNotifications'],
    queryFn: () => healthcare.getCaregiverNotifications(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load notifications');
      console.error('Error fetching notifications:', error);
    }
  });

  useEffect(() => {
    // Set loading to false once all queries are settled
    if (patients && appointments && medications && careTasks && healthLogs && notifications) {
      setLoading(false);
    }
  }, [patients, appointments, medications, careTasks, healthLogs, notifications]);

  if (loading) {
    return <LoadingComponent />;
  }

  // Calculate metrics from data
  const metrics = {
    patientsCount: patients?.total_count || 0,
    appointmentsCount: appointments?.upcoming_count || 0,
    medicationsCount: medications?.today_count || 0,
    tasksCount: careTasks?.pending_count || 0,
    notificationsCount: notifications?.unread_count || 0
  };

  // Render patient item
  const renderPatient = (patient) => (
    <>
      <div className="flex justify-between">
        <p className="font-medium">{patient.first_name} {patient.last_name}</p>
        <span className={`px-2 py-1 text-xs rounded-full ${
          patient.status === 'critical' 
            ? 'bg-red-100 text-red-800' 
            : patient.status === 'stable'
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {capitalizeFirstLetter(patient.status || 'Active')}
        </span>
      </div>
      <p className="text-sm text-gray-600">
        {patient.gender}, {calculateAge(patient.date_of_birth)} years
      </p>
      <p className="text-sm text-gray-600">
        {patient.primary_condition || 'General care'}
      </p>
      <div className="flex justify-end mt-1">
        <Link href={`/caregiver/patients/${patient.id}`} className="text-sm text-blue-600 hover:text-blue-800">
          View Details →
        </Link>
      </div>
    </>
  );

  // Render appointment item
  const renderAppointment = (appointment) => (
    <>
      <div className="flex justify-between">
        <p className="font-medium">{formatDateTime(appointment.scheduled_time)}</p>
        <span className={`px-2 py-1 text-xs rounded-full ${
          appointment.status === 'scheduled' 
            ? 'bg-green-100 text-green-800' 
            : appointment.status === 'completed'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {capitalizeFirstLetter(appointment.status)}
        </span>
      </div>
      <p className="text-sm text-gray-600">Patient: {appointment.patient_name}</p>
      <p className="text-sm text-gray-600">Provider: Dr. {appointment.provider_name} - {appointment.appointment_type}</p>
      <div className="flex justify-end mt-1 space-x-2">
        {appointment.is_virtual && appointment.status === 'scheduled' && (
          <Link href={`/telemedicine/join/${appointment.id}`} className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">
            Join Virtual Visit
          </Link>
        )}
        <Link href={`/caregiver/appointments/${appointment.id}`} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded">
          Details
        </Link>
      </div>
    </>
  );

  // Render medication item
  const renderMedication = (medication) => (
    <>
      <div className="flex justify-between">
        <p className="font-medium">{medication.name} - {medication.dosage}</p>
        <span className={`px-2 py-1 text-xs rounded-full ${
          medication.status === 'due' 
            ? 'bg-red-100 text-red-800' 
            : medication.status === 'upcoming'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {capitalizeFirstLetter(medication.status)}
        </span>
      </div>
      <p className="text-sm text-gray-600">Patient: {medication.patient_name}</p>
      <p className="text-sm text-gray-600">Time: {medication.scheduled_time} - {medication.frequency}</p>
      <div className="flex justify-end mt-1 space-x-2">
        {medication.status === 'due' && (
          <button className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">
            Mark as Given
          </button>
        )}
        <Link href={`/caregiver/medications/${medication.id}`} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded">
          Details
        </Link>
      </div>
    </>
  );

  // Render task item
  const renderTask = (task) => (
    <>
      <div className="flex justify-between">
        <p className="font-medium">{task.title}</p>
        <span className={`px-2 py-1 text-xs rounded-full ${
          task.priority === 'high' 
            ? 'bg-red-100 text-red-800' 
            : task.priority === 'medium'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {capitalizeFirstLetter(task.priority)}
        </span>
      </div>
      <p className="text-sm text-gray-600">Patient: {task.patient_name}</p>
      <p className="text-sm text-gray-600">Due: {formatDateTime(task.due_date)}</p>
      <div className="flex justify-end mt-1 space-x-2">
        <button className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded">
          Mark Complete
        </button>
        {task.recurring && (
          <button className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">
            Reschedule
          </button>
        )}
      </div>
    </>
  );

  // Render health log item
  const renderHealthLog = (log) => (
    <>
      <div className="flex justify-between">
        <p className="font-medium">{log.type}</p>
        <span className="text-xs text-gray-500">{formatDateTime(log.recorded_at)}</span>
      </div>
      <p className="text-sm text-gray-600">Patient: {log.patient_name}</p>
      <p className="text-sm text-gray-600">
        <span className="font-medium">Value:</span> {log.value} {log.unit}
        {log.is_abnormal && (
          <span className="ml-2 text-red-600">• Abnormal</span>
        )}
      </p>
      <div className="flex justify-end mt-1">
        <Link href={`/caregiver/health-logs/${log.id}`} className="text-sm text-blue-600 hover:text-blue-800">
          View Details →
        </Link>
      </div>
    </>
  );

  // Render notification item 
  const renderNotification = (notification) => (
    <>
      <div className="flex justify-between">
        <p className="font-medium">{notification.title}</p>
        <span className="text-xs text-gray-500">{formatDateTime(notification.created_at)}</span>
      </div>
      <p className="text-sm text-gray-600">{notification.message}</p>
      {notification.action_url && (
        <div className="flex justify-end mt-1">
          <Link href={notification.action_url} className="text-sm text-blue-600 hover:text-blue-800">
            {notification.action_text || 'View'} →
          </Link>
        </div>
      )}
    </>
  );

  return (
    <DashboardLayout 
      title="Caregiver Dashboard" 
      subtitle={`Welcome back, ${user?.first_name || 'Caregiver'}!`}
      role="caregiver"
    >
      <HIPAABanner />
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatsCard 
          title="Patients Under Care" 
          value={metrics.patientsCount} 
          icon="users" 
          trend="neutral"
          linkTo="/caregiver/patients"
        />
        <StatsCard 
          title="Upcoming Appointments" 
          value={metrics.appointmentsCount} 
          icon="calendar" 
          trend="up"
          linkTo="/caregiver/appointments"
        />
        <StatsCard 
          title="Medication Reminders" 
          value={metrics.medicationsCount} 
          icon="pills" 
          trend="neutral"
          linkTo="/caregiver/medications"
        />
        <StatsCard 
          title="Pending Tasks" 
          value={metrics.tasksCount} 
          icon="tasks" 
          trend="up"
          linkTo="/caregiver/tasks"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Patients Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Patients Under Care</h2>
              <Link href="/caregiver/patients" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
            </div>
            
            {patients && patients.results && patients.results.length > 0 ? (
              <div className="space-y-4">
                {patients.results.slice(0, 4).map((patient, index) => (
                  <div key={patient.id || index} className="border-b pb-3">
                    {renderPatient(patient)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No patients under your care.</p>
            )}
          </div>
          
          {/* Tasks Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Today's Tasks</h2>
              <Link href="/caregiver/tasks" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
            </div>
            
            {careTasks && careTasks.results && careTasks.results.length > 0 ? (
              <div className="space-y-4">
                {careTasks.results.filter(task => task.due_today).slice(0, 4).map((task, index) => (
                  <div key={task.id || index} className="border-b pb-3">
                    {renderTask(task)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No tasks scheduled for today.</p>
            )}
          </div>
          
          {/* Medications Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Medication Schedule</h2>
              <Link href="/caregiver/medications" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
            </div>
            
            {medications && medications.results && medications.results.length > 0 ? (
              <div className="space-y-4">
                {medications.results.slice(0, 4).map((medication, index) => (
                  <div key={medication.id || index} className="border-b pb-3">
                    {renderMedication(medication)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No medications scheduled.</p>
            )}
          </div>
        </div>
        
        <div>
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickActionButton 
                label="Add Task" 
                icon="task-list" 
                href="/caregiver/tasks/new" 
              />
              <QuickActionButton 
                label="Schedule Appointment" 
                icon="calendar-plus" 
                href="/caregiver/appointments/schedule" 
              />
              <QuickActionButton 
                label="Log Health Data" 
                icon="heart-pulse" 
                href="/caregiver/health-log/new" 
              />
              <QuickActionButton 
                label="Message Provider" 
                icon="comment-medical" 
                href="/messages/new" 
              />
              <QuickActionButton 
                label="View Care Plan" 
                icon="notes-medical" 
                href="/caregiver/care-plans" 
              />
            </div>
          </div>
          
          {/* Appointments Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
              <Link href="/caregiver/appointments" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
            </div>
            
            {appointments && appointments.results && appointments.results.length > 0 ? (
              <div className="space-y-4">
                {appointments.results.slice(0, 3).map((appointment, index) => (
                  <div key={appointment.id || index} className="border-b pb-3">
                    {renderAppointment(appointment)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No upcoming appointments.</p>
            )}
          </div>
          
          {/* Health Logs Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Health Logs</h2>
              <Link href="/caregiver/health-logs" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
            </div>
            
            {healthLogs && healthLogs.results && healthLogs.results.length > 0 ? (
              <div className="space-y-4">
                {healthLogs.results.slice(0, 3).map((log, index) => (
                  <div key={log.id || index} className="border-b pb-3">
                    {renderHealthLog(log)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent health logs.</p>
            )}
          </div>
          
          {/* Notifications Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <Link href="/caregiver/notifications" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
            </div>
            
            {notifications && notifications.results && notifications.results.length > 0 ? (
              <div className="space-y-4">
                {notifications.results.slice(0, 3).map((notification, index) => (
                  <div key={notification.id || index} className="border-b pb-3">
                    {renderNotification(notification)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No new notifications.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Resources and Support */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Caregiver Resources</h2>
          <Link href="/resources/caregiver" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Care Guides</h3>
            <p className="text-sm text-gray-600 mb-2">
              Access guides for providing care for different conditions.
            </p>
            <Link href="/resources/caregiver/guides" className="text-blue-600 hover:text-blue-800 text-sm">
              View guides →
            </Link>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Support Groups</h3>
            <p className="text-sm text-gray-600 mb-2">
              Connect with other caregivers for support and advice.
            </p>
            <Link href="/community/topics/caregiver-support" className="text-blue-600 hover:text-blue-800 text-sm">
              Join groups →
            </Link>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Self-Care Resources</h3>
            <p className="text-sm text-gray-600 mb-2">
              Resources to help caregivers maintain their own health.
            </p>
            <Link href="/resources/caregiver/self-care" className="text-blue-600 hover:text-blue-800 text-sm">
              View resources →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}