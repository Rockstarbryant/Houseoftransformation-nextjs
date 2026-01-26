'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Calendar, Clock, Users, TrendingUp, Video, Radio, Archive, Search, Filter,
  AlertCircle, CheckCircle, Play, Pause, X, BookOpen, FileText, MessageSquare, XCircle, Info
} from 'lucide-react';
import { useLivestream, useLivestreamAdmin } from '@/hooks/useLivestream';

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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-red-600" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-600 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-3 text-white rounded-lg font-semibold transition ${styles[type]}`}
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const ManageLiveStream = () => {
  const { activeStream: publicActiveStream, archives: publicArchives, fetchArchives: publicFetchArchives } = useLivestream();
  const { 
    loading, 
    error, 
    success, 
    createStream,
    updateStream,
    archiveStream, 
    deleteStream 
  } = useLivestreamAdmin();

  const [view, setView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStream, setSelectedStream] = useState(null);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: () => {} });
  
  const [transcriptData, setTranscriptData] = useState(null);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  const [preacherInputs, setPreacherInputs] = useState(['']);
  const [scriptureInputs, setScriptureInputs] = useState(['']);
  const [formData, setFormData] = useState({
    title: '',
    type: 'sermon',
    youtubeUrl: '',
    facebookUrl: '',
    startTime: '',
    status: 'scheduled',
    isPublic: true,
    preachers: [],
    preacherNames: [],
    scriptures: [],
    description: ''
  });

  const streamTypes = [
    { value: 'sermon', label: 'Sermon', icon: '📖', color: 'blue' },
    { value: 'praise_worship', label: 'Praise & Worship', icon: '🎵', color: 'purple' },
    { value: 'full_service', label: 'Full Service', icon: '⛪', color: 'green' },
    { value: 'sunday_school', label: 'Sunday School', icon: '👨‍🏫', color: 'yellow' },
    { value: 'special_event', label: 'Special Event', icon: '✨', color: 'pink' }
  ];

  // Toast utilities
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showConfirm = (title, message, onConfirm, type = 'danger') => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm, type });
  };

  useEffect(() => {
  if (selectedStream) {
    loadTranscript(selectedStream._id);
  }
}, [selectedStream?._id]);

  useEffect(() => {
    publicFetchArchives({ 
      type: filterType, 
      limit: 100,
      includeScheduled: true
    });
  }, [filterType, publicFetchArchives]);

  // Show toasts for success/error from hook
  useEffect(() => {
    if (success) {
      showToast(success, 'success');
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error]);

  const addPreacherField = () => setPreacherInputs([...preacherInputs, '']);
  const removePreacherField = (index) => setPreacherInputs(preacherInputs.filter((_, i) => i !== index));
  const updatePreacher = (index, value) => {
    const updated = [...preacherInputs];
    updated[index] = value;
    setPreacherInputs(updated);
    setFormData({...formData, preacherNames: updated.filter(p => p.trim())});
  };

  const addScriptureField = () => setScriptureInputs([...scriptureInputs, '']);
  const removeScriptureField = (index) => setScriptureInputs(scriptureInputs.filter((_, i) => i !== index));
  const updateScripture = (index, value) => {
    const updated = [...scriptureInputs];
    updated[index] = value;
    setScriptureInputs(updated);
    setFormData({...formData, scriptures: updated.filter(s => s.trim())});
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'sermon',
      youtubeUrl: '',
      facebookUrl: '',
      startTime: '',
      status: 'scheduled',
      isPublic: true,
      preachers: [],
      preacherNames: [],
      scriptures: [],
      description: ''
    });
    setPreacherInputs(['']);
    setScriptureInputs(['']);
    setEditingId(null);
    setShowStreamModal(false);
  };

  const handleOpenModal = (stream = null) => {
    if (stream) {
      setPreacherInputs(stream.preacherNames?.length > 0 ? stream.preacherNames : ['']);
      setScriptureInputs(stream.scriptures?.length > 0 ? stream.scriptures : ['']);
      setFormData({
        title: stream.title || '',
        type: stream.type || 'sermon',
        youtubeUrl: stream.youtubeUrl || '',
        facebookUrl: stream.facebookUrl || '',
        startTime: stream.startTime ? new Date(stream.startTime).toISOString().slice(0, 16) : '',
        status: stream.status || 'scheduled',
        isPublic: stream.isPublic !== false,
        preachers: stream.preachers || [],
        preacherNames: stream.preacherNames || [],
        scriptures: stream.scriptures || [],
        description: stream.description || ''
      });
      setEditingId(stream._id);
    } else {
      resetForm();
    }
    setShowStreamModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = editingId 
      ? await updateStream(editingId, formData)
      : await createStream(formData);

    if (result.success) {
      resetForm();
      publicFetchArchives({ type: filterType, limit: 100, includeScheduled: true });
    }
  };

  const handleEndStream = async () => {
    if (!publicActiveStream) return;
    const result = await archiveStream(publicActiveStream._id, {
      archiveUrl: publicActiveStream.youtubeUrl || publicActiveStream.facebookUrl
    });
    if (result.success) publicFetchArchives({ type: filterType, limit: 100, includeScheduled: true });
  };

  const handleDeleteStream = async (id) => {
    const result = await deleteStream(id);
    if (result.success) {
      publicFetchArchives({ type: filterType, limit: 100, includeScheduled: true });
    }
  };

  const loadTranscript = async (streamId) => {
  try {
    const response = await fetch(`/api/livestreams/${streamId}/transcript`, {
      credentials: 'include'
    });
    const result = await response.json();
    
    if (result.success) {
      setTranscriptData(result.data);
      setEditedTranscript(result.data.cleaned || '');
    }
  } catch (error) {
    console.error('Error loading transcript:', error);
    showToast('Failed to load transcript', 'error');
  }
};

