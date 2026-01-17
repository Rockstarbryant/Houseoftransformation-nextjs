'use client';

import React from 'react';
import Link from 'next/link';
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
    alt: 'Powerful worship service at House of Transformation'
  },
  {
    url: 'https://pbs.twimg.com/profile_images/700352011582251008/wrxEHL3q.jpg',
    alt: 'Church community gathering'
  },
  {
    url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767445662/copy_of_ot_ibz2xp_6e0397.jpg',
    alt: 'Fellowship and celebration'
  }
];

const AboutSection = ({ preview = false }) => {
  if (preview) {
    // HOMEPAGE PREVIEW - full edge-to-edge on mobile
    return (
      <section className="py-12 md:py-20 bg-slate-50 dark:bg-slate-900 w-full">
        <div className="w-full px-0 md:px-6 lg:px-8">
          <div className="
            bg-white
            dark:bg-slate-900 dark:text-white 
            rounded-none md:rounded-[2.5rem] 
            overflow-hidden 
            shadow-sm border border-slate-100 
            flex flex-col lg:flex-row 
            w-full
          ">
            <div className="lg:w-1/2 p-6 md:p-10 lg:p-16 space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-[#8B1A1A] rounded-full text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={14} /> Our Identity
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                Welcome to <span className="text-[#8B1A1A]">H.O.T</span>
              </h2>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                House of Transformation Ministries is a vibrant community in Busia County where the Gospel is preached with power and lives are genuinely changed.
              </p>
              <Link href="/about" className="inline-block">
                <Button variant="secondary" className="rounded-xl font-black uppercase text-xs tracking-widest px-8">
                  View Our Full Story <ChevronRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>

            <div className="lg:w-1/2 relative min-h-[300px] md:min-h-[400px]">
              <img 
                src={churchImages[0].url} 
                className="absolute inset-0 w-full h-full object-cover" 
                alt="H.O.T Worship" 
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // FULL ABOUT PAGE - improved mobile responsiveness
  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-900 dark:text-white pb-16 md:pb-32">
      {/* 1. MODULAR HERO SECTION */}
      <section className="pt-16 pb-8 md:pt-20 md:pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-8 md:p-12 lg:p-20 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-center">
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4 md:mb-6">
              THE <span className="text-[#8B1A1A]">H.O.T</span> <br />EXPERIENCE.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl">
              Touching and transforming lives through the anointed gospel since 1989.
            </p>
          </div>
          <div className="lg:col-span-4 bg-[#8B1A1A] rounded-2xl md:rounded-[3rem] p-8 md:p-10 flex flex-col justify-between text-white shadow-xl">
            <Zap size={36} className="text-white/50" />
            <div>
              <p className="text-4xl font-black mb-2">36+</p>
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">Years of Ministry</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE HEARTBEAT CELLS */}
      <section className="px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-2xl md:rounded-[3rem] overflow-hidden shadow-sm h-[300px] md:h-[500px]">
            <img src={churchImages[0].url} className="w-full h-full object-cover" alt="Worship" />
          </div>
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-8 md:p-12 lg:p-16 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-100 space-y-6 md:space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-4">
              <div className="w-2 h-10 bg-[#8B1A1A] rounded-full" />
              The H.O.T Heartbeat
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-slate-600 dark:text-slate-300 leading-relaxed text-base md:text-lg">
              <p className="font-bold text-slate-900 dark:text-white">
                House of Transformation Ministries (H.O.T) is a dynamic community located in Busia County, Kenya. We are a ministry outreach with deep roots in Nairobi.
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
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-100 space-y-6 hover:border-[#8B1A1A]/30 transition-colors">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Compass size={32} />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Our Mission</h3>
            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed italic">
              "To transform the lives of God's people for spiritual and physical prosperity by preaching the Kingdom of God and those things which concern the Lord Jesus Christ (Acts 28:31)."
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-100 space-y-6 hover:border-[#8B1A1A]/30 transition-colors">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Target size={32} />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Our Vision</h3>
            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed italic">
              "To see the church flourishing and holistically transforming people's lives through the anointed Gospel globally (Matthew 28:19-20)."
            </p>
          </div>
        </div>
      </section>

      {/* 4. BELIEFS (Icon Grid) */}
      <section className="px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-2xl md:rounded-[4rem] p-8 md:p-12 lg:p-20">
            <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-10 md:mb-16">Our Core Beliefs</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {[
                { icon: <ShieldCheck />, text: "The Bible as the inspired, infallible Word of God" },
                { icon: <Cross />, text: "One God in three persons: Father, Son, and Holy Spirit" },
                { icon: <Zap />, text: "Salvation by grace through faith in Jesus Christ" },
                { icon: <Globe />, text: "The transformative power of the Kingdom Gospel (Acts 28:31)" },
                { icon: <Users2 />, text: "The importance of community, fellowship, and good works (Hebrews 10:25)" }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 items-start group">
                  <div className="text-[#8B1A1A] mt-1 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <p className="text-slate-300 font-bold leading-snug text-base md:text-lg">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. HISTORY (Split Narrative) */}
      <section className="px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[3rem] p-8 md:p-12 lg:p-20 shadow-sm border border-slate-100">
            <div className="grid lg:grid-cols-12 gap-10 md:gap-16">
              <div className="lg:col-span-4 space-y-4">
                <History size={40} className="text-[#8B1A1A]" />
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Our History</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">A Legacy of Grace</p>
              </div>
              <div className="lg:col-span-8 space-y-8 md:space-y-12">
                <div className="space-y-4 border-l-4 border-slate-50 pl-6 md:pl-8">
                  <h4 className="text-lg md:text-xl font-black text-[#8B1A1A]">The Birth in Nairobi (1989)</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                    Founded around 1989 as Nairobi Gospel Assembly Church, House of Transformation Ministries began as a place of vibrant worship and community outreach in Nairobi, Kenya.
                  </p>
                </div>
                <div className="space-y-4 border-l-4 border-[#8B1A1A] pl-6 md:pl-8">
                  <h4 className="text-lg md:text-xl font-black text-[#8B1A1A]">Expansion to Busia</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed">
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
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white text-center mb-10 md:mb-16">Our Leadership</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Apostle Aloys A. Rutivi", role: "Founding Pastor", img: churchImages[2].url },
              { name: "Lavern Rutivi", role: "Worship Coordinator", img: churchImages[0].url },
              { name: "The Dedicated Team", role: "Pastors & Volunteers", img: churchImages[1].url }
            ].map((leader, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100 text-center space-y-4">
                <img src={leader.img} className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-2xl md:rounded-3xl object-cover shadow-md" alt={leader.name} />
                <div>
                  <h4 className="text-lg md:text-xl font-black text-slate-900">{leader.name}</h4>
                  <p className="text-[#8B1A1A] font-bold text-[10px] uppercase tracking-widest">{leader.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. JOIN CALL-TO-ACTION */}
      <section className="px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-[3rem] p-8 md:p-12 lg:p-20 shadow-sm border border-slate-100 text-center space-y-8 md:space-y-10">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              Experience the <br /><span className="text-[#8B1A1A] dark:text-[#8B1A1A]">Transformation</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base">
              <div className="flex items-center gap-2"><Clock size={20} className="text-[#8B1A1A]" /> 9:00 AM • 11:00 AM</div>
              <div className="flex items-center gap-2"><MapPin size={20} className="text-[#8B1A1A]" /> Busia Main Campus</div>
            </div>
            <Button variant="secondary" className="bg-[#8B1A1A] text-white rounded-2xl px-10 md:px-12 py-5 md:py-6 font-black uppercase text-sm tracking-[0.2em] shadow-lg shadow-red-900/20">
              <Play size={18} fill="white" className="mr-2" /> Watch Live
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutSection;