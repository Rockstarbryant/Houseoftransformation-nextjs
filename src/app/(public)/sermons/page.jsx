// /app/(public)/sermons/page.jsx - Server Component
import { Plus } from 'lucide-react';
import Button from '@/components/common/Button';
import SermonsClient from '@/components/sermons/SermonsClient';
import { getAllSermons } from '@/lib/sermons';

export const metadata = {
  title: 'Sermons - House of Transformation Church',
  description: 'Biblically-centered messages for your spiritual growth. Watch and read sermons from our pastoral team.',
};

//export const dynamic = 'force-dynamic';
export default async function SermonsPage() {
  // Fetch all sermons on the server
  const allSermons = await getAllSermons();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 dark:text-white transition-colors">
      {/* Static Header - Rendered on Server */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-5%] left-[10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-red-100/40 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />
        </div>

        <div className="max-w-full mx-auto px-4 md:px-6 relative z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 shadow-sm mx-auto md:mx-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Digital Archive</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B1A1A] to-red-500">Word.</span>
              </h1>
              <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto md:mx-0">
                Biblically-centered messages for your spiritual growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Component - Pass sermons as props */}
      <SermonsClient initialSermons={allSermons} />
    </div>
  );
}