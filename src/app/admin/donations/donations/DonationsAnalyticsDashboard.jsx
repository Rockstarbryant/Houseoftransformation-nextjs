// src/app/portal/donations/components/DonationsAnalyticsDashboard.jsx
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Target, CheckCircle, AlertCircle, BarChart3, PieChart } from 'lucide-react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDateShort } from '@/utils/donationHelpers';

export default function DonationsAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await donationApi.analytics.getDashboard();

      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError('Failed to load analytics');
      }
    } catch (err) {
      console.error('[ANALYTICS] Error:', err);
      setError(err.message || 'Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
        <AlertCircle className="text-red-600" size={24} />
        <div>
          <h3 className="font-bold text-red-900">Error Loading Analytics</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const kpis = analytics.kpis || {};
  const paymentBreakdown = analytics.paymentMethodBreakdown || [];
  const pledgeStatus = analytics.pledgeStatusBreakdown || [];
  const campaigns = analytics.campaigns || [];
  const memberTiers = analytics.memberGivingTiers || [];

  // ============================================
  // KPI CARDS
  // ============================================

  const KpiCard = ({ icon: Icon, label, value, subtext, trend, color }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            <span className="text-sm font-bold">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-slate-600 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
      {subtext && <p className="text-xs text-slate-500 mt-2">{subtext}</p>}
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="space-y-8">
      {/* KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          icon={TrendingUp}
          label="Total Raised"
          value={formatCurrency(kpis.totalRaised || 0)}
          subtext={`Goal: ${formatCurrency(kpis.totalGoal || 0)}`}
          color="bg-green-600"
        />
        <KpiCard
          icon={Target}
          label="Goal Completion"
          value={`${(kpis.goalCompletion || 0).toFixed(1)}%`}
          subtext="of total campaign goal"
          color="bg-blue-600"
        />
        <KpiCard
          icon={CheckCircle}
          label="Collection Rate"
          value={`${(kpis.collectionRate || 0).toFixed(1)}%`}
          subtext="pledged vs. paid"
          color="bg-purple-600"
        />
        <KpiCard
          icon={Users}
          label="Average Pledge"
          value={formatCurrency(kpis.averagePledge || 0)}
          subtext={`${kpis.totalPledges || 0} total pledges`}
          color="bg-orange-600"
        />
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          
          {/* PAYMENT METHOD BREAKDOWN */}
          {paymentBreakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <PieChart className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Payment Method Distribution</h3>
              </div>

              <div className="space-y-4">
                {paymentBreakdown.map((method, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-700">{method.name}</span>
                      <span className="text-sm font-bold text-slate-900">
                        {method.percentage}% ({formatCurrency(method.value)})
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: `${method.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLEDGE STATUS */}
          {pledgeStatus.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="text-purple-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Pledge Status Distribution</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {pledgeStatus.map((status, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">{status.name}</p>
                    <p className="text-2xl font-bold text-slate-900">{status.value}</p>
                    <p className="text-xs text-slate-500 mt-2">{status.percentage}% of pledges</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* MEMBER GIVING TIERS */}
          {memberTiers.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="text-green-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Member Giving Tiers</h3>
              </div>

              <div className="space-y-3">
                {memberTiers.map((tier, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900">{tier.tier}</span>
                      <span className="text-sm font-bold text-slate-600">{tier.count} members</span>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      Range: {formatCurrency(tier.min)} - {formatCurrency(tier.max)}
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(tier.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOP CAMPAIGNS */}
          {campaigns.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Active Campaigns Performance</h3>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {campaigns.slice(0, 5).map((campaign) => {
                  const progress = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;
                  
                  return (
                    <div key={campaign.id} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900 truncate">{campaign.name}</span>
                        <span className="text-xs font-bold text-slate-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{formatCurrency(campaign.raised)}</span>
                        <span className="font-semibold">{formatCurrency(campaign.goal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MONTHLY TREND SECTION */}
      {analytics.monthlyTrend && analytics.monthlyTrend.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">6-Month Trend</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {analytics.monthlyTrend.map((month, idx) => (
              <div key={idx} className="text-center">
                <p className="text-sm font-semibold text-slate-600 mb-2">{month.month}</p>
                <div className="bg-gradient-to-t from-blue-400 to-blue-600 rounded-lg p-4 mb-2 relative h-24 flex items-end justify-center">
                  <div className="text-white text-xs font-bold text-center">
                    {formatCurrency(month.payments)}
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  <strong className="text-slate-700">{month.pledges}</strong> pledges
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}