// /app/(public)/blog/page.jsx
import { Newspaper } from 'lucide-react';
import BlogPageClient from '@/components/blog/BlogPageClient';
import { getAllBlogs } from '@/lib/blog';

export const metadata = {
  title: 'Church News - House of Transformation',
  description: 'Stay updated with the latest news, announcements, and stories from our church community.',
};

export default async function BlogPage() {
  // Fetch all blogs on server
  const blogs = await getAllBlogs();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 relative">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-full h-[600px] bg-[radial-gradient(circle_at_top_right,_rgba(139,26,26,0.02)_0%,_transparent_50%)] pointer-events-none" />

      <div className="relative pt-24 md:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Static Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8B1A1A]/5 rounded-full mb-4">
                <Newspaper size={14} className="text-[#8B1A1A]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B1A1A]">Insight Feed</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-6">
                Church <span className="text-[#8B1A1A]">News</span>
              </h1>
            </div>
          </div>

          {/* Client Component - Handles all interactions */}
          <BlogPageClient initialBlogs={blogs} />
        </div>
      </div>
    </div>
  );
}