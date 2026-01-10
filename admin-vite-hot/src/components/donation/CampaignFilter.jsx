// src/components/donation/CampaignFilter.jsx
import React, { useState, useEffect } from 'react';
import { Filter, X, Search, Sliders } from 'lucide-react';
import Card from '../common/Card';

const CampaignFilter = ({ onFilterChange, onSearch, campaigns = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    sortBy: 'newest'
  });

  const statusOptions = [
    { value: '', label: '📋 All Campaigns' },
    { value: 'active', label: '🟢 Active' },
    { value: 'completed', label: '✅ Completed' },
    { value: 'archived', label: '📦 Archived' },
    { value: 'ended', label: '⏹️ Ended' }
  ];

  const typeOptions = [
    { value: '', label: '📌 All Types' },
    { value: 'building', label: '🏢 Building Fund' },
    { value: 'emergency', label: '🚨 Emergency Relief' },
    { value: 'ministry', label: '⛪ Ministry Support' },
    { value: 'outreach', label: '🤝 Outreach' },
    { value: 'offering', label: '💝 Offering' },
    { value: 'other', label: '📌 Other' }
  ];

  const sortOptions = [
    { value: 'newest', label: '⏰ Newest First' },
    { value: 'oldest', label: '📅 Oldest First' },
    { value: 'most-raised', label: '💰 Most Raised' },
    { value: 'least-raised', label: '💸 Least Raised' },
    { value: 'ending-soon', label: '⏳ Ending Soon' },
    { value: 'progress', label: '📊 Progress' }
  ];

  // Dynamically get unique types from campaigns
  const getUniqueCampaignTypes = () => {
    if (!campaigns || campaigns.length === 0) return typeOptions;
    
    const types = [...new Set(campaigns.map(c => c.type).filter(Boolean))];
    const filteredTypeOptions = typeOptions.filter(opt => 
      !opt.value || types.includes(opt.value)
    );
    return filteredTypeOptions.length > 0 ? filteredTypeOptions : typeOptions;
  };

  const handleStatusChange = (e) => {
    const newFilters = { ...filters, status: e.target.value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleTypeChange = (e) => {
    const newFilters = { ...filters, type: e.target.value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSortChange = (e) => {
    const newFilters = { ...filters, sortBy: e.target.value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    onSearch?.('');
  };

  const handleReset = () => {
    const resetFilters = {
      status: '',
      type: '',
      sortBy: 'newest'
    };
    setFilters(resetFilters);
    setSearchTerm('');
    onFilterChange?.(resetFilters);
    onSearch?.('');
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'newest').length + (searchTerm ? 1 : 0);

  return (
    <div className="space-y-4 mb-8">
      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search campaigns by name, description..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={handleResetSearch}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </Card>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left Side - Filter Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-lg hover:from-blue-200 hover:to-blue-100 transition font-bold text-sm border-2 border-blue-300 whitespace-nowrap"
          >
            <Sliders size={18} />
            Advanced Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Right Side - Clear Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition font-semibold text-sm border border-gray-300"
            >
              <X size={18} />
              Clear All
            </button>
          )}
        </div>

        {/* Filter Panel - Expandable */}
        {isOpen && (
          <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-5">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Campaign Status
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {statusOptions.map(option => (
                  <label 
                    key={option.value}
                    className={`px-4 py-2.5 rounded-lg cursor-pointer font-semibold text-sm transition border-2 ${
                      filters.status === option.value
                        ? 'bg-blue-500 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={filters.status === option.value}
                      onChange={handleStatusChange}
                      className="mr-2"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Campaign Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {getUniqueCampaignTypes().map(option => (
                  <label 
                    key={option.value}
                    className={`px-4 py-2.5 rounded-lg cursor-pointer font-semibold text-sm transition border-2 ${
                      filters.type === option.value
                        ? 'bg-blue-500 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={option.value}
                      checked={filters.type === option.value}
                      onChange={handleTypeChange}
                      className="mr-2"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-semibold"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Applied Filters Display */}
            {activeFilterCount > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-xs font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Filter size={16} />
                  Active Filters ({activeFilterCount}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {filters.status && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-200 text-blue-800 rounded-full text-xs font-bold border border-blue-300">
                      Status: {statusOptions.find(o => o.value === filters.status)?.label?.split(' ')[1]}
                      <button
                        onClick={() => {
                          const newFilters = { ...filters, status: '' };
                          setFilters(newFilters);
                          onFilterChange?.(newFilters);
                        }}
                        className="hover:text-blue-600 transition"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  )}
                  {filters.type && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-200 text-blue-800 rounded-full text-xs font-bold border border-blue-300">
                      Type: {typeOptions.find(o => o.value === filters.type)?.label?.split(' ')[1]}
                      <button
                        onClick={() => {
                          const newFilters = { ...filters, type: '' };
                          setFilters(newFilters);
                          onFilterChange?.(newFilters);
                        }}
                        className="hover:text-blue-600 transition"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  )}
                  {filters.sortBy !== 'newest' && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-200 text-blue-800 rounded-full text-xs font-bold border border-blue-300">
                      Sort: {sortOptions.find(o => o.value === filters.sortBy)?.label?.split(' ')[1]}
                      <button
                        onClick={() => {
                          const newFilters = { ...filters, sortBy: 'newest' };
                          setFilters(newFilters);
                          onFilterChange?.(newFilters);
                        }}
                        className="hover:text-blue-600 transition"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-200 text-blue-800 rounded-full text-xs font-bold border border-blue-300">
                      Search: "{searchTerm.substring(0, 15)}{searchTerm.length > 15 ? '...' : ''}"
                      <button
                        onClick={handleResetSearch}
                        className="hover:text-blue-600 transition"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CampaignFilter;