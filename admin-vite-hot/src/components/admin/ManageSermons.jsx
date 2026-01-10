import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Pin, X, Image as ImageIcon, RotateCcw, RotateCw } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { sermonService } from '../../services/api/sermonService';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Memoized Toolbar Component
const TipTapToolbar = React.memo(({ editor, onImageUpload, uploading }) => {
  if (!editor) return null;

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(file, editor);
    }
    e.target.value = '';
  };

  const handleClearContent = () => {
    if (window.confirm('Clear all sermon content? This cannot be undone.')) {
      editor.chain().focus().clearContent().run();
    }
  };

  return (
    <div className="border border-gray-300 rounded-t-lg bg-gradient-to-r from-gray-50 to-blue-50 p-3 flex flex-wrap gap-2 items-center">
      {/* Formatting Buttons */}
      <div className="flex gap-1 border-r border-gray-300 pr-3">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-2 rounded font-bold transition-colors ${
            editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'
          }`}
          title="Bold (Ctrl+B)"
          aria-label="Bold text"
        >
          B
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-2 rounded italic transition-colors ${
            editor.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'
          }`}
          title="Italic (Ctrl+I)"
          aria-label="Italic text"
        >
          I
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-2 rounded text-sm font-bold transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'
          }`}
          title="Heading 2"
          aria-label="Heading 2"
        >
          H2
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-2 rounded transition-colors ${
            editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'
          }`}
          title="Bullet list"
          aria-label="Bullet list"
        >
          • List
        </button>
      </div>

      {/* Undo / Redo */}
      <div className="flex gap-1 border-r border-gray-300 pr-3">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="px-3 py-2 rounded bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="px-3 py-2 rounded bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <RotateCw size={16} />
        </button>
      </div>

      {/* Image Upload */}
      <label 
        className={`px-3 py-2 rounded bg-white border border-gray-300 flex items-center gap-1 cursor-pointer hover:bg-gray-100 transition-colors ${
          uploading ? 'opacity-50 pointer-events-none' : ''
        }`}
        title="Upload image"
      >
        <ImageIcon size={16} /> {uploading ? 'Uploading...' : 'Upload'}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageFileUpload}
          disabled={uploading}
          className="hidden"
          aria-label="Upload image"
        />
      </label>

      {/* Clear Content */}
      <button
        onClick={handleClearContent}
        className="px-3 py-2 rounded bg-red-100 text-red-600 border border-red-300 text-sm hover:bg-red-200 transition-colors"
        title="Clear all content"
        aria-label="Clear content"
      >
        Clear
      </button>
    </div>
  );
});

TipTapToolbar.displayName = 'TipTapToolbar';

