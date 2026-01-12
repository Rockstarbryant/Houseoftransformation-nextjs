'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, Eye, Play, Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { sermonService } from '@/services/api/sermonService';
import Card from '../common/Card';

const SermonCard = ({ sermon }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(sermon.likes || 0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
      navigator.clipboard.writeText(fragmentUrl).then(() => {
        alert('Link copied to clipboard!');
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
    return '';
  }, []);

  const contentHtml = sermon.descriptionHtml || sermon.description || '';
  const isVideo = sermon.type === 'video' && sermon.videoUrl;
  const hasThumbnail = Boolean(sermon.thumbnail);
  const videoEmbedUrl = isVideo ? getVideoEmbedUrl(sermon.videoUrl) : null;

  return (
    <div id={`sermon-${sermon._id}`} className="w-full">
      {/* MOBILE TWEAK: 
          - mx-1 on mobile makes the card fill almost the entire width.
          - md:mx-0 allows the parent container to control centering on PC.
          - rounded-xl on mobile vs rounded-[2.5rem] on PC for better edge-to-edge look.
      */}
      <Card className="flex flex-col bg-white rounded-xl md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden mx-1 md:mx-0">
        
        {/* Header: Reduced padding (px-4) for mobile */}
        <div className="px-4 md:px-10 pt-6 md:pt-10 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] md:text-xs font-black">
              {sermon.pastor?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#8B1A1A]">
                {sermon.category || 'Message'}
              </p>
              <p className="text-xs md:text-sm font-bold text-slate-900 leading-tight">
                {sermon.pastor || 'Pastor'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Calendar size={12} />
            {formatDate(sermon.date, 'short')}
          </div>
        </div>

        {/* Title: Full width responsive text size */}
        <div className="px-4 md:px-10 pb-4">
          <h3 className="text-xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight text-center md:text-left">
            {sermon.title}
          </h3>
        </div>

        {/* Media: Edge-to-edge on mobile */}
        {(isVideo || hasThumbnail) && (
          <div className="px-0 md:px-10 mb-6">
            <div className="relative aspect-video md:rounded-3xl overflow-hidden bg-slate-100 shadow-lg md:shadow-2xl">
              {isVideo && !showVideoModal ? (
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="w-full h-full relative flex items-center justify-center group"
                >
                  <Image
                    src={hasThumbnail ? sermon.thumbnail : 'https://via.placeholder.com/600x340?text=Sermon'}
                    alt={sermon.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
                  <div className="relative z-10 w-14 h-14 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 md:scale-100">
                    <Play size={28} className="text-[#8B1A1A] fill-current translate-x-1" />
                  </div>
                </button>
              ) : isVideo && showVideoModal ? (
                <div className="w-full h-full bg-black">
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="absolute top-2 right-2 md:top-4 md:right-4 z-20 bg-black/50 text-white p-2 rounded-full"
                  >
                    <X size={18} />
                  </button>
                  <iframe className="w-full h-full" src={`${videoEmbedUrl}?autoplay=1`} allow="autoplay; encrypted-media" allowFullScreen />
                </div>
              ) : (
                <Image src={sermon.thumbnail} alt={sermon.title} fill className="object-cover" />
              )}
            </div>
          </div>
        )}

        {/* Content Area: Adjusted for reading on small screens */}
        <div className="px-4 md:px-12 flex-grow mb-6">
          <div className="relative">
            <div
              className={`prose prose-slate max-w-none font-serif text-base md:text-xl text-slate-700 leading-relaxed
                [&_p]:mb-4 md:[&_p]:mb-6
                ${expanded ? 'max-h-none' : 'max-h-48 md:max-h-60 overflow-hidden'}`}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
            {!expanded && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            )}
          </div>

          {contentHtml.length > 180 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-[#8B1A1A] rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100"
            >
              {expanded ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> Read Transcript</>}
            </button>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-4 md:px-10 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Eye size={16} />
              <span className="text-[10px] md:text-xs font-bold">{sermon.views || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <MessageCircle size={16} />
              <span className="text-[10px] md:text-xs font-bold">{sermon.comments || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                liked ? 'bg-red-50 text-red-600' : 'text-slate-400 hover:text-red-500'
              }`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
              <span className="text-[10px] md:text-xs font-black">{likes}</span>
            </button>

            <button onClick={handleShare} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SermonCard;