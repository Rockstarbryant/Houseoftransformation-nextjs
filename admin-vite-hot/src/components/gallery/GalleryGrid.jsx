import React from 'react';
import PhotoCard from './PhotoCard';

const GalleryGrid = ({ photos, onPhotoClick }) => {
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No photos available</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {photos.map(photo => (
        <PhotoCard 
          key={photo._id} 
          photo={photo} 
          onViewFullSize={() => onPhotoClick(photo)}
        />
      ))}
    </div>
  );
};

export default GalleryGrid;