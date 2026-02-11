'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, Eye, Play, Calendar, X, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { sermonService } from '@/services/api/sermonService';
import Card from '../common/Card';

const SermonCard = ({ sermon }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(sermon.likes || 0);
  const [showVideoModal, setShowVideoModal] = useState(false);
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


  const handleShare = useCallback(() => {
    if (!sermon?._id) return;
    const baseUrl = window.location.origin + window.location.pathname + window.location.search;
    const fragmentUrl = `${baseUrl}#sermon-${sermon._id}`;
    const title = sermon.title || 'Inspiring Sermon';
    const text = `Listen to "${title}" by ${sermon.pastor || 'Pastor'} at Busia House of Transformation`;

    if (navigator.share) {
      navigator.share({ title, text, url: fragmentUrl }).catch((err) => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(fragmentUrl).then(() => {
        alert('Sermons page link copied to clipboard!\nShare it to direct others to this powerful message.');
      });
    }
  }, [sermon]);


  const getVideoEmbedUrl = useCallback((url) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId;
      if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
      else if (url.includes('youtube.com/watch')) videoId = new URL(url).searchParams.get('v');
      else if (url.includes('youtube.com/embed/')) videoId = url.split('embed/')[1]?.split('?')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
    }
    if (url.includes('tiktok.com')) return url;
    return '';
  }, []);

  const contentHtml = sermon.descriptionHtml || sermon.description || '';
  const isVideo = sermon.type === 'video' && sermon.videoUrl;
  const hasThumbnail = Boolean(sermon.thumbnail);
  const videoEmbedUrl = isVideo ? getVideoEmbedUrl(sermon.videoUrl) : null;
  const isFacebookVideo = isVideo && (sermon.videoUrl?.includes('facebook.com') || sermon.videoUrl?.includes('fb.watch'));

  useEffect(() => {
    if (sermon._id) {
      console.log(`🎤 SermonCard [${sermon.title}]:`, {
        type: sermon.type,
        hasVideoUrl: !!sermon.videoUrl,
        isVideo,
        hasThumbnail,
        hasImages: contentHtml.includes('<img'),
        contentLength: contentHtml.length,
      });
    }
  }, [sermon._id, sermon.title, sermon.type, sermon.videoUrl, isVideo, contentHtml, hasThumbnail]);

  return (
    <div id={`sermon-${sermon._id}`} className="w-full">
      <Card 
        padding="none"
        shadow="none"
        border={false}
        className="flex flex-col bg-white dark:bg-slate-900 rounded-xl md:rounded-[2.5rem] overflow-hidden mx-0"
      >
        
        {/* Header */}
        <div className="px-2 md:px-10 pt-6 md:pt-10 pb-4 flex items-center justify-between border-b border-slate-50 md:border-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-slate-800 to-black flex items-center justify-center text-white text-xs font-black shadow-lg">
              {sermon.pastor?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-[#8B1A1A]">
                {sermon.category || 'Ministry'}
              </p>
              <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-tight">
                {sermon.pastor || 'Pastor'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full">
            <Calendar size={12} className="text-red-500" />
            {formatDate(sermon.date, 'short')}
          </div>
        </div>

        {/* Title */}
        <div className="px-0 md:px-10 py-4">
          <h3 className="text-xl md:text-4xl font-black text-red-900 dark:text-red-700 tracking-tighter leading-tight text-center md:text-left underline decoration-[#8B1A1A]/10 underline-offset-8">
            {sermon.title}
          </h3>
        </div>

        {/* Media */}
        {(isVideo || hasThumbnail) && (
          <div className="px-0 md:px-10 mb-6">
            <div className="relative aspect-video md:rounded-3xl overflow-hidden bg-black shadow-2xl">
              {isVideo && !showVideoModal ? (
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="w-full h-full relative flex items-center justify-center group/btn"
                  type="button"
                >
                  <Image
                    src={hasThumbnail ? sermon.thumbnail : 'https://via.placeholder.com/600x340?text=Video+Sermon'}
                    alt={sermon.title}
                    fill
                    unoptimized
                    className="object-cover opacity-80 group-hover/btn:opacity-100 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={(e) => { 
  e.currentTarget.style.display = 'none';
  e.currentTarget.parentElement.innerHTML = `
    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
      <span class="text-slate-400 dark:text-slate-500 text-sm font-medium">No Image</span>
    </div>
  `;
}}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover/btn:bg-black/40 transition-all" />
                  <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-2xl group-hover/btn:scale-110 transition-transform">
                    <Play size={30} className="text-[#8B1A1A] fill-current translate-x-1" />
                  </div>
                  {isFacebookVideo && (
                    <div className="absolute bottom-0 w-full bg-black/80 text-white text-[10px] font-bold uppercase py-3 tracking-widest text-center">
                      Opens on Facebook
                    </div>
                  )}
                </button>
              ) : isVideo && showVideoModal ? (
                <div className="w-full h-full">
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="absolute top-4 right-4 z-20 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-full shadow-xl transition"
                    type="button"
                  >
                    <X size={20} />
                  </button>
                  {videoEmbedUrl ? (
                    <iframe
                      className="w-full h-full"
                      src={videoEmbedUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">
                      Video cannot be embedded
                    </div>
                  )}
                </div>
              ) : (
                <Image 
                  src={sermon.thumbnail} 
                  alt={sermon.title} 
                  fill 
                  unoptimized
                  className="object-cover"
                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600x340?text=Image+Error'; }}
                />
              )}
            </div>
          </div>
        )}

        {/* Main Text Content - Edge to edge on mobile */}
        <div className="px-0 sm:px-3.5 md:px-10 lg:px-12 flex-grow mb-6">
          <div className="relative">
            <div
              className={`prose prose-slate max-w-none w-full transition-all duration-500 ease-in-out font-serif text-[17px] sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-[1.68] md:leading-relaxed
                [&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:my-6 [&_p]:mb-5 [&_p]:text-justify [&_p]:font-light
                ${expanded ? 'max-h-none' : 'max-h-48 md:max-h-64 overflow-hidden'}`}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
            {!expanded && contentHtml.length > 180 && (
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
            )}
          </div>

          {contentHtml.length > 180 && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="mt-3 flex items-center gap-2 bg-slate-50 hover:bg-[#8B1A1A] hover:text-white text-[#8B1A1A] font-black uppercase text-[11px] tracking-widest hover:underline px-4 py-2 rounded-full transition-all"
              type="button"
            >
              {expanded ? <><ChevronUp size={16} /> Show Less</> : <><ChevronDown size={16} /> Read Full Message</>}
            </button>
          )}
        </div>

        {contentHtml.includes('<img') && (
          <div className="mx-0 md:mx-10 mb-6 p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-700 font-medium flex items-center gap-2">
            <div className="bg-amber-200 size-4 rounded-full flex items-center justify-center font-bold text-[8px]">!</div>
            If images don't show, try opening in incognito mode.
          </div>
        )}

        {/* Footer */}
        {/* Footer */}
        <div className="px-2 md:px-10 py-6 bg-slate-50/80 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
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
                ? 'text-red-500' 
                : 'text-slate-400 dark:text-slate-300 hover:text-red-500'
            } ${isLiking ? 'opacity-70 cursor-wait' : 'hover:scale-105 active:scale-95'}`}
              type="button"
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart 
                size={20} 
                fill={liked ? 'currentColor' : 'none'} 
                className={`transition-transform ${liked ? 'scale-110' : ''}`} 
              />
              <span className="text-xs font-black">{likes}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
              disabled={isBookmarking}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                bookmarked 
                  ? 'text-amber-500' 
                  : 'text-slate-400 dark:text-slate-300 hover:text-amber-500'
              } ${isBookmarking ? 'opacity-70 cursor-wait' : 'hover:scale-105 active:scale-95'}`}
              type="button"
              title={bookmarked ? 'Remove bookmark' : 'Bookmark sermon'}
            >
              <Bookmark 
                size={20} 
                fill={bookmarked ? 'currentColor' : 'none'} 
                className={`transition-transform ${bookmarked ? 'scale-110' : ''}`}
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

export default SermonCard;