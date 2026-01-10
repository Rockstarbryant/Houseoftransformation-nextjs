import React from 'react';
import { AlertCircle, Lock } from 'lucide-react';

const PermissionAlert = ({ 
  title = 'Permission Denied',
  message = 'You do not have permission to perform this action.',
  requiredRole,
  currentRole,
  actionType = 'action'
}) => {
  const roleDisplay = {
    member: 'Member',
    volunteer: 'Volunteer',
    usher: 'Usher',
    worship_team: 'Worship Team Member',
    pastor: 'Pastor',
    bishop: 'Bishop',
    admin: 'Administrator'
  };

  return (
    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg flex gap-3">
      <Lock className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
      <div className="flex-grow">
        <h3 className="font-bold text-yellow-800 mb-1">{title}</h3>
        <p className="text-yellow-700 text-sm mb-2">{message}</p>
        {requiredRole && (
          <p className="text-xs text-yellow-600">
            This {actionType} requires: <span className="font-semibold">{roleDisplay[requiredRole]}</span>
            {currentRole && ` (Your role: ${roleDisplay[currentRole]})`}
          </p>
        )}
      </div>
    </div>
  );
};

export default PermissionAlert;