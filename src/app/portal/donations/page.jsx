// src/app/portal/donations/page.jsx - COMPLETE WITH GEMINI STYLING
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDate, joinCampaignsWithPledges } from '@/utils/donationHelpers';

// ✅ ALL Components (Nothing Missing)
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
import DonationsMobileNav from '@/components/donations/DonationsMobileNav';

import {
  ArrowLeft, Heart, Plus, RefreshCw, CheckCircle, AlertCircle,
  DollarSign, Target, Users, TrendingUp, X, Activity, ChevronRight, Menu
} from 'lucide-react';
import Link from 'next/link';

// ✅ Gemini's Beautiful Alert Component
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ ALL Modal States (Nothing Missing)
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [selectedPledgeForPayment, setSelectedPledgeForPayment] = useState(null);
  const [selectedPledgeForManual, setSelectedPledgeForManual] = useState(null);
  const [selectedPledgeForHistory, setSelectedPledgeForHistory] = useState(null);
  const [selectedPledgeForEdit, setSelectedPledgeForEdit] = useState(null);

  const canAccessDonations = () => canViewCampaigns() || canViewPledges() || canViewAllPledges() || canViewAllPayments() || canViewDonationReports();

  // ✅ RESTORED: Mobile redirect
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) router.push('/portal/donations/mobile');
  }, [router]);

  // ✅ RESTORED: Check overdue campaigns
  useEffect(() => {
    const checkOverdueCampaigns = async () => {
      try {
        await donationApi.post('/campaigns/check-overdue');
      } catch (err) {
        console.error('[CAMPAIGNS] Failed to check overdue:', err);
      }
    };
    checkOverdueCampaigns();
  }, []);

  // ✅ Data Fetching with FULL TanStack Query config (staleTime, placeholderData restored)
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

  // ✅ RESTORED: Analytics query (lazy loaded)
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

  // Stats calculation with array safety
  const stats = useMemo(() => {
    const safePayments = Array.isArray(payments) ? payments : [];
    const safePledges = Array.isArray(myPledges) && myPledges.length > 0 ? myPledges : (Array.isArray(allPledges) ? allPledges : []);

    const totalRaised = safePayments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const pendingPayments = safePayments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const activePledgesCount = safePledges.filter(p => p.status === 'pending' || p.status === 'partial').length;
    const completedPledgesCount = safePledges.filter(p => p.status === 'completed').length;

    return { totalRaised, pendingPayments, activePledges: activePledgesCount, completedPledges: completedPledgesCount };
  }, [payments, myPledges, allPledges]);

  // ✅ Check if initial loading (no cached data)
  const isInitialLoading = 
    (isFetchingCampaigns && campaigns.length === 0) ||
    (canViewPledges() && isFetchingMyPledges && myPledges.length === 0) ||
    (canViewAllPledges() && isFetchingAllPledges && allPledges.length === 0);

  // ✅ ALL Handlers (Nothing Missing)
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
  
  const handleCancelPledge = async (pledge) => {
    if (!window.confirm(`Cancel pledge for ${pledge.member_name}?`)) return;
    try {
      const res = await donationApi.pledges.cancel(pledge.id);
      if (res.success) {
        showAlert('Pledge cancelled successfully', 'success');
        queryClient.invalidateQueries({ queryKey: ['allPledges'] });
        queryClient.invalidateQueries({ queryKey: ['myPledges'] });
      } else {
        showAlert(res.message || 'Failed to cancel pledge', 'error');
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to cancel pledge', 'error');
    }
  };

  const handleEditPledge = (pledge) => {
    setSelectedPledgeForEdit(pledge);
  };

  // Close mobile menu when tab changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  // ✅ RESTORED: Permission gate screen
  if (!canAccessDonations() && !isInitialLoading) {
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

  // ✅ RESTORED: Initial loading state
  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* 1. HEADER: PREMIUM GLASS CARD (Gemini's Beautiful Style) */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <Link href="/portal" className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">Financial Portal</h1>
              <p className="text-slate-400 mt-2 font-medium">Manage church contributions, pledges, and live campaigns.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button onClick={handleRefresh} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all border border-slate-700">
              <RefreshCw size={20} className={isFetchingCampaigns ? 'animate-spin' : ''} />
            </button>
            {canViewPledges() && (
              <button onClick={() => setIsPledgeModalOpen(true)} className="flex items-center gap-2 px-6 py-4 bg-[#8B1A1A] hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95">
                <Plus size={20} /> New Pledge
              </button>
            )}
            {canViewCampaigns() && (
              <button onClick={() => setIsContributionModalOpen(true)} className="flex items-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95">
                <Activity size={20} /> Contribute
              </button>
            )}
          </div>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B1A1A]/20 blur-[120px] rounded-full -mr-20 -mt-20" />
      </div>

      {/* 2. STATS GRID: NEUMORPHIC STYLE (Gemini's Beautiful Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Raised', value: formatCurrency(stats.totalRaised), icon: DollarSign, color: 'emerald' },
          { label: 'Pending Funds', value: formatCurrency(stats.pendingPayments), icon: TrendingUp, color: 'amber' },
          { label: 'Active Pledges', value: stats.activePledges, icon: Target, color: 'blue' },
          { label: 'Supporters', value: stats.completedPledges, icon: Users, color: 'purple' }
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm group hover:border-[#8B1A1A]/30 transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600`}>
              <item.icon size={24} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{item.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* ✅ RESTORED: Mobile Navigation Cards */}
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

      {/* 3. TABS: MINIMALIST PILL NAV (Gemini Style + ALL Missing Tabs Restored) */}
      <div className="hidden md:flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', show: true },
          { id: 'analytics', label: 'Analytics & Reports', show: canViewDonationReports() },
          { id: 'my-pledges', label: `My Pledges (${myPledges.length})`, show: canViewPledges() },
          { id: 'all-pledges', label: `Admin: All Pledges (${allPledges.length})`, show: canViewAllPledges() },
          { id: 'contributions', label: 'Contributions', show: canViewAllPayments() },
          { id: 'audit', label: 'Audit Log', show: canViewDonationReports() },
          { id: 'payments', label: `Payments (${payments.length})`, show: canViewAllPayments() },
          { id: 'campaigns', label: `Campaigns (${campaigns.length})`, show: canViewCampaigns() }
        ].map(tab => (
          tab.show && (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                ? 'bg-white dark:bg-slate-800 text-[#8B1A1A] shadow-md' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          )
        ))}
      </div>

      {/* 4. CONTENT AREA (Gemini Style + ALL Missing Tabs Restored) */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Live Campaigns</h3>
                <Link href="#" onClick={() => setActiveTab('campaigns')} className="text-[#8B1A1A] text-sm font-bold flex items-center gap-1 hover:underline">
                  View All <ChevronRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaigns.slice(0, 4).map(c => {
                  const progress = Math.min(Math.round((c.currentAmount / c.goalAmount) * 100), 100);
                  return (
                    <div key={c._id} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-[#8B1A1A] transition-colors">{c.title}</h4>
                        <span className="text-[10px] font-black px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg uppercase">Live</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-[#8B1A1A] rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>{formatCurrency(c.currentAmount)}</span>
                        <span>{progress}% of {formatCurrency(c.goalAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ✅ RESTORED: Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="overflow-hidden">
            {isFetchingAnalytics && !analyticsData ? (
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

        {/* My Pledges Tab */}
        {activeTab === 'my-pledges' && <EnhancedUserPledgeView pledges={myPledges} onPayPledge={setSelectedPledgeForPayment} />}
        
        {/* All Pledges Tab (Admin) */}
        {activeTab === 'all-pledges' && canViewAllPledges() && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
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

        {/* ✅ RESTORED: Audit Log Tab */}
        {activeTab === 'audit' && canViewDonationReports() && (
          <TransactionAuditLogTab />
        )}

        {/* ✅ RESTORED: Payments Tab with Full Table */}
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
              <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
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
                      {Array.isArray(payments) && payments.map(payment => (
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
              </div>
            )}
          </div>
        )}

        {/* ✅ RESTORED: Campaigns Tab with AdminCampaignManager */}
        {activeTab === 'campaigns' && canViewCampaigns() && (
          <div className="space-y-6">
            {canCreateCampaign() && (
              <AdminCampaignManager onCampaignCreated={handleCampaignCreated} />
            )}
            <CampaignsTab onCampaignCreated={handleCampaignCreated} />
          </div>
        )}
      </div>

      {/* Alert Portal (Gemini's Beautiful Style) */}
      {alertMessage.message && (
        <Alert message={alertMessage.message} type={alertMessage.type} onClose={() => setAlertMessage({ message: null })} />
      )}

      {/* ✅ ALL Modals (Nothing Missing) */}
      {isPledgeModalOpen && <PledgeForm onClose={() => setIsPledgeModalOpen(false)} onSuccess={handlePledgeCreated} />}
      {isContributionModalOpen && <ContributionForm onClose={() => setIsContributionModalOpen(false)} onSuccess={handleContributionCreated} />}
      {selectedPledgeForPayment && <MpesaModal pledge={selectedPledgeForPayment} onClose={() => setSelectedPledgeForPayment(null)} onSuccess={handlePaymentComplete} />}
      {selectedPledgeForManual && canProcessPayments() && <ManualPaymentModal pledge={selectedPledgeForManual} onClose={() => setSelectedPledgeForManual(null)} onSuccess={handleManualPaymentRecorded} />}
      {selectedPledgeForEdit && <EditPledgeModal pledge={selectedPledgeForEdit} onClose={() => setSelectedPledgeForEdit(null)} onSuccess={handlePledgeUpdated} />}
      {selectedPledgeForHistory && <PledgeHistoryModal pledge={selectedPledgeForHistory} onClose={() => setSelectedPledgeForHistory(null)} />}
    </div>
  );
}