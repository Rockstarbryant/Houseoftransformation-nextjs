import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, AlertCircle, Search, Filter, X } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { blogService } from '../../services/api/blogService';
import Card from '../common/Card';
import Button from '../common/Button';
import PermissionAlert from '../common/PermissionAlert';

// Debounce utility (kept in case you need it later)
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const ManageBlog = () => {
  const { user, canPostBlogCategory, getAllowedBlogCategories } = useAuthContext();

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: 'testimonies',
    imageUrl: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  const allCategories = [
    { value: 'testimonies', label: 'Testimonies', color: 'purple' },
    { value: 'events', label: 'Events', color: 'blue' },
    { value: 'teaching', label: 'Teaching', color: 'green' },
    { value: 'news', label: 'News', color: 'yellow' }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter posts
  useEffect(() => {
    let filtered = [...posts];

    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p =>
        statusFilter === 'approved' ? p.approved !== false : p.approved === false
      );
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, categoryFilter, statusFilter]);

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

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      description: '',
      category: 'testimonies',
      imageUrl: ''
    });
    setImagePreview(null);
    setEditingId(null);
  };

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'church_sermons');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await response.json();

      if (data.secure_url) {
        setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
      } else {
        setErrorMessage('Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrorMessage('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setErrorMessage('Title and content are required');
      return;
    }

    if (!canPostBlogCategory(formData.category)) {
      setErrorMessage(
        `Your role cannot post in the ${formData.category} category. ` +
        `Allowed: ${getAllowedBlogCategories().join(', ')}`
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        content: formData.content,
        description: formData.description,
        category: formData.category,
        image: formData.imageUrl
      };

      if (editingId) {
        await blogService.updateBlog(editingId, payload);
        setSuccessMessage('Post updated successfully!');
      } else {
        await blogService.createBlog(payload);
        setSuccessMessage('Post created successfully!');
      }

      setTimeout(() => {
        setShowForm(false);
        setSuccessMessage('');
        resetForm();
        fetchPosts();
      }, 1400);
    } catch (error) {
      console.error('Error saving post:', error);
      setErrorMessage('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title,
      content: post.content || '',
      description: post.description || '',
      category: post.category,
      imageUrl: post.image || ''
    });
    setImagePreview(post.image);
    setEditingId(post._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;

    try {
      setLoading(true);
      await blogService.deleteBlog(id);
      setSuccessMessage('Post deleted');
      fetchPosts();
      setTimeout(() => setSuccessMessage(''), 1800);
    } catch (error) {
      setErrorMessage('Failed to delete post');
    } finally {
      setLoading(false);
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

  const getCategoryLabel = (cat) =>
    allCategories.find(c => c.value === cat)?.label || cat;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

  const allowedCategories = getAllowedBlogCategories();
  const canCreateBlog = allowedCategories.length > 0;

  const stats = {
    total: posts.length,
    approved: posts.filter(p => p.approved !== false).length,
    pending: posts.filter(p => p.approved === false).length,
    thisMonth: posts.filter(p => {
      const d = new Date(p.createdAt || p.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Blog</h1>
          <p className="text-gray-600 mt-1">Create and manage blog posts</p>
        </div>

        {canCreateBlog && (
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={20} /> New Post
          </Button>
        )}
      </div>

      {/* Stats */}
      {!showForm && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">Published</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-blue-600">{stats.thisMonth}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded flex items-center gap-3">
          <CheckCircle size={20} /> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded flex items-center gap-3">
          <AlertCircle size={20} /> {errorMessage}
        </div>
      )}

      {!canCreateBlog && !showForm && (
        <PermissionAlert
          title="No Permission"
          message="Your role cannot create blog posts."
          currentRole={user?.role}
          actionType="blog post"
        />
      )}

      {/* Filters */}
      {!showForm && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none bg-white"
          >
            <option value="all">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="approved">Published</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      )}

      {/* Form */}
      {showForm && canCreateBlog && (
        <Card className="mb-6 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {editingId ? 'Edit Post' : 'New Post'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter post title"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Brief summary (optional)"
                disabled={loading}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                disabled={loading}
              >
                {allCategories.map(cat => {
                  const allowed = allowedCategories.includes(cat.value);
                  return (
                    <option
                      key={cat.value}
                      value={cat.value}
                      disabled={!allowed}
                    >
                      {cat.label} {!allowed ? '(Not allowed)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Featured Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageUpload}
                disabled={loading || uploading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploading && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-md h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Main Content - Simple Textarea */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[400px] font-mono text-sm"
                placeholder="Write your full blog post here..."
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">
                You can use Markdown if your backend supports it (e.g. **bold**, *italic*, # Heading)
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || uploading}
                className="flex-1"
              >
                {loading ? 'Saving...' : editingId ? 'Update Post' : 'Publish Post'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Posts List */}
      {!showForm && (
        <>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="text-center py-12 text-gray-600">
              No blog posts found
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <Card
                  key={post._id}
                  className={`flex flex-col hover:shadow-lg transition-shadow ${
                    post.approved === false ? 'border-l-4 border-yellow-400 bg-yellow-50/20' : ''
                  }`}
                >
                  {post.image && (
                    <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={e => (e.target.style.display = 'none')}
                      />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                      {post.approved === false && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h3>

                    {post.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{post.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto pt-4 border-t border-gray-200">
                      <span className="flex items-center gap-1">
                        <span>📅</span> {formatDate(post.createdAt || post.date)}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-5">
                      <button
                        onClick={() => handleEdit(post)}
                        className="flex-1 py-2 bg-blue-50 text-blue-700 rounded font-medium hover:bg-blue-100 transition disabled:opacity-50"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="flex-1 py-2 bg-red-50 text-red-700 rounded font-medium hover:bg-red-100 transition disabled:opacity-50"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageBlog;