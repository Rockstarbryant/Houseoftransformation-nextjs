// components/donations/mobile/MobileCampaignsTab.jsx
// Mobile-optimized version of CampaignsTab

'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { donationApi } from '@/services/api/donationService';
import { 
  Plus, 
  Eye, 
  Edit, 
  Archive, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Filter,
  X,
  ChevronDown,
  TrendingUp,
  Calendar,
  Target,
  DollarSign
} from 'lucide-react';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
};

const formatDateShort = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const calculateCampaignProgress = (current, goal) => {
  if (!goal || goal === 0) return 0;
  return Math.round((current / goal) * 100);
};

const getCampaignStatusLabel = (status) => {
  const labels = {
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
    draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
    archived: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Archived' }
  };
  return labels[status] || labels.draft;
};

export default function MobileCampaignsTab({ onCampaignCreated }) {
  const { 
    canViewCampaigns, 
    canEditCampaign, 
    canDeleteCampaign, 
    canActivateCampaign,
    canCreateCampaign 
  } = usePermissions();

  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [campaignAnalytics, setCampaignAnalytics] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (canViewCampaigns()) {
      fetchCampaigns();
    }
  }, []);

  const fetchCampaigns = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const response = await donationApi.campaigns.getAll({});
      if (response.success) {
        setCampaigns(response.campaigns || []);
        
        const campaignIds = (response.campaigns || []).map(c => c._id);
        if (campaignIds.length > 0) {
          await fetchCampaignAnalytics(campaignIds);
        }
      }
    } catch (err) {
      if (!silent) setError('Failed to load campaigns');
    } finally {
      if (!silent) setIsLoading(false);
      else setIsRefreshing(false);
    }
  };

  const fetchCampaignAnalytics = async (campaignIds) => {
    try {
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
      
      setCampaignAnalytics(analyticsMap);
    } catch (err) {
      console.error('Failed to fetch campaign analytics:', err);
    }
  };

  const handleActivate = async (id) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(c => c._id === id ? { ...c, status: 'active' } : c)
    );

    try {
      const response = await donationApi.campaigns.activate(id);
      if (response.success) {
        setSuccess('Campaign activated');
        fetchCampaigns(true);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        fetchCampaigns(true);
        setError('Failed to activate campaign');
      }
    } catch (err) {
      fetchCampaigns(true);
      setError(err.response?.data?.message || 'Failed to activate');
    }
  };

  const handleArchive = async (id) => {
    if (!confirm('Archive this campaign?')) return;
    
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(c => c._id === id ? { ...c, status: 'archived' } : c)
    );

    try {
      const response = await donationApi.campaigns.archive(id);
      if (response.success) {
        setSuccess('Campaign archived');
        fetchCampaigns(true);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        fetchCampaigns(true);
        setError('Failed to archive campaign');
      }
    } catch (err) {
      fetchCampaigns(true);
      setError(err.response?.data?.message || 'Failed to archive');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this campaign?')) return;
    
    setCampaigns(prevCampaigns => prevCampaigns.filter(c => c._id !== id));

    try {
      const response = await donationApi.campaigns.delete(id);
      if (response.success) {
        setSuccess('Campaign deleted');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        fetchCampaigns(true);
        setError('Failed to delete campaign');
      }
    } catch (err) {
      fetchCampaigns(true);
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedCampaign(null);
    setSuccess('Campaign updated successfully!');
    fetchCampaigns(true);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setSuccess('Campaign created successfully!');
    fetchCampaigns(true);
    if (onCampaignCreated) onCampaignCreated();
    setTimeout(() => setSuccess(null), 3000);
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  if (!canViewCampaigns()) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">Access Denied</h2>
          <p className="text-sm text-red-700 dark:text-red-300">
            You don't have permission to view campaigns
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && campaigns.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-800 dark:text-green-200 font-semibold text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-800 dark:text-red-200 font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Create Campaign Button */}
      {canCreateCampaign() && (
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full bg-gradient-to-r from-[#8B1A1A] to-red-900 text-white py-4 rounded-2xl font-bold shadow-md flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Create New Campaign
        </button>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: 'all', label: 'All', count: campaigns.length },
          { key: 'active', label: 'Active', count: campaigns.filter(c => c.status === 'active').length },
          { key: 'draft', label: 'Draft', count: campaigns.filter(c => c.status === 'draft').length },
          { key: 'completed', label: 'Completed', count: campaigns.filter(c => c.status === 'completed').length },
          { key: 'archived', label: 'Archived', count: campaigns.filter(c => c.status === 'archived').length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filter === tab.key
                ? 'bg-[#8B1A1A] text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Refresh Button */}
      <button
        onClick={() => fetchCampaigns(true)}
        disabled={isRefreshing}
        className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        {isRefreshing ? 'Refreshing...' : 'Refresh Campaigns'}
      </button>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <Target size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No campaigns found
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {filter !== 'all' ? 'Try selecting a different filter' : 'Create your first campaign'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCampaigns.map(campaign => {
            const analytics = campaignAnalytics[campaign._id];
            const progress = analytics 
              ? calculateCampaignProgress(analytics.totalRaised, campaign.goalAmount)
              : calculateCampaignProgress(campaign.currentAmount, campaign.goalAmount);
            const statusLabel = getCampaignStatusLabel(campaign.status);
            const isExpanded = expandedCard === campaign._id;
            const raised = analytics?.totalRaised || campaign.currentAmount || 0;

            return (
              <div 
                key={campaign._id}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700"
              >
                {/* Card Header - Always Visible */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedCard(isExpanded ? null : campaign._id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                        {campaign.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {campaign.campaignType}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusLabel.bg} ${statusLabel.text}`}>
                        {statusLabel.label}
                      </span>
                      <ChevronDown 
                        size={20} 
                        className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Goal & Raised */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Goal</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {(campaign.goalAmount / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Raised</p>
                      <p className="font-bold text-sm text-green-600">
                        {(raised / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Progress</span>
                      <span className="font-bold text-slate-900 dark:text-white">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={12} />
                    <span>{formatDateShort(campaign.startDate)} - {formatDateShort(campaign.endDate)}</span>
                  </div>
                </div>

                {/* Expandable Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                    {/* Description */}
                    {campaign.description && (
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Description
                        </p>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {campaign.description}
                        </p>
                      </div>
                    )}

                    {/* Analytics Details */}
                    {analytics && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          📊 Analytics
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-blue-700 dark:text-blue-300">Pledges</p>
                            <p className="font-bold text-blue-900 dark:text-blue-100">
                              {formatCurrency(analytics.totalPledged)}
                            </p>
                          </div>
                          <div>
                            <p className="text-blue-700 dark:text-blue-300">Contributions</p>
                            <p className="font-bold text-blue-900 dark:text-blue-100">
                              {formatCurrency(analytics.totalDirectContributions)}
                            </p>
                          </div>
                          <div>
                            <p className="text-blue-700 dark:text-blue-300">Pledge Count</p>
                            <p className="font-bold text-blue-900 dark:text-blue-100">
                              {analytics.pledgeCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-blue-700 dark:text-blue-300">Contributors</p>
                            <p className="font-bold text-blue-900 dark:text-blue-100">
                              {analytics.contributionCount}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {canActivateCampaign() && campaign.status === 'draft' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivate(campaign._id);
                          }}
                          className="py-2 bg-green-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <CheckCircle size={14} />
                          Activate
                        </button>
                      )}

                      {canEditCampaign() && campaign.status !== 'archived' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(campaign);
                          }}
                          className="py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                      )}

                      {canEditCampaign() && campaign.status !== 'archived' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(campaign._id);
                          }}
                          className="py-2 bg-orange-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <Archive size={14} />
                          Archive
                        </button>
                      )}

                      {canDeleteCampaign() && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(campaign._id);
                          }}
                          className="py-2 bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Campaign Modal */}
      {isEditModalOpen && selectedCampaign && (
        <CampaignEditModal
          campaign={selectedCampaign}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCampaign(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <CampaignCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}

// ============================================
// CAMPAIGN EDIT MODAL COMPONENT
// ============================================

function CampaignEditModal({ campaign, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: campaign.title || '',
    description: campaign.description || '',
    goalAmount: campaign.goalAmount || '',
    campaignType: campaign.campaignType || 'building',
    startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
    endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
    visibility: campaign.visibility || 'public',
    allowPledges: campaign.allowPledges ?? true,
    isFeatured: campaign.isFeatured ?? false,
    imageUrl: campaign.imageUrl || '',
    impactStatement: campaign.impactStatement || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await donationApi.campaigns.update(campaign._id, {
        ...formData,
        goalAmount: Number(formData.goalAmount)
      });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to update campaign');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update campaign');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60]">
      <div className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Campaign</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Update campaign details</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-800 dark:text-red-200 text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Campaign Title *
            </label>
            <input 
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description *
            </label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
            />
          </div>

          {/* Goal Amount & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Goal (KES) *
              </label>
              <input 
                type="number"
                name="goalAmount"
                value={formData.goalAmount}
                onChange={handleChange}
                min="1"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type *
              </label>
              <select 
                name="campaignType"
                value={formData.campaignType}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
              >
                <option value="building">Building</option>
                <option value="mission">Mission</option>
                <option value="event">Event</option>
                <option value="equipment">Equipment</option>
                <option value="benevolence">Benevolence</option>
                <option value="offering">Offering</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Start Date *
              </label>
              <input 
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                End Date *
              </label>
              <input 
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                name="allowPledges"
                checked={formData.allowPledges}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-2 focus:ring-[#8B1A1A] disabled:opacity-50"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Allow Pledges
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-2 focus:ring-[#8B1A1A] disabled:opacity-50"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Featured
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
// CAMPAIGN CREATE MODAL COMPONENT
// ============================================

function CampaignCreateModal({ onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    campaignType: 'building',
    startDate: '',
    endDate: '',
    visibility: 'public',
    allowPledges: true,
    isFeatured: false,
    imageUrl: '',
    impactStatement: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await donationApi.campaigns.create({
        ...formData,
        goalAmount: Number(formData.goalAmount)
      });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to create campaign');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60]">
      <div className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Campaign</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Start a new fundraising campaign</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-800 dark:text-red-200 text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Form - Same as Edit Modal */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Campaign Title *
            </label>
            <input 
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description *
            </label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Goal (KES) *
              </label>
              <input 
                type="number"
                name="goalAmount"
                value={formData.goalAmount}
                onChange={handleChange}
                min="1"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type *
              </label>
              <select 
                name="campaignType"
                value={formData.campaignType}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
              >
                <option value="building">Building</option>
                <option value="mission">Mission</option>
                <option value="event">Event</option>
                <option value="equipment">Equipment</option>
                <option value="benevolence">Benevolence</option>
                <option value="offering">Offering</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Start Date *
              </label>
              <input 
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                End Date *
              </label>
              <input 
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                name="allowPledges"
                checked={formData.allowPledges}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-2 focus:ring-[#8B1A1A] disabled:opacity-50"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Allow Pledges
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-2 focus:ring-[#8B1A1A] disabled:opacity-50"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Featured
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}