const handleExtractTranscript = async (streamId) => {
  try {
    setLoadingTranscript(true);
    const response = await fetch(`/api/livestreams/${streamId}/transcript/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (result.success) {
      setTranscriptData(result.data);
      setEditedTranscript(result.data.cleaned || '');
      showToast('Transcript extracted successfully', 'success');
    } else {
      showToast(result.message || 'Extraction failed', 'warning');
      setTranscriptData(result.data);
      setEditedTranscript(result.data?.cleaned || '');
    }
  } catch (error) {
    console.error('Error extracting transcript:', error);
    showToast('Failed to extract transcript', 'error');
  } finally {
    setLoadingTranscript(false);
  }
};

const handleSaveTranscript = async (streamId) => {
  try {
    if (!editedTranscript || editedTranscript.trim().length === 0) {
      showToast('Transcript cannot be empty', 'error');
      return;
    }

    setLoadingTranscript(true);
    const response = await fetch(`/api/livestreams/${streamId}/transcript`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ cleaned: editedTranscript }),
      credentials: 'include'
    });

    const result = await response.json();
    
    if (result.success) {
      setTranscriptData(prev => ({
        ...prev,
        cleaned: result.data.cleaned
      }));
      showToast('Transcript saved successfully', 'success');
    } else {
      showToast(result.message || 'Failed to save transcript', 'error');
    }
  } catch (error) {
    console.error('Error saving transcript:', error);
    showToast('Failed to save transcript', 'error');
  } finally {
    setLoadingTranscript(false);
  }
};

const handleGenerateSummary = async (streamId) => {
  try {
    if (!editedTranscript || editedTranscript.trim().length === 0) {
      showToast('Please provide a cleaned transcript first', 'error');
      return;
    }

    setLoadingAI(true);
    const response = await fetch(`/api/livestreams/${streamId}/transcript/generate-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      credentials: 'include'
    });

    const result = await response.json();
    
    if (result.success) {
      // Refresh the selected stream to show new summary
      const updatedStream = await fetch(`/api/livestreams/${streamId}`, {
        credentials: 'include'
      }).then(r => r.json());
      
      if (updatedStream.success) {
        setSelectedStream(updatedStream.data);
      }
      
      showToast('AI summary generated successfully!', 'success');
    } else {
      showToast(result.message || 'Failed to generate summary', 'error');
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    showToast('Failed to generate AI summary', 'error');
  } finally {
    setLoadingAI(false);
  }
};

  const getEmbedUrl = (stream) => {
    if (stream.youtubeVideoId) return `https://www.youtube.com/embed/${stream.youtubeVideoId}`;
    if (stream.youtubeUrl?.includes('youtube.com')) return stream.youtubeUrl.replace('watch?v=', 'embed/');
    if (stream.facebookUrl) return stream.facebookUrl;
    return null;
  };

  const filteredArchives = publicArchives.filter(stream => {
    const matchesSearch = searchTerm.trim() === '' || 
      stream.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stream.preacherNames?.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || stream.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: publicArchives.length,
    live: publicArchives.filter(s => s.status === 'live').length,
    scheduled: publicArchives.filter(s => s.status === 'scheduled').length,
    archived: publicArchives.filter(s => s.status === 'archived').length,
    totalViews: publicArchives.reduce((sum, s) => sum + (s.viewCount || 0), 0)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog
        {...confirmDialog}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Livestreams</h1>
            <p className="text-gray-600 mt-1">Schedule, monitor, and manage church live services</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            <Plus size={20} />
            New Stream
          </button>
        </div>
      </div>

      {/* Active Stream Banner */}
      {publicActiveStream && (
        <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse mt-2"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-900 mb-1">LIVE NOW</h3>
                <p className="text-red-800 font-semibold text-lg">{publicActiveStream.title}</p>
                <div className="flex flex-wrap gap-4 text-sm text-red-700 mt-2">
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    Started {new Date(publicActiveStream.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users size={16} />
                    {publicActiveStream.viewCount || 0} watching
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleOpenModal(publicActiveStream)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={handleEndStream}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-60"
              >
                <Pause size={16} />
                End Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setView('dashboard')}
          className={`pb-4 px-6 font-medium text-lg transition-colors ${
            view === 'dashboard' 
              ? 'border-b-4 border-blue-600 text-blue-700' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setView('archive')}
          className={`pb-4 px-6 font-medium text-lg transition-colors flex items-center gap-2 ${
            view === 'archive' 
              ? 'border-b-4 border-blue-600 text-blue-700' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Archive size={20} />
          All Streams ({publicArchives.length})
        </button>
        <button
          onClick={() => {
            setView('transcript');
            // Show stream selection or select first stream
            if (!selectedStream && publicArchives.length > 0) {
              setSelectedStream(publicArchives[0]);
            }
          }}
          className={`pb-4 px-6 font-medium text-lg transition-colors flex items-center gap-2 ${
            view === 'transcript' 
              ? 'border-b-4 border-blue-600 text-blue-700' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText size={20} />
          Transcript Management
        </button>
      </div>

      {/* Dashboard View */}
      {view === 'dashboard' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition">
              <div className="flex items-center gap-3 mb-2">
                <Video className="text-blue-600" size={24} />
                <p className="text-sm font-medium text-gray-600">Total Streams</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <Radio className="text-red-600" size={24} />
                <p className="text-sm font-medium text-gray-600">Live Now</p>
              </div>
              <p className="text-4xl font-bold text-red-600">{stats.live}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-amber-600" size={24} />
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
              </div>
              <p className="text-4xl font-bold text-amber-600">{stats.scheduled}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition">
              <div className="flex items-center gap-3 mb-2">
                <Archive className="text-gray-600" size={24} />
                <p className="text-sm font-medium text-gray-600">Archived</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.archived}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-purple-600" size={24} />
                <p className="text-sm font-medium text-gray-600">Total Views</p>
              </div>
              <p className="text-4xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>

          {/* Recent Streams */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Recent Streams</h3>
            </div>

            {publicArchives.length === 0 ? (
              <div className="p-12 text-center">
                <Video className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-600 text-lg mb-6">No streams created yet</p>
                <button
                  onClick={() => handleOpenModal()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Create First Stream
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {publicArchives.slice(0, 5).map(stream => (
                  <div
                    key={stream._id}
                    className="p-6 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => setSelectedStream(stream)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-3 h-3 rounded-full ${
                          stream.status === 'live' ? 'bg-red-500 animate-pulse' :
                          stream.status === 'scheduled' ? 'bg-amber-500' :
                          'bg-gray-400'
                        }`} />
                        <div>
                          <h4 className="font-semibold text-gray-900">{stream.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {streamTypes.find(t => t.value === stream.type)?.label} •{' '}
                            {new Date(stream.startTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        stream.status === 'live' ? 'bg-red-100 text-red-700' :
                        stream.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {stream.status.charAt(0).toUpperCase() + stream.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Transcript Management View */}
              {view === 'transcript' && selectedStream && (
                <div className="space-y-8">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Transcript Management</h2>
                      <p className="text-gray-600 mt-1">{selectedStream.title}</p>
                    </div>
                    <button
                      onClick={() => { setView('archive'); setSelectedStream(null); }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                    >
                      ← Back
                    </button>
                  </div>

                  {/* Extraction Status Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Transcript Extraction</h3>
                      <button
                        onClick={() => handleExtractTranscript(selectedStream._id)}
                        disabled={loadingTranscript}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                      >
                        {loadingTranscript ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <span>↻</span>
                            Extract from Video
                          </>
                        )}
                      </button>
                    </div>

                    {transcriptData?.extractionStatus && (
                      <div className={`p-4 rounded-lg mb-4 ${
                        transcriptData.extractionStatus === 'success' ? 'bg-green-50 border border-green-200' :
                        transcriptData.extractionStatus === 'pending' ? 'bg-amber-50 border border-amber-200' :
                        'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          {transcriptData.extractionStatus === 'success' && (
                            <span className="text-green-600 font-semibold">✓ Successfully extracted from video</span>
                          )}
                          {transcriptData.extractionStatus === 'pending' && (
                            <span className="text-amber-600 font-semibold">⊙ Not yet extracted</span>
                          )}
                          {transcriptData.extractionStatus === 'failed' && (
                            <span className="text-red-600 font-semibold">✗ Extraction failed</span>
                          )}
                          {transcriptData.extractionStatus === 'manual' && (
                            <span className="text-blue-600 font-semibold">✎ Manually provided</span>
                          )}
                        </div>
                        {transcriptData.extractionError && (
                          <p className="text-sm text-gray-600 mt-2">{transcriptData.extractionError}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      {transcriptData?.raw && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Raw Transcript (from video)</p>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-[200px] overflow-y-auto">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono text-xs">
                              {transcriptData.raw.substring(0, 1000)}
                              {transcriptData.raw.length > 1000 && '...'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cleaned Transcript Editor */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Cleaned Transcript</h3>
                        <p className="text-sm text-gray-600 mt-1">Edit and verify transcript before generating summary</p>
                      </div>
                      <button
                        onClick={() => handleSaveTranscript(selectedStream._id)}
                        disabled={loadingTranscript || !editedTranscript || editedTranscript === transcriptData?.cleaned}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60 disabled:bg-gray-400"
                      >
                        {loadingTranscript ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>

                    <textarea
                      value={editedTranscript}
                      onChange={(e) => setEditedTranscript(e.target.value)}
                      placeholder="Paste or edit transcript here..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[400px] font-mono text-sm resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {editedTranscript.length} / 50,000 characters
                    </p>
                  </div>

                  {/* AI Summary Generation */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Generate AI Summary</h3>
                        <p className="text-sm text-gray-600 mt-1">Create summary and key points from cleaned transcript</p>
                      </div>
                      <button
                        onClick={() => handleGenerateSummary(selectedStream._id)}
                        disabled={loadingAI || !editedTranscript || editedTranscript.trim().length === 0}
                        className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-60 disabled:bg-gray-400"
                      >
                        {loadingAI ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            ✨
                            Generate Summary
                          </>
                        )}
                      </button>
                    </div>

                    {selectedStream.aiSummary?.summary && (
                      <div className="space-y-6">
                        {/* Summary */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {selectedStream.aiSummary.summary}
                            </p>
                            <p className="text-xs text-gray-500 mt-3">
                              Generated: {new Date(selectedStream.aiSummary.generatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Key Points */}
                        {selectedStream.aiSummary.keyPoints?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Key Points</h4>
                            <ul className="space-y-2">
                              {selectedStream.aiSummary.keyPoints.map((point, idx) => (
                                <li key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <span className="text-red-600 font-bold mt-0.5">•</span>
                                  <span className="text-sm text-gray-700">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {!selectedStream.aiSummary?.summary && (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-500">Summary will appear here after generation</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

      {/* Archive View */}
      {view === 'archive' && (
        <div className="space-y-8">
          {/* Search & Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by title or preacher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All Types</option>
                  {streamTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="live">Live</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Archive Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredArchives.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <Video className="mx-auto text-gray-300 mb-6" size={64} />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">No streams found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new stream</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArchives.map(stream => {
                const embedUrl = getEmbedUrl(stream);
                const typeInfo = streamTypes.find(t => t.value === stream.type) || { label: stream.type, color: 'gray' };

                return (
                  <div 
                    key={stream._id} 
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    {embedUrl && (
                      <div className="aspect-video bg-black relative">
                        <iframe
                          src={embedUrl}
                          title={stream.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                        {stream.status === 'live' && (
                          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            LIVE
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          typeInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                          typeInfo.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                          typeInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                          typeInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-pink-100 text-pink-700'
                        }`}>
                          {typeInfo.label}
                        </span>

                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          stream.status === 'live' ? 'bg-red-100 text-red-700' :
                          stream.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {stream.status.charAt(0).toUpperCase() + stream.status.slice(1)}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{stream.title}</h3>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{new Date(stream.startTime).toLocaleDateString('en-US', { 
                            month: 'long', day: 'numeric', year: 'numeric' 
                          })}</span>
                        </div>

                        {stream.preacherNames?.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users size={14} />
                            <span className="line-clamp-1">{stream.preacherNames.join(', ')}</span>
                          </div>
                        )}

                        {stream.scriptures?.length > 0 && (
                          <div className="flex items-center gap-2">
                            <BookOpen size={14} />
                            <span className="line-clamp-1">{stream.scriptures.join(', ')}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Eye size={14} />
                          <span>{stream.viewCount?.toLocaleString() || 0} views</span>
                        </div>
                      </div>

                      {stream.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{stream.description}</p>
                      )}

                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => showConfirm(
                            'Delete Stream?',
                            'This action cannot be undone.',
                            () => handleDeleteStream(stream._id),
                            'danger'
                          )}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

     


      {/* Create/Edit Modal */}
      {showStreamModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl md:max-w-3xl lg:max-w-4xl my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10 flex items-center justify-between p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Livestream' : 'Create New Livestream'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stream Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sunday Morning Worship Service"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {streamTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live Now</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Brief overview of the service..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube URL / Embed
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook Live URL
                  </label>
                  <input
                    type="url"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({...formData, facebookUrl: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://facebook.com/live/..."
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-base font-semibold text-gray-900">Preachers</label>
                  <button
                    type="button"
                    onClick={addPreacherField}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    + Add Preacher
                  </button>
                </div>
                <div className="space-y-3">
                  {preacherInputs.map((preacher, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        placeholder={`Preacher ${index + 1} name`}
                        value={preacher}
                        onChange={(e) => updatePreacher(index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {preacherInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePreacherField(index)}
                          className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-base font-semibold text-gray-900">Scripture References</label>
                  <button
                    type="button"
                    onClick={addScriptureField}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    + Add Scripture
                  </button>
                </div>
                <div className="space-y-3">
                  {scriptureInputs.map((scripture, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        placeholder="e.g., John 3:16 or Psalm 23:1-6"
                        value={scripture}
                        onChange={(e) => updateScripture(index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {scriptureInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeScriptureField(index)}
                          className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 block">Public Access</span>
                    <span className="text-sm text-gray-600">
                      {formData.isPublic 
                        ? 'Visible to everyone' 
                        : 'Restricted to logged-in members'}
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 order-2 sm:order-1"
                >
                  {loading 
                    ? 'Saving...' 
                    : editingId 
                      ? 'Update Stream' 
                      : 'Create Stream'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="flex-1 px-6 py-3.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-60 order-1 sm:order-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLiveStream;
                          