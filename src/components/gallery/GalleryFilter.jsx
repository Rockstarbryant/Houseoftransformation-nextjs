'use client';

import React from 'react';
import { GALLERY_CATEGORIES } from '@/utils/constants';

const GalleryFilter = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div 
      role="tablist"
      aria-label="Gallery category filter"
      className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10"
    >
      {GALLERY_CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat;

        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onCategoryChange(cat)}
            className={`
              relative px-6 py-2.5 rounded-full font-medium text-base transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isActive 
                ? 'text-blue-900 bg-blue-50/80 shadow-sm' 
                : 'text-gray-700 hover:text-blue-800 hover:bg-blue-50/50'
              }
            `}
          >
            {/* Active indicator underline */}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-600 rounded-full" />
            )}

            {cat}
          </button>
        );
      })}
    </div>
  );
};

export default GalleryFilter;