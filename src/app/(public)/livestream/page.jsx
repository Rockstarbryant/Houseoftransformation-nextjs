'use client';

import React, { useState } from 'react';
import { Play, Calendar, Users, BookOpen, Share2, TrendingUp, ChevronDown } from 'lucide-react';
import { useLivestream } from '@/hooks/useLivestream';

const LiveStreamPage = () => {
  const { activeStream, archives, loading, fetchArchives } = useLivestream();
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('-startTime');
  const [selectedStream, setSelectedStream] = useState(null);
  const [gridView, setGridView] = useState(true);
  const [showCaptions, setShowCaptions] = useState(false);

  const streamTypes = [
    { value: '', label: 'All Livestreams' },
    { value: 'sermon', label: '🎤 Sermons' },
    { value: 'praise_worship', label: '🎵 Praise & Worship' },
    { value: 'full_service', label: '⛪ Full Service' },
    { value: 'sunday_school', label: '📚 Sunday School' },
    { value: 'special_event', label: '🎉 Special Events' }
  ];

  const handleFilterChange = (type) => {
    setFilterType(type);
    fetchArchives({ type, sortBy, limit: 100 });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    fetchArchives({ type: filterType, sortBy: sort, limit: 100 });
  };

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

  const handleShare = (stream) => {
    const text = `Watch: ${stream.title}`;
    if (navigator.share) {
      navigator.share({ title: stream.title, text });
    } else {
      alert('Copy link to share: ' + window.location.href);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* ACTIVE STREAM */}
      {activeStream && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-bold uppercase tracking-widest text-sm">STREAMING NOW</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{activeStream.title}</h1>
            <div className="flex flex-wrap gap-4 text-red-100 mb-6">
              <span className="flex items-center gap-2 capitalize"><Play size={16} /> {activeStream.type.replace('_', ' ')}</span>
              {activeStream.preacherNames?.length > 0 && (
                <span className="flex items-center gap-2"><Users size={16} /> {activeStream.preacherNames.join(', ')}</span>
              )}
            </div>
            {getEmbedUrl(activeStream) && (
              <div className="aspect-video rounded-lg overflow-hidden shadow-xl mb-4">
                <iframe
                  src={getEmbedUrl(activeStream)}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay"
                  title={activeStream.title}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ARCHIVES SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Livestream Archives</h2>
          <p className="text-gray-600 text-lg">Catch up on all our past services and events</p>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {streamTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="-startTime">Newest First</option>
              <option value="startTime">Oldest First</option>
              <option value="-viewCount">Most Watched</option>
            </select>

            <button
              onClick={() => setGridView(!gridView)}
              className="border rounded-lg px-4 py-2 hover:bg-gray-50"
            >
              {gridView ? '📋 List' : '📊 Grid'}
            </button>
          </div>
        </div>

        {/* ARCHIVES GRID/LIST */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Loading archives...</p>
          </div>
        ) : archives.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No archives available</p>
          </div>
        ) : (
          <div className={gridView ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {archives.map((stream) => (
              <div key={stream._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group">
                {/* Thumbnail */}
                {getEmbedUrl(stream) && (
                  <div
                    className="relative aspect-video bg-black overflow-hidden cursor-pointer group-hover:opacity-90 transition"
                    onClick={() => setSelectedStream(stream)}
                  >
                    <iframe
                      src={getEmbedUrl(stream)}
                      className="w-full h-full pointer-events-none"
                      allow="autoplay"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition flex items-center justify-center">
                      <div className="bg-red-600 rounded-full p-4">
                        <Play size={24} className="text-white fill-white" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded capitalize">
                      {stream.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(stream.startTime).toLocaleDateString()}</span>
                  </div>

                  <h3
                    className="font-bold text-lg mb-3 line-clamp-2 cursor-pointer hover:text-blue-600"
                    onClick={() => setSelectedStream(stream)}
                  >
                    {stream.title}
                  </h3>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    {stream.preacherNames?.length > 0 && (
                      <p className="flex items-center gap-2">
                        <Users size={14} className="text-blue-600" />
                        {stream.preacherNames.join(', ')}
                      </p>
                    )}
                    {stream.scriptures?.length > 0 && (
                      <p className="flex items-center gap-2">
                        <BookOpen size={14} className="text-green-600" />
                        {stream.scriptures.slice(0, 2).join(', ')}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-orange-600" />
                      {stream.viewCount || 0} views
                    </p>
                  </div>

                  {/* AI Summary */}
                  {stream.aiSummary?.summary && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded text-sm">
                      <p className="font-semibold text-blue-900 mb-1">✨ Summary</p>
                      <p className="text-blue-800 line-clamp-3">{stream.aiSummary.summary}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedStream(stream)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Play size={16} /> Watch
                    </button>
                    <button
                      onClick={() => handleShare(stream)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                      title="Share"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedStream && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedStream(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gray-100 border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedStream.title}</h2>
              <button onClick={() => setSelectedStream(null)} className="text-2xl font-bold">&times;</button>
            </div>

            <div className="p-6">
              {getEmbedUrl(selectedStream) && (
                <div className="aspect-video mb-6 rounded-lg overflow-hidden">
                  <iframe
                    src={getEmbedUrl(selectedStream)}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay"
                    title={selectedStream.title}
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Type</h3>
                  <p className="capitalize text-lg">{selectedStream.type.replace('_', ' ')}</p>
                </div>

                {selectedStream.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Description</h3>
                    <p className="text-gray-700">{selectedStream.description}</p>
                  </div>
                )}

                {selectedStream.preacherNames?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Preacher(s)</h3>
                    <p className="text-lg">{selectedStream.preacherNames.join(', ')}</p>
                  </div>
                )}

                {selectedStream.scriptures?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Scriptures</h3>
                    <p className="text-lg">{selectedStream.scriptures.join(', ')}</p>
                  </div>
                )}

                {selectedStream.aiSummary?.keyPoints && selectedStream.aiSummary.keyPoints.length > 0 && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Key Points</h3>
                    <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                      {selectedStream.aiSummary.keyPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedStream.aiSummary?.captions && selectedStream.aiSummary.captions.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">AI Captions</h3>
                      <button
                        onClick={() => setShowCaptions(!showCaptions)}
                        className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
                      >
                        {showCaptions ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {showCaptions && (
                      <div className="bg-gray-100 rounded-lg p-4 max-h-48 overflow-y-auto text-sm">
                        {selectedStream.aiSummary.captions.map((caption, idx) => (
                          <div key={idx} className="mb-2 text-gray-800">
                            <span className="font-semibold text-blue-600">[{caption.timestamp}] {caption.speaker}:</span>
                            <p className="ml-4 text-gray-700">{caption.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-sm text-gray-500 border-t pt-4">
                  <p>{new Date(selectedStream.startTime).toLocaleString()} • {selectedStream.viewCount || 0} views</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStreamPage;
