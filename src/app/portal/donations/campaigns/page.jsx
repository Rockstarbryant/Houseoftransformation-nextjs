'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDateShort, getCampaignStatusLabel, calculateCampaignProgress } from '@/utils/donationHelpers';
import PrintTableButton from '@/components/common/PrintTableButton';
import { ArrowLeft, Plus, Eye, Edit, Archive, Trash2, CheckCircle, AlertCircle, RefreshCw, Printer } from 'lucide-react';
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

  // Print individual campaign with embedded CSS
  const handlePrintCampaign = (campaign) => {
    const printWindow = window.open('', '_blank');
    const progress = calculateCampaignProgress(campaign.currentAmount, campaign.goalAmount);
    const statusLabel = getCampaignStatusLabel(campaign.status);
    
    // Determine badge colors
    let badgeBg = '#f3f4f6';
    let badgeColor = '#374151';
    if (statusLabel.bg.includes('green')) { badgeBg = '#dcfce7'; badgeColor = '#166534'; }
    else if (statusLabel.bg.includes('blue')) { badgeBg = '#dbeafe'; badgeColor = '#1e40af'; }
    else if (statusLabel.bg.includes('yellow')) { badgeBg = '#fef3c7'; badgeColor = '#92400e'; }
    else if (statusLabel.bg.includes('red')) { badgeBg = '#fee2e2'; badgeColor = '#991b1b'; }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${campaign.title} - Campaign Details</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              padding: 40px;
              background: #fff;
              color: #000;
            }
            .print-title {
              color: #8B1A1A;
              border-bottom: 3px solid #8B1A1A;
              padding-bottom: 10px;
              margin-bottom: 24px;
              font-size: 32px;
              font-weight: 700;
            }
            .print-campaign-header {
              background: #f8f9fa;
              padding: 24px;
              border-radius: 8px;
              border-left: 4px solid #8B1A1A;
              margin-bottom: 32px;
            }
            .print-campaign-header h2 {
              font-size: 24px;
              color: #111827;
              margin-bottom: 8px;
            }
            .print-campaign-type {
              display: inline-block;
              padding: 4px 12px;
              background: #e5e7eb;
              color: #374151;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              margin-bottom: 16px;
            }
            .print-campaign-description {
              color: #6b7280;
              line-height: 1.6;
              margin-top: 12px;
            }
            .print-details-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 24px;
              margin-bottom: 32px;
            }
            .print-detail-card {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .print-detail-card .label {
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              color: #6b7280;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .print-detail-card .value {
              font-size: 24px;
              font-weight: 700;
              color: #111827;
            }
            .print-detail-card.success .value {
              color: #166534;
            }
            .print-progress-section {
              margin: 32px 0;
              padding: 24px;
              background: #f9fafb;
              border-radius: 8px;
            }
            .print-progress-section h3 {
              font-size: 16px;
              margin-bottom: 16px;
              color: #374151;
            }
            .print-progress-bar {
              width: 100%;
              height: 24px;
              background: #e5e7eb;
              border-radius: 12px;
              overflow: hidden;
              margin-bottom: 8px;
            }
            .print-progress-fill {
              height: 100%;
              background: #10b981;
            }
            .print-progress-text {
              font-size: 14px;
              color: #6b7280;
              font-weight: 600;
            }
            .print-dates-section {
              margin: 32px 0;
              padding: 20px;
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              border-radius: 8px;
            }
            .print-dates-section h3 {
              font-size: 16px;
              margin-bottom: 12px;
              color: #92400e;
            }
            .print-dates-section p {
              color: #78350f;
              margin: 6px 0;
            }
            .print-footer {
              margin-top: 48px;
              padding-top: 24px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 13px;
            }
            .print-button {
              position: fixed;
              top: 24px;
              right: 24px;
              padding: 14px 28px;
              background: #8B1A1A;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              box-shadow: 0 4px 12px rgba(139, 26, 26, 0.3);
              font-size: 14px;
            }
            .print-button:hover {
              background: #7f1d1d;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none !important; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <h1 class="print-title">Campaign Details Report</h1>
          
          <div class="print-campaign-header">
            <h2>${campaign.title}</h2>
            <span class="print-campaign-type">${campaign.campaignType || 'General'}</span>
            ${campaign.description ? `<p class="print-campaign-description">${campaign.description}</p>` : ''}
          </div>

          <div class="print-details-grid">
            <div class="print-detail-card">
              <div class="label">Goal Amount</div>
              <div class="value">${formatCurrency(campaign.goalAmount)}</div>
            </div>
            
            <div class="print-detail-card success">
              <div class="label">Amount Raised</div>
              <div class="value">${formatCurrency(campaign.currentAmount)}</div>
            </div>
            
            <div class="print-detail-card">
              <div class="label">Remaining</div>
              <div class="value">${formatCurrency(campaign.goalAmount - campaign.currentAmount)}</div>
            </div>
            
            <div class="print-detail-card">
              <div class="label">Campaign Status</div>
              <div class="value">
                <span style="display: inline-block; padding: 6px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; text-transform: uppercase; background: ${badgeBg}; color: ${badgeColor};">
                  ${statusLabel.label}
                </span>
              </div>
            </div>
          </div>

          <div class="print-progress-section">
            <h3>Campaign Progress</h3>
            <div class="print-progress-bar">
              <div class="print-progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
            </div>
            <p class="print-progress-text">${progress}% of goal achieved</p>
          </div>

          <div class="print-dates-section">
            <h3>Campaign Duration</h3>
            <p><strong>Start Date:</strong> ${formatDateShort(campaign.startDate)}</p>
            <p><strong>End Date:</strong> ${formatDateShort(campaign.endDate)}</p>
            ${campaign.createdAt ? `<p><strong>Created:</strong> ${new Date(campaign.createdAt).toLocaleDateString()}</p>` : ''}
          </div>

          <div class="print-footer">
            <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin-top: 12px; font-weight: 500;">House of Transformation Church, Mombasa, Kenya</p>
          </div>
          
          <button class="print-button no-print" onclick="window.print()">
            Print PDF
          </button>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
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
                        <Link 
                          href={`/campaigns/${campaign._id}`} 
                          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" 
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>

                        {canViewCampaigns() && (
                          <button 
                            onClick={() => handlePrintCampaign(campaign)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded text-blue-600 dark:text-blue-400" 
                            title="Print Campaign"
                          >
                            <Printer size={16} />
                          </button>
                        )}
                        
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