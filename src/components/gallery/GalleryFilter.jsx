'use client';

import React from 'react';
import { GALLERY_CATEGORIES } from '@/utils/constants';

const GalleryFilter = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {GALLERY_CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${
            selectedCategory === cat
              ? 'bg-blue-900 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default GalleryFilter;