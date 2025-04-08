'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { telemedicine, healthcare, wearables } from '../../lib/api';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';
import {
  FaCalendarAlt,
  FaCapsules,
  FaComments,
  FaFileAlt,
  FaHeartbeat,
  FaExclamationTriangle,
} from 'react-icons/fa';

// Dashboard stat item component
const StatItem = ({ icon: Icon, title, value, href, color }) => {
  return (
    <Link 
      href={href} 
      className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow ${color ? `border-l-4 border-${color}-500` : ''}`}
    >
      <div className="flex items-center">
        <div className={`rounded-full p-3 ${color ? `bg-${color}-100 text-${color}-500` : 'bg-blue-100 text-blue-500'}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </Link>
  );
};

// Dashboard overview component
const DashboardOverview = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    activePrescriptions: 0,
    unreadMessages: 0,
    pendingLabResults: 0,
    allergies: 0,
    withingsConnected: false,
  });
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch upcoming appointments
        const appointmentsData = await telemedicine.getUpcomingAppointments();
        setAppointments(appointmentsData);
        setStats(prev => ({ ...prev, upcomingAppointments: appointmentsData.length }));
        
        // Fetch medical record
        const medicalRecords = await healthcare.getMedicalRecords(user.id);
        
        if (medicalRecords.length > 0) {
          const medicalRecordId = medicalRecords[0].id;
          
          // Fetch medications
          const medicationsData = await healthcare.getMedications(medicalRecordId);
          setMedications(medicationsData.filter(med => med.active));
          setStats(prev => ({ 
            ...prev, 
            activePrescriptions: medicationsData.filter(med => med.active).length 
          }));
          
          // Fetch allergies
          const allergiesData = await healthcare.getAllergies(medicalRecordId);
          setStats(prev => ({ ...prev, allergies: allergiesData.length }));
          
          // Fetch lab tests
          const labTestsData = await healthcare.getLabTests(medicalRecordId);
          const pendingTests = labTestsData.filter(test => test.status === 'pending');
          setStats(prev => ({ ...prev, pendingLabResults: pendingTests.length }));
        }
        
        // Check if Withings is connected
        const withingsProfile = await wearables.getWithingsProfile();
        setStats(prev => ({ ...prev, withingsConnected: !!withingsProfile }));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user.id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatItem 
          icon={FaCalendarAlt} 
          title="Upcoming Appointments"
          value={stats.upcomingAppointments}
          href="/appointments"
          color="blue"
        />
        <StatItem 
          icon={FaCapsules} 
          title="Active Medications"
          value={stats.activePrescriptions}
          href="/medical-records/medications"
          color="green"
        />
        <StatItem 
          icon={FaFileAlt} 
          title="Pending Lab Results"
          value={stats.pendingLabResults}
          href="/medical-records/lab-results"
          color="purple"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming appointments */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No upcoming appointments
              </div>
            ) : (
              appointments.slice(0, 3).map((appointment) => (
                <Link 
                  key={appointment.id} 
                  href={`/appointments/${appointment.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">
                          {format(new Date(appointment.scheduled_time), 'MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(appointment.scheduled_time), 'h:mm a')} - 
                          {format(new Date(appointment.end_time), 'h:mm a')}
                        </p>
                        <p className="mt-1 text-sm text-gray-900">{appointment.reason}</p>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium 
                          ${appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' : 
                            appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Dr. {appointment.provider_details.first_name} {appointment.provider_details.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.appointment_type_display || appointment.appointment_type}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
            {appointments.length > 0 && (
              <div className="px-6 py-4 bg-gray-50">
                <Link 
                  href="/appointments" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all appointments
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Active Medications */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Active Medications</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {medications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No active medications
              </div>
            ) : (
              medications.slice(0, 3).map((medication) => (
                <div key={medication.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{medication.name}</p>
                      <p className="text-sm text-gray-500">{medication.dosage}</p>
                    </div>
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {medication.frequency}
                    </p>
                    {medication.reason && (
                      <p className="text-sm text-gray-500">
                        For: {medication.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            {medications.length > 0 && (
              <div className="px-6 py-4 bg-gray-50">
                <Link 
                  href="/medical-records/medications" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all medications
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Health device connection */}
      {!stats.withingsConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Connect your health devices to automatically track your health data.
              </p>
              <div className="mt-2">
                <Link
                  href="/health-devices"
                  className="text-sm font-medium text-yellow-700 hover:text-yellow-600"
                >
                  Connect a device &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard page component
export default function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Welcome back, {user.first_name}!
        </h1>
        
        {/* Render dashboard based on user role */}
        {user.role === 'patient' && <DashboardOverview user={user} />}
        {user.role === 'provider' && <ProviderDashboard user={user} />}
        {user.role === 'pharmco' && <PharmacyDashboard user={user} />}
        {user.role === 'insurer' && <InsurerDashboard user={user} />}
        {user.role === 'admin' && <AdminDashboard user={user} />}
      </div>
    </AuthenticatedLayout>
  );
}

// Placeholder components for other roles
function ProviderDashboard({ user }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Provider Dashboard</h2>
      <p className="text-gray-600">Provider-specific dashboard content would go here.</p>
    </div>
  );
}

function PharmacyDashboard({ user }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pharmacy Dashboard</h2>
      <p className="text-gray-600">Pharmacy-specific dashboard content would go here.</p>
    </div>
  );
}

function InsurerDashboard({ user }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Insurer Dashboard</h2>
      <p className="text-gray-600">Insurer-specific dashboard content would go here.</p>
    </div>
  );
}

function AdminDashboard({ user }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
      <p className="text-gray-600">Admin-specific dashboard content would go here.</p>
    </div>
  );
}
