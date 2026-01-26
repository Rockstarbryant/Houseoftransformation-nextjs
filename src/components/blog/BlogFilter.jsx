'use client';

import React from 'react';
import { BLOG_CATEGORIES, BLOG_CATEGORY_LABELS } from '../../utils/constants';

const BlogFilter = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex justify-center gap-3 mb-8 flex-wrap">
      {BLOG_CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`px-6 py-2 rounded-full font-semibold transition-colors whitespace-nowrap ${
            selectedCategory === cat
              ? 'bg-[#8B1A1A] text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          {BLOG_CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default BlogFilter;