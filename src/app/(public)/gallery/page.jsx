// /app/(public)/gallery/page.jsx
import GalleryClient from '@/components/gallery/GalleryClient';
import { getAllPhotos } from '@/lib/gallery';

export const metadata = {
  title: 'Photo Gallery - House of Transformation Church',
  description: 'Browse photos from our services, events, and community gatherings.',
};
//export const revalidate = 3600; // revalidate every 3600 seconds (1 hour)
export const dynamic = 'force-dynamic';
export default async function GalleryPage() {
  // Fetch photos on server
  const photos = await getAllPhotos();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 dark:text-white transition-colors relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,_rgba(139,26,26,0.03)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative pt-20 md:pt-24 lg:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          
          {/* Static Header */}
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-block px-4 py-1.5 bg-red-50 dark:bg-red-50 rounded-full mb-4">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#8B1A1A] dark:text-red-400">
                The Vision in Pictures
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
              Busia <span className="text-[#8B1A1A]">H.O.T Gallery</span>
            </h1>
            <p className="text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              Capturing memories, moments, and milestones from our church family at Busia House of Transformation.
            </p>
          </div>

          {/* Client Component */}
          <GalleryClient initialPhotos={photos} />
        </div>
      </div>
    </div>
  );
}