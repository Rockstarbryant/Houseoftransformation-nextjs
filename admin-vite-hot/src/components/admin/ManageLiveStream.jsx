import React, { useState, useEffect } from 'react';
import { Plus, Archive, CheckCircle, AlertCircle } from 'lucide-react';
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

  const [view, setView] = useState('manage');
  const [gridView, setGridView] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Preacher and Scripture inputs
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
    { value: 'sermon', label: 'Sermon' },
    { value: 'praise_worship', label: 'Praise & Worship' },
    { value: 'full_service', label: 'Full Service' },
    { value: 'sunday_school', label: 'Sunday School' },
    { value: 'special_event', label: 'Special Event' }
  ];

  // Preacher field management
  const addPreacherField = () => {
    setPreacherInputs([...preacherInputs, '']);
  };

  const removePreacherField = (index) => {
    setPreacherInputs(preacherInputs.filter((_, i) => i !== index));
  };

  const updatePreacher = (index, value) => {
    const updated = [...preacherInputs];
    updated[index] = value;
    setPreacherInputs(updated);
    setFormData({...formData, preacherNames: updated.filter(p => p.trim())});
  };

  // Scripture field management
  const addScriptureField = () => {
    setScriptureInputs([...scriptureInputs, '']);
  };

  const removeScriptureField = (index) => {
    setScriptureInputs(scriptureInputs.filter((_, i) => i !== index));
  };

  const updateScripture = (index, value) => {
    const updated = [...scriptureInputs];
    updated[index] = value;
    setScriptureInputs(updated);
    setFormData({...formData, scriptures: updated.filter(s => s.trim())});
  };

  // Fetch archives when filter changes
  useEffect(() => {
    publicFetchArchives({ 
      type: filterType, 
      limit: 50,
      includeScheduled: true
    });
  }, [filterType, publicFetchArchives]);

  const handleCreateStream = async (e) => {
    e.preventDefault();
    
    if (editingId) {
      const result = await updateStream(editingId, {
        title: formData.title,
        type: formData.type,
        status: formData.status,
        youtubeUrl: formData.youtubeUrl,
        facebookUrl: formData.facebookUrl,
        preacherNames: formData.preacherNames,
        scriptures: formData.scriptures,
        description: formData.description,
        isPublic: formData.isPublic
      });
      if (result.success) {
        resetForm();
        setView('manage');
        publicFetchArchives({ type: filterType });
      }
    } else {
      const result = await createStream(formData);
      if (result.success) {
        resetForm();
        setView('manage');
        publicFetchArchives({ type: filterType });
      }
    }
  };

  const handleEndStream = async () => {
    if (!publicActiveStream) return;
    const result = await archiveStream(publicActiveStream._id, {
      archiveUrl: publicActiveStream.youtubeUrl || publicActiveStream.facebookUrl
    });
    if (result.success) {
      publicFetchArchives({ type: filterType });
    }
  };

  const handleDeleteStream = async (id) => {
    const confirmed = window.confirm('Delete this stream? This action cannot be undone.');
    if (!confirmed) return;
    const result = await deleteStream(id);
    if (result.success) {
      publicFetchArchives({ type: filterType });
    }
  };

  const handleEditStream = (stream) => {
    setPreacherInputs(stream.preacherNames && stream.preacherNames.length > 0 ? stream.preacherNames : ['']);
    setScriptureInputs(stream.scriptures && stream.scriptures.length > 0 ? stream.scriptures : ['']);
    setFormData({
      title: stream.title,
      type: stream.type,
      youtubeUrl: stream.youtubeUrl || '',
      facebookUrl: stream.facebookUrl || '',
      startTime: new Date(stream.startTime).toISOString().slice(0, 16),
      status: stream.status || 'scheduled',
      isPublic: stream.isPublic !== false,
      preachers: stream.preachers || [],
      preacherNames: stream.preacherNames || [],
      scriptures: stream.scriptures || [],
      description: stream.description || ''
    });
    setEditingId(stream._id);
    setView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setPreacherInputs(['']);
    setScriptureInputs(['']);
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
    setEditingId(null);
  };

  const filteredArchives = searchTerm
    ? publicArchives.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : publicArchives;

  const getEmbedUrl = (stream) => {
    if (stream.youtubeVideoId) {
      return `https://www.youtube.com/embed/${stream.youtubeVideoId}`;
    }
    if (stream.youtubeUrl?.includes('youtube')) {
      return stream.youtubeUrl;
    }
    if (stream.facebookUrl) {
      return stream.facebookUrl;
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Manage Livestreams</h1>

      {/* SUCCESS/ERROR ALERTS */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-800">{success}</p>
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* ACTIVE STREAM SECTION */}
      {publicActiveStream && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-red-700">LIVE NOW</h2>
            </div>
            <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">Active</span>
          </div>
          <h3 className="text-xl font-bold mb-4">{publicActiveStream.title}</h3>
          
          {/* Video Preview */}
          {getEmbedUrl(publicActiveStream) && (
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg mb-4">
              <iframe
                src={getEmbedUrl(publicActiveStream)}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay"
                title={publicActiveStream.title}
              />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-semibold capitalize">{publicActiveStream.type.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Started</p>
              <p className="font-semibold">{new Date(publicActiveStream.startTime).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleEditStream(publicActiveStream)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
              Edit
            </button>
            <button onClick={handleEndStream} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50" disabled={loading}>
              {loading ? 'Processing...' : 'End & Archive'}
            </button>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-4 mb-8 border-b">
        <button onClick={() => setView('manage')} className={`pb-3 px-4 font-semibold border-b-2 ${view === 'manage' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}>
          Dashboard
        </button>
        <button onClick={() => { setView('create'); resetForm(); }} className={`pb-3 px-4 font-semibold border-b-2 flex items-center gap-2 ${view === 'create' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}>
          <Plus size={18} /> New Stream
        </button>
        <button onClick={() => setView('archive')} className={`pb-3 px-4 font-semibold border-b-2 flex items-center gap-2 ${view === 'archive' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}>
          <Archive size={18} /> Archives ({publicArchives.length})
        </button>
      </div>

      {/* CREATE/EDIT FORM */}
      {view === 'create' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Stream' : 'Create New Stream'}</h2>
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Stream Title *</label>
              <input
                type="text"
                placeholder="e.g., Sunday Morning Service"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Type & Status */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Stream Type *</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {streamTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Status *</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live Now</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
              <textarea
                placeholder="Brief description of the stream (optional)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Start Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* URLs */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">YouTube URL</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Facebook URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/watch/..."
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData({...formData, facebookUrl: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* PREACHERS SECTION */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Preachers</h3>
                <button
                  type="button"
                  onClick={addPreacherField}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                >
                  + Add Preacher
                </button>
              </div>
              <div className="space-y-2">
                {preacherInputs.map((preacher, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Preacher ${index + 1} name`}
                      value={preacher}
                      onChange={(e) => updatePreacher(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {preacherInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePreacherField(index)}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">Add multiple preachers if they co-preached</p>
            </div>

            {/* SCRIPTURES SECTION */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Scripture References</h3>
                <button
                  type="button"
                  onClick={addScriptureField}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                >
                  + Add Scripture
                </button>
              </div>
              <div className="space-y-2">
                {scriptureInputs.map((scripture, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., John 3:16 or Romans 12:1-5"
                      value={scripture}
                      onChange={(e) => updateScripture(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {scriptureInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeScriptureField(index)}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">Add main scriptures referenced in the sermon</p>
            </div>

            {/* Public Access Toggle */}
            <div className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                  className="w-4 h-4"
                />
                <div>
                  <span className="font-semibold text-gray-900">Public Access</span>
                  <p className="text-xs text-gray-600">
                    {formData.isPublic 
                      ? 'Anyone can view this stream' 
                      : 'Only registered members can view (coming soon)'}
                  </p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button onClick={handleCreateStream} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
              {loading ? 'Processing...' : editingId ? 'Update Stream' : 'Create Stream'}
            </button>
          </div>
        </div>
      )}

      {/* ARCHIVES VIEW */}
      {view === 'archive' && (
        <div>
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search streams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Types</option>
              {streamTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button onClick={() => setGridView(!gridView)} className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition font-semibold">
              {gridView ? 'List View' : 'Grid View'}
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-12">Loading streams...</p>
          ) : filteredArchives && filteredArchives.length > 0 ? (
            <div className={gridView ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredArchives.map(stream => (
                <div key={stream._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition p-5">
                  {/* Video Preview */}
                  {getEmbedUrl(stream) && (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                      <iframe
                        src={getEmbedUrl(stream)}
                        className="w-full h-full"
                        allowFullScreen
                        allow="autoplay"
                        title={stream.title}
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                      {stream.type.replace('_', ' ')}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      stream.status === 'live' ? 'bg-red-100 text-red-700' :
                      stream.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {stream.status === 'live' ? 'Live' : stream.status === 'scheduled' ? 'Scheduled' : 'Archived'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">{stream.title}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p>📅 {new Date(stream.startTime).toLocaleDateString()}</p>
                    {stream.preacherNames && stream.preacherNames.length > 0 && <p>👤 {stream.preacherNames.join(', ')}</p>}
                    {stream.scriptures && stream.scriptures.length > 0 && <p>📖 {stream.scriptures.join(', ')}</p>}
                    <p>👁️ {stream.viewCount || 0} views</p>
                  </div>
                  {stream.aiSummary?.summary && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4 text-xs">
                      <p className="font-semibold text-blue-900 mb-1">Summary</p>
                      <p className="text-blue-800 line-clamp-2">{stream.aiSummary.summary}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => handleEditStream(stream)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50" disabled={loading}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteStream(stream._id)} className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition disabled:opacity-50" disabled={loading}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">No streams found</p>
          )}
        </div>
      )}

      {/* DASHBOARD */}
      {view === 'manage' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">Overview of all livestreams</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Total Streams</p>
              <p className="text-3xl font-bold text-blue-700">{publicArchives.length}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm text-gray-600 mb-1">Live Now</p>
              <p className="text-3xl font-bold text-red-700">{publicArchives.filter(s => s.status === 'live').length}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-sm text-gray-600 mb-1">Scheduled</p>
              <p className="text-3xl font-bold text-amber-700">{publicArchives.filter(s => s.status === 'scheduled').length}</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
              <p className="text-sm text-gray-600 mb-1">Archived</p>
              <p className="text-3xl font-bold text-gray-700">{publicArchives.filter(s => s.status === 'archived').length}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Streams</h3>
            {publicArchives && publicArchives.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicArchives.slice(0, 6).map(stream => (
                  <div key={stream._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" onClick={() => { setView('archive'); setFilterType(stream.type); }}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 flex-1">{stream.title}</h4>
                      <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ml-2 ${
                        stream.status === 'live' ? 'bg-red-100 text-red-700' :
                        stream.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {stream.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{new Date(stream.startTime).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-600">{stream.type.replace('_', ' ')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No streams yet. Create one to get started!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLiveStream;