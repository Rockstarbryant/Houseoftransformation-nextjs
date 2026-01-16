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
    success: "border-emerald-100 bg-emerald-50",
    error: "border-rose-100 bg-rose-50",
    info: "border-blue-100 bg-blue-50"
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl animate-in slide-in-from-right-10 duration-300 ${colors[type]}`}>
      {icons[type]}
      <p className="text-sm font-bold text-gray-800">{message}</p>
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

// ─── Toolbar (Modern Styling) ────────────────────────────────────────────────
const TipTapToolbar = React.memo(({ editor, onImageUpload, uploading }) => {
  if (!editor) return null;

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) onImageUpload(file, editor);
    e.target.value = '';
  };

  const btnClass = (active) => `
    p-2 rounded-xl transition-all duration-200 
    ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}
  `;

  return (
    <div className="border border-gray-200 rounded-t-3xl bg-gray-50/50 p-4 space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1.5 border-r border-gray-200 pr-3">
          {[
            { action: 'toggleBold', icon: <span className="font-bold">B</span>, active: 'bold' },
            { action: 'toggleItalic', icon: <span className="italic">I</span>, active: 'italic' },
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
              <span className="font-bold text-xs">H{level}</span>
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

      <div className="flex flex-wrap gap-2 items-center border-t border-gray-200 pt-4">
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30">
          <RotateCcw size={18} />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30">
          <RotateCw size={18} />
        </button>

        <label className={`flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 cursor-pointer hover:bg-blue-100 transition-all text-sm font-bold ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <ImageIcon size={18} />
          {uploading ? 'Uploading...' : 'Add Image'}
          <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
        </label>

        <button
          onClick={() => window.confirm('Clear all content?') && editor.chain().focus().clearContent().run()}
          className="ml-auto px-5 py-2 rounded-xl text-red-600 hover:bg-red-50 text-sm font-bold transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
});

