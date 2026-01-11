'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, X, ChevronLeft, ChevronRight, Download } from 'lucide-react'; // Keep Lucide for consistency
import { galleryService } from '@/services/api/galleryService';
import { formatDate } from '@/utils/helpers';

const PhotoModal = ({
  photo,
  onClose,
  allPhotos = [], // Optional: for navigation between photos
}) => {
  const [likes, setLikes] = useState(photo.likes || 0);
  const [liked, setLiked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://house-of-transformation.onrender.com';

  // Set initial index when modal opens
  useEffect(() => {
    if (photo && allPhotos.length > 0) {
      const index = allPhotos.findIndex(p => p._id === photo._id);
      setCurrentIndex(index !== -1 ? index : 0);
    }
  }, [photo, allPhotos]);

  // Keyboard navigation (arrows + ESC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && allPhotos.length > 1) {
        setCurrentIndex(prev => (prev === 0 ? allPhotos.length - 1 : prev - 1));
      }
      if (e.key === 'ArrowRight' && allPhotos.length > 1) {
        setCurrentIndex(prev => (prev === allPhotos.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, allPhotos.length]);

  const currentPhoto = allPhotos[currentIndex] || photo;
  const hasMultiple = allPhotos.length > 1;

  const imageUrl = currentPhoto.imageUrl.startsWith('http')
    ? currentPhoto.imageUrl
    : `${API_BASE}${currentPhoto.imageUrl}`;

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await galleryService.likePhoto(currentPhoto._id);
      setLikes(response.likes);
      setLiked(!liked);
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = currentPhoto.title
      ? `${currentPhoto.title.replace(/[^a-z0-9]/gi, '_')}.jpg`
      : 'photo.jpg';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-gray-300 z-50 p-2 rounded-full bg-black/30 hover:bg-black/50 transition"
      >
        <X size={32} />
      </button>

      {/* Navigation Arrows (only if multiple photos) */}
      {hasMultiple && (
        <>
          <button
            onClick={() => setCurrentIndex(prev => (prev === 0 ? allPhotos.length - 1 : prev - 1))}
            className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-3 rounded-full bg-black/30 hover:bg-black/50 transition hidden md:flex items-center justify-center z-40"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={() => setCurrentIndex(prev => (prev === allPhotos.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-3 rounded-full bg-black/30 hover:bg-black/50 transition hidden md:flex items-center justify-center z-40"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Main Content */}
      <div className="relative w-full max-w-5xl h-[85vh] md:h-[90vh] flex flex-col">
        {/* Image */}
        <div className="relative flex-1 w-full overflow-hidden rounded-xl shadow-2xl">
          <Image
            src={imageUrl}
            alt={currentPhoto.title || 'Gallery photo'}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
            quality={90}
            onError={(e) => {
              e.target.src = '/fallback-image.jpg'; // Add a fallback if needed
            }}
          />
        </div>

        {/* Bottom Info Panel */}
        <div className="mt-4 md:mt-6 bg-white/95 backdrop-blur-sm p-5 md:p-6 rounded-xl shadow-lg">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-1">
            {currentPhoto.title || 'Untitled'}
          </h2>

          {currentPhoto.description && (
            <p className="text-gray-700 mb-4 md:mb-5 line-clamp-3 md:line-clamp-4 leading-relaxed">
              {currentPhoto.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full">
                  {currentPhoto.category || 'Uncategorized'}
                </span>
              </span>

              <span className="flex items-center gap-1">
                {formatDate(currentPhoto.createdAt || currentPhoto.date, 'long')}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  liked
                    ? 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
                }`}
              >
                <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                {likes}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
              >
                <Download size={20} />
                Download
              </button>
            </div>
          </div>

          {/* Navigation Counter */}
          {hasMultiple && (
            <div className="mt-3 text-center text-sm text-gray-500">
              {currentIndex + 1} / {allPhotos.length}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Keyboard Hint */}
      {hasMultiple && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400 md:hidden">
          Swipe left/right or use arrows
        </div>
      )}
    </div>
  );
};

export default PhotoModal;