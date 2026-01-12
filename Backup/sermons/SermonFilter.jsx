'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';
import Input from '../common/Input.jsx';
import Button from '../common/Button';

const SermonFilter = ({ onSearch, onFilterChange, categories }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="flex-1">
        <Input
          type="search"
          name="search"
          placeholder="Search sermons..."
          icon={Search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <select
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <Button variant="outline" icon={Filter}>Filter</Button>
      </div>
    </div>
  );
};

export default SermonFilter;