const ManageSermons = () => {
  const [sermons, setSermons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sermonType, setSermonType] = useState('text');
  const [loading, setLoading] = useState(false);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    pastor: '',
    date: '',
    category: 'Sunday Service',
    description: '',
    thumbnail: '',
    videoUrl: '',
    type: 'text'
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Debounced update function - OPTIMIZED for performance
  const debouncedUpdateHtml = useCallback(
    debounce((html) => {
      setDescriptionHtml(html);
    }, 300),
    []
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3] // Only H2 and H3, no H1 in sermons
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4'
        }
      }),
      Placeholder.configure({
        placeholder: 'Start typing your sermon content...'
      })
    ],
    content: '<p></p>',
    onUpdate: ({ editor }) => {
      debouncedUpdateHtml(editor.getHTML());
    }
  });

  useEffect(() => {
    fetchSermons();
  }, []);

  // Only reset editor when editingId changes, prevent unnecessary resets
  useEffect(() => {
    if (!editor || !editingId) return;
    editor.commands.setContent(descriptionHtml || '<p></p>', false);
  }, [editingId]);

  const fetchSermons = async () => {
    try {
      const data = await sermonService.getSermons({ limit: 100 });
      setSermons(data.sermons || []);
      const pinned = (data.sermons || []).filter(s => s.pinned).length;
      setPinnedCount(pinned);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      pastor: '',
      date: '',
      category: 'Sunday Service',
      description: '',
      thumbnail: '',
      videoUrl: '',
      type: 'text'
    });
    setDescriptionHtml('');
    setSermonType('text');
    setEditingId(null);
    setThumbnailPreview(null);
    if (editor) {
      editor.commands.setContent('<p></p>');
    }
  };

  const handleTypeChange = (type) => {
    setSermonType(type);
    setFormData({ ...formData, type });
  };

  // Handle file upload to Cloudinary
  const handleImageUpload = async (file, editorInstance) => {
    try {
      setUploading(true);
      
      // Insert temporary placeholder
      const placeholderId = `upload-${Date.now()}`;
      editorInstance
        .chain()
        .focus()
        .setImage({ 
          src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%239ca3af"%3EUploading...%3C/text%3E%3C/svg%3E',
          alt: placeholderId 
        })
        .run();

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', 'church_sermons');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: cloudinaryFormData
        }
      );

      const data = await response.json();
      
      if (data.secure_url) {
        // Replace placeholder with actual image
        const { state } = editorInstance;
        const { doc } = state;
        
        doc.descendants((node) => {
          if (node.type.name === 'image' && node.attrs.alt === placeholderId) {
            editorInstance
              .chain()
              .focus()
              .setImage({ src: data.secure_url, alt: file.name })
              .run();
          }
        });
      } else {
        alert('Image upload failed');
        editorInstance.chain().focus().deleteSelection().run();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + error.message);
      editorInstance.chain().focus().deleteSelection().run();
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, thumbnail: file });
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (sermonType === 'video' && !formData.videoUrl) {
      alert('Please add a video URL for video sermons');
      return;
    }
    if (!descriptionHtml || descriptionHtml === '<p></p>') {
      alert('Please add some content to the description');
      return;
    }

    try {
      setLoading(true);

      const dataToSubmit = {
        ...formData,
        type: sermonType,
        descriptionHtml,
        description: editor?.getText() || ''
      };

      if (editingId) {
        await sermonService.updateSermon(editingId, dataToSubmit);
        alert('Sermon updated successfully!');
      } else {
        await sermonService.createSermon(dataToSubmit);
        alert('Sermon added successfully!');
      }

      setShowForm(false);
      resetForm();
      fetchSermons();
    } catch (error) {
      console.error('Error saving sermon:', error);
      alert('Error saving sermon: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sermon) => {
    setFormData({
      ...sermon,
      thumbnail: sermon.thumbnail || '',
      descriptionHtml: sermon.descriptionHtml || ''
    });
    setDescriptionHtml(sermon.descriptionHtml || '');
    setThumbnailPreview(sermon.thumbnail);
    setSermonType(sermon.type || 'text');
    setEditingId(sermon._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this sermon?')) {
      try {
        await sermonService.deleteSermon(id);
        alert('Sermon deleted!');
        fetchSermons();
      } catch (error) {
        alert('Error deleting sermon');
      }
    }
  };

  const handlePin = async (id) => {
    if (pinnedCount >= 3 && !sermons.find(s => s._id === id)?.pinned) {
      alert('You can only pin up to 3 sermons');
      return;
    }

    try {
      const sermon = sermons.find(s => s._id === id);
      await sermonService.updateSermon(id, { pinned: !sermon.pinned });
      alert(sermon.pinned ? 'Sermon unpinned' : 'Sermon pinned!');
      fetchSermons();
    } catch (error) {
      alert('Error pinning sermon');
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'text': return '📝';
      case 'photo': return '📸';
      case 'video': return '🎥';
      default: return '📋';
    }
  };

  const pinnedSermons = sermons.filter(s => s.pinned);
  const unpinnedSermons = sermons.filter(s => !s.pinned);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900">Manage Sermons</h1>
        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          Add New Sermon
        </Button>
      </div>

      {/* Pin Info Alert */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Pin className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900">Pinned Sermons</h3>
            <p className="text-sm text-blue-700">
              You have pinned <strong>{pinnedCount}/3</strong> sermons. Pinned sermons appear on the homepage.
            </p>
          </div>
        </div>
      </Card>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? 'Edit Sermon' : 'Add New Sermon'}
          </h2>

          {/* Sermon Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Sermon Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'text', label: 'Text Only', icon: '📝', desc: 'Just title and description' },
                { id: 'photo', label: 'Photo + Text', icon: '📸', desc: 'With thumbnail image' },
                { id: 'video', label: 'Video + Text', icon: '🎥', desc: 'YouTube, Facebook, etc' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    sermonType === type.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="font-semibold text-gray-900">{type.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="title"
              label="Sermon Title *"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />

            <Input
              name="pastor"
              label="Pastor Name *"
              value={formData.pastor}
              onChange={(e) => setFormData({...formData, pastor: e.target.value})}
              required
            />

            <Input
              name="date"
              type="date"
              label="Date *"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />

            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option>Sunday Service</option>
              <option>Bible Study</option>
              <option>Special Event</option>
              <option>Youth Ministry</option>
              <option>Prayer Meeting</option>
            </select>

            {/* TipTap Rich Text Editor - OPTIMIZED */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sermon Content *
              </label>
              <TipTapToolbar editor={editor} onImageUpload={handleImageUpload} uploading={uploading} />
              <div className="border border-t-0 border-gray-300 rounded-b-lg bg-white min-h-96 p-4">
                <EditorContent editor={editor} />
              </div>
              <div className="bg-blue-50 border border-t-0 border-gray-300 rounded-b-lg px-4 py-3 text-xs text-blue-700 space-y-1">
                <p><strong>💡 Editor Tips:</strong></p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li><strong>Format:</strong> Bold (B), Italic (I), Heading 2 (H2), Bullet List (•)</li>
                  <li><strong>Undo/Redo:</strong> Use the ↶ ↷ buttons or Ctrl+Z / Ctrl+Y</li>
                  <li><strong>Images:</strong> Click "Upload" to add photos from your device</li>
                  <li><strong>Clear:</strong> Use "Clear" button to start over (with confirmation)</li>
                </ul>
              </div>
            </div>

            {/* Thumbnail - Optional */}
            {(sermonType === 'photo' || sermonType === 'video') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thumbnail Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleThumbnailUpload}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <p className="text-xs text-gray-600 mt-1">
                  If not uploaded, a default thumbnail will be used (like YouTube)
                </p>

                {thumbnailPreview && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold mb-2">Preview:</p>
                    <img src={thumbnailPreview} alt="Thumbnail" className="w-40 h-24 object-cover rounded" />
                  </div>
                )}
              </div>
            )}

            {sermonType === 'video' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Video URL *
                </label>
                <Input
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder="https://www.youtube.com/watch?v=... or https://fb.watch/..."
                  required={sermonType === 'video'}
                />
                <p className="text-xs text-gray-600 mt-1">✅ Supports: YouTube, Facebook, Vimeo, TikTok, etc.</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="primary" disabled={loading || uploading}>
                {loading ? 'Saving...' : editingId ? 'Update Sermon' : 'Add Sermon'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Pinned Sermons */}
      {pinnedSermons.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Pin size={24} className="text-blue-600" />
            Pinned Sermons ({pinnedSermons.length}/3)
          </h2>
          <div className="space-y-4">
            {pinnedSermons.map((sermon) => (
              <Card key={sermon._id} hover>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(sermon.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-blue-900">{sermon.title}</h3>
                          <Pin size={16} className="text-blue-600" />
                        </div>
                        <p className="text-gray-600">{sermon.pastor}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center mt-2">
                      <span className="text-xs bg-blue-100 text-blue-900 px-3 py-1 rounded-full font-semibold">
                        {sermon.category}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                        {new Date(sermon.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => handlePin(sermon._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Pin size={20} fill="currentColor" />
                    </button>
                    <button 
                      onClick={() => handleEdit(sermon)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(sermon._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {unpinnedSermons.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-4">All Sermons</h2>
          <div className="space-y-4">
            {unpinnedSermons.map((sermon) => (
              <Card key={sermon._id} hover>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(sermon.type)}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-blue-900">{sermon.title}</h3>
                        <p className="text-gray-600">{sermon.pastor}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center mt-2">
                      <span className="text-xs bg-blue-100 text-blue-900 px-3 py-1 rounded-full font-semibold">
                        {sermon.category}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                        {new Date(sermon.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => handlePin(sermon._id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Pin size={20} />
                    </button>
                    <button 
                      onClick={() => handleEdit(sermon)}
                      className="p-2 text-blue-900 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(sermon._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSermons;