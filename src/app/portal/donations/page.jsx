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
  Calendar,
  Settings,
  Printer
} from 'lucide-react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDate, joinCampaignsWithPledges } from '@/utils/donationHelpers';
import MpesaModal from '@/components/donations/MpesaModal';
import PledgeForm from '@/components/donations/PledgeForm';
import ManualPaymentModal from '@/components/donations/ManualPaymentModal';
import AdminCampaignManager from '@/components/donations/AdminCampaignManager';
import AdminDonationStats from '@/components/donations/AdminDonationStats';
import ContributionForm from '@/components/donations/ContributionForm';


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
  const [activeTab, setActiveTab] = useState('statistics');
  const [pledgeSubTab, setPledgeSubTab] = useState('my-pledges');
  
  // Modal states
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [selectedPledgeForPayment, setSelectedPledgeForPayment] = useState(null);
  const [selectedPledgeForManual, setSelectedPledgeForManual] = useState(null);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);

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
        const allPledgesRes = await donationApi.pledges.getAllPledges(
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

  const handleContributionCreated = async () => {
    setIsContributionModalOpen(false);
    setSuccess('Contribution created successfully!');
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
  // PRINT FUNCTIONS
  // ============================================

  const handlePrintCampaigns = () => {
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>All Campaigns Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; background: #fff; color: #000; }
            h1 { color: #8B1A1A; border-bottom: 3px solid #8B1A1A; padding-bottom: 10px; margin-bottom: 20px; }
            .info { margin: 20px 0; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #8B1A1A; }
            .info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            th { background: #8B1A1A; color: white; padding: 12px; text-align: left; font-weight: bold; font-size: 13px; }
            td { padding: 10px 12px; border-bottom: 1px solid #ddd; font-size: 13px; }
            tr:nth-child(even) { background-color: #f9fafb; }
            tr:hover { background: #f1f5f9; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; }
            .badge-green { background: #dcfce7; color: #166534; }
            .badge-yellow { background: #fef3c7; color: #92400e; }
            .badge-red { background: #fee2e2; color: #991b1b; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666; font-size: 12px; }
            @media print { .no-print { display: none !important; } }
          </style>
        </head>
        <body>
          <h1>All Campaigns Report</h1>
          <div class="info">
            <p><strong>Total Campaigns:</strong> ${campaigns.length}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Campaign Title</th>
                <th>Goal</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              ${campaigns.map((campaign, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${campaign.title || 'Untitled'}</strong></td>
                  <td>${formatCurrency(campaign.goalAmount || 0)}</td>
                  <td>
                    <span class="badge ${
                      campaign.status === 'active' ? 'badge-green' : 
                      campaign.status === 'upcoming' ? 'badge-yellow' : 'badge-red'
                    }">
                      ${campaign.status || 'N/A'}
                    </span>
                  </td>
                  <td>${campaign.startDate ? formatDate(campaign.startDate) : 'N/A'}</td>
                  <td>${campaign.endDate ? formatDate(campaign.endDate) : 'Ongoing'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>House of Transformation Church, Mombasa, Kenya</p>
          </div>
          
          <button class="no-print" onclick="window.print()" style="position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #8B1A1A; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Print PDF</button>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handlePrintMyPledges = () => {
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>My Pledges Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; background: #fff; color: #000; }
            h1 { color: #8B1A1A; border-bottom: 3px solid #8B1A1A; padding-bottom: 10px; margin-bottom: 20px; }
            .info { margin: 20px 0; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #8B1A1A; }
            .info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            th { background: #8B1A1A; color: white; padding: 12px; text-align: left; font-weight: bold; font-size: 13px; }
            td { padding: 10px 12px; border-bottom: 1px solid #ddd; font-size: 13px; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; }
            .badge-green { background: #dcfce7; color: #166534; }
            .badge-blue { background: #dbeafe; color: #1e40af; }
            .badge-yellow { background: #fef3c7; color: #92400e; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666; font-size: 12px; }
            @media print { .no-print { display: none !important; } }
          </style>
        </head>
        <body>
          <h1>My Pledges Report</h1>
          <div class="info">
            <p><strong>Member:</strong> ${user?.name || 'N/A'}</p>
            <p><strong>Total Pledges:</strong> ${myPledges.length}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Campaign</th>
                <th>Pledged Amount</th>
                <th>Paid Amount</th>
                <th>Remaining</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${myPledges.map((pledge, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${pledge.campaign_title || 'General Offering'}</strong></td>
                  <td>${formatCurrency(pledge.pledged_amount)}</td>
                  <td style="color: green; font-weight: bold;">${formatCurrency(pledge.paid_amount)}</td>
                  <td style="color: red; font-weight: bold;">${formatCurrency(pledge.remaining_amount)}</td>
                  <td>
                    <span class="badge ${
                      pledge.status === 'completed' ? 'badge-green' : 
                      pledge.status === 'partial' ? 'badge-blue' : 'badge-yellow'
                    }">
                      ${pledge.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>House of Transformation Church, Mombasa, Kenya</p>
          </div>
          
          <button class="no-print" onclick="window.print()" style="position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #8B1A1A; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Print PDF</button>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handlePrintAllPledges = () => {
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>All Pledges Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; background: #fff; color: #000; }
            h1 { color: #8B1A1A; border-bottom: 3px solid #8B1A1A; padding-bottom: 10px; margin-bottom: 20px; }
            .info { margin: 20px 0; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #8B1A1A; }
            .info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            th { background: #8B1A1A; color: white; padding: 12px; text-align: left; font-weight: bold; font-size: 13px; }
            td { padding: 10px 12px; border-bottom: 1px solid #ddd; font-size: 13px; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; }
            .badge-green { background: #dcfce7; color: #166534; }
            .badge-yellow { background: #fef3c7; color: #92400e; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666; font-size: 12px; }
            @media print { .no-print { display: none !important; } }
          </style>
        </head>
        <body>
          <h1>All Member Pledges Report</h1>
          <div class="info">
            <p><strong>Total Records:</strong> ${allPledges.length}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Member</th>
                <th>Phone</th>
                <th>Campaign</th>
                <th>Pledged</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${allPledges.map((pledge, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${pledge.member_name || 'N/A'}</strong></td>
                  <td>${pledge.member_phone || 'N/A'}</td>
                  <td>${pledge.campaign_title || 'General'}</td>
                  <td>${formatCurrency(pledge.pledged_amount)}</td>
                  <td style="color: green;">${formatCurrency(pledge.paid_amount)}</td>
                  <td style="color: red;">${formatCurrency(pledge.remaining_amount)}</td>
                  <td>
                    <span class="badge ${pledge.status === 'completed' ? 'badge-green' : 'badge-yellow'}">
                      ${pledge.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>House of Transformation Church, Mombasa, Kenya</p>
          </div>
          
          <button class="no-print" onclick="window.print()" style="position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #8B1A1A; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Print PDF</button>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handlePrintPayments = () => {
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment History Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; background: #fff; color: #000; }
            h1 { color: #8B1A1A; border-bottom: 3px solid #8B1A1A; padding-bottom: 10px; margin-bottom: 20px; }
            .info { margin: 20px 0; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #8B1A1A; }
            .info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            th { background: #8B1A1A; color: white; padding: 12px; text-align: left; font-weight: bold; font-size: 13px; }
            td { padding: 10px 12px; border-bottom: 1px solid #ddd; font-size: 13px; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; }
            .badge-green { background: #dcfce7; color: #166534; }
            .badge-yellow { background: #fef3c7; color: #92400e; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666; font-size: 12px; }
            @media print { .no-print { display: none !important; } }
          </style>
        </head>
        <body>
          <h1>Payment History Report</h1>
          <div class="info">
            <p><strong>Total Payments:</strong> ${payments.length}</p>
            <p><strong>Total Amount:</strong> ${formatCurrency(payments.reduce((sum, p) => sum + Number(p.amount || 0), 0))}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Phone Number</th>
                <th>Amount</th>
                <th>Method</th>
                <th>M-Pesa Ref</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map((payment, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${payment.mpesa_phone_number || 'Manual'}</td>
                  <td><strong>${formatCurrency(payment.amount)}</strong></td>
                  <td style="text-transform: capitalize;">${payment.payment_method || 'N/A'}</td>
                  <td>${payment.mpesa_receipt_number || 'N/A'}</td>
                  <td>
                    <span class="badge ${payment.status === 'success' ? 'badge-green' : 'badge-yellow'}">
                      ${payment.status}
                    </span>
                  </td>
                  <td>${formatDate(payment.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>House of Transformation Church, Mombasa, Kenya</p>
          </div>
          
          <button class="no-print" onclick="window.print()" style="position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #8B1A1A; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Print PDF</button>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // ============================================
  // PERMISSION GATE
  // ============================================

  if (!canAccessDonations() && !isLoading) {
    return (
      <div className="space-y-6">
        <Link href="/portal" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400">
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
      {/* Page Header with Strategic CTA */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <Link 
              href="/portal" 
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-4"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
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

          {/* Strategic CTA Buttons - Top Right */}
          <div className="flex gap-3">
            {canViewCampaigns() && (
              <Link  
                href="/portal/donations/campaigns"
                className="px-4 py-2.5 bg-red-900 dark:bg-red-700 text-white dark:text-white font-semibold rounded-lg flex items-center gap-6"
              >
                <Settings size={18} />
                View Campaigns
              </Link>
            )}
             {canViewCampaigns() && (
                <div className="mt-8">
                  <AdminCampaignManager onCampaignCreated={handleCampaignCreated} />
                </div>
              )}
          </div>
        </div>
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

      {/* Main Tabs - Statistics & Pledge Management */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-xl px-6">
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-6 py-4 font-semibold text-sm transition-all relative ${
              activeTab === 'statistics'
                ? 'text-[#8B1A1A] bg-white dark:bg-slate-800 border-b-2 border-[#8B1A1A]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Statistics Overview
          </button>
          {(canViewPledges() || canViewAllPledges()) && (
            <button
              onClick={() => setActiveTab('pledge-management')}
              className={`px-6 py-4 font-semibold text-sm transition-all relative ${
                activeTab === 'pledge-management'
                  ? 'text-[#8B1A1A] bg-white dark:bg-slate-800 border-b-2 border-[#8B1A1A]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Pledge Management
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* STATISTICS TAB */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Financial Overview
                </h2>
              </div>

              
              {/* Admin Campaign Manager */}
              

              

              {/* Campaigns List with Print */}
              {canViewCampaigns() && campaigns.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Active Campaigns ({campaigns.length})
                    </h3>
                    <button
                      onClick={handlePrintCampaigns}
                      className="px-4 py-2 bg-[#8B1A1A] text-white font-semibold rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
                    >
                      <Printer size={16} />
                      Print Campaigns
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white dark:bg-slate-800">
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Campaign</th>
                          <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Goal</th>
                          <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                          <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {campaigns.map((campaign) => (
                          <tr key={campaign._id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                              {campaign.title}
                            </td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                              {formatCurrency(campaign.goalAmount)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                campaign.status === 'active'
                                  ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200'
                                  : campaign.status === 'upcoming'
                                  ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                              }`}>
                                {campaign.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                              {campaign.startDate ? formatDate(campaign.startDate) : 'N/A'} - {campaign.endDate ? formatDate(campaign.endDate) : 'Ongoing'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment History with Print (Admin) */}
              {canViewAllPayments() && payments.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Recent Payment History ({payments.length})
                    </h3>
                    <button
                      onClick={handlePrintPayments}
                      className="px-4 py-2 bg-[#8B1A1A] text-white font-semibold rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
                    >
                      <Printer size={16} />
                      Print Payments
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white dark:bg-slate-800">
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Phone</th>
                          <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                          <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Method</th>
                          <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">M-Pesa Ref</th>
                          <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                          <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {payments.slice(0, 10).map((payment) => (
                          <tr key={payment.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                              {payment.mpesa_phone_number || 'Manual'}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300 capitalize">
                              {payment.payment_method}
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                              {payment.mpesa_receipt_number || 'N/A'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                payment.status === 'success'
                                  ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200'
                                  : 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
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

          {/* PLEDGE MANAGEMENT TAB */}
          {activeTab === 'pledge-management' && (
            <div className="space-y-6">
              {/* Pledge Management Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Pledge Management
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
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
                      New Contribution
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-tabs for Pledge Management */}
              {canViewAllPledges() ? (
                <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg px-4">
                  <button
                    onClick={() => setPledgeSubTab('my-pledges')}
                    className={`px-4 py-3 font-medium text-sm transition-all ${
                      pledgeSubTab === 'my-pledges'
                        ? 'text-[#8B1A1A] border-b-2 border-[#8B1A1A]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    My Pledges
                  </button>
                  <button
                    onClick={() => setPledgeSubTab('all-pledges')}
                    className={`px-4 py-3 font-medium text-sm transition-all ${
                      pledgeSubTab === 'all-pledges'
                        ? 'text-[#8B1A1A] border-b-2 border-[#8B1A1A]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    All Pledges
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded">
                      Admin
                    </span>
                  </button>
                  {canViewAllPayments() && (
                    <button
                      onClick={() => setPledgeSubTab('payments')}
                      className={`px-4 py-3 font-medium text-sm transition-all ${
                        pledgeSubTab === 'payments'
                          ? 'text-[#8B1A1A] border-b-2 border-[#8B1A1A]'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      Payment History
                    </button>
                  )}
                </div>
              ) : null}

              {/* My Pledges Table */}
              {(pledgeSubTab === 'my-pledges' || !canViewAllPledges()) && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      My Active Pledges ({myPledges.length})
                    </h3>
                    {myPledges.length > 0 && (
                      <button
                        onClick={handlePrintMyPledges}
                        className="px-4 py-2 bg-[#8B1A1A] text-white font-semibold rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
                      >
                        <Printer size={16} />
                        Print My Pledges
                      </button>
                    )}
                  </div>

                  {myPledges.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
                      <Heart size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                      <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No pledges yet
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Click "New Pledge" to make your first pledge
                      </p>
                      {canViewPledges() && (
                        <button
                          onClick={() => setIsPledgeModalOpen(true)}
                          className="px-6 py-2 bg-[#8B1A1A] text-white font-semibold rounded-lg hover:bg-red-900 transition-colors inline-flex items-center gap-2"
                        >
                          <Plus size={18} />
                          Create Your First Pledge
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white dark:bg-slate-800">
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Campaign</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Pledged</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Paid</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Remaining</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Progress</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {myPledges.map((pledge) => {
                            const progressPercentage = pledge.pledged_amount > 0 
                              ? Math.round((pledge.paid_amount / pledge.pledged_amount) * 100) 
                              : 0;
                            
                            return (
                              <tr key={pledge.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                  {pledge.campaign_title || 'General Offering'}
                                </td>
                                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                                  {formatCurrency(pledge.pledged_amount)}
                                </td>
                                <td className="px-4 py-3 text-green-600 dark:text-green-400 font-semibold">
                                  {formatCurrency(pledge.paid_amount)}
                                </td>
                                <td className="px-4 py-3 text-red-600 dark:text-red-400 font-semibold">
                                  {formatCurrency(pledge.remaining_amount)}
                                </td>
                                <td className="px-4 py-3">
                                  <div style={{ minWidth: '120px' }}>
                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                      {progressPercentage}%
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-green-500 transition-all"
                                        style={{ width: `${progressPercentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    pledge.status === 'completed'
                                      ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200'
                                      : pledge.status === 'partial'
                                      ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200'
                                      : 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200'
                                  }`}>
                                    {pledge.status.charAt(0).toUpperCase() + pledge.status.slice(1)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {pledge.status !== 'completed' && (
                                    <button
                                      onClick={() => setSelectedPledgeForPayment(pledge)}
                                      className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium text-sm transition-colors"
                                    >
                                      Pay via M-Pesa
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Pagination */}
                      {pagination.myPledges.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                          <button
                            onClick={() => handlePageChange('myPledges', pagination.myPledges.page - 1)}
                            disabled={pagination.myPledges.page === 1}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg disabled:opacity-50 font-medium"
                          >
                            Previous
                          </button>
                          <span className="px-4 py-2 text-slate-700 dark:text-slate-300">
                            Page {pagination.myPledges.page} of {pagination.myPledges.pages}
                          </span>
                          <button
                            onClick={() => handlePageChange('myPledges', pagination.myPledges.page + 1)}
                            disabled={pagination.myPledges.page === pagination.myPledges.pages}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg disabled:opacity-50 font-medium"
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
              {pledgeSubTab === 'all-pledges' && canViewAllPledges() && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      All Member Pledges ({allPledges.length})
                    </h3>
                    {allPledges.length > 0 && (
                      <button
                        onClick={handlePrintAllPledges}
                        className="px-4 py-2 bg-[#8B1A1A] text-white font-semibold rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
                      >
                        <Printer size={16} />
                        Print All Pledges
                      </button>
                    )}
                  </div>

                  {allPledges.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
                      <Users size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                      <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No pledges found
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Member pledges will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white dark:bg-slate-800">
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Member</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Campaign</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Pledged</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Paid</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Remaining</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                            {canProcessPayments() && (
                              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {allPledges.map((pledge) => (
                            <tr key={pledge.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-900 dark:text-white">
                                  {pledge.member_name || 'N/A'}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {pledge.member_phone || 'N/A'}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                                {pledge.campaign_title || 'General'}
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                                {formatCurrency(pledge.pledged_amount)}
                              </td>
                              <td className="px-4 py-3 text-green-600 dark:text-green-400 font-semibold">
                                {formatCurrency(pledge.paid_amount)}
                              </td>
                              <td className="px-4 py-3 text-red-600 dark:text-red-400 font-semibold">
                                {formatCurrency(pledge.remaining_amount)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                  pledge.status === 'completed'
                                    ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-200'
                                    : 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-200'
                                }`}>
                                  {pledge.status}
                                </span>
                              </td>
                              {canProcessPayments() && (
                                <td className="px-4 py-3">
                                  {pledge.status !== 'completed' && (
                                    <button
                                      onClick={() => setSelectedPledgeForManual(pledge)}
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium underline"
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
                  )}
                </div>
              )}

              {/* Payment History (Admin) */}
              {pledgeSubTab === 'payments' && canViewAllPayments() && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Payment History ({payments.length})
                    </h3>
                    {payments.length > 0 && (
                      <button
                        onClick={handlePrintPayments}
                        className="px-4 py-2 bg-[#8B1A1A] text-white font-semibold rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
                      >
                        <Printer size={16} />
                        Print Payments
                      </button>
                    )}
                  </div>

                  {payments.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
                      <DollarSign size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                      <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No payments yet
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Payment records will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white dark:bg-slate-800">
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Phone</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Method</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">M-Pesa Ref</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {payments.map((payment) => (
                            <tr key={payment.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                {payment.mpesa_phone_number || 'Manual'}
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  payment.status === 'success'
                                    ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-200'
                                    : 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-200'
                                }`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 capitalize text-slate-700 dark:text-slate-300">
                                {payment.payment_method}
                              </td>
                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                {payment.mpesa_receipt_number || 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
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
            </div>
          )}
        </div>
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
    </div>
  );
}

