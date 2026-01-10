'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import Card from '../common/Card';

const ServiceAreaCard = ({ name, description, imageUrl, teamCount, timeCommitment }) => {
  // Convert name to URL-friendly slug (better handling of special chars)
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') // remove anything that's not letter/number/hyphen
    .replace(/-+/g, '-'); // collapse multiple hyphens

  // Fallback image (you can replace with your own placeholder)
  const fallbackImage = '/images/placeholder-service-area.jpg'; // or use external: 'https://via.placeholder.com/600x400?text=No+Image'

  return (
    <Card hover className="flex flex-col h-full group overflow-hidden">
      {/* Header */}
      <h3 className="text-2xl font-bold text-blue-900 mb-2 px-5 pt-5">{name}</h3>

      {/* Image Section */}
      <div className="relative w-full h-48 mb-4 overflow-hidden bg-gray-200">
        <Image
          src={imageUrl || fallbackImage}
          alt={`Service area: ${name}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false} // set to true only for above-the-fold cards
          quality={75}
          onError={(e) => {
            console.error(`Failed to load image for ${name}: ${imageUrl}`);
            e.currentTarget.src = fallbackImage; // fallback on error
          }}
        />
      </div>

      {/* Content */}
      <div className="px-5 flex flex-col flex-grow">
        <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
          {description}
        </p>

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
          className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition-colors group/link mt-auto pb-5"
          aria-label={`Learn more about ${name} service area`}
        >
          Learn More
          <ChevronRight
            size={16}
            className="group-hover/link:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </Card>
  );
};

export default ServiceAreaCard;