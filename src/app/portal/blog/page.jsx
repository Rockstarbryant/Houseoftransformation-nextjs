'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, CheckCircle, AlertCircle, Search, X, Info, XCircle, Eye, EyeOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/context/AuthContext';
import { blogService } from '@/services/api/blogService';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import PermissionAlert from '@/components/common/PermissionAlert';

// ===== TOAST NOTIFICATION SYSTEM =====
const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />
  };

  const styles = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
  };

  const iconColors = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400'
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slideIn ${styles[type]}`}>
      <span className={iconColors[type]}>{icons[type]}</span>
      <p className="flex-1 font-medium">{message}</p>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        <X size={18} />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 w-96 max-w-[calc(100vw-2rem)]">
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// ===== CONFIRMATION DIALOG =====
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[90] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-red-600 dark:text-red-400" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-6 py-3 bg-red-600 dark:bg-red-700 text-white rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-red-800 transition"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== SIMPLE MARKDOWN EDITOR =====
const SimpleMarkdownEditor = ({ value, onChange, disabled }) => {
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = (before, after = '') => {
    const textarea = document.getElementById('markdown-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'text';
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
    }, 0);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 -mx-4 bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-300 dark:border-slate-600">
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          disabled={disabled}
          className="px-3 py-2 bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-slate-500 disabled:opacity-50 font-bold transition"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('*', '*')}
          disabled={disabled}
          className="px-3 py-2 bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-slate-500 disabled:opacity-50 italic transition"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('# ', '')}
          disabled={disabled}
          className="px-3 py-2 bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-slate-500 disabled:opacity-50 font-bold text-lg transition"
          title="Heading"
        >
          H
        </button>

        <div className="w-px bg-gray-300 dark:bg-slate-500"></div>

        <button
          type="button"
          onClick={() => insertMarkdown('- ', '')}
          disabled={disabled}
          className="px-3 py-2 bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-slate-500 disabled:opacity-50 transition"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('1. ', '')}
          disabled={disabled}
          className="px-3 py-2 bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-slate-500 disabled:opacity-50 transition"
          title="Numbered List"
        >
          1. List
        </button>

        <div className="w-px bg-gray-300 dark:bg-slate-500"></div>

        <button
          type="button"
          onClick={() => insertMarkdown('[', '](url)')}
          disabled={disabled}
          className="px-3 py-2 bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-slate-500 disabled:opacity-50 transition"
          title="Link"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('`', '`')}
          disabled={disabled}
          className="px-3 py-2 bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-slate-500 disabled:opacity-50 font-mono text-sm transition"
          title="Code"
        >
          Code
        </button>

        <div className="flex-1"></div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          disabled={disabled}
          className={`px-3 py-2 rounded flex items-center gap-2 transition ${
            showPreview
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-500'
          } disabled:opacity-50`}
        >
          {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor Area */}
      {!showPreview ? (
        <textarea
          id="markdown-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full h-96 px-2 py-3 -mx-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 font-mono text-sm resize-vertical"
          placeholder="Start writing... Supports **bold**, *italic*, # headings, lists, and more!"
        />
      ) : (
        <div className="min-h-64 p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg overflow-auto">
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value}
            </ReactMarkdown>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Supports **bold**, *italic*, # headings, lists, [links](url), and `code`.
      </p>
    </div>
  );
};

// ===== MAIN MANAGE BLOG COMPONENT =====
const ManageBlog = () => {
  const { user, hasPermission, getAllowedBlogCategories } = useAuth();

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: 'testimonies',
    imageUrl: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  const allCategories = [
    { value: 'testimonies', label: 'Testimonies' },
    { value: 'events', label: 'Events' },
    { value: 'teaching', label: 'Teaching' },
    { value: 'news', label: 'News' }
  ];

  // Toast utilities
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  // Lifecycle hooks
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = [...posts];

    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
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

  // API calls
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await blogService.getBlogs();
      setPosts(data.blogs || data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      showToast('Failed to load blog posts', 'error');
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
    
    // Create FormData for Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', 'church_sermons'); // Use the same preset or create a new one

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData
      }
    );

    const data = await response.json();
    
    if (data.secure_url) {
      // Set the Cloudinary URL to formData
      setFormData(prev => ({ ...prev, image: data.secure_url }));
      setImagePreview(data.secure_url);
      showToast('Image uploaded successfully!', 'success');
    } else {
      showToast('Image upload failed', 'error');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    showToast('Error uploading image: ' + error.message, 'error');
  } finally {
    setUploading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Title and content are required', 'warning');
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
        showToast('Post updated successfully!', 'success');
      } else {
        await blogService.createBlog(payload);
        showToast('Post created successfully!', 'success');
      }

      setTimeout(() => {
        setShowForm(false);
        resetForm();
        fetchPosts();
      }, 1500);
    } catch (error) {
      console.error('Error saving post:', error);
      showToast(error.response?.data?.message || 'Failed to save post', 'error');
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
    setImagePreview(post.image || null);
    setEditingId(post._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    showConfirm(
      'Delete Blog Post',
      'Are you sure you want to delete this blog post? This cannot be undone.',
      async () => {
        try {
          setLoading(true);
          await blogService.deleteBlog(id);
          showToast('Post deleted successfully', 'success');
          fetchPosts();
        } catch (error) {
          showToast('Failed to delete post', 'error');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // Helper functions
  const getCategoryColor = (category) => {
    const colors = {
      testimonies: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      events: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      teaching: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      news: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
    };
    return colors[category] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  };

  const getCategoryLabel = (cat) =>
    allCategories.find(c => c.value === cat)?.label || cat;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

  const canCreateBlog = hasPermission('manage:blog');

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

  // Render
  return (
    <div className="max-w-full mx-auto px-2 py-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog
        {...confirmDialog}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Blog</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage blog posts</p>
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
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.thisMonth}</p>
          </div>
        </div>
      )}

      {!canCreateBlog && !showForm && (
        <PermissionAlert
          title="No Permission"
          message="Your role cannot create blog posts. You need the 'manage:blog' permission."
          currentRole={user?.role?.name}
          actionType="blog post"
        />
      )}

      {/* Filters */}
      {!showForm && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="pl-4 pr-8 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 appearance-none"
          >
            <option value="all">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 appearance-none"
          >
            <option value="all">All Status</option>
            <option value="approved">Published</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      )}

      {/* Form */}
      {showForm && canCreateBlog && (
        <Card className="mb-6 p-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold dark:text-white">
              {editingId ? 'Edit Post' : 'New Post'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
                placeholder="Enter post title"
                required
                disabled={loading || uploading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Short Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
                placeholder="Brief summary (optional)"
                disabled={loading || uploading}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
                required
                disabled={loading || uploading}
              >
                {allCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Featured Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageUpload}
                disabled={loading || uploading}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
              />
              {uploading && <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">Uploading featured image...</p>}
              {imagePreview && (
                    <div className="mt-4">
                      <div className="relative w-full h-48">
                        <Image
                          src={imagePreview}
                          alt="Featured preview"
                          fill
                          className="object-cover rounded-lg border dark:border-slate-700"
                        />
                      </div>
                    </div>
                  )}
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm p-2 font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Content * (Markdown)
              </label>
              <SimpleMarkdownEditor
                value={formData.content}
                onChange={value => setFormData(prev => ({ ...prev, content: value }))}
                disabled={loading || uploading}
              />
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="text-center py-12 text-gray-600 dark:text-gray-400">
              No blog posts found
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <Card
                  key={post._id}
                  className={`flex flex-col hover:shadow-lg transition-shadow ${
                    post.approved === false ? 'border-l-4 border-yellow-400 bg-yellow-50/20 dark:bg-yellow-900/10' : ''
                  }`}
                >
                  {post.image && (
                  <div className="aspect-video bg-gray-200 dark:bg-slate-700 rounded-t-lg overflow-hidden relative">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                      {post.approved === false && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                          Pending
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-2 line-clamp-2 dark:text-white">{post.title}</h3>

                    {post.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm">{post.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-200 dark:border-slate-700">
                      <span>{formatDate(post.createdAt || post.date)}</span>
                    </div>

                    <div className="flex gap-2 mt-5">
                      <button
                        onClick={() => handleEdit(post)}
                        className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition disabled:opacity-50"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="flex-1 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition disabled:opacity-50"
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