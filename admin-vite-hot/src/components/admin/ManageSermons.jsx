import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Star, X, Image as ImageIcon, RotateCcw, RotateCw, Eye, AlignLeft, AlignCenter, AlignRight, AlignJustify, Code, List, ListOrdered } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const TipTapToolbar = React.memo(({ editor, onImageUpload, uploading }) => {
  if (!editor) return null;

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) onImageUpload(file, editor);
    e.target.value = '';
  };

  return (
    <div className="border border-gray-300 rounded-lg bg-white p-3 space-y-3">
      <div className="flex flex-wrap gap-2 items-center border-b border-gray-200 pb-3">
        <div className="flex gap-1 border-r border-gray-300 pr-3">
          {[
            { action: 'toggleBold', label: 'B', key: 'bold' },
            { action: 'toggleItalic', label: 'I', key: 'italic' },
            { action: 'toggleStrike', label: 'S', key: 'strike' }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => editor.chain().focus()[btn.action]().run()}
              disabled={!editor.can().chain().focus()[btn.action]().run()}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                editor.isActive(btn.key) ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 border-r border-gray-300 pr-3">
          {[2, 3].map(level => (
            <button
              key={`h${level}`}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              className={`px-3 py-2 rounded text-sm font-bold transition-colors ${
                editor.isActive('heading', { level }) ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              H{level}
            </button>
          ))}
        </div>

        <div className="flex gap-1 border-r border-gray-300 pr-3">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-2 rounded transition-colors ${
              editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-2 rounded transition-colors ${
              editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title="Ordered List"
          >
            <ListOrdered size={16} />
          </button>
        </div>

        <div className="flex gap-1 border-r border-gray-300 pr-3">
          {[
            { align: 'left', icon: AlignLeft },
            { align: 'center', icon: AlignCenter },
            { align: 'right', icon: AlignRight },
            { align: 'justify', icon: AlignJustify }
          ].map(({ align, icon: Icon }) => (
            <button
              key={align}
              onClick={() => editor.chain().focus().setTextAlign(align).run()}
              className={`px-3 py-2 rounded transition-colors ${
                editor.isActive({ textAlign: align }) ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title={`Align ${align}`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              editor.isActive('blockquote') ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title="Blockquote"
          >
            "
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-3 py-2 rounded transition-colors ${
              editor.isActive('codeBlock') ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title="Code Block"
          >
            <Code size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 border-r border-gray-300 pr-3">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
            title="Undo"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
            title="Redo"
          >
            <RotateCw size={16} />
          </button>
        </div>

        <label className={`px-3 py-2 rounded bg-gray-100 flex items-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors text-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <ImageIcon size={16} />
          {uploading ? 'Uploading...' : 'Image'}
          <input type="file" accept="image/*" onChange={handleImageFileUpload} disabled={uploading} className="hidden" />
        </label>

        <button
          onClick={() => {
            if (window.confirm('Clear all content?')) {
              editor.chain().focus().clearContent().run();
            }
          }}
          className="px-3 py-2 rounded bg-red-100 text-red-600 hover:bg-red-200 text-sm transition-colors ml-auto"
        >
          Clear
        </button>
      </div>
    </div>
  );
});

TipTapToolbar.displayName = 'TipTapToolbar';

const PreviewModal = ({ isOpen, onClose, formData, descriptionHtml }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-900">Preview</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{formData.title || 'Untitled'}</h1>
            <div className="flex flex-wrap gap-3 text-gray-600 text-sm sm:text-base">
              <span className="font-semibold">By {formData.pastor || 'Unknown'}</span>
              <span>•</span>
              <span>{formData.date ? new Date(formData.date).toLocaleDateString() : 'No date'}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">{formData.category}</span>
            </div>
          </div>

          {formData.thumbnail && <img src={formData.thumbnail} alt="Thumbnail" className="w-full h-96 object-cover rounded-lg shadow-md" />}

          {formData.videoUrl && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-md">
              <iframe src={formData.videoUrl} className="w-full h-full" allowFullScreen allow="autoplay" title={formData.title} />
            </div>
          )}

          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} className="text-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SermonCard = ({ sermon, onEdit, onDelete, onPin, isPinned }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {sermon.thumbnail ? (
          <img src={sermon.thumbnail} alt={sermon.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : sermon.videoUrl ? (
          <div className="w-full h-full flex items-center justify-center bg-blue-50">
            <div className="text-center">
              <div className="text-5xl mb-2">🎥</div>
              <p className="text-sm text-gray-600 font-medium">Video</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-50">
            <div className="text-center">
              <div className="text-5xl mb-2">📖</div>
              <p className="text-sm text-gray-600 font-medium">Text</p>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white text-gray-900 text-xs font-bold rounded shadow-sm">
            {sermon.type === 'text' ? '📖' : sermon.type === 'photo' ? '🖼️' : '🎥'}
          </span>
        </div>

        {isPinned && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-white text-xs font-bold rounded shadow-md">
              <Star size={12} fill="currentColor" /> Featured
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col h-full">
        <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2">{sermon.title}</h3>
        
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-3 font-medium">{sermon.pastor}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-semibold">{sermon.category}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded">{new Date(sermon.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <button onClick={() => onEdit(sermon)} className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-1">
            <Edit size={16} /> Edit
          </button>
          <button onClick={() => onDelete(sermon._id)} className="flex-1 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-1">
            <Trash2 size={16} /> Delete
          </button>
          <button onClick={() => onPin(sermon._id)} className={`px-3 py-2 rounded font-semibold text-sm transition-colors ${isPinned ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <Star size={16} fill={isPinned ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ManageSermons() {
  const [sermons, setSermons] = useState([
    {
      _id: '1',
      title: 'The Power of Faith',
      pastor: 'Pastor John Doe',
      date: '2024-01-20',
      category: 'Sunday Service',
      type: 'text',
      pinned: true,
      thumbnail: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=300&fit=crop',
      videoUrl: '',
      descriptionHtml: '<h2>The Power of Faith</h2><p>This sermon explores the transformative power of faith in our daily lives.</p>'
    },
    {
      _id: '2',
      title: 'Walking in Grace',
      pastor: 'Pastor Sarah Smith',
      date: '2024-01-13',
      category: 'Sunday Service',
      type: 'video',
      pinned: false,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f70504c8a?w=400&h=300&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      descriptionHtml: '<h2>Walking in Grace</h2><p>Learn how to embrace God\'s grace in every situation.</p>'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sermonType, setSermonType] = useState('text');
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pinnedCount, setPinnedCount] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    pastor: '',
    date: '',
    category: 'Sunday Service',
    thumbnail: '',
    videoUrl: '',
    type: 'text'
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const debouncedUpdateHtml = useCallback(debounce((html) => setDescriptionHtml(html), 300), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-4' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start typing...' })
    ],
    content: '<p></p>',
    onUpdate: ({ editor }) => debouncedUpdateHtml(editor.getHTML())
  });

  const handleImageUpload = async (file, editorInstance) => {
    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        editorInstance.chain().focus().setImage({ src: e.target.result }).run();
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
    }
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (result) => {
        setThumbnailPreview(result.target.result);
        setFormData({ ...formData, thumbnail: result.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', pastor: '', date: '', category: 'Sunday Service', thumbnail: '', videoUrl: '', type: 'text' });
    setDescriptionHtml('');
    setSermonType('text');
    setEditingId(null);
    setThumbnailPreview(null);
    if (editor) editor.commands.setContent('<p></p>');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.pastor || !formData.date) {
      alert('Please fill required fields');
      return;
    }
    if (sermonType === 'video' && !formData.videoUrl) {
      alert('Please add video URL');
      return;
    }
    if (!descriptionHtml || descriptionHtml === '<p></p>') {
      alert('Please add sermon content');
      return;
    }

    const newSermon = {
      ...formData,
      type: sermonType,
      descriptionHtml,
      _id: editingId || Date.now().toString(),
      pinned: editingId ? sermons.find(s => s._id === editingId)?.pinned : false
    };

    if (editingId) {
      setSermons(sermons.map(s => s._id === editingId ? newSermon : s));
    } else {
      setSermons([...sermons, newSermon]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (sermon) => {
    setFormData({ ...sermon, thumbnail: sermon.thumbnail || '' });
    setDescriptionHtml(sermon.descriptionHtml || '');
    setThumbnailPreview(sermon.thumbnail);
    setSermonType(sermon.type || 'text');
    setEditingId(sermon._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this sermon?')) {
      setSermons(sermons.filter(s => s._id !== id));
    }
  };

  const handlePin = (id) => {
    const sermon = sermons.find(s => s._id === id);
    if (sermon.pinned) {
      setSermons(sermons.map(s => s._id === id ? { ...s, pinned: false } : s));
      setPinnedCount(pinnedCount - 1);
    } else if (pinnedCount < 3) {
      setSermons(sermons.map(s => s._id === id ? { ...s, pinned: true } : s));
      setPinnedCount(pinnedCount + 1);
    } else {
      alert('Maximum 3 pinned sermons allowed');
    }
  };

  const pinnedSermons = sermons.filter(s => s.pinned);
  const unpinnedSermons = sermons.filter(s => !s.pinned);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Manage Sermons</h1>
              <p className="text-gray-600">Create, edit, and organize your sermon collection</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
            >
              <Plus size={20} /> Add Sermon
            </button>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-900 font-semibold">⭐ Featured: <span className="text-lg">{pinnedCount}/3</span></p>
            <p className="text-blue-800 text-sm mt-1">Featured sermons appear on your homepage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Form - Sticky */}
          {showForm && (
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-lg border border-gray-200 shadow-lg max-h-[calc(100vh-80px)] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                  <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit' : 'New'} Sermon</h2>
                  <button onClick={() => { setShowForm(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'text', label: '📖' },
                        { id: 'photo', label: '🖼️' },
                        { id: 'video', label: '🎥' }
                      ].map(type => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setSermonType(type.id);
                            setFormData({ ...formData, type: type.id });
                          }}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            sermonType === type.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-2xl">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Title *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Sermon title" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" required />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Pastor *</label>
                    <input type="text" value={formData.pastor} onChange={(e) => setFormData({ ...formData, pastor: e.target.value })} placeholder="Pastor name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" required />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Date *</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" required />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                      <option>Sunday Service</option>
                      <option>Bible Study</option>
                      <option>Special Event</option>
                      <option>Youth Ministry</option>
                    </select>
                  </div>

                  {(sermonType === 'photo' || sermonType === 'video') && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Thumbnail</label>
                      <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      {thumbnailPreview && <img src={thumbnailPreview} alt="Preview" className="w-full h-24 object-cover rounded-lg mt-2" />}
                    </div>
                  )}

                  {sermonType === 'video' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Video URL *</label>
                      <input type="url" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} placeholder="YouTube/Facebook embed URL" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button type="button" onClick={() => setShowPreview(true)} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-1">
                      <Eye size={16} /> Preview
                    </button>
                    <button type="submit" className="flex-1 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-semibold text-sm transition-colors">
                      {editingId ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className={showForm ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {showForm && (
              <div className="mb-8 bg-white rounded-lg border border-gray-200 shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sermon Content</h3>
                <TipTapToolbar editor={editor} onImageUpload={handleImageUpload} uploading={uploading} />
                <div className="border border-t-0 border-gray-300 rounded-b-lg bg-white min-h-96 p-4">
                  <EditorContent editor={editor} />
                </div>
              </div>
            )}

            {/* Featured Sermons */}
            {pinnedSermons.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star size={28} fill="currentColor" className="text-amber-400" /> Featured Sermons
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinnedSermons.map(sermon => (
                    <SermonCard key={sermon._id} sermon={sermon} onEdit={handleEdit} onDelete={handleDelete} onPin={handlePin} isPinned={true} />
                  ))}
                </div>
              </div>
            )}

            {/* All Sermons */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">All Sermons ({unpinnedSermons.length})</h2>
              {unpinnedSermons.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="text-5xl mb-4">📖</div>
                  <p className="text-gray-600 text-lg font-medium">No sermons yet</p>
                  <p className="text-gray-500 text-sm mt-2">Click "Add Sermon" to create your first sermon</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unpinnedSermons.map(sermon => (
                    <SermonCard 
                      key={sermon._id} 
                      sermon={sermon} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                      onPin={handlePin} 
                      isPinned={false} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
        formData={formData} 
        descriptionHtml={descriptionHtml} 
      />
    </div>
  );
}
