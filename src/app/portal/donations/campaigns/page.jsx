'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDateShort, getCampaignStatusLabel, calculateCampaignProgress } from '@/utils/donationHelpers';
import PrintTableButton from '@/components/common/PrintTableButton';
import { ArrowLeft, Plus, Eye, Edit, Archive, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CampaignsManagementPage() {
  const { canViewCampaigns, canEditCampaign, canDeleteCampaign, canActivateCampaign } = usePermissions();

  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (canViewCampaigns()) {
      fetchCampaigns();
    }
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const response = await donationApi.campaigns.getAll({});
      if (response.success) {
        setCampaigns(response.campaigns || []);
      }
    } catch (err) {
      setError('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      const response = await donationApi.campaigns.activate(id);
      if (response.success) {
        setSuccess('Campaign activated');
        fetchCampaigns();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate');
    }
  };

  const handleArchive = async (id) => {
    if (!confirm('Archive this campaign?')) return;
    
    try {
      const response = await donationApi.campaigns.archive(id);
      if (response.success) {
        setSuccess('Campaign archived');
        fetchCampaigns();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this campaign? This cannot be undone.')) return;
    
    try {
      const response = await donationApi.campaigns.delete(id);
      if (response.success) {
        setSuccess('Campaign deleted');
        fetchCampaigns();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const printColumns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Type', accessor: 'campaignType', render: (val) => val?.toUpperCase() },
    { header: 'Goal', accessor: 'goalAmount', render: (val) => formatCurrency(val) },
    { header: 'Raised', accessor: 'currentAmount', render: (val) => formatCurrency(val) },
    { header: 'Status', accessor: 'status', render: (val) => val?.toUpperCase() },
    { header: 'Start Date', accessor: 'startDate', render: (val) => formatDateShort(val) },
    { header: 'End Date', accessor: 'endDate', render: (val) => formatDateShort(val) }
  ];

  if (!canViewCampaigns()) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">You don't have permission to view campaigns</p>
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
    <div className="space-y-6 p-6">
      <div>
        <Link href="/portal/donations" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-4">
          <ArrowLeft size={20} />
          Back to Donations
        </Link>

        <h1 className="text-4xl font-black text-slate-900 dark:text-white">Campaign Management</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage all fundraising campaigns</p>
      </div>

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

      <div className="flex flex-wrap gap-4 justify-between">
        <div className="flex gap-2">
          {['all', 'active', 'draft', 'completed', 'archived'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === status
                  ? 'bg-[#8B1A1A] text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({campaigns.filter(c => status === 'all' || c.status === status).length})
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <PrintTableButton
            title="Campaigns Report"
            subtitle={`Status: ${filter}`}
            columns={printColumns}
            data={filteredCampaigns}
            fileName="campaigns"
          />
          <button
            onClick={fetchCampaigns}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Campaign</th>
                <th className="px-6 py-4">Goal</th>
                <th className="px-6 py-4">Raised</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredCampaigns.map(campaign => {
                const progress = calculateCampaignProgress(campaign.currentAmount, campaign.goalAmount);
                const statusLabel = getCampaignStatusLabel(campaign.status);

                return (
                  <tr key={campaign._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{campaign.title}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs capitalize">{campaign.campaignType}</div>
                    </td>
                    <td className="px-6 py-4 font-bold">{formatCurrency(campaign.goalAmount)}</td>
                    <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(campaign.currentAmount)}</td>
                    <td className="px-6 py-4">
                      <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{progress}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusLabel.bg} ${statusLabel.text}`}>
                        {statusLabel.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>{formatDateShort(campaign.startDate)}</div>
                      <div className="text-slate-500">to {formatDateShort(campaign.endDate)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link href={`/campaigns/${campaign._id}`} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" title="View">
                          <Eye size={16} />
                        </Link>
                        
                        {canEditCampaign() && (
                          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" title="Edit">
                            <Edit size={16} />
                          </button>
                        )}

                        {canActivateCampaign() && campaign.status === 'draft' && (
                          <button onClick={() => handleActivate(campaign._id)} className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded text-green-600" title="Activate">
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {canEditCampaign() && campaign.status !== 'archived' && (
                          <button onClick={() => handleArchive(campaign._id)} className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900 rounded text-orange-600" title="Archive">
                            <Archive size={16} />
                          </button>
                        )}

                        {canDeleteCampaign() && (
                          <button onClick={() => handleDelete(campaign._id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">No campaigns found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}