import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Video,
  Radio,
  Archive,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  X,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { useLivestream, useLivestreamAdmin } from '../../hooks/useLivestream';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state with multiple preachers and scriptures
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

  useEffect(() => {
    publicFetchArchives({ 
      type: filterType, 
      limit: 100,
      includeScheduled: true
    });
  }, [filterType, publicFetchArchives]);

  // Preacher management
  const addPreacherField = () => setPreacherInputs([...preacherInputs, '']);
  const removePreacherField = (index) => setPreacherInputs(preacherInputs.filter((_, i) => i !== index));
  const updatePreacher = (index, value) => {
    const updated = [...preacherInputs];
    updated[index] = value;
    setPreacherInputs(updated);
    setFormData({...formData, preacherNames: updated.filter(p => p.trim())});
  };

  // Scripture management
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
      setShowDeleteConfirm(null);
      publicFetchArchives({ type: filterType, limit: 100, includeScheduled: true });
    }
  };

  const getEmbedUrl = (stream) => {
    if (stream.youtubeVideoId) return `https://www.youtube.com/embed/${stream.youtubeVideoId}`;
    if (stream.youtubeUrl?.includes('youtube.com')) return stream.youtubeUrl.replace('watch?v=', 'embed/');
    if (stream.facebookUrl) return stream.facebookUrl;
    return null;
  };

  // Filtered archives
  const filteredArchives = publicArchives.filter(stream => {
    const matchesSearch = searchTerm.trim() === '' || 
      stream.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stream.preacherNames?.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || stream.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Stats calculation
  const stats = {
    total: publicArchives.length,
    live: publicArchives.filter(s => s.status === 'live').length,
    scheduled: publicArchives.filter(s => s.status === 'scheduled').length,
    archived: publicArchives.filter(s => s.status === 'archived').length,
    totalViews: publicArchives.reduce((sum, s) => sum + (s.viewCount || 0), 0)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
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

      {/* Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-800 font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

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

      {/* Archive View - Completed Grid */}
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
                    {/* Preview / Embed */}
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

                    {/* Content */}
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

                      {/* Actions */}
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleOpenModal(stream)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(stream._id)}
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
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Livestream' : 'Create New Livestream'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
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

              {/* Type & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Start Time */}
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

              {/* Description */}
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

              {/* Platform URLs */}
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

              {/* Preachers */}
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

              {/* Scriptures */}
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

              {/* Public Access Toggle */}
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

              {/* Submit Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
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
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-red-600" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Stream?</h3>
                <p className="text-gray-600 mt-1">This action cannot be undone.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleDeleteStream(showDeleteConfirm)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-60"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLiveStream;