import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Edit, Trash2, Pin, X, Image as ImageIcon, 
  RotateCcw, RotateCw, Eye, AlertCircle 
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { sermonService } from '../../services/api/sermonService';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

// ──────────────────────────────────────────────────────────────────────────────
// Debounce
// ──────────────────────────────────────────────────────────────────────────────
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ──────────────────────────────────────────────────────────────────────────────
// Enhanced Toolbar (more buttons + better mobile feel)
// ──────────────────────────────────────────────────────────────────────────────
const TipTapToolbar = React.memo(({ editor, onImageUpload, uploading }) => {
  if (!editor) return null;

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) onImageUpload(file, editor);
    e.target.value = '';
  };

  const handleClear = () => {
    if (window.confirm('Clear all content? This cannot be undone.')) {
      editor.chain().focus().clearContent().run();
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-2.5 flex flex-wrap gap-1.5 items-center shadow-sm">
      {/* Basic formatting */}
      <div className="flex gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded text-sm font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          title="H2"
        >
          H2
        </button>
      </div>

      {/* Lists & Align */}
      <div className="flex gap-1 border-l border-gray-200 pl-2 ml-1">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          title="Bullet List"
        >
          •
        </button>
      </div>

      {/* Undo / Redo */}
      <div className="flex gap-1 border-l border-gray-200 pl-2 ml-1">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
          title="Undo"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
          title="Redo"
        >
          <RotateCw size={16} />
        </button>
      </div>

      {/* Image + Clear */}
      <div className="flex gap-2 ml-auto items-center">
        <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-colors cursor-pointer text-sm font-medium
          ${uploading ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50 border-gray-300'}`}>
          <ImageIcon size={16} />
          {uploading ? 'Uploading...' : 'Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <button
          onClick={handleClear}
          className="px-3 py-1.5 rounded-md bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
});

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
    title: '', pastor: '', date: '', category: 'Sunday Service',
    description: '', thumbnail: '', videoUrl: '', type: 'text'
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const debouncedUpdateHtml = useCallback(debounce(html => setDescriptionHtml(html), 300), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded-xl my-6 shadow-sm' } }),
      Placeholder.configure({ placeholder: 'Start writing your sermon here...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '<p></p>',
    onUpdate: ({ editor }) => debouncedUpdateHtml(editor.getHTML()),
  });

  useEffect(() => {
    fetchSermons();
  }, []);

  useEffect(() => {
    if (editor && editingId) {
      editor.commands.setContent(descriptionHtml || '<p></p>', false);
    }
  }, [editingId, editor]);

  const fetchSermons = async () => {
    try {
      const { sermons: data } = await sermonService.getSermons({ limit: 100 });
      setSermons(data || []);
      setPinnedCount(data.filter(s => s.pinned).length);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ title:'', pastor:'', date:'', category:'Sunday Service', description:'', thumbnail:'', videoUrl:'', type:'text' });
    setDescriptionHtml('');
    setSermonType('text');
    setEditingId(null);
    setThumbnailPreview(null);
    editor?.commands.setContent('<p></p>');
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // Cloudinary Image Upload with better placeholder handling
  // ──────────────────────────────────────────────────────────────────────────────
  const handleImageUpload = async (file, editorInstance) => {
    try {
      setUploading(true);
      const tempId = `temp-${Date.now()}`;

      editorInstance.chain().focus().setImage({
        src: 'https://placehold.co/600x400/e5e7eb/64748b?text=Uploading...',
        alt: tempId
      }).run();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'church_sermons');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await res.json();
      if (!data.secure_url) throw new Error('Upload failed');

      // Replace placeholder
      editorInstance.chain().focus().command(({ tr, dispatch }) => {
        tr.doc.descendants((node, pos) => {
          if (node.type.name === 'image' && node.attrs.alt === tempId) {
            tr.setNodeMarkup(pos, undefined, { src: data.secure_url, alt: file.name });
          }
        });
        dispatch?.(tr);
        return true;
      }).run();

    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFormData(prev => ({ ...prev, thumbnail: file }));
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (sermonType === 'video' && !formData.videoUrl?.trim()) {
      alert('Video URL is required for video sermons');
      return;
    }
    if (!descriptionHtml || descriptionHtml.trim() === '<p></p>') {
      alert('Please add sermon content');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        type: sermonType,
        descriptionHtml,
        description: editor?.getText()?.trim() || ''
      };

      if (editingId) {
        await sermonService.updateSermon(editingId, payload);
      } else {
        await sermonService.createSermon(payload);
      }

      resetForm();
      setShowForm(false);
      fetchSermons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save sermon');
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────────
  const pinned = sermons.filter(s => s.pinned);
  const others = sermons.filter(s => !s.pinned);

  return (
    <div className="min-h-screen bg-gray-50/40 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sermon Library</h1>
            <p className="text-gray-600 mt-1">Manage and organize all your sermons</p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => { resetForm(); setShowForm(true); }}
            className="w-full sm:w-auto"
          >
            New Sermon
          </Button>
        </div>

        {/* Pinned Counter */}
        <div className="mb-10 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-700 p-3 rounded-lg">
              <Pin size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Featured on Homepage</h3>
              <p className="text-sm text-gray-600">
                <span className="font-bold text-blue-700">{pinnedCount}</span> / 3 pinned
              </p>
            </div>
          </div>
        </div>

        {/* FORM - Full width on mobile / right column on desktop */}
        {showForm && (
          <div className="fixed inset-0 z-50 lg:static lg:z-auto bg-black/60 lg:bg-transparent flex items-start lg:items-stretch justify-center lg:justify-start overflow-y-auto">
            <div className="bg-white w-full max-w-3xl lg:max-w-none lg:w-full lg:rounded-xl shadow-2xl lg:shadow-lg lg:border lg:border-gray-200 mt-0 lg:mt-0 animate-in fade-in zoom-in-95 lg:animate-none">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? 'Edit Sermon' : 'Add New Sermon'}
                </h2>
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 lg:p-8 space-y-8">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Sermon Type
                  </label>
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { id: 'text',  icon: '📝', label: 'Text' },
                      { id: 'photo', icon: '📸', label: 'Photo' },
                      { id: 'video', icon: '🎥', label: 'Video' },
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSermonType(t.id)}
                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200
                          ${sermonType === t.id 
                            ? 'border-blue-600 bg-blue-50/70 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      >
                        <span className="text-3xl mb-2">{t.icon}</span>
                        <span className="font-medium text-sm">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-6">
                  <Input label="Title *" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  <Input label="Pastor *" value={formData.pastor} onChange={e => setFormData({...formData, pastor: e.target.value})} required />
                  <Input type="date" label="Date *" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option>Sunday Service</option>
                      <option>Bible Study</option>
                      <option>Special Event</option>
                      <option>Youth Ministry</option>
                      <option>Prayer Meeting</option>
                    </select>
                  </div>

                  {/* Editor */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Content *</label>
                    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
                      <TipTapToolbar editor={editor} onImageUpload={handleImageUpload} uploading={uploading} />
                      <div className="min-h-[400px] px-5 py-4 prose prose-blue max-w-none">
                        <EditorContent editor={editor} />
                      </div>
                    </div>
                  </div>

                  {/* Conditional fields */}
                  {(sermonType === 'photo' || sermonType === 'video') && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Thumbnail (recommended)</label>
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-5 py-3 rounded-lg transition-colors text-sm font-medium">
                          Choose Image
                          <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                        </label>
                        {thumbnailPreview && (
                          <img src={thumbnailPreview} alt="preview" className="h-20 w-32 object-cover rounded-lg shadow-sm" />
                        )}
                      </div>
                    </div>
                  )}

                  {sermonType === 'video' && (
                    <Input
                      label="Video Embed URL *"
                      value={formData.videoUrl}
                      onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading || uploading}
                    className="flex-1"
                  >
                    {loading ? 'Saving...' : editingId ? 'Update Sermon' : 'Create Sermon'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    disabled={loading}
                    className="flex-1 sm:flex-none sm:w-32"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sermons List */}
        <div className="space-y-12">
          {pinned.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Pin className="text-blue-600" size={28} />
                Featured Sermons
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pinned.map(s => (
                  <SermonCard 
                    key={s._id} 
                    sermon={s} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                    onPin={handlePin} 
                    isPinned 
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              All Sermons {pinned.length > 0 && `(${others.length})`}
            </h2>
            
            {others.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-700">No sermons yet</h3>
                <p className="text-gray-500 mt-2">Create your first sermon using the button above</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {others.map(s => (
                  <SermonCard 
                    key={s._id} 
                    sermon={s} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                    onPin={handlePin} 
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Modern Sermon Card
// ──────────────────────────────────────────────────────────────────────────────
const SermonCard = ({ sermon, onEdit, onDelete, onPin, isPinned = false }) => {
  const typeIcon = {
    text: '📝',
    photo: '📸',
    video: '🎥'
  }[sermon.type] || '📋';

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden bg-white">
      {/* Visual header */}
      <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative">
        {sermon.thumbnail ? (
          <img 
            src={sermon.thumbnail} 
            alt={sermon.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
            {typeIcon}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium shadow-sm">
            {typeIcon} {sermon.type.charAt(0).toUpperCase() + sermon.type.slice(1)}
          </span>
          {isPinned && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium shadow-sm flex items-center gap-1">
              <Pin size={12} fill="currentColor" /> Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg leading-tight text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
          {sermon.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4">{sermon.pastor}</p>

        <div className="flex flex-wrap gap-2 mb-5">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            {sermon.category}
          </span>
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
            {new Date(sermon.date).toLocaleDateString('en-GB', { 
              day: 'numeric', month: 'short', year: 'numeric' 
            })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 -mx-1">
          <button
            onClick={() => onPin(sermon._id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5
              ${isPinned 
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
          >
            <Pin size={16} fill={isPinned ? 'currentColor' : 'none'} />
            {isPinned ? 'Unpin' : 'Pin'}
          </button>

          <button
            onClick={() => onEdit(sermon)}
            className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <Edit size={16} />
            Edit
          </button>

          <button
            onClick={() => onDelete(sermon._id)}
            className="flex-1 py-2 px-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ManageSermons;