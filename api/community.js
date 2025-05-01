// api/community.js
import { apiRequest } from './client';

/**
 * Community API service
 * Handles community features like forums, discussions, and user interactions
 */
const communityAPI = {
  /**
   * Get all forums
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of forums
   */
  getForums: (params = {}) => 
    apiRequest('GET', '/api/community/forums', null, {
      params,
      errorMessage: 'Failed to fetch forums'
    }),
  
  /**
   * Get forum details
   * @param {string} forumId - Forum ID
   * @returns {Promise<Object>} Forum details
   */
  getForum: (forumId) => 
    apiRequest('GET', `/api/community/forums/${forumId}`.replace('${forumId}', forumId), null, {
      errorMessage: 'Failed to fetch forum details'
    }),
  
  /**
   * Get forum topics
   * @param {string} forumId - Forum ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of topics
   */
  getForumTopics: (forumId, params = {}) => 
    apiRequest('GET', `/api/community/topics`, null, {
      params: { ...params, forumId },
      errorMessage: 'Failed to fetch forum topics'
    }),
  
  /**
   * Create a new topic
   * @param {string} forumId - Forum ID
   * @param {Object} topicData - Topic data
   * @returns {Promise<Object>} Created topic
   */
  createTopic: (forumId, topicData) => 
    apiRequest('POST', `/api/community/topics`, { ...topicData, forumId }, {
      errorMessage: 'Failed to create topic',
      successMessage: 'Topic created successfully'
    }),
  
  /**
   * Get topic details
   * @param {string} topicId - Topic ID
   * @returns {Promise<Object>} Topic details
   */
  getTopic: (topicId) => 
    apiRequest('GET', `/api/community/topics/${topicId}`.replace('${topicId}', topicId), null, {
      errorMessage: 'Failed to fetch topic details'
    }),
  
  /**
   * Update a topic
   * @param {string} topicId - Topic ID
   * @param {Object} topicData - Updated topic data
   * @returns {Promise<Object>} Updated topic
   */
  updateTopic: (topicId, topicData) => 
    apiRequest('PUT', `/api/community/topics/${topicId}`.replace('${topicId}', topicId), topicData, {
      errorMessage: 'Failed to update topic',
      successMessage: 'Topic updated successfully'
    }),
  
  /**
   * Delete a topic
   * @param {string} topicId - Topic ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteTopic: (topicId) => 
    apiRequest('DELETE', `/api/community/topics/${topicId}`.replace('${topicId}', topicId), null, {
      errorMessage: 'Failed to delete topic',
      successMessage: 'Topic deleted successfully'
    }),
  
  /**
   * Get topic posts
   * @param {string} topicId - Topic ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of posts
   */
  getTopicPosts: (topicId, params = {}) => 
    apiRequest('GET', `/api/community/posts`, null, {
      params: { ...params, topicId },
      errorMessage: 'Failed to fetch topic posts'
    }),
  
  /**
   * Create a new post
   * @param {string} topicId - Topic ID
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Created post
   */
  createPost: (topicId, postData) => 
    apiRequest('POST', `/api/community/posts`, { ...postData, topicId }, {
      errorMessage: 'Failed to create post',
      successMessage: 'Post created successfully'
    }),
  
  /**
   * Update a post
   * @param {string} postId - Post ID
   * @param {Object} postData - Updated post data
   * @returns {Promise<Object>} Updated post
   */
  updatePost: (postId, postData) => 
    apiRequest('PUT', `/api/community/posts/${postId}`.replace('${postId}', postId), postData, {
      errorMessage: 'Failed to update post',
      successMessage: 'Post updated successfully'
    }),
  
  /**
   * Delete a post
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} Deletion response
   */
  deletePost: (postId) => 
    apiRequest('DELETE', `/api/community/posts/${postId}`.replace('${postId}', postId), null, {
      errorMessage: 'Failed to delete post',
      successMessage: 'Post deleted successfully'
    }),
  
  /**
   * Get user groups
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of groups
   */
  getGroups: (params = {}) => 
    apiRequest('GET', '/api/community/connections', null, {
      params: { ...params, type: 'group' },
      errorMessage: 'Failed to fetch groups'
    }),
  
  /**
   * Get group details
   * @param {string} groupId - Group ID
   * @returns {Promise<Object>} Group details
   */
  getGroup: (groupId) => 
    apiRequest('GET', '/api/community/connections', null, {
      params: { id: groupId, type: 'group' },
      errorMessage: 'Failed to fetch group details'
    }),
  
  /**
   * Join a group
   * @param {string} groupId - Group ID
   * @returns {Promise<Object>} Join response
   */
  joinGroup: (groupId) => 
    apiRequest('POST', '/api/community/connections', { id: groupId, action: 'join', type: 'group' }, {
      errorMessage: 'Failed to join group',
      successMessage: 'Joined group successfully'
    }),
  
  /**
   * Leave a group
   * @param {string} groupId - Group ID
   * @returns {Promise<Object>} Leave response
   */
  leaveGroup: (groupId) => 
    apiRequest('POST', '/api/community/connections', { id: groupId, action: 'leave', type: 'group' }, {
      errorMessage: 'Failed to leave group',
      successMessage: 'Left group successfully'
    }),
  
  /**
   * Get user connections
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of connections
   */
  getConnections: (params = {}) => 
    apiRequest('GET', '/api/community/connections', null, {
      params: { ...params, type: 'user' },
      errorMessage: 'Failed to fetch connections'
    }),
  
  /**
   * Send connection request
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Request response
   */
  sendConnectionRequest: (userId) => 
    apiRequest('POST', '/api/community/connections', { userId, action: 'connect' }, {
      errorMessage: 'Failed to send connection request',
      successMessage: 'Connection request sent successfully'
    }),
  
  /**
   * Accept connection request
   * @param {string} requestId - Request ID
   * @returns {Promise<Object>} Accept response
   */
  acceptConnectionRequest: (requestId) => 
    apiRequest('POST', '/api/community/connections', { requestId, action: 'accept' }, {
      errorMessage: 'Failed to accept connection request',
      successMessage: 'Connection request accepted'
    }),
  
  /**
   * Reject connection request
   * @param {string} requestId - Request ID
   * @returns {Promise<Object>} Reject response
   */
  rejectConnectionRequest: (requestId) => 
    apiRequest('POST', '/api/community/connections', { requestId, action: 'reject' }, {
      errorMessage: 'Failed to reject connection request',
      successMessage: 'Connection request rejected'
    }),
  
  /**
   * Get connection requests
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of connection requests
   */
  getConnectionRequests: (params = {}) => 
    apiRequest('GET', '/api/community/connections', null, {
      params: { ...params, status: 'pending' },
      errorMessage: 'Failed to fetch connection requests'
    })
};

export default communityAPI;
