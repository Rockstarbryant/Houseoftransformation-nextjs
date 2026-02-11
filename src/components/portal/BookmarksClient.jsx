'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Heart, Loader as LoaderIcon, AlertCircle } from 'lucide-react';
import { sermonService } from '@/services/api/sermonService';
import BookmarkedSermonCard from '@/components/sermons/BookmarkedSermonCard';
import Loader from '@/components/common/Loader';

export default function BookmarksClient() {
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [bookmarks, setBookmarks] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab, page]);

  const fetchData = async () => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = activeTab === 'bookmarks' 
        ? await sermonService.getUserBookmarks(page, 12)
        : await sermonService.getUserLikes(page, 12);

      if (response.success) {
        const newSermons = response.sermons || [];
        
        if (page === 1) {
          if (activeTab === 'bookmarks') {
            setBookmarks(newSermons);
          } else {
            setLikes(newSermons);
          }
        } else {
          if (activeTab === 'bookmarks') {
            setBookmarks(prev => [...prev, ...newSermons]);
          } else {
            setLikes(prev => [...prev, ...newSermons]);
          }
        }

        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching sermons:', err);
      setError(err.response?.data?.message || 'Failed to load sermons');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleRemoveBookmark = async (sermonId) => {
    try {
      await sermonService.toggleBookmark(sermonId);
      setBookmarks(prev => prev.filter(s => s._id !== sermonId));
      
      // Update localStorage
      const bookmarkedSermons = JSON.parse(localStorage.getItem('bookmarkedSermons') || '{}');
      delete bookmarkedSermons[sermonId];
      localStorage.setItem('bookmarkedSermons', JSON.stringify(bookmarkedSermons));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const handleRemoveLike = async (sermonId) => {
    try {
      await sermonService.toggleLike(sermonId);
      setLikes(prev => prev.filter(s => s._id !== sermonId));
      
      // Update localStorage
      const likedSermons = JSON.parse(localStorage.getItem('likedSermons') || '{}');
      delete likedSermons[sermonId];
      localStorage.setItem('likedSermons', JSON.stringify(likedSermons));
    } catch (err) {
      console.error('Error removing like:', err);
    }
  };

  const currentSermons = activeTab === 'bookmarks' ? bookmarks : likes;

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            My Saved Sermons
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Sermons you&apos;ve bookmarked and liked
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => handleTabChange('bookmarks')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base transition-colors relative ${
              activeTab === 'bookmarks'
                ? 'text-red-600 dark:text-red-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark size={18} fill={activeTab === 'bookmarks' ? 'currentColor' : 'none'} />
            Bookmarked
            <span className="ml-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">
              {bookmarks.length}
            </span>
            {activeTab === 'bookmarks' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-500" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('likes')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base transition-colors relative ${
              activeTab === 'likes'
                ? 'text-red-600 dark:text-red-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart size={18} fill={activeTab === 'likes' ? 'currentColor' : 'none'} />
            Liked
            <span className="ml-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">
              {likes.length}
            </span>
            {activeTab === 'likes' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-500" />
            )}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-200">Error</p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {currentSermons.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              {activeTab === 'bookmarks' ? (
                <Bookmark size={24} className="text-slate-400" />
              ) : (
                <Heart size={24} className="text-slate-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No {activeTab === 'bookmarks' ? 'bookmarked' : 'liked'} sermons yet
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Start {activeTab === 'bookmarks' ? 'bookmarking' : 'liking'} sermons to save them here
            </p>
            <a
              href="/sermons"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Browse Sermons
            </a>
          </div>
        ) : (
          <>
            {/* Sermons Grid */}
            <div className="space-y-4">
              {currentSermons.map(sermon => (
                <BookmarkedSermonCard
                  key={sermon._id}
                  sermon={sermon}
                  type={activeTab === 'bookmarks' ? 'bookmark' : 'like'}
                  onRemove={activeTab === 'bookmarks' ? handleRemoveBookmark : handleRemoveLike}
                />
              ))}
            </div>

            {/* Load More Button */}
            {page < totalPages && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <LoaderIcon size={18} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Load More</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}