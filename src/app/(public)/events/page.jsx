import EventList from '@/components/events/EventList';

export const metadata = {
  title: 'Events - House of Transformation Church',
  description: 'Join us for upcoming events and special gatherings',
};
export const revalidate = 3600; // revalidate every 3600 seconds (1 hour)
export default function EventsPage() {
  return (
    <div className="pt-24 pb-24 bg-[#F8FAFC] dark:bg-slate-900 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section: High-Contrast & Bold */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[2px] w-12 bg-red-600" />
            <span className="text-[10px] dark:text-slate-100 font-black uppercase tracking-[0.4em] text-slate-900">
              Events Schedule
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.85] mb-6">
            Upcoming Busia <br /> 
            <span className="text-red-600 dark:text-red-600">H.O.T Events</span>
          </h1>
          
          <p className="max-w-xl text-slate-500 dark:text-slate-400 font-bold text-lg uppercase tracking-tight">
            Strategic gatherings designed for <span className="text-slate-900 dark:text-white">spiritual acceleration</span> and community impact.
          </p>
        </div>

        {/* Logic Preserved: Calling the EventList component */}
        <EventList />
        
      </div>
    </div>
  );
}