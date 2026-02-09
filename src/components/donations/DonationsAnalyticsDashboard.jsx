// src/components/donations/DonationsAnalyticsDashboard.jsx - FULLY COMPREHENSIVE
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, TrendingDown, Users, Target, CheckCircle, AlertCircle, 
  BarChart3, PieChart, DollarSign, Activity, Clock, Calendar,
  Award, AlertTriangle, Zap, ArrowUp, ArrowDown, Eye, RefreshCw,
  Percent, Timer, TrendingDown as Decline, Package, Star
} from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/utils/donationHelpers';
import { donationApi } from '@/services/api/donationService';

export default function DonationsAnalyticsDashboard({ data: propData }) {
  const [timeframe, setTimeframe] = useState('all');
  const [selectedSection, setSelectedSection] = useState('overview'); // overview, pledges, campaigns, contributors

  // Fetch ALL data
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await donationApi.campaigns.getAll();
      return response.success ? (response.campaigns || []) : [];
    },
    staleTime: 30000,
  });

  const { data: allPledges = [] } = useQuery({
    queryKey: ['allPledges'],
    queryFn: async () => {
      const response = await donationApi.pledges.getAllPledges(1, 10000);
      return response.success ? (response.pledges || []) : [];
    },
    staleTime: 30000,
  });

  const { data: allContributions = [] } = useQuery({
    queryKey: ['contributions'],
    queryFn: async () => {
      const response = await donationApi.contributions.getAll({ limit: 10000 });
      return response.success ? (response.contributions || []) : [];
    },
    staleTime: 30000,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await donationApi.payments.getAll({ limit: 10000 });
      return response.success ? (response.payments || []) : [];
    },
    staleTime: 30000,
  });

  // COMPREHENSIVE ANALYTICS CALCULATION
  const analytics = useMemo(() => {
    if (!campaigns.length && !allPledges.length && !allContributions.length) {
      return null;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ==================== CORE METRICS ====================
    const verifiedContributions = allContributions.filter(c => c.status === 'verified');
    const successfulPayments = payments.filter(p => p.status === 'success');

    const totalFromPledges = allPledges.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
    const totalFromContributions = verifiedContributions.reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalRevenue = totalFromPledges + totalFromContributions;

    const totalPledged = allPledges.reduce((sum, p) => sum + (p.pledged_amount || 0), 0);
    const totalPaidFromPledges = allPledges.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
    const totalOutstanding = totalPledged - totalPaidFromPledges;

    // ==================== UNIQUE CONTRIBUTORS ====================
    const uniqueContributorsSet = new Set();
    allPledges.forEach(p => {
      if (p.member_email) uniqueContributorsSet.add(p.member_email);
      else if (p.member_name) uniqueContributorsSet.add(p.member_name);
    });
    verifiedContributions.forEach(c => {
      if (!c.is_anonymous) {
        if (c.contributor_email) uniqueContributorsSet.add(c.contributor_email);
        else if (c.contributor_name) uniqueContributorsSet.add(c.contributor_name);
      }
    });
    const uniqueContributors = uniqueContributorsSet.size;

    // ==================== CAMPAIGN METRICS ====================
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const completedCampaigns = campaigns.filter(c => c.status === 'completed');
    const draftCampaigns = campaigns.filter(c => c.status === 'draft');
    const archivedCampaigns = campaigns.filter(c => c.status === 'archived');

    const totalGoal = campaigns.reduce((sum, c) => sum + (c.goalAmount || 0), 0);
    const totalRaised = campaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
    const goalCompletion = totalGoal > 0 ? (totalRaised / totalGoal) * 100 : 0;
    const shortfall = totalGoal - totalRaised;

    // Campaign Success Rate
    const campaignsReachedGoal = campaigns.filter(c => c.currentAmount >= c.goalAmount);
    const campaignSuccessRate = campaigns.length > 0 ? (campaignsReachedGoal.length / campaigns.length) * 100 : 0;

    // Most/Least Funded
    const sortedByRaised = [...campaigns].sort((a, b) => (b.currentAmount || 0) - (a.currentAmount || 0));
    const mostFundedCampaign = sortedByRaised[0] || null;
    const leastFundedCampaign = sortedByRaised[sortedByRaised.length - 1] || null;

    // Campaign Velocity (amount raised per day since start)
    const campaignVelocity = campaigns.map(c => {
      const start = c.startDate ? new Date(c.startDate) : new Date(c.createdAt || now);
      const daysSinceStart = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
      const velocity = (c.currentAmount || 0) / daysSinceStart;
      return { ...c, velocity, daysSinceStart };
    }).sort((a, b) => b.velocity - a.velocity);

    // Campaign Type Performance
    const campaignTypePerformance = {};
    campaigns.forEach(c => {
      const type = c.campaignType || 'general';
      if (!campaignTypePerformance[type]) {
        campaignTypePerformance[type] = { count: 0, raised: 0, goal: 0, campaigns: [] };
      }
      campaignTypePerformance[type].count++;
      campaignTypePerformance[type].raised += c.currentAmount || 0;
      campaignTypePerformance[type].goal += c.goalAmount || 0;
      campaignTypePerformance[type].campaigns.push(c);
    });

    Object.keys(campaignTypePerformance).forEach(type => {
      const data = campaignTypePerformance[type];
      data.avgProgress = data.goal > 0 ? (data.raised / data.goal) * 100 : 0;
    });

    // Featured vs Non-Featured
    const featuredCampaigns = campaigns.filter(c => c.isFeatured);
    const nonFeaturedCampaigns = campaigns.filter(c => !c.isFeatured);
    const featuredRaised = featuredCampaigns.reduce((s, c) => s + (c.currentAmount || 0), 0);
    const nonFeaturedRaised = nonFeaturedCampaigns.reduce((s, c) => s + (c.currentAmount || 0), 0);
    const avgFeaturedRaised = featuredCampaigns.length > 0 ? featuredRaised / featuredCampaigns.length : 0;
    const avgNonFeaturedRaised = nonFeaturedCampaigns.length > 0 ? nonFeaturedRaised / nonFeaturedCampaigns.length : 0;

    // Days Until Deadlines
    const upcomingDeadlines = activeCampaigns.map(c => {
      if (!c.endDate) return null;
      const daysLeft = Math.ceil((new Date(c.endDate) - now) / (1000 * 60 * 60 * 24));
      return { campaign: c, daysLeft };
    }).filter(d => d && d.daysLeft > 0 && d.daysLeft <= 30).sort((a, b) => a.daysLeft - b.daysLeft);

    // Campaign Age Analysis
    const completedWithAge = completedCampaigns.map(c => {
      const start = c.startDate ? new Date(c.startDate) : new Date(c.createdAt || now);
      const end = c.endDate ? new Date(c.endDate) : now;
      const ageInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return { ...c, ageInDays };
    });
    const avgCampaignAge = completedWithAge.length > 0 
      ? completedWithAge.reduce((s, c) => s + c.ageInDays, 0) / completedWithAge.length 
      : 0;

    // ==================== PLEDGE-SPECIFIC ANALYTICS ====================
    const pledgesByStatus = {
      pending: allPledges.filter(p => p.status === 'pending').length,
      partial: allPledges.filter(p => p.status === 'partial').length,
      completed: allPledges.filter(p => p.status === 'completed').length,
      cancelled: allPledges.filter(p => p.status === 'cancelled').length,
    };

    // Pledge Fulfillment Rate
    const pledgeFulfillmentRate = totalPledged > 0 ? (totalPaidFromPledges / totalPledged) * 100 : 0;

    // Average Days to Payment
    const pledgesWithPayment = allPledges.filter(p => p.paid_amount > 0 && p.created_at);
    const daysToPayment = pledgesWithPayment.map(p => {
      const created = new Date(p.created_at);
      // Assuming last payment was recent - this is approximate
      const paid = new Date(p.updated_at || p.created_at);
      return Math.ceil((paid - created) / (1000 * 60 * 60 * 24));
    });
    const avgDaysToPayment = daysToPayment.length > 0 
      ? daysToPayment.reduce((s, d) => s + d, 0) / daysToPayment.length 
      : 0;

    // Overdue Pledges
    const overduePledges = allPledges.filter(p => {
      if (p.status === 'completed' || p.status === 'cancelled' || !p.due_date) return false;
      return new Date(p.due_date) < now;
    });
    const overdueAmount = overduePledges.reduce((s, p) => s + (p.remaining_amount || 0), 0);

    // Installment Plan Distribution
    const installmentPlans = {};
    allPledges.forEach(p => {
      const plan = p.installment_plan || 'lump-sum';
      if (!installmentPlans[plan]) {
        installmentPlans[plan] = { count: 0, amount: 0 };
      }
      installmentPlans[plan].count++;
      installmentPlans[plan].amount += p.pledged_amount || 0;
    });

    // Cash Flow Forecast (outstanding pledges by due date)
    const cashFlowForecast = {
      next7Days: 0,
      next30Days: 0,
      next90Days: 0,
      beyond90Days: 0
    };
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    allPledges.forEach(p => {
      if (p.status === 'completed' || p.status === 'cancelled') return;
      const remaining = p.remaining_amount || 0;
      if (!p.due_date) {
        cashFlowForecast.beyond90Days += remaining;
        return;
      }
      const dueDate = new Date(p.due_date);
      if (dueDate <= sevenDaysFromNow) {
        cashFlowForecast.next7Days += remaining;
      } else if (dueDate <= thirtyDaysFromNow) {
        cashFlowForecast.next30Days += remaining;
      } else if (dueDate <= ninetyDaysFromNow) {
        cashFlowForecast.next90Days += remaining;
      } else {
        cashFlowForecast.beyond90Days += remaining;
      }
    });

    // ==================== CONTRIBUTION FREQUENCY ====================
    // Day of week analysis
    const dayOfWeekData = Array(7).fill(0);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    [...verifiedContributions, ...successfulPayments].forEach(item => {
      const date = new Date(item.created_at || item.date);
      const day = date.getDay();
      dayOfWeekData[day]++;
    });

    const dayOfWeekAnalysis = dayNames.map((name, idx) => ({
      day: name,
      count: dayOfWeekData[idx]
    }));

    // Weekly pattern (last 12 weeks)
    const weeklyPattern = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(today.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekLabel = `Week ${12 - i}`;
      
      const weekContributions = verifiedContributions.filter(c => {
        const date = new Date(c.created_at);
        return date >= weekStart && date < weekEnd;
      }).length;

      const weekPayments = successfulPayments.filter(p => {
        const date = new Date(p.created_at);
        return date >= weekStart && date < weekEnd;
      }).length;

      weeklyPattern.push({
        week: weekLabel,
        contributions: weekContributions,
        payments: weekPayments,
        total: weekContributions + weekPayments
      });
    }

    // ==================== PAYMENT METHODS ====================
    const paymentMethods = { mpesa: 0, cash: 0, bank_transfer: 0 };
    successfulPayments.forEach(p => {
      const method = p.payment_method || 'cash';
      paymentMethods[method] = (paymentMethods[method] || 0) + (p.amount || 0);
    });
    verifiedContributions.forEach(c => {
      const method = c.payment_method || 'cash';
      paymentMethods[method] = (paymentMethods[method] || 0) + (c.amount || 0);
    });

    // ==================== TOP CONTRIBUTORS ====================
    const contributorMap = {};
    allPledges.forEach(p => {
      const key = p.member_email || p.member_name || 'anonymous';
      if (!contributorMap[key]) {
        contributorMap[key] = {
          name: p.member_name || 'Anonymous',
          email: p.member_email,
          pledged: 0,
          paid: 0,
          contributions: 0
        };
      }
      contributorMap[key].pledged += p.pledged_amount || 0;
      contributorMap[key].paid += p.paid_amount || 0;
    });

    verifiedContributions.forEach(c => {
      if (c.is_anonymous) return;
      const key = c.contributor_email || c.contributor_name || 'anonymous';
      if (!contributorMap[key]) {
        contributorMap[key] = {
          name: c.contributor_name || 'Anonymous',
          email: c.contributor_email,
          pledged: 0,
          paid: 0,
          contributions: 0
        };
      }
      contributorMap[key].contributions += c.amount || 0;
    });

    const topContributors = Object.values(contributorMap)
      .map(c => ({ ...c, total: c.paid + c.contributions }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // ==================== RECENT ACTIVITY ====================
    const recentActivity = [
      ...successfulPayments.map(p => ({
        type: 'payment',
        amount: p.amount,
        date: p.created_at,
        name: p.member_name || 'Member',
        method: p.payment_method
      })),
      ...verifiedContributions.map(c => ({
        type: 'contribution',
        amount: c.amount,
        date: c.created_at,
        name: c.is_anonymous ? 'Anonymous' : c.contributor_name,
        method: c.payment_method
      }))
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 15);

    // ==================== MONTHLY TREND (12 months) ====================
    const monthlyData = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[key] = { pledges: 0, contributions: 0, payments: 0, total: 0 };
    }

    allPledges.forEach(p => {
      const d = new Date(p.created_at);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyData[key]) {
        monthlyData[key].pledges += p.pledged_amount || 0;
      }
    });

    successfulPayments.forEach(p => {
      const d = new Date(p.created_at);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyData[key]) {
        monthlyData[key].payments += p.amount || 0;
        monthlyData[key].total += p.amount || 0;
      }
    });

    verifiedContributions.forEach(c => {
      const d = new Date(c.created_at);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyData[key]) {
        monthlyData[key].contributions += c.amount || 0;
        monthlyData[key].total += c.amount || 0;
      }
    });

    return {
      // Core KPIs
      totalRevenue,
      totalFromPledges,
      totalFromContributions,
      totalPledged,
      totalPaidFromPledges,
      totalOutstanding,
      goalCompletion,
      shortfall,
      uniqueContributors,

      // Campaigns
      totalCampaigns: campaigns.length,
      activeCampaigns: activeCampaigns.length,
      completedCampaigns: completedCampaigns.length,
      draftCampaigns: draftCampaigns.length,
      archivedCampaigns: archivedCampaigns.length,
      totalGoal,
      totalRaised,
      campaignSuccessRate,
      mostFundedCampaign,
      leastFundedCampaign,
      campaignVelocity: campaignVelocity.slice(0, 5),
      campaignTypePerformance,
      featuredVsNonFeatured: {
        featured: { count: featuredCampaigns.length, raised: featuredRaised, avg: avgFeaturedRaised },
        nonFeatured: { count: nonFeaturedCampaigns.length, raised: nonFeaturedRaised, avg: avgNonFeaturedRaised }
      },
      upcomingDeadlines,
      avgCampaignAge,

      // Pledges
      totalPledgesCount: allPledges.length,
      pledgesByStatus,
      pledgeFulfillmentRate,
      avgDaysToPayment,
      overduePledgesCount: overduePledges.length,
      overdueAmount,
      installmentPlans,
      cashFlowForecast,

      // Contributions
      totalContributionsCount: verifiedContributions.length,
      
      // Frequency
      dayOfWeekAnalysis,
      weeklyPattern,

      // Methods
      paymentMethods,

      // People
      topContributors,

      // Activity
      recentActivity,

      // Trends
      monthlyTrend: Object.entries(monthlyData).map(([month, data]) => ({ month, ...data }))
    };
  }, [campaigns, allPledges, allContributions, payments]);

  if (!analytics) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
      </div>
    );
  }

  // Chart Components
  const PieChartComponent = ({ data, title, colors }) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">{title}</h3>
        
        <div className="space-y-3">
          {data.map((item, idx) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${colors[idx % colors.length]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                  {formatCurrency(item.value)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const BarChartComponent = ({ data, title, valueKey, labelKey }) => {
    const maxValue = Math.max(...data.map(d => d[valueKey]));
    
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">{title}</h3>
        
        <div className="space-y-3">
          {data.map((item, idx) => {
            const percentage = maxValue > 0 ? (item[valueKey] / maxValue) * 100 : 0;
            return (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{item[labelKey]}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {typeof item[valueKey] === 'number' ? item[valueKey].toFixed(0) : item[valueKey]}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'pledges', label: 'Pledges', icon: CheckCircle },
          { id: 'campaigns', label: 'Campaigns', icon: Target },
          { id: 'contributors', label: 'Contributors', icon: Users },
        ].map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all ${
                selectedSection === section.id
                  ? 'bg-[#8B1A1A] text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW SECTION */}
      {selectedSection === 'overview' && (
        <div className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Percent size={24} />
              Key Performance Indicators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Collection Rate</p>
                <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                  {analytics.pledgeFulfillmentRate.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pledges honored</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Goal Achievement</p>
                <p className="text-4xl font-black text-blue-600 dark:text-blue-400">
                  {analytics.goalCompletion.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Of total goals</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Campaign Success Rate</p>
                <p className="text-4xl font-black text-purple-600 dark:text-purple-400">
                  {analytics.campaignSuccessRate.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reached goals</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Avg Days to Payment</p>
                <p className="text-4xl font-black text-amber-600 dark:text-amber-400">
                  {Math.round(analytics.avgDaysToPayment)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Days</p>
              </div>
            </div>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-white dark:bg-blue-900/50 rounded-xl">
                  <DollarSign size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">Total Revenue</h3>
              <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{formatCurrency(analytics.totalRevenue)}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-white dark:bg-emerald-900/50 rounded-xl">
                  <Users size={24} className="text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1">Unique Contributors</h3>
              <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100">{analytics.uniqueContributors}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-white dark:bg-purple-900/50 rounded-xl">
                  <Target size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-1">Active Campaigns</h3>
              <p className="text-3xl font-black text-purple-900 dark:text-purple-100">{analytics.activeCampaigns}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-white dark:bg-amber-900/50 rounded-xl">
                  <CheckCircle size={24} className="text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-1">Completed Campaigns</h3>
              <p className="text-3xl font-black text-amber-900 dark:text-amber-100">{analytics.completedCampaigns}</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChartComponent
              title="Revenue Sources"
              data={[
                { label: 'From Pledges (Paid)', value: analytics.totalFromPledges },
                { label: 'Direct Contributions', value: analytics.totalFromContributions }
              ]}
              colors={['bg-gradient-to-r from-purple-500 to-pink-500', 'bg-gradient-to-r from-blue-500 to-cyan-500']}
            />

            <PieChartComponent
              title="Payment Methods Distribution"
              data={[
                { label: 'M-Pesa', value: analytics.paymentMethods.mpesa || 0 },
                { label: 'Cash', value: analytics.paymentMethods.cash || 0 },
                { label: 'Bank Transfer', value: analytics.paymentMethods.bank_transfer || 0 }
              ]}
              colors={[
                'bg-gradient-to-r from-emerald-500 to-green-500',
                'bg-gradient-to-r from-amber-500 to-orange-500',
                'bg-gradient-to-r from-blue-500 to-indigo-500'
              ]}
            />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChartComponent
              title="Contribution Frequency (Day of Week)"
              data={analytics.dayOfWeekAnalysis}
              valueKey="count"
              labelKey="day"
            />

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Shortfall Analysis</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Total Goal</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {formatCurrency(analytics.totalGoal)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">Total Raised</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(analytics.totalRaised)}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                      style={{ width: `${Math.min(analytics.goalCompletion, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-700 dark:text-rose-300">Shortfall</span>
                    <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(analytics.shortfall)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {analytics.goalCompletion.toFixed(1)}% of goal achieved
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 12-Month Trend */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp size={24} />
              12-Month Revenue Trend
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-3">
              {analytics.monthlyTrend.map((month, idx) => {
                const maxValue = Math.max(...analytics.monthlyTrend.map(m => m.total));
                const heightPercent = maxValue > 0 ? (month.total / maxValue) * 100 : 0;
                
                return (
                  <div key={idx} className="text-center group">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                      {month.month.split(' ')[0]}
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-2 mb-2 h-32 flex items-end justify-center border border-slate-200 dark:border-slate-700">
                      <div 
                        className="bg-gradient-to-t from-indigo-500 to-purple-500 rounded-lg transition-all w-full flex items-end justify-center group-hover:from-indigo-600 group-hover:to-purple-600"
                        style={{ height: `${Math.max(heightPercent, 10)}%` }}
                      >
                        <div className="text-white text-[10px] font-black p-1">
                          {formatCurrency(month.total).replace('KES ', 'K').replace(',', '')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PLEDGES SECTION */}
      {selectedSection === 'pledges' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Pledge Analytics</h2>

          {/* Pledge Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">Total Pledged</h3>
              <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{formatCurrency(analytics.totalPledged)}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{analytics.totalPledgesCount} pledges</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
              <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1">Total Paid</h3>
              <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100">{formatCurrency(analytics.totalPaidFromPledges)}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{analytics.pledgeFulfillmentRate.toFixed(1)}% fulfilled</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
              <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-1">Outstanding</h3>
              <p className="text-3xl font-black text-amber-900 dark:text-amber-100">{formatCurrency(analytics.totalOutstanding)}</p>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/20 rounded-2xl p-6 border border-rose-200 dark:border-rose-800">
              <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300 mb-1">Overdue</h3>
              <p className="text-3xl font-black text-rose-900 dark:text-rose-100">{analytics.overduePledgesCount}</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{formatCurrency(analytics.overdueAmount)}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChartComponent
              title="Pledge Status Distribution"
              data={[
                { label: 'Pending', value: analytics.pledgesByStatus.pending },
                { label: 'Partial', value: analytics.pledgesByStatus.partial },
                { label: 'Completed', value: analytics.pledgesByStatus.completed },
                { label: 'Cancelled', value: analytics.pledgesByStatus.cancelled }
              ]}
              colors={[
                'bg-gradient-to-r from-yellow-500 to-amber-500',
                'bg-gradient-to-r from-blue-500 to-cyan-500',
                'bg-gradient-to-r from-emerald-500 to-green-500',
                'bg-gradient-to-r from-slate-500 to-gray-500'
              ]}
            />

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Installment Plan Distribution</h3>
              <div className="space-y-3">
                {Object.entries(analytics.installmentPlans).map(([plan, data]) => (
                  <div key={plan}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">
                        {plan.replace('-', ' ')}
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {data.count} pledges
                      </span>
                    </div>
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {formatCurrency(data.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cash Flow Forecast */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock size={24} />
              Cash Flow Forecast (Expected Incoming)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2">Next 7 Days</p>
                <p className="text-2xl font-black text-blue-900 dark:text-blue-100">
                  {formatCurrency(analytics.cashFlowForecast.next7Days)}
                </p>
              </div>
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-2">Next 30 Days</p>
                <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(analytics.cashFlowForecast.next30Days)}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
                <p className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2">Next 90 Days</p>
                <p className="text-2xl font-black text-purple-900 dark:text-purple-100">
                  {formatCurrency(analytics.cashFlowForecast.next90Days)}
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/20 rounded-xl">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Beyond 90 Days</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {formatCurrency(analytics.cashFlowForecast.beyond90Days)}
                </p>
              </div>
            </div>
          </div>

          {/* Weekly Pattern */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Weekly Activity Pattern (Last 12 Weeks)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2">
              {analytics.weeklyPattern.map((week, idx) => {
                const maxValue = Math.max(...analytics.weeklyPattern.map(w => w.total));
                const heightPercent = maxValue > 0 ? (week.total / maxValue) * 100 : 0;
                
                return (
                  <div key={idx} className="text-center">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">{week.week}</p>
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-2 h-24 flex items-end justify-center">
                      <div 
                        className="bg-gradient-to-t from-emerald-500 to-green-500 rounded w-full"
                        style={{ height: `${Math.max(heightPercent, 10)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{week.total}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CAMPAIGNS SECTION */}
      {selectedSection === 'campaigns' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Campaign Analytics</h2>

          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800 text-center">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">Total</p>
              <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{analytics.totalCampaigns}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 text-center">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">Active</p>
              <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100">{analytics.activeCampaigns}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-800 text-center">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">Completed</p>
              <p className="text-3xl font-black text-purple-900 dark:text-purple-100">{analytics.completedCampaigns}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800 text-center">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">Drafts</p>
              <p className="text-3xl font-black text-amber-900 dark:text-amber-100">{analytics.draftCampaigns}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/20 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Archived</p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{analytics.archivedCampaigns}</p>
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Most vs Least Funded</h3>
              <div className="space-y-4">
                {analytics.mostFundedCampaign && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">MOST FUNDED</p>
                    <p className="font-black text-slate-900 dark:text-white mb-1">{analytics.mostFundedCampaign.title}</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(analytics.mostFundedCampaign.currentAmount)}
                    </p>
                  </div>
                )}
                {analytics.leastFundedCampaign && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-xl">
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-300 mb-2">LEAST FUNDED</p>
                    <p className="font-black text-slate-900 dark:text-white mb-1">{analytics.leastFundedCampaign.title}</p>
                    <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(analytics.leastFundedCampaign.currentAmount)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Top 5 Campaign Velocity</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">Amount raised per day</p>
              <div className="space-y-3">
                {analytics.campaignVelocity.map((campaign, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{campaign.title}</p>
                      <p className="text-xs text-slate-500">{campaign.daysSinceStart} days active</p>
                    </div>
                    <p className="text-sm font-black text-blue-600 dark:text-blue-400">
                      {formatCurrency(campaign.velocity)}/day
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Type Performance */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Campaign Type Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analytics.campaignTypePerformance).map(([type, data]) => (
                <div key={type} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 capitalize">{type}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                    {formatCurrency(data.raised)}
                  </p>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      style={{ width: `${Math.min(data.avgProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {data.count} campaigns • {data.avgProgress.toFixed(1)}% avg progress
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Featured vs Non-Featured */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Star size={24} />
              Featured vs Non-Featured Impact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-amber-50 dark:bg-amber-950/20 rounded-xl">
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-4 flex items-center gap-2">
                  <Star size={16} />
                  FEATURED CAMPAIGNS
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Count</p>
                    <p className="text-2xl font-black text-amber-900 dark:text-amber-100">
                      {analytics.featuredVsNonFeatured.featured.count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Total Raised</p>
                    <p className="text-2xl font-black text-amber-900 dark:text-amber-100">
                      {formatCurrency(analytics.featuredVsNonFeatured.featured.raised)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Avg per Campaign</p>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                      {formatCurrency(analytics.featuredVsNonFeatured.featured.avg)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">NON-FEATURED CAMPAIGNS</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Count</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      {analytics.featuredVsNonFeatured.nonFeatured.count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Total Raised</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      {formatCurrency(analytics.featuredVsNonFeatured.nonFeatured.raised)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Avg per Campaign</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {formatCurrency(analytics.featuredVsNonFeatured.nonFeatured.avg)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          {analytics.upcomingDeadlines.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-6">
              <h3 className="text-lg font-black text-rose-900 dark:text-rose-100 mb-6 flex items-center gap-2">
                <AlertTriangle size={24} />
                Campaigns Ending Soon (Next 30 Days)
              </h3>
              <div className="space-y-3">
                {analytics.upcomingDeadlines.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{item.campaign.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatCurrency(item.campaign.currentAmount)} / {formatCurrency(item.campaign.goalAmount)}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{item.daysLeft}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">days left</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Average Campaign Age */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Campaign Age Analysis</h3>
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Average time to complete a campaign</p>
              <p className="text-5xl font-black text-blue-600 dark:text-blue-400">
                {Math.round(analytics.avgCampaignAge)}
              </p>
              <p className="text-lg text-slate-700 dark:text-slate-300 mt-2">days</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTRIBUTORS SECTION */}
      {selectedSection === 'contributors' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Contributor Analytics</h2>

          {/* Top 10 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Award size={24} />
              Top 10 Contributors
            </h3>
            <div className="space-y-3">
              {analytics.topContributors.map((contributor, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black shadow-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {contributor.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {contributor.email || 'No email'}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs">
                      <span className="text-purple-600 dark:text-purple-400">Pledged: {formatCurrency(contributor.pledged)}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">Paid: {formatCurrency(contributor.paid)}</span>
                      <span className="text-blue-600 dark:text-blue-400">Direct: {formatCurrency(contributor.contributions)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(contributor.total)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {((contributor.total / analytics.totalRevenue) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity size={24} />
              Recent Activity (Last 15 Transactions)
            </h3>
            <div className="space-y-2">
              {analytics.recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'payment' 
                      ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' 
                      : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <DollarSign size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {activity.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activity.type === 'payment' ? 'Pledge Payment' : 'Direct Contribution'}
                      {' • '}
                      {activity.method?.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {formatDateShort(activity.date)}
                    </p>
                  </div>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(activity.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}