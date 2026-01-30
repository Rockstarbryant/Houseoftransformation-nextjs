'use client';

import { useState, useEffect } from 'react'; // ✅ FIXED: Added useEffect
import { donationApi } from '@/services/api/donationService';
import api from '@/lib/api'; // ✅ FIXED: Import api instance
import { formatCurrency } from '@/utils/donationHelpers';
import { X, DollarSign, CheckCircle, AlertCircle, Search, UserCheck } from 'lucide-react';

export default function ContributionRecordModal({ campaign, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    contributorName: '',
    contributorEmail: '',
    contributorPhone: '',
    amount: '',
    paymentMethod: 'cash',
    mpesaRef: '',
    notes: '',
    isAnonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ User search functionality
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // ✅ Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        if (response?.data?.success) {
          setUsers(response.data.users || []);
        }
      } catch (error) {
        console.error('[CONTRIB-MODAL] Fetch users error:', error);
        // Don't show error to user - just means user list unavailable
      }
    };
    fetchUsers();
  }, []);

  // ✅ Filter users based on search
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return false;
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.includes(search)
    );
  });

  // ✅ Handle user selection
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      contributorName: user.name || '',
      contributorEmail: user.email || '',
      contributorPhone: user.phone || ''
    });
    setSearchTerm('');
    setShowUserDropdown(false);
  };

  // ✅ Clear selected user
  const handleClearUser = () => {
    setSelectedUser(null);
    setFormData({
      ...formData,
      contributorName: '',
      contributorEmail: '',
      contributorPhone: ''
    });
  };

  // ============================================
  // VALIDATION
  // ============================================

  const validateForm = () => {
    if (!formData.amount || formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }

    if (!formData.isAnonymous) {
      if (!formData.contributorName.trim()) {
        setError('Contributor name is required');
        return false;
      }

      if (!formData.contributorEmail.trim()) {
        setError('Contributor email is required');
        return false;
      }

      if (!formData.contributorPhone.trim()) {
        setError('Contributor phone is required');
        return false;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contributorEmail)) {
        setError('Invalid email format');
        return false;
      }

      // Validate phone (Kenya format)
      const phoneRegex = /^(254|0)[0-9]{9}$/;
      if (!phoneRegex.test(formData.contributorPhone.replace(/\s/g, ''))) {
        setError('Invalid phone number. Use format: 0712345678 or 254712345678');
        return false;
      }
    }

    // If M-Pesa, require reference
    if (formData.paymentMethod === 'mpesa' && !formData.mpesaRef.trim()) {
      setError('M-Pesa reference is required');
      return false;
    }

    return true;
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('[CONTRIBUTION-RECORD] Recording contribution:', formData);

      // Format phone number
      let formattedPhone = formData.contributorPhone.replace(/\s/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      }

      const response = await donationApi.contributions.create({
        campaignId: campaign._id, // MongoDB ID
        contributorName: formData.isAnonymous ? 'Anonymous' : formData.contributorName,
        contributorEmail: formData.isAnonymous ? null : formData.contributorEmail,
        contributorPhone: formData.isAnonymous ? null : formattedPhone,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        mpesaRef: formData.mpesaRef || null,
        notes: formData.notes || null,
        isAnonymous: formData.isAnonymous
      });

      if (response.success) {
        console.log('[CONTRIBUTION-RECORD] Contribution recorded successfully');
        
        // Success - refresh and close
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to record contribution');
      }
    } catch (err) {
      console.error('[CONTRIBUTION-RECORD] Error:', err);
      
      const errorMessage = err.response?.data?.message 
        || err.message 
        || 'Failed to record contribution';
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="text-green-600" size={28} />
              Record Manual Contribution
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Campaign: <strong>{campaign.title}</strong>
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-800 dark:text-red-200 text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Anonymous Checkbox */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={formData.isAnonymous}
              onChange={(e) => {
                setFormData({ ...formData, isAnonymous: e.target.checked });
                if (e.target.checked) {
                  handleClearUser();
                }
              }}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="isAnonymous" className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              This is an anonymous contribution
            </label>
          </div>

          {/* User Search Dropdown */}
          {!formData.isAnonymous && users.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Search size={16} className="inline mr-2" />
                Quick Select Registered User (Optional)
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowUserDropdown(e.target.value.length > 0);
                  }}
                  onFocus={() => searchTerm && setShowUserDropdown(true)}
                  placeholder="Search by name, email, or phone..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none"
                  disabled={isSubmitting || selectedUser !== null}
                />
                
                {/* Dropdown */}
                {showUserDropdown && filteredUsers.length > 0 && !selectedUser && (
                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredUsers.slice(0, 10).map(user => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-950/30 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-slate-500 dark:text-slate-500">{user.phone}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Selected User Display */}
              {selectedUser && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="text-green-600" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                        {selectedUser.name}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">{selectedUser.email}</p>
                        
                          <p className="text-xs text-green-700 dark:text-green-300">{selectedUser.phone}</p>
                        
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearUser}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Contributor Details (hidden if anonymous or user selected) */}
          {!formData.isAnonymous && !selectedUser && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contributor Name *
                </label>
                <input 
                  type="text"
                  value={formData.contributorName}
                  onChange={(e) => {
                    setFormData({ ...formData, contributorName: e.target.value });
                    setError(null);
                  }}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none"
                  required={!formData.isAnonymous}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email *
                  </label>
                  <input 
                    type="email"
                    value={formData.contributorEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, contributorEmail: e.target.value });
                      setError(null);
                    }}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none"
                    required={!formData.isAnonymous}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number *
                  </label>
                  <input 
                    type="text"
                    value={formData.contributorPhone}
                    onChange={(e) => {
                      setFormData({ ...formData, contributorPhone: e.target.value });
                      setError(null);
                    }}
                    placeholder="0712345678 or 254712345678"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none"
                    required={!formData.isAnonymous}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </>
          )}

          {/* Read-only fields when user is selected */}
          {!formData.isAnonymous && selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input 
                  type="email"
                  value={formData.contributorEmail}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <input 
                  type="text"
                  value={formData.contributorPhone}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Amount (KES) *
            </label>
            <input 
              type="number"
              value={formData.amount}
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value });
                setError(null);
              }}
              placeholder="Enter amount"
              min="1"
              step="0.01"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Payment Method *
            </label>
            <select 
              value={formData.paymentMethod}
              onChange={(e) => {
                setFormData({ ...formData, paymentMethod: e.target.value });
                setError(null);
                // Clear mpesa ref if not mpesa
                if (e.target.value !== 'mpesa') {
                  setFormData(prev => ({ ...prev, mpesaRef: '' }));
                }
              }}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              disabled={isSubmitting}
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mpesa">M-Pesa</option>
            </select>
          </div>

          {/* M-Pesa Reference (conditional) */}
          {formData.paymentMethod === 'mpesa' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                M-Pesa Reference Number *
              </label>
              <input 
                type="text"
                value={formData.mpesaRef}
                onChange={(e) => {
                  setFormData({ ...formData, mpesaRef: e.target.value.toUpperCase() });
                  setError(null);
                }}
                placeholder="e.g., QBR3X4Y5Z6"
                maxLength="15"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none uppercase"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              placeholder="Any additional details..."
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Summary */}
          {formData.amount > 0 && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <h4 className="font-bold text-green-900 dark:text-green-200">Summary</h4>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700 dark:text-green-300">Campaign:</span>
                  <span className="font-bold text-green-900 dark:text-green-100">{campaign.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 dark:text-green-300">Contributor:</span>
                  <span className="font-bold text-green-900 dark:text-green-100">
                    {formData.isAnonymous ? 'Anonymous' : (formData.contributorName || 'N/A')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 dark:text-green-300">Amount:</span>
                  <span className="font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(formData.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 dark:text-green-300">Method:</span>
                  <span className="font-bold text-green-900 dark:text-green-100">
                    {formData.paymentMethod.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Record Contribution
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}