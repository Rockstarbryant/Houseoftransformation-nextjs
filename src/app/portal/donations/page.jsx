'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Plus,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDate, joinCampaignsWithPledges } from '@/utils/donationHelpers';
import MpesaModal from '@/components/donations/MpesaModal';
import PledgeForm from '@/components/donations/PledgeForm';
import ManualPaymentModal from '@/components/donations/ManualPaymentModal';
import AdminCampaignManager from '@/components/donations/AdminCampaignManager';
import AdminDonationStats from '@/components/donations/AdminDonationStats';

export default function DonationsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // ============================================
  // PERMISSION CHECKS
  // ============================================
  const {
    canViewCampaigns,
    canViewPledges,
    canViewAllPledges,
    canViewAllPayments,
    canProcessPayments,
    canViewDonationReports
  } = usePermissions();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Data states
  const [campaigns, setCampaigns] = useState([]);
  const [myPledges, setMyPledges] = useState([]);
  const [allPledges, setAllPledges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRaised: 0,
    pendingPayments: 0,
    activePledges: 0,
    completedPledges: 0
  });

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('my-pledges');
  
  // Modal states
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [selectedPledgeForPayment, setSelectedPledgeForPayment] = useState(null);
  const [selectedPledgeForManual, setSelectedPledgeForManual] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    campaignId: 'all'
  });

  // Pagination states
  const [pagination, setPagination] = useState({
    myPledges: { page: 1, limit: 10, total: 0, pages: 0 },
    allPledges: { page: 1, limit: 20, total: 0, pages: 0 },
    payments: { page: 1, limit: 20, total: 0, pages: 0 }
  });

  // ============================================
  // PERMISSION CHECK ON MOUNT
  // ============================================
  
  const canAccessDonations = () => {
    return canViewCampaigns() || canViewPledges() || canViewAllPledges() || canViewAllPayments();
  };

  useEffect(() => {
    if (!canAccessDonations() && !isLoading) {
      setError('You do not have permission to access donations');
      setIsLoading(false);
    } else {
      fetchAllData();
    }
  }, [user?.role?.permissions]);

  // ============================================
  // DATA FETCHING FUNCTIONS
  // ============================================

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('[DONATIONS] Fetching all data...');

      // Initialize variables outside conditional blocks
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
          
          // Join pledges with campaign data
          const pledgesWithCampaigns = joinCampaignsWithPledges(
            myPledgesData,
            campaignsData
          );
          
          setMyPledges(pledgesWithCampaigns);
          setPagination(prev => ({
            ...prev,
            myPledges: {
              ...prev.myPledges,
              total: pledgesRes.pagination?.total || 0,
              pages: pledgesRes.pagination?.pages || 0
            }
          }));
          console.log('[DONATIONS] My pledges loaded:', pledgesWithCampaigns.length);
        }
      }

      // Fetch all pledges (Admin only)
      if (canViewAllPledges()) {
        const allPledgesRes = await donationApi.pledges.getMyPledges(
          pagination.allPledges.page,
          pagination.allPledges.limit
        );
        
        if (allPledgesRes.success) {
          allPledgesData = allPledgesRes.pledges || [];
          
          const allPledgesWithCampaigns = joinCampaignsWithPledges(
            allPledgesData,
            campaignsData
          );
          
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
          
          // Calculate stats with available data
          calculateStats(paymentsData, myPledgesData.length > 0 ? myPledgesData : allPledgesData);
        }
      }

    } catch (err) {
      console.error('[DONATIONS] Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load donation data');
    } finally {
      setIsLoading(false);
    }
  }, [
    canViewPledges,
    canViewAllPledges,
    canViewAllPayments,
    pagination.myPledges.page,
    pagination.allPledges.page,
    pagination.payments.page
  ]);

  // ============================================
  // CALCULATE STATISTICS
  // ============================================

  const calculateStats = (paymentsData, pledgesData) => {
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
  };

  // ============================================
  // ACTION HANDLERS
  // ============================================

  const handleRefresh = async () => {
    await fetchAllData();
    setSuccess('Data refreshed successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handlePledgeCreated = async () => {
    setIsPledgeModalOpen(false);
    setSuccess('Pledge created successfully!');
    await fetchAllData();
    setTimeout(() => setSuccess(null), 3000);
  };

  const handlePaymentComplete = async () => {
    setSelectedPledgeForPayment(null);
    setSuccess('Payment initiated successfully!');
    await fetchAllData();
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleManualPaymentRecorded = async () => {
    setSelectedPledgeForManual(null);
    setSuccess('Payment recorded successfully!');
    await fetchAllData();
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCampaignCreated = async () => {
    setSuccess('Campaign created successfully!');
    await fetchAllData();
    setTimeout(() => setSuccess(null), 3000);
  };

  // ============================================
  // PAGINATION HANDLERS
  // ============================================

  const handlePageChange = (section, newPage) => {
    setPagination(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        page: newPage
      }
    }));
  };

  // ============================================
  // PERMISSION GATE
  // ============================================

  if (!canAccessDonations() && !isLoading) {
    return (
      <div className="space-y-6">
        <Link href="/portal" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">
            Access Denied
          </h2>
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
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/portal" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-4">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Heart size={40} className="text-[#8B1A1A]" />
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            Donations & Pledges
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Manage campaigns, pledges, and track giving history
        </p>
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

      {/* Admin Campaign Manager */}
      {canViewCampaigns() && (
        <AdminCampaignManager onCampaignCreated={handleCampaignCreated} />
      )}

      {/* Statistics (Admin Only) */}
      {/* Statistics (Admin Only) - UPDATED */}
      {canViewDonationReports() && (
        <AdminDonationStats payments={payments} />
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        {canViewPledges() && (
          <button
            onClick={() => setIsPledgeModalOpen(true)}
            className="px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            New Pledge
          </button>
        )}

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Tabs (Admin Only) */}
      {canViewAllPledges() && (
        <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700">
          <button
            className={`pb-2 px-1 ${
              activeTab === 'my-pledges'
                ? 'border-b-2 border-[#8B1A1A] font-bold text-[#8B1A1A]'
                : 'text-slate-600 dark:text-slate-400'
            }`}
            onClick={() => setActiveTab('my-pledges')}
          >
            My Pledges
          </button>
          <button
            className={`pb-2 px-1 ${
              activeTab === 'all-pledges'
                ? 'border-b-2 border-[#8B1A1A] font-bold text-[#8B1A1A]'
                : 'text-slate-600 dark:text-slate-400'
            }`}
            onClick={() => setActiveTab('all-pledges')}
          >
            All Pledges (Admin)
          </button>
          {canViewAllPayments() && (
            <button
              className={`pb-2 px-1 ${
                activeTab === 'payments'
                  ? 'border-b-2 border-[#8B1A1A] font-bold text-[#8B1A1A]'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              onClick={() => setActiveTab('payments')}
            >
              Payment History
            </button>
          )}
        </div>
      )}

      {/* My Pledges Table */}
      {(activeTab === 'my-pledges' || !canViewAllPledges()) && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            My Active Pledges ({myPledges.length})
          </h3>

          {myPledges.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No pledges yet
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Click "New Pledge" to make your first pledge
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                    <th className="pb-3">Campaign</th>
                    <th className="pb-3">Pledged</th>
                    <th className="pb-3">Paid</th>
                    <th className="pb-3">Remaining</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {myPledges.map((pledge) => (
                    <tr key={pledge.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="py-4 font-medium text-slate-900 dark:text-white">
                        {pledge.campaign_title || 'General Offering'}
                      </td>
                      <td className="py-4">{formatCurrency(pledge.pledged_amount)}</td>
                      <td className="py-4 text-green-600 font-medium">
                        {formatCurrency(pledge.paid_amount)}
                      </td>
                      <td className="py-4 text-red-500 font-medium">
                        {formatCurrency(pledge.remaining_amount)}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            pledge.status === 'completed'
                              ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200'
                              : pledge.status === 'partial'
                              ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200'
                              : 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200'
                          }`}
                        >
                          {pledge.status.charAt(0).toUpperCase() + pledge.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4">
                        {pledge.status !== 'completed' && (
                          <button
                            onClick={() => setSelectedPledgeForPayment(pledge)}
                            className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          >
                            Pay via M-Pesa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.myPledges.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => handlePageChange('myPledges', pagination.myPledges.page - 1)}
                    disabled={pagination.myPledges.page === 1}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {pagination.myPledges.page} of {pagination.myPledges.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange('myPledges', pagination.myPledges.page + 1)}
                    disabled={pagination.myPledges.page === pagination.myPledges.pages}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* All Pledges Table (Admin) */}
      {activeTab === 'all-pledges' && canViewAllPledges() && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            All Member Pledges ({allPledges.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 uppercase text-xs">
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Campaign</th>
                  <th className="px-6 py-3">Pledged</th>
                  <th className="px-6 py-3">Paid</th>
                  <th className="px-6 py-3">Remaining</th>
                  <th className="px-6 py-3">Status</th>
                  {canProcessPayments() && <th className="px-6 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {allPledges.map((pledge) => (
                  <tr key={pledge.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {pledge.member_name}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">
                        {pledge.member_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">{pledge.campaign_title || 'General'}</td>
                    <td className="px-6 py-4 font-semibold">
                      {formatCurrency(pledge.pledged_amount)}
                    </td>
                    <td className="px-6 py-4 text-green-600">
                      {formatCurrency(pledge.paid_amount)}
                    </td>
                    <td className="px-6 py-4 text-red-600">
                      {formatCurrency(pledge.remaining_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          pledge.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {pledge.status}
                      </span>
                    </td>
                    {canProcessPayments() && (
                      <td className="px-6 py-4">
                        {pledge.status !== 'completed' && (
                          <button
                            onClick={() => setSelectedPledgeForManual(pledge)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            Record Payment
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment History (Admin) */}
      {activeTab === 'payments' && canViewAllPayments() && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Payment History ({payments.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">M-Pesa Ref</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="py-3 font-medium">
                      {payment.mpesa_phone_number || 'Manual'}
                    </td>
                    <td className="py-3 font-bold">{formatCurrency(payment.amount)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          payment.status === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 capitalize">{payment.payment_method}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">
                      {payment.mpesa_receipt_number || 'N/A'}
                    </td>
                    <td className="py-3 text-slate-400 dark:text-slate-500">
                      {formatDate(payment.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isPledgeModalOpen && (
        <PledgeForm
          onClose={() => setIsPledgeModalOpen(false)}
          onSuccess={handlePledgeCreated}
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
    </div>
  );
}