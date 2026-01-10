'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Calendar, User, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Loader from '../common/Loader';
import { feedbackService } from '@/services/api/feedbackService';

const TestimoniesWall = () => {
  const [testimonies, setTestimonies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const fetchTestimonies = async () => {
    try {
      setIsLoading(true);
      const response = await feedbackService.getPublicTestimonies();
      
      if (response.success) {
        setTestimonies(response.testimonies.slice(0, 6)); // Show latest 6
      }
    } catch (err) {
      console.error('Error fetching testimonies:', err);
      setError('Failed to load testimonies');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader />
      </div>
    );
  }

  if (error || testimonies.length === 0) {
    return null; // Don't show section if no testimonies or error
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-2 flex items-center justify-center gap-3">
          <Heart className="text-red-500" size={32} />
          Recent Testimonies
        </h2>
        <p className="text-gray-600">See how God is moving in the lives of our members</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonies.map((testimony) => (
          <Card key={testimony._id} className="flex flex-col hover:shadow-lg transition-shadow h-full">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {testimony.feedbackData?.testimonyType || 'Testimony'}
                </span>
                {testimony.feedbackData?.testimonyDate && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    {formatDate(testimony.feedbackData.testimonyDate)}
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                {testimony.feedbackData?.title || 'Untitled Testimony'}
              </h3>
            </div>

            {/* Story Preview */}
            <div className="flex-grow mb-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                {truncateText(testimony.feedbackData?.story || '')}
              </p>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={16} />
                  <span>
                    {testimony.isAnonymous ? 'Anonymous' : (testimony.name || 'Anonymous')}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-red-500">
                  <Heart size={16} className="fill-current" />
                </div>
              </div>

              {/* Read More Button */}
              <Link
                to={`/testimony/${testimony._id}`}
                className="inline-flex items-center gap-2 w-full justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-semibold hover:shadow-md transition-all transform hover:-translate-y-0.5 group"
              >
                <span>Read Full Story</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* View More Link */}
      {testimonies.length >= 6 && (
        <div className="text-center mt-12">
          <Link 
            to="/feedback"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-lg hover:underline transition group"
          >
            View All Testimonies
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default TestimoniesWall;