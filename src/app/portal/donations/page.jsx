// src/app/portal/donations/page.jsx - REDESIGNED MODERN DASHBOARD
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDate, joinCampaignsWithPledges } from '@/utils/donationHelpers';
import api from '@/lib/api';

// Components
import EnhancedAdminPledgeTable from '@/components/donations/EnhancedAdminPledgeTable';
import EnhancedUserPledgeView from '@/components/donations/EnhancedUserPledgeView';
import DonationsAnalyticsDashboard from '@/components/donations/DonationsAnalyticsDashboard';
import AdminCampaignManager from '@/components/donations/AdminCampaignManager';
import CampaignsTab from '@/components/donations/CampaignsTab';
import PledgeForm from '@/components/donations/PledgeForm';
import ContributionForm from '@/components/donations/ContributionForm';
import TransactionAuditLogTab from '@/components/donations/TransactionAuditLogTab';
import ContributionsTab from '@/components/donations/ContributionsTab';
import MpesaModal from '@/components/donations/MpesaModal';
import ManualPaymentModal from '@/components/donations/ManualPaymentModal';
import PledgeHistoryModal from '@/components/donations/PledgeHistoryModal';
import EditPledgeModal from '@/components/donations/EditPledgeModal';

import {
  ArrowLeft, Heart, Plus, RefreshCw, CheckCircle, AlertCircle,
  DollarSign, Target, Users, TrendingUp, X, Activity, ChevronRight,
  Search, Bell, Calendar, Download, Filter, BarChart3, Wallet
} from 'lucide-react';
import Link from 'next/link';

