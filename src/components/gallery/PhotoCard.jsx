'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import Card from '../common/Card';
import { formatDate } from '@/utils/helpers';

const PhotoCard = ({ photo, onViewFullSize }) => {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://house-of-transformation.onrender.com';
  
  const imageUrl = photo.imageUrl.startsWith('http') 
    ? photo.imageUrl 
    : `${API_BASE}${photo.imageUrl}`;

  return (
    <Card hover padding="none" className="group relative overflow-hidden cursor-pointer">
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <img 
          src={imageUrl}
          alt={photo.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-blue-900 mb-1 line-clamp-2">{photo.title}</h3>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{formatDate(photo.createdAt || photo.date, 'short')}</span>
          <span className="flex items-center gap-1 text-gray-400">
            <Heart size={16} /> 
            {photo.likes || 0}
          </span>
        </div>
      </div>

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onViewFullSize();
          }}
          className="bg-white text-blue-900 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
        >
          View Full Size
        </button>
      </div>
    </Card>
  );
};

export default PhotoCard;