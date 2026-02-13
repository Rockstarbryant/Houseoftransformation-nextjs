// /app/(public)/sermons/page.jsx - Server Component
// ✅ SEO ENHANCED VERSION - Zero UI changes, only structured data additions
import { Plus } from 'lucide-react';
import Button from '@/components/common/Button';
import SermonsClient from '@/components/sermons/SermonsClient';
import { getAllSermons } from '@/lib/sermons';

// Existing metadata - UNCHANGED
export const metadata = {
  title: 'Sermons - House of Transformation Church',
  description: 'Biblically-centered messages for your spiritual growth. Watch and read sermons from our pastoral team.',
};

export default async function SermonsPage() {
  // Fetch all sermons on the server
  const allSermons = await getAllSermons();

  // SEO ADDITION START: Generate ItemList structured data for sermon archive
  const sermonListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Church Sermons Archive",
    "description": "Biblically-centered teachings and messages from House of Transformation Church",
    "url": "https://houseoftransformation-nextjs.vercel.app/sermons",
    "numberOfItems": allSermons.length,
    "itemListElement": allSermons.slice(0, 20).map((sermon, index) => {
      const baseItem = {
        "@type": "ListItem",
        "position": index + 1,
        "name": sermon.title,
      };

      // Determine sermon type and add appropriate schema
      if (sermon.videoUrl) {
        return {
          ...baseItem,
          "item": {
            "@type": "VideoObject",
            "name": sermon.title,
            "description": sermon.description || sermon.descriptionHtml?.substring(0, 160) || "",
            "datePublished": sermon.date,
            "contentUrl": sermon.videoUrl,
            "thumbnailUrl": sermon.thumbnail || "",
            "uploadDate": sermon.date,
            "author": {
              "@type": "Person",
              "name": sermon.pastor || "Pastor"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Busia House of Transformation",
              "logo": {
                "@type": "ImageObject",
                "url": "https://res.cloudinary.com/dcu8uuzrs/image/upload/v1768913903/church-gallery/tql6mjtmman1gxlzl91e.jpg"
              }
            }
          }
        };
      } else {
        // Text or Photo sermon - use Article schema
        return {
          ...baseItem,
          "item": {
            "@type": "Article",
            "headline": sermon.title,
            "description": sermon.description || sermon.descriptionHtml?.substring(0, 160) || "",
            "datePublished": sermon.date,
            "author": {
              "@type": "Person",
              "name": sermon.pastor || "Pastor"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Busia House of Transformation",
              "logo": {
                "@type": "ImageObject",
                "url": "https://res.cloudinary.com/dcu8uuzrs/image/upload/v1768913903/church-gallery/tql6mjtmman1gxlzl91e.jpg"
              }
            },
            ...(sermon.thumbnail && {
              "image": sermon.thumbnail
            })
          }
        };
      }
    })
  };
  // SEO ADDITION END

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 dark:text-white transition-colors">
      {/* SEO ADDITION START: Inject structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sermonListSchema) }}
      />
      {/* SEO ADDITION END */}
      
      {/* Static Header - Rendered on Server - UNCHANGED */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-5%] left-[10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-red-100/40 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />
        </div>

        <div className="max-w-full mx-auto px-4 md:px-6 relative z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B1A1A] to-red-500">Word.</span>
              </h1>
              <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto md:mx-0">
                Biblically-centered teachings for your spiritual growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Component - Pass sermons as props - UNCHANGED */}
      <SermonsClient initialSermons={allSermons} />
    </div>
  );
}