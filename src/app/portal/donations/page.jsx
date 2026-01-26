// src/app/portal/donations/page.jsx - UPDATED WITH ENHANCED COMPONENTS

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDate, joinCampaignsWithPledges } from '@/utils/donationHelpers';

// ✅ IMPORT ENHANCED COMPONENTS
import EnhancedAdminPledgeTable from '@/components/donations/EnhancedAdminPledgeTable';
import EnhancedUserPledgeView from '@/components/donations/EnhancedUserPledgeView';
import DonationsAnalyticsDashboard from '@/components/donations/DonationsAnalyticsDashboard';
import AdminCampaignManager from '@/components/donations/AdminCampaignManager';
import CampaignsTab from '@/components/donations/CampaignsTab';
import PledgeForm from '@/components/donations/PledgeForm';
import ContributionForm from '@/components/donations/ContributionForm';
import MpesaModal from '@/components/donations/MpesaModal';
import ManualPaymentModal from '@/components/donations/ManualPaymentModal';
import PledgeHistoryModal from '@/components/donations/PledgeHistoryModal'; // NEW
import EditPledgeModal from '@/components/donations/EditPledgeModal';
import DonationsMobileNav from '@/components/donations/DonationsMobileNav';

import {
  ArrowLeft,
  Heart,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Target,
  Users,
  TrendingUp,
  Menu, 
  X     
} from 'lucide-react';
import Link from 'next/link';

