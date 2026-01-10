import React from 'react';
import Card from '../common/Card';

const AnalyticsCard = ({ title, value, change, icon }) => {
  const isPositive = change.startsWith('+');
  
  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-600">{title}</p>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-blue-900">{value}</p>
      <p className={`text-sm mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {change} from last month
      </p>
    </Card>
  );
};

export default AnalyticsCard;