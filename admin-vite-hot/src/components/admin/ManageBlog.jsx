import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { blogService } from '../../services/api/blogService';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import PermissionAlert from '../common/PermissionAlert';

const ManageBlog = () => {
  const { user, canPostBlogCategory, getAllowedBlogCategories } = useAuthContext();
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: 'testimonies',
    image: ''
  });

  const allCategories = [
    { value: 'testimonies', label: 'Testimonies' },
    { value: 'events', label: 'Events' },
    { value: 'teaching', label: 'Teaching' },
    { value: 'news', label: 'News' }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await blogService.getBlogs();
      setPosts(data.blogs || data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setErrorMessage('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validate form
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    // Check permission
    if (!canPostBlogCategory(formData.category)) {
      setErrorMessage(
        `Your role (${user.role}) cannot post in the ${formData.category} category. ` +
        `Allowed categories: ${getAllowedBlogCategories().join(', ')}`
      );
      return;
    }

    try {
      setLoading(true);
      const response = await blogService.createBlog({
        title: formData.title,
        content: formData.content,
        description: formData.description,
        category: formData.category,
        image: formData.image
      });

      setSuccessMessage(response.message || 'Blog post created successfully!');
      setFormData({
        title: '',
        content: '',
        description: '',
        category: 'testimonies',
        image: ''
      });

      setTimeout(() => {
        setShowForm(false);
        setSuccessMessage('');
        fetchPosts();
      }, 1500);
    } catch (error) {
      console.error('Error creating blog:', error);
      setErrorMessage(
        error.message || 'Failed to create blog post. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        setLoading(true);
        await blogService.deleteBlog(id);
        setSuccessMessage('Blog post deleted successfully!');
        fetchPosts();
        setTimeout(() => setSuccessMessage(''), 2000);
      } catch (error) {
        console.error('Error deleting post:', error);
        setErrorMessage('Failed to delete blog post');
      } finally {
        setLoading(false);
      }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      testimonies: 'bg-purple-100 text-purple-800',
      events: 'bg-blue-100 text-blue-800',
      teaching: 'bg-green-100 text-green-800',
      news: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category) => {
    return allCategories.find(cat => cat.value === category)?.label || category;
  };

  const allowedCategories = getAllowedBlogCategories();
  const canCreateBlog = allowedCategories.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900">Manage Blog</h1>
        {canCreateBlog && (
          <Button
            variant="primary"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus size={20} /> New Post
          </Button>
        )}
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded flex items-center gap-3">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded flex items-center gap-3">
          <AlertCircle size={20} />
          {errorMessage}
        </div>
      )}

      {/* Permission Alert */}
      {!canCreateBlog && (
        <PermissionAlert
          title="Cannot Create Blog Posts"
          message="Your role does not have permission to create blog posts."
          currentRole={user?.role}
          actionType="blog post"
        />
      )}

      {/* Create Form */}
      {showForm && canCreateBlog && (
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Create New Blog Post</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none"
                placeholder="Enter blog title"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none"
                placeholder="Brief description"
                disabled={loading}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none"
                required
                disabled={loading}
              >
                {allCategories.map(cat => {
                  const isAllowed = allowedCategories.includes(cat.value);
                  return (
                    <option
                      key={cat.value}
                      value={cat.value}
                      disabled={!isAllowed}
                    >
                      {cat.label} {!isAllowed ? '(Not allowed)' : ''}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Allowed categories: {allowedCategories.map(c => getCategoryLabel(c)).join(', ')}
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none"
                placeholder="Write your blog content here..."
                rows="10"
                required
                disabled={loading}
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Featured Image URL <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none"
                placeholder="https://example.com/image.jpg"
                disabled={loading}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Publishing...' : 'Publish Post'}
              </Button>
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Blog Posts Grid */}
      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600 text-lg">No blog posts yet</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Card key={post._id} hover className="flex flex-col">
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(post.category)}`}>
                  {getCategoryLabel(post.category)}
                </span>
                {post.approved === false && (
                  <span className="ml-2 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-blue-900 mb-2">{post.title}</h3>

              {post.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">{post.description}</p>
              )}

              {post.content && (
                <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
              )}

              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  {new Date(post.createdAt || post.date).toLocaleDateString()}
                </span>

                <div className="flex gap-2">
                  <button
                    className="p-2 text-blue-900 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                    title="Edit"
                    disabled={loading}
                  >
                    <Edit size={20} />
                  </button>

                  <button
                    onClick={() => handleDelete(post._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    title="Delete"
                    disabled={loading}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBlog;