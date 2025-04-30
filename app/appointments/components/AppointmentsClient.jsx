"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { telemedicine } from '@/lib/services/telemedicineService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

/**
 * Enhanced Appointments Client component with:
 * - Appointment filtering (upcoming, completed, canceled, all)
 * - Interactive appointment selection and detailed view
 * - Appointment management actions (reschedule, cancel, join)
 */
export default function AppointmentsClient() {
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('upcoming');
  const queryClient = useQueryClient();
  
  // Fetch appointments based on selected filter
  const { 
    data: appointments, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['appointments', filterStatus],
    queryFn: () => telemedicine.getAppointments({ status: filterStatus }),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load appointments');
      console.error('Error fetching appointments:', error);
    }
  });
  
  // Mutation for canceling an appointment
  const cancelAppointmentMutation = useMutation({
    mutationFn: ({ id, reason }) => telemedicine.cancelAppointment(id, reason),
    onSuccess: () => {
      toast.success('Appointment canceled successfully');
      queryClient.invalidateQueries(['appointments']);
      setSelectedAppointment(null);
    },
    onError: (error) => {
      toast.error('Failed to cancel appointment');
      console.error('Error canceling appointment:', error);
    }
  });
  
  // Handler for selecting an appointment to view details
  const handleAppointmentSelect = (appointment) => {
    setSelectedAppointment(appointment);
  };
  
  // Handler for canceling an appointment
  const handleCancelAppointment = (reason) => {
    if (selectedAppointment) {
      cancelAppointmentMutation.mutate({ 
        id: selectedAppointment.id, 
        reason 
      });
    }
  };
  
  // Handler for changing the filter view
  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Appointments</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Appointments</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading appointments. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          onClick={() => window.location.href = '/appointments/new'}
        >
          Schedule New Appointment
        </button>
      </div>
      
      {/* Filter tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button 
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              filterStatus === 'upcoming' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleFilterChange('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              filterStatus === 'completed' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleFilterChange('completed')}
          >
            Completed
          </button>
          <button 
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              filterStatus === 'canceled' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleFilterChange('canceled')}
          >
            Canceled
          </button>
          <button 
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              filterStatus === 'all' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleFilterChange('all')}
          >
            All
          </button>
        </nav>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Appointments List */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Appointments
            </h2>
            
            {appointments && appointments.results && appointments.results.length > 0 ? (
              <div className="space-y-4">
                {appointments.results.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedAppointment?.id === appointment.id 
                        ? 'bg-blue-100 border border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                    onClick={() => handleAppointmentSelect(appointment)}
                  >
                    <p className="font-medium">
                      {new Date(appointment.scheduled_time).toLocaleDateString()} at {' '}
                      {new Date(appointment.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.appointment_type}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: <span className={`
                        ${appointment.status === 'scheduled' ? 'text-green-600' : ''}
                        ${appointment.status === 'completed' ? 'text-blue-600' : ''}
                        ${appointment.status === 'canceled' ? 'text-red-600' : ''}
                      `}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No appointments found.</p>
            )}
          </div>
        </div>
        
        {/* Appointment Details */}
        <div className="md:col-span-2">
          {selectedAppointment ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Appointment Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600">Date & Time</p>
                  <p className="font-medium">
                    {new Date(selectedAppointment.scheduled_time).toLocaleDateString()} at {' '}
                    {new Date(selectedAppointment.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-medium">{selectedAppointment.duration_minutes} minutes</p>
                </div>
                <div>
                  <p className="text-gray-600">Type</p>
                  <p className="font-medium">{selectedAppointment.appointment_type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className={`font-medium
                    ${selectedAppointment.status === 'scheduled' ? 'text-green-600' : ''}
                    ${selectedAppointment.status === 'completed' ? 'text-blue-600' : ''}
                    ${selectedAppointment.status === 'canceled' ? 'text-red-600' : ''}
                  `}>
                    {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Provider</p>
                  <p className="font-medium">Dr. {selectedAppointment.provider_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Location</p>
                  <p className="font-medium">{selectedAppointment.appointment_type === 'video_consultation' ? 'Telemedicine (Video)' : 'In-person'}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600">Reason for Visit</p>
                <p className="font-medium">{selectedAppointment.reason}</p>
              </div>
              
              {selectedAppointment.notes && (
                <div className="mb-6">
                  <p className="text-gray-600">Notes</p>
                  <p className="font-medium">{selectedAppointment.notes}</p>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex space-x-4">
                {selectedAppointment.status === 'scheduled' && (
                  <>
                    {selectedAppointment.appointment_type === 'video_consultation' && (
                      <button 
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                        onClick={() => window.location.href = `/appointments/${selectedAppointment.id}/join`}
                      >
                        Join Appointment
                      </button>
                    )}
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                      onClick={() => window.location.href = `/appointments/${selectedAppointment.id}/edit`}
                    >
                      Reschedule
                    </button>
                    <button 
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                      onClick={() => handleCancelAppointment('Patient requested cancellation')}
                    >
                      Cancel
                    </button>
                  </>
                )}
                
                {selectedAppointment.status === 'completed' && (
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                    onClick={() => window.location.href = `/appointments/${selectedAppointment.id}/summary`}
                  >
                    View Summary
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-full">
              <p className="text-gray-500">Select an appointment to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
