'use client';

import React from 'react';
import { ChevronRight, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import Card from '../common/Card';

const ServiceAreaCard = ({ name, description, imageUrl, teamCount, timeCommitment }) => {
  // Convert name to URL-friendly slug
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '&');

  return (
    <Card hover className="flex flex-col h-full group overflow-hidden">
      {/* Header */}
      <h3 className="text-2xl font-bold text-blue-900 mb-2">{name}</h3>
      {/* Image Section */}
      <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              console.error(`Failed to load image: ${imageUrl}`);
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="text-gray-400 text-center">
            <p>No image available</p>
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-600 mb-6 flex-grow text-sm leading-relaxed">{description}</p>

      {/* Meta Information */}
      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Users size={16} className="text-blue-600 flex-shrink-0" />
          <span>{teamCount} team members</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Clock size={16} className="text-blue-600 flex-shrink-0" />
          <span>{timeCommitment}</span>
        </div>
      </div>

      {/* Call to Action */}
      <Link
        href={`/service-areas/${slug}`}
        className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition-colors group/link"
      >
        Learn More
        <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
      </Link>
    </Card>
  );
};

export default ServiceAreaCard;