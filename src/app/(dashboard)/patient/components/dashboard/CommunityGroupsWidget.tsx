// src/app/(dashboard)/patient/components/dashboard/CommunityGroupsWidget.tsx
import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Lock, Globe, ChevronRight, Plus, Crown } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

interface CommunityGroup {
  id: number;
  name: string;
  description: string;
  group_type: 'support' | 'discussion' | 'research' | 'education' | 'social';
  is_private: boolean;
  member_count: number;
  post_count: number;
  condition_name?: string;
  is_condition_specific: boolean;
  has_medical_professional: boolean;
  is_member: boolean;
  last_activity?: string;
  unread_messages?: number;
}

interface PaginatedCommunityGroupsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CommunityGroup[];
}

interface CommunityGroupsProps {
  onJoinGroup?: (groupId: number) => void;
  onViewGroup?: (groupId: number) => void;
}

export function CommunityGroupsWidget({ onJoinGroup, onViewGroup }: CommunityGroupsProps) {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunityGroups();
  }, []);

  const fetchCommunityGroups = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<PaginatedCommunityGroupsResponse | CommunityGroup[]>('/community/groups/');
      
      const data = response.data;
      
      if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as PaginatedCommunityGroupsResponse).results)) {
        setGroups((data as PaginatedCommunityGroupsResponse).results);
      } else if (Array.isArray(data)) {
        setGroups(data);
      } else {
        console.warn('Unexpected response format:', data);
        setGroups([]);
      }
    } catch (err) {
      setError('Failed to load community groups');
      console.error('Error fetching community groups:', err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      await apiClient.post(`/community/groups/${groupId}/join/`);
      // Update the group status locally
      setGroups(prev => 
        prev.map(group => 
          group.id === groupId 
            ? { ...group, is_member: true, member_count: group.member_count + 1 }
            : group
        )
      );
      onJoinGroup?.(groupId);
    } catch (err) {
      console.error('Error joining group:', err);
    }
  };

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'support':
        return 'bg-green-100 text-green-800';
      case 'discussion':
        return 'bg-blue-100 text-blue-800';
      case 'research':
        return 'bg-purple-100 text-purple-800';
      case 'education':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case 'support':
        return '🤝';
      case 'discussion':
        return '💬';
      case 'research':
        return '🔬';
      case 'education':
        return '📚';
      case 'social':
        return '👥';
      default:
        return '💭';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-5 w-32 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Users className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Community Groups</h3>
        </div>
        <button 
          onClick={() => onViewGroup?.(0)}
          className="text-purple-600 hover:text-purple-700 text-sm"
        >
          View All
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No community groups available</p>
          <p className="text-xs text-gray-400 mt-1">
            Connect with other patients sharing similar conditions
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Array.isArray(groups) ? groups.slice(0, 4).map((group) => (
            <div
              key={group.id}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">{getGroupTypeIcon(group.group_type)}</span>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {group.name}
                    </h4>
                    {group.is_private ? (
                      <Lock className="w-3 h-3 text-gray-400 ml-1" />
                    ) : (
                      <Globe className="w-3 h-3 text-gray-400 ml-1" />
                    )}
                    {group.has_medical_professional && (
                      <Crown className="w-3 h-3 text-yellow-500 ml-1" aria-label="Medical professional moderator" />
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {group.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs ${getGroupTypeColor(group.group_type)}`}>
                        {group.group_type}
                      </span>
                      <span>{group.member_count} members</span>
                      <span>{group.post_count} posts</span>
                    </div>

                    {group.is_member ? (
                      <button
                        onClick={() => onViewGroup?.(group.id)}
                        className="flex items-center text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        View
                        {group.unread_messages && group.unread_messages > 0 && (
                          <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {group.unread_messages}
                          </span>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className="flex items-center text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Join
                      </button>
                    )}
                  </div>

                  {group.condition_name && (
                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Condition: {group.condition_name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : null}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewGroup?.(0)}
            className="flex items-center justify-center text-xs bg-purple-50 text-purple-700 px-3 py-2 rounded hover:bg-purple-100 transition-colors"
          >
            <Users className="w-3 h-3 mr-1" />
            Browse All Groups
          </button>
          <button className="flex items-center justify-center text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded hover:bg-blue-100 transition-colors">
            <MessageCircle className="w-3 h-3 mr-1" />
            My Messages
          </button>
        </div>
      </div>
    </div>
  );
}