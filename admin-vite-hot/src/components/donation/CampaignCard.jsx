// src/components/donation/CampaignCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Users, Target } from 'lucide-react';
import Card from '../common/Card';


const CampaignCard = ({ campaign, onPledge }) => {
  if (!campaign) return null;

  const progressPercent = campaign.goalAmount 
    ? (campaign.totalRaised / campaign.goalAmount) * 100 
    : 0;

  const daysLeft = Math.ceil(
    (new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const isActive = campaign.status === 'active';
  const isEnded = daysLeft <= 0;

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
      {/* Campaign Image / Header */}
      <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 h-40 flex items-center justify-center">
        <Heart className="text-white opacity-30" size={80} />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isActive ? 'Active' : campaign.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Campaign Content */}
      <div className="p-5 flex-grow flex flex-col">
        {/* Campaign Title & Type */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
              {campaign.name}
            </h3>
          </div>
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
            {campaign.type?.toUpperCase() || 'CAMPAIGN'}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm line-clamp-2 mb-4">
          {campaign.description}
        </p>

        {/* Impact Statement */}
        {campaign.impactStatement && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4 border-l-4 border-blue-600">
            <p className="text-sm text-gray-700 italic">
              💡 {campaign.impactStatement}
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              KES {(campaign.totalRaised || 0).toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">
              of KES {(campaign.goalAmount || 0).toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-600 h-2.5 rounded-full transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {Math.round(progressPercent)}% of goal reached
          </p>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} className="text-orange-600" />
            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={16} className="text-purple-600" />
            <span>{campaign.totalPledges || 0} pledges</span>
          </div>
        </div>

        {/* CTA Button */}
        {isActive && !isEnded ? (
          <Link
            to={`/donations/pledge/${campaign._id}`}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-bold hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
          >
            <Heart size={18} />
            Make a Pledge
          </Link>
        ) : (
          <button
            disabled
            className="w-full bg-gray-300 text-gray-600 py-2.5 rounded-lg font-bold cursor-not-allowed"
          >
            Campaign Ended
          </button>
        )}
      </div>
    </Card>
  );
};

export default CampaignCard;