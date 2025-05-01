import React, { useState, useEffect } from 'react';
import { community } from '../../api';
import { toast } from 'react-toastify';

/**
 * ForumDetail Component
 * Displays forum details and topics within a forum
 */
const ForumDetail = ({ forumId }) => {
  const [forum, setForum] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '' });

  useEffect(() => {
    if (forumId) {
      fetchForumDetails();
      fetchForumTopics();
    }
  }, [forumId]);

  const fetchForumDetails = async () => {
    try {
      const response = await communityAPI.getForum(forumId);
      setForum(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching forum details:', err);
      setError('Failed to load forum details. Please try again.');
      toast.error('Failed to load forum details');
    }
  };

  const fetchForumTopics = async () => {
    setLoading(true);
    try {
      const response = await communityAPI.getForumTopics(forumId);
      setTopics(response.topics || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching forum topics:', err);
      setError('Failed to load forum topics. Please try again.');
      toast.error('Failed to load forum topics');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTopic({
      ...newTopic,
      [name]: value
    });
  };

  const handleSubmitTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      toast.error('Please provide both title and content for your topic');
      return;
    }

    try {
      await communityAPI.createTopic(forumId, newTopic);
      toast.success('Topic created successfully');
      setNewTopic({ title: '', content: '' });
      setShowNewTopicForm(false);
      fetchForumTopics();
    } catch (err) {
      console.error('Error creating topic:', err);
      toast.error('Failed to create topic');
    }
  };

  if (loading && !forum) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error && !forum) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="alert alert-info" role="alert">
        Forum not found.
      </div>
    );
  }

  return (
    <div className="forum-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>{forum.name}</h2>
          <p className="text-muted">{forum.description}</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowNewTopicForm(!showNewTopicForm)}
        >
          {showNewTopicForm ? 'Cancel' : 'New Topic'}
        </button>
      </div>

      {showNewTopicForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Create New Topic</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmitTopic}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={newTopic.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="content" className="form-label">Content</label>
                <textarea
                  className="form-control"
                  id="content"
                  name="content"
                  rows="5"
                  value={newTopic.content}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-success">Create Topic</button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading topics...</span>
          </div>
        </div>
      ) : topics.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No topics have been created in this forum yet. Be the first to start a discussion!
        </div>
      ) : (
        <div className="list-group">
          {topics.map((topic) => (
            <a 
              key={topic.id} 
              href={`/community/topics/${topic.id}`} 
              className="list-group-item list-group-item-action"
            >
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{topic.title}</h5>
                <small className="text-muted">
                  {new Date(topic.createdAt).toLocaleDateString()}
                </small>
              </div>
              <p className="mb-1">{topic.excerpt}</p>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  By {topic.author.name}
                </small>
                <span className="badge bg-primary rounded-pill">{topic.postCount} posts</span>
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="mt-4">
        <a href="/community/forums" className="btn btn-outline-secondary">
          Back to Forums
        </a>
      </div>
    </div>
  );
};

export default ForumDetail;
