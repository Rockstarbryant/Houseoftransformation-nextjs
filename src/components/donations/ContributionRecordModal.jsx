// components/donations/ContributionRecordModal.jsx
// ✅ MODERN REDESIGN - Fully responsive with FIXED anonymous checkbox + ALL logic preserved

'use client';

import { useState, useEffect } from 'react';
import { donationApi } from '@/services/api/donationService';
import api from '@/lib/api';
import { formatCurrency } from '@/utils/donationHelpers';
import { 
  X, DollarSign, CheckCircle, AlertCircle, Search, UserCheck, 
  User, Mail, Phone, Wallet, CreditCard, FileText, UserX
} from 'lucide-react';

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

  // ✅ VALIDATION - ALL ORIGINAL LOGIC PRESERVED
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        {/* HERO HEADER - Gradient */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6 md:p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative z-10">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute top-0 right-0 p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                <DollarSign size={28} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black">Record Contribution</h3>
                <p className="text-white/80 text-sm md:text-base mt-1">
                  Campaign: <strong>{campaign.title}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mx-4 md:mx-6 mt-4 md:mt-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <div className="p-2 bg-red-200 dark:bg-red-800 rounded-xl">
              <AlertCircle className="text-red-700 dark:text-red-200" size={20} />
            </div>
            <p className="text-red-900 dark:text-red-100 text-sm font-bold flex-1">{error}</p>
          </div>
        )}

        {/* SCROLLABLE FORM */}
        <div className="max-h-[calc(90vh-200px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
            
            {/* ✅ FIXED: Anonymous Toggle - Now Fully Clickable */}
            <div 
              onClick={() => {
                if (!isSubmitting) {
                  const newAnonymousState = !formData.isAnonymous;
                  setFormData({ ...formData, isAnonymous: newAnonymousState });
                  if (newAnonymousState) {
                    handleClearUser();
                  }
                }
              }}
              className="cursor-pointer"
            >
              <div className={`p-4 md:p-6 rounded-2xl border-2 transition-all ${
                formData.isAnonymous
                  ? 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-300 dark:border-purple-700'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
              }`}>
                <div className="flex items-center gap-3">
                  {/* Custom Toggle Switch */}
                  <div className={`relative w-14 h-8 rounded-full transition-colors ${
                    formData.isAnonymous ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${
                      formData.isAnonymous ? 'right-1' : 'left-1'
                    }`}></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <UserX size={20} className={formData.isAnonymous ? 'text-purple-600' : 'text-slate-400'} />
                      <span className={`font-bold ${
                        formData.isAnonymous 
                          ? 'text-purple-900 dark:text-purple-200' 
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {formData.isAnonymous ? '✅ Anonymous Contribution' : 'Record Contributor Details'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {formData.isAnonymous ? 'Contributor identity will be hidden' : 'Click to make anonymous'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Search - Only if NOT anonymous */}
            {!formData.isAnonymous && users.length > 0 && (
              <div className="animate-in slide-in-from-top duration-300">
                <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4 md:p-6">
                  <label className="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                    <Search size={16} />
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-700 bg-white dark:bg-blue-950/50 text-slate-900 dark:text-white placeholder-blue-400 dark:placeholder-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                      disabled={isSubmitting || selectedUser !== null}
                    />
                    
                    {showUserDropdown && filteredUsers.length > 0 && !selectedUser && (
                      <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                        {filteredUsers.slice(0, 10).map(user => (
                          <button
                            key={user._id}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-950/30 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
                          >
                            <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                            {user.phone && <p className="text-xs text-slate-500">{user.phone}</p>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {selectedUser && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="text-green-600" size={18} />
                        <div>
                          <p className="text-sm font-bold text-green-900 dark:text-green-200">{selectedUser.name}</p>
                          <p className="text-xs text-green-700 dark:text-green-300">{selectedUser.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearUser}
                        className="px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg font-bold transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Manual Entry Fields - Only if NOT anonymous and NO user selected */}
            {!formData.isAnonymous && !selectedUser && (
              <div className="space-y-4 animate-in slide-in-from-top duration-300">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <User size={16} className="text-blue-600" />
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                      <Mail size={16} className="text-purple-600" />
                      Email <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input 
                      type="email"
                      value={formData.contributorEmail}
                      onChange={(e) => {
                        setFormData({ ...formData, contributorEmail: e.target.value });
                        setError(null);
                      }}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                      <Phone size={16} className="text-green-600" />
                      Phone <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input 
                      type="text"
                      value={formData.contributorPhone}
                      onChange={(e) => {
                        setFormData({ ...formData, contributorPhone: e.target.value });
                        setError(null);
                      }}
                      placeholder="0712345678"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Read-only when user selected */}
            {!formData.isAnonymous && selectedUser && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Email</label>
                  <input 
                    type="email"
                    value={formData.contributorEmail}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Phone</label>
                  <input 
                    type="text"
                    value={formData.contributorPhone}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-600" />
                Amount (KES) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
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
                  className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-bold text-lg"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" />
                Payment Method *
              </label>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
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
                    className={`p-3 md:p-4 rounded-xl border-2 transition-all text-center ${
                      formData.paymentMethod === method.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <div className={`text-xs font-bold ${
                      formData.paymentMethod === method.value
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {method.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* M-Pesa Reference */}
            {formData.paymentMethod === 'mpesa' && (
              <div className="animate-in slide-in-from-top duration-300">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 rounded-2xl p-4 md:p-6">
                  <label className="block text-sm font-bold text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
                    <Wallet size={16} />
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
                    className="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-green-300 dark:border-green-700 bg-white dark:bg-green-950/50 text-slate-900 dark:text-white placeholder-green-400 dark:placeholder-green-600 focus:ring-2 focus:ring-green-500 outline-none uppercase font-mono font-bold"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-amber-600" />
                Notes (Optional)
              </label>
              <textarea 
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                placeholder="Any additional details..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Summary */}
            {formData.amount > 0 && (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 md:p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-emerald-200 dark:bg-emerald-800 rounded-xl">
                    <CheckCircle className="text-emerald-700 dark:text-emerald-200" size={20} />
                  </div>
                  <h4 className="font-black text-emerald-900 dark:text-emerald-100 text-lg">Summary</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Campaign:</span>
                    <span className="font-bold text-emerald-900 dark:text-emerald-100">{campaign.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Contributor:</span>
                    <span className="font-bold text-emerald-900 dark:text-emerald-100">
                      {formData.isAnonymous ? 'Anonymous' : (formData.contributorName || 'N/A')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800">
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Amount:</span>
                    <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                      {formatCurrency(formData.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Method:</span>
                    <span className="font-bold text-emerald-900 dark:text-emerald-100">
                      {formData.paymentMethod.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* FOOTER - Sticky */}
        <div className="sticky bottom-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 md:py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button 
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 md:py-4 rounded-xl font-black shadow-2xl shadow-blue-900/30 hover:shadow-blue-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
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
        </div>
      </div>
    </div>
  );
}