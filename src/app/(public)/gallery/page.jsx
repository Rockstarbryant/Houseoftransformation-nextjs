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

  // --- LOGIC PRESERVED 100% ---
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,_rgba(139,26,26,0.03)_0%,_transparent_70%)] pointer-events-none" />

      {/* Main Container: Mobile spacing optimized */}
      <div className="relative pt-20 md:pt-24 lg:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          
          {/* Page Header: Editorial Style */}
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-block px-4 py-1.5 bg-red-50 rounded-full mb-4">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#8B1A1A]">
                The Vision in Pictures
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
              Photo <span className="text-[#8B1A1A]">Gallery</span>
            </h1>
            <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Capturing memories, moments, and milestones from our church family at Busia House of Transformation.
            </p>
          </div>

          {/* Category Filters: Logic Preserved */}
          <div className="mb-10 md:mb-14 overflow-x-auto no-scrollbar">
            <GalleryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Error Message: Styled to match Sermon Cards */}
          {error && (
            <div className="max-w-2xl mx-auto bg-red-50 border border-red-100 text-[#8B1A1A] px-6 py-4 rounded-2xl mb-12 text-center text-sm font-bold flex items-center justify-center gap-3 shadow-sm">
              <span className="bg-[#8B1A1A] text-white size-5 flex items-center justify-center rounded-full text-[10px]">!</span>
              {error}
            </div>
          )}

          {/* Gallery Content: Fluid Grid */}
          <div className="relative">
            {filteredPhotos.length === 0 ? (
              <div className="text-center py-20 md:py-32 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 shadow-inner">
                <div className="text-6xl md:text-7xl mb-6 grayscale opacity-40">📸</div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">
                  No Moments Found
                </h3>
                <p className="text-slate-500 text-sm md:text-base max-w-xs mx-auto font-medium leading-relaxed">
                  {selectedCategory === 'All'
                    ? 'The gallery is currently empty. We are preparing to share our moments with you soon!'
                    : `We don't have any photos under "${selectedCategory}" yet.`}
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
      </div>

      {/* Photo Modal: Logic Preserved */}
      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)}
          allPhotos={filteredPhotos}
        />
      )}

      {/* Custom Styles for scannability */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}