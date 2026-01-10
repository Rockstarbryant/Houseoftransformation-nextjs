// ============================================
// FILE 25: components/admin/AdminDonationDashboard.jsx - COMPLETE
// ============================================
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Target, Download, Send, Plus, Eye, ArrowUpRight } from 'lucide-react';
import Card from '../common/Card';
import Loader from '../common/Loader';
import DonationStats from '../donation/DonationStats';
import CampaignFilter from '../donation/CampaignFilter';
import PledgeHistory from '../donation/PledgeHistory';
import PaymentModal from '../donation/PaymentModal';
import { useDonation } from '../../context/DonationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Main Dashboard Component
const AdminDonationDashboardMain = () => {
  const { dashboardStats, loading, fetchAdminDashboard } = useDonation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminDashboard();
  }, [fetchAdminDashboard]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-blue-900 flex items-center gap-3 mb-2">
            <BarChart3 size={40} />
            Donation Management
          </h1>
          <p className="text-gray-600">Manage campaigns, pledges, and payments</p>
        </div>

        {/* Statistics */}
        {dashboardStats && (
          <div className="mb-12">
            <DonationStats stats={dashboardStats} variant="admin" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={() => navigate('/admin/donations/campaigns')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-600"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Campaigns</h3>
            <p className="text-gray-600 text-sm">Create and manage donation campaigns</p>
          </button>

          <button
            onClick={() => navigate('/admin/donations/pledges')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-purple-600"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">View Pledges</h3>
            <p className="text-gray-600 text-sm">Review all member pledges</p>
          </button>

          <button
            onClick={() => navigate('/admin/donations/payments')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-green-600"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Records</h3>
            <p className="text-gray-600 text-sm">View and manage payments</p>
          </button>
        </div>

        {/* Recent Payments */}
        {dashboardStats?.recentPayments && dashboardStats.recentPayments.length > 0 && (
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900">Recent Payments</h2>
              <button 
                onClick={() => navigate('/admin/donations/payments')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Download size={16} />
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Member</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Campaign</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardStats.recentPayments.slice(0, 5).map(payment => (
                    <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-gray-900">{payment.memberId?.name}</td>
                      <td className="py-3 px-4 font-bold text-green-600">
                        KES {payment.amount?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">{payment.campaignId?.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(payment.completedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded font-bold">
                          {payment.paymentMethod?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

// Campaign Management Component
const ManageCampaigns = () => {
  const { campaigns, loading, fetchCampaigns, deleteCampaign } = useDonation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'building',
    goalAmount: '',
    endDate: '',
    impactStatement: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          ...formData,
          goalAmount: parseFloat(formData.goalAmount)
        })
      });
      setShowForm(false);
      setFormData({ name: '', description: '', type: 'building', goalAmount: '', endDate: '', impactStatement: '' });
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleDelete = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      await deleteCampaign(campaignId);
      fetchCampaigns();
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Manage Campaigns</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            New Campaign
          </button>
        </div>

        {/* Create Campaign Form */}
        {showForm && (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Campaign</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="building">Building Fund</option>
                    <option value="emergency">Emergency Relief</option>
                    <option value="ministry">Ministry Support</option>
                    <option value="outreach">Outreach</option>
                    <option value="offering">Offering</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Goal Amount (KES)</label>
                  <input
                    type="number"
                    name="goalAmount"
                    value={formData.goalAmount}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Impact Statement</label>
                <textarea
                  name="impactStatement"
                  value={formData.impactStatement}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  Create Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-bold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <Card className="text-center p-12">
            <p className="text-gray-600 text-lg mb-6">No campaigns yet. Create one to get started!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(campaign => {
              const progress = (campaign.totalRaised / campaign.goalAmount) * 100;
              return (
                <Card key={campaign._id} className="flex flex-col">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{campaign.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-bold">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>KES {campaign.totalRaised?.toLocaleString()}</span>
                        <span>of KES {campaign.goalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button className="flex-1 bg-blue-100 text-blue-700 py-2 rounded font-bold hover:bg-blue-200 transition text-sm flex items-center justify-center gap-1">
                      <Eye size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(campaign._id)}
                      className="flex-1 bg-red-100 text-red-700 py-2 rounded font-bold hover:bg-red-200 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Wrapper Component with Routes
const AdminDonationDashboard = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<AdminDonationDashboardMain />} />
      <Route path="/campaigns" element={<ManageCampaigns />} />
      <Route path="/pledges" element={
        <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-blue-900 mb-8">Pledge Management</h1>
            <PledgeHistory isAdmin={true} />
          </div>
        </div>
      } />
      <Route path="/payments" element={
        <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-blue-900 mb-8">Payment Management</h1>
            <PledgeHistory isAdmin={true} />
          </div>
        </div>
      } />
    </Routes>
  );
};

export default AdminDonationDashboard;