import EventList from '@/components/events/EventList';

export const metadata = {
  title: 'Events - House of Transformation Church',
  description: 'Join us for upcoming events and special gatherings',
};

export default function EventsPage() {
  return (
    <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">Upcoming Events</h1>
          <p className="text-xl text-gray-600">Join us for these special gatherings</p>
        </div>
        <EventList />
      </div>
    </div>
  );
}