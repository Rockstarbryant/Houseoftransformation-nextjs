import React, { useState } from 'react';
import { Heart, Trash2, Eye, MoreVertical } from 'lucide-react';

const GalleryCard = ({ photo, onDelete, onLike, onViewDetails, isLiked = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Delete this photo? This action cannot be undone.')) {
      onDelete(photo._id);
    }
    setShowMenu(false);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    onLike(photo._id);
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer">
        <img
          src={photo.imageUrl}
          alt={photo.title}
          className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><span class="text-gray-500 text-sm">Image unavailable</span></div>';
          }}
        />

        {/* Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3">
            <button
              onClick={() => onViewDetails(photo)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              <Eye size={18} />
              View
            </button>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-3 py-1 bg-white/90 text-gray-900 text-xs font-bold rounded-full shadow-sm backdrop-blur-sm">
            {photo.category}
          </span>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`absolute top-3 right-3 p-2 rounded-lg transition-all ${
            isLiked
              ? 'bg-red-100 text-red-600'
              : 'bg-white/90 text-gray-600 hover:text-red-600'
          }`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">{photo.title}</h3>
          {photo.description && (
            <p className="text-sm text-gray-600 line-clamp-1">{photo.description}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Heart size={16} className={isLiked ? 'fill-red-600 text-red-600' : ''} />
            <span>{photo.likes || 0}</span>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <MoreVertical size={16} className="text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(photo);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-900 flex items-center gap-2"
                >
                  <Eye size={16} />
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2 border-t border-gray-200"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;