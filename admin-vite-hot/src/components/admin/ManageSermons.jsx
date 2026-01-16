import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit, Trash2, Star, X, Image as ImageIcon, 
  RotateCcw, RotateCw, Eye, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, List, ListOrdered, CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { sermonService } from '../../services/api/sermonService';

// ─── Notification UI (Toast System) ──────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const colors = {
    success: "border-emerald-100 bg-emerald-50/90",
    error: "border-rose-100 bg-rose-50/90",
    info: "border-blue-100 bg-blue-50/90"
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-right-10 duration-300 ${colors[type]}`}>
      {icons[type]}
      <p className="text-sm font-semibold text-gray-800">{message}</p>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors">
        <X size={14} className="text-gray-500" />
      </button>
    </div>
  );
};

// ─── Debounce ────────────────────────────────────────────────────────────────
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ─── Toolbar (Refined Styles) ────────────────────────────────────────────────
const TipTapToolbar = React.memo(({ editor, onImageUpload, uploading }) => {
  if (!editor) return null;

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) onImageUpload(file, editor);
    e.target.value = '';
  };

  const btnClass = (active) => `
    p-2 rounded-lg transition-all duration-200 
    ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}
  `;

  return (
    <div className="border border-gray-200 rounded-t-2xl bg-gray-50/50 p-3 space-y-3 backdrop-blur-sm">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1.5 border-r border-gray-200 pr-3">
          {[
            { action: 'toggleBold', icon: <span className="font-bold">B</span>, active: 'bold' },
            { action: 'toggleItalic', icon: <span className="italic font-serif">I</span>, active: 'italic' },
            { action: 'toggleStrike', icon: <span className="line-through">S</span>, active: 'strike' }
          ].map(btn => (
            <button key={btn.action} onClick={() => editor.chain().focus()[btn.action]().run()} className={btnClass(editor.isActive(btn.active))}>
              {btn.icon}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 border-r border-gray-200 pr-3">
          {[2, 3].map(level => (
            <button key={level} onClick={() => editor.chain().focus().toggleHeading({ level }).run()} className={btnClass(editor.isActive('heading', { level }))}>
              <span className="font-black">H{level}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 border-r border-gray-200 pr-3">
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}>
            <List size={18} />
          </button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}>
            <ListOrdered size={18} />
          </button>
        </div>

        <div className="flex gap-1.5">
          {[
            { align: 'left', icon: AlignLeft },
            { align: 'center', icon: AlignCenter },
            { align: 'right', icon: AlignRight }
          ].map(({ align, icon: Icon }) => (
            <button key={align} onClick={() => editor.chain().focus().setTextAlign(align).run()} className={btnClass(editor.isActive({ textAlign: align }))}>
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center border-t border-gray-200 pt-3">
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30">
          <RotateCcw size={18} />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30">
          <RotateCw size={18} />
        </button>

        <label className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 cursor-pointer hover:bg-indigo-100 transition-all text-sm font-medium ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <ImageIcon size={18} />
          {uploading ? 'Uploading...' : 'Add Image'}
          <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
        </label>

        <button
          onClick={() => window.confirm('Clear all content?') && editor.chain().focus().clearContent().run()}
          className="ml-auto px-4 py-2 rounded-lg text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-colors"
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
});

// ─── Preview Modal (Sleek Redesign) ──────────────────────────────────────────
const PreviewModal = ({ isOpen, onClose, formData, descriptionHtml }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-8 py-5 border-b flex items-center justify-between bg-white/80 sticky top-0 backdrop-blur-md">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Sermon Preview</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 md:p-12 overflow-y-auto space-y-10">
          <header className="space-y-4">
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
              {formData.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">{formData.title || 'Untitled Sermon'}</h1>
            <div className="flex items-center gap-4 text-slate-500 font-medium italic">
              <span>By {formData.pastor || 'Guest Speaker'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span>{formData.date ? new Date(formData.date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Date TBD'}</span>
            </div>
          </header>

          {formData.thumbnail && (
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              <img 
                src={typeof formData.thumbnail === 'string' ? formData.thumbnail : URL.createObjectURL(formData.thumbnail)}
                alt="Thumbnail" 
                className="w-full h-[400px] object-cover" 
              />
            </div>
          )}

          {formData.videoUrl && (
            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-900 ring-8 ring-slate-100">
              <iframe 
                src={formData.videoUrl.replace('watch?v=', 'embed/')} 
                className="w-full h-full" 
                allowFullScreen 
              />
            </div>
          )}

          <article className="prose prose-indigo prose-lg max-w-none text-slate-700 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml || '<p class="text-slate-400 italic">No content available...</p>' }} />
          </article>
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
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', pastor: '', date: '', category: 'Sunday Service',
    thumbnail: '', videoUrl: '', type: 'text'
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const showNotify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const debouncedUpdateHtml = useCallback(debounce(html => setDescriptionHtml(html), 300), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded-2xl my-6 shadow-lg' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Share your inspiration...' })
    ],
    content: '<p></p>',
    onUpdate: ({ editor }) => debouncedUpdateHtml(editor.getHTML())
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
      const data = await sermonService.getSermons({ limit: 100 });
      setSermons(data.sermons || []);
      setPinnedCount((data.sermons || []).filter(s => s.pinned).length);
    } catch (error) {
      showNotify('Failed to fetch sermons', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', pastor: '', date: '', category: 'Sunday Service', description: '', thumbnail: '', videoUrl: '', type: 'text' });
    setDescriptionHtml('');
    setSermonType('text');
    setEditingId(null);
    setThumbnailPreview(null);
    if (editor) editor.commands.setContent('<p></p>');
  };

  const handleImageUpload = async (file, editorInstance) => {
    try {
      setUploading(true);
      const placeholderId = `upload-${Date.now()}`;
      editorInstance.chain().focus().setImage({ 
          src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%236366f1"%3EUploading high quality image...%3C/text%3E%3C/svg%3E',
          alt: placeholderId 
      }).run();

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', 'church_sermons');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: cloudinaryFormData
      });

      const data = await response.json();
      
      if (data.secure_url) {
        const { state } = editorInstance;
        state.doc.descendants((node) => {
          if (node.type.name === 'image' && node.attrs.alt === placeholderId) {
            editorInstance.chain().focus().setImage({ src: data.secure_url, alt: file.name }).run();
          }
        });
      } else {
        showNotify('Image upload failed', 'error');
        editorInstance.chain().focus().deleteSelection().run();
      }
    } catch (error) {
      showNotify('Error uploading image', 'error');
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
    if (sermonType === 'video' && !formData.videoUrl) return showNotify('Please add a video URL', 'info');
    if (!descriptionHtml || descriptionHtml === '<p></p>') return showNotify('Sermon content is empty', 'info');

    try {
      setLoading(true);
      const dataToSubmit = { ...formData, type: sermonType, descriptionHtml, description: editor?.getText() || '' };

      if (editingId) {
        await sermonService.updateSermon(editingId, dataToSubmit);
        showNotify('Sermon updated successfully');
      } else {
        await sermonService.createSermon(dataToSubmit);
        showNotify('New sermon published');
      }

      setShowForm(false);
      resetForm();
      fetchSermons();
    } catch (error) {
      showNotify(error.response?.data?.message || 'Error saving sermon', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sermon) => {
    setFormData({ ...sermon, thumbnail: sermon.thumbnail || '', descriptionHtml: sermon.descriptionHtml || '' });
    setDescriptionHtml(sermon.descriptionHtml || '');
    setThumbnailPreview(sermon.thumbnail);
    setSermonType(sermon.type || 'text');
    setEditingId(sermon._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this sermon?')) {
      try {
        await sermonService.deleteSermon(id);
        showNotify('Sermon permanently removed', 'success');
        fetchSermons();
      } catch (error) {
        showNotify('Failed to delete', 'error');
      }
    }
  };

  const handlePin = async (id) => {
    if (pinnedCount >= 3 && !sermons.find(s => s._id === id)?.pinned) {
      return showNotify('Limit reached: Only 3 featured sermons allowed', 'info');
    }
    try {
      const sermon = sermons.find(s => s._id === id);
      await sermonService.updateSermon(id, { pinned: !sermon.pinned });
      showNotify(sermon.pinned ? 'Removed from featured' : 'Marked as featured');
      fetchSermons();
    } catch (error) {
      showNotify('Update failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Sermon <span className="text-indigo-600 underline decoration-indigo-200 decoration-8 underline-offset-4">Studio</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Manage and curate your spiritual library</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 hover:scale-105"
          >
            <Plus size={22} /> Add New Entry
          </button>
        </header>

        {/* Featured Pulse Bar */}
        <div className="mb-12 p-1 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 rounded-3xl">
          <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-[22px] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 ring-4 ring-amber-50">
                <Star size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-black text-amber-700">Featured Spotlight</p>
                <h3 className="font-bold text-slate-800 text-lg">
                  {pinnedCount} of 3 Slots Occupied
                </h3>
              </div>
            </div>
            <div className="hidden sm:block h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(pinnedCount/3)*100}%` }} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Form Section */}
          {showForm && (
            <div className="lg:col-span-4 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden sticky top-6">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    {editingId ? 'Edit Draft' : 'New Creation'}
                  </h2>
                  <button onClick={() => { setShowForm(false); resetForm(); }} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {/* Type Selector (Gamified) */}
                  <div className="grid grid-cols-3 gap-3">
                    {['text', 'photo', 'video'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSermonType(type)}
                        className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                          sermonType === type 
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-inner' 
                            : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <span className="text-2xl">{type === 'text' ? '📖' : type === 'photo' ? '🖼️' : '🎥'}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{type}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-5">
                    {[
                      { label: 'Sermon Title', key: 'title', type: 'text', placeholder: 'Enter a powerful title...' },
                      { label: 'Lead Pastor', key: 'pastor', type: 'text', placeholder: 'Name of speaker...' },
                      { label: 'Service Date', key: 'date', type: 'date' }
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{field.label}</label>
                        <input
                          type={field.type}
                          value={formData[field.key]}
                          placeholder={field.placeholder}
                          onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium appearance-none"
                      >
                        <option>Sunday Service</option>
                        <option>Bible Study</option>
                        <option>Special Event</option>
                      </select>
                    </div>

                    {sermonType !== 'text' && (
                      <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                         <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                         <div className="text-center">
                            <ImageIcon className="mx-auto mb-2 text-slate-400" size={32} />
                            <p className="text-sm font-bold text-slate-600">Upload Cover Image</p>
                            <p className="text-[10px] text-slate-400 uppercase mt-1">PNG, JPG up to 10MB</p>
                         </div>
                         {thumbnailPreview && <img src={thumbnailPreview} className="mt-4 rounded-xl h-24 w-full object-cover shadow-lg" />}
                      </div>
                    )}

                    {sermonType === 'video' && (
                      <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                        placeholder="Paste YouTube Link..."
                        className="w-full px-5 py-4 bg-rose-50 border border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 outline-none"
                      />
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowPreview(true)} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 font-black text-xs uppercase">
                      <Eye size={16} /> Preview
                    </button>
                    <button onClick={handleSubmit} disabled={loading || uploading} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-xs uppercase shadow-lg shadow-indigo-100 disabled:opacity-50">
                      {loading ? 'Processing...' : editingId ? 'Update Entry' : 'Publish Entry'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feed Section */}
          <div className={showForm ? 'lg:col-span-8' : 'lg:col-span-12'}>
            {showForm && (
              <div className="mb-12 animate-in slide-in-from-bottom-6 duration-700">
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden ring-1 ring-slate-100">
                  <TipTapToolbar editor={editor} onImageUpload={handleImageUpload} uploading={uploading} />
                  <div className="min-h-[600px] bg-white">
                    <EditorContent editor={editor} className="prose prose-indigo max-w-none p-10 focus:outline-none" />
                  </div>
                </div>
              </div>
            )}

            {pinnedSermons.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-px flex-1 bg-slate-200" />
                  <h2 className="text-sm font-black text-amber-600 uppercase tracking-[0.2em] bg-amber-50 px-4 py-2 rounded-full">⭐ Featured Collection</h2>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pinnedSermons.map(sermon => <SermonCard key={sermon._id} sermon={sermon} onEdit={handleEdit} onDelete={handleDelete} onPin={handlePin} isPinned />)}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-black text-slate-800 mb-8 px-2 flex items-center justify-between">
                Sermon Archive
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{otherSermons.length} Items</span>
              </h2>
              {otherSermons.length === 0 ? (
                <div className="bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200 py-24 text-center">
                  <div className="inline-flex p-8 bg-white rounded-full shadow-xl mb-6">📖</div>
                  <h3 className="text-2xl font-black text-slate-700">Empty Library</h3>
                  <p className="text-slate-400 mt-2">Time to add your first spiritual masterpiece.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {otherSermons.map(sermon => <SermonCard key={sermon._id} sermon={sermon} onEdit={handleEdit} onDelete={handleDelete} onPin={handlePin} />)}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} formData={formData} descriptionHtml={descriptionHtml} />
    </div>
  );
}

// ─── Sermon Card Component (Premium Redesign) ────────────────────────────────
function SermonCard({ sermon, onEdit, onDelete, onPin, isPinned }) {
  const typeIcon = { text: '📖', photo: '🖼️', video: '🎥' }[sermon.type] || '📋';

  return (
    <div className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden ring-1 ring-slate-100/50 flex flex-col h-full">
      <div className="relative h-56 bg-slate-100 overflow-hidden">
        {sermon.thumbnail ? (
          <img src={sermon.thumbnail} alt={sermon.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-20 grayscale">{typeIcon}</div>
        )}
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
           <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-sm border border-white">
              {typeIcon} {sermon.type}
           </span>
           <button onClick={() => onPin(sermon._id)} className={`p-2.5 rounded-xl backdrop-blur-md transition-all shadow-lg ${isPinned ? 'bg-amber-400 text-white' : 'bg-white/80 text-slate-400 hover:text-amber-500'}`}>
              <Star size={18} fill={isPinned ? "currentColor" : "none"} />
           </button>
        </div>
      </div>

      <div className="p-7 flex flex-col flex-1">
        <div className="mb-4">
           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md mb-2 inline-block">
             {sermon.category}
           </span>
           <h3 className="font-black text-xl text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
             {sermon.title}
           </h3>
        </div>
        
        <div className="flex items-center gap-3 mb-8">
           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
             {sermon.pastor.charAt(0)}
           </div>
           <div>
             <p className="text-sm font-bold text-slate-700 leading-none">{sermon.pastor}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">
                {new Date(sermon.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
             </p>
           </div>
        </div>

        <div className="mt-auto flex items-center gap-2">
           <button onClick={() => onEdit(sermon)} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
              Edit Entry
           </button>
           <button onClick={() => onDelete(sermon._id)} className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
              <Trash2 size={18} />
           </button>
        </div>
      </div>
    </div>
  );
}