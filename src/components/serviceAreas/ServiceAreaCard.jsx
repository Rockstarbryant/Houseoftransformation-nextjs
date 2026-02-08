'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Users, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Card from '../common/Card';

const ServiceAreaCard = ({ name, description, imageUrl, teamCount, timeCommitment }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Slug generation - PRESERVED FROM ORIGINAL
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');

  const fallbackImage = '/images/placeholder-service-area.jpg';
  
  // Check if description is long enough to need "read more"
  const isLongDescription = description.length > 120;
  const displayDescription = isDescriptionExpanded ? description : description.slice(0, 120) + (isLongDescription ? '...' : '');

  return (
    <Card 
      padding="none"
      shadow="none"
      className="bg-white dark:bg-slate-800 overflow-hidden transition-all duration-300 hover:shadow-lg group"
    >
      {/* ENTIRE CARD IS A LINK - redirects to /service-areas/${slug} */}
      <Link
        href={`/service-areas/${slug}`}
        className="block"
        aria-label={`Learn more about ${name} service area`}
      >
        {/* Image Section */}
        <div className="relative w-full h-56 sm:h-64 md:h-72 overflow-hidden bg-slate-100 dark:bg-slate-700">
          <Image
            src={imageUrl || fallbackImage}
            alt={`Service area: ${name}`}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />
          
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              {name}
            </h3>
          </div>
        </div>
      </Link>

      {/* Content Section - NOT part of the main link */}
      <div className="p-4 sm:p-5 md:p-6 space-y-4">
        {/* Description with Read More */}
        <div className="space-y-2">
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {displayDescription}
          </p>
          
          {/* Read More Button - stops propagation so it doesn't trigger card link */}
          {isLongDescription && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDescriptionExpanded(!isDescriptionExpanded);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#8B1A1A] hover:text-[#6B1515] transition-colors"
            >
              {isDescriptionExpanded ? (
                <>
                  Show Less <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Read More <ChevronDown size={14} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 sm:gap-6 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400 dark:text-slate-500" />
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
              {teamCount} Members
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-400 dark:text-slate-500" />
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
              {timeCommitment}
            </span>
          </div>
        </div>

        {/* Visual indicator that card is clickable */}
        <Link
          href={`/service-areas/${slug}`}
          className="block w-full bg-slate-50 dark:bg-slate-900 hover:bg-[#8B1A1A] dark:hover:bg-[#8B1A1A] text-slate-900 dark:text-white hover:text-white py-3 px-4 text-center font-black uppercase text-xs tracking-widest transition-all duration-300"
          aria-label={`Explore ${name} ministry details`}
        >
          Explore Ministry
        </Link>
      </div>
    </Card>
  );
};

export default ServiceAreaCard;