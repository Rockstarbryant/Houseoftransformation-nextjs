"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // ✅ Changed
import Link from 'next/link'; // ✅ Changed
import { ArrowLeft, Heart, Calendar, User, Share2, AlertCircle } from 'lucide-react';
import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import { feedbackService } from '@/services/api/feedbackService';

export default function TestimonyDetailPage() {
  const params = useParams(); // ✅ Changed
  const router = useRouter(); // ✅ Changed
  const id = params.id; // ✅ Get id from params
  
  const [testimony, setTestimony] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [relatedTestimonies, setRelatedTestimonies] = useState([]);

  const fetchTestimony = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await feedbackService.getFeedbackById(id);
      
      if (response.success) {
        setTestimony(response.feedback);
      } else {
        setError('Testimony not found');
      }
    } catch (err) {
      console.error('Error fetching testimony:', err);
      setError('Failed to load testimony. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchRelatedTestimonies = useCallback(async () => {
    try {
      const response = await feedbackService.getPublicTestimonies();
      
      if (response.success) {
        const related = response.testimonies
          .filter(t => t._id !== id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        setRelatedTestimonies(related);
      }
    } catch (err) {
      console.error('Error fetching related testimonies:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchTestimony();
    fetchRelatedTestimonies();
  }, [fetchTestimony, fetchRelatedTestimonies]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    const title = testimony?.feedbackData?.title || 'Read this testimony';
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: 'Check out this inspiring testimony!',
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !testimony) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button
            onClick={() => router.push('/feedback')} // ✅ Changed
            className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 font-semibold mb-8 transition"
          >
            <ArrowLeft size={20} />
            Back to Testimonies
          </button>

          <Card className="p-12 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Testimony Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'This testimony could not be found.'}</p>
            <button
              onClick={() => router.push('/feedback')} // ✅ Changed
              className="bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              View All Testimonies
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Back Button */}
        <button
          onClick={() => router.push('/feedback')} // ✅ Changed
          className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 font-semibold mb-8 transition hover:gap-3"
        >
          <ArrowLeft size={20} />
          Back to Testimonies
        </button>

        {/* Main Content */}
        <Card className="mb-8 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-8 text-white">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-grow">
                <div className="inline-block px-3 py-1 bg-white/30 backdrop-blur-sm text-white text-sm font-semibold rounded-full mb-3">
                  {testimony.feedbackData?.testimonyType || 'Testimony'}
                </div>
                
                <h1 className="text-4xl font-bold leading-tight mb-2">
                  {testimony.feedbackData?.title || 'Untitled Testimony'}
                </h1>

                <p className="text-white/90 text-lg">
                  A powerful story of faith and transformation
                </p>
              </div>

              {/* Like & Share Buttons */}
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={handleLike}
                  className={`p-3 rounded-full backdrop-blur-sm transition-all transform hover:scale-110 ${
                    liked
                      ? 'bg-white/40 text-red-500'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title="Like this testimony"
                >
                  <Heart size={24} className={liked ? 'fill-current' : ''} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all transform hover:scale-110"
                  title="Share this testimony"
                >
                  <Share2 size={24} />
                </button>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 text-white/90 text-sm">
              {testimony.feedbackData?.testimonyDate && (
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{formatDate(testimony.feedbackData.testimonyDate)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>
                  {testimony.isAnonymous ? 'Anonymous' : (testimony.name || 'Community Member')}
                </span>
              </div>
            </div>
          </div>

          {/* Story Content */}
          <div className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify">
                {testimony.feedbackData?.story || 'No story content available.'}
              </p>
            </div>

            {/* Additional Details */}
            {testimony.feedbackData && Object.entries(testimony.feedbackData).map(([key, value]) => {
              if (!value || typeof value === 'object' || ['title', 'story', 'testimonyType', 'testimonyDate'].includes(key)) {
                return null;
              }

              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());

              return (
                <div key={key} className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{label}</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {String(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-8 mb-12 text-center">
          <h3 className="text-2xl font-bold mb-3">Inspired by this testimony?</h3>
          <p className="text-blue-100 mb-6">Share your own story of faith and transformation with our community.</p>
          <Link
            href="/feedback?category=testimony" // ✅ Changed to href
            className="inline-block bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
          >
            Share Your Testimony
          </Link>
        </div>

        {/* Related Testimonies */}
        {relatedTestimonies.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-8 flex items-center gap-3">
              <Heart className="text-red-500" size={32} />
              More Inspiring Stories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedTestimonies.map((relatedTestimony) => (
                <Link
                  key={relatedTestimony._id}
                  href={`/testimony/${relatedTestimony._id}`} // ✅ Changed to href
                  className="group"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-2">
                        {relatedTestimony.feedbackData?.testimonyType || 'Testimony'}
                      </span>
                      
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-900 transition-colors line-clamp-2">
                        {relatedTestimony.feedbackData?.title || 'Untitled'}
                      </h3>
                    </div>

                    <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                      {relatedTestimony.feedbackData?.story || ''}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                      <span className="flex-grow">
                        {relatedTestimony.isAnonymous ? 'Anonymous' : (relatedTestimony.name || 'Member')}
                      </span>
                      <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}