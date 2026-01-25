import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Eye } from 'lucide-react';

export default function DonationsAnalyticsDashboard({ data = null, isLoading = false }) {
  const [chartVisibility, setChartVisibility] = useState({
    fundraisingTrend: true,
    campaignPerformance: true,
    paymentMethods: true,
    pledgeStatus: true,
    memberGiving: true
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
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

  const toggleChartVisibility = (chartName) => {
    setChartVisibility(prev => ({
      ...prev,
      [chartName]: !prev[chartName]
    }));
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Raised */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold opacity-90">Total Raised</p>
            <TrendingUp size={20} className="opacity-70" />
          </div>
          <p className="text-3xl font-black mb-2">
            KES {(kpis.totalRaised / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm opacity-90">
            {kpis.goalCompletion?.toFixed(1)}% of goal
          </p>
        </div>

        {/* Active Pledges */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold opacity-90">Active Pledges</p>
            <TrendingUp size={20} className="opacity-70" />
          </div>
          <p className="text-3xl font-black mb-2">
            {kpis.totalPledges}
          </p>
          <p className="text-sm opacity-90">
            Avg: KES {(kpis.averagePledge / 1000).toFixed(0)}K per pledge
          </p>
        </div>

        {/* Amount Collected */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold opacity-90">Amount Collected</p>
            <TrendingUp size={20} className="opacity-70" />
          </div>
          <p className="text-3xl font-black mb-2">
            KES {(kpis.totalPaid / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm opacity-90">
            {kpis.collectionRate?.toFixed(1)}% collection rate
          </p>
        </div>

        {/* Pending Amount */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold opacity-90">Pending Amount</p>
            <TrendingUp size={20} className="opacity-70" />
          </div>
          <p className="text-3xl font-black mb-2">
            KES {(kpis.totalRemaining / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm opacity-90">
            Outstanding pledges
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fundraising Trend */}
        {chartVisibility.fundraisingTrend && monthlyTrend.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fundraising Trend</h3>
              <button
                onClick={() => toggleChartVisibility('fundraisingTrend')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Eye size={16} className="text-slate-500" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => `KES ${(value / 1000000).toFixed(1)}M`}
                />
                <Legend />
                <Line type="monotone" dataKey="pledges" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="payments" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                {monthlyTrend[0]?.target && <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Campaign Performance */}
        {chartVisibility.campaignPerformance && campaigns.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Campaign Performance</h3>
              <button
                onClick={() => toggleChartVisibility('campaignPerformance')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Eye size={16} className="text-slate-500" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaigns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => `KES ${(value / 1000000).toFixed(1)}M`}
                />
                <Legend />
                <Bar dataKey="goal" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                <Bar dataKey="raised" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Payment Methods Breakdown */}
        {chartVisibility.paymentMethods && paymentMethodBreakdown.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment Methods</h3>
              <button
                onClick={() => toggleChartVisibility('paymentMethods')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Eye size={16} className="text-slate-500" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `KES ${(value / 1000000).toFixed(1)}M`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 space-y-2">
              {paymentMethodBreakdown.map((method, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }}></div>
                    {method.name}
                  </span>
                  <span className="font-bold">KES {(method.value / 1000000).toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pledge Status Distribution */}
        {chartVisibility.pledgeStatus && pledgeStatusBreakdown.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pledge Status Distribution</h3>
              <button
                onClick={() => toggleChartVisibility('pledgeStatus')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Eye size={16} className="text-slate-500" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pledgeStatusBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pledgeStatusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Member Giving Tiers */}
        {chartVisibility.memberGiving && memberGivingTiers.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Member Giving Tiers</h3>
              <button
                onClick={() => toggleChartVisibility('memberGiving')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Eye size={16} className="text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {memberGivingTiers.map((tier, index) => {
                const totalMembers = memberGivingTiers.reduce((sum, t) => sum + t.count, 0);
                const percentage = totalMembers > 0 ? (tier.count / totalMembers) * 100 : 0;
                
                return (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{tier.tier}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          KES {(tier.min / 1000).toFixed(0)}K - {(tier.max / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900 dark:text-white">{tier.count} members</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          KES {(tier.total / 1000000).toFixed(1)}M total
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Key Insights */}
      {campaigns.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">📊 Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-200 mb-2">Strongest Campaign</p>
              <p className="text-2xl font-black text-blue-900 dark:text-blue-100">
                {campaigns.reduce((best, current) => 
                  (current.raised / current.goal) > (best.raised / best.goal) ? current : best
                ).name}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                {Math.round((campaigns.reduce((best, current) => 
                  (current.raised / current.goal) > (best.raised / best.goal) ? current : best
                ).raised / campaigns.reduce((best, current) => 
                  (current.raised / current.goal) > (best.raised / best.goal) ? current : best
                ).goal) * 100)}% completion
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-200 mb-2">Primary Payment Method</p>
              <p className="text-2xl font-black text-blue-900 dark:text-blue-100">
                {paymentMethodBreakdown.length > 0 ? `${paymentMethodBreakdown[0].name} (${paymentMethodBreakdown[0].percentage}%)` : 'N/A'}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">Most popular payment channel</p>
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-200 mb-2">Member Retention</p>
              <p className="text-2xl font-black text-blue-900 dark:text-blue-100">
                {pledgeStatusBreakdown.length > 0 ? 
                  Math.round((pledgeStatusBreakdown.find(p => p.name === 'Completed')?.value || 0) / 
                  pledgeStatusBreakdown.reduce((sum, p) => sum + p.value, 0) * 100) 
                  : 0}%
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">Completed pledges ratio</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}