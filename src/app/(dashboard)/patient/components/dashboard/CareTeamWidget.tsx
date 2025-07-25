// src/app/(dashboard)/patient/components/dashboard/CareTeamWidget.tsx
import React from 'react';
import { Users, Phone, Mail, MessageCircle, Calendar, Video, Heart } from 'lucide-react';

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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getContactIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'message':
      case 'chat':
        return <MessageCircle className="w-4 h-4" />;
      case 'video':
      case 'telemedicine':
        return <Video className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'primary care physician':
      case 'primary doctor':
      case 'pcp':
        return <Heart className="w-4 h-4 text-red-600" />;
      case 'specialist':
      case 'oncologist':
      case 'neurologist':
      case 'cardiologist':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'nurse':
      case 'registered nurse':
      case 'rn':
        return <Heart className="w-4 h-4 text-green-600" />;
      case 'caregiver':
      case 'family caregiver':
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'primary care physician':
      case 'primary doctor':
      case 'pcp':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'specialist':
      case 'oncologist':
      case 'neurologist':
      case 'cardiologist':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'nurse':
      case 'registered nurse':
      case 'rn':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'caregiver':
      case 'family caregiver':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getContactUrgency = (lastContact: string) => {
    const date = new Date(lastContact);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) return 'overdue';
    if (diffDays > 14) return 'due';
    return 'recent';
  };

  const sortedCareTeam = [...careTeam].sort((a, b) => {
    // Sort by role priority (PCP first, then specialists, then caregivers)
    const rolePriority = (role: string) => {
      if (role.toLowerCase().includes('primary')) return 0;
      if (role.toLowerCase().includes('specialist') || role.toLowerCase().includes('oncologist') || role.toLowerCase().includes('neurologist')) return 1;
      if (role.toLowerCase().includes('nurse')) return 2;
      return 3;
    };
    
    return rolePriority(a.role) - rolePriority(b.role);
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Users className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Care Team</h3>
        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {careTeam.length}
        </span>
      </div>

      {careTeam.length > 0 ? (
        <div className="space-y-3">
          {sortedCareTeam.map((member) => {
            const contactUrgency = getContactUrgency(member.last_contact);
            
            return (
              <div key={member.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      {getRoleIcon(member.role)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {member.name}
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getRoleColor(member.role)} mt-1`}>
                        {member.role}
                      </div>
                      {member.specialty && (
                        <div className="text-xs text-gray-600 mt-1">
                          {member.specialty}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onContactProvider(member.id)}
                    className="flex items-center bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    {getContactIcon(member.contact_method)}
                    <span className="ml-1 hidden sm:inline">Contact</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Last contact: {formatDate(member.last_contact)}</span>
                    {contactUrgency === 'overdue' && (
                      <span className="ml-2 bg-red-100 text-red-700 px-2 py-1 rounded">
                        Overdue
                      </span>
                    )}
                    {contactUrgency === 'due' && (
                      <span className="ml-2 bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                        Due Soon
                      </span>
                    )}
                  </div>
                  
                  {member.next_scheduled_contact && (
                    <div className="text-right">
                      <span>Next: {formatDate(member.next_scheduled_contact)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm mb-2">No care team members assigned</p>
          <p className="text-xs text-gray-400">
            Your healthcare providers and caregivers will appear here once they&apos;re connected to your account
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {careTeam.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center text-xs bg-green-50 text-green-700 px-3 py-2 rounded hover:bg-green-100 transition-colors">
              <MessageCircle className="w-3 h-3 mr-1" />
              Emergency Contact
            </button>
            <button className="flex items-center justify-center text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded hover:bg-blue-100 transition-colors">
              <Calendar className="w-3 h-3 mr-1" />
              Schedule Follow-up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}