// ─── Preview Modal ──────────────────────────────────────────────────────────
const PreviewModal = ({ isOpen, onClose, formData, descriptionHtml }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-8 py-5 border-b flex items-center justify-between bg-white sticky top-0">
          <h2 className="text-xl font-black text-gray-900">Sermon Preview</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 md:p-12 overflow-y-auto space-y-8">
          <header className="space-y-4">
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">{formData.category}</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{formData.title || 'Untitled Sermon'}</h1>
            <div className="flex items-center gap-4 text-gray-500 font-bold text-sm uppercase tracking-tighter">
              <span>By {formData.pastor || 'Guest Speaker'}</span>
              <span>•</span>
              <span>{formData.date ? new Date(formData.date).toLocaleDateString() : 'Date TBD'}</span>
            </div>
          </header>

          {formData.thumbnail && (
            <img 
              src={typeof formData.thumbnail === 'string' ? formData.thumbnail : URL.createObjectURL(formData.thumbnail)}
              alt="Thumbnail" 
              className="w-full h-80 object-cover rounded-[24px] shadow-xl" 
            />
          )}

          {formData.videoUrl && (
            <div className="aspect-video rounded-[24px] overflow-hidden shadow-xl bg-black">
              <iframe 
                src={formData.videoUrl.replace('watch?v=', 'embed/')} 
                className="w-full h-full" 
                allowFullScreen 
              />
            </div>
          )}

          <article className="prose prose-blue prose-lg max-w-none text-gray-700">
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml || '<p class="italic text-gray-400">No content available...</p>' }} />
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
      Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded-2xl my-6 shadow-md' } }),
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
          src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%233b82f6"%3EUploading...%3C/text%3E%3C/svg%3E',
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
        showNotify('Upload failed', 'error');
        editorInstance.chain().focus().deleteSelection().run();
      }
    } catch (error) {
      showNotify('Upload error', 'error');
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
    if (sermonType === 'video' && !formData.videoUrl) return showNotify('Video URL required', 'info');
    if (!descriptionHtml || descriptionHtml === '<p></p>') return showNotify('Content is empty', 'info');

    try {
      setLoading(true);
      const dataToSubmit = { ...formData, type: sermonType, descriptionHtml, description: editor?.getText() || '' };

      if (editingId) {
        await sermonService.updateSermon(editingId, dataToSubmit);
        showNotify('Sermon updated');
      } else {
        await sermonService.createSermon(dataToSubmit);
        showNotify('Sermon published');
      }

      setShowForm(false);
      resetForm();
      fetchSermons();
    } catch (error) {
      showNotify('Save error', 'error');
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
        showNotify('Sermon removed');
        fetchSermons();
      } catch (error) {
        showNotify('Delete failed', 'error');
      }
    }
  };

  const handlePin = async (id) => {
    if (pinnedCount >= 3 && !sermons.find(s => s._id === id)?.pinned) {
      return showNotify('Limit reached: Max 3 pins', 'info');
    }
    try {
      const sermon = sermons.find(s => s._id === id);
      await sermonService.updateSermon(id, { pinned: !sermon.pinned });
      showNotify(sermon.pinned ? 'Unpinned' : 'Pinned');
      fetchSermons();
    } catch (error) {
      showNotify('Update failed', 'error');
    }
  };

  // ─── DEFINING FILTERED SERMONS (FIXED) ──────────────────────────────────
  const pinnedSermons = sermons.filter(s => s.pinned);
  const otherSermons = sermons.filter(s => !s.pinned);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Manage Sermons</h1>
            <p className="text-gray-500 font-bold mt-1 text-sm uppercase tracking-widest">Library Administration</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
          >
            <Plus size={20} /> Add Sermon
          </button>
        </header>

        <div className="mb-10 p-6 bg-white border border-gray-200 rounded-[24px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-500">
              <Star size={24} fill="currentColor" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">Featured {pinnedCount}/3</h3>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Homepage Spotlight Slots</p>
            </div>
          </div>
          <div className="hidden sm:block h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(pinnedCount/3)*100}%` }} />
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {showForm && (
            <div className="lg:col-span-4">
              <div className="bg-white rounded-[32px] border border-gray-200 shadow-xl overflow-hidden sticky top-6 ring-1 ring-gray-100">
                <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">
                    {editingId ? 'Edit Draft' : 'New Entry'}
                  </h2>
                  <button onClick={() => { setShowForm(false); resetForm(); }} className="p-2 hover:bg-white rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-3 gap-3">
                    {['text', 'photo', 'video'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSermonType(type)}
                        className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                          sermonType === type ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-50 bg-gray-50 text-gray-400'
                        }`}
                      >
                        <span className="text-xl">{type === 'text' ? '📖' : type === 'photo' ? '🖼️' : '🎥'}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {['title', 'pastor', 'date'].map(key => (
                      <div key={key}>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{key}</label>
                        <input
                          type={key === 'date' ? 'date' : 'text'}
                          value={formData[key]}
                          onChange={e => setFormData({...formData, [key]: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none font-bold text-sm"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm appearance-none outline-none"
                      >
                        <option>Sunday Service</option>
                        <option>Bible Study</option>
                        <option>Special Event</option>
                      </select>
                    </div>

                    {(sermonType !== 'text') && (
                      <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-center relative">
                         <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                         <ImageIcon className="mx-auto mb-2 text-gray-300" size={32} />
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cover Image</p>
                         {thumbnailPreview && <img src={thumbnailPreview} className="mt-4 rounded-xl h-24 w-full object-cover shadow-lg" />}
                      </div>
                    )}

                    {sermonType === 'video' && (
                      <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                        placeholder="YouTube URL"
                        className="w-full px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold"
                      />
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowPreview(true)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                      Preview
                    </button>
                    <button onClick={handleSubmit} disabled={loading || uploading} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100">
                      {loading ? 'Wait...' : editingId ? 'Update' : 'Publish'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={showForm ? 'lg:col-span-8' : 'lg:col-span-12'}>
            {showForm && (
              <div className="mb-12 bg-white rounded-[32px] border border-gray-200 shadow-xl overflow-hidden ring-1 ring-gray-50">
                <TipTapToolbar editor={editor} onImageUpload={handleImageUpload} uploading={uploading} />
                <div className="min-h-[500px]">
                  <EditorContent editor={editor} className="prose prose-blue max-w-none p-10 focus:outline-none" />
                </div>
              </div>
            )}

            {pinnedSermons.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xs font-black text-amber-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <div className="h-px w-8 bg-amber-200" /> Featured Entries
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedSermons.map(sermon => <SermonCard key={sermon._id} sermon={sermon} onEdit={handleEdit} onDelete={handleDelete} onPin={handlePin} isPinned />)}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <div className="h-px w-8 bg-gray-200" /> General Archive
              </h2>
              {otherSermons.length === 0 ? (
                <div className="bg-white rounded-[40px] border-4 border-dashed border-gray-100 py-20 text-center">
                  <p className="text-gray-300 font-black uppercase tracking-widest">No sermons found</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

// ─── Sermon Card Component ───────────────────────────────────────────────────
function SermonCard({ sermon, onEdit, onDelete, onPin, isPinned }) {
  const typeIcon = { text: '📖', photo: '🖼️', video: '🎥' }[sermon.type] || '📋';

  return (
    <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      <div className="relative h-48 bg-gray-50">
        {sermon.thumbnail ? (
          <img src={sermon.thumbnail} alt={sermon.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20 grayscale">{typeIcon}</div>
        )}
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
           <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-900 border border-white">
              {typeIcon} {sermon.type}
           </span>
           <button onClick={() => onPin(sermon._id)} className={`p-2 rounded-xl backdrop-blur-md shadow-sm transition-all ${isPinned ? 'bg-amber-400 text-white' : 'bg-white/80 text-gray-400 hover:text-amber-500'}`}>
              <Star size={16} fill={isPinned ? "currentColor" : "none"} />
           </button>
        </div>
      </div>

      <div className="p-6">
        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-2 inline-block">
          {sermon.category}
        </span>
        <h3 className="font-black text-lg text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
          {sermon.title}
        </h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-6">{sermon.pastor} • {new Date(sermon.date).toLocaleDateString()}</p>
        
        <div className="flex gap-2">
           <button onClick={() => onEdit(sermon)} className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
              Edit
           </button>
           <button onClick={() => onDelete(sermon._id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
              <Trash2 size={16} />
           </button>
        </div>
      </div>
    </div>
  );
}