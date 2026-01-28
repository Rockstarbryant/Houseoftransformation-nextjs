'use client';

import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { donationApi } from '@/services/api/donationService';
import { Plus, X, Calendar, DollarSign } from 'lucide-react';

export default function AdminCampaignManager({ onCampaignCreated }) {
  const { canCreateCampaign } = usePermissions();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
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

  // Permission check
  if (!canCreateCampaign()) return null;

  // ============================================
  // FORM HANDLERS
  // ============================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      setError('Campaign title is required');
      return false;
    }

    if (!form.description.trim()) {
      setError('Campaign description is required');
      return false;
    }

    if (!form.goalAmount || form.goalAmount <= 0) {
      setError('Goal amount must be greater than 0');
      return false;
    }

    if (!form.startDate || !form.endDate) {
      setError('Start and end dates are required');
      return false;
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError('Start date must be before end date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('[CAMPAIGN-CREATE] Submitting campaign:', form.title);

      const campaignData = {
        title: form.title.trim(),
        description: form.description.trim(),
        goalAmount: Number(form.goalAmount),
        campaignType: form.campaignType,
        startDate: form.startDate,
        endDate: form.endDate,
        visibility: form.visibility,
        allowPledges: form.allowPledges,
        isFeatured: form.isFeatured,
        imageUrl: form.imageUrl.trim() || null,
        impactStatement: form.impactStatement.trim() || null
      };

      const response = await donationApi.campaigns.create(campaignData);

      if (response.success) {
        console.log('[CAMPAIGN-CREATE] Success:', response.campaign._id);
        
        // Reset form
        setForm({
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

        setIsOpen(false);

        // Notify parent
        if (onCampaignCreated) {
          onCampaignCreated();
        }
      } else {
        setError(response.message || 'Failed to create campaign');
      }
    } catch (err) {
      console.error('[CAMPAIGN-CREATE] Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setError(null);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="mb-6">
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
      >
        <Plus size={20} />
        Create New Campaign
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">New Donation Campaign</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Create a new fundraising campaign
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm font-semibold">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Campaign Title *
                  </label>
                  <input 
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g., New Church Building Fund"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description *
                  </label>
                  <textarea 
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the campaign purpose and goals..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Impact Statement (Optional)
                  </label>
                  <input 
                    type="text"
                    name="impactStatement"
                    value={form.impactStatement}
                    onChange={handleChange}
                    placeholder="e.g., Your giving will help us reach 500 families"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Financial Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign size={20} />
                  Financial Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Goal Amount (KES) *
                    </label>
                    <input 
                      type="number"
                      name="goalAmount"
                      value={form.goalAmount}
                      onChange={handleChange}
                      placeholder="500000"
                      min="1"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Campaign Type *
                    </label>
                    <select 
                      name="campaignType"
                      value={form.campaignType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                      disabled={isSubmitting}
                    >
                      <option value="building">Building</option>
                      <option value="mission">Mission</option>
                      <option value="event">Event</option>
                      <option value="equipment">Equipment</option>
                      <option value="benevolence">Benevolence</option>
                      <option value="offering">General Offering</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar size={20} />
                  Timeline
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Start Date *
                    </label>
                    <input 
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      End Date *
                    </label>
                    <input 
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Campaign Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Visibility
                  </label>
                  <select 
                    name="visibility"
                    value={form.visibility}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                    disabled={isSubmitting}
                  >
                    <option value="public">Public (Everyone can see)</option>
                    <option value="members-only">Members Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Image URL (Optional)
                  </label>
                  <input 
                    type="url"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      name="allowPledges"
                      checked={form.allowPledges}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-2 focus:ring-[#8B1A1A]"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Allow Pledges
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      name="isFeatured"
                      checked={form.isFeatured}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-2 focus:ring-[#8B1A1A]"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Feature on Homepage
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Launch Campaign
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}