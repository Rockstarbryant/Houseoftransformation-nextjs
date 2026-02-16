// src/app/portal/donations/mobile/page.jsx
// ✅ ENHANCED MOBILE VERSION - Complete with ALL PC features
// Maintains mobile-optimized UI while adding TanStack Query, custom alerts, and all missing features

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDate, joinCampaignsWithPledges } from '@/utils/donationHelpers';

// ✅ Import all mobile-optimized components
import MobileEnhancedUserPledgeView from '@/components/donations/mobile/MobileEnhancedUserPledgeView';
import EnhancedAdminPledgeCards from '@/components/donations/mobile/AdminPledgeCards';
import MobileAnalyticsDashboard from '@/components/donations/mobile/MobileAnalyticsDashboard';
import MobileCampaignsTab from '@/components/donations/mobile/EnhancedMobileCampaignsTab';
import AdminCampaignManager from '@/components/donations/AdminCampaignManager';

// ✅ Import shared components
import PledgeForm from '@/components/donations/PledgeForm';
import ContributionForm from '@/components/donations/ContributionForm';
import MpesaModal from '@/components/donations/MpesaModal';
import ManualPaymentModal from '@/components/donations/ManualPaymentModal';
import PledgeHistoryModal from '@/components/donations/PledgeHistoryModal';
import EditPledgeModal from '@/components/donations/EditPledgeModal';

// ✅ NEW: Import missing PC components (will adapt for mobile)
import MobileContributionsTab from '@/components/donations/mobile/MobileContributionsTab';
import TransactionAuditLogTab from '@/components/donations/TransactionAuditLogTab';

import {
  ArrowLeft, Heart, Plus, RefreshCw, CheckCircle, AlertCircle,
  DollarSign, Target, Users, TrendingUp, Home, BarChart3,
  CreditCard, X, AlertTriangle, Info, Menu
} from 'lucide-react';
import Link from 'next/link';

// ============================================
// ✅ CUSTOM ALERT COMPONENT (From PC)
// Beautiful animated toast notifications
// ============================================
function Alert({ message, type = 'success', onClose }) {
  if (!message) return null;
  
  const styles = {
    success: 'bg-emerald-500 text-white border-emerald-400',
    error: 'bg-rose-500 text-white border-rose-400'
  };
  
  return (
    <div className={`fixed bottom-24 left-4 right-4 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-5 duration-300 ${styles[type]}`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <p className="font-bold flex-1">{message}</p>
      <button onClick={onClose} className="hover:rotate-90 transition-transform">
        <X size={18} />
      </button>
    </div>
  );
}

// ============================================
// ✅ CUSTOM CONFIRM DIALOG COMPONENT (From PC)
// Modern confirmation dialogs instead of native alert()
// ============================================
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = 'warning', confirmText = 'Confirm', isLoading = false }) {
  if (!isOpen) return null;

  const typeStyles = {
    warning: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
  };

  const typeIcons = {
    warning: <AlertTriangle className="w-6 h-6" />,
    danger: <AlertCircle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${typeStyles[type]}`}>
              {typeIcons[type]}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-[#8B1A1A] hover:bg-red-900'
            }`}
          >
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function MobileDonationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
  // STATE MANAGEMENT
  // ============================================
  const [activeTab, setActiveTab] = useState('overview');
  
  
  // ✅ NEW: Alert state (replacing success/error states)
  const [alertMessage, setAlertMessage] = useState({ message: null, type: 'success' });
  
  // ✅ NEW: Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    action: null, 
    pledgeId: null,
    title: '',
    message: ''
  });

  // Modal states
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [selectedPledgeForPayment, setSelectedPledgeForPayment] = useState(null);
  const [selectedPledgeForManual, setSelectedPledgeForManual] = useState(null);
  const [selectedPledgeForHistory, setSelectedPledgeForHistory] = useState(null);
  const [selectedPledgeForEdit, setSelectedPledgeForEdit] = useState(null);

  // ============================================
  // PERMISSION CHECK
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

  // ============================================
  // ✅ NEW: Check overdue campaigns (from PC)
  // ============================================
  useEffect(() => {
    const checkOverdueCampaigns = async () => {
      try {
        await donationApi.campaigns.checkOverdue?.();
      } catch (err) {
        console.error('[CAMPAIGNS] Failed to check overdue:', err);
      }
    };
    if (canAccessDonations()) {
      checkOverdueCampaigns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // ✅ DATA FETCHING WITH TANSTACK QUERY (From PC)
  // Replaces manual useState + useEffect
  // ============================================
  
  // Fetch campaigns
  const { data: campaigns = [], isFetching: isFetchingCampaigns } = useQuery({
    queryKey: ['campaigns', { status: 'active' }],
    queryFn: async () => {
      const res = await donationApi.campaigns.getAll({ status: 'active' });
      console.log('[MOBILE-DONATIONS] Campaigns loaded:', res.campaigns?.length);
      return res.success ? (res.campaigns || []) : [];
    },
    enabled: canAccessDonations(),
    staleTime: 30000,
    placeholderData: [],
    refetchOnWindowFocus: true,
  });

  // Fetch user's pledges
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

  // Fetch all pledges (Admin)
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

  // Fetch payments
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

  // ✅ Fetch analytics (lazy loaded when tab is active)
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
    placeholderData: null,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const safePayments = Array.isArray(payments) ? payments : [];
    const safePledges = Array.isArray(myPledges) && myPledges.length > 0 
      ? myPledges 
      : (Array.isArray(allPledges) ? allPledges : []);

    const totalRaised = safePayments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const pendingPayments = safePayments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const activePledgesCount = safePledges.filter(p => p.status === 'pending' || p.status === 'partial').length;
    const completedPledgesCount = safePledges.filter(p => p.status === 'completed').length;

    return { 
      totalRaised, 
      pendingPayments, 
      activePledges: activePledgesCount, 
      completedPledges: completedPledgesCount 
    };
  }, [payments, myPledges, allPledges]);

  // Check if initial loading
  const isInitialLoading = 
    (isFetchingCampaigns && campaigns.length === 0) ||
    (canViewPledges() && isFetchingMyPledges && myPledges.length === 0) ||
    (canViewAllPledges() && isFetchingAllPledges && allPledges.length === 0);

  // ============================================
  // ✅ HANDLERS (Enhanced with TanStack Query invalidation)
  // ============================================
  
  const showAlert = (message, type = 'success') => {
    setAlertMessage({ message, type });
    setTimeout(() => setAlertMessage({ message: null, type: 'success' }), 5000);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    queryClient.invalidateQueries({ queryKey: ['myPledges'] });
    queryClient.invalidateQueries({ queryKey: ['allPledges'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    showAlert('Syncing complete', 'success');
  };

  const handlePledgeCreated = () => { 
    setIsPledgeModalOpen(false); 
    showAlert('Pledge created successfully!', 'success');
    queryClient.invalidateQueries({ queryKey: ['myPledges'] });
    queryClient.invalidateQueries({ queryKey: ['allPledges'] });
  };
  
  const handleContributionCreated = () => { 
    setIsContributionModalOpen(false); 
    showAlert('Contribution recorded successfully!', 'success');
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  };
  
  const handlePaymentComplete = () => { 
    setSelectedPledgeForPayment(null); 
    showAlert('Payment initiated successfully!', 'success');
    queryClient.invalidateQueries({ queryKey: ['myPledges'] });
    queryClient.invalidateQueries({ queryKey: ['allPledges'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
  };

  const handleManualPaymentRecorded = () => {
    setSelectedPledgeForManual(null);
    showAlert('Payment recorded successfully!', 'success');
    queryClient.invalidateQueries({ queryKey: ['allPledges'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
  };
  
  const handleCampaignCreated = () => {
    showAlert('Campaign created successfully!', 'success');
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  };
  
  const handlePledgeUpdated = () => { 
    setSelectedPledgeForEdit(null); 
    showAlert('Pledge updated successfully!', 'success');
    queryClient.invalidateQueries({ queryKey: ['allPledges'] });
    queryClient.invalidateQueries({ queryKey: ['myPledges'] });
  };

  // ✅ NEW: Confirm dialog for cancel pledge
  const handleCancelPledge = (pledge) => {
    setConfirmDialog({
      isOpen: true,
      action: 'cancel',
      pledgeId: pledge.id,
      title: 'Cancel Pledge?',
      message: `Are you sure you want to cancel the pledge for ${pledge.member_name}?\n\nThis action cannot be undone.`,
      type: 'danger'
    });
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.action === 'cancel' && confirmDialog.pledgeId) {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      
      try {
        const res = await donationApi.pledges.cancel(confirmDialog.pledgeId);
        if (res.success) {
          showAlert('Pledge cancelled successfully', 'success');
          queryClient.invalidateQueries({ queryKey: ['allPledges'] });
          queryClient.invalidateQueries({ queryKey: ['myPledges'] });
          setConfirmDialog({ isOpen: false, action: null, pledgeId: null });
        } else {
          showAlert(res.message || 'Failed to cancel pledge', 'error');
          setConfirmDialog(prev => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Failed to cancel pledge', 'error');
        setConfirmDialog(prev => ({ ...prev, isLoading: false }));
      }
    }
  };

  const handleEditPledge = (pledge) => {
    setSelectedPledgeForEdit(pledge);
  };

  // ============================================
  // PERMISSION GATE
  // ============================================
  if (!canAccessDonations() && !isInitialLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 p-6">
        <Link href="/portal" className="inline-flex items-center gap-2 text-[#FDB022] hover:text-[#FF9500] mb-6">
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Dashboard</span>
        </Link>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">Access Denied</h2>
          <p className="text-sm text-red-700 dark:text-red-300">
            You don&apos;t have permission to access donations
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // INITIAL LOADING STATE
  // ============================================
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FDB022] mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-semibold">Loading donations...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // NAVIGATION ITEMS
  // ============================================
  const navigationItems = [
    { id: 'overview', label: 'Home', icon: Home, show: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, show: canViewDonationReports() },
    { id: 'my-pledges', label: 'My Pledges', icon: Heart, show: canViewPledges() },
    { id: 'all-pledges', label: 'All Pledges', icon: Users, show: canViewAllPledges() },
    { id: 'contributions', label: 'Contributions', icon: DollarSign, show: canViewAllPayments() },
    { id: 'campaigns', label: 'Campaigns', icon: Target, show: canViewCampaigns() },
  ].filter(item => item.show);
  

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={`min-h-screen w-full  bg-slate-50 dark:bg-slate-950 pb-24`}>
      {/* HEADER */}
      <div className="w-full bg-gradient-to-r from-[#8B1A1A] to-[#6B1515] text-white shadow-lg">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/portal" className="flex items-center gap-2 text-white/80 hover:text-white">
              <ArrowLeft size={20} />
              <span className="text-sm font-semibold">Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                disabled={isFetchingCampaigns}
              >
                <RefreshCw size={18} className={isFetchingCampaigns ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-black mb-1">Financial Portal</h1>
            <p className="text-white/70 text-sm">Manage pledges & contributions</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-4 flex gap-2">
          {canViewPledges() && (
            <button
              onClick={() => setIsPledgeModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#8B1A1A] rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              <Plus size={18} />
              <span className="text-sm">New Pledge</span>
            </button>
          )}
          {canViewCampaigns() && (
            <button
              onClick={() => setIsContributionModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              <DollarSign size={18} />
              <span className="text-sm">Contribute</span>
            </button>
          )}
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="w-full">
        

        {/* TABS CONTENT */}
        <div className="w-full space-y-5 divide-y divide-slate-200 dark:divide-slate-800">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className={`bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl sm:mx-3 md:rounded-3xl md:mx-4 shadow-sm border border-slate-200 dark:border-slate-800`}>
                <h3 className={`text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2`}>
                  <Target size={20} className="text-[#FDB022]" />
                  Live Campaigns
                </h3>
                
                {campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Target size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className={`text-sm text-slate-600 dark:text-slate-400`}>No active campaigns</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaigns.slice(0, 4).map(campaign => {
                      const progress = campaign.currentAmount > 0 
                        ? Math.round((campaign.currentAmount / campaign.goalAmount) * 100) 
                        : 0;
                      
                      return (
                        <div key={campaign._id} className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow`}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`font-bold text-slate-900 dark:text-white flex-1`}>{campaign.title}</h4>
                            <span className="text-[10px] font-black px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg uppercase">Live</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                            <div 
                              className="h-full bg-gradient-to-r from-[#FDB022] to-[#FF9500] rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600 dark:text-slate-400">
                              {formatCurrency(campaign.currentAmount)}
                            </span>
                            <span className="font-semibold text-[#FDB022]">
                              {progress}% of {formatCurrency(campaign.goalAmount)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    
                    {campaigns.length > 4 && (
                      <button
                        onClick={() => setActiveTab('campaigns')}
                        className="w-full py-3 text-[#FDB022] font-bold text-sm hover:underline"
                      >
                        View All {campaigns.length} Campaigns →
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className={`bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800`}>
                <h4 className={`font-bold text-slate-900 dark:text-white mb-3 text-sm`}>Quick Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">My Pledges:</span>
                    <span className={`font-bold text-slate-900 dark:text-white`}>{myPledges.length}</span>
                  </div>
                  {canViewAllPledges() && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">All Pledges:</span>
                      <span className={`font-bold text-slate-900 dark:text-white`}>{allPledges.length}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Active Campaigns:</span>
                    <span className={`font-bold text-slate-900 dark:text-white`}>{campaigns.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && canViewDonationReports() && (
            <div className="-mx-0">
              {isFetchingAnalytics && !analyticsData ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDB022]"></div>
                </div>
              ) : analyticsData ? (
                <MobileAnalyticsDashboard data={analyticsData} isLoading={false} />
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 text-center">
                  <p className="text-yellow-800 dark:text-yellow-200">No analytics data available</p>
                </div>
              )}
            </div>
          )}

          {/* MY PLEDGES TAB */}
          {activeTab === 'my-pledges' && canViewPledges() && (
            <div className="space-y-6">
              <div className={`bg-white dark:bg-slate-900 overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800`}>
                <div className="p-6 border-b dark:border-slate-700">
                  <h3 className={`text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2`}>
                    <Heart size={24} className="text-[#FDB022]" />
                    My Pledges
                  </h3>
                  <p className={`text-sm text-slate-600 dark:text-slate-400 mt-1`}>Track your commitments</p>
                </div>
                
                {myPledges.length === 0 ? (
                  <div className="p-12 text-center">
                    <Heart size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-semibold mb-2">No pledges yet</p>
                    <p className={`text-sm text-slate-600 dark:text-slate-400 mb-4`}>Start supporting our campaigns</p>
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
                    <MobileEnhancedUserPledgeView
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
              <div className={`bg-white dark:bg-slate-900 overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800`}>
                <div className="p-6 border-b dark:border-slate-700 bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2`}>
                      <Users size={24} className="text-[#FDB022]" />
                      All Member Pledges
                    </h3>
                    <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full font-semibold">
                      Admin
                    </span>
                  </div>
                  <p className={`text-sm text-slate-600 dark:text-slate-400`}>Comprehensive view of all pledges</p>
                </div>
                
                <div className="p-4">
                  <EnhancedAdminPledgeCards
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

          {/* ✅ NEW: CONTRIBUTIONS TAB */}
          {activeTab === 'contributions' && canViewAllPayments() && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard size={24} className="text-[#FDB022]" />
                    Contributions
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    All standalone contributions
                  </p>
                </div>
                <div className="p-4">
                  <MobileContributionsTab />
                </div>
              </div>
            </div>
          )}

          {/* CAMPAIGNS TAB */}
          {activeTab === 'campaigns' && canViewCampaigns() && (
            <div className="mt-4 space-y-6">
              {canCreateCampaign() && (
                <AdminCampaignManager onCampaignCreated={handleCampaignCreated} />
              )}
              
              <div className={`bg-white dark:bg-slate-900 overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800`}>
                <MobileCampaignsTab onCampaignCreated={handleCampaignCreated} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM NAVIGATION */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-bottom z-50 backdrop-blur-md`}>
        <div className="flex items-center justify-between md:justify-around px-4 py-3 w-full max-w-screen-sm mx-auto">
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
                    : `text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white`
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium truncate max-w-full">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ✅ ALERT COMPONENT */}
      {alertMessage.message && (
        <Alert 
          message={alertMessage.message} 
          type={alertMessage.type} 
          onClose={() => setAlertMessage({ message: null, type: 'success' })} 
        />
      )}

      {/* ✅ CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: null, pledgeId: null })}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type || 'warning'}
        confirmText="Yes, Cancel Pledge"
        isLoading={confirmDialog.isLoading}
      />

      {/* MODALS */}
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

      {selectedPledgeForHistory && (
        <PledgeHistoryModal
          pledge={selectedPledgeForHistory}
          onClose={() => setSelectedPledgeForHistory(null)}
        />
      )}
    </div>
  );
}