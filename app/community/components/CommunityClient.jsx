"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

/**
 * Client component for community page
 */
export default function CommunityClient() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [discussions, setDiscussions] = useState([]);
  const [supportGroups, setSupportGroups] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState('discussions');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check if user has given consent for community participation
    const checkConsent = async () => {
      try {
        // This would be replaced with actual API call
        setTimeout(() => {
          // Simulate user has given consent
          setHasConsent(true);
        }, 1000);
      } catch (error) {
        console.error('Error checking consent:', error);
        toast.error('Failed to check community consent status');
      }
    };

    // Fetch community data
    const fetchCommunityData = async () => {
      setLoading(true);
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          setDiscussions([
            {
              id: 1,
              title: 'Managing Hypertension with Diet and Exercise',
              author: {
                id: 101,
                name: 'John D.',
                role: 'patient',
                avatar: null
              },
              created_at: '2023-04-10T14:30:00Z',
              updated_at: '2023-04-10T14:30:00Z',
              content: 'I\'ve been diagnosed with hypertension recently and I\'m looking for advice on dietary changes and exercise routines that have worked for others. My doctor recommended reducing sodium intake and regular cardio, but I\'d love to hear personal experiences.',
              likes: 15,
              comments: 8,
              tags: ['hypertension', 'diet', 'exercise']
            },
            {
              id: 2,
              title: 'New Research on Type 2 Diabetes Treatment',
              author: {
                id: 102,
                name: 'Dr. Sarah Smith',
                role: 'provider',
                avatar: null
              },
              created_at: '2023-04-08T09:15:00Z',
              updated_at: '2023-04-09T11:20:00Z',
              content: 'I wanted to share some promising research on new treatments for Type 2 Diabetes. A recent study published in the Journal of Endocrinology showed significant improvements in glucose control with a combination therapy approach. Has anyone had experience with the newer GLP-1 receptor agonists?',
              likes: 27,
              comments: 12,
              tags: ['diabetes', 'research', 'treatment']
            },
            {
              id: 3,
              title: 'Coping with Chronic Pain - Support Thread',
              author: {
                id: 103,
                name: 'Emily R.',
                role: 'patient',
                avatar: null
              },
              created_at: '2023-04-05T16:45:00Z',
              updated_at: '2023-04-07T10:30:00Z',
              content: 'Living with chronic pain can be isolating and frustrating. I\'ve been dealing with fibromyalgia for 5 years now, and I\'ve found that having a support network makes a huge difference. This thread is for sharing coping strategies, treatment experiences, and just being there for each other. What helps you on your difficult days?',
              likes: 42,
              comments: 23,
              tags: ['chronic pain', 'support', 'fibromyalgia']
            }
          ]);
          
          setSupportGroups([
            {
              id: 1,
              name: 'Diabetes Management',
              description: 'Support group for individuals managing diabetes, sharing experiences, tips, and encouragement.',
              members: 156,
              created_at: '2022-01-15T10:00:00Z',
              category: 'chronic condition',
              is_private: false,
              moderators: [
                {
                  id: 201,
                  name: 'Dr. Michael Johnson',
                  role: 'provider'
                }
              ],
              recent_activity: '2023-04-14T08:30:00Z'
            },
            {
              id: 2,
              name: 'Heart Health Warriors',
              description: 'A community for those with heart conditions to share recovery journeys, lifestyle changes, and support.',
              members: 203,
              created_at: '2022-02-10T14:30:00Z',
              category: 'chronic condition',
              is_private: false,
              moderators: [
                {
                  id: 202,
                  name: 'Dr. Lisa Chen',
                  role: 'provider'
                }
              ],
              recent_activity: '2023-04-15T09:45:00Z'
            },
            {
              id: 3,
              name: 'Mental Health Matters',
              description: 'Safe space for discussing mental health challenges, treatments, and wellness strategies.',
              members: 289,
              created_at: '2022-03-05T11:15:00Z',
              category: 'mental health',
              is_private: false,
              moderators: [
                {
                  id: 203,
                  name: 'Dr. Robert Williams',
                  role: 'provider'
                }
              ],
              recent_activity: '2023-04-15T11:20:00Z'
            },
            {
              id: 4,
              name: 'Rare Disease Alliance',
              description: 'Support network for patients with rare diseases to connect, share resources, and advocate together.',
              members: 98,
              created_at: '2022-04-20T15:45:00Z',
              category: 'rare disease',
              is_private: true,
              moderators: [
                {
                  id: 204,
                  name: 'Dr. Emily Parker',
                  role: 'provider'
                }
              ],
              recent_activity: '2023-04-14T16:30:00Z'
            }
          ]);
          
          setResources([
            {
              id: 1,
              title: 'Understanding Your Medication: A Patient Guide',
              type: 'pdf',
              author: {
                id: 301,
                name: 'Dr. Sarah Smith',
                role: 'provider'
              },
              uploaded_at: '2023-03-10T10:30:00Z',
              description: 'Comprehensive guide to understanding medication labels, potential side effects, and important questions to ask your healthcare provider.',
              downloads: 342,
              tags: ['medication', 'patient education', 'safety']
            },
            {
              id: 2,
              title: 'Healthy Eating for Chronic Conditions',
              type: 'pdf',
              author: {
                id: 302,
                name: 'Dr. Michael Johnson',
                role: 'provider'
              },
              uploaded_at: '2023-02-15T14:45:00Z',
              description: 'Nutritional guidelines and meal planning strategies for managing various chronic health conditions through diet.',
              downloads: 518,
              tags: ['nutrition', 'chronic conditions', 'diet']
            },
            {
              id: 3,
              title: 'Stress Management Techniques',
              type: 'video',
              author: {
                id: 303,
                name: 'Dr. Lisa Chen',
                role: 'provider'
              },
              uploaded_at: '2023-01-20T09:15:00Z',
              description: 'Video series demonstrating effective stress management techniques including deep breathing, progressive muscle relaxation, and mindfulness practices.',
              views: 876,
              duration: '45:30',
              tags: ['stress', 'mental health', 'wellness']
            },
            {
              id: 4,
              title: 'Patient Rights and Healthcare Navigation',
              type: 'pdf',
              author: {
                id: 304,
                name: 'Healthcare Advocacy Group',
                role: 'organization'
              },
              uploaded_at: '2023-03-25T11:00:00Z',
              description: 'Guide to understanding patient rights, navigating insurance, and advocating for yourself in healthcare settings.',
              downloads: 267,
              tags: ['patient rights', 'healthcare system', 'advocacy']
            }
          ]);
          
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching community data:', error);
        toast.error('Failed to load community data');
        setLoading(false);
      }
    };

    checkConsent();
    fetchCommunityData();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleNewPostTitleChange = (e) => {
    setNewPostTitle(e.target.value);
  };

  const handleNewPostContentChange = (e) => {
    setNewPostContent(e.target.value);
  };

  const handleCreatePost = async () => {
    if (!newPostTitle || !newPostContent) {
      toast.warning('Please provide both title and content for your post');
      return;
    }

    setIsSubmitting(true);
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create new post
      const newPost = {
        id: discussions.length + 1,
        title: newPostTitle,
        author: {
          id: user?.id || 999,
          name: user?.name || 'Current User',
          role: user?.role || 'patient',
          avatar: null
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        content: newPostContent,
        likes: 0,
        comments: 0,
        tags: []
      };
      
      setDiscussions([newPost, ...discussions]);
      toast.success('Post created successfully');
      
      // Reset form
      setNewPostTitle('');
      setNewPostContent('');
      handleTabChange('discussions');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update group membership
      setSelectedGroup(groupId);
      toast.success('Successfully joined the group');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadResource = (resourceId) => {
    // This would be replaced with actual download functionality
    toast.info(`Downloading resource ${resourceId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    return formatDate(dateString);
  };

  const filteredDiscussions = searchQuery 
    ? discussions.filter(discussion => 
        discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : discussions;

  const filteredGroups = searchQuery
    ? supportGroups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : supportGroups;

  const filteredResources = searchQuery
    ? resources.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : resources;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Community</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <span className="ml-2 text-gray-600">Loading community data...</span>
        </div>
      </div>
    );
  }

  if (!hasConsent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Community</h1>
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Community Participation Consent</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                To participate in the community, you need to provide consent for sharing your information with other community members. Your privacy is important to us.
              </p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => {
                  // This would be replaced with actual API call
                  setTimeout(() => {
                    setHasConsent(true);
                    toast.success('Community consent provided successfully');
                  }, 1000);
                }}
              >
                Provide Consent
              </button>
              <button
                type="button"
                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => {
                  window.location.href = '/profile/consent';
                }}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Community</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search discussions, groups, or resources..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${
              activeTab === 'discussions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('discussions')}
          >
            Discussions
          </button>
          <button
            className={`${
              activeTab === 'groups'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('groups')}
          >
            Support Groups
          </button>
          <button
            className={`${
              activeTab === 'resources'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('resources')}
          >
            Resources
          </button>
          <button
            className={`${
              activeTab === 'create'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange('create')}
          >
            Create Post
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'discussions' && (
        <div>
          {filteredDiscussions.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">No discussions found</p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => handleTabChange('create')}
                >
                  Start a New Discussion
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredDiscussions.map((discussion) => (
                <div key={discussion.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">{discussion.title}</h3>
                      <div className="flex space-x-2">
                        {discussion.tags && discussion.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                        <span className="text-primary-800 font-medium">
                          {discussion.author.name.charAt(0)}
                        </span>
                      </div>
                      <span>
                        {discussion.author.name} ({discussion.author.role}) • {getRelativeTime(discussion.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <p className="text-gray-700">{discussion.content}</p>
                  </div>
                  <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <div className="flex space-x-4">
                      <button className="inline-flex items-center text-gray-500 hover:text-gray-700">
                        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        {discussion.likes} Likes
                      </button>
                      <button className="inline-flex items-center text-gray-500 hover:text-gray-700">
                        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {discussion.comments} Comments
                      </button>
                    </div>
                    <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      View Discussion
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGroups.length === 0 ? (
            <div className="md:col-span-2 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">No support groups found</p>
              </div>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{group.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {group.category}
                    </span>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {group.members} members • Active {getRelativeTime(group.recent_activity)}
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <p className="text-gray-700">{group.description}</p>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Moderated by:</h4>
                    <ul className="mt-2 space-y-2">
                      {group.moderators.map((moderator) => (
                        <li key={moderator.id} className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-800 font-medium text-xs">
                              {moderator.name.charAt(0)}
                            </span>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            {moderator.name} ({moderator.role})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center items-center px-4 py-2 border ${
                      selectedGroup === group.id
                        ? 'border-transparent text-white bg-green-600 hover:bg-green-700'
                        : 'border-transparent text-white bg-primary-600 hover:bg-primary-700'
                    } text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={selectedGroup === group.id}
                  >
                    {selectedGroup === group.id ? 'Joined' : 'Join Group'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'resources' && (
        <div>
          {filteredResources.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">No resources found</p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Educational Resources</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Helpful materials shared by healthcare providers and organizations.
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
  {filteredResources.map((resource) => (
    <li key={resource.id} className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded bg-primary-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {resource.type === 'pdf' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              )}
            </svg>
          </div>
          <div className="ml-4">
            <h4 className="text-base font-medium text-gray-900">{resource.title}</h4>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <span>
                By {resource.author.name} • {formatDate(resource.uploaded_at)}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={() => handleDownloadResource(resource.id)}
        >
          <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500">{resource.description}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {resource.tags.map((tag) => (
          <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {resource.type === 'pdf' ? (
          <span>{resource.downloads} downloads</span>
        ) : (
          <span>{resource.views} views • {resource.duration} minutes</span>
        )}
      </div>
    </li>
  ))}
</ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Discussion</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Share your thoughts, questions, or experiences with the community.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="post-title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="post-title"
                  id="post-title"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter a descriptive title for your discussion"
                  value={newPostTitle}
                  onChange={handleNewPostTitleChange}
                />
              </div>
              <div>
                <label htmlFor="post-content" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  id="post-content"
                  name="post-content"
                  rows={6}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Share your thoughts, questions, or experiences..."
                  value={newPostContent}
                  onChange={handleNewPostContentChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Community Guidelines
                </label>
                <div className="mt-1 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Be respectful and considerate of others</li>
                    <li>Do not share personal identifying information</li>
                    <li>Avoid medical advice that contradicts professional guidance</li>
                    <li>Focus on support and constructive discussion</li>
                    <li>Report inappropriate content to moderators</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
              onClick={() => {
                setNewPostTitle('');
                setNewPostContent('');
                handleTabChange('discussions');
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreatePost}
              disabled={!newPostTitle || !newPostContent || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Post...
                </>
              ) : (
                'Create Post'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Community Guidelines */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Community Guidelines</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="prose prose-sm max-w-none text-gray-500">
            <p>
              The Community is a safe space for patients, caregivers, and healthcare providers to connect, share experiences, and support each other. To maintain a positive and helpful environment, please follow these guidelines:
            </p>
            <h4 className="text-gray-900 font-medium mt-4">Respect Privacy</h4>
            <p>
              While sharing experiences is encouraged, please respect your own privacy and that of others. Do not share personally identifiable information such as full names, addresses, phone numbers, or other sensitive details.
            </p>
            <h4 className="text-gray-900 font-medium mt-4">Be Supportive and Respectful</h4>
            <p>
              Treat all community members with respect and empathy. Everyone's health journey is unique, and our community thrives when we support each other through challenges and celebrate successes together.
            </p>
            <h4 className="text-gray-900 font-medium mt-4">Medical Information</h4>
            <p>
              Information shared in the community should not replace professional medical advice. Always consult with your healthcare provider before making changes to your treatment plan based on information shared in the community.
            </p>
            <h4 className="text-gray-900 font-medium mt-4">Reporting Concerns</h4>
            <p>
              If you encounter content that violates these guidelines or makes you uncomfortable, please report it to our moderation team. We are committed to maintaining a safe and supportive environment for all members.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
