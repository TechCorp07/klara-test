// app/dashboard/page.js
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { healthcare } from '@/lib/services/healthcareService';
import { telemedicine } from '@/lib/services/telemedicineService';
import Link from 'next/link';
import StatsCard from '@/components/dashboard/StatsCard';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import { FaCalendarAlt, FaComments, FaFileMedical, FaPrescriptionBottleAlt } from 'react-icons/fa';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    appointments: 0,
    messages: 0,
    medications: 0
  });

  // Fetch upcoming appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['upcomingAppointments'],
    queryFn: () => telemedicine.getUpcomingAppointments(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load upcoming appointments');
      console.error('Error fetching appointments:', error);
    }
  });

  // Fetch medical records if user is a patient
  const { data: medicalRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ['medicalRecords', user?.id],
    queryFn: () => healthcare.getMedicalRecords(user?.id),
    enabled: !!user && user.role === 'patient',
    onError: (error) => {
      toast.error('Failed to load medical records');
      console.error('Error fetching medical records:', error);
    }
  });

  // Update dashboard stats when data is loaded
  useEffect(() => {
    if (appointments) {
      setStats(prev => ({
        ...prev,
        appointments: appointments.results?.length || 0
      }));
    }
  }, [appointments]);

  // If user has a role-specific dashboard, redirect them
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        router.push('/admin-dashboard');
      } else if (user.role === 'patient') {
        router.push('/patient-dashboard');
      }
      // Keep other roles on the general dashboard
    }
  }, [user, router]);

  if (isLoadingAppointments || isLoadingRecords) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Welcome message */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user?.first_name || 'User'}!</h2>
        <p className="text-gray-600">
          Here's your health summary and upcoming activities.
        </p>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Upcoming Appointments"
          value={stats.appointments}
          link="/appointments"
          linkText="View all appointments →"
          icon={<FaCalendarAlt className="h-6 w-6 text-blue-500" />}
          textColorClass="text-blue-600"
        />
        
        <StatsCard
          title="Pending Messages"
          value={stats.messages}
          link="/messages"
          linkText="View all messages →"
          icon={<FaComments className="h-6 w-6 text-green-500" />}
          textColorClass="text-green-600"
        />
        
        <StatsCard
          title="Medication Reminders"
          value={stats.medications}
          link="/medications"
          linkText="View medications →"
          icon={<FaPrescriptionBottleAlt className="h-6 w-6 text-purple-500" />}
          textColorClass="text-purple-600"
        />
      </div>
      
      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        {appointments && appointments.results && appointments.results.length > 0 ? (
          <div className="space-y-4">
            {appointments.results.slice(0, 3).map((appointment) => (
              <div key={appointment.id} className="border-b pb-4">
                <p className="font-medium">{new Date(appointment.scheduled_time).toLocaleString()}</p>
                <p className="text-gray-600">{appointment.appointment_type} with Dr. {appointment.provider_name}</p>
                <p className="text-sm text-gray-500">{appointment.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent activity to display.</p>
        )}
      </div>
      
      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/appointments/new"
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-4 px-6 rounded-lg text-center transition-colors"
          >
            Schedule Appointment
          </Link>
          <Link
            href="/messages/new"
            className="bg-green-100 hover:bg-green-200 text-green-800 py-4 px-6 rounded-lg text-center transition-colors"
          >
            Send Message
          </Link>
          <Link
            href="/medical-records"
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-4 px-6 rounded-lg text-center transition-colors"
          >
            View Medical Records
          </Link>
          <Link
            href="/health-devices"
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-4 px-6 rounded-lg text-center transition-colors"
          >
            Connect Health Device
          </Link>
        </div>
      </div>
    </div>
  );
}