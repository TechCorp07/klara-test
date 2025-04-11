"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communication } from '@/lib/services/communicationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

export default function CommunityModeration() {
  const { user } = useAuth();
  const [selectedPost, setSelectedPost] = useState(null);
  const [moderationReason, setModerationReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('reported');
  const queryClient = useQueryClient();
  
  // Check if user has moderation permissions
  const hasModPermissions = user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'moderator');
  
  // Fetch reported posts
  const { data: reportedPosts, isLoading, error } = useQuery({
    queryKey: ['reportedPosts', filterStatus],
    queryFn: () => communication.getReportedCommunityPosts({ status: filterStatus }),
    enabled: !!user && hasModPermissions,
    onError: (error) => {
      toast.error('Failed to load reported posts');
      console.error('Error fetching reported posts:', error);
    }
  });
  
  // Mutation for approving a post
  const approvePostMutation = useMutation({
    mutationFn: (postId) => communication.moderatePost(postId, { action: 'approve' }),
    onSuccess: () => {
      toast.success('Post approved');
      setSelectedPost(null);
      queryClient.invalidateQueries(['reportedPosts']);
    },
    onError: (error) => {
      toast.error('Failed to approve post');
      console.error('Error approving post:', error);
    }
  });
  
  // Mutation for rejecting a post
  const rejectPostMutation = useMutation({
    mutationFn: ({ postId, reason }) => communication.moderatePost(postId, { 
      action: 'reject', 
      reason 
    }),
    onSuccess: () => {
      toast.success('Post rejected');
      setSelectedPost(null);
      setModerationReason('');
      queryClient.invalidateQueries(['reportedPosts']);
    },
    onError: (error) => {
      toast.error('Failed to reject post');
      console.error('Error rejecting post:', error);
    }
  });
  
  const handlePostSelect = (post) => {
    setSelectedPost(post);
  };
  
  const handleApprovePost = () => {
    if (selectedPost) {
      approvePostMutation.mutate(selectedPost.id);
    }
  };
  
  const handleRejectPost = () => {
    if (selectedPost && moderationReason.trim()) {
      rejectPostMutation.mutate({ 
        postId: selectedPost.id, 
        reason: moderationReason.trim() 
      });
    } else {
      toast.error('Please provide a reason for rejection');
    }
  };
  
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setSelectedPost(null);
  };
  
  // Redirect if user doesn't have moderation permissions
  if (!hasModPermissions) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Community Moderation</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Community Moderation</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading reported posts. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Community Moderation</h1>
      
      {/* Filter tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button 
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              filterStatus === 'reported' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleFilterChange('reported')}
          >
            Reported
          </button>
          <button 
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              filterStatus === 'pending' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleFilterChange('pending')}
          >
            Pending Review
          </button>
          <button 
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              filterStatus === 'approved' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleFilterChange('approved')}
          >
            Approved
          </button>
          <button 
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              filterStatus === 'rejected' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleFilterChange('rejected')}
          >
            Rejected
          </button>
        </nav>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Posts List */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Posts
            </h2>
            
            {reportedPosts && reportedPosts.results && reportedPosts.results.length > 0 ? (
              <div className="space-y-4">
                {reportedPosts.results.map((post) => (
                  <div 
                    key={post.id} 
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedPost?.id === post.id 
                        ? 'bg-blue-100 border border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                    onClick={() => handlePostSelect(post)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{post.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        post.report_count > 3 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.report_count} reports
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>{post.author_name}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No {filterStatus} posts found.</p>
            )}
          </div>
        </div>
        
        {/* Post Details and Moderation */}
        <div className="md:col-span-2">
          {selectedPost ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">{selectedPost.title}</h2>
              <div className="flex items-center mb-4">
                <span className="text-sm text-gray-600 mr-4">{selectedPost.author_name}</span>
                <span className="text-sm text-gray-600">{new Date(selectedPost.created_at).toLocaleString()}</span>
              </div>
              
              <div className="prose max-w-none mb-6">
                <p>{selectedPost.content}</p>
              </div>
              
              {/* Report information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-yellow-800 mb-2">Report Information</h3>
                <p className="text-sm text-yellow-800 mb-2">
                  This post has been reported {selectedPost.report_count} times.
                </p>
                <div className="space-y-2">
                  {selectedPost.reports && selectedPost.reports.map((report, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">Reason: {report.reason}</p>
                      <p>Reported by: {report.reporter_name} on {new Date(report.reported_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Moderation actions */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Moderation Actions</h3>
                
                {filterStatus !== 'approved' && filterStatus !== 'rejected' && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="moderationReason" className="block text-sm font-medium text-gray-700 mb-1">
                        Moderation Reason (required for rejection)
                      </label>
                      <textarea
                        id="moderationReason"
                        value={moderationReason}
                        onChange={(e) => setModerationReason(e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Enter reason for moderation action..."
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={handleApprovePost}
                        disabled={approvePostMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg disabled:bg-green-400"
                      >
                        {approvePostMutation.isPending ? 'Approving...' : 'Approve Post'}
                      </button>
                      <button
                        onClick={handleRejectPost}
                        disabled={rejectPostMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg disabled:bg-red-400"
                      >
                        {rejectPostMutation.isPending ? 'Rejecting...' : 'Reject Post'}
                      </button>
                    </div>
                  </>
                )}
                
                {filterStatus === 'approved' && (
                  <div className="bg-green-100 text-green-800 px-4 py-3 rounded">
                    <p>This post has been approved by a moderator.</p>
                  </div>
                )}
                
                {filterStatus === 'rejected' && (
                  <div className="bg-red-100 text-red-800 px-4 py-3 rounded">
                    <p>This post has been rejected by a moderator.</p>
                    {selectedPost.moderation_reason && (
                      <p className="mt-2">Reason: {selectedPost.moderation_reason}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-full">
              <p className="text-gray-500">Select a post to view details and moderate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
