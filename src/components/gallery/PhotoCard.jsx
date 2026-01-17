'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { formatDate } from '@/utils/helpers';

const PhotoCard = ({ photo, onViewFullSize }) => {
  const [isHovered, setIsHovered] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://house-of-transformation.onrender.com';

  const imageUrl = photo.imageUrl.startsWith('http')
    ? photo.imageUrl
    : `${API_BASE}${photo.imageUrl}`;

  return (
    <div
      className={`
        bg-white dark:bg-slate-900 dark:text-white transition-colors rounded-xl border border-gray-200 shadow-sm 
        hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 
        overflow-hidden group cursor-pointer
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onViewFullSize}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-slate-800">
        <Image
          src={imageUrl}
          alt={photo.title || 'Gallery photo'}
          fill
          className={`
            object-cover transition-transform duration-500
            ${isHovered ? 'scale-105' : 'scale-100'}
          `}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" // simple low-res placeholder
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML += 
              '<div class="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">Image unavailable</div>';
          }}
        />

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300">
            <span className="px-6 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg font-medium shadow-md hover:bg-gray-50 transition active:scale-95">
              View Full Size
            </span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-10 dark:bg-black/50 bg-white/50 rounded-full">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 dark:text-red-500 text-xs font-medium rounded-full shadow-sm">
            {photo.category || 'General'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
          {photo.title || 'Untitled'}
        </h3>

        {photo.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
            {photo.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{formatDate(photo.createdAt || photo.date, 'short')}</span>

          <div className="flex items-center gap-2">
            <Heart size={16} className="text-gray-400 dark:text-gray-500" />
            <span>{photo.likes || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;