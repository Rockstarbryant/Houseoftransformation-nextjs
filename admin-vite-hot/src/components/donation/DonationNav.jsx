// src/components/donation/DonationNav.jsx
import React from 'react';
import { Filter, Download, Plus } from 'lucide-react';

const DonationNav = ({ 
  activeTab, 
  onTabChange, 
  onFilter, 
  onExport, 
  showCreateBtn = false,
  onCreateClick 
}) => {
  const tabs = [
    { id: 'campaigns', label: 'Active Campaigns', icon: '📋' },
    { id: 'pledges', label: 'My Pledges', icon: '💝' },
    { id: 'payments', label: 'Payment History', icon: '💳' }
  ];

  const filters = [
    { value: '', label: 'All Campaigns' },
    { value: 'active', label: 'Active Only' },
    { value: 'completed', label: 'Completed' },
    { value: 'ending-soon', label: 'Ending Soon' }
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Filter */}
          {activeTab === 'campaigns' && (
            <select
              onChange={(e) => onFilter?.(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              {filters.map(f => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          )}

          {/* Export Button */}
          {(activeTab === 'pledges' || activeTab === 'payments') && (
            <button
              onClick={() => onExport?.()}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold text-sm"
            >
              <Download size={16} />
              Export
            </button>
          )}

          {/* Create Button */}
          {showCreateBtn && (
            <button
              onClick={() => onCreateClick?.()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
            >
              <Plus size={16} />
              New Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationNav;