'use client';

import React, { useState } from 'react';
import { Heart, X } from 'lucide-react';
import { galleryService } from '@/services/api/galleryService';
import { formatDate } from '@/utils/helpers';

const PhotoModal = ({ photo, onClose }) => {
  const [likes, setLikes] = useState(photo.likes || 0);
  const [liked, setLiked] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://house-of-transformation.onrender.com';

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await galleryService.likePhoto(photo._id);
      setLikes(response.likes);
      setLiked(!liked);
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  const imageUrl = photo.imageUrl.startsWith('http') 
    ? photo.imageUrl 
    : `${API_BASE}${photo.imageUrl}`;

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-51 p-2 transition-colors"
      >
        <X size={32} />
      </button>
      
      <div 
        className="max-w-4xl max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageUrl}
          alt={photo.title}
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
        />
        <div className="mt-4 bg-white p-4 rounded-lg">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">{photo.title}</h2>
          <p className="text-gray-700 mb-3">{photo.description || 'No description'}</p>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{formatDate(photo.createdAt || photo.date, 'long')}</span>
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                liked 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
              }`}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} /> 
              {likes}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;