'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Megaphone, Loader2, AlertCircle, X, Check
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import {
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  toggleNotice
} from '@/services/api/noticeService';

const STYLE_OPTIONS = [
  { value: 'static',  label: 'Static Bar',         desc: 'Fixed announcement bar' },
  { value: 'sticky',  label: 'Sticky Banner',       desc: 'Stays at top while scrolling' },
  { value: 'marquee', label: 'Marquee / Scrolling', desc: 'Text scrolls left continuously' }
];

const PRESET_COLORS = [
  { bg: '#8B1A1A', text: '#FFFFFF', label: 'Church Red' },
  { bg: '#1e3a5f', text: '#FFFFFF', label: 'Deep Blue' },
  { bg: '#166534', text: '#FFFFFF', label: 'Forest Green' },
  { bg: '#92400e', text: '#FFFFFF', label: 'Amber' },
  { bg: '#1e1b4b', text: '#FFFFFF', label: 'Indigo' },
  { bg: '#FFFFFF', text: '#1a1a1a', label: 'White' },
  { bg: '#FEF08A', text: '#713f12', label: 'Warm Yellow' },
  { bg: '#0f172a', text: '#e2e8f0', label: 'Midnight' }
];

const EMPTY_FORM = {
  message: '',
  style: 'static',
  backgroundColor: '#8B1A1A',
  textColor: '#FFFFFF',
  active: false,
  startDate: '',
  endDate: '',
  priority: 0,
  dismissible: true,
  linkUrl: '',
  linkLabel: ''
};

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

function NoticePreview({ form }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        Live Preview
      </p>
      <div
        className="w-full min-h-[38px] flex items-center text-[11px] font-bold tracking-wide"
        style={{ backgroundColor: form.backgroundColor, color: form.textColor }}
      >
        {form.style === 'marquee' ? (
          <div className="flex-1 overflow-hidden px-4 py-2.5 whitespace-nowrap">
            {form.message || 'Your notice message will scroll here…'}
          </div>
        ) : (
          <div className="flex-1 px-4 py-2.5 text-center">
            {form.message || 'Your notice message will appear here…'}
            {form.linkUrl && (
              <span className="ml-3 underline opacity-80">{form.linkLabel || 'Learn More'}</span>
            )}
          </div>
        )}
        {form.dismissible && <span className="mr-3 opacity-60 text-xs">✕</span>}
      </div>
    </div>
  );
}

function NoticeForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    onSave({
      ...form,
      priority: Number(form.priority) || 0,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      linkUrl: form.linkUrl || null,
      linkLabel: form.linkLabel || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.message}
          onChange={e => set('message', e.target.value)}
          required maxLength={500} rows={2}
          placeholder="Enter your notice message…"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] resize-none"
        />
        <p className="text-[10px] text-slate-400 mt-1 text-right">{form.message.length}/500</p>
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Display Style</label>
        <div className="grid grid-cols-3 gap-2">
          {STYLE_OPTIONS.map(s => (
            <button key={s.value} type="button" onClick={() => set('style', s.value)}
              className={`px-3 py-3 rounded-xl border-2 text-left transition-all ${
                form.style === s.value
                  ? 'border-[#8B1A1A] bg-[#8B1A1A]/5 dark:bg-[#8B1A1A]/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <p className="text-[11px] font-black text-slate-900 dark:text-white">{s.label}</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Color Presets</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_COLORS.map(p => (
            <button key={p.label} type="button"
              onClick={() => setForm(f => ({ ...f, backgroundColor: p.bg, textColor: p.text }))}
              title={p.label}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                form.backgroundColor === p.bg ? 'border-[#8B1A1A] scale-110' : 'border-white dark:border-slate-700'
              }`}
              style={{ backgroundColor: p.bg }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[['backgroundColor', 'Background'], ['textColor', 'Text Color']].map(([field, label]) => (
            <div key={field}>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form[field]} onChange={e => set(field, e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer" />
                <input type="text" value={form[field]} onChange={e => set(field, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] font-mono" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Optional Link (Call to Action)</label>
        <div className="grid grid-cols-2 gap-3">
          <input type="text" value={form.linkUrl} onChange={e => set('linkUrl', e.target.value)}
            placeholder="https://example.com or /sermons"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]" />
          <input type="text" value={form.linkLabel} onChange={e => set('linkLabel', e.target.value)}
            placeholder="Button label (e.g. Learn More)"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[['startDate', 'Start Date'], ['endDate', 'End Date']].map(([field, label]) => (
          <div key={field}>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</label>
            <input type="datetime-local" value={form[field]} onChange={e => set(field, e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]" />
          </div>
        ))}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Priority (0–100)</label>
          <input type="number" min="0" max="100" value={form.priority} onChange={e => set('priority', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {[['active', 'Active'], ['dismissible', 'Dismissible']].map(([field, label]) => (
          <label key={field} className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form[field]} onChange={e => set(field, e.target.checked)}
              className="w-4 h-4 accent-[#8B1A1A] rounded" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
          </label>
        ))}
      </div>

      <NoticePreview form={form} />

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading || !form.message.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8B1A1A] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#7a1616] transition-colors disabled:opacity-50">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {initial?._id ? 'Save Changes' : 'Create Notice'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function NoticesPage() {
  const { canManageAnnouncements } = usePermissions();

  const [notices, setNotices]             = useState([]);
  const [fetchLoading, setFetchLoading]   = useState(true);
  const [saving, setSaving]               = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const [editing, setEditing]             = useState(null);
  const [toast, setToast]                 = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchNotices = useCallback(async () => {
    try {
      setFetchLoading(true);
      const data = await getAllNotices();
      setNotices(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load notices', 'error');
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      if (editing?._id) {
        await updateNotice(editing._id, formData);
        showToast('Notice updated!');
      } else {
        await createNotice(formData);
        showToast('Notice created!');
      }
      setShowForm(false);
      setEditing(null);
      fetchNotices();
    } catch (err) {
      showToast(err.message || 'Failed to save notice', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleNotice(id);
      showToast('Status updated!');
      fetchNotices();
    } catch (err) {
      showToast(err.message || 'Failed to toggle', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotice(id);
      showToast('Notice deleted!');
      setDeleteConfirm(null);
      fetchNotices();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const openEdit = (notice) => {
    setEditing({
      ...notice,
      startDate: notice.startDate ? new Date(notice.startDate).toISOString().slice(0, 16) : '',
      endDate:   notice.endDate   ? new Date(notice.endDate).toISOString().slice(0, 16)   : ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!canManageAnnouncements()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <AlertCircle size={40} className="text-slate-400 mb-3" />
        <p className="text-slate-500 dark:text-slate-400 font-semibold">
          You don't have permission to manage notices.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Megaphone size={24} className="text-[#8B1A1A]" /> Notice Bar Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage the announcement bar that appears above the site header.
          </p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B1A1A] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#7a1616] transition-colors shadow-lg">
            <Plus size={14} /> New Notice
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {editing?._id ? 'Edit Notice' : 'Create Notice'}
            </h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
              <X size={18} />
            </button>
          </div>
          <NoticeForm
            initial={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            loading={saving}
          />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            All Notices ({notices.length})
          </h2>
        </div>

        {fetchLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#8B1A1A]" />
          </div>
        ) : notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Megaphone size={36} className="text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">No notices yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {notices.map(notice => (
              <li key={notice._id} className="px-6 py-4 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700"
                  style={{ backgroundColor: notice.backgroundColor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{notice.message}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {[notice.style, `Priority ${notice.priority}`, notice.dismissible ? 'Dismissible' : null]
                      .filter(Boolean).map(tag => (
                        <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {tag}
                        </span>
                    ))}
                    {notice.endDate && (
                      <span className="text-[9px] text-slate-400">
                        Expires {new Date(notice.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(notice._id)} title={notice.active ? 'Deactivate' : 'Activate'}
                    className={`p-2 rounded-lg transition-colors ${
                      notice.active
                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}>
                    {notice.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => openEdit(notice)} title="Edit"
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Pencil size={16} />
                  </button>
                  {deleteConfirm === notice._id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(notice._id)}
                        className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase">
                        Confirm
                      </button>
                      <button onClick={() => setDeleteConfirm(null)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(notice._id)} title="Delete"
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}