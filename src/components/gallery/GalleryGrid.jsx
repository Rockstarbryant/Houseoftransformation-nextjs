'use client';

import React from 'react';
import PhotoCard from './PhotoCard';

const GalleryGrid = ({ photos, onPhotoClick }) => {
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-block p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="text-6xl mb-4 opacity-70">📸</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            No photos yet
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            The gallery is currently empty. Check back later for new memories!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Optional subtle background pattern - very light */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>

      {/* Masonry/Grid Layout */}
      <div 
        className="
          columns-1 sm:columns-2 lg:columns-3 xl:columns-4 
          gap-6 space-y-6
          [&>div]:break-inside-avoid
          animate-fade-in
        "
      >
        {photos.map((photo, index) => (
          <div
            key={photo._id}
            className="animate-fade-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <PhotoCard 
              photo={photo}
              onViewFullSize={() => onPhotoClick(photo)}
            />
          </div>
        ))}
      </div>

      {/* Optional bottom fade for long lists */}
      {photos.length > 6 && (
        <div className="h-24 bg-gradient-to-t from-white to-transparent mt-8 pointer-events-none" />
      )}
    </div>
  );
};

// Simple fade-in animations (add to globals.css or tailwind config)
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 1s ease-out forwards;
  }
  .animate-fade-up {
    animation: fadeUp 0.7s ease-out forwards;
  }
`;

export default GalleryGrid;