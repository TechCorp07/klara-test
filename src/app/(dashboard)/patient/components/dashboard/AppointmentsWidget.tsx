// src/app/(dashboard)/patient/components/dashboard/AppointmentsWidget.tsx
interface AppointmentsProps {
    appointments: {
      upcoming: Array<{
        id: number;
        date: string;
        time: string;
        provider_name: string;
        appointment_type: string;
        location: string;
        is_telemedicine: boolean;
        preparation_notes?: string;
      }>;
      recent: Array<{
        date: string;
        provider: string;
        summary: string;
        follow_up_required: boolean;
      }>;
    };
    onScheduleAppointment: () => void;
  }
  
  export function AppointmentsWidget({ appointments, onScheduleAppointment }: AppointmentsProps) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
          <button
            onClick={onScheduleAppointment}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Schedule
          </button>
        </div>
  
        {/* Upcoming Appointments */}
        {appointments.upcoming.length > 0 ? (
          <div className="space-y-3 mb-6">
            <h4 className="font-medium text-gray-900">Upcoming</h4>
            {appointments.upcoming.slice(0, 3).map((apt) => (
              <div key={apt.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{apt.provider_name}</div>
                    <div className="text-sm text-gray-600">{apt.appointment_type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {new Date(apt.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">{apt.time}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {apt.is_telemedicine ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        Telemedicine
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600">{apt.location}</span>
                    )}
                  </div>
                </div>
                
                {apt.preparation_notes && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Preparation:</strong> {apt.preparation_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mb-4">No upcoming appointments</p>
            <button
              onClick={onScheduleAppointment}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Schedule Your First Appointment
            </button>
          </div>
        )}
  
        {/* Recent Appointments */}
        {appointments.recent.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Recent</h4>
            {appointments.recent.slice(0, 2).map((apt, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium">{apt.provider}</div>
                    <div className="text-sm text-gray-600">{apt.summary}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(apt.date).toLocaleDateString()}
                  </div>
                </div>
                {apt.follow_up_required && (
                  <div className="mt-1 text-xs text-orange-600 font-medium">
                    Follow-up required
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }