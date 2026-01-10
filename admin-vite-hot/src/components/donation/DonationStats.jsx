// src/components/donation/DonationStats.jsx
import React from 'react';
import { TrendingUp, Target, Users, Heart, AlertCircle, Zap, Award } from 'lucide-react';
import Card from '../common/Card';
import { formatKES } from '../../utils/donationHelpers';

const DonationStats = ({ stats, variant = 'member', loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 font-semibold">No statistics available</p>
      </Card>
    );
  }

  // Member Dashboard Stats
  const memberStats = [
    {
      icon: Heart,
      label: 'Total Pledged',
      value: formatKES(stats.totalPledged || 0),
      subtext: `${stats.activeCampaigns || 0} active campaigns`,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      accentGradient: 'from-red-500 to-pink-600'
    },
    {
      icon: TrendingUp,
      label: 'Amount Paid',
      value: formatKES(stats.totalPaid || 0),
      subtext: stats.totalPledged ? `${Math.round((stats.totalPaid / stats.totalPledged) * 100)}% completed` : '0% completed',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      accentGradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: AlertCircle,
      label: 'Remaining',
      value: formatKES(stats.totalRemaining || 0),
      subtext: 'Balance due',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      accentGradient: 'from-orange-500 to-red-600'
    },
    {
      icon: Target,
      label: 'Completed Pledges',
      value: stats.completedPledges || 0,
      subtext: `${stats.pendingPledges || 0} still pending`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      accentGradient: 'from-blue-500 to-indigo-600'
    }
  ];

  // Admin Dashboard Stats
  const adminStats = [
    {
      icon: TrendingUp,
      label: 'Total Raised',
      value: formatKES(stats.totalRaised || 0),
      subtext: `${stats.successfulPayments || 0} successful payments`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      accentGradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: Target,
      label: 'Campaign Goal',
      value: formatKES(stats.totalGoal || 0),
      subtext: stats.totalGoal ? `${Math.round((stats.totalRaised / (stats.totalGoal || 1)) * 100)}% of goal reached` : '0% reached',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      accentGradient: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Users,
      label: 'Active Campaigns',
      value: stats.activeCampaigns || 0,
      subtext: `of ${stats.totalCampaigns || 0} total campaigns`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-300',
      accentGradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Heart,
      label: 'Total Pledges',
      value: stats.totalPledges || 0,
      subtext: `${stats.successfulPayments || 0} payments processed`,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      accentGradient: 'from-red-500 to-pink-600'
    }
  ];

  const displayStats = variant === 'admin' ? adminStats : memberStats;

  return (
    <>
      {/* Title Section */}
      {variant === 'member' ? (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-3 mb-2">
            <Zap className="text-yellow-500" size={32} />
            Your Giving Summary
          </h2>
          <p className="text-gray-600">Track your pledges and contributions at a glance</p>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-3 mb-2">
            <Award className="text-blue-600" size={32} />
            Donation Analytics
          </h2>
          <p className="text-gray-600">Overview of all campaigns and donations</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={idx} 
              className={`border-l-4 ${stat.borderColor} hover:shadow-lg transition-all transform hover:-translate-y-1`}
            >
              {/* Header with Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-grow">
                  <p className="text-gray-600 text-sm font-semibold mb-2">{stat.label}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>

              {/* Main Value */}
              <div className="mb-4">
                <p className="text-3xl font-bold text-gray-900 break-words">
                  {stat.value}
                </p>
              </div>

              {/* Mini Progress (if applicable) */}
              {idx < 3 && (
                <div className="mb-3">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stat.accentGradient}`}
                      style={{ 
                        width: variant === 'member' && idx === 0 
                          ? Math.min((stats.totalPaid / (stats.totalPledged || 1)) * 100, 100) + '%'
                          : variant === 'admin' && idx === 1
                          ? Math.min((stats.totalRaised / (stats.totalGoal || 1)) * 100, 100) + '%'
                          : Math.random() * 100 + '%'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Subtext */}
              <p className="text-xs text-gray-600 font-semibold">{stat.subtext}</p>
            </Card>
          );
        })}
      </div>

      {/* Summary Section */}
      {variant === 'member' && stats.totalPledged > 0 && (
        <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="text-yellow-500" size={24} />
            Your Impact
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((stats.totalPaid / stats.totalPledged) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Campaigns Joined</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.activeCampaigns || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Pledges</p>
              <p className="text-2xl font-bold text-green-600">
                {(stats.activeCampaigns || 0) + (stats.pendingPledges || 0)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {variant === 'admin' && stats.totalGoal > 0 && (
        <Card className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="text-yellow-500" size={24} />
            Campaign Performance
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Overall Progress</p>
                <p className="text-sm font-bold text-green-600">
                  {Math.round((stats.totalRaised / (stats.totalGoal || 1)) * 100)}%
                </p>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-600"
                  style={{ width: Math.min((stats.totalRaised / (stats.totalGoal || 1)) * 100, 100) + '%' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Goal</p>
                <p className="font-bold text-gray-900">{formatKES(stats.totalGoal || 0)}</p>
              </div>
              <div>
                <p className="text-gray-600">Raised</p>
                <p className="font-bold text-green-600">{formatKES(stats.totalRaised || 0)}</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default DonationStats;