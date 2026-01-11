import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Trash2, Download } from 'lucide-react';

const GalleryLightbox = ({ photo, isOpen, onClose, onLike, onDelete, allPhotos = [], isLiked = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (photo && allPhotos.length > 0) {
      const index = allPhotos.findIndex(p => p._id === photo._id);
      setCurrentIndex(index !== -1 ? index : 0);
    }
  }, [photo, allPhotos]);

  if (!isOpen || !photo) return null;

  const currentPhoto = allPhotos[currentIndex] || photo;
  const hasMultiple = allPhotos.length > 1;

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? allPhotos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === allPhotos.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, allPhotos.length]);

  const handleDelete = () => {
    if (window.confirm('Delete this photo? This action cannot be undone.')) {
      onDelete(currentPhoto._id);
      onClose();
    }
  };

  const handleLike = () => {
    onLike(currentPhoto._id);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-lg transition"
      >
        <X size={32} className="text-white" />
      </button>

      {/* Main Image Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
          <img
            src={currentPhoto.imageUrl}
            alt={currentPhoto.title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x600?text=Image+Error';
            }}
          />
        </div>
      </div>

      {/* Navigation Arrows */}
      {hasMultiple && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-lg transition z-10 hover:scale-110 transform"
          >
            <ChevronLeft size={32} className="text-white" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-lg transition z-10 hover:scale-110 transform"
          >
            <ChevronRight size={32} className="text-white" />
          </button>
        </>
      )}

      {/* Bottom Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-10">
        <div className="max-w-4xl mx-auto">
          {/* Title & Info */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">{currentPhoto.title}</h2>
            {currentPhoto.description && (
              <p className="text-gray-200 mb-2">{currentPhoto.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <span className="px-3 py-1 bg-white/10 rounded-full">{currentPhoto.category}</span>
              <span className="flex items-center gap-1">
                <Heart size={16} className="fill-red-500 text-red-500" />
                {currentPhoto.likes || 0} likes
              </span>
              {hasMultiple && (
                <span className="px-3 py-1 bg-white/10 rounded-full">
                  {currentIndex + 1} / {allPhotos.length}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                isLiked
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              {isLiked ? 'Liked' : 'Like'}
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/80 text-white rounded-lg font-semibold hover:bg-red-600 transition"
            >
              <Trash2 size={18} />
              Delete
            </button>

            <a
              href={currentPhoto.imageUrl}
              download={currentPhoto.title}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition ml-auto"
            >
              <Download size={18} />
              Download
            </a>
          </div>
        </div>
      </div>

      {/* Keyboard Hints (Mobile) */}
      {hasMultiple && (
        <div className="absolute top-4 left-4 text-xs text-gray-400 pointer-events-none hidden md:block">
          ← → to navigate • ESC to close
        </div>
      )}
    </div>
  );
};

export default GalleryLightbox;