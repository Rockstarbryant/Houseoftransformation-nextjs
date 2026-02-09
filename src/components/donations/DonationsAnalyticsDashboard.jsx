// src/components/donations/DonationsAnalyticsDashboard.jsx - REDESIGNED
'use client';

import { TrendingUp, TrendingDown, Users, Target, CheckCircle, AlertCircle, BarChart3, PieChart, DollarSign, Activity } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/utils/donationHelpers';

export default function DonationsAnalyticsDashboard({ data }) {
  if (!data) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 text-center">
        <AlertCircle className="mx-auto mb-3 text-yellow-600 dark:text-yellow-400" size={48} />
        <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">No analytics data available</p>
      </div>
    );
  }

  const kpis = data.kpis || {};
  const paymentBreakdown = data.paymentMethodBreakdown || [];
  const pledgeStatus = data.pledgeStatusBreakdown || [];
  const campaigns = data.campaigns || [];
  const memberTiers = data.memberGivingTiers || [];
  const monthlyTrend = data.monthlyTrend || [];

  // KPI Card Component
  const KpiCard = ({ icon: Icon, label, value, subtext, trend, gradientFrom, gradientTo, iconColor }) => (
    <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900/50 shadow-lg`}>
          <Icon className={iconColor} size={24} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${trend > 0 ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'}`}>
            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="text-xs font-black">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{value}</h3>
      {subtext && <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{subtext}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Total Raised"
          value={formatCurrency(kpis.totalRaised || 0)}
          subtext={`Goal: ${formatCurrency(kpis.totalGoal || 0)}`}
          gradientFrom="from-emerald-50"
          gradientTo="to-green-50 dark:from-emerald-950/30 dark:to-green-950/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          icon={Target}
          label="Goal Completion"
          value={`${(kpis.goalCompletion || 0).toFixed(1)}%`}
          subtext="of total campaign goal"
          gradientFrom="from-blue-50"
          gradientTo="to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <KpiCard
          icon={CheckCircle}
          label="Collection Rate"
          value={`${(kpis.collectionRate || 0).toFixed(1)}%`}
          subtext="pledged vs. paid"
          gradientFrom="from-purple-50"
          gradientTo="to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <KpiCard
          icon={Users}
          label="Average Pledge"
          value={formatCurrency(kpis.averagePledge || 0)}
          subtext={`${kpis.totalPledges || 0} total pledges`}
          gradientFrom="from-amber-50"
          gradientTo="to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          
          {/* Payment Method Breakdown */}
          {paymentBreakdown.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-950/50 rounded-xl">
                  <PieChart className="text-blue-600 dark:text-blue-400" size={22} />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Payment Methods</h3>
              </div>

              <div className="space-y-4">
                {paymentBreakdown.map((method, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{method.name}</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {method.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-cyan-600"
                        style={{ width: `${method.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                      {formatCurrency(method.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pledge Status Distribution */}
          {pledgeStatus.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-950/50 rounded-xl">
                  <BarChart3 className="text-purple-600 dark:text-purple-400" size={22} />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Pledge Status</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {pledgeStatus.map((status, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase">{status.name}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">{status.value}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${status.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{status.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Member Giving Tiers */}
          {memberTiers.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl">
                  <Users className="text-emerald-600 dark:text-emerald-400" size={22} />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Giving Tiers</h3>
              </div>

              <div className="space-y-3">
                {memberTiers.map((tier, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-slate-900 dark:text-white">{tier.tier}</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                        {tier.count} members
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      {formatCurrency(tier.min)} - {formatCurrency(tier.max)}
                    </div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(tier.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Campaigns */}
          {campaigns.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-rose-100 dark:bg-rose-950/50 rounded-xl">
                  <Activity className="text-rose-600 dark:text-rose-400" size={22} />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Campaign Performance</h3>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                {campaigns.slice(0, 5).map((campaign) => {
                  const progress = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;
                  
                  return (
                    <div key={campaign.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-slate-900 dark:text-white truncate flex-1">{campaign.name}</span>
                        <span className="text-xs font-black text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-lg ml-2">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(campaign.raised)}</span>
                        <span className="font-bold text-slate-600 dark:text-slate-400">of {formatCurrency(campaign.goal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend Section */}
      {monthlyTrend && monthlyTrend.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl">
              <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={22} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">6-Month Payment Trend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {monthlyTrend.map((month, idx) => {
              // Calculate height based on max value
              const maxPayment = Math.max(...monthlyTrend.map(m => m.payments));
              const heightPercent = maxPayment > 0 ? (month.payments / maxPayment) * 100 : 0;
              
              return (
                <div key={idx} className="text-center group">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3">{month.month}</p>
                  <div className="bg-gradient-to-t from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-xl p-1 mb-3 relative h-32 flex items-end justify-center border border-slate-200 dark:border-slate-700">
                    <div 
                      className="bg-gradient-to-t from-indigo-500 to-purple-500 rounded-lg transition-all duration-500 w-full flex items-center justify-center group-hover:from-indigo-600 group-hover:to-purple-600"
                      style={{ height: `${heightPercent}%`, minHeight: '20%' }}
                    >
                      <div className="text-white text-xs font-black text-center px-2 py-1">
                        {formatCurrency(month.payments).replace('KES ', '')}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-900 dark:text-white">{month.pledges}</strong> pledges
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Total Campaigns</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{campaigns.length}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Active Members</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {memberTiers.reduce((sum, tier) => sum + tier.count, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Collection Efficiency</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {(kpis.collectionRate || 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}