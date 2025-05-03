"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"

/**
 * TopicDetail Component
 * Displays topic details and posts within a topic
 */
const TopicDetail = ({ topicId }) => {
  const [topic, setTopic] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newPost, setNewPost] = useState({ content: "" })

  useEffect(() => {
    if (topicId) {
      fetchTopicDetails()
      fetchTopicPosts()
    }
  }, [topicId])

  const fetchTopicDetails = async () => {
    try {
      const response = await communityAPI.getTopic(topicId)
      setTopic(response)
      setError(null)
    } catch (err) {
      console.error("Error fetching topic details:", err)
      setError("Failed to load topic details. Please try again.")
      toast.error("Failed to load topic details")
    }
  }

  const fetchTopicPosts = async () => {
    setLoading(true)
    try {
      const response = await communityAPI.getTopicPosts(topicId)
      setPosts(response.posts || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching topic posts:", err)
      setError("Failed to load topic posts. Please try again.")
      toast.error("Failed to load topic posts")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewPost({
      ...newPost,
      [name]: value,
    })
  }

  const handleSubmitPost = async (e) => {
    e.preventDefault()
    if (!newPost.content.trim()) {
      toast.error("Please provide content for your post")
      return
    }

    try {
      await communityAPI.createPost(topicId, newPost)
      toast.success("Post created successfully")
      setNewPost({ content: "" })
      fetchTopicPosts()
    } catch (err) {
      console.error("Error creating post:", err)
      toast.error("Failed to create post")
    }
  }

  if (loading && !topic) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error && !topic) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="alert alert-info" role="alert">
        Topic not found.
      </div>
    )
  }

  return (
    <div className="topic-detail">
      <div className="card mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">{topic.title}</h2>
            <span className="badge bg-primary">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <div>
              <strong>Author:</strong> {topic.author.name}
            </div>
            <div>
              <strong>Created:</strong> {new Date(topic.createdAt).toLocaleString()}
            </div>
          </div>
          <div className="topic-content">{topic.content}</div>
        </div>
      </div>

      <h4 className="mb-3">Responses</h4>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading posts...</span>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No responses yet. Be the first to respond!
        </div>
      ) : (
        <div className="post-list mb-4">
          {posts.map((post) => (
            <div key={post.id} className="card mb-3">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{post.author.name}</strong>
                  </div>
                  <div>{new Date(post.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="card-body">
                <div className="post-content">{post.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Add Your Response</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmitPost}>
            <div className="mb-3">
              <textarea
                className="form-control"
                id="content"
                name="content"
                rows="4"
                value={newPost.content}
                onChange={handleInputChange}
                placeholder="Write your response here..."
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">
              Post Response
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4">
        <a href={`/community/forums/${topic.forumId}`} className="btn btn-outline-secondary">
          Back to Forum
        </a>
      </div>
    </div>
  )
}

export default TopicDetail
