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
      setError('Failed to load gallery. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Very minimal top padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        {/* Filter section */}
        <div className="mb-10">
          <GalleryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-10 text-center">
            {error}
          </div>
        )}

        {/* Gallery */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-7xl mb-6 opacity-70">📸</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              No photos found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto text-lg">
              {selectedCategory === 'All'
                ? 'The gallery is currently empty.'
                : `No photos in "${selectedCategory}" yet.`}
            </p>
          </div>
        ) : (
          <GalleryGrid 
            photos={filteredPhotos} 
            onPhotoClick={setSelectedPhoto} 
          />
        )}
      </div>

      {/* Modal */}
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