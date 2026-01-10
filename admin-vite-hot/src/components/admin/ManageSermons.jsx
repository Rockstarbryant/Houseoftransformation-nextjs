import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit, Trash2, Star, X, Image as ImageIcon, 
  RotateCcw, RotateCw, Eye, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, List, ListOrdered 
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { sermonService } from '../../services/api/sermonService';

// ─── Debounce ────────────────────────────────────────────────────────────────
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ─── Toolbar (very close to dummy style) ─────────────────────────────────────
const TipTapToolbar = React.memo(({ editor, onImageUpload, uploading }) => {
  if (!editor) return null;

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) onImageUpload(file, editor);
    e.target.value = '';
  };

  return (
    <div className="border border-gray-300 rounded-lg bg-white p-3 space-y-3 shadow-sm">
      {/* First row: basic + headings + lists + align + quote/code */}
      <div className="flex flex-wrap gap-2 items-center border-b border-gray-200 pb-3">
        {/* B I S */}
        <div className="flex gap-1 border-r border-gray-300 pr-3">
          {[
            { action: 'toggleBold', label: 'B', active: 'bold' },
            { action: 'toggleItalic', label: 'I', active: 'italic' },
            { action: 'toggleStrike', label: 'S', active: 'strike' }
          ].map(btn => (
            <button
              key={btn.label}
              onClick={() => editor.chain().focus()[btn.action]().run()}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                editor.isActive(btn.active) 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* H2 H3 */}
        <div className="flex gap-1 border-r border-gray-300 pr-3">
          {[2, 3].map(level => (
            <button
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
                editor.isActive('heading', { level }) 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              H{level}
            </button>
          ))}
        </div>

        {/* Bullet + Numbered list */}
        <div className="flex gap-1 border-r border-gray-300 pr-3">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1.5 rounded transition-colors ${
              editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1.5 rounded transition-colors ${
              editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <ListOrdered size={16} />
          </button>
        </div>

        {/* Text align */}
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
              className={`px-3 py-1.5 rounded transition-colors ${
                editor.isActive({ textAlign: align }) ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Second row: undo/redo + image + clear */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 border-r border-gray-300 pr-3">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <RotateCw size={16} />
          </button>
        </div>

        <label className={`flex items-center gap-2 px-4 py-2 rounded bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors text-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
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
          className="ml-auto px-4 py-2 rounded bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  );
});

// ─── Preview Modal (almost exact match to dummy) ─────────────────────────────
const PreviewModal = ({ isOpen, onClose, formData, descriptionHtml }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">Sermon Preview</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{formData.title || 'Untitled Sermon'}</h1>
            <div className="flex flex-wrap gap-4 text-gray-600 text-sm md:text-base">
              <span className="font-medium">By {formData.pastor || 'Unknown Pastor'}</span>
              <span>•</span>
              <span>{formData.date ? new Date(formData.date).toLocaleDateString() : 'No date'}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">{formData.category}</span>
            </div>
          </div>

          {formData.thumbnail && (
            <img 
              src={typeof formData.thumbnail === 'string' ? formData.thumbnail : URL.createObjectURL(formData.thumbnail)}
              alt="Sermon thumbnail" 
              className="w-full h-64 md:h-96 object-cover rounded-xl shadow-md" 
            />
          )}

          {formData.videoUrl && (
            <div className="aspect-video rounded-xl overflow-hidden shadow-md bg-black">
              <iframe 
                src={formData.videoUrl.replace('watch?v=', 'embed/')} 
                className="w-full h-full" 
                allowFullScreen 
                title={formData.title}
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none text-gray-800">
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml || '<p>No content yet...</p>' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ManageSermons() {
  const [sermons, setSermons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sermonType, setSermonType] = useState('text');
  const [loading, setLoading] = useState(false);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [descriptionHtml, setDescriptionHtml] = useState('');
  
  const [formData, setFormData] = useState({
    title: '', pastor: '', date: '', category: 'Sunday Service',
    thumbnail: '', videoUrl: '', type: 'text'
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const debouncedUpdateHtml = useCallback(debounce(html => setDescriptionHtml(html), 300), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-4' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start typing your sermon here...' })
    ],
    content: '<p></p>',
    onUpdate: ({ editor }) => debouncedUpdateHtml(editor.getHTML())
  });

  // ─── Your existing API logic (unchanged) ─────────────────────────────────────
  useEffect(() => { fetchSermons(); }, []);

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
    setFormData({ title:'', pastor:'', date:'', category:'Sunday Service', thumbnail:'', videoUrl:'', type:'text' });
    setDescriptionHtml('');
    setSermonType('text');
    setEditingId(null);
    setThumbnailPreview(null);
    editor?.commands.setContent('<p></p>');
  };

  // Your Cloudinary upload function (unchanged)
  const handleImageUpload = async (file, editorInstance) => { /* ... your existing code ... */ };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, thumbnail: file });
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => { /* ... your existing submit logic ... */ };

  const handleEdit = (sermon) => {
    setFormData({
      title: sermon.title,
      pastor: sermon.pastor,
      date: sermon.date.split('T')[0],
      category: sermon.category,
      thumbnail: sermon.thumbnail || '',
      videoUrl: sermon.videoUrl || '',
      type: sermon.type
    });
    setDescriptionHtml(sermon.descriptionHtml || '');
    setThumbnailPreview(sermon.thumbnail);
    setSermonType(sermon.type);
    setEditingId(sermon._id);
    setShowForm(true);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  const pinnedSermons = sermons.filter(s => s.pinned);
  const otherSermons = sermons.filter(s => !s.pinned);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header + Add button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Manage Sermons</h1>
            <p className="text-gray-600 mt-1">Create, edit and organize your sermon collection</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} /> Add Sermon
          </button>
        </div>

        {/* Featured counter - very similar to dummy */}
        <div className="mb-10 p-5 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Star className="text-amber-500" size={28} fill="currentColor" />
            <div>
              <h3 className="font-semibold text-blue-900 text-lg">
                Featured: {pinnedCount}/3
              </h3>
              <p className="text-blue-700 text-sm mt-0.5">
                Featured sermons appear on your homepage
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Form Sidebar (desktop) / Full modal-like (mobile) */}
          {showForm && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg sticky top-6">
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? 'Edit Sermon' : 'New Sermon'}
                  </h2>
                  <button 
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto">
                  {/* Type selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['text', 'photo', 'video'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSermonType(type)}
                          className={`p-4 rounded-lg border-2 text-center transition-all ${
                            sermonType === type 
                              ? 'border-blue-600 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-3xl mb-2">
                            {type === 'text' ? '📖' : type === 'photo' ? '🖼️' : '🎥'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pastor *</label>
                      <input
                        type="text"
                        value={formData.pastor}
                        onChange={e => setFormData({...formData, pastor: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date *</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option>Sunday Service</option>
                        <option>Bible Study</option>
                        <option>Special Event</option>
                        <option>Youth Ministry</option>
                        <option>Prayer Meeting</option>
                      </select>
                    </div>

                    {(sermonType === 'photo' || sermonType === 'video') && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thumbnail</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {thumbnailPreview && (
                          <img src={thumbnailPreview} alt="preview" className="mt-3 h-32 w-full object-cover rounded-lg" />
                        )}
                      </div>
                    )}

                    {sermonType === 'video' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Video URL *</label>
                        <input
                          type="url"
                          value={formData.videoUrl}
                          onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Eye size={18} /> Preview
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || uploading}
                      className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
                    >
                      {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main content area */}
          <div className={showForm ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {/* Editor when form is open */}
            {showForm && (
              <div className="mb-12 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold text-gray-900">Sermon Content *</h3>
                </div>
                <div className="p-6">
                  <TipTapToolbar editor={editor} onImageUpload={handleImageUpload} uploading={uploading} />
                  <div className="border border-t-0 border-gray-300 rounded-b-lg min-h-[500px] bg-white">
                    <EditorContent editor={editor} className="prose max-w-none p-6" />
                  </div>
                </div>
              </div>
            )}

            {/* Pinned Sermons */}
            {pinnedSermons.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Star className="text-amber-500" size={28} fill="currentColor" />
                  Featured Sermons
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedSermons.map(sermon => (
                    <SermonCard 
                      key={sermon._id} 
                      sermon={sermon} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                      onPin={handlePin} 
                      isPinned 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All other sermons */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All Sermons {pinnedSermons.length > 0 && `(${otherSermons.length})`}
              </h2>
              {otherSermons.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                  <div className="text-6xl mb-4 opacity-40">📖</div>
                  <h3 className="text-xl font-medium text-gray-700">No sermons yet</h3>
                  <p className="text-gray-500 mt-2">Start by clicking "Add Sermon"</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherSermons.map(sermon => (
                    <SermonCard 
                      key={sermon._id} 
                      sermon={sermon} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                      onPin={handlePin} 
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

// ─── Sermon Card Component (modernized but clean) ────────────────────────────
function SermonCard({ sermon, onEdit, onDelete, onPin, isPinned }) {
  const typeIcon = {
    text: '📖',
    photo: '🖼️',
    video: '🎥'
  }[sermon.type] || '📋';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
        {sermon.thumbnail ? (
          <img
            src={sermon.thumbnail}
            alt={sermon.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
            {typeIcon}
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium shadow-sm">
            {typeIcon} {sermon.type}
          </span>
          {isPinned && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium shadow-sm flex items-center gap-1">
              <Star size={12} fill="currentColor" /> Featured
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
          {sermon.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">{sermon.pastor}</p>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            {sermon.category}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
            {new Date(sermon.date).toLocaleDateString()}
          </span>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => onPin(sermon._id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              isPinned 
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isPinned ? 'Unpin' : 'Pin'}
          </button>
          <button
            onClick={() => onEdit(sermon)}
            className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(sermon._id)}
            className="flex-1 py-2 px-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}