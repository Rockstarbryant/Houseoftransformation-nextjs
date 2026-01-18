import React, { useState } from 'react';
import { Heart, Trash2, Download, Square, CheckSquare } from 'lucide-react';

const GalleryCard = ({
  photo,
  onDelete,
  onLike,
  onViewDetails,
  isLiked = false,
  // ── NEW PROPS FOR MULTI-SELECT ──
  selectMode = false,
  isSelected = false,
  onToggleSelect = () => {}
}) => {
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

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = photo.imageUrl;
    link.download = photo.title ? `${photo.title.replace(/\s+/g, '_')}.jpg` : 'photo.jpg';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`
        bg-white rounded-lg border shadow-sm transition-all duration-200 overflow-hidden group
        ${isSelected 
          ? 'border-2 border-blue-500 ring-2 ring-blue-300 ring-offset-2 shadow-lg' 
          : 'border-gray-200 hover:shadow-md'
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={photo.imageUrl}
          alt={photo.title || 'Gallery photo'}
          className={`w-full h-full object-cover transition-transform duration-300 ${isHovered && !selectMode ? 'scale-105' : 'scale-100'}`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.style.background = '#f3f4f6';
            e.target.parentElement.innerHTML += '<div class="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">Image unavailable</div>';
          }}
        />

        {/* ── MULTI-SELECT CHECKBOX ── appears only in select mode */}
        {selectMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleSelect();
            }}
            className={`
              absolute top-3 left-3 z-30 p-1.5 rounded-full shadow-md transition-all
              ${isSelected ? 'bg-blue-600' : 'bg-white hover:bg-gray-100'}
            `}
            type="button"
          >
            {isSelected ? (
              <CheckSquare size={28} className="text-white" fill="currentColor" />
            ) : (
              <Square size={28} className="text-gray-500 hover:text-blue-600" />
            )}
          </button>
        )}

        {/* Hover Overlay - only shown when NOT in select mode */}
        {isHovered && !selectMode && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <button
              onClick={() => onViewDetails(photo)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-lg font-medium shadow hover:bg-gray-50 transition active:scale-95"
            >
              View
            </button>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3 z-20">
          <span className="px-2.5 py-1 bg-white/90 text-gray-800 text-xs font-semibold rounded-full shadow-sm">
            {photo.category || 'General'}
          </span>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition z-20 ${
            isLiked
              ? 'bg-red-50 text-red-600'
              : 'bg-white/85 text-gray-600 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content + Footer */}
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

          {/* Admin Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleDownload}
              className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
              title="Download Photo"
            >
              <Download size={18} />
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