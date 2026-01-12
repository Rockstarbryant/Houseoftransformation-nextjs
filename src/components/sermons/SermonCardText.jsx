'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Eye, Calendar, User, ChevronDown, ChevronUp, Quote } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { sermonService } from '@/services/api/sermonService';
import Card from '../common/Card';

const SermonCardText = ({ sermon }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(sermon.likes || 0);
  const [expanded, setExpanded] = useState(false);

  const handleLike = async () => {
    try {
      await sermonService.toggleLike(sermon._id);
      setLiked(!liked);
      setLikes(liked ? likes - 1 : likes + 1);
    } catch (error) {
      console.error('Error liking sermon:', error);
    }
  };

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
        className="
          flex flex-col 
          bg-white 
          rounded-xl md:rounded-[2.5rem] 
          border border-slate-100 
          shadow-sm hover:shadow-xl 
          transition-all duration-500 
          overflow-hidden 
          mx-0.5 md:mx-0
        "
      >
        {/* Header */}
        <div className="px-4 sm:px-5 md:px-12 pt-6 md:pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 md:size-11 rounded-full bg-gradient-to-br from-slate-800 to-black flex items-center justify-center text-white text-[10px] md:text-xs font-black shadow-md">
              {sermon.pastor?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#8B1A1A]">
                {sermon.category || 'Transcript'}
              </p>
              <p className="text-xs md:text-sm font-bold text-slate-900 leading-tight">
                {sermon.pastor || 'Pastor'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Calendar size={12} className="text-red-500" />
            {formatDate(sermon.date, 'short')}
          </div>
        </div>

        {/* Title */}
        <div className="px-4 sm:px-5 md:px-12 pb-5 md:pb-6">
          <h3 className="text-xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight text-center underline decoration-[#8B1A1A]/10 underline-offset-8">
            {sermon.title}
          </h3>
        </div>

        {/* Main Content - maximized width on mobile */}
        <div className="px-3 xs:px-4 sm:px-5 md:px-14 flex-grow mb-6 md:mb-8 relative">
          {/* Decorative Quote watermark */}
          <Quote 
            className="absolute top-1 right-3 sm:right-6 md:right-10 text-slate-50 opacity-10 pointer-events-none" 
            size={60} 
          />

          <div className="relative w-full">
            <div
              className={`
                prose prose-slate 
                max-w-none w-full
                transition-all duration-700 ease-in-out
                font-serif 
                text-[17px] sm:text-lg md:text-xl 
                text-slate-700 
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
        <div className="px-4 sm:px-5 md:px-10 py-5 md:py-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Eye size={18} />
              <span className="text-[10px] md:text-xs font-bold text-slate-500">{sermon.views || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <MessageCircle size={18} />
              <span className="text-[10px] md:text-xs font-bold text-slate-500">{sermon.comments || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                liked ? 'bg-red-50 text-red-600 shadow-sm' : 'text-slate-400 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} className={liked ? 'scale-110' : ''} />
              <span className="text-xs font-black">{likes}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="p-2.5 rounded-full text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-md transition-all"
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