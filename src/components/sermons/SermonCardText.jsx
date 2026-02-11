'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Eye, Calendar, User, ChevronDown, ChevronUp, Quote, Bookmark } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { sermonService } from '@/services/api/sermonService';
import Card from '../common/Card';

const SermonCardText = ({ sermon }) => { 
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(sermon.likes || 0);
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [views, setViews] = useState(sermon.views || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Load liked/bookmarked state on mount
  useEffect(() => {
    const loadInteractionState = async () => {
      try {
        // Check if user has liked this sermon
        const likedSermons = JSON.parse(localStorage.getItem('likedSermons') || '{}');
        setLiked(!!likedSermons[sermon._id]);

        // Check if user has bookmarked this sermon
        const bookmarkedSermons = JSON.parse(localStorage.getItem('bookmarkedSermons') || '{}');
        setBookmarked(!!bookmarkedSermons[sermon._id]);
      } catch (error) {
        console.error('Error loading interaction state:', error);
      }
    };

    loadInteractionState();
  }, [sermon._id]);

  // Optimistic like handler
  const handleLike = async () => {
    if (isLiking) return; // Prevent double-clicks

    // Optimistic update
    const wasLiked = liked;
    const newLiked = !liked;
    const newLikes = wasLiked ? likes - 1 : likes + 1;

    setLiked(newLiked);
    setLikes(newLikes);
    setIsLiking(true);

    // Update localStorage immediately
    try {
      const likedSermons = JSON.parse(localStorage.getItem('likedSermons') || '{}');
      if (newLiked) {
        likedSermons[sermon._id] = true;
      } else {
        delete likedSermons[sermon._id];
      }
      localStorage.setItem('likedSermons', JSON.stringify(likedSermons));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }

    // Send to backend
    try {
      const response = await sermonService.toggleLike(sermon._id);
      // Update with actual values from server
      if (response.likes !== undefined) {
        setLikes(response.likes);
      }
      if (response.liked !== undefined) {
        setLiked(response.liked);
        // Sync with server response
        const likedSermons = JSON.parse(localStorage.getItem('likedSermons') || '{}');
        if (response.liked) {
          likedSermons[sermon._id] = true;
        } else {
          delete likedSermons[sermon._id];
        }
        localStorage.setItem('likedSermons', JSON.stringify(likedSermons));
      }
    } catch (error) {
      console.error('Error liking sermon:', error);
      // Revert on error
      setLiked(wasLiked);
      setLikes(likes);
      // Revert localStorage
      const likedSermons = JSON.parse(localStorage.getItem('likedSermons') || '{}');
      if (wasLiked) {
        likedSermons[sermon._id] = true;
      } else {
        delete likedSermons[sermon._id];
      }
      localStorage.setItem('likedSermons', JSON.stringify(likedSermons));
    } finally {
      setIsLiking(false);
    }
  };

  // Optimistic bookmark handler
  const handleBookmark = async () => {
    if (isBookmarking) return; // Prevent double-clicks

    // Optimistic update
    const wasBookmarked = bookmarked;
    const newBookmarked = !bookmarked;

    setBookmarked(newBookmarked);
    setIsBookmarking(true);

    // Update localStorage immediately
    try {
      const bookmarkedSermons = JSON.parse(localStorage.getItem('bookmarkedSermons') || '{}');
      if (newBookmarked) {
        bookmarkedSermons[sermon._id] = {
          bookmarked: true,
          timestamp: Date.now()
        };
      } else {
        delete bookmarkedSermons[sermon._id];
      }
      localStorage.setItem('bookmarkedSermons', JSON.stringify(bookmarkedSermons));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }

    // Send to backend
    try {
      const response = await sermonService.toggleBookmark(sermon._id);
      // Sync with server response
      if (response.bookmarked !== undefined) {
        setBookmarked(response.bookmarked);
        const bookmarkedSermons = JSON.parse(localStorage.getItem('bookmarkedSermons') || '{}');
        if (response.bookmarked) {
          bookmarkedSermons[sermon._id] = {
            bookmarked: true,
            timestamp: Date.now()
          };
        } else {
          delete bookmarkedSermons[sermon._id];
        }
        localStorage.setItem('bookmarkedSermons', JSON.stringify(bookmarkedSermons));
      }
    } catch (error) {
      console.error('Error bookmarking sermon:', error);
      // Revert on error
      setBookmarked(wasBookmarked);
      // Revert localStorage
      const bookmarkedSermons = JSON.parse(localStorage.getItem('bookmarkedSermons') || '{}');
      if (wasBookmarked) {
        bookmarkedSermons[sermon._id] = {
          bookmarked: true,
          timestamp: Date.now()
        };
      } else {
        delete bookmarkedSermons[sermon._id];
      }
      localStorage.setItem('bookmarkedSermons', JSON.stringify(bookmarkedSermons));
    } finally {
      setIsBookmarking(false);
    }
  };

  // ... rest of your existing code (handleShare, getVideoEmbedUrl, etc.)

  const handleShare = () => {
    const baseUrl = window.location.origin + window.location.pathname + window.location.search;
    const fragmentUrl = sermon._id ? `${baseUrl}#sermon-${sermon._id}` : baseUrl;
    const title = sermon.title || 'Inspiring Sermon';
    const text = `Check out this sermon "${title}" by ${sermon.pastor || 'Pastor'} at Busia House of Transformation`;

    if (navigator.share) {
      navigator.share({ title, text, url: fragmentUrl }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(fragmentUrl);
      alert('Sermons page link copied to clipboard!\nShare it to direct others to this powerful message.');
    }
  };

  const sanitizedHtml = sermon.descriptionHtml || sermon.description || '';
  const hasMoreContent = sanitizedHtml.length > 180;

  return (
    <div id={`sermon-${sermon._id}`} className="w-full">
      <Card 
        padding="none"
        shadow="none"
        border={false}
        className="
          flex flex-col 
          bg-white dark:bg-slate-900 
          rounded-xl md:rounded-[2.5rem]          
          transition-all duration-500 
          overflow-hidden          
        "
      >
        {/* Header */}
        <div className="px-2 sm:px-5 md:px-12 pt-6 md:pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 md:size-11 rounded-full bg-gradient-to-br from-slate-800 to-black flex items-center justify-center text-white text-[10px] md:text-xs font-black shadow-md">
              {sermon.pastor?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#8B1A1A] dark:text-red-500 leading-tight">
                {sermon.category || 'Transcript'}
              </p>
              <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {sermon.pastor || 'Pastor'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
            <Calendar size={12} className="text-red-500" />
            {formatDate(sermon.date, 'short')}
          </div>
        </div>

        {/* Title */}
        <div className="px-0 sm:px-5 md:px-12 pb-5 md:pb-6">
          <h3 className="text-xl md:text-4xl text-red-900 font-black dark:text-red-700 tracking-tighter leading-tight text-center underline decoration-[#8B1A1A]/10 underline-offset-8">
            {sermon.title}
          </h3>
        </div>

        {/* Main Content - Edge to edge on mobile */}
        <div className="px-0 sm:px-3 md:px-10 lg:px-14 flex-grow mb-6 md:mb-8 relative">
          {/* Decorative Quote watermark */}
          <Quote 
            className="absolute top-1 right-3 sm:right-6 md:right-10 text-slate-50 opacity-10 pointer-events-none" 
            size={30} 
          />

          <div className="relative w-full">
            <div
              className={`
                prose prose-slate 
                max-w-none w-full
                transition-all duration-700 ease-in-out
                font-serif 
                text-[17px] sm:text-lg md:text-xl 
                text-slate-700 dark:text-slate-300 
                leading-[1.65] md:leading-relaxed
                [&_p]:mb-5 [&_p]:text-justify [&_p]:font-light
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
                [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3
                ${expanded ? 'max-h-none' : 'max-h-64 sm:max-h-80 overflow-hidden'}
              `}
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />

            {!expanded && hasMoreContent && (
              <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-white via-white/85 to-transparent pointer-events-none" />
            )}
          </div>

          {hasMoreContent && (
            <div className="mt-6 px-1">
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                className="
                  flex items-center gap-2 
                  px-6 py-2.5 
                  bg-slate-50 hover:bg-[#8B1A1A] hover:text-white 
                  text-[#8B1A1A] 
                  rounded-full 
                  text-[10px] font-black uppercase tracking-widest 
                  transition-all 
                  shadow-sm border border-slate-100
                "
              >
                {expanded ? (
                  <>Close Transcript <ChevronUp size={14} /></>
                ) : (
                  <>Read Full Transcript <ChevronDown size={14} /></>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {/* Footer */}
        <div className="px-3 md:px-10 py-6 bg-slate-50/80 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-300 group/icon">
              <Eye size={18} className="group-hover/icon:text-slate-600 dark:text-slate-300 transition-colors" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{views}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              disabled={isLiking}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                liked 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 scale-100' 
                  : 'text-slate-400 dark:text-slate-300 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20'
              } ${isLiking ? 'opacity-70 cursor-wait' : 'hover:scale-105 active:scale-95'}`}
              type="button"
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart 
                size={20} 
                fill={liked ? 'currentColor' : 'none'} 
                className={`transition-transform ${liked ? 'scale-70' : ''}`} 
              />
              <span className="text-xs font-black">{likes}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
              disabled={isBookmarking}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                bookmarked 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600' 
                  : 'text-slate-400 dark:text-slate-300 hover:text-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/20'
              } ${isBookmarking ? 'opacity-70 cursor-wait' : 'hover:scale-105 active:scale-95'}`}
              type="button"
              title={bookmarked ? 'Remove bookmark' : 'Bookmark sermon'}
            >
              <Bookmark 
                size={20} 
                fill={bookmarked ? 'currentColor' : 'none'} 
                className={`transition-transform ${bookmarked ? 'scale-70' : ''}`}
              />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="p-2.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 hover:shadow-md transition-all hover:scale-105 active:scale-95"
              type="button"
              title="Share sermon"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SermonCardText;