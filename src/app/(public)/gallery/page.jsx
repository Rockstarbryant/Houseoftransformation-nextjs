'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import GalleryFilter from '@/components/gallery/GalleryFilter';
import PhotoModal from '@/components/gallery/PhotoModal';
import Loader from '@/components/common/Loader';
import { galleryService } from '@/services/api/galleryService';
import { useAuthContext } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import PermissionAlert from '@/components/common/PermissionAlert';

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const { canUploadPhoto, user } = useAuthContext();

  const handlePhotoUpload = () => {
    alert('Photo upload form coming soon');
  };

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
      setError('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Photo Gallery</h1>
          <p className="text-xl text-gray-600 mb-6">Memories and moments from our community</p>

          {canUploadPhoto() && (
            <Button onClick={handlePhotoUpload} variant="primary" className="flex items-center gap-2">
              <Plus size={20} /> Upload Photo
            </Button>
          )}

          {!canUploadPhoto() && user && (
            <PermissionAlert
              title="Cannot Upload Photos"
              message="Only pastors and bishops can upload photos to the gallery."
              requiredRole="pastor"
              currentRole={user.role}
              actionType="photo upload"
            />
          )}
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8">{error}</div>
        )}

        <GalleryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No photos found in this category.</p>
          </div>
        ) : (
          <GalleryGrid photos={filteredPhotos} onPhotoClick={setSelectedPhoto} />
        )}
      </div>

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
}