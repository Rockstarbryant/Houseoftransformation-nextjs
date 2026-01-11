import React, { useState, useRef, useEffect } from 'react';
import { Heart, Trash2, Eye, MoreVertical } from 'lucide-react';

const GalleryCard = ({ photo, onDelete, onLike, onViewDetails, isLiked = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = () => {
    if (window.confirm('Delete this photo? This action cannot be undone.')) {
      onDelete(photo._id);
    }
    setShowMenu(false);
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMenu(prev => !prev);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    onLike(photo._id);
  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-200 overflow-hidden">
        <img
          src={photo.imageUrl}
          alt={photo.title || 'Gallery photo'}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg'; // ← optional: add fallback image
            e.target.alt = 'Image failed to load';
          }}
        />

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(photo);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium shadow-lg hover:bg-gray-100 active:scale-95 transition transform"
            >
              <Eye size={18} />
              View
            </button>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-3 py-1 bg-white/95 text-gray-900 text-xs font-semibold rounded-full shadow backdrop-blur-sm">
            {photo.category || 'Uncategorized'}
          </span>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`absolute top-3 right-3 p-2.5 rounded-full transition-all shadow-sm ${
            isLiked
              ? 'bg-red-50 text-red-600'
              : 'bg-white/90 text-gray-600 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1.5">
          {photo.title || 'Untitled'}
        </h3>
        {photo.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {photo.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Heart 
              size={16} 
              className={isLiked ? 'fill-red-600 text-red-600' : ''} 
            />
            <span>{photo.likes || 0}</span>
          </div>

          {/* Menu Button + Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <MoreVertical size={18} className="text-gray-700" />
            </button>

            {showMenu && (
              <>
                {/* Small pointer arrow */}
                <div className="absolute right-3 -top-1.5 w-3 h-3 bg-white border-l border-t border-gray-300 rotate-45 shadow-sm z-[60]" />

                <div 
                  className="
                    absolute right-0 top-full mt-2 w-48 
                    bg-white border border-gray-200 rounded-xl 
                    shadow-2xl z-[100] overflow-hidden
                    ring-1 ring-black/5
                  "
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(photo);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <Eye size={16} className="text-gray-600" />
                    View Details
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 border-t border-gray-100 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;