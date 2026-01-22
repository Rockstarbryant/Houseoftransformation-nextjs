'use client';

import React from 'react';

const QuickActions = ({ onSelect }) => {
  const actions = [
    'Service times',
    'Location',
    'Ministries',
    'Contact us',
    'Events'
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(action)}
          className="px-2 sm:px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-full transition"
        >
          {action}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;