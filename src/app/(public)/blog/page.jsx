// /app/(public)/blog/page.jsx
// ✅ FIXED VERSION - Resolves async Client Component error
import { Newspaper } from 'lucide-react';
import BlogPageClient from '@/components/blog/BlogPageClient';
import { getAllBlogs } from '@/lib/blog';

// SEO metadata - UNCHANGED
export const metadata = {
  title: 'Church News & Articles - House of Transformation Busia',
  description: 'Stay updated with the latest news, testimonies, teachings, and events from House of Transformation Church in Busia, Kenya. Read inspiring stories of faith and community impact.',
  keywords: [
    'church news Busia',
    'HOT church blog',
    'Christian testimonies Kenya',
    'church events Busia',
    'House of Transformation articles',
    'Busia church updates',
    'Christian teachings Kenya'
  ],
  openGraph: {
    title: 'Church News & Articles - House of Transformation',
    description: 'Latest updates, testimonies, and teachings from our church community in Busia, Kenya',
    type: 'website',
    url: 'https://houseoftransformation-nextjs.vercel.app/blog',
    siteName: 'Busia House of Transformation',
    images: [
      {
        url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767444965/WhatsApp_Image_2026-01-03_at_15.54.45_mpogon.jpg',
        width: 1200,
        height: 630,
        alt: 'House of Transformation Church Blog',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Church News & Articles - House of Transformation',
    description: 'Latest updates, testimonies, and teachings from our church community',
  },
  alternates: {
    canonical: 'https://houseoftransformation-nextjs.vercel.app/blog',
  },
};

// ✅ FIX: This is a Server Component - it can be async
export default async function BlogPage() {
  // Fetch all blogs on server
  let blogs = [];
  
  try {
    blogs = await getAllBlogs();
  } catch (error) {
    console.error('Error fetching blogs:', error);
    // Return empty array on error - page will still render
    blogs = [];
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 relative">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Church News & Articles",
            "description": "Latest news, testimonies, and teachings from House of Transformation Church",
            "url": "https://houseoftransformation-nextjs.vercel.app/blog",
            "publisher": {
              "@type": "Organization",
              "name": "Busia House of Transformation",
              "url": "https://houseoftransformation-nextjs.vercel.app"
            },
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": blogs.length,
              "itemListElement": blogs.slice(0, 10).map((blog, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://houseoftransformation-nextjs.vercel.app/blog/${blog._id}`
              }))
            }
          })
        }}
      />

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