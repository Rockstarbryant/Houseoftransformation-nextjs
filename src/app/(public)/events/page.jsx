import EventList from '@/components/events/EventList';

export const metadata = {
  title: 'Events - House of Transformation Church',
  description: 'Join us for upcoming events and special gatherings',
};

export default function EventsPage() {
  return (
    <div className="pt-24 pb-24 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section: High-Contrast & Bold */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[2px] w-12 bg-red-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">
              Deployment Schedule
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 uppercase tracking-tighter leading-[0.85] mb-6">
            Upcoming <br /> 
            <span className="text-red-600">Events</span>
          </h1>
          
          <p className="max-w-xl text-slate-500 font-bold text-lg uppercase tracking-tight">
            Strategic gatherings designed for <span className="text-slate-900">spiritual acceleration</span> and community impact.
          </p>
        </div>

        {/* Logic Preserved: Calling the EventList component */}
        <EventList />
        
      </div>
    </div>
  );
}