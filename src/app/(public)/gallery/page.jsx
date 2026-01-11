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
      setError('Failed to load gallery. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Photo Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Capturing memories, moments, and milestones from our church family.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {canUploadPhoto() && (
              <Button
                onClick={handlePhotoUpload}
                variant="primary"
                className="flex items-center gap-2 text-lg px-8 py-4"
              >
                <Plus size={24} />
                Upload Photo
              </Button>
            )}

            {!canUploadPhoto() && user && (
              <PermissionAlert
                title="Upload Restricted"
                message="Only pastors and bishops can add photos to the gallery."
                requiredRole="pastor"
                currentRole={user.role}
                actionType="photo upload"
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-10 text-center">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-10">
          <GalleryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Gallery Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-7xl mb-6 opacity-70">📸</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              No photos found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto text-lg">
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

      {/* Modal */}
      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)}
          allPhotos={filteredPhotos} // enables navigation if you want to add it later
        />
      )}
    </div>
  );
}