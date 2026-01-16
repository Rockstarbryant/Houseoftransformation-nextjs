import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import VolunteerApplicationsAdmin from './VolunteerApplicationsAdmin';

const ManageVolunteers = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 font-semibold mb-4 transition"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        
        <div className="flex items-center gap-3 mb-2">
          <UserPlus size={40} className="text-blue-900" />
          <h1 className="text-4xl font-bold text-blue-900">Volunteer Applications</h1>
        </div>
        <p className="text-gray-600">Review and manage volunteer applications for ministry positions</p>
      </div>

      {/* Main Content */}
      <VolunteerApplicationsAdmin />
    </div>
  );
};

export default ManageVolunteers;