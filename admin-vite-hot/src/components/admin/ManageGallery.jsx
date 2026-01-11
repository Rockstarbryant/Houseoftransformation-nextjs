import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, LayoutGrid, ListIcon, RefreshCw, AlertCircle, CheckCircle, Trash2, Download, Square, CheckSquare } from 'lucide-react';
import { galleryService } from '@/services/api/galleryService';
import GalleryUploader from './GalleryUploader';
import GalleryCard from './GalleryCard';
import GalleryLightbox from './GalleryLightbox';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const GALLERY_CATEGORIES = [
  'All',
  'Worship Services',
  'Youth Events',
  'Community Outreach',
  'Special Events',
  'Kids Ministry'
];

export default function ManageGallery() {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // UI States
  const [showUploader, setShowUploader] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [likedPhotos, setLikedPhotos] = useState([]);

  // Multi-select states
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch photos
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await galleryService.getPhotos();
      if (response.success) {
        setPhotos(response.photos || []);
      } else {
        setError(response.message || 'Failed to load photos');
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError(err.response?.data?.message || 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Filter & Sort
  useEffect(() => {
    let result = [...photos];
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'most-liked') {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    setFilteredPhotos(result);
  }, [photos, selectedCategory, searchQuery, sortBy]);

  // Reset selection when filters change
  useEffect(() => {
    setSelectedIds([]);
  }, [filteredPhotos]);

  // Toggle select mode
  const toggleSelectMode = () => {
    setSelectMode(prev => !prev);
    setSelectedIds([]); // clear selection when toggling off
  };

  // Select / deselect single
  const toggleSelect = (photoId) => {
    setSelectedIds(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  // Select All / Deselect All
  const selectAll = () => {
    if (selectedIds.length === filteredPhotos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPhotos.map(p => p._id));
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} photo(s)? This cannot be undone.`)) return;

    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map(id => galleryService.deletePhoto(id))
      );
      setPhotos(prev => prev.filter(p => !selectedIds.includes(p._id)));
      setSuccessMessage(`${selectedIds.length} photo(s) deleted successfully!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError('Failed to delete some photos');
    } finally {
      setSelectedIds([]);
      setLoading(false);
    }
  };

  // Bulk Download as ZIP
  const handleBulkDownload = async () => {
    if (!selectedIds.length) return;

    const selectedPhotos = filteredPhotos.filter(p => selectedIds.includes(p._id));
    const zip = new JSZip();

    try {
      for (const photo of selectedPhotos) {
        const response = await fetch(photo.imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch ${photo.imageUrl}`);
        const blob = await response.blob();
        const filename = photo.title
          ? `${photo.title.replace(/[^a-z0-9]/gi, '_')}.jpg`
          : `photo-${photo._id}.jpg`;
        zip.file(filename, blob);
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(zipContent, `gallery-selected-${new Date().toISOString().slice(0,10)}.zip`);
      setSuccessMessage('ZIP file downloaded!');
    } catch (err) {
      console.error(err);
      setError('Failed to download some images. Try again or download individually.');
    }
  };

  // Existing handlers...
  const handleUpload = async (formData) => {
    try {
      const response = await galleryService.uploadPhoto(formData);
      if (response.success) {
        setSuccessMessage('Photo uploaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        await fetchPhotos();
        return true;
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  const handleDelete = async (photoId) => {
    try {
      const response = await galleryService.deletePhoto(photoId);
      if (response.success) {
        setPhotos(prev => prev.filter(p => p._id !== photoId));
        setSuccessMessage('Photo deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to delete photo');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete photo');
    }
  };

  const handleLike = async (photoId) => {
    try {
      const response = await galleryService.likePhoto(photoId);
      if (response.success) {
        setLikedPhotos(prev =>
          prev.includes(photoId)
            ? prev.filter(id => id !== photoId)
            : [...prev, photoId]
        );
        setPhotos(prev =>
          prev.map(p => p._id === photoId ? { ...p, likes: response.likes } : p)
        );
        setFilteredPhotos(prev =>
          prev.map(p => p._id === photoId ? { ...p, likes: response.likes } : p)
        );
      }
    } catch (err) {
      setError('Failed to like photo');
    }
  };

  const handleViewDetails = (photo) => {
    setSelectedPhoto(photo);
    setShowLightbox(true);
  };

  const calculateStorageUsage = () => (photos.length * 2.5 / 1024).toFixed(2);
  const totalLikes = photos.reduce((sum, p) => sum + (p.likes || 0), 0);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Gallery</h1>
              <p className="text-gray-600">Manage and organize your church photos</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={toggleSelectMode}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto justify-center ${
                  selectMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {selectMode ? 'Exit Select Mode' : 'Select Mode'}
              </button>
              <button
                onClick={() => setShowUploader(true)}
                className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
              >
                <Plus size={20} />
                Upload Photos
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Total Photos</p>
              <p className="text-3xl font-bold text-gray-900">{photos.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Storage Used</p>
              <p className="text-3xl font-bold text-gray-900">{calculateStorageUsage()} GB</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Total Likes</p>
              <p className="text-3xl font-bold text-gray-900">{totalLikes}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <span className="text-green-800 font-medium">{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-600 hover:text-green-800">✕</button>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <span className="text-red-800 font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">✕</button>
          </div>
        )}

        {/* Filters & Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 space-y-4">
          {/* Search, Sort, Refresh */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search photos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="most-liked">Most Liked</option>
              <option value="alphabetical">A-Z</option>
            </select>
            <button
              onClick={fetchPhotos}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Category + View + Select All */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {GALLERY_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                    selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              {selectMode && filteredPhotos.length > 0 && (
                <button
                  onClick={selectAll}
                  className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition text-sm font-medium flex items-center gap-2"
                >
                  {selectedIds.length === filteredPhotos.length ? <Square size={16} /> : <CheckSquare size={16} />}
                  {selectedIds.length === filteredPhotos.length ? 'Deselect All' : 'Select All'}
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ListIcon size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading / Empty */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && filteredPhotos.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📸</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {photos.length === 0 ? 'No photos yet' : 'No photos found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {photos.length === 0 ? 'Start building your gallery' : 'Adjust filters or search'}
            </p>
            {photos.length === 0 && (
              <button
                onClick={() => setShowUploader(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                Upload First Photo
              </button>
            )}
          </div>
        )}

        {/* Gallery Grid/List */}
        {!loading && filteredPhotos.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {filteredPhotos.map(photo => (
              <GalleryCard
                key={photo._id}
                photo={photo}
                onDelete={handleDelete}
                onLike={handleLike}
                onViewDetails={handleViewDetails}
                isLiked={likedPhotos.includes(photo._id)}
                // New props for multi-select
                selectMode={selectMode}
                isSelected={selectedIds.includes(photo._id)}
                onToggleSelect={() => toggleSelect(photo._id)}
              />
            ))}
          </div>
        )}

        {/* Bulk Actions Bar (floating bottom) */}
        {selectMode && selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-2xl border border-gray-200 rounded-xl px-6 py-4 flex items-center gap-6 z-50">
            <span className="font-medium text-gray-700">
              {selectedIds.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 size={18} />
              Delete
            </button>
            <button
              onClick={handleBulkDownload}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Download size={18} />
              Download ZIP
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <GalleryUploader
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        onUpload={handleUpload}
        categories={GALLERY_CATEGORIES.slice(1)}
      />

      <GalleryLightbox
        photo={selectedPhoto}
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        onLike={handleLike}
        onDelete={handleDelete}
        allPhotos={filteredPhotos}
        isLiked={selectedPhoto ? likedPhotos.includes(selectedPhoto._id) : false}
      />
    </div>
  );
}