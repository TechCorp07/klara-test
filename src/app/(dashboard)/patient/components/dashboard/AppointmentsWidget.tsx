// src/app/(dashboard)/patient/components/dashboard/AppointmentsWidget.tsx
import React from 'react';
import { Calendar, Clock, Video, MapPin, Phone } from 'lucide-react';

interface AppointmentsProps {
  appointments?: {
    upcoming?: Array<{
      id: number;
      date: string;
      time: string;
      provider_name: string;
      provider_specialty: string;
      appointment_type: string;
      is_telemedicine: boolean;
      location?: string;
      preparation_notes?: string;
      can_reschedule: boolean;
      can_cancel: boolean;
    }>;
    recent?: Array<{
      date: string;
      provider: string;
      summary: string;
      follow_up_required: boolean;
    }>;
  };
  onScheduleAppointment: () => void;
}

export function AppointmentsWidget({ appointments, onScheduleAppointment }: AppointmentsProps) {
    // Add null safety check at the beginning
    if (!appointments) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
            </div>
            <button
              onClick={onScheduleAppointment}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Schedule New
            </button>
          </div>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Calendar className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500 text-sm">Loading appointments...</p>
          </div>
        </div>
      );
    }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

    const getAppointmentUrgency = (dateString: string) => {
      const appointmentDate = new Date(dateString);
      const today = new Date();
      const diffDays = Math.ceil((appointmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'today';
      if (diffDays === 1) return 'tomorrow';
      if (diffDays <= 7) return 'this-week';
      return 'later';
    };

    const getUrgencyStyles = (urgency: string) => {
      switch (urgency) {
        case 'today':
          return 'border-l-4 border-l-red-500 bg-red-50';
        case 'tomorrow':
          return 'border-l-4 border-l-orange-500 bg-orange-50';
        case 'this-week':
          return 'border-l-4 border-l-yellow-500 bg-yellow-50';
        default:
          return 'border-l-4 border-l-blue-500 bg-blue-50';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
          </div>
          <button
            onClick={onScheduleAppointment}
            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Schedule New
          </button>
        </div>

      {/* Upcoming Appointments */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Upcoming</h4>
        {appointments.upcoming && appointments.upcoming.length > 0 ? (
          <div className="space-y-3">
            {appointments.upcoming.slice(0, 3).map((appointment) => {
              const urgency = getAppointmentUrgency(appointment.date);
              return (
                <div
                  key={appointment.id}
                  className={`p-3 rounded-lg ${getUrgencyStyles(urgency)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-900">
                        {appointment.provider_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {appointment.provider_specialty}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(appointment.date)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(appointment.time)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    {appointment.is_telemedicine ? (
                      <div className="flex items-center">
                        <Video className="w-4 h-4 mr-1" />
                        <span>Telemedicine</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{appointment.location || 'In-person'}</span>
                      </div>
                    )}
                    <span className="mx-2">•</span>
                    <span className="capitalize">{appointment.appointment_type}</span>
                  </div>

                  {appointment.preparation_notes && (
                    <div className="text-xs text-gray-600 bg-white p-2 rounded border-l-2 border-blue-300">
                      <strong>Preparation:</strong> {appointment.preparation_notes}
                    </div>
                  )}

                  {urgency === 'today' && (
                    <div className="mt-2 flex space-x-2">
                      <button className="flex items-center text-xs bg-green-600 text-white px-2 py-1 rounded">
                        <Phone className="w-3 h-3 mr-1" />
                        Join Call
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No upcoming appointments</p>
            <button
              onClick={onScheduleAppointment}
              className="text-blue-600 hover:text-blue-700 text-sm mt-1"
            >
              Schedule your first appointment
            </button>
          </div>
        )}
      </div>

      {/* Recent Appointments Summary */}
      {appointments.recent && appointments.recent.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recent Visit</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <div className="text-sm font-medium text-gray-900">
                {appointments.recent[0].provider}
              </div>
              <div className="text-xs text-gray-600">
                {formatDate(appointments.recent[0].date)}
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {appointments.recent[0].summary}
            </div>
            {appointments.recent[0].follow_up_required && (
              <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                Follow-up required
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}