'use client';

import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import Link from 'next/link';
import Button from '../common/Button';
import { livestreamService } from '@/services/api/livestreamService';

const LiveStreamSection = () => {
  const [activeStream, setActiveStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => {
    const fetchActiveStream = async () => {
      try {
        setLoading(true);
        const result = await livestreamService.getActiveStream();
        
        if (result.success) {
          setActiveStream(result.data);
        } else {
          setActiveStream(null);
        }
      } catch (error) {
        console.error('Error fetching active stream:', error);
        setActiveStream(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveStream();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveStream, 30000);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer to load iframe only when visible
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !iframeReady) {
          setIframeReady(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const element = document.getElementById('livestream-container');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [iframeReady]);

  const getEmbedUrl = () => {
    if (!activeStream) return null;
    
    if (activeStream.youtubeVideoId) {
      return `https://www.youtube.com/embed/${activeStream.youtubeVideoId}`;
    }
    if (activeStream.youtubeUrl && activeStream.youtubeUrl.includes('youtube')) {
      return activeStream.youtubeUrl;
    }
    if (activeStream.facebookUrl) {
      return activeStream.facebookUrl;
    }
    return null;
  };

  // Don't render section if no active stream or still loading
  if (loading || !activeStream) {
    return null;
  }

  const embedUrl = getEmbedUrl();

  return (
    <section id="livestream-container" className="py-16 md:py-24 bg-gradient-to-r from-red-600 to-red-700">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Live Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-white uppercase tracking-widest">
            STREAMING LIVE NOW
          </span>
        </div>
        
        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Text Content */}
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {activeStream.title}
            </h2>
            
            {activeStream.description && (
              <p className="text-xl text-red-100 mb-6">
                {activeStream.description}
              </p>
            )}

            {activeStream.preacherNames && activeStream.preacherNames.length > 0 && (
              <p className="text-red-100 mb-6">
                <span className="font-semibold">Preacher:</span> {activeStream.preacherNames.join(', ')}
              </p>
            )}
            
            <Link href="/livestream">
              <Button variant="primary" size="lg">
                <Play size={20} /> Watch Live
              </Button>
            </Link>
          </div>
          
          {/* Right: Video Player - LAZY LOAD IFRAME */}
          {embedUrl && iframeReady && (
            <div className="aspect-video rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title={activeStream.title}
                loading="lazy"
              />
            </div>
          )}

          {/* Placeholder while iframe loads */}
          {embedUrl && !iframeReady && (
            <div className="aspect-video rounded-lg overflow-hidden shadow-2xl bg-black/50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
                <p className="text-sm">Loading stream...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LiveStreamSection;