// Alert Component
function Alert({ message, type = 'success', onClose }) {
  if (!message) return null;
  const styles = {
    success: 'bg-emerald-500 text-white border-emerald-400',
    error: 'bg-rose-500 text-white border-rose-400'
  };
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-5 duration-300 ${styles[type]}`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <p className="font-bold">{message}</p>
      <button onClick={onClose} className="ml-4 hover:rotate-90 transition-transform"><X size={18} /></button>
    </div>
  );
}

export default function DonationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const {
    canViewCampaigns, canViewPledges, canViewAllPledges,
    canViewAllPayments, canProcessPayments, canViewDonationReports, canCreateCampaign
  } = usePermissions();

  const [activeTab, setActiveTab] = useState('overview');
  const [alertMessage, setAlertMessage] = useState({ message: null, type: 'success' });
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [selectedPledgeForPayment, setSelectedPledgeForPayment] = useState(null);
  const [selectedPledgeForManual, setSelectedPledgeForManual] = useState(null);
  const [selectedPledgeForHistory, setSelectedPledgeForHistory] = useState(null);
  const [selectedPledgeForEdit, setSelectedPledgeForEdit] = useState(null);

  const canAccessDonations = () => canViewCampaigns() || canViewPledges() || canViewAllPledges() || canViewAllPayments() || canViewDonationReports();

  // Mobile redirect
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) router.push('/portal/donations/mobile');
  }, [router]);

  // Check overdue campaigns
  useEffect(() => {
    const checkOverdueCampaigns = async () => {
      try {
        await api.post('/campaigns/check-overdue');
        console.log('[CAMPAIGNS] Overdue check completed');
      } catch (err) {
        console.error('[CAMPAIGNS] Failed to check overdue:', err);
      }
    };
    checkOverdueCampaigns();
  }, []);

  // Data Fetching
  const { data: campaigns = [], isFetching: isFetchingCampaigns } = useQuery({
    queryKey: ['campaigns', { status: 'active' }],
    queryFn: async () => {
      const res = await donationApi.campaigns.getAll({ status: 'active' });
      console.log('[DONATIONS] Campaigns loaded:', res.campaigns?.length);
      return res.success ? (res.campaigns || []) : [];
    },
    enabled: canAccessDonations(),
    staleTime: 30000,
    placeholderData: [],
    refetchOnWindowFocus: true,
  });

  const { data: myPledgesRaw = [], isFetching: isFetchingMyPledges } = useQuery({
    queryKey: ['myPledges'],
    queryFn: async () => {
      const res = await donationApi.pledges.getMyPledges(1, 100);
      return res.success ? (res.pledges || []) : [];
    },
    enabled: canViewPledges() && canAccessDonations(),
    staleTime: 30000,
    placeholderData: [],
    refetchOnWindowFocus: true,
  });

  const myPledges = useMemo(() => joinCampaignsWithPledges(myPledgesRaw, campaigns), [myPledgesRaw, campaigns]);

  const { data: allPledgesRaw = [], isFetching: isFetchingAllPledges } = useQuery({
    queryKey: ['allPledges'],
    queryFn: async () => {
      const res = await donationApi.pledges.getAllPledges(1, 100);
      return res.success ? (res.pledges || []) : [];
    },
    enabled: canViewAllPledges() && canAccessDonations(),
    staleTime: 30000,
    placeholderData: [],
    refetchOnWindowFocus: true,
  });

  const allPledges = useMemo(() => joinCampaignsWithPledges(allPledgesRaw, campaigns), [allPledgesRaw, campaigns]);

  const { data: payments = [], isFetching: isFetchingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await donationApi.payments.getAll({ page: 1, limit: 100 });
      return res.success ? (res.payments || []) : [];
    },
    enabled: canViewAllPayments() && canAccessDonations(),
    staleTime: 30000,
    placeholderData: [],
    refetchOnWindowFocus: true,
  });

  const { data: analyticsData, isFetching: isFetchingAnalytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await donationApi.analytics.getDashboard();
      if (response.success) {
        return response.data;
      }
      return null;
    },
    enabled: activeTab === 'analytics' && canViewDonationReports(),
    staleTime: 60000,
  });

  // Handlers
  const handlePledgeCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['myPledges'] });
    queryClient.invalidateQueries({ queryKey: ['allPledges'] });
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    setAlertMessage({ message: '✅ Pledge created successfully!', type: 'success' });
    setIsPledgeModalOpen(false);
  };

  const handleContributionCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    setAlertMessage({ message: '✅ Contribution recorded!', type: 'success' });
    setIsContributionModalOpen(false);
  };

  const handlePaymentComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['myPledges'] });
    queryClient.invalidateQueries({ queryKey: ['allPledges'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    setAlertMessage({ message: '✅ Payment processed successfully!', type: 'success' });
    setSelectedPledgeForPayment(null);
  };

  const handleManualPaymentRecorded = () => {
    queryClient.invalidateQueries({ queryKey: ['allPledges'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    setAlertMessage({ message: '✅ Manual payment recorded!', type: 'success' });
    setSelectedPledgeForManual(null);
  };

  const handlePledgeUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['myPledges'] });
    queryClient.invalidateQueries({ queryKey: ['allPledges'] });
    setAlertMessage({ message: '✅ Pledge updated successfully!', type: 'success' });
    setSelectedPledgeForEdit(null);
  };

  const handleEditPledge = (pledge) => {
    setSelectedPledgeForEdit(pledge);
  };

  const handleCancelPledge = async (pledgeId) => {
    if (!window.confirm('Are you sure you want to cancel this pledge?')) return;
    try {
      const response = await donationApi.pledges.updatePledge(pledgeId, { status: 'cancelled' });
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['myPledges'] });
        queryClient.invalidateQueries({ queryKey: ['allPledges'] });
        setAlertMessage({ message: '✅ Pledge cancelled', type: 'success' });
      }
    } catch (error) {
      setAlertMessage({ message: '❌ Failed to cancel pledge', type: 'error' });
    }
  };

  const handleCampaignCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    setAlertMessage({ message: '✅ Campaign created successfully!', type: 'success' });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    queryClient.invalidateQueries({ queryKey: ['myPledges'] });
    queryClient.invalidateQueries({ queryKey: ['allPledges'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    setAlertMessage({ message: '✅ Data refreshed!', type: 'success' });
  };

  // Calculate quick stats
  const totalRaised = campaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
  const activeCampaignsCount = campaigns.filter(c => c.status === 'active').length;
  const myPledgesTotal = myPledges.reduce((sum, p) => sum + (p.amount || 0), 0);
  const myPledgesPaid = myPledges.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  // Navigation tabs configuration
  const navigationTabs = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3, show: true },
    { id: 'analytics', label: 'Analytics', icon: Activity, show: canViewDonationReports() },
    { id: 'my-pledges', label: 'My Pledges', icon: Heart, show: canViewPledges() },
    { id: 'all-pledges', label: 'All Pledges', icon: Users, show: canViewAllPledges() },
    { id: 'contributions', label: 'Contributions', icon: DollarSign, show: true },
    { id: 'payments', label: 'Payments', icon: Wallet, show: canViewAllPayments() },
    { id: 'campaigns', label: 'Campaigns', icon: Target, show: canViewCampaigns() },
    { id: 'audit', label: 'Audit Log', icon: Calendar, show: canViewDonationReports() },
  ].filter(tab => tab.show);

  if (!canAccessDonations()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
          <AlertCircle size={64} className="mx-auto mb-4 text-rose-500" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">You don't have permission to view donations</p>
          <Link href="/portal" className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B1A1A] text-white rounded-xl font-bold hover:bg-[#6d1414] transition-colors">
            <ArrowLeft size={18} />
            Back to Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Top Navigation Bar - Inspired by Screenshot 1 */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6 mb-4">
            {/* Left: Title & Search */}
            <div className="flex items-center gap-6 flex-1">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Donations</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage campaigns, pledges & contributions</p>
              </div>
              
              {/* Search Bar */}
              <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl flex-1 max-w-md">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search campaigns, pledges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 w-full"
                />
                <kbd className="hidden xl:inline-block px-2 py-1 text-xs font-bold text-slate-500 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">⌘K</kbd>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Refresh data"
              >
                <RefreshCw size={18} className="text-slate-600 dark:text-slate-400" />
              </button>

              <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors relative">
                <Bell size={18} className="text-slate-600 dark:text-slate-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>

              {canViewPledges() && (
                <button
                  onClick={() => setIsPledgeModalOpen(true)}
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30"
                >
                  <Plus size={18} />
                  <span>Make Pledge</span>
                </button>
              )}

              <button
                onClick={() => setIsContributionModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8B1A1A] to-rose-700 hover:from-[#6d1414] hover:to-rose-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/30"
              >
                <Heart size={18} />
                <span className="hidden md:inline">Quick Give</span>
              </button>
            </div>
          </div>

          {/* Horizontal Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#8B1A1A] text-white shadow-lg shadow-rose-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Overview Tab - Dashboard */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Raised */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-white dark:bg-emerald-900/50 rounded-xl">
                    <DollarSign size={24} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+12.5%</span>
                </div>
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1">Total Raised</h3>
                <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{formatCurrency(totalRaised)}</p>
              </div>

              {/* Active Campaigns */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-white dark:bg-blue-900/50 rounded-xl">
                    <Target size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Live</span>
                </div>
                <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">Active Campaigns</h3>
                <p className="text-2xl font-black text-blue-900 dark:text-blue-100">{activeCampaignsCount}</p>
              </div>

              {/* My Total Pledges */}
              {canViewPledges() && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-white dark:bg-purple-900/50 rounded-xl">
                      <Heart size={24} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{myPledges.length} Active</span>
                  </div>
                  <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-1">My Pledges</h3>
                  <p className="text-2xl font-black text-purple-900 dark:text-purple-100">{formatCurrency(myPledgesTotal)}</p>
                </div>
              )}

              {/* Paid Amount */}
              {canViewPledges() && (
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-white dark:bg-amber-900/50 rounded-xl">
                      <Wallet size={24} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{Math.round((myPledgesPaid/myPledgesTotal)*100) || 0}%</span>
                  </div>
                  <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-1">Amount Paid</h3>
                  <p className="text-2xl font-black text-amber-900 dark:text-amber-100">{formatCurrency(myPledgesPaid)}</p>
                </div>
              )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Live Campaigns */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Live Campaigns</h3>
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className="text-[#8B1A1A] text-sm font-bold flex items-center gap-1 hover:underline"
                  >
                    View All <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {campaigns.slice(0, 4).map(c => {
                    const progress = Math.min(Math.round((c.currentAmount / c.goalAmount) * 100), 100);
                    return (
                      <div key={c._id} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-slate-900 dark:text-white">{c.title}</h4>
                          <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-lg uppercase">Live</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-gradient-to-r from-[#8B1A1A] to-rose-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                          <span>{formatCurrency(c.currentAmount)}</span>
                          <span>{progress}% of {formatCurrency(c.goalAmount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column - Quick Actions */}
              <div className="space-y-4">
                {/* Recent Activity Card */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-2xl p-6 border border-rose-200 dark:border-rose-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-white dark:bg-rose-900/50 rounded-lg">
                      <Activity size={20} className="text-rose-600 dark:text-rose-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-bold text-slate-900 dark:text-white">Latest Payment</p>
                      <p className="text-slate-600 dark:text-slate-400">{payments[0] ? formatDate(payments[0].created_at) : 'No payments yet'}</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-slate-900 dark:text-white">Total Transactions</p>
                      <p className="text-slate-600 dark:text-slate-400">{payments.length} payments</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-white dark:bg-blue-900/50 rounded-lg">
                      <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Monthly Growth</h3>
                  </div>
                  <p className="text-3xl font-black text-blue-900 dark:text-blue-100 mb-2">+24.3%</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Compared to last month</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="overflow-hidden">
            {isFetchingAnalytics && !analyticsData ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
              </div>
            ) : analyticsData ? (
              <DonationsAnalyticsDashboard data={analyticsData} />
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 text-center">
                <p className="text-yellow-800 dark:text-yellow-200">No analytics data available</p>
              </div>
            )}
          </div>
        )}

        {/* My Pledges Tab */}
        {activeTab === 'my-pledges' && <EnhancedUserPledgeView pledges={myPledges} onPayPledge={setSelectedPledgeForPayment} />}
        
        {/* All Pledges Tab (Admin) */}
        {activeTab === 'all-pledges' && canViewAllPledges() && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
            <EnhancedAdminPledgeTable 
              pledges={allPledges} 
              onRecordPayment={setSelectedPledgeForManual} 
              onViewHistory={setSelectedPledgeForHistory} 
              onEditPledge={handleEditPledge} 
              onCancelPledge={handleCancelPledge} 
            />
          </div>
        )}

        {/* Contributions Tab */}
        {activeTab === 'contributions' && <ContributionsTab />}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && canViewDonationReports() && (
          <TransactionAuditLogTab />
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && canViewAllPayments() && (
          <div className="overflow-hidden">
            {payments.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <DollarSign size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  No payments yet
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">Phone</th>
                        <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">Amount</th>
                        <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">Method</th>
                        <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">Status</th>
                        <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {Array.isArray(payments) && payments.map(payment => (
                        <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                            {payment.mpesa_phone_number || 'Manual'}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 capitalize text-slate-700 dark:text-slate-300">
                            {payment.payment_method}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              payment.status === 'success'
                                ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200'
                                : 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200'
                            }`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {formatDate(payment.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && canViewCampaigns() && (
          <div className="space-y-6">
            {canCreateCampaign() && (
              <AdminCampaignManager onCampaignCreated={handleCampaignCreated} />
            )}
            <CampaignsTab onCampaignCreated={handleCampaignCreated} />
          </div>
        )}
      </div>

      {/* Alert Portal */}
      {alertMessage.message && (
        <Alert message={alertMessage.message} type={alertMessage.type} onClose={() => setAlertMessage({ message: null })} />
      )}

      {/* Modals */}
      {isPledgeModalOpen && <PledgeForm onClose={() => setIsPledgeModalOpen(false)} onSuccess={handlePledgeCreated} />}
      {isContributionModalOpen && <ContributionForm onClose={() => setIsContributionModalOpen(false)} onSuccess={handleContributionCreated} />}
      {selectedPledgeForPayment && <MpesaModal pledge={selectedPledgeForPayment} onClose={() => setSelectedPledgeForPayment(null)} onSuccess={handlePaymentComplete} />}
      {selectedPledgeForManual && canProcessPayments() && <ManualPaymentModal pledge={selectedPledgeForManual} onClose={() => setSelectedPledgeForManual(null)} onSuccess={handleManualPaymentRecorded} />}
      {selectedPledgeForEdit && <EditPledgeModal pledge={selectedPledgeForEdit} onClose={() => setSelectedPledgeForEdit(null)} onSuccess={handlePledgeUpdated} />}
      {selectedPledgeForHistory && <PledgeHistoryModal pledge={selectedPledgeForHistory} onClose={() => setSelectedPledgeForHistory(null)} />}
    </div>
  );
}