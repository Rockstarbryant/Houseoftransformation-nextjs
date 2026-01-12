'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, Eye, Play, Calendar, X, User, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { sermonService } from '@/services/api/sermonService';
import Card from '../common/Card';

const SermonCard = ({ sermon }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(sermon.likes || 0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // --- Logic Constants & Helpers (Kept Identical) ---
  const handleLike = async () => {
    try {
      await sermonService.toggleLike(sermon._id);
      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error('Error liking sermon:', error);
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
      navigator.clipboard.writeText(baseUrl).then(() => {
        alert('Sermons page link copied to clipboard!');
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
    return url.includes('tiktok.com') ? url : '';
  }, []);

  const contentHtml = sermon.descriptionHtml || sermon.description || '';
  const isVideo = sermon.type === 'video' && sermon.videoUrl;
  const hasThumbnail = Boolean(sermon.thumbnail);
  const videoEmbedUrl = isVideo ? getVideoEmbedUrl(sermon.videoUrl) : null;
  const isFacebookVideo = isVideo && (sermon.videoUrl?.includes('facebook.com') || sermon.videoUrl?.includes('fb.watch'));

  return (
    <div id={`sermon-${sermon._id}`} className="group relative">
      <Card className="flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-red-500/5 transition-all duration-500 overflow-hidden">
        
        {/* 1. Header: Context & Meta */}
        <div className="px-6 md:px-10 pt-8 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black">
              {sermon.pastor?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8B1A1A]">
                {sermon.category || 'Message'}
              </p>
              <p className="text-sm font-bold text-slate-900 leading-tight">
                {sermon.pastor || 'Pastor'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Calendar size={14} className="text-slate-300" />
            {formatDate(sermon.date, 'short')}
          </div>
        </div>

        {/* 2. Title Section */}
        <div className="px-6 md:px-10 pb-6 text-center md:text-left">
          <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight group-hover:text-[#8B1A1A] transition-colors">
            {sermon.title}
          </h3>
        </div>

        {/* 3. Media Section (Responsive Visuals) */}
        {(isVideo || hasThumbnail) && (
          <div className="px-4 md:px-10 mb-8">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-100 shadow-2xl">
              {isVideo && !showVideoModal ? (
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="w-full h-full relative flex items-center justify-center group/play"
                >
                  <Image
                    src={hasThumbnail ? sermon.thumbnail : 'https://via.placeholder.com/600x340?text=Sermon'}
                    alt={sermon.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/play:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover/play:bg-black/40 transition-all" />
                  <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover/play:scale-110 transition-transform">
                    <Play size={32} className="text-[#8B1A1A] fill-current translate-x-1" />
                  </div>
                  {isFacebookVideo && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                      Watch on Facebook
                    </div>
                  )}
                </button>
              ) : isVideo && showVideoModal ? (
                <div className="w-full h-full bg-black">
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-full transition"
                  >
                    <X size={20} />
                  </button>
                  <iframe
                    className="w-full h-full"
                    src={`${videoEmbedUrl}?autoplay=1`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              ) : (
                <Image
                  src={sermon.thumbnail}
                  alt={sermon.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>
        )}

        {/* 4. Reading Content Area */}
        <div className="px-6 md:px-12 flex-grow mb-8">
          <div className="relative">
            <div
              className={`prose prose-slate max-w-none transition-all duration-700 ease-in-out overflow-hidden
                font-serif text-lg md:text-xl text-slate-700 leading-relaxed
                [&_img]:rounded-2xl [&_img]:shadow-lg [&_p]:mb-6
                ${expanded ? 'max-h-[none]' : 'max-h-60'}`}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
            
            {!expanded && contentHtml.length > 180 && (
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            )}
          </div>

          {contentHtml.length > 180 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-[#8B1A1A] hover:text-white text-[#8B1A1A] rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
            >
              {expanded ? (
                <>Collapse Transcript <ChevronUp size={14} /></>
              ) : (
                <>Read Full Transcript <ChevronDown size={14} /></>
              )}
            </button>
          )}
        </div>

        {/* 5. Rich Footer Actions */}
        <div className="px-6 md:px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400">
              <Eye size={18} />
              <span className="text-xs font-bold tracking-tight">{sermon.views || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <MessageCircle size={18} />
              <span className="text-xs font-bold tracking-tight">{sermon.comments || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                liked ? 'bg-red-50 text-red-600' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} className={liked ? 'scale-110' : ''} />
              <span className="text-xs font-black">{likes}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </Card>
      
      {/* Mobile Image Warning - Floating Style */}
      {contentHtml.includes('<img') && (
        <div className="mt-4 mx-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-amber-700 font-medium flex items-center gap-2">
          <span className="bg-amber-200 text-amber-800 size-4 flex items-center justify-center rounded-full text-[8px] font-black">!</span>
          Disable tracking prevention if images fail to load.
        </div>
      )}
    </div>
  );
};

export default SermonCard;