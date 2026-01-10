import React from 'react';
import { Search, X } from 'lucide-react';

const SermonFilterAdvanced = ({ 
  onSearch, 
  onTypeFilter, 
  onCategoryFilter, 
  selectedType, 
  selectedCategory,
  categories,
  searchTerm
}) => {
  const types = [
    { id: 'all', label: 'All Sermons', icon: '📺' },
    { id: 'text', label: 'Text Only', icon: '📝' },
    { id: 'photo', label: 'Photo + Text', icon: '📸' },
    { id: 'video', label: 'Video + Text', icon: '🎥' }
  ];

  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  const handleClearSearch = () => {
    onSearch('');
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search sermons by title, pastor..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 px-4">
        {types.map(type => (
          <button
            key={type.id}
            onClick={() => onTypeFilter(type.id)}
            className={`px-4 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors hover:text-gray-900 ${
              selectedType === type.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
            title={`Filter by ${type.label.toLowerCase()}`}
          >
            <span className="mr-2">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryFilter(cat)}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            title={`Filter by ${cat}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SermonFilterAdvanced;