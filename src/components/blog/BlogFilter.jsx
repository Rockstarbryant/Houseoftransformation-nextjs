'use client';

import React from 'react';
import { BLOG_CATEGORIES } from '../../utils/constants';

const BlogFilter = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex justify-center gap-3 mb-8 flex-wrap">
      {BLOG_CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${
            selectedCategory === cat
              ? 'bg-blue-900 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default BlogFilter;