export default function DonationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    canViewCampaigns,
    canViewPledges,
    canViewAllPledges,
    canViewAllPayments,
    canProcessPayments,
    canViewDonationReports,
    canCreateCampaign
  } = usePermissions();

  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data states
  const [campaigns, setCampaigns] = useState([]);
  const [myPledges, setMyPledges] = useState([]);
  const [allPledges, setAllPledges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  

  // Modal states
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [selectedPledgeForPayment, setSelectedPledgeForPayment] = useState(null);
  const [selectedPledgeForManual, setSelectedPledgeForManual] = useState(null);
  const [selectedPledgeForHistory, setSelectedPledgeForHistory] = useState(null); // NEW
  const [selectedPledgeForEdit, setSelectedPledgeForEdit] = useState(null);

  const [stats, setStats] = useState({
    totalRaised: 0,
    pendingPayments: 0,
    activePledges: 0,
    completedPledges: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: 'active',
    campaignId: 'all'
  });

  const [pagination, setPagination] = useState({
    myPledges: { page: 1, limit: 10, total: 0, pages: 0 },
    allPledges: { page: 1, limit: 20, total: 0, pages: 0 },
    payments: { page: 1, limit: 20, total: 0, pages: 0 }
  });

  const fetchInProgress = useRef(false);

  // Permission check
  const canAccessDonations = () => {
    return (
      canViewCampaigns() ||
      canViewPledges() ||
      canViewAllPledges() ||
      canViewAllPayments() ||
      canViewDonationReports()
    );
  };

   useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      router.push('/portal/donations/mobile');
    }
  }, [router]);

  useEffect(() => {
    if (!isLoading && !canAccessDonations()) {
      setError('You do not have permission to access donations');
    }
  }, [isLoading]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (fetchInProgress.current) {
      console.log('[DONATIONS] Fetch already in progress, skipping...');
      return;
    }
    
    fetchInProgress.current = true;
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('[DONATIONS] Fetching all data...');

      let campaignsData = [];
      let myPledgesData = [];
      let allPledgesData = [];
      let paymentsData = [];

      // Fetch campaigns (MongoDB)
      const campaignsRes = await donationApi.campaigns.getAll({ status: 'active' });
      if (campaignsRes.success) {
        campaignsData = campaignsRes.campaigns || [];
        setCampaigns(campaignsData);
        console.log('[DONATIONS] Campaigns loaded:', campaignsData.length);
      }

      // Fetch user's pledges (Supabase)
      if (canViewPledges()) {
        const pledgesRes = await donationApi.pledges.getMyPledges(
          pagination.myPledges.page,
          pagination.myPledges.limit
        );
        
        if (pledgesRes.success) {
          myPledgesData = pledgesRes.pledges || [];
          const pledgesWithCampaigns = joinCampaignsWithPledges(myPledgesData, campaignsData);
          setMyPledges(pledgesWithCampaigns);
          setPagination(prev => ({
            ...prev,
            myPledges: {
              ...prev.myPledges,
              total: pledgesRes.pagination?.total || 0,
              pages: pledgesRes.pagination?.pages || 0
            }
          }));
        }
      }

      // Fetch all pledges (Admin only)
      if (canViewAllPledges()) {
        const allPledgesRes = await donationApi.pledges.getAllPledges(
          pagination.allPledges.page,
          pagination.allPledges.limit
        );
        
        if (allPledgesRes.success) {
          allPledgesData = allPledgesRes.pledges || [];
          const allPledgesWithCampaigns = joinCampaignsWithPledges(allPledgesData, campaignsData);
          setAllPledges(allPledgesWithCampaigns);
          setPagination(prev => ({
            ...prev,
            allPledges: {
              ...prev.allPledges,
              total: allPledgesRes.pagination?.total || 0,
              pages: allPledgesRes.pagination?.pages || 0
            }
          }));
        }
      }

      // Fetch payments (Admin only)
      if (canViewAllPayments()) {
        const paymentsRes = await donationApi.payments.getAll({
          page: pagination.payments.page,
          limit: pagination.payments.limit
        });
        
        if (paymentsRes.success) {
          paymentsData = paymentsRes.payments || [];
          setPayments(paymentsData);
          setPagination(prev => ({
            ...prev,
            payments: {
              ...prev.payments,
              total: paymentsRes.pagination?.total || 0,
              pages: paymentsRes.pagination?.pages || 0
            }
          }));
          
          calculateStats(paymentsData, myPledgesData.length > 0 ? myPledgesData : allPledgesData);
        }
      }

    } catch (err) {
      console.error('[DONATIONS] Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load donation data');
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, []);

  const calculateStats = useCallback((paymentsData, pledgesData) => {
    const totalRaised = paymentsData
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const pendingPayments = paymentsData
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const activePledges = pledgesData.filter(p => 
      p.status === 'pending' || p.status === 'partial'
    ).length;

    const completedPledges = pledgesData.filter(p => 
      p.status === 'completed'
    ).length;

    setStats({
      totalRaised,
      pendingPayments,
      activePledges,
      completedPledges
    });
  }, []);

  // Initial load
  useEffect(() => {
    if (canAccessDonations()) {
      fetchAllData();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Analytics loading
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!canViewDonationReports()) return;
    
    try {
      setIsLoadingAnalytics(true);
      const response = await donationApi.analytics.getDashboard();
      
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (err) {
      console.error('[DONATIONS] Analytics error:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics' && !analyticsData) {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Handlers
  const handleRefresh = async () => {
    await fetchAllData();
    setSuccess('Data refreshed successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handlePledgeCreated = () => {
    setIsPledgeModalOpen(false);
    setSuccess('Pledge created successfully!');
    fetchAllData();
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleContributionCreated = () => {
    setIsContributionModalOpen(false);
    setSuccess('Contribution recorded successfully!');
    fetchAllData();
    setTimeout(() => setSuccess(null), 3000);
  };

  const handlePaymentComplete = () => {
    setSelectedPledgeForPayment(null);
    setSuccess('Payment initiated successfully!');
    fetchAllData();
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleManualPaymentRecorded = () => {
    setSelectedPledgeForManual(null);
    setSuccess('Payment recorded successfully!');
    fetchAllData();
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCampaignCreated = () => {
    setSuccess('Campaign created successfully!');
    fetchAllData();
    setTimeout(() => setSuccess(null), 3000);
  };

  // Add these handler functions in your page.jsx (around line 150-200)

const handleCancelPledge = async (pledge) => {
  if (!window.confirm(`Are you sure you want to cancel this pledge for ${pledge.member_name}?`)) {
    return;
  }

  try {
    const response = await donationApi.pledges.cancel(pledge.id);
    if (response.success) {
      setSuccess('Pledge cancelled successfully');
      fetchAllData();
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(response.message || 'Failed to cancel pledge');
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to cancel pledge');
  }
};

const handleEditPledge = (pledge) => {
  // You can create an EditPledgeModal or use a simple prompt
  // For now, let's add a modal state
  setSelectedPledgeForEdit(pledge);
};

const handlePledgeUpdated = () => {
  setSelectedPledgeForEdit(null);
  setSuccess('Pledge updated successfully!');
  fetchAllData();
  setTimeout(() => setSuccess(null), 3000);
};




  // Close mobile menu when tab changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  // Permission gate
  if (!canAccessDonations() && !isLoading) {
    return (
      <div className="space-y-6">
        <Link href="/portal" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">
            You do not have permission to access the donations page
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-4"
            >
              <ArrowLeft size={20} />
               <span className="text-sm md:text-base">Back to Dashboard</span>
            </Link>

            <div className="flex items-center gap-3 mt-2">
              <Heart size={32} className="text-[#8B1A1A]" />
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Donations & Pledges
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage campaigns, pledges, and track giving history
            </p>
          </div>

          <div className="hidden md:flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={18} />
              Refresh
            </button>

            {canViewPledges() && (
              <button
                onClick={() => setIsPledgeModalOpen(true)}
                className="px-4 py-2 bg-[#8B1A1A] text-white font-semibold rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                New Pledge
              </button>
            )}

            {canViewCampaigns() && (
              <button
                onClick={() => setIsContributionModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Contribute
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

         {/* Mobile Action Buttons */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={18} />
              Refresh
            </button>

            {canViewPledges() && (
              <button
                onClick={() => setIsPledgeModalOpen(true)}
                className="w-full px-4 py-3 bg-[#8B1A1A] text-white font-semibold rounded-lg hover:bg-red-900 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                New Pledge
              </button>
            )}

            {canViewCampaigns() && (
              <button
                onClick={() => setIsContributionModalOpen(true)}
                className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Contribute
              </button>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-800 dark:text-green-200 font-semibold">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-800 dark:text-red-200 font-semibold">{error}</p>
        </div>
      )}

      {/* Mobile Navigation Cards */}
      <DonationsMobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={{
          myPledges: myPledges.length,
          allPledges: allPledges.length,
          payments: payments.length,
          campaigns: campaigns.length
        }}
        permissions={{
          canViewDonationReports: canViewDonationReports(),
          canViewPledges: canViewPledges(),
          canViewAllPledges: canViewAllPledges(),
          canViewAllPayments: canViewAllPayments(),
          canViewCampaigns: canViewCampaigns()
        }}
      />

      {/* Desktop Navigation Tabs - ONLY TABS HIDDEN ON MOBILE */}
      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-xl overflow-x-auto">
          {/* Overview Tab */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4 font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-[#8B1A1A] bg-white dark:bg-slate-800 border-b-2 border-[#8B1A1A]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Overview
          </button>

          {canViewDonationReports() && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'text-[#8B1A1A] bg-white dark:bg-slate-800 border-b-2 border-[#8B1A1A]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Analytics & Reports
            </button>
          )}

          {canViewPledges() && (
            <button
              onClick={() => setActiveTab('my-pledges')}
              className={`px-6 py-4 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'my-pledges'
                  ? 'text-[#8B1A1A] bg-white dark:bg-slate-800 border-b-2 border-[#8B1A1A]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              My Pledges ({myPledges.length})
            </button>
          )}

          {canViewAllPledges() && (
            <button
              onClick={() => setActiveTab('all-pledges')}
              className={`px-6 py-4 font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'all-pledges'
                  ? 'text-[#8B1A1A] bg-white dark:bg-slate-800 border-b-2 border-[#8B1A1A]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Pledges ({allPledges.length})
              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded">
                Admin
              </span>
            </button>
          )}

          {canViewAllPayments() && (
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-4 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'text-[#8B1A1A] bg-white dark:bg-slate-800 border-b-2 border-[#8B1A1A]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Payments ({payments.length})
            </button>
          )}

          {canViewCampaigns() && (
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-6 py-4 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'campaigns'
                  ? 'text-[#8B1A1A] bg-white dark:bg-slate-800 border-b-2 border-[#8B1A1A]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Campaigns ({campaigns.length})
            </button>
          )}
        </div>
      </div>

      {/* TAB CONTENT - VISIBLE ON BOTH MOBILE AND DESKTOP */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 md:p-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 md:space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {canViewPledges() && (
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl p-4 md:p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <p className="text-xs md:text-sm font-semibold opacity-90">My Pledges</p>
                    <Target size={18} className="opacity-70 md:w-5 md:h-5" />
                  </div>
                  <p className="text-2xl md:text-3xl font-black mb-2">{myPledges.length}</p>
                  <p className="text-xs md:text-sm opacity-90">
                    {myPledges.filter(p => p.status !== 'completed').length} active
                  </p>
                </div>
              )}

              {canViewAllPledges() && (
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-4 md:p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <p className="text-xs md:text-sm font-semibold opacity-90">Total Pledges</p>
                    <Users size={18} className="opacity-70 md:w-5 md:h-5" />
                  </div>
                  <p className="text-2xl md:text-3xl font-black mb-2">{allPledges.length}</p>
                  <p className="text-xs md:text-sm opacity-90">
                    {allPledges.filter(p => p.status === 'completed').length} completed
                  </p>
                </div>
              )}

              {canViewAllPayments() && (
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-4 md:p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <p className="text-xs md:text-sm font-semibold opacity-90">Amount Collected</p>
                    <DollarSign size={18} className="opacity-70 md:w-5 md:h-5" />
                  </div>
                  <p className="text-2xl md:text-3xl font-black mb-2">
                    KES {(payments.filter(p => p.status === 'success').reduce((sum, p) => sum + (p.amount || 0), 0) / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs md:text-sm opacity-90">
                    {payments.filter(p => p.status === 'success').length} successful
                  </p>
                </div>
              )}

              {canViewCampaigns() && (
                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-4 md:p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <p className="text-xs md:text-sm font-semibold opacity-90">Active Campaigns</p>
                    <TrendingUp size={18} className="opacity-70 md:w-5 md:h-5" />
                  </div>
                  <p className="text-2xl md:text-3xl font-black mb-2">{campaigns.length}</p>
                  <p className="text-xs md:text-sm opacity-90">
                    {campaigns.filter(c => c.status === 'active').length} running
                  </p>
                </div>
              )}
            </div>

            {/* Welcome Message */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 md:p-8">
              <h3 className="text-base md:text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                👋 Welcome back, {user?.name}!
              </h3>
              <p className="text-sm md:text-base text-blue-800 dark:text-blue-200">
                This dashboard shows your giving activity and campaign progress. Use the {' '}
                <span className="hidden md:inline">tabs above</span>
                <span className="md:hidden">cards above</span>
                {' '}to manage pledges, view payments, and access detailed reports.
              </p>
            </div>

            {/* Recent Campaigns - Mobile Optimized */}
            {canViewCampaigns() && campaigns.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-4 md:mb-6">
                  Active Campaigns
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {campaigns.slice(0, 4).map(campaign => {
                    const progress = campaign.currentAmount > 0 
                      ? Math.round((campaign.currentAmount / campaign.goalAmount) * 100) 
                      : 0;
                    
                    return (
                      <div
                        key={campaign._id}
                        className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 md:p-4 border border-slate-200 dark:border-slate-600"
                      >
                        <h4 className="font-bold text-sm md:text-base text-slate-900 dark:text-white mb-2 line-clamp-2">
                          {campaign.title}
                        </h4>
                        <div className="space-y-2 text-xs md:text-sm mb-3 md:mb-4">
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Goal:</span>
                            <span className="font-semibold">{formatCurrency(campaign.goalAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Raised:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(campaign.currentAmount)}</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
                          {progress}% complete
                        </p>
                      </div>
                    );
                  })}
                  </div>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
    {activeTab === 'analytics' && (
      <div className="overflow-hidden">
        {isLoadingAnalytics ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
          </div>
        ) : analyticsData ? (
          <DonationsAnalyticsDashboard data={analyticsData} />
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center">
            <p className="text-yellow-800 dark:text-yellow-200">No analytics data available</p>
          </div>
        )}
      </div>
    )}

    {/* MY PLEDGES TAB */}
    {activeTab === 'my-pledges' && (
      <EnhancedUserPledgeView
        pledges={myPledges}
        onPayPledge={(pledge) => setSelectedPledgeForPayment(pledge)}
      />
    )}

    {/* ALL PLEDGES TAB */}
    {activeTab === 'all-pledges' && canViewAllPledges() && (
      <EnhancedAdminPledgeTable
        pledges={allPledges}
        onRecordPayment={(pledge) => setSelectedPledgeForManual(pledge)}
        onViewHistory={(pledge) => setSelectedPledgeForHistory(pledge)}
        onEditPledge={handleEditPledge}        
        onCancelPledge={handleCancelPledge}
      />
    )}

    {/* PAYMENTS TAB */}
    {activeTab === 'payments' && canViewAllPayments() && (
      <div className="overflow-hidden">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              No payments yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">Phone</th>
                  <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">Amount</th>
                  <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">Method</th>
                  <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
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
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
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
        )}
      </div>
    )}

    {/* CAMPAIGNS TAB */}
    {activeTab === 'campaigns' && canViewCampaigns() && (
      <div className="space-y-6">
        {canCreateCampaign() && (
          <AdminCampaignManager onCampaignCreated={handleCampaignCreated} />
        )}
        <CampaignsTab onCampaignCreated={handleCampaignCreated} />
      </div>
    )}
  </div>


      {/* Modals */}
      {isPledgeModalOpen && (
        <PledgeForm
          onClose={() => setIsPledgeModalOpen(false)}
          onSuccess={handlePledgeCreated}
        />
      )}

      {isContributionModalOpen && (
        <ContributionForm
          onClose={() => setIsContributionModalOpen(false)}
          onSuccess={handleContributionCreated}
        />
      )}

      {selectedPledgeForPayment && (
        <MpesaModal
          pledge={selectedPledgeForPayment}
          onClose={() => setSelectedPledgeForPayment(null)}
          onSuccess={handlePaymentComplete}
        />
      )}

      {selectedPledgeForManual && canProcessPayments() && (
        <ManualPaymentModal
          pledge={selectedPledgeForManual}
          onClose={() => setSelectedPledgeForManual(null)}
          onSuccess={handleManualPaymentRecorded}
        />
      )}

      {selectedPledgeForEdit && (
        <EditPledgeModal
          pledge={selectedPledgeForEdit}
          onClose={() => setSelectedPledgeForEdit(null)}
          onSuccess={handlePledgeUpdated}
        />
      )}

      {/* ✅ NEW: Payment History Modal */}
      {selectedPledgeForHistory && (
        <PledgeHistoryModal
          pledge={selectedPledgeForHistory}
          onClose={() => setSelectedPledgeForHistory(null)}
        />
      )}
    </div>
  );
}