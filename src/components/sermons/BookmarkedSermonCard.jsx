'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, Calendar, Bookmark, ArrowRight, Video, FileText } from 'lucide-react';
import { formatDate, truncateText, getTimeAgo } from '@/utils/helpers';

/**
 * Compact Sermon Card for Bookmarks/Likes pages
 * Shows sermon preview with metadata
 */
const BookmarkedSermonCard = ({ sermon, type = 'bookmark', onRemove }) => {
  const contentPreview = sermon.description 
    ? truncateText(sermon.description, 150)
    : sermon.descriptionHtml 
      ? truncateText(sermon.descriptionHtml.replace(/<[^>]*>/g, ''), 150)
      : 'No description available';

  const getTypeIcon = () => {
    if (sermon.type === 'video') return <Video size={16} className="text-red-600" />;
    return <FileText size={16} className="text-slate-600" />;
  };

  const metaDate = type === 'bookmark' ? sermon.bookmarkedAt : sermon.likedAt;

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
          {sermon.thumbnail ? (
            <Image
              src={sermon.thumbnail}
              alt={sermon.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
              <div className="text-center">
                {getTypeIcon()}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 capitalize">
                  {sermon.type || 'text'}
                </p>
              </div>
            </div>
          )}
          
          {/* Type Badge */}
          {sermon.type && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              {getTypeIcon()}
              <span className="capitalize">{sermon.type}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/sermons#sermon-${sermon._id}`}
                  className="group/title"
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover/title:text-red-600 dark:group-hover/title:text-red-500 transition-colors line-clamp-2">
                    {sermon.title}
                  </h3>
                </Link>
                
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-red-600 dark:text-red-500">
                    {sermon.pastor}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{sermon.category || 'Sunday Service'}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(sermon.date, 'short')}
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              {onRemove && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onRemove(sermon._id);
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                  title={type === 'bookmark' ? 'Remove bookmark' : 'Unlike'}
                >
                  {type === 'bookmark' ? (
                    <Bookmark size={18} fill="currentColor" />
                  ) : (
                    <Heart size={18} fill="currentColor" />
                  )}
                </button>
              )}
            </div>

            {/* Description Preview */}
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
              {contentPreview}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{sermon.views || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart size={14} />
                <span>{sermon.likes || 0}</span>
              </div>
              {metaDate && (
                <div className="flex items-center gap-1">
                  {type === 'bookmark' ? (
                    <Bookmark size={14} />
                  ) : (
                    <Heart size={14} />
                  )}
                  <span className="text-xs">
                    {type === 'bookmark' ? 'Saved' : 'Liked'} {getTimeAgo(metaDate)}
                  </span>
                </div>
              )}
            </div>

            <Link
              href={`/sermons#sermon-${sermon._id}`}
              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition-colors group/link"
            >
              Read Full Sermon
              <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkedSermonCard;