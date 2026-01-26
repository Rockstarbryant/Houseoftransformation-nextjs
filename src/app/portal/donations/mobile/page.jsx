// src/app/portal/donations/mobile/page.jsx - SECTION 1: MAIN STRUCTURE
// This is a COMPLETELY SEPARATE mobile-only page
// Copy this to: src/app/portal/donations/mobile/page.jsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDate, joinCampaignsWithPledges } from '@/utils/donationHelpers';

// Import all your existing components (unchanged)
import UserPledgeCards from '@/components/donations/mobile/UserPledgeCards';
import AdminPledgeCards from '@/components/donations/mobile/AdminPledgeCards';
import MobileAnalyticsDashboard from '@/components/donations/mobile/MobileAnalyticsDashboard';
import AdminCampaignManager from '@/components/donations/AdminCampaignManager';
import MobileCampaignsTab from '@/components/donations/mobile/MobileCampaignsTab';
import PledgeForm from '@/components/donations/PledgeForm';
import ContributionForm from '@/components/donations/ContributionForm';
import MpesaModal from '@/components/donations/MpesaModal';
import ManualPaymentModal from '@/components/donations/ManualPaymentModal';
import PledgeHistoryModal from '@/components/donations/PledgeHistoryModal';
import EditPledgeModal from '@/components/donations/EditPledgeModal';

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
  Home,
  BarChart3,
  CreditCard,
  Sun,
  Moon
} from 'lucide-react';
import Link from 'next/link';

export default function MobileDonationsPage() {
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

  // ============================================
  // STATE MANAGEMENT (Keep all your existing state)
  // ============================================
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
  const [selectedPledgeForHistory, setSelectedPledgeForHistory] = useState(null);
  const [selectedPledgeForEdit, setSelectedPledgeForEdit] = useState(null);

  const [stats, setStats] = useState({
    totalRaised: 0,
    pendingPayments: 0,
    activePledges: 0,
    completedPledges: 0
  });

  const [pagination, setPagination] = useState({
    myPledges: { page: 1, limit: 10, total: 0, pages: 0 },
    allPledges: { page: 1, limit: 20, total: 0, pages: 0 },
    payments: { page: 1, limit: 20, total: 0, pages: 0 }
  });

  const fetchInProgress = useRef(false);

  // ============================================
  // PERMISSION CHECK (Keep your existing logic)
  // ============================================
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
    if (!isLoading && !canAccessDonations()) {
      setError('You do not have permission to access donations');
    }
  }, [isLoading]);

  // ============================================
  // FETCH ALL DATA (Keep your existing logic)
  // ============================================
  const fetchAllData = useCallback(async () => {
    if (fetchInProgress.current) {
      console.log('[MOBILE-DONATIONS] Fetch already in progress, skipping...');
      return;
    }
    
    fetchInProgress.current = true;
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('[MOBILE-DONATIONS] Fetching all data...');

      let campaignsData = [];
      let myPledgesData = [];
      let allPledgesData = [];
      let paymentsData = [];

      // Fetch campaigns (MongoDB)
      const campaignsRes = await donationApi.campaigns.getAll({ status: 'active' });
      if (campaignsRes.success) {
        campaignsData = campaignsRes.campaigns || [];
        setCampaigns(campaignsData);
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
      console.error('[MOBILE-DONATIONS] Error fetching data:', err);
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
      console.error('[MOBILE-DONATIONS] Analytics error:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics' && !analyticsData) {
      fetchAnalytics();
    }
  }, [activeTab]);

  // ============================================
  // HANDLERS (Keep your existing handlers)
  // ============================================
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
    setSelectedPledgeForEdit(pledge);
  };

  const handlePledgeUpdated = () => {
    setSelectedPledgeForEdit(null);
    setSuccess('Pledge updated successfully!');
    fetchAllData();
    setTimeout(() => setSuccess(null), 3000);
  };

  // ============================================
  // THEME CLASSES
  // ============================================
  const bg = isDarkMode ? 'bg-slate-900' : 'bg-[#F5F1E8]';
  const cardBg = isDarkMode ? 'bg-slate-800' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const border = isDarkMode ? 'border-slate-700' : 'border-slate-200';

  // ============================================
  // PERMISSION GATE
  // ============================================
  if (!canAccessDonations() && !isLoading) {
    return (
      <div className={`min-h-screen ${bg} p-6`}>
        <Link href="/portal" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-6">
          <ArrowLeft size={20} />
          <span className="text-sm">Back to Dashboard</span>
        </Link>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-3xl p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">
            You do not have permission to access the donations page
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <div className={`min-h-screen ${bg} flex justify-center items-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FDB022] mx-auto mb-4"></div>
          <p className={`text-sm ${textSecondary}`}>Loading donations...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // BOTTOM NAVIGATION ITEMS
  // ============================================
  const navigationItems = [
    {
      id: 'overview',
      label: 'Home',
      icon: Home,
      show: true
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      show: canViewDonationReports()
    },
    {
      id: 'my-pledges',
      label: 'My Pledges',
      icon: Heart,
      show: canViewPledges()
    },
    {
      id: 'all-pledges',
      label: 'All Pledges',
      icon: Users,
      show: canViewAllPledges()
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: Target,
      show: canViewCampaigns()
    }
  ].filter(item => item.show);

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className={`min-h-screen ${bg} pb-24 transition-colors duration-300`}>
      {/* HEADER */}
      <div className={`${cardBg} px-6 pt-6 pb-6 rounded-b-3xl shadow-sm border-b ${border}`}>
        {/* Greeting & Theme Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-black ${textPrimary}`}>
              Hi, {user?.name?.split(' ')[0] || 'Satya'}
            </h1>
            <p className={`text-sm ${textSecondary} mt-1`}>How are you feeling today?</p>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center shadow-sm`}
          >
            {isDarkMode ? <Moon size={20} className="text-yellow-400" /> : <Sun size={20} className="text-yellow-500" />}
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { day: 'Sun', date: '9' },
            { day: 'Mon', date: '20' },
            { day: 'Tue', date: '21' },
            { day: 'Wed', date: '22' },
            { day: 'Thu', date: '23' },
            { day: 'Fri', date: '24' },
            { day: 'Sat', date: '25' }
          ].map((item, idx) => (
            <button
              key={idx}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl font-medium transition-all ${
                idx === 3
                  ? 'bg-[#FDB022] text-white shadow-md scale-105'
                  : `${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-600'}`
              }`}
            >
              <span className="text-xs opacity-70">{item.day}</span>
              <span className="text-2xl font-bold mt-1">{item.date}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SUCCESS/ERROR MESSAGES */}
      <div className="px-4 pt-4">
        {success && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-3 mb-4 animate-fade-in">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <p className="text-green-800 dark:text-green-200 font-semibold text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3 mb-4 animate-fade-in">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-800 dark:text-red-200 font-semibold text-sm">{error}</p>
          </div>
        )}
      </div>
      {/* MAIN CONTENT AREA */}
      <div className="px-4 py-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Featured Action Card */}
            <div className="bg-gradient-to-br from-[#FDB022] to-[#FF9500] rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                  😊
                </div>
                <span className="font-bold text-lg">Daily Affirmations</span>
              </div>
              <p className="text-white/90 text-sm mb-4 leading-relaxed">
                Begin with mindful morning reflections.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <p className="text-white text-xs italic">
                  "Today I choose to focus on gratitude and abundance in all aspects of my life."
                </p>
                <p className="text-white/70 text-xs mt-2">— John Doe</p>
              </div>
            </div>

            {/* Quick Stats - Entries Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${textPrimary}`}>Entries</h3>
                <span className={`text-sm ${textSecondary}`}>January 22, 2026</span>
              </div>

              <div className={`${cardBg} rounded-3xl p-5 shadow-sm border ${border} mb-4`}>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">😊</div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${textPrimary} mb-1`}>Morning Reflection</h4>
                    <p className={`text-xs ${textSecondary} mb-2`}>8:56 pm</p>
                    <p className={`text-sm ${textSecondary} leading-relaxed`}>
                      I woke up to the soft light filtering through my window, an...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Journal Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${textPrimary}`}>Quick Journal</h3>
                <button className={`text-sm text-[#FDB022] font-medium`}>See all</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Pause & Reflect Card */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-3xl p-4 border border-red-100 dark:border-red-900/30">
                  <div className="text-2xl mb-2">🌺</div>
                  <h4 className={`font-semibold text-sm ${textPrimary} mb-1`}>Pause & reflect</h4>
                  <p className={`text-xs ${textSecondary} mb-3`}>What are you grateful fo...</p>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full font-medium">
                      Today
                    </span>
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full font-medium">
                      Personal
                    </span>
                  </div>
                </div>

                {/* Set Intentions Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-3xl p-4 border border-blue-100 dark:border-blue-900/30">
                  <div className="text-2xl mb-2">😊</div>
                  <h4 className={`font-semibold text-sm ${textPrimary} mb-1`}>Set intentions</h4>
                  <p className={`text-xs ${textSecondary} mb-3`}>How do you want to feel?</p>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                      Today
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                      Personal
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Donations Stats Overview */}
            <div className={`${cardBg} rounded-3xl p-6 shadow-sm border ${border}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${textPrimary}`}>Giving Overview</h3>
                <button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {canViewPledges() && (
                  <div className="space-y-1">
                    <p className={`text-sm ${textSecondary}`}>My Pledges</p>
                    <p className={`text-3xl font-bold ${textPrimary}`}>{stats.activePledges}</p>
                  </div>
                )}
                {canViewAllPayments() && (
                  <div className="space-y-1">
                    <p className={`text-sm ${textSecondary}`}>Total Raised</p>
                    <p className={`text-3xl font-bold text-green-600`}>
                      {(stats.totalRaised / 1000).toFixed(1)}K
                    </p>
                  </div>
                )}
                {canViewCampaigns() && (
                  <div className="space-y-1">
                    <p className={`text-sm ${textSecondary}`}>Campaigns</p>
                    <p className={`text-3xl font-bold ${textPrimary}`}>{campaigns.length}</p>
                  </div>
                )}
                {canViewAllPledges() && (
                  <div className="space-y-1">
                    <p className={`text-sm ${textSecondary}`}>All Pledges</p>
                    <p className={`text-3xl font-bold ${textPrimary}`}>{allPledges.length}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {canViewPledges() && (
                <button 
                  onClick={() => setIsPledgeModalOpen(true)}
                  className="bg-gradient-to-br from-[#FDB022] to-[#FF9500] text-white p-4 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  New Pledge
                </button>
              )}
              {canViewCampaigns() && (
                <button 
                  onClick={() => setIsContributionModalOpen(true)}
                  className={`${cardBg} ${textPrimary} p-4 rounded-2xl font-semibold shadow-md border ${border} hover:shadow-lg transition-all flex items-center justify-center gap-2`}
                >
                  <DollarSign size={20} />
                  Contribute
                </button>
              )}
            </div>
          </div>
        )}
        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-3xl p-6 shadow-sm border ${border}`}>
              <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                <BarChart3 size={24} className="text-[#FDB022]" />
                Analytics Dashboard
              </h3>
              {isLoadingAnalytics ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDB022]"></div>
                </div>
              ) : analyticsData ? (
                <MobileAnalyticsDashboard data={analyticsData} />
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className={`${textSecondary}`}>No analytics data available</p>
                  <button
                    onClick={fetchAnalytics}
                    className="mt-4 px-6 py-2 bg-[#FDB022] text-white rounded-full font-semibold"
                  >
                    Load Analytics
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MY PLEDGES TAB */}
        {activeTab === 'my-pledges' && (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-3xl overflow-hidden shadow-sm border ${border}`}>
              <div className="p-6 border-b dark:border-slate-700">
                <h3 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                  <Heart size={24} className="text-[#FDB022]" />
                  My Pledges
                </h3>
                <p className={`text-sm ${textSecondary} mt-1`}>Track your commitments</p>
              </div>
              
              {myPledges.length === 0 ? (
                <div className="p-12 text-center">
                  <Heart size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-semibold mb-2">No pledges yet</p>
                  <p className={`text-sm ${textSecondary} mb-4`}>Start supporting our campaigns</p>
                  <button
                    onClick={() => setIsPledgeModalOpen(true)}
                    className="px-6 py-3 bg-[#FDB022] text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus size={18} className="inline mr-2" />
                    Create Your First Pledge
                  </button>
                </div>
              ) : (
                <div className="p-4">
                  <UserPledgeCards
                      pledges={myPledges}
                      onPayPledge={(pledge) => setSelectedPledgeForPayment(pledge)}
                    />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ALL PLEDGES TAB (Admin) */}
        {activeTab === 'all-pledges' && canViewAllPledges() && (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-3xl overflow-hidden shadow-sm border ${border}`}>
              <div className="p-6 border-b dark:border-slate-700 bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                    <Users size={24} className="text-[#FDB022]" />
                    All Member Pledges
                  </h3>
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full font-semibold">
                    Admin
                  </span>
                </div>
                <p className={`text-sm ${textSecondary}`}>Comprehensive view of all pledges</p>
              </div>
              
              <div className="p-4">
                <AdminPledgeCards
                  pledges={allPledges}
                  onRecordPayment={(pledge) => setSelectedPledgeForManual(pledge)}
                  onViewHistory={(pledge) => setSelectedPledgeForHistory(pledge)}
                  onEditPledge={handleEditPledge}
                  onCancelPledge={handleCancelPledge}
                />
              </div>
            </div>
          </div>
        )}

        {/* CAMPAIGNS TAB */}
        {activeTab === 'campaigns' && canViewCampaigns() && (
          <div className="space-y-6">
            {/* Admin Campaign Manager */}
            <div className="space-y-6">
                    {canCreateCampaign() && (
                      <AdminCampaignManager onCampaignCreated={handleCampaignCreated} />
                    )}
                   
                  </div>

            {/* Campaigns List */}
            <div className={`${cardBg} rounded-3xl p-6 shadow-sm border ${border}`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                <Target size={20} className="text-[#FDB022]" />
                Active Campaigns
              </h3>
              
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Target size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-semibold mb-2">No campaigns yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map(campaign => {
                    const progress = campaign.currentAmount > 0 
                      ? Math.round((campaign.currentAmount / campaign.goalAmount) * 100) 
                      : 0;
                    
                    return (
                      <div key={campaign._id} className={`p-4 rounded-2xl border ${border}`}>
                        <h4 className={`font-bold ${textPrimary} mb-2`}>{campaign.title}</h4>
                        <div className="flex justify-between text-sm mb-2">
                          <span className={textSecondary}>
                            Goal: KES {(campaign.goalAmount / 1000).toFixed(0)}K
                          </span>
                          <span className="font-semibold text-green-600">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className={`text-xs ${textSecondary}`}>
                          Raised: KES {(campaign.currentAmount / 1000).toFixed(1)}K
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Full CampaignsTab Component */}
            <div className={`${cardBg} rounded-3xl overflow-hidden shadow-sm border ${border}`}>
              <MobileCampaignsTab onCampaignCreated={handleCampaignCreated} />
            </div>
          </div>
        )}
      </div>
      {/* BOTTOM NAVIGATION - JOURNAL STYLE */}
      <div className={`fixed bottom-0 left-0 right-0 ${cardBg} border-t ${border} safe-area-bottom`}>
        <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all min-w-0 ${
                  isActive
                    ? 'text-[#FDB022]'
                    : `${textSecondary} hover:${textPrimary}`
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium truncate max-w-full">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODALS - All your existing components work as-is */}
      
      {/* Pledge Form Modal */}
      {isPledgeModalOpen && (
        <PledgeForm
          onClose={() => setIsPledgeModalOpen(false)}
          onSuccess={handlePledgeCreated}
        />
      )}

      {/* Contribution Form Modal */}
      {isContributionModalOpen && (
        <ContributionForm
          onClose={() => setIsContributionModalOpen(false)}
          onSuccess={handleContributionCreated}
        />
      )}

      {/* M-Pesa Payment Modal */}
      {selectedPledgeForPayment && (
        <MpesaModal
          pledge={selectedPledgeForPayment}
          onClose={() => setSelectedPledgeForPayment(null)}
          onSuccess={handlePaymentComplete}
        />
      )}

      {/* Manual Payment Modal (Admin) */}
      {selectedPledgeForManual && canProcessPayments() && (
        <ManualPaymentModal
          pledge={selectedPledgeForManual}
          onClose={() => setSelectedPledgeForManual(null)}
          onSuccess={handleManualPaymentRecorded}
        />
      )}

      {/* Edit Pledge Modal */}
      {selectedPledgeForEdit && (
        <EditPledgeModal
          pledge={selectedPledgeForEdit}
          onClose={() => setSelectedPledgeForEdit(null)}
          onSuccess={handlePledgeUpdated}
        />
      )}

      {/* Payment History Modal */}
      {selectedPledgeForHistory && (
        <PledgeHistoryModal
          pledge={selectedPledgeForHistory}
          onClose={() => setSelectedPledgeForHistory(null)}
        />
      )}

      {/* Floating Action Button - Optional */}
      {canViewPledges() && activeTab === 'overview' && (
        <button
          onClick={() => setIsPledgeModalOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-[#FDB022] to-[#FF9500] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

// ============================================
// END OF COMPONENT - MERGE ALL SECTIONS
// ============================================