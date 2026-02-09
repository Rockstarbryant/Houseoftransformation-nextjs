// components/donations/ContributionRecordModal.jsx

'use client';

import { useState, useEffect } from 'react';
import { donationApi } from '@/services/api/donationService';
import api from '@/lib/api';
import { formatCurrency } from '@/utils/donationHelpers';
import { 
  X, DollarSign, CheckCircle, AlertCircle, Search, UserCheck, 
  User, Mail, Phone, Wallet, CreditCard, FileText, UserX, ChevronRight, Loader2
} from 'lucide-react';

export default function ContributionRecordModal({ campaign, onClose, onSuccess }) {
  // ---------------------------------------------------------
  // 1. STATE & LOGIC (Preserved Exactly)
  // ---------------------------------------------------------
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
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        if (response?.data?.success) {
          setUsers(response.data.users || []);
        }
      } catch (error) {
        console.error('[CONTRIB-MODAL] Fetch users error:', error);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return false;
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.includes(search)
    );
  });

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

  const handleClearUser = () => {
    setSelectedUser(null);
    setFormData({
      ...formData,
      contributorName: '',
      contributorEmail: '',
      contributorPhone: ''
    });
  };

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

      if (formData.contributorEmail.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.contributorEmail)) {
          setError('Invalid email format');
          return false;
        }
      }

      if (formData.contributorPhone.trim()) {
        const phoneRegex = /^(254|0)[0-9]{9}$/;
        if (!phoneRegex.test(formData.contributorPhone.replace(/\s/g, ''))) {
          setError('Invalid phone number. Use: 0712345678 or 254712345678');
          return false;
        }
      }
    }

    if (formData.paymentMethod === 'mpesa' && !formData.mpesaRef.trim()) {
      setError('M-Pesa reference is required');
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
      let formattedPhone = null;
      if (formData.contributorPhone && formData.contributorPhone.trim()) {
        formattedPhone = formData.contributorPhone.replace(/\s/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '254' + formattedPhone.substring(1);
        }
      }

      const response = await donationApi.contributions.create({
        campaignId: campaign._id,
        contributorName: formData.isAnonymous ? 'Anonymous' : formData.contributorName,
        contributorEmail: formData.isAnonymous ? null : (formData.contributorEmail.trim() || null),
        contributorPhone: formData.isAnonymous ? null : formattedPhone,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        mpesaRef: formData.mpesaRef || null,
        notes: formData.notes || null,
        isAnonymous: formData.isAnonymous
      });

      if (response.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to record contribution');
      }
    } catch (err) {
      console.error('[CONTRIBUTION-RECORD] Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to record contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // 2. MODERN UI
  // ---------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-t-xl z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record Contribution</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              For Campaign: <span className="font-medium text-blue-600 dark:text-blue-400">{campaign.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          )}

          <form id="contribution-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* ANONYMOUS TOGGLE CARD */}
            <div 
              onClick={() => {
                if (!isSubmitting) {
                  const newAnonymousState = !formData.isAnonymous;
                  setFormData({ ...formData, isAnonymous: newAnonymousState });
                  if (newAnonymousState) handleClearUser();
                }
              }}
              className={`
                group relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${formData.isAnonymous 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${formData.isAnonymous ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                  <UserX size={20} />
                </div>
                <div>
                  <p className={`font-semibold ${formData.isAnonymous ? 'text-purple-900 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>
                    Anonymous Contribution
                  </p>
                  <p className="text-xs text-gray-500">
                    Hide contributor details from public records
                  </p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isAnonymous ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${formData.isAnonymous ? 'right-1' : 'left-1'}`} />
              </div>
            </div>

            {/* USER SEARCH (Conditional) */}
            {!formData.isAnonymous && (
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Find Registered User (Optional)
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowUserDropdown(e.target.value.length > 0);
                      }}
                      onFocus={() => searchTerm && setShowUserDropdown(true)}
                      placeholder="Search name, email or phone..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none text-sm"
                      disabled={isSubmitting || selectedUser !== null}
                    />
                  </div>

                  {/* Dropdown Results */}
                  {showUserDropdown && filteredUsers.length > 0 && !selectedUser && (
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                      {filteredUsers.slice(0, 5).map(user => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center justify-between group"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected User Badge */}
                {selectedUser && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-800 p-1.5 rounded-full">
                        <UserCheck size={16} className="text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.name}</p>
                        <p className="text-xs text-gray-500">{selectedUser.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearUser}
                      className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MANUAL ENTRY FIELDS */}
            {!formData.isAnonymous && !selectedUser && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contributor Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text"
                      value={formData.contributorName}
                      onChange={(e) => { setFormData({ ...formData, contributorName: e.target.value }); setError(null); }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      placeholder="e.g. Maxwell wepukhulu"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="email"
                      value={formData.contributorEmail}
                      onChange={(e) => { setFormData({ ...formData, contributorEmail: e.target.value }); setError(null); }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      placeholder="aminata@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text"
                      value={formData.contributorPhone}
                      onChange={(e) => { setFormData({ ...formData, contributorPhone: e.target.value }); setError(null); }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      placeholder="0712345678"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-gray-800 my-4"></div>

            {/* AMOUNT & PAYMENT METHOD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Amount (KES) *</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <DollarSign className="text-gray-600 dark:text-gray-300" size={16} />
                  </div>
                  <input 
                    type="number"
                    value={formData.amount}
                    onChange={(e) => { setFormData({ ...formData, amount: e.target.value }); setError(null); }}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cash', label: 'Cash', icon: '💵' },
                    { value: 'bank_transfer', label: 'Bank', icon: '🏦' },
                    { value: 'mpesa', label: 'M-Pesa', icon: '📱' }
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, paymentMethod: method.value, mpesaRef: method.value !== 'mpesa' ? '' : formData.mpesaRef });
                        setError(null);
                      }}
                      className={`
                        flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border transition-all duration-200
                        ${formData.paymentMethod === method.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                      `}
                    >
                      <span className="text-lg mb-1">{method.icon}</span>
                      <span className="text-[10px] font-bold uppercase">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MPESA REFERENCE (Conditional) */}
            {formData.paymentMethod === 'mpesa' && (
              <div className="animate-in slide-in-from-top-2 duration-300 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl">
                <label className="block text-xs font-bold text-green-800 dark:text-green-400 mb-2 flex items-center gap-2">
                  <Wallet size={14} /> M-Pesa Reference Number *
                </label>
                <input 
                  type="text"
                  value={formData.mpesaRef}
                  onChange={(e) => { setFormData({ ...formData, mpesaRef: e.target.value.toUpperCase() }); setError(null); }}
                  placeholder="e.g. QBR3X4Y5Z6"
                  maxLength="15"
                  className="w-full px-4 py-2.5 rounded-lg border border-green-300 dark:border-green-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none font-mono font-bold uppercase tracking-wider"
                  required
                />
              </div>
            )}

            {/* NOTES */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Additional Notes (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                  placeholder="Add context about this donation..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                />
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER - SUMMARY & ACTIONS */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Mini Summary */}
            <div className="hidden sm:block">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Contribution</p>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                {formData.amount > 0 ? formatCurrency(formData.amount) : 'KES 0.00'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                form="contribution-form"
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 dark:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Confirm Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}