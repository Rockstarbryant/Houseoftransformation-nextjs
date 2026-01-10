import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import Card from '../common/Card';
import Button from '../common/Button';
import PermissionAlert from '../common/PermissionAlert';
import { blogService } from '../../services/api/blogService';

const CreateBlogForm = ({ onBlogCreated, onCancel }) => {
  const { user, canPostBlog, getAllowedBlogCategories } = useAuthContext();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const allowedCategories = getAllowedBlogCategories();

  if (!canPostBlog()) {
    return (
      <PermissionAlert
        title="Cannot Create Blog"
        message="Your role does not have permission to create blog posts."
        currentRole={user?.role}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await blogService.createBlog(formData);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create blog');
      }

      setSuccess(data.message || 'Blog post created successfully!');
      setFormData({ title: '', content: '', category: '', description: '' });
      
      if (onBlogCreated) {
        setTimeout(() => onBlogCreated(data.blog), 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categoryLabels = {
    testimonies: 'Testimonies',
    events: 'Events',
    teaching: 'Teaching',
    news: 'News'
  };

  return (
    <Card className="mb-8 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
          <Plus size={28} /> Create Blog Post
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-800 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none"
          >
            <option value="">Select a category</option>
            {allowedCategories.map(cat => (
              <option key={cat} value={cat}>
                {categoryLabels[cat]}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Your role allows: {allowedCategories.map(c => categoryLabels[c]).join(', ')}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter blog title"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description (optional)"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your blog content here..."
            rows="8"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish Blog'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default CreateBlogForm;