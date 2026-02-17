'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '@/hooks/usePermissions';
import { donationApi } from '@/services/api/donationService';
import { 
  formatCurrency, 
  formatDateShort, 
  getCampaignStatusLabel, 
  calculateCampaignProgress 
} from '@/utils/donationHelpers';
import PrintTableButton from '@/components/common/PrintTableButton';
import ContributionRecordModal from './ContributionRecordModal';
import { 
  Plus, Eye, Edit, Archive, Trash2, CheckCircle, 
  AlertCircle, RefreshCw, Printer, DollarSign, 
  Info, X, AlertTriangle, TrendingUp, Target, Calendar
} from 'lucide-react';
import Link from 'next/link';

// ✅ REDESIGNED: Modern Confirmation Dialog
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = 'warning', confirmText = 'Confirm', isLoading = false }) {
  if (!isOpen) return null;

  const typeStyles = {
    warning: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-900/10 text-rose-600 border-rose-200 dark:border-rose-800',
    info: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 border-blue-200 dark:border-blue-800'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/60 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className={`p-8 flex flex-col items-center text-center ${typeStyles[type]} border-b`}>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm mb-4">
            {type === 'danger' ? <Trash2 size={32} /> : <AlertTriangle size={32} />}
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{message}</p>
        </div>
        <div className="p-6 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 ${
              type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90'
            }`}
          >
            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ REDESIGNED: Admin Edit Modal
function AdminEditCampaignModal({ campaign, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: campaign.title || '',
    description: campaign.description || '',
    impactStatement: campaign.impactStatement || '',
    goalAmount: campaign.goalAmount || '',
    campaignType: campaign.campaignType || 'building',
    startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
    endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
    visibility: campaign.visibility || 'public',
    imageUrl: campaign.imageUrl || '',
    allowPledges: campaign.allowPledges || false,
    isFeatured: campaign.isFeatured || false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await donationApi.campaigns.update(campaign._id, formData);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Update failed:', err);
      alert(err.response?.data?.message || 'Failed to update campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60  overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-500 my-8">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Edit Campaign</h2>
            <p className="text-slate-500 text-sm font-medium">Update the details for "{campaign.title}"</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Campaign Title *</label>
            <input 
              type="text" 
              required 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#8B1A1A] transition-all font-medium text-slate-900 dark:text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Description *</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#8B1A1A] transition-all font-medium text-slate-900 dark:text-white resize-none"
              placeholder="Describe the campaign purpose and goals..."
            />
          </div>

          {/* Impact Statement */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Impact Statement</label>
            <input 
              type="text"
              value={formData.impactStatement}
              onChange={(e) => setFormData({...formData, impactStatement: e.target.value})}
              placeholder="e.g., Your giving will help us reach 500 families"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#8B1A1A] transition-all font-medium text-slate-900 dark:text-white"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goal Amount */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Goal Amount (KES) *</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  required 
                  min="1"
                  step="0.01"
                  value={formData.goalAmount}
                  onChange={(e) => setFormData({...formData, goalAmount: e.target.value})}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#8B1A1A] transition-all font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Campaign Type */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Campaign Type *</label>
              <select
                required
                value={formData.campaignType}
                onChange={(e) => setFormData({...formData, campaignType: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#8B1A1A] transition-all font-bold text-slate-900 dark:text-white"
              >
                <option value="building">Building</option>
                <option value="mission">Mission</option>
                <option value="event">Event</option>
                <option value="equipment">Equipment</option>
                <option value="benevolence">Benevolence</option>
                <option value="offering">General Offering</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Start Date *</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date" 
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#8B1A1A] transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>
            
            {/* End Date */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">End Date *</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date" 
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#8B1A1A] transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({...formData, visibility: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#8B1A1A] transition-all font-medium text-slate-900 dark:text-white"
            >
              <option value="public">👁️ Public (Everyone can see)</option>
              <option value="members-only">🔒 Members Only</option>
            </select>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Image URL</label>
            <input 
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="https://example.com/image.jpg"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#8B1A1A] transition-all font-medium text-slate-900 dark:text-white"
            />
          </div>

          {/* Toggle Switches Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Allow Pledges Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Allow Pledges</label>
              <button 
                type="button"
                onClick={() => setFormData({...formData, allowPledges: !formData.allowPledges})}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-bold ${
                  formData.allowPledges ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {formData.allowPledges ? '✅ Pledges Enabled' : '❌ Pledges Disabled'}
                <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.allowPledges ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.allowPledges ? 'right-1' : 'left-1'}`} />
                </div>
              </button>
            </div>

            {/* Featured Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Featured Status</label>
              <button 
                type="button"
                onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-bold ${
                  formData.isFeatured ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {formData.isFeatured ? '⭐ Featured' : '📄 Standard'}
                <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.isFeatured ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isFeatured ? 'right-1' : 'left-1'}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="px-8 py-4 font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-10 py-4 bg-[#8B1A1A] text-white font-black rounded-2xl shadow-xl shadow-red-900/20 hover:bg-red-800 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Update Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CampaignAnalyticsModal({ campaign, analytics, onClose }) {
  if (!campaign) return null;

  // ✅ FIX: Create a safe data object. If 'analytics' is undefined, use zeros.
  const data = analytics || {
    totalRaised: 0,
    totalPledged: 0,
    totalPaidFromPledges: 0,
    remainingPledges: 0,
    pledgeCount: 0,
    totalDirectContributions: 0,
    contributionCount: 0
  };

  // ✅ Use 'data' instead of 'analytics' to build the stats array
  const stats = [
    { 
      label: 'Total Raised', 
      value: data.totalRaised, // Now safe
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: 'Direct Contributions', 
      value: data.totalDirectContributions, 
      icon: DollarSign, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Total Pledged', 
      value: data.totalPledged, 
      icon: Target, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
  ];

  return (
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl"><TrendingUp size={24} /></div>
              {campaign.title}
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {!analytics ? 'Loading analytics...' : 'Real-time Performance Analytics'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <div key={i} className={`${s.bg} dark:bg-slate-800 p-5 rounded-3xl border border-white dark:border-slate-700 shadow-sm`}>
                <s.icon size={20} className={`${s.color} mb-3`} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{formatCurrency(s.value)}</p>
              </div>
            ))}
          </div>

          {/* Detailed Breakdown - Use 'data' here too */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <div className="w-8 h-[1px] bg-slate-200" /> Pledge Fulfillment Breakdown
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Paid from Pledges</span>
                  <span className="text-sm font-black text-emerald-600">{formatCurrency(data.totalPaidFromPledges)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Outstanding Pledges</span>
                  <span className="text-sm font-black text-rose-500">{formatCurrency(data.remainingPledges)}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-900 dark:text-white font-black">
                    {data.pledgeCount}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400">Total Supporters</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{data.contributionCount} Direct Contributions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-8 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-xl hover:opacity-90 transition-all"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CampaignsTab({ onCampaignCreated }) {
  const queryClient = useQueryClient();
  const { 
    canViewCampaigns, 
    canEditCampaign, 
    canDeleteCampaign, 
    canActivateCampaign, 
    canCreateCampaign 
  } = usePermissions();

  // State Management (Identical Logic)
  const [activeTab, setActiveTab] = useState('active');
  const [selectedCampaignForContribution, setSelectedCampaignForContribution] = useState(null);
  const [campaignToArchive, setCampaignToArchive] = useState(null);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [campaignToEdit, setCampaignToEdit] = useState(null);
  const [isPrintLoading, setIsPrintLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [selectedAnalytics, setSelectedAnalytics] = useState(null);
  

  // TanStack Query (Identical Logic)
const { data: allCampaigns, isLoading, isFetching } = useQuery({
  queryKey: ['campaigns'],
  queryFn: async () => {
    const response = await donationApi.campaigns.getAll();
    return response;
  },
  staleTime: 30000,
});

// Filter campaigns based on activeTab
const campaigns = React.useMemo(() => {
  if (!allCampaigns?.campaigns) return [];
  
  if (activeTab === 'all') return allCampaigns.campaigns;
  
  return allCampaigns.campaigns.filter(c => {
    const campaignStatus = (c.status || '').toLowerCase().trim();
    const filterStatus = activeTab.toLowerCase().trim();
    
    return campaignStatus === filterStatus;
  });
}, [allCampaigns, activeTab]);

// 1. Fetch the analytics data
// ✅ FIXED: Fetch analytics for all campaigns individually
const { data: campaignAnalytics = {} } = useQuery({
  queryKey: ['campaignAnalytics', campaigns?.map(c => c._id)],
  queryFn: async () => {
    const campaignIds = campaigns.map(c => c._id);
    if (campaignIds.length === 0) return {};

    // Fetch analytics for each campaign
    const analyticsPromises = campaignIds.map(id => 
      donationApi.campaigns.getAnalytics(id)
    );
    
    const results = await Promise.all(analyticsPromises);
    
    // Build a map: { campaignId: analyticsData }
    const analyticsMap = {};
    results.forEach((result, index) => {
      if (result.success) {
        analyticsMap[campaignIds[index]] = result.analytics;
      }
    });
    
    return analyticsMap;
  },
  enabled: campaigns?.length > 0,
  staleTime: 30000,
});



// 2. Add the Complete Mutation
const completeMutation = useMutation({
  mutationFn: (id) => donationApi.campaigns.update(id, { status: 'completed' }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    setAlertMessage({ message: 'Campaign marked as completed!', type: 'success' });
  }
});

  const archiveMutation = useMutation({
    mutationFn: (id) => donationApi.campaigns.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setCampaignToArchive(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => donationApi.campaigns.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setCampaignToDelete(null);
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, isFeatured }) => donationApi.campaigns.update(id, { isFeatured }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] })
  });

  const handleShowAnalytics = (campaign) => {
  console.log("Opening analytics for:", campaign.title); // Debug check
  setSelectedAnalytics(campaign);
};

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#8B1A1A] rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse">Syncing Campaigns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. COMPONENT HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Live' },
            { id: 'draft', label: 'Drafts' },
            { id: 'completed', label: 'Completed' },
            { id: 'archived', label: 'Archived' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${
                activeTab === tab.id 
                ? 'bg-white dark:bg-slate-700 text-[#8B1A1A] shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <PrintTableButton 
            elementId="campaigns-table" 
            filename={`campaigns-${activeTab}`} 
            title={`${activeTab.toUpperCase()} CAMPAIGNS REPORT`}
          />
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['campaigns'] })}
            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-100 transition-all"
          >
            <RefreshCw size={20} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. CAMPAIGNS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto overflow-y-visible">
          <table id="campaigns-table" className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Campaign Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Goal & Progress</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timeframe</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Target size={48} className="mb-4" />
                      <p className="font-bold text-lg">No {activeTab} campaigns found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => {
                  const progress = calculateCampaignProgress(campaign.currentAmount, campaign.goalAmount);
                  const statusInfo = getCampaignStatusLabel(campaign.status);
                  const colorMap = {
                  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                  completed: 'bg-blue-100 text-blue-700 border-blue-200',
                  draft: 'bg-amber-100 text-amber-700 border-amber-200',
                  archived: 'bg-slate-100 text-slate-600 border-slate-200'
                };
                
                const style = colorMap[campaign.status] || colorMap.archived;
                  return (
                    <tr key={campaign._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${campaign.isFeatured ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                            {campaign.isFeatured ? <TrendingUp size={20} /> : <Target size={20} />}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white leading-tight">{campaign.title}</p>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-[200px]">{campaign.description || 'No description provided'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-sm font-black text-[#8B1A1A]">{formatCurrency(campaign.currentAmount)}</span>
                            <span className="text-[10px] font-bold text-slate-400">GOAL: {formatCurrency(campaign.goalAmount)}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-emerald-500' : 'bg-[#8B1A1A]'}`} 
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
    activeTab === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
    {statusInfo.label || campaign.status}
  </span>
</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <Calendar size={14} />
                          {formatDateShort(campaign.startDate)} - {formatDateShort(campaign.endDate)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            {/* 1. VIEW ANALYTICS */}
                              <button 
                                onClick={() => handleShowAnalytics(campaign)} 
                                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                                title="View Analytics"
                              >
                                <TrendingUp size={20} />
                              </button>

                              {/* 2. PRINT CAMPAIGN REPORT */}
                              <button 
                                onClick={() => window.print()} // Or your specific print function
                                className="p-2.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group"
                                title="Print Campaign Details"
                              >
                                <Printer size={18} className="group-hover:rotate-12 transition-transform" />
                              </button>

                              {/* 3. MARK AS COMPLETED (Only show if active) */}
                              {canEditCampaign(campaign) && campaign.status === 'active' && (
                                <button 
                                  onClick={() => {
                                    if(confirm('Mark this campaign as completed? This will stop new pledges.')) {
                                      completeMutation.mutate(campaign._id);
                                    }
                                  }}
                                  className="p-2.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all group"
                                  title="Mark as Completed"
                                >
                                  <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                                </button>
                              )}
                            {/* ✅ FIX: Use canEditCampaign(campaign) instead of canRecordContribution() */}
                            {canEditCampaign(campaign) && activeTab === 'active' && (
                              <button 
                                onClick={() => setSelectedCampaignForContribution(campaign)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                                title="Record Contribution"
                              >
                                <Plus size={20} />
                              </button>
                            )}
                          <Link 
                            href={`/campaigns/${campaign._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            title="View Details"
                          >
                            <Eye size={20} />
                          </Link>
                          {canEditCampaign() && (
                            <button 
                              onClick={() => setCampaignToEdit(campaign)}
                              className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
                              title="Edit Campaign"
                            >
                              <Edit size={20} />
                            </button>
                          )}
                          {canEditCampaign(campaign) && campaign.status !== 'archived' && (
                              <button 
                                onClick={() => setCampaignToArchive(campaign)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                title="Archive"
                              >
                                <Archive size={20} />
                              </button>
                            )}
                          {canDeleteCampaign(campaign) && (
                            <button 
                              onClick={() => setCampaignToDelete(campaign)}
                              className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                              title="Delete"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODALS (Maintained Logic) */}
      {selectedCampaignForContribution && (
        <ContributionRecordModal 
          campaign={selectedCampaignForContribution} 
          onClose={() => setSelectedCampaignForContribution(null)} 
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            setSelectedCampaignForContribution(null);
          }}
        />
      )}

      {campaignToEdit && (
        <AdminEditCampaignModal 
          campaign={campaignToEdit} 
          onClose={() => setCampaignToEdit(null)}
          onSuccess={() => setCampaignToEdit(null)}
        />
      )}

      {selectedAnalytics && (
        <CampaignAnalyticsModal 
          campaign={selectedAnalytics} 
          analytics={campaignAnalytics[selectedAnalytics._id]} 
          onClose={() => setSelectedAnalytics(null)} 
        />
      )}

      <ConfirmDialog 
        isOpen={!!campaignToArchive}
        onClose={() => setCampaignToArchive(null)}
        onConfirm={() => archiveMutation.mutate(campaignToArchive._id)}
        isLoading={archiveMutation.isPending}
        title="Archive Campaign"
        message={`Are you sure you want to archive "${campaignToArchive?.title}"? It will no longer be visible for public donations.`}
        confirmText="Archive Now"
      />

      <ConfirmDialog 
        isOpen={!!campaignToDelete}
        onClose={() => setCampaignToDelete(null)}
        onConfirm={() => deleteMutation.mutate(campaignToDelete._id)}
        isLoading={deleteMutation.isPending}
        title="Delete Campaign"
        message={`Warning: Deleting "${campaignToDelete?.title}" is permanent. All associated pledge history will be detached.`}
        type="danger"
        confirmText="Delete Permanently"
      />
    </div>
  );
}