// src/app/(dashboard)/patient/components/dashboard/MedicationAdherenceWidget.tsx
interface MedicationAdherenceProps {
    medications?: {
      active_medications: Array<{
        id: number;
        name: string;
        dosage: string;
        frequency: string;
        next_dose_time: string;
        adherence_rate?: number;
        supply_days_left?: number;
      }>;
      adherence_summary?: {
        overall_rate: number;
        last_7_days: number;
        missed_doses_today: number;
        on_time_rate: number;
      };
      upcoming_refills?: Array<{
        medication: string;
        days_remaining: number;
        auto_refill_enabled: boolean;
      }>;
    };
    onLogMedication: (medicationId: number) => void;
  }
  
  export function MedicationAdherenceWidget({ medications, onLogMedication }: MedicationAdherenceProps) {
      // Add null safety checks
    if (!medications || !medications.adherence_summary) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Medication Adherence</h3>
            <div className="px-3 py-1 rounded-full text-sm font-medium text-gray-600 bg-gray-50">
              Loading...
            </div>
          </div>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.586V5L8 4z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Medication adherence data will appear here once available</p>
          </div>
        </div>
      );
    }

    const getAdherenceColor = (rate: number) => {
      if (rate >= 90) return 'text-green-600 bg-green-50';
      if (rate >= 75) return 'text-yellow-600 bg-yellow-50';
      return 'text-red-600 bg-red-50';
    };
  
    const getNextDoseUrgency = (nextDoseTime: string) => {
      const now = new Date();
      const nextDose = new Date(nextDoseTime);
      const diffMinutes = (nextDose.getTime() - now.getTime()) / (1000 * 60);
      
      if (diffMinutes < 0) return 'overdue';
      if (diffMinutes < 30) return 'urgent';
      if (diffMinutes < 120) return 'soon';
      return 'later';
    };
  
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Medication Adherence</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAdherenceColor(medications.adherence_summary?.overall_rate || 0)}`}>
            {medications.adherence_summary?.overall_rate || 0}% Overall
          </div>
        </div>
  
      {/* Adherence Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{medications.adherence_summary?.last_7_days || 0}%</div>
          <div className="text-sm text-gray-600">Last 7 Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{medications.adherence_summary?.on_time_rate || 0}%</div>
          <div className="text-sm text-gray-600">On Time</div>
        </div>
      </div>
  
      {/* Missed Doses Alert */}
      {(medications.adherence_summary?.missed_doses_today || 0) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-800 font-medium">
              {medications.adherence_summary.missed_doses_today} missed dose(s) today
            </span>
          </div>
        </div>
      )}
  
        {/* Active Medications */}
        <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Active Medications</h4>
        {medications.active_medications && medications.active_medications.length > 0 ? (
          medications.active_medications.slice(0, 3).map((med) => {
            const urgency = getNextDoseUrgency(med.next_dose_time);
            return (
              <div key={med.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{med.name}</div>
                    <div className="text-sm text-gray-600">{med.dosage} - {med.frequency}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${getAdherenceColor(med.adherence_rate || 0)}`}>
                    {med.adherence_rate || 0}%
                    </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Next dose: {new Date(med.next_dose_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {urgency === 'overdue' && <span className="text-red-600 font-medium ml-1">(Overdue)</span>}
                    {urgency === 'urgent' && <span className="text-orange-600 font-medium ml-1">(Due soon)</span>}
                  </div>
                  <button
                    onClick={() => onLogMedication(med.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Log Taken
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No active medications</p>
          </div>
        )}
        </div>
  
        {/* Upcoming Refills */}
        {medications.upcoming_refills && medications.upcoming_refills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Upcoming Refills</h4>
            {medications.upcoming_refills.map((refill, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{refill.medication}</span>
                <div className="flex items-center space-x-2">
                  <span className={`${refill.days_remaining <= 7 ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                    {refill.days_remaining} days
                  </span>
                  {refill.auto_refill_enabled && (
                    <span className="text-green-600 text-xs">Auto</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }