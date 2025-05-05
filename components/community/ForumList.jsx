import React, { useState, useEffect } from 'react';
import { community } from '../../api';
import { toast } from 'react-toastify';

/**
 * ForumList Component
 * Displays a list of available forums in the community
 */
const ForumList = () => {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    setLoading(true);
    try {
      const response = await communityAPI.getForums();
      setForums(response.forums || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching forums:', err);
      setError('Failed to load forums. Please try again.');
      toast.error('Failed to load community forums');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (forums.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        No forums are currently available.
      </div>
    );
  }

  return (
    <div className="forum-list">
      <h3 className="mb-4">Community Forums</h3>
      <div className="row">
        {forums.map((forum) => (
          <div key={forum.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{forum.name}</h5>
                <p className="card-text">{forum.description}</p>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">
                    {forum.topicCount} topics • {forum.postCount} posts
                  </small>
                  <small className="text-muted">
                    {forum.memberCount} members
                  </small>
                </div>
              </div>
              <div className="card-footer bg-transparent">
                <a href={`/community/forums/${forum.id}`} className="btn btn-primary">
                  View Forum
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumList;
