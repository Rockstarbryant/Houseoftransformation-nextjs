'use client';

import React, { useState, useEffect } from 'react';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import GalleryFilter from '@/components/gallery/GalleryFilter';
import PhotoModal from '@/components/gallery/PhotoModal';
import Loader from '@/components/common/Loader';
import { galleryService } from '@/services/api/galleryService';

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredPhotos(photos);
    } else {
      setFilteredPhotos(photos.filter(photo => photo.category === selectedCategory));
    }
  }, [selectedCategory, photos]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const data = await galleryService.getPhotos();
      setPhotos(data.photos || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError('Unable to load photos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Push content below fixed header */}
      <div className="pt-14 md:pt-16 lg:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          {/* Page Title & Subtitle */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-red-900 tracking-tight mb-4">
              Photo Gallery
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Capturing memories, moments, and milestones from our church family
            </p>
          </div>

          {/* Category Filters */}
          <div className="mb-12">
            <GalleryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl mb-12 text-center font-medium">
              {error}
            </div>
          )}

          {/* Gallery Content */}
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-8xl mb-6 opacity-60">📸</div>
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
                No photos found
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                {selectedCategory === 'All'
                  ? 'The gallery is currently empty. Check back soon!'
                  : `No photos in the "${selectedCategory}" category yet.`}
              </p>
            </div>
          ) : (
            <GalleryGrid 
              photos={filteredPhotos} 
              onPhotoClick={setSelectedPhoto} 
            />
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)}
          allPhotos={filteredPhotos}
        />
      )}
    </div>
  );
}