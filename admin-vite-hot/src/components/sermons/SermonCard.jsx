import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Eye, Play, Calendar, ArrowRight, X } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { sermonService } from '../../services/api/sermonService';
import Card from '../common/Card';

const SermonCard = ({ sermon }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(sermon.likes || 0);
  const [showVideoModal, setShowVideoModal] = useState(false);
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

  // Professional share with direct scroll-to-card link
  const handleShare = () => {
    const baseUrl = window.location.origin + window.location.pathname + window.location.search;
    const fragmentUrl = sermon._id ? `${baseUrl}#sermon-${sermon._id}` : baseUrl;

    const title = sermon.title || 'Inspiring Sermon';
    const text = `Listen to "${title}" by ${sermon.pastor || 'Pastor'} at Busia House of Transformation`;

    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: fragmentUrl
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Copy clean URL without fragment for broader compatibility
      navigator.clipboard.writeText(baseUrl);
      alert('Sermons page link copied to clipboard!\nShare it to direct others to this powerful message.');
    }
  };

  // Universal video embed extractor
  const getVideoEmbedUrl = (url) => {
    if (!url) return '';

    // YouTube - multiple formats support
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId;
      
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/watch')) {
        videoId = new URL(url).searchParams.get('v');
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
    }

    // TikTok
    if (url.includes('tiktok.com')) {
      return url;
    }

    // Facebook - return null (open in new tab instead)
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      return null;
    }

    return '';
  };

  const getPreviewText = (html, limit = 180) => {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.innerText || temp.textContent || '';
    if (text.length <= limit) return text;
    return text.substring(0, limit).trim() + '...';
  };

  const contentHtml = sermon.descriptionHtml || sermon.description || '';
  const previewText = getPreviewText(contentHtml);

  // ✅ FIX #1: Explicitly check for video type
  const isVideo = sermon.type === 'video' && sermon.videoUrl;
  const hasThumbnail = Boolean(sermon.thumbnail);
  const videoEmbedUrl = isVideo ? getVideoEmbedUrl(sermon.videoUrl) : null;
  const isFacebookVideo = isVideo && (sermon.videoUrl?.includes('facebook.com') || sermon.videoUrl?.includes('fb.watch'));

  // Debug logging
  useEffect(() => {
    if (sermon._id) {
      console.log(`🎤 SermonCard [${sermon.title}]:`, {
        type: sermon.type,
        hasVideoUrl: !!sermon.videoUrl,
        isVideo,
        hasThumbnail,
        hasImages: contentHtml.includes('<img'),
        contentLength: contentHtml.length
      });
    }
  }, [sermon._id, sermon.type, sermon.videoUrl, isVideo]);

  // Use HTML directly (TipTap output is safe)
  const sanitizedHtml = contentHtml;

  return (
    <>
      {/* Anchor target for direct scrolling when shared */}
      <div id={`sermon-${sermon._id}`}>
        <Card className="flex flex-col hover:shadow-lg transition-shadow h-full overflow-visible">
          
          {/* Header: Category + Date */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
            {sermon.category && (
              <span className="inline-block px-3 py-1 bg-red-100 text-blue-800 text-xs font-semibold rounded-full">
                {sermon.category}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={12} />
              {formatDate(sermon.date, 'short')}
            </span>
          </div>

          {/* Pastor Info */}
          <div className="px-5 pt-4 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {sermon.pastor?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {sermon.pastor || 'Pastor'}
              </p>
              <p className="text-xs text-gray-500">@Busia_HOT</p>
            </div>
          </div>

          {/* Title */}
          <h3 className="px-5 text-lg font-bold text-red-900 line-clamp-2 leading-snug underline text-center mb-3">
            {sermon.title}
          </h3>

          {/* ✅ FIX #2: ALWAYS SHOW VIDEO PREVIEW FOR VIDEO SERMONS */}
          {isVideo && !showVideoModal && (
            <div className="px-5 mb-4 text-justify">
              <button
                onClick={() => setShowVideoModal(true)}
                className="relative w-full aspect-video rounded-lg overflow-hidden bg-black group"
                title="Click to watch video"
              >
                {/* Thumbnail or fallback */}
                <img
                  src={
                    hasThumbnail
                      ? sermon.thumbnail
                      : 'https://via.placeholder.com/600x340?text=Video+Sermon'
                  }
                  alt={sermon.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x340?text=Video+Error';
                  }}
                />

                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 p-4 rounded-full shadow-lg group-hover:scale-110 transition">
                    <Play size={32} className="text-blue-700 fill-current" />
                  </div>
                </div>

                {/* Facebook warning */}
                {isFacebookVideo && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs py-2 px-3 text-center">
                    Opens on Facebook
                  </div>
                )}
              </button>
            </div>
          )}

          {/* ✅ INLINE VIDEO PLAYER (replaces thumbnail when playing) */}
          {isVideo && showVideoModal && (
            <div className="px-5 mb-4">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="absolute top-3 right-3 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition"
                  title="Close video"
                >
                  <X size={20} />
                </button>
                
                <iframe
                  className="w-full h-full"
                  src={videoEmbedUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={sermon.title}
                />
              </div>
            </div>
          )}

          {/* Main Thumbnail (only if NOT video or no thumbnail) */}
          {!isVideo && hasThumbnail && (
            <div className="relative aspect-video bg-slate-100 overflow-hidden group mx-5 mb-4 rounded-lg flex-shrink-0">
              <img
                src={sermon.thumbnail}
                alt={sermon.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x340?text=Image+Error';
                }}
              />
            </div>
          )}

          {/* HTML Content (Text + Images) */}
          <div className="px-5 flex-grow mb-4">
            <div
              className={`prose prose-lg max-w-none text-gray-800 transition-all duration-300 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_img]:border [&_img]:border-gray-200 [&_p]:leading-relaxed [&_p]:whitespace-pre-wrap [&_p]:font-light [&_p]:text-justify [&_p]:text-xl ${
                expanded ? '' : 'max-h-60 overflow-hidden'
              }`}
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />

            {/* Show "Read More" button only if content exceeds preview height */}
            {contentHtml.length > 180 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="text-blue-600 font-semibold text-sm hover:text-blue-700 mt-3 inline-block"
              >
                {expanded ? 'Show Less ↑' : 'Read More ↓'}
              </button>
            )}
          </div>

          {/* Image loading warning (if images blocked by tracking prevention) */}
          {contentHtml.includes('<img') && (
            <div className="text-xs text-amber-600 mt-2 px-5 p-2 bg-amber-50 rounded">
              💡 If images don't show, try opening in incognito mode or disabling tracking prevention.
            </div>
          )}

          {/* Footer: Stats + Action */}
          <div className="px-5 pt-4 border-t border-gray-200 space-y-4 mt-auto">
            {/* Interaction Stats */}
            <div className="flex justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MessageCircle size={16} />
                <span>{sermon.comments || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>{sermon.views || 0}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                className="flex items-center gap-1 text-red-500 hover:text-red-600 transition"
              >
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                <span>{likes}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default SermonCard;