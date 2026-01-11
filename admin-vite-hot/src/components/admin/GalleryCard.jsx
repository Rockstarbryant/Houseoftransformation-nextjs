import React, { useState } from 'react';
import { Heart, Trash2, Eye } from 'lucide-react';

const GalleryCard = ({ photo, onDelete, onLike, onViewDetails, isLiked = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Delete this photo? This action cannot be undone.')) {
      onDelete(photo._id);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    onLike(photo._id);
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={photo.imageUrl}
          alt={photo.title || 'Gallery photo'}
          className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
          onError={(e) => {
            e.target.style.display = 'none';
            // Minimal fallback - no broken image icon spam
            e.target.parentElement.style.background = '#f3f4f6';
            e.target.parentElement.innerHTML += '<div class="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">Image unavailable</div>';
          }}
        />

        {/* Hover Overlay - only View button */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <button
              onClick={() => onViewDetails(photo)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-lg font-medium shadow hover:bg-gray-50 transition active:scale-95"
            >
              <Eye size={17} />
              View
            </button>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 text-gray-800 text-xs font-semibold rounded-full shadow-sm">
            {photo.category || 'General'}
          </span>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`absolute top-3 right-3 p-2 rounded-full transition ${
            isLiked
              ? 'bg-red-50 text-red-600'
              : 'bg-white/85 text-gray-600 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content + Footer with actions */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
          {photo.title || 'Untitled'}
        </h3>
        {photo.description && (
          <p className="text-sm text-gray-600 line-clamp-1 mb-3">
            {photo.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
          {/* Likes */}
          <div className="flex items-center gap-1.5 text-gray-600">
            <Heart 
              size={15} 
              className={isLiked ? 'fill-red-500 text-red-500' : ''} 
            />
            <span>{photo.likes || 0}</span>
          </div>

          {/* Admin Actions - always visible, clean */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onViewDetails(photo)}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
              title="View Details"
            >
              <Eye size={18} />
            </button>

            <button
              onClick={handleDelete}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
              title="Delete Photo"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;