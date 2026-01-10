'use client';

import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import Button from '../common/Button';

const HeroSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const youtubeEmbedUrl =
    "https://www.youtube.com/embed/peKWWYI70wI?si=4_lY8fmBlagW4x4";

  const churchImages = [
    {
      url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767444965/WhatsApp_Image_2026-01-03_at_15.54.45_mpogon.jpg',
      alt: 'Church worship'
    },
    {
      url: 'https://pbs.twimg.com/profile_images/700352011582251008/wrxEHL3q.jpg',
      alt: 'Church community'
    },
    {
      url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767445662/copy_of_ot_ibz2xp_6e0397.jpg',
      alt: 'Church fellowship'
    }
  ];

  return (
    <section 
      className="relative bg-cover bg-center bg-no-repeat pt-32 pb-24 overflow-hidden"
      style={{
        backgroundImage: `url('https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767444965/WhatsApp_Image_2026-01-03_at_15.54.45_mpogon.jpg')`
      }}
    >
      {/* Dark overlay for better text readability across the full background */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* ================= MAIN GRID ================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ========== LEFT: TEXT CONTENT ========== */}
        <div className="text-white">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            H.O.T
            <br />
            <span className="block mt-2">
              More than a church.
            </span>
          </h1>

          <p className="max-w-xl text-lg md:text-xl text-white/90 mb-4">
          Touching & transforming lives through the anointed gospel 
          </p>

          <p className="text-base md:text-lg text-white/80 mb-10">
            Sunday Services · 9:00AM · 11:00AM · 1:00PM
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="secondary"
              size="lg"
              icon={Play}
              onClick={() => setIsModalOpen(true)}
              className="shadow-lg hover:shadow-xl transition"
            >
              Watch Sunday Service
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="
                border-2 border-white
                text-white
                hover:bg-white
                hover:text-slate-900
                transition
              "
            >
              New Here? Start Here
            </Button>
          </div>
        </div>

        {/* ========== RIGHT: IMAGE COLLAGE (kept exactly as before) ========== */}
        <div className="relative">
          {/* Floating Top Image */}
          <img
            src={churchImages[1].url}
            alt={churchImages[1].alt}
            className="
              hidden md:block
              absolute
              -top-12
              right-0
              w-64
              h-40
              object-cover
              rounded-2xl
              shadow-2xl
              z-20
            "
          />

          {/* Main Image */}
          <img
            src={churchImages[0].url}
            alt={churchImages[0].alt}
            className="
              w-full
              h-[420px]
              md:h-[520px]
              object-cover
              rounded-3xl
              shadow-xl
            "
          />

          {/* Bottom Accent Image */}
          <img
            src={churchImages[2].url}
            alt={churchImages[2].alt}
            className="
              hidden lg:block
              absolute
              -bottom-12
              left-0
              w-72
              h-48
              object-cover
              rounded-2xl
              shadow-2xl
              z-10
            "
          />
        </div>
      </div>

      {/* ================= MODAL (unchanged) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4">
          <div className="relative w-full max-w-5xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 transition"
              aria-label="Close live stream"
            >
              <X size={32} />
            </button>

            <div className="relative pt-[56.25%] bg-black rounded-2xl overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={youtubeEmbedUrl}
                title="Live Stream"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;