// components/donations/mobile/MobileAnalyticsDashboard.jsx - PART 1
// Mobile-optimized version of DonationsAnalyticsDashboard
// THIS IS PART 1 - Merge with Part 2

import React, { useState } from 'react';
import { TrendingUp, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

export default function MobileAnalyticsDashboard({ data = null, isLoading = false }) {
  const [expandedSections, setExpandedSections] = useState({
    campaigns: true,
    trend: false,
    methods: false,
    status: false,
    tiers: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDB022]"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
        <p className="text-red-800 dark:text-red-200">No analytics data available</p>
      </div>
    );
  }

  // Extract data with fallbacks
  const campaigns = data.campaigns || [];
  const monthlyTrend = data.monthlyTrend || [];
  const paymentMethodBreakdown = data.paymentMethodBreakdown || [];
  const pledgeStatusBreakdown = data.pledgeStatusBreakdown || [];
  const memberGivingTiers = data.memberGivingTiers || [];
  const kpis = data.kpis || {};

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Raised */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} />
            <p className="text-xs font-medium opacity-90">Total Raised</p>
          </div>
          <p className="text-2xl font-black mb-1">
            {(kpis.totalRaised / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs opacity-90">
            {kpis.goalCompletion?.toFixed(1)}% of goal
          </p>
        </div>

        {/* Active Pledges */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} />
            <p className="text-xs font-medium opacity-90">Pledges</p>
          </div>
          <p className="text-2xl font-black mb-1">{kpis.totalPledges}</p>
          <p className="text-xs opacity-90">
            Avg: {(kpis.averagePledge / 1000).toFixed(0)}K
          </p>
        </div>

        {/* Amount Collected */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} />
            <p className="text-xs font-medium opacity-90">Collected</p>
          </div>
          <p className="text-2xl font-black mb-1">
            {(kpis.totalPaid / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs opacity-90">
            {kpis.collectionRate?.toFixed(1)}% rate
          </p>
        </div>

        {/* Pending Amount */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} />
            <p className="text-xs font-medium opacity-90">Pending</p>
          </div>
          <p className="text-2xl font-black mb-1">
            {(kpis.totalRemaining / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs opacity-90">Outstanding</p>
        </div>
      </div>

      {/* Campaign Performance Section */}
      {campaigns.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => toggleSection('campaigns')}
            className="w-full p-4 flex items-center justify-between"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Campaign Performance
            </h3>
            {expandedSections.campaigns ? (
              <ChevronUp size={20} className="text-slate-500" />
            ) : (
              <ChevronDown size={20} className="text-slate-500" />
            )}
          </button>

          {expandedSections.campaigns && (
            <div className="px-4 pb-4 space-y-3">
              {campaigns.map((campaign, index) => {
                const progress = campaign.goal > 0 
                  ? Math.round((campaign.raised / campaign.goal) * 100) 
                  : 0;

                return (
                  <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {campaign.name}
                      </h4>
                      <span className="text-xs font-bold text-green-600">
                        {progress}%
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                      <span>Goal: KES {(campaign.goal / 1000).toFixed(0)}K</span>
                      <span>Raised: KES {(campaign.raised / 1000).toFixed(0)}K</span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-600"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Monthly Trend - Simple Line Representation */}
      {monthlyTrend.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => toggleSection('trend')}
            className="w-full p-4 flex items-center justify-between"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Monthly Trend
            </h3>
            {expandedSections.trend ? (
              <ChevronUp size={20} className="text-slate-500" />
            ) : (
              <ChevronDown size={20} className="text-slate-500" />
            )}
          </button>

          {expandedSections.trend && (
            <div className="px-4 pb-4">
              {/* Simple bar chart representation */}
              <div className="flex items-end gap-1 h-32 mb-2">
                {monthlyTrend.slice(-6).map((item, index) => {
                  const maxValue = Math.max(...monthlyTrend.map(m => m.pledges || 0));
                  const height = maxValue > 0 ? (item.pledges / maxValue) * 100 : 0;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-green-500 rounded-t" style={{ height: `${height}%` }} />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {item.month?.substring(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 mt-4">
                {monthlyTrend.slice(-3).map((item, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">{item.month}</span>
                    <span className="font-bold text-green-600">
                      KES {(item.pledges / 1000).toFixed(0)}K
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Methods */}
      {paymentMethodBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => toggleSection('methods')}
            className="w-full p-4 flex items-center justify-between"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Payment Methods
            </h3>
            {expandedSections.methods ? (
              <ChevronUp size={20} className="text-slate-500" />
            ) : (
              <ChevronDown size={20} className="text-slate-500" />
            )}
          </button>

          {expandedSections.methods && (
            <div className="px-4 pb-4 space-y-3">
              {paymentMethodBreakdown.map((method, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {method.name}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {method.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full"
                        style={{ 
                          width: `${method.percentage}%`,
                          backgroundColor: colors[index % colors.length]
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      KES {(method.value / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pledge Status */}
      {pledgeStatusBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => toggleSection('status')}
            className="w-full p-4 flex items-center justify-between"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Pledge Status
            </h3>
            {expandedSections.status ? (
              <ChevronUp size={20} className="text-slate-500" />
            ) : (
              <ChevronDown size={20} className="text-slate-500" />
            )}
          </button>

          {expandedSections.status && (
            <div className="px-4 pb-4 space-y-2">
              {pledgeStatusBreakdown.map((status, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {status.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {status.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {status.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Member Giving Tiers */}
      {memberGivingTiers.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => toggleSection('tiers')}
            className="w-full p-4 flex items-center justify-between"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Member Giving Tiers
            </h3>
            {expandedSections.tiers ? (
              <ChevronUp size={20} className="text-slate-500" />
            ) : (
              <ChevronDown size={20} className="text-slate-500" />
            )}
          </button>

          {expandedSections.tiers && (
            <div className="px-4 pb-4 space-y-3">
              {memberGivingTiers.map((tier, index) => {
                const totalMembers = memberGivingTiers.reduce((sum, t) => sum + t.count, 0);
                const percentage = totalMembers > 0 ? (tier.count / totalMembers) * 100 : 0;

                return (
                  <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          {tier.tier}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          KES {(tier.min / 1000).toFixed(0)}K - {(tier.max / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          {tier.count} members
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          KES {(tier.total / 1000).toFixed(0)}K
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Key Insights */}
      {campaigns.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            📊 Key Insights
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-blue-700 dark:text-blue-200 mb-1">
                Strongest Campaign
              </p>
              <p className="text-lg font-black text-blue-900 dark:text-blue-100">
                {campaigns.reduce((best, current) => 
                  (current.raised / current.goal) > (best.raised / best.goal) ? current : best
                ).name}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                {Math.round((campaigns.reduce((best, current) => 
                  (current.raised / current.goal) > (best.raised / best.goal) ? current : best
                ).raised / campaigns.reduce((best, current) => 
                  (current.raised / current.goal) > (best.raised / best.goal) ? current : best
                ).goal) * 100)}% completion
              </p>
            </div>

            {paymentMethodBreakdown.length > 0 && (
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-200 mb-1">
                  Primary Method
                </p>
                <p className="text-lg font-black text-blue-900 dark:text-blue-100">
                  {paymentMethodBreakdown[0].name}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  {paymentMethodBreakdown[0].percentage}% of payments
                </p>
              </div>
            )}

            {pledgeStatusBreakdown.length > 0 && (
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-200 mb-1">
                  Completion Rate
                </p>
                <p className="text-lg font-black text-blue-900 dark:text-blue-100">
                  {Math.round((pledgeStatusBreakdown.find(p => p.name === 'Completed')?.value || 0) / 
                  pledgeStatusBreakdown.reduce((sum, p) => sum + p.value, 0) * 100)}%
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  Member retention
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MERGE INSTRUCTIONS:
// 1. This is PART 2 - append to Part 1
// 2. Part 1 ends at "CONTINUE TO PART 2"
// 3. This code starts right after that comment
// 4. Save as: components/donations/mobile/MobileAnalyticsDashboard.jsx
// ============================================