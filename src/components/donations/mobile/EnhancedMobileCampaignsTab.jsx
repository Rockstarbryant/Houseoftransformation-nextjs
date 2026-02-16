// components/donations/mobile/CompleteMobileCampaignsTab.jsx
// ✅ COMPLETE MOBILE VERSION - All 30+ PC features professionally implemented

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
import ContributionRecordModal from '@/components/donations/ContributionRecordModal';
import { 
  Plus, Eye, Edit, Archive, Trash2, CheckCircle, 
  AlertCircle, RefreshCw, Printer, DollarSign, 
  Info, X, AlertTriangle, TrendingUp, Target, Calendar,
  ChevronDown, Star, Users
} from 'lucide-react';
import Link from 'next/link';

// ============================================
// CONFIRM DIALOG COMPONENT
// ============================================
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = 'warning', confirmText = 'Confirm', isLoading = false }) {
  if (!isOpen) return null;

  const typeStyles = {
    warning: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300">
        <div className={`p-6 flex flex-col items-center text-center border-b ${typeStyles[type]}`}>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-700 shadow-sm mb-3">
            {type === 'danger' ? <Trash2 size={28} /> : type === 'warning' ? <AlertTriangle size={28} /> : <Info size={28} />}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm">{message}</p>
        </div>
        <div className="p-4 flex gap-3">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 ${
              type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#8B1A1A] hover:bg-red-900'
            }`}
          >
            {isLoading && <RefreshCw className="animate-spin" size={16} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ALERT COMPONENT
// ============================================
function Alert({ message, onClose }) {
  if (!message) return null;
  
  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl bg-emerald-500 text-white animate-in slide-in-from-bottom-5 duration-300">
      <CheckCircle size={20} />
      <p className="font-bold flex-1">{message}</p>
      <button onClick={onClose} className="hover:rotate-90 transition-transform"><X size={18} /></button>
    </div>
  );
}

// ============================================
// EDIT CAMPAIGN MODAL (ALL 11 FIELDS)
// ============================================
function MobileEditCampaignModal({ campaign, onClose, onSuccess }) {
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
    allowPledges: campaign.allowPledges !== undefined ? campaign.allowPledges : false,
    isFeatured: campaign.isFeatured !== undefined ? campaign.isFeatured : false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await donationApi.campaigns.update(campaign._id, formData);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        onSuccess('Campaign updated successfully');
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-t-3xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Campaign</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Update "{campaign.title}"</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:bg-slate-700 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Campaign Title *</label>
            <input 
              type="text" 
              required 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#FDB022] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Description *</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#FDB022] outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Impact Statement</label>
            <input 
              type="text"
              value={formData.impactStatement}
              onChange={(e) => setFormData({...formData, impactStatement: e.target.value})}
              placeholder="e.g., Your giving will help us reach 500 families"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#FDB022] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Goal Amount (KES) *</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="number" 
                required 
                min="1"
                step="0.01"
                value={formData.goalAmount}
                onChange={(e) => setFormData({...formData, goalAmount: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#FDB022] outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Campaign Type *</label>
            <select
              required
              value={formData.campaignType}
              onChange={(e) => setFormData({...formData, campaignType: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#FDB022] outline-none"
            >
              <option value="building">🏛️ Building</option>
              <option value="mission">🌍 Mission</option>
              <option value="event">🎉 Event</option>
              <option value="equipment">🎸 Equipment</option>
              <option value="benevolence">❤️ Benevolence</option>
              <option value="offering">🙏 General Offering</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Start Date *</label>
              <input 
                type="date" 
                required
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#FDB022] outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">End Date *</label>
              <input 
                type="date" 
                required
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#FDB022] outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({...formData, visibility: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#FDB022] outline-none"
            >
              <option value="public">👁️ Public (Everyone can see)</option>
              <option value="members-only">🔒 Members Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Image URL</label>
            <input 
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#FDB022] outline-none"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Allow Pledges</label>
              <button 
                type="button"
                onClick={() => setFormData({...formData, allowPledges: !formData.allowPledges})}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold ${
                  formData.allowPledges ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-2 border-blue-200' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-2 border-slate-200'
                }`}
              >
                <span className="text-sm">{formData.allowPledges ? '✅ Pledges Enabled' : '❌ Pledges Disabled'}</span>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.allowPledges ? 'bg-blue-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.allowPledges ? 'right-1' : 'left-1'}`} />
                </div>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Featured Status</label>
              <button 
                type="button"
                onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold ${
                  formData.isFeatured ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-2 border-emerald-200' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-2 border-slate-200'
                }`}
              >
                <span className="text-sm">{formData.isFeatured ? '⭐ Featured' : '📄 Standard'}</span>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isFeatured ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isFeatured ? 'right-1' : 'left-1'}`} />
                </div>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-slate-800 pb-4">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#FDB022] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Update
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// ANALYTICS MODAL (ALL 7 DATA POINTS)
// ============================================
function MobileCampaignAnalyticsModal({ campaign, analytics, onClose }) {
  if (!campaign) return null;

  const data = analytics || {
    totalRaised: 0,
    totalPledged: 0,
    totalPaidFromPledges: 0,
    remainingPledges: 0,
    pledgeCount: 0,
    totalDirectContributions: 0,
    contributionCount: 0
  };

  const progress = calculateCampaignProgress(data.totalRaised, campaign.goalAmount);

  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-t-3xl w-full max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 bg-gradient-to-br from-[#8B1A1A] to-red-800 text-white p-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp size={20} />
              {campaign.title}
            </h2>
            <p className="text-white/80 text-xs mt-1">
              {!analytics ? 'Loading analytics...' : 'Real-time Performance Analytics'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-gradient-to-br from-[#FDB022] to-[#FF9500] text-white p-6 rounded-2xl">
            <p className="text-white/90 text-sm mb-2">Campaign Progress</p>
            <p className="text-5xl font-black mb-4">{progress}%</p>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <TrendingUp size={20} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Total Raised</p>
                  <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{formatCurrency(data.totalRaised)}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <DollarSign size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">Direct Gifts</p>
                  <p className="text-2xl font-black text-blue-900 dark:text-blue-100">{formatCurrency(data.totalDirectContributions)}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <Target size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Total Pledged</p>
                  <p className="text-2xl font-black text-amber-900 dark:text-amber-100">{formatCurrency(data.totalPledged)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Pledge Fulfillment</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Paid from Pledges</span>
                <span className="text-sm font-bold text-emerald-600">{formatCurrency(data.totalPaidFromPledges)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Outstanding</span>
                <span className="text-sm font-bold text-rose-600">{formatCurrency(data.remainingPledges)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                <Users size={32} className="text-purple-700 dark:text-purple-200" />
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">Total Supporters</p>
                <p className="text-3xl font-black text-purple-900 dark:text-purple-100">{data.pledgeCount}</p>
                <p className="text-sm text-purple-700 dark:text-purple-300">{data.contributionCount} Direct Contributions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4">
          <button 
            onClick={onClose} 
            className="w-full px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function EnhancedMobileCampaignsTab({ onCampaignCreated }) {
  const queryClient = useQueryClient();
  const { 
    canViewCampaigns, 
    canEditCampaign, 
    canDeleteCampaign, 
    canActivateCampaign,
    canCreateCampaign 
  } = usePermissions();

  // STATE (8 VARIABLES)
  const [activeTab, setActiveTab] = useState('active');
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedCampaignForContribution, setSelectedCampaignForContribution] = useState(null);
  const [campaignToEdit, setCampaignToEdit] = useState(null);
  const [campaignToArchive, setCampaignToArchive] = useState(null);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [selectedAnalytics, setSelectedAnalytics] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  // TANSTACK QUERY (2 QUERIES)
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

  const { data: campaignAnalytics = {} } = useQuery({
    queryKey: ['campaignAnalytics', campaigns?.map(c => c._id)],
    queryFn: async () => {
      const campaignIds = campaigns.map(c => c._id);
      if (campaignIds.length === 0) return {};

      const analyticsPromises = campaignIds.map(id => 
        donationApi.campaigns.getAnalytics(id)
      );
      
      const results = await Promise.all(analyticsPromises);
      
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

  // MUTATIONS (4 MUTATIONS)
  const completeMutation = useMutation({
    mutationFn: (id) => donationApi.campaigns.update(id, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      showAlert('Campaign marked as completed!');
    }
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => donationApi.campaigns.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      showAlert('Campaign archived successfully');
      setCampaignToArchive(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => donationApi.campaigns.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      showAlert('Campaign deleted successfully');
      setCampaignToDelete(null);
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, isFeatured }) => donationApi.campaigns.update(id, { isFeatured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });

  // HANDLERS
  const showAlert = (message) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleShowAnalytics = (campaign) => {
    setSelectedAnalytics(campaign);
  };

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#FDB022] rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse">Syncing Campaigns...</p>
      </div>
    );
  }

  // RENDER
  return (
    <div className="max-w-full px-0 space-y-4">
      {alertMessage && (
        <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}

      {/* 5 TAB FILTERS */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar px-2">
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
            className={`max-w-full px-5 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-[#FDB022] text-white shadow-md' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="flex justify-between mt-4 items-center px-4">
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['campaigns'] })}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm"
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>

        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-xl font-semibold text-sm"
        >
          <Printer size={16} />
          Print
        </button>
      </div>

      {/* EMPTY STATE */}
      {campaigns.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 mx-4 text-center border border-slate-200 dark:border-slate-700">
          <Target size={48} className="mx-auto mb-4 text-slate-300 opacity-40" />
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            No {activeTab} campaigns found
          </p>
        </div>
      ) : (
        <>
          {/* CAMPAIGN CARDS - EDGE TO EDGE */}
          <div className="-mx-3 mt-4 space-y-5">
            {campaigns.map((campaign, index) => {
              const isExpanded = expandedCard === campaign._id;
              const statusInfo = getCampaignStatusLabel(campaign.status);
              const progress = calculateCampaignProgress(campaign.currentAmount, campaign.goalAmount);

              const colorMap = {
                active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                completed: 'bg-blue-100 text-blue-700 border-blue-200',
                draft: 'bg-amber-100 text-amber-700 border-amber-200',
                archived: 'bg-slate-100 text-slate-600 border-slate-200'
              };
              const statusStyle = colorMap[campaign.status] || colorMap.archived;

              return (
                <div 
                  key={campaign._id}
                  className={`w-full space-y-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 ${
                    index === 0 ? 'border-t' : ''
                  }`}
                >
                  <div 
                    className="px-4 sm:px-3 cursor-pointer relative"
                    onClick={() => setExpandedCard(isExpanded ? null : campaign._id)}
                  >
                    <div className="flex items-start gap-3 mt-2 mb-3">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${campaign.isFeatured ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                        {campaign.isFeatured ? <Star size={15} /> : <Target size={20} />}
                      </div>

                      <div className="flex-1 mt-2 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 leading-tight truncate">
                          {campaign.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {campaign.description || 'No description provided'}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase border whitespace-nowrap ${statusStyle}`}>
                          {activeTab === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {statusInfo.label}
                        </span>
                        <ChevronDown 
                          size={20} 
                          className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between items-end mb-1 gap-2">
                        <span className="text-sm font-black text-[#FDB022] truncate">{formatCurrency(campaign.currentAmount)}</span>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">GOAL: {formatCurrency(campaign.goalAmount)}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-emerald-500' : 'bg-[#FDB022]'}`} 
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 truncate">
                      <Calendar size={12} className="flex-shrink-0" />
                      <span className="truncate">{formatDateShort(campaign.startDate)} - {formatDateShort(campaign.endDate)}</span>
                    </div>
                  </div>

                  {/* ALL 10 ACTIONS */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowAnalytics(campaign);
                          }}
                          className="py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                        >
                          <TrendingUp size={14} />
                          Analytics
                        </button>

                        {canEditCampaign() && activeTab === 'active' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCampaignForContribution(campaign);
                            }}
                            className="py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                          >
                            <Plus size={14} />
                            Contribute
                          </button>
                        )}

                        <Link 
                          href={`/campaigns/${campaign._id}`}
                          className="py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye size={14} />
                          Details
                        </Link>

                        {canEditCampaign() && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCampaignToEdit(campaign);
                            }}
                            className="py-2.5 bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {canEditCampaign() && campaign.status === 'active' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              completeMutation.mutate(campaign._id);
                            }}
                            className="py-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <CheckCircle size={12} />
                            Complete
                          </button>
                        )}

                        {canEditCampaign() && campaign.status !== 'archived' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCampaignToArchive(campaign);
                            }}
                            className="py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <Archive size={12} />
                            Archive
                          </button>
                        )}

                        {canDeleteCampaign() && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCampaignToDelete(campaign);
                            }}
                            className="py-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        )}

                        {canEditCampaign() && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFeaturedMutation.mutate({ id: campaign._id, isFeatured: !campaign.isFeatured });
                            }}
                            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${
                              campaign.isFeatured 
                                ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                            }`}
                          >
                            <Star size={12} />
                            {campaign.isFeatured ? 'Unstar' : 'Star'}
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.print();
                          }}
                          className="py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <Printer size={12} />
                          Print
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 5 MODALS */}
      {selectedCampaignForContribution && (
        <ContributionRecordModal 
          campaign={selectedCampaignForContribution} 
          onClose={() => setSelectedCampaignForContribution(null)} 
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            setSelectedCampaignForContribution(null);
            showAlert('Contribution recorded successfully');
          }}
        />
      )}

      {campaignToEdit && (
        <MobileEditCampaignModal 
          campaign={campaignToEdit} 
          onClose={() => setCampaignToEdit(null)}
          onSuccess={(message) => {
            setCampaignToEdit(null);
            showAlert(message);
          }}
        />
      )}

      {selectedAnalytics && (
        <MobileCampaignAnalyticsModal 
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