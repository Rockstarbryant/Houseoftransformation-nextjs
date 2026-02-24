//'use client';

import Link from 'next/link';
import ServiceAreaCard from '@/components/serviceAreas/ServiceAreaCard';
import { serviceAreasData } from '@/data/serviceAreas';

export const metadata = {
  title: 'Service Areas - House of Transformation Church',
  description: 'Discover how you can serve in our church ministries',
};

export default function ServiceAreasPage() {
  return (
    <div className="pt-20 pb-20 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          
          <h1 className="text-5xl font-bold text-blue-900 dark:text-white mb-4">Service Areas & Teams</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover how you can use your God-given talents to serve and make a meaningful impact in our community
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {serviceAreasData.map((area, index) => (
            <ServiceAreaCard key={index} {...area} />
          ))}
        </div>

        <div className="mt-20 bg-blue-900 dark:bg-blue-800 rounded-2xl p-12 md:p-16 text-center text-white shadow-lg">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Are you willing to Serve?</h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community of passionate volunteers and use your God-given talents to make a meaningful impact.
          </p>
          <Link
            href="/volunteer"
            className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 text-lg"
          >
            Apply to our Volunteer Opportunities
          </Link>
        </div>
      </div>
    </div>
  );
}