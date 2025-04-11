"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { communication } from '@/lib/services/communicationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function CommunityTopics() {
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  // Fetch community topics
  const { data: topics, isLoading, error } = useQuery({
    queryKey: ['communityTopics'],
    queryFn: () => communication.getCommunityTopics(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load community topics');
      console.error('Error fetching community topics:', error);
    }
  });
  
  // Fetch posts for selected topic
  const { data: topicPosts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['topicPosts', selectedTopic?.id],
    queryFn: () => communication.getCommunityPosts({ topic: selectedTopic?.id }),
    enabled: !!selectedTopic,
    onError: (error) => {
      toast.error('Failed to load topic posts');
      console.error('Error fetching topic posts:', error);
    }
  });
  
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Community Topics</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Community Topics</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading community topics. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6">Community Topics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topics List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Browse Topics</h2>
          
          {topics && topics.results && topics.results.length > 0 ? (
            <div className="space-y-4">
              {topics.results.map((topic) => (
                <div 
                  key={topic.id} 
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedTopic?.id === topic.id 
                      ? 'bg-blue-100 border border-blue-300' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                  onClick={() => handleTopicSelect(topic)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{topic.name}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">
                      {topic.post_count} posts
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {topic.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No topics found.</p>
          )}
        </div>
        
        {/* Topic Posts */}
        <div>
          {selectedTopic ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{selectedTopic.name} Posts</h2>
                <Link 
                  href={`/community?topic=${selectedTopic.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all posts →
                </Link>
              </div>
              
              {isPostsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : topicPosts && topicPosts.results && topicPosts.results.length > 0 ? (
                <div className="space-y-4">
                  {topicPosts.results.slice(0, 5).map((post) => (
                    <Link 
                      key={post.id}
                      href={`/community/post/${post.id}`}
                      className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200"
                    >
                      <h3 className="font-medium">{post.title}</h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <span>{post.author_name}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span className="flex items-center mr-4">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post.comment_count} comments
                        </span>
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          {post.like_count} likes
                        </span>
                      </div>
                    </Link>
                  ))}
                  
                  {topicPosts.results.length > 5 && (
                    <div className="text-center pt-2">
                      <Link 
                        href={`/community?topic=${selectedTopic.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View all {topicPosts.results.length} posts →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No posts found for this topic.</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a topic to view related posts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
