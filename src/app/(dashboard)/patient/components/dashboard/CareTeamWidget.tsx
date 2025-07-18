// src/app/(dashboard)/patient/components/dashboard/CareTeamWidget.tsx
interface CareTeamProps {
    careTeam: Array<{
      id: number;
      name: string;
      role: string;
      specialty?: string;
      contact_method: string;
      last_contact: string;
      next_scheduled_contact?: string;
    }>;
    onContactProvider: (providerId: number) => void;
  }
  
  export function CareTeamWidget({ careTeam, onContactProvider }: CareTeamProps) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Team</h3>
  
        {careTeam.length > 0 ? (
          <div className="space-y-3">
            {careTeam.map((member) => (
              <div key={member.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-600">
                      {member.role}
                      {member.specialty && ` • ${member.specialty}`}
                    </div>
                  </div>
                  <button
                    onClick={() => onContactProvider(member.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Contact
                  </button>
                </div>
                
                <div className="text-xs text-gray-500">
                  Last contact: {new Date(member.last_contact).toLocaleDateString()}
                  {member.next_scheduled_contact && (
                    <span className="block">
                      Next: {new Date(member.next_scheduled_contact).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>No care team members assigned</p>
          </div>
        )}
      </div>
    );
  }  