'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { telemedicine } from '../../lib/api';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';
import { FaCalendarPlus, FaVideo, FaPhoneAlt, FaUserMd, FaClock, FaExclamationTriangle } from 'react-icons/fa';

// Group appointments by date
const groupAppointmentsByDate = (appointments) => {
  const grouped = {};
  
  appointments.forEach(appointment => {
    const date = format(new Date(appointment.scheduled_time), 'yyyy-MM-dd');
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(appointment);
  });
  
  return Object.entries(grouped)
    .map(([date, apps]) => ({
      date,
      formattedDate: format(new Date(date), 'EEEE, MMMM d, yyyy'),
      appointments: apps.sort(
        (a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time)
      ),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Appointment status badge
const StatusBadge = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  
  switch (status) {
    case 'scheduled':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'confirmed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'in_progress':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'completed':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      break;
    case 'cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status === 'in_progress' ? 'In Progress' : 
        status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Appointment type icon
const AppointmentTypeIcon = ({ type }) => {
  switch (type) {
    case 'video_consultation':
      return <FaVideo className="h-4 w-4 text-blue-600" />;
    case 'phone_consultation':
      return <FaPhoneAlt className="h-4 w-4 text-green-600" />;
    default:
      return <FaUserMd className="h-4 w-4 text-purple-600" />;
  }
};

// Appointment card component
const AppointmentCard = ({ appointment, canJoin, onJoin, onCancel }) => {
  const startTime = new Date(appointment.scheduled_time);
  const endTime = new Date(appointment.end_time);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3">
              <AppointmentTypeIcon type={appointment.appointment_type} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {appointment.appointment_type === 'video_consultation' 
                ? 'Video Consultation' 
                : appointment.appointment_type === 'phone_consultation'
                  ? 'Phone Consultation'
                  : 'In-person Visit'}
            </h3>
          </div>
          <StatusBadge status={appointment.status} />
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            {format(startTime, 'MMMM d, yyyy')}
          </p>
          <p className="text-sm text-gray-500">
            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
          </p>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FaUserMd className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              Dr. {appointment.provider_details.first_name} {appointment.provider_details.last_name}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {appointment.reason}
            </p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <Link 
            href={`/appointments/${appointment.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View details
          </Link>
          
          <div className="flex space-x-3">
            {appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
              <>
                {canJoin && (appointment.appointment_type === 'video_consultation' || 
                             appointment.appointment_type === 'phone_consultation') ? (
                  <button
                    onClick={() => onJoin(appointment)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Join Now
                    <FaVideo className="ml-1 h-3 w-3" />
                  </button>
                ) : (
                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="mr-1 h-3 w-3" />
                    {canJoin ? '5 minutes before' : 'Join opens 5 min before'}
                  </div>
                )}
                
                <button
                  onClick={() => onCancel(appointment)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

// No appointments component
const NoAppointments = () => (
  <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
    <FaCalendarPlus className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-lg font-medium text-gray-900">No upcoming appointments</h3>
    <p className="mt-1 text-sm text-gray-500">Schedule your first appointment with a healthcare provider.</p>
    <div className="mt-6">
      <Link
        href="/appointments/new"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Schedule Appointment
      </Link>
    </div>
  </div>
);

// Main appointments page component
export default function AppointmentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [groupedAppointments, setGroupedAppointments] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await telemedicine.getAppointments({ status: 'scheduled,confirmed,in_progress' });
        setAppointments(data);
        setGroupedAppointments(groupAppointmentsByDate(data));
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);
  
  // Check if an appointment can be joined (within 5 minutes of start time)
  const canJoinAppointment = (appointment) => {
    const now = new Date();
    const startTime = new Date(appointment.scheduled_time);
    const joinWindow = addDays(startTime, 0);
    joinWindow.setMinutes(joinWindow.getMinutes() - 5);
    
    return isAfter(now, joinWindow) && isBefore(now, new Date(appointment.end_time));
  };
  
// Join appointment
const handleJoinAppointment = async (appointment) => {
    try {
      // Get consultations for this appointment
      const consultations = await telemedicine.getConsultationsByAppointment(appointment.id);
      
      if (consultations.length === 0) {
        console.error('No consultation found for this appointment');
        return;
      }
      
      const consultation = consultations[0];
      
      // Get join info
      const joinInfo = await telemedicine.getJoinInfo(consultation.id);
      
      // Open zoom meeting in new tab
      if (joinInfo && joinInfo.zoom_join_url) {
        window.open(joinInfo.zoom_join_url, '_blank');
      } else {
        console.error('No zoom join URL available');
      }
    } catch (error) {
      console.error('Error joining appointment:', error);
    }
  };
  
  // Cancel appointment
  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };
  
  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return;
    
    setCancelLoading(true);
    
    try {
      await telemedicine.cancelAppointment(appointmentToCancel.id, cancelReason);
      
      // Update appointments list
      const updatedAppointments = appointments.filter(a => a.id !== appointmentToCancel.id);
      setAppointments(updatedAppointments);
      setGroupedAppointments(groupAppointmentsByDate(updatedAppointments));
      
      // Close modal
      setShowCancelModal(false);
      setAppointmentToCancel(null);
      setCancelReason('');
    } catch (error) {
      console.error('Error canceling appointment:', error);
    } finally {
      setCancelLoading(false);
    }
  };
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h1>
          <Link
            href="/appointments/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaCalendarPlus className="mr-2 h-4 w-4" />
            Schedule New
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : appointments.length === 0 ? (
          <NoAppointments />
        ) : (
          <div className="space-y-8">
            {groupedAppointments.map((group) => (
              <div key={group.date}>
                <h2 className="text-lg font-medium text-gray-900 mb-4">{group.formattedDate}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {group.appointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      canJoin={canJoinAppointment(appointment)}
                      onJoin={handleJoinAppointment}
                      onCancel={handleCancelClick}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Cancel Appointment Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Appointment</h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to cancel your appointment? This action cannot be undone.
                  </p>
                  
                  {appointmentToCancel && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-gray-700">
                        {format(parseISO(appointmentToCancel.scheduled_time), 'MMMM d, yyyy')} at {format(parseISO(appointmentToCancel.scheduled_time), 'h:mm a')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Dr. {appointmentToCancel.provider_details.first_name} {appointmentToCancel.provider_details.last_name}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for cancellation (optional)
                  </label>
                  <textarea
                    id="cancelReason"
                    rows="3"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelModal(false);
                      setAppointmentToCancel(null);
                      setCancelReason('');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Keep Appointment
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelConfirm}
                    disabled={cancelLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {cancelLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Canceling...
                      </>
                    ) : (
                      'Cancel Appointment'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
