'use client';

import React, { useState, useEffect } from 'react';
import { Settings, X, Search, Plus } from 'lucide-react';
import SermonCardText from '@/components/sermons/SermonCardText';
import SermonCard from '@/components/sermons/SermonCard';
import Loader from '@/components/common/Loader';
import { sermonService } from '@/services/api/sermonService';
import { useAuthContext } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import PermissionAlert from '@/components/common/PermissionAlert';

export default function SermonsPage() {
  const [allSermons, setAllSermons] = useState([]);
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  const categories = ['All', 'Sunday Service', 'Bible Study', 'Special Event', 'Youth Ministry', 'Prayer Meeting'];

  useEffect(() => {
    fetchSermons();
  }, []);

  useEffect(() => {
    filterSermons();
  }, [selectedType, selectedCategory, searchTerm, allSermons]);

  const fetchSermons = async () => {
    try {
      setLoading(true);
      const data = await sermonService.getSermons({ limit: 100 });
      const sermons = data.sermons || data;
      
      const sermonsWithDefaults = sermons.map(s => ({
        ...s,
        type: s.type || detectSermonType(s),
        descriptionHtml: s.descriptionHtml || s.description || '',
        description: s.description || ''
      }));
      
      setAllSermons(sermonsWithDefaults);
      setError(null);
    } catch (err) {
      console.error('Error fetching sermons:', err);
      setError('Failed to load sermons');
    } finally {
      setLoading(false);
    }
  };

  const detectSermonType = (sermon) => {
    if (sermon.videoUrl) return 'video';
    if (sermon.thumbnail) return 'photo';
    return 'text';
  };

  const filterSermons = () => {
    let result = [...allSermons];
    result = result.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (selectedType !== 'all') {
      result = result.filter(s => detectSermonType(s) === selectedType);
    }

    if (selectedCategory !== 'All') {
      result = result.filter(s => s.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.pastor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.descriptionHtml || s.description)?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSermons(result);
  };

  const resetFilters = () => {
    setSelectedType('all');
    setSelectedCategory('All');
    setSearchTerm('');
    setShowAdvancedFilter(false);
  };

  const { canPostSermon, user } = useAuthContext();

  const handleAddSermon = () => {
    window.location.href = '/admin/sermons';
  };

  if (loading) return <Loader />;

  return (
    <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Sermons</h1>
          <p className="text-xl text-gray-600 mb-6">Messages and teachings from our community</p>
          
          {canPostSermon() && (
            <Button onClick={handleAddSermon} variant="primary" className="flex items-center gap-2 mb-8">
              <Plus size={20} /> Add Sermon
            </Button>
          )}

          {!canPostSermon() && user && (
            <div className="mb-8">
              <PermissionAlert
                title="Cannot Add Sermons"
                message="Only pastors and bishops can upload sermons."
                requiredRole="pastor"
                currentRole={user.role}
                actionType="sermon upload"
              />
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-gray-200">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search sermons by title, pastor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-500"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                    : 'bg-white text-gray-800 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className={`p-2 rounded-full transition-colors ${
              showAdvancedFilter ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showAdvancedFilter ? <X size={20} /> : <Settings size={20} />}
          </button>
          <span className="text-sm text-gray-600">
            {filteredSermons.length} {filteredSermons.length === 1 ? 'sermon' : 'sermons'} found
          </span>
          {(selectedType !== 'all' || selectedCategory !== 'All' || searchTerm) && (
            <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              Reset filters
            </button>
          )}
        </div>

        {showAdvancedFilter && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex gap-4">
              {[
                { id: 'all', label: 'All', icon: '📚' },
                { id: 'text', label: 'Text', icon: '📄' },
                { id: 'photo', label: 'Photo', icon: '📸' },
                { id: 'video', label: 'Video', icon: '🎥' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-4 py-2 font-semibold text-sm rounded-lg transition-colors ${
                    selectedType === type.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8">{error}</div>
        )}

        {filteredSermons.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No sermons found in this category.</p>
            {searchTerm && <p className="text-sm mt-2">Try adjusting your search term</p>}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSermons.map(sermon => (
              <div key={sermon._id}>
                {detectSermonType(sermon) === 'text' ? (
                  <SermonCardText sermon={sermon} />
                ) : (
                  <SermonCard sermon={sermon} type={detectSermonType(sermon)} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}