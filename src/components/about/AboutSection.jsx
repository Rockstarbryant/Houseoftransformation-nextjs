'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Compass, 
  Target, 
  History, 
  Users2, 
  Cross, 
  ChevronRight,
  Play,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import Button from '../common/Button';

const churchImages = [
  {
    url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767444965/WhatsApp_Image_2026-01-03_at_15.54.45_mpogon.jpg',
    alt: 'Sunday worship service at House of Transformation Main Campus Busia'
  },
  {
    url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1770702881/church-gallery/py4vev0znmvnc6zgo3w5.jpg',
    alt: 'Members of the House of Transformation community gathering in Busia County'
  },
  {
    url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767445662/copy_of_ot_ibz2xp_6e0397.jpg',
    alt: 'Community fellowship and ministry outreach in Western Kenya'
  }
];

const AboutSection = ({ preview = false }) => {
  if (preview) {
    // HOMEPAGE PREVIEW - full edge-to-edge on mobile
    return (
      <section className="py-12 md:py-20 bg-slate-50 dark:bg-slate-900 w-full">
        <div className="max-w-full px-0 md:px-6 lg:px-8">
          <div className="
            bg-white
            dark:bg-slate-900 dark:text-white 
            rounded-none md:rounded-[2.5rem] 
            overflow-hidden 
            flex flex-col lg:flex-row 
            w-full
          ">
            <div className="lg:w-1/2 p-4 md:p-10 lg:p-16 space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-900 dark:bg-red-900 rounded-full mb-4">
                <ShieldCheck size={14} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-100 dark:text-slate-100">Our Identity</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                Welcome to H.O.T
              </h2>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                House of Transformation Ministries is a vibrant community in Busia County where the Gospel is preached with power and lives are genuinely changed.
              </p>
            </div>
            <div className="lg:w-1/2 relative min-h-[450px] md:min-h-[550px] bg-slate-200">
              <Image
                src={churchImages[1].url}
                alt="H.O.T Worship"
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        <div className="flex justify-center lg:justify-start">
          <Link href="/about" className="inline-block">
            <Button variant="secondary" className="rounded-xl mt-6 items-center font-black uppercase text-xs tracking-widest px-8">
              View Our Full Story <ChevronRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
        </div>
      </section>
    );
  }

  // FULL ABOUT PAGE - Mobile responsive with no layout shifts
  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-900 dark:text-white pb-16 md:pb-32 overflow-x-hidden">
      {/* 1. MODULAR HERO SECTION */}
      <section className="pt-20 pb-8 md:pt-20 md:pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6">
          {/* Hero Text Card */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 mt-6 sm:p-8 md:p-12 lg:p-20 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-center min-h-[280px] md:min-h-[350px]">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4 md:mb-6">
              <span className="sr-only">About House of Transformation Busia</span>
              THE <span className="text-[#8B1A1A]">H.O.T</span> <br />EXPERIENCE.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl">
              Touching and transforming lives through the anointed gospel since 1989.
            </p>
          </div>

          {/* Stats Card */}
          <div className="lg:col-span-4 bg-[#8B1A1A] rounded-2xl md:rounded-[3rem] p-6 mt-6 sm:p-8 md:p-10 flex flex-col justify-between text-white shadow-xl min-h-[180px] md:min-h-[200px]">
            <Zap size={32} className="text-white/50" />
            <div>
              <p className="text-3xl sm:text-4xl font-black mb-2">36+</p>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] opacity-70">Years of Ministry</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE HEARTBEAT CELLS */}
      <section className="px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Image */}
          <div className="lg:col-span-4 rounded-2xl md:rounded-[3rem] overflow-hidden shadow-sm bg-slate-200 relative min-h-[280px] sm:min-h-[320px] md:min-h-[500px]">
            <Image
              src={churchImages[0].url}
              alt="Worship"
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          </div>

          {/* Text Content */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-12 lg:p-16 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-100 space-y-6 md:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 md:gap-4">
              <div className="w-1.5 md:w-2 h-8 md:h-10 bg-[#8B1A1A] rounded-full flex-shrink-0" />
              The H.O.T Heartbeat
            </h2>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base md:text-lg">
              <p className="font-bold text-slate-900 dark:text-white">
                House of Transformation Ministries (H.O.T) is a dynamic community located in Busia Town, Busia County. As a premier Christian ministry in Western Kenya, we have deep roots in Nairobi.
              </p>
              <p>
                Dedicated to preaching the powerful Gospel of the Kingdom of God and seeing real transformation in people's lives spiritually, physically, and communally.
              </p>
              <p>
                Founded on faith, hope, and love, we create a welcoming environment where everyone – whether a longtime believer or someone new to faith – can encounter God.
              </p>
              <p>
                Our Busia Main Campus is a beacon of hope, fostering vibrant worship, deep fellowship, and active service across the unique communities of western Kenya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MISSION & VISION MODULES */}
      <section className="px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Mission Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-12 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-100 space-y-5 md:space-y-6 hover:border-[#8B1A1A]/30 transition-colors min-h-[280px]">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
              <Compass size={28} className="md:w-8 md:h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Our Mission</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed italic">
              "To transform the lives of God's people for spiritual and physical prosperity by preaching the Kingdom of God and those things which concern the Lord Jesus Christ (Acts 28:31)."
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-12 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-100 space-y-5 md:space-y-6 hover:border-[#8B1A1A]/30 transition-colors min-h-[280px]">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0">
              <Target size={28} className="md:w-8 md:h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Our Vision</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed italic">
              "To see the church flourishing and holistically transforming people's lives through the anointed Gospel globally (Matthew 28:19-20)."
            </p>
          </div>
        </div>
      </section>

      {/* 4. BELIEFS (Icon Grid) */}
      <section className="px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-2xl md:rounded-[4rem] p-6 sm:p-8 md:p-12 lg:p-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-8 md:mb-12 lg:mb-16">Our Core Beliefs</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
              {[
                { icon: <ShieldCheck size={20} className="sm:w-6 sm:h-6" />, text: "The Bible as the inspired, infallible Word of God" },
                { icon: <Cross size={20} className="sm:w-6 sm:h-6" />, text: "One God in three persons: Father, Son, and Holy Spirit" },
                { icon: <Zap size={20} className="sm:w-6 sm:h-6" />, text: "Salvation by grace through faith in Jesus Christ" },
                { icon: <Globe size={20} className="sm:w-6 sm:h-6" />, text: "The transformative power of the Kingdom Gospel (Acts 28:31)" },
                { icon: <Users2 size={20} className="sm:w-6 sm:h-6" />, text: "The importance of community, fellowship, and good works (Hebrews 10:25)" }
              ].map((item, i) => (
                <div key={i} className="flex gap-3 sm:gap-4 md:gap-5 items-start group">
                  <div className="text-[#8B1A1A] mt-1 group-hover:scale-110 transition-transform flex-shrink-0">{item.icon}</div>
                  <p className="text-slate-300 font-bold leading-snug text-sm sm:text-base md:text-lg">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. HISTORY (Split Narrative) */}
      <section className="px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[3rem] p-6 sm:p-8 md:p-12 lg:p-20 shadow-sm border border-slate-100">
            <div className="grid lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16">
              {/* History Header */}
              <div className="lg:col-span-4 space-y-3 md:space-y-4">
                <History size={32} className="text-[#8B1A1A] sm:w-10 sm:h-10" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Our History</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs">A Legacy of Grace</p>
              </div>

              {/* Timeline */}
              <div className="lg:col-span-8 space-y-6 sm:space-y-8 md:space-y-12">
                <div className="space-y-3 md:space-y-4 border-l-4 border-slate-50 pl-4 sm:pl-6 md:pl-8">
                  <h4 className="text-base sm:text-lg md:text-xl font-black text-[#8B1A1A]">The Birth in Nairobi (1989)</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed">
                    Founded around 1989 as Nairobi Gospel Assembly Church, House of Transformation Ministries began as a place of vibrant worship and community outreach in Nairobi, Kenya.
                  </p>
                </div>
                <div className="space-y-3 md:space-y-4 border-l-4 border-[#8B1A1A] pl-4 sm:pl-6 md:pl-8">
                  <h4 className="text-base sm:text-lg md:text-xl font-black text-[#8B1A1A]">Expansion to Busia</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed">
                    The Busia Main Campus was established as a key outreach in western Kenya, addressing the unique needs of diverse communities including the Luhya and Iteso people.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LEADERSHIP (Clean Grid) */}
      <section className="px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white text-center mb-8 md:mb-12 lg:mb-16">Our Leadership</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {[
              { name: "Apostle Aloys A. Rutivi", role: "Founding Pastor", img: churchImages[2].url },
              { name: "Lavern Rutivi", role: "Worship Coordinator", img: churchImages[0].url },
              { name: "The Dedicated Team", role: "Pastors & Volunteers", img: churchImages[1].url }
            ].map((leader, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2.5rem] p-5 sm:p-6 md:p-8 shadow-sm border border-slate-100 text-center space-y-3 md:space-y-4 min-h-[240px]">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto rounded-2xl md:rounded-3xl overflow-hidden shadow-md bg-slate-200">
                  <Image
                    src={leader.img}
                    alt={`${leader.name} - ${leader.role} at House of Transformation Busia`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                  />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white">{leader.name}</h4>
                  <p className="text-[#8B1A1A] font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mt-1">{leader.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. JOIN CALL-TO-ACTION */}
      <section className="px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-[3rem] p-6 sm:p-8 md:p-12 lg:p-20 shadow-sm border border-slate-100 text-center space-y-6 sm:space-y-8 md:space-y-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              Experience the <br /><span className="text-[#8B1A1A] dark:text-[#8B1A1A]">Transformation</span>
            </h2>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-sm md:text-base">
              <div className="flex items-center justify-center gap-2">
                <Clock size={18} className="text-[#8B1A1A] sm:w-5 sm:h-5" /> 
                <span>9:00 AM • 11:00 AM</span>
              </div>
              <a 
                href="https://www.google.com/maps?q=Busia+Main+Campus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 hover:text-[#8B1A1A] transition-colors"
              >
                <MapPin size={18} className="text-[#8B1A1A] sm:w-5 sm:h-5" /> 
                <span>Busia Main Campus</span>
              </a>
            </div>
            <Link href="/livestream">
              <Button variant="secondary" className="bg-[#8B1A1A] hover:bg-[#6B1515] text-white rounded-2xl px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 font-black uppercase text-xs sm:text-sm tracking-[0.2em] shadow-lg shadow-red-900/20 inline-flex items-center justify-center gap-2">
                <Play size={16} fill="white" className="sm:w-[18px] sm:h-[18px]" /> Watch Live
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutSection;