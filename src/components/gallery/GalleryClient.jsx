'use client';

import React, { useState, useEffect } from 'react';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import GalleryFilter from '@/components/gallery/GalleryFilter';
import PhotoModal from '@/components/gallery/PhotoModal';

//export const revalidate = 600; // Revalidate every 60 seconds instead of force-dynamic
export default function GalleryClient({ initialPhotos }) {
  const [photos] = useState(initialPhotos);
  const [filteredPhotos, setFilteredPhotos] = useState(initialPhotos);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Filter photos when category changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredPhotos(photos);
    } else {
      setFilteredPhotos(photos.filter(photo => photo.category === selectedCategory));
    }
  }, [selectedCategory, photos]);

  return (
    <>
      {/* Category Filters */}
      <div className="mb-10 md:mb-14 overflow-x-auto no-scrollbar">
        <GalleryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Gallery Grid */}
      <div className="relative">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-20 md:py-32 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2rem] border border-dashed border-slate-200 shadow-inner">
            <div className="text-6xl md:text-7xl mb-6 grayscale opacity-40">📸</div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-2">
              No Moments Found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xs mx-auto font-medium leading-relaxed">
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

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)}
          allPhotos={filteredPhotos}
        />
      )}

      {/* Scrollbar Hide */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
