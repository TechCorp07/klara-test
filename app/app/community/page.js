"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { communication } from "@/lib/services/communicationService"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "react-toastify"

export default function CommunityPage() {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const [selectedPost, setSelectedPost] = useState(null)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newComment, setNewComment] = useState("")
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [postFilter, setPostFilter] = useState("all")
  const queryClient = useQueryClient()

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch community posts
  const {
    data: posts = { results: [] },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["communityPosts", postFilter],
    queryFn: () => communication.getCommunityPosts({ filter: postFilter }),
    enabled: !!user && mounted,
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to load community posts")
      }
      console.error("Error fetching community posts:", error)
    },
  })

  // Fetch comments for selected post
  const { data: comments = { results: [] }, isLoading: isCommentsLoading } = useQuery({
    queryKey: ["communityComments", selectedPost?.id],
    queryFn: () => communication.getCommunityComments(selectedPost?.id),
    enabled: !!selectedPost && mounted,
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to load comments")
      }
      console.error("Error fetching comments:", error)
    },
  })

  // Mutation for creating a new post
  const createPostMutation = useMutation({
    mutationFn: (postData) => communication.createCommunityPost(postData),
    onSuccess: () => {
      if (mounted) {
        toast.success("Post created successfully")
      }
      setNewPostTitle("")
      setNewPostContent("")
      setShowNewPostForm(false)
      queryClient.invalidateQueries(["communityPosts"])
    },
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to create post")
      }
      console.error("Error creating post:", error)
    },
  })

  // Mutation for creating a new comment
  const createCommentMutation = useMutation({
    mutationFn: (commentData) => communication.createCommunityComment(commentData),
    onSuccess: () => {
      if (mounted) {
        toast.success("Comment added")
      }
      setNewComment("")
      queryClient.invalidateQueries(["communityComments", selectedPost?.id])
    },
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to add comment")
      }
      console.error("Error creating comment:", error)
    },
  })

  const handlePostSelect = (post) => {
    setSelectedPost(post)
  }

  const handleCreatePost = (e) => {
    e.preventDefault()

    if (!newPostTitle.trim() || !newPostContent.trim()) return

    createPostMutation.mutate({
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      category: "general", // Default category
    })
  }

  const handleCreateComment = (e) => {
    e.preventDefault()

    if (!newComment.trim() || !selectedPost) return

    createCommentMutation.mutate({
      post: selectedPost.id,
      content: newComment.trim(),
    })
  }

  const handleFilterChange = (filter) => {
    setPostFilter(filter)
    setSelectedPost(null)
  }

  // Don't render anything during SSR
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Community</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Community</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Community</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading community posts. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Community</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          onClick={() => setShowNewPostForm(!showNewPostForm)}
        >
          {showNewPostForm ? "Cancel" : "Create New Post"}
        </button>
      </div>

      {/* New Post Form */}
      {showNewPostForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
          <form onSubmit={handleCreatePost}>
            <div className="mb-4">
              <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="postTitle"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter post title"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="postContent"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={5}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter post content"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createPostMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:bg-blue-400"
              >
                {createPostMutation.isPending ? "Creating..." : "Create Post"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              postFilter === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleFilterChange("all")}
          >
            All Posts
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              postFilter === "general"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleFilterChange("general")}
          >
            General
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              postFilter === "questions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleFilterChange("questions")}
          >
            Questions
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              postFilter === "research"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleFilterChange("research")}
          >
            Research
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              postFilter === "support"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleFilterChange("support")}
          >
            Support
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Posts List */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Posts</h2>

            {posts?.results && posts.results.length > 0 ? (
              <div className="space-y-4">
                {posts.results.map((post) => (
                  <div
                    key={post.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedPost?.id === post.id
                        ? "bg-blue-100 border border-blue-300"
                        : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                    }`}
                    onClick={() => handlePostSelect(post)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{post.title}</h3>
                      <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">{post.category}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.content}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>{post.author_name}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span className="flex items-center mr-4">
                        <svg
                          className="h-4 w-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {post.comment_count} comments
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                        {post.like_count} likes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No posts found.</p>
            )}
          </div>
        </div>

        {/* Post Details and Comments */}
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

              <div className="flex items-center mb-6">
                <button className="flex items-center text-gray-600 hover:text-blue-600 mr-4">
                  <svg
                    className="h-5 w-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  Like
                </button>
                <button className="flex items-center text-gray-600 hover:text-blue-600">
                  <svg
                    className="h-5 w-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Comments</h3>

                {/* Comment form */}
                <form onSubmit={handleCreateComment} className="mb-6">
                  <div className="mb-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Add a comment..."
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={createCommentMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:bg-blue-400"
                    >
                      {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </form>

                {/* Comments list */}
                {isCommentsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : comments?.results && comments.results.length > 0 ? (
                  <div className="space-y-4">
                    {comments.results.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{comment.author_name}</span>
                          <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-full">
              <p className="text-gray-500">Select a post to view details and comments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
