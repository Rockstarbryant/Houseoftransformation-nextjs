'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit, Trash2, Star, X, Image as ImageIcon, 
  RotateCcw, RotateCw, Eye, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, List, ListOrdered, CheckCircle,
  AlertCircle, Info, XCircle
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { sermonService } from '@/services/api/sermonService';

// ─── Debounce ───────────────────────────────────────────────────────────────
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ─── Toast Notification System ──────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600'
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

// ─── Confirmation Dialog ────────────────────────────────────────────────────
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'warning' }) => {
  if (!isOpen) return null;

  const styles = {
    warning: 'bg-amber-600 hover:bg-amber-700',
    danger: 'bg-red-600 hover:bg-red-700'
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600">{message}</p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${styles[type]}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Toolbar ────────────────────────────────────────────────────────────────
const TipTapToolbar = React.memo(({ editor, onImageUpload, uploading, showClearConfirm }) => {
  if (!editor) return null;

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) onImageUpload(file, editor);
    e.target.value = '';
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-slate-300 dark:bg-slate-700 p-3 space-y-3 shadow-sm">
      <div className="flex flex-wrap gap-2 items-center border-b border-gray-200 dark:border-gray-600 pb-3">
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-3">
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
                  ? 'bg-blue-600 dark:bg-blue-700 text-white dark:text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-3">
          {[2, 3].map(level => (
            <button
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
                editor.isActive('heading', { level }) 
                  ? 'bg-blue-600 dark:bg-blue-700 text-white dark:text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              H{level}
            </button>
          ))}
        </div>

        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-3">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1.5 rounded transition-colors ${
              editor.isActive('bulletList') ? 'bg-blue-600 dark:bg-blue-700 text-white dark:text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1.5 rounded transition-colors ${
              editor.isActive('orderedList') ? 'bg-blue-600 dark:bg-blue-700 text-white dark:text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ListOrdered size={16} />
          </button>
        </div>

        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-3">
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
                editor.isActive({ textAlign: align }) ? 'bg-blue-600 dark:bg-blue-700 text-white dark:text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-3">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <RotateCw size={16} />
          </button>
        </div>

        <label className={`flex items-center gap-2 px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <ImageIcon size={16} />
          {uploading ? 'Uploading...' : 'Image'}
          <input type="file" accept="image/*" onChange={handleImageFileUpload} disabled={uploading} className="hidden" />
        </label>

        <button
          onClick={showClearConfirm}
          className="ml-auto px-4 py-2 rounded bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-100 hover:bg-red-100 dark:hover:bg-red-800 text-sm font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  );
});

// ─── Preview Modal (FIXED: top cutoff + paragraph spacing) ─────────────────
const PreviewModal = ({ isOpen, onClose, formData, descriptionHtml }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sermon Preview</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{formData.title || 'Untitled Sermon'}</h1>
            <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300 text-sm md:text-base">
              <span className="font-medium">By {formData.pastor || 'Unknown Pastor'}</span>
              <span>•</span>
              <span>{formData.date ? new Date(formData.date).toLocaleDateString() : 'No date'}</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full font-medium">{formData.category}</span>
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
            <div className="aspect-video rounded-xl overflow-hidden shadow-md bg-black dark:bg-gray-900">
              <iframe 
                src={formData.videoUrl.replace('watch?v=', 'embed/')} 
                className="w-full h-full" 
                allowFullScreen 
                title={formData.title}
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200">
            <style jsx>{`
              .prose :global(p) {
                margin-bottom: 1em;
              }
              .prose :global(h2) {
                margin-top: 1.5em;
                margin-bottom: 0.75em;
              }
              .prose :global(h3) {
                margin-top: 1.25em;
                margin-bottom: 0.5em;
              }
              .prose :global(ul), .prose :global(ol) {
                margin-bottom: 1em;
              }
            `}</style>
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml || '<p>No content yet...</p>' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
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
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: () => {} });
  const [selectedSermons, setSelectedSermons] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
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
  immediatelyRender: false,
  onUpdate: ({ editor }) => debouncedUpdateHtml(editor.getHTML())
});

  // Toast utilities
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showConfirm = (title, message, onConfirm, type = 'warning') => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm, type });
  };

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
      const pinned = (data.sermons || []).filter(s => s.pinned).length;
      setPinnedCount(pinned);
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to load sermons', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', pastor: '', date: '', category: 'Sunday Service',
      description: '', thumbnail: '', videoUrl: '', type: 'text'
    });
    setDescriptionHtml('');
    setSermonType('text');
    setEditingId(null);
    setThumbnailPreview(null);
    if (editor) {
      editor.commands.setContent('<p></p>');
    }
  };

  const handleImageUpload = async (file, editorInstance) => {
    try {
      setUploading(true);
      
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
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: cloudinaryFormData
        }
      );

      const data = await response.json();
      
      if (data.secure_url) {
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
        showToast('Image uploaded successfully', 'success');
      } else {
        showToast('Image upload failed', 'error');
        editorInstance.chain().focus().deleteSelection().run();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Error uploading image: ' + error.message, 'error');
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
      showToast('Please add a video URL for video sermons', 'warning');
      return;
    }
    if (!descriptionHtml || descriptionHtml === '<p></p>') {
      showToast('Please add some content to the description', 'warning');
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
        showToast('Sermon updated successfully!', 'success');
      } else {
        await sermonService.createSermon(dataToSubmit);
        showToast('Sermon added successfully!', 'success');
      }

      setShowForm(false);
      resetForm();
      fetchSermons();
    } catch (error) {
      console.error('Error saving sermon:', error);
      showToast('Error saving sermon: ' + (error.response?.data?.message || error.message), 'error');
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
    showConfirm(
      'Delete Sermon',
      'Are you sure you want to delete this sermon? This action cannot be undone.',
      async () => {
        try {
          await sermonService.deleteSermon(id);
          showToast('Sermon deleted successfully', 'success');
          fetchSermons();
        } catch (error) {
          showToast('Error deleting sermon', 'error');
        }
      },
      'danger'
    );
  };

  const handlePin = async (id) => {
    const sermon = sermons.find(s => s._id === id);
    
    if (pinnedCount >= 3 && !sermon?.pinned) {
      showToast('You can only pin up to 3 sermons', 'warning');
      return;
    }

    try {
      await sermonService.updateSermon(id, { pinned: !sermon.pinned });
      showToast(sermon.pinned ? 'Sermon unpinned' : 'Sermon pinned successfully!', 'success');
      fetchSermons();
    } catch (error) {
      showToast('Error pinning sermon', 'error');
    }
  };

  const handleClearContent = () => {
    showConfirm(
      'Clear All Content',
      'Are you sure you want to clear all content? This cannot be undone.',
      () => {
        editor.chain().focus().clearContent().run();
      },
      'warning'
    );
  };

  const handleSelectSermon = (sermonId) => {
  setSelectedSermons(prev => 
    prev.includes(sermonId) 
      ? prev.filter(id => id !== sermonId)
      : [...prev, sermonId]
  );
};

const handlePrintSingle = (sermon) => {
  printSermons([sermon]);
};

const handlePrintSelected = () => {
  const sermonsToPrint = sermons.filter(s => selectedSermons.includes(s._id));
  if (sermonsToPrint.length === 0) {
    showToast('Please select at least one sermon to print', 'warning');
    return;
  }
  printSermons(sermonsToPrint);
};

const printSermons = (sermonsArray) => {
  const printWindow = window.open('', '_blank');
  
  const sermonsHtml = sermonsArray.map((sermon, index) => `
    <div class="sermon-page" style="${index > 0 ? 'page-break-before: always;' : ''}">
      <h2>${sermon.title}</h2>
      <div class="sermon-meta">
        <p><strong>Pastor:</strong> ${sermon.pastor}</p>
        <p><strong>Date:</strong> ${new Date(sermon.date).toLocaleDateString()}</p>
        <p><strong>Category:</strong> ${sermon.category}</p>
        <p><strong>Type:</strong> ${sermon.type}</p>
      </div>
      ${sermon.thumbnail ? `<img src="${sermon.thumbnail}" alt="${sermon.title}" class="sermon-image" />` : ''}
      ${sermon.videoUrl ? `<p class="video-link"><strong>Video:</strong> ${sermon.videoUrl}</p>` : ''}
      <div class="sermon-content">
        ${sermon.descriptionHtml || sermon.description || '<p>No content available</p>'}
      </div>
    </div>
  `).join('');
  
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sermons - House of Transformation</title>
        <style>
          body { font-family: Georgia, serif; padding: 40px; line-height: 1.6; color: #333; }
          h1 { color: #8B1A1A; border-bottom: 3px solid #8B1A1A; padding-bottom: 10px; margin-bottom: 30px; }
          h2 { color: #8B1A1A; margin-top: 0; font-size: 28px; }
          .sermon-meta { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .sermon-meta p { margin: 5px 0; }
          .sermon-image { max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; }
          .video-link { background: #e3f2fd; padding: 10px; border-radius: 5px; margin: 15px 0; }
          .sermon-content { margin-top: 20px; font-size: 14px; }
          .sermon-content p { margin-bottom: 1em; }
          .sermon-content h2 { margin-top: 1.5em; margin-bottom: 0.75em; font-size: 20px; }
          .sermon-content h3 { margin-top: 1.25em; margin-bottom: 0.5em; font-size: 18px; }
          .sermon-content ul, .sermon-content ol { margin-bottom: 1em; padding-left: 25px; }
          .sermon-content img { max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
          @media print {
            .no-print { display: none; }
            .sermon-page { page-break-after: always; }
            .sermon-page:last-child { page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <h1>Sermons - House of Transformation Church</h1>
        ${sermonsHtml}
        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>House of Transformation Church - Mombasa, Kenya</p>
        </div>
        <button class="no-print" onclick="window.print()" style="position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #8B1A1A; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">Print PDF</button>
      </body>
    </html>
  `;
  
  printWindow.document.write(printContent);
  printWindow.document.close();
};

  // ─── Render ───────────────────────────────────────────────────────────────
  const pinnedSermons = sermons.filter(s => s.pinned);
  const otherSermons = sermons.filter(s => !s.pinned);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 dark:text-white transition-colors">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog
        {...confirmDialog}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
  <div>
    <h1 className="text-3xl md:text-4xl text-center font-bold text-red-900 dark:text-white">H.O.T SERMONS KITCHEN</h1>
    <p className="text-gray-600 dark:text-gray-400 text-center mt-1">Cook, edit, post and organize your sermon collection</p>
  </div>
  <div className="flex gap-3">
    {!showForm && (
      <>
        <button
          onClick={() => {
            setIsSelectionMode(!isSelectionMode);
            setSelectedSermons([]);
          }}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors shadow-sm ${
            isSelectionMode 
              ? 'bg-amber-600 dark:bg-amber-700 text-white hover:bg-amber-700 dark:hover:bg-amber-800' 
              : 'bg-green-700 dark:bg-green-700 text-white dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {isSelectionMode ? 'Cancel Select' : 'Print Multiple'}
        </button>
        {isSelectionMode && selectedSermons.length > 0 && (
          <button
            onClick={handlePrintSelected}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-800 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print ({selectedSermons.length})
          </button>
          )}
        </>
      )}
      <button
      onClick={() => { resetForm(); setShowForm(true); }}
      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white dark:text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors shadow-sm"
      >
      <Plus size={20} /> Add Sermon
      </button>
    </div>
     </div>

        <div className="mb-10 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-center gap-3">
            <Star className="text-amber-500" size={28} fill="currentColor" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-lg">Featured: {pinnedCount}/3</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-0.5">Featured sermons appear on your homepage</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-1 gap-8">
          {showForm && (
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Form Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg sticky top-6">
                  <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editingId ? 'Edit Sermon' : 'New Sermon'}
                    </h2>
                    <button 
                      onClick={() => { setShowForm(false); resetForm(); }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Type</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['text', 'photo', 'video'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setSermonType(type)}
                            className={`p-4 rounded-lg border-2 text-center transition-all ${
                              sermonType === type 
                                ? 'border-blue-600 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="text-3xl mb-2">
                              {type === 'text' ? '📖' : type === 'photo' ? '🖼️' : '🎥'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Pastor *</label>
                        <input
                          type="text"
                          value={formData.pastor}
                          onChange={e => setFormData({...formData, pastor: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Date *</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                        <select
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Thumbnail</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {thumbnailPreview && (
                            <img src={thumbnailPreview} alt="preview" className="mt-3 h-32 w-full object-cover rounded-lg" />
                          )}
                        </div>
                      )}

                      {sermonType === 'video' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Video URL *</label>
                          <input
                            type="url"
                            value={formData.videoUrl}
                            onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <Eye size={18} /> Preview
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading || uploading}
                        className="flex-1 py-3 px-4 bg-blue-600 dark:bg-blue-700 text-white dark:text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors font-medium disabled:opacity-60"
                      >
                        {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* FULL WIDTH EDITOR */}
              <div className="lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden -mx-4 sm:-mx-6 lg:mx-0">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sermon Editor</h3>
                  </div>
                  <div className="p-0">
                    <div className="px-6 pt-6">
                      <TipTapToolbar editor={editor} onImageUpload={handleImageUpload} uploading={uploading} showClearConfirm={handleClearContent} />
                    </div>
                    <div className="border-0 min-h-[500px] bg-white dark:bg-gray-800">
                      <EditorContent editor={editor} className="prose max-w-none p-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sermons Display */}
          {!showForm && (
            <>
              {pinnedSermons.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <Star className="text-amber-500 dark:text-amber-400" size={28} fill="currentColor" />
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
                     isSelectionMode={isSelectionMode}
                     isSelected={selectedSermons.includes(sermon._id)}
                      onSelect={handleSelectSermon}
                      onPrint={handlePrintSingle}
                    />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  All Sermons {pinnedSermons.length > 0 && `(${otherSermons.length})`}
                </h2>
                {otherSermons.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                    <div className="text-6xl mb-4 opacity-40">📖</div>
                    <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No sermons yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Start by clicking &quot;Add Sermon&quot;</p>
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
                     isSelectionMode={isSelectionMode}
                     isSelected={selectedSermons.includes(sermon._id)}
                     onSelect={handleSelectSermon}
                     onPrint={handlePrintSingle}
                     />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        formData={formData}
        descriptionHtml={descriptionHtml}
      />
    </div>
  );
}

// ─── Sermon Card Component ──────────────────────────────────────────────────
function SermonCard({ sermon, onEdit, onDelete, onPin, isPinned, isSelectionMode, isSelected, onSelect, onPrint }) {
  const typeIcon = {
    text: '📖',
    photo: '🖼️',
    video: '🎥'
  }[sermon.type] || '📋';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group relative">
      {/* Selection checkbox */}
      {isSelectionMode && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(sermon._id)}
            className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      )}

      {/* Print button (only when NOT in selection mode) */}
      {!isSelectionMode && (
        <button
          onClick={() => onPrint(sermon)}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-green-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
          title="Print this sermon"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
        </button>
      )}

      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
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
          <span className="px-2.5 py-1 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full text-xs font-medium shadow-sm">
            {typeIcon} {sermon.type}
          </span>
          {isPinned && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 rounded-full text-xs font-medium shadow-sm flex items-center gap-1">
              <Star size={12} fill="currentColor" /> Featured
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
          {sermon.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{sermon.pastor}</p>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100 rounded-full text-xs font-medium">
            {sermon.category}
          </span>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
            {new Date(sermon.date).toLocaleDateString()}
          </span>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => onPin(sermon._id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              isPinned 
                ? 'bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-100 hover:bg-amber-100' 
                : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
            }`}
          >
            {isPinned ? 'Unpin' : 'Pin'}
          </button>
          <button
            onClick={() => onEdit(sermon)}
            className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(sermon._id)}
            className="flex-1 py-2 px-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
