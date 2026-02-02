// components/donations/ContributionDetailsModal.jsx

'use client';

import { 
  X, CheckCircle, Clock, XCircle, DollarSign, User, Mail, Phone, 
  Calendar, FileText, CreditCard, Hash, Award, Shield, TrendingUp 
} from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadge } from '@/utils/donationHelpers';

export default function ContributionDetailsModal({ contribution, onClose }) {
  const statusBadge = getStatusBadge(contribution.status);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        {/* HERO HEADER - Gradient Background */}
        <div className="relative bg-gradient-to-br from-[#8B1A1A] via-red-700 to-red-900 text-white p-4 sm:p-6 md:p-8 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/5 rounded-full -translate-y-16 translate-x-16 sm:-translate-y-32 sm:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/5 rounded-full translate-y-12 -translate-x-12 sm:translate-y-24 sm:-translate-x-24"></div>
          
          <div className="relative z-10">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-0 right-0 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Title */}
            <div className="mb-4 sm:mb-6 pr-8">
              <div className="flex items-center gap-2 mb-2">
                <Award size={20} className="text-white/80 sm:w-6 sm:h-6" />
                <h3 className="text-lg sm:text-2xl font-black">Contribution Details</h3>
              </div>
              <p className="text-white/70 text-xs sm:text-sm font-mono truncate">ID: {contribution.id}</p>
            </div>

            {/* Amount Showcase */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs sm:text-sm mb-1">Contribution Amount</p>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight truncate">
                    {formatCurrency(contribution.amount)}
                  </p>
                  <p className="text-white/70 text-xs sm:text-sm mt-2 font-semibold">
                    {(contribution.payment_method || 'cash').replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${statusBadge.bg} ${statusBadge.text} shadow-lg`}>
                    {statusBadge.icon}
                    {statusBadge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(95vh-240px)] sm:max-h-[calc(90vh-300px)] p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          
          {/* CAMPAIGN SECTION */}
          <div className="group hover:shadow-lg transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-blue-200 dark:bg-blue-800 opacity-20 rounded-bl-full"></div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-blue-600 rounded-xl shadow-lg flex-shrink-0">
                    <TrendingUp className="text-white" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Campaign</h4>
                    <p className="text-lg sm:text-xl font-black text-blue-900 dark:text-blue-100 truncate">
                      {contribution.campaign_title || 'General Offering'}
                    </p>
                  </div>
                </div>
                {contribution.campaign_type && (
                  <div className="inline-block px-3 py-1 bg-blue-200 dark:bg-blue-800 rounded-full">
                    <p className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-100">
                      {contribution.campaign_type}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTRIBUTOR INFORMATION */}
          {!contribution.is_anonymous ? (
            <div className="group hover:shadow-lg transition-all duration-300">
              <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-[#8B1A1A] rounded-xl shadow-lg flex-shrink-0">
                    <User className="text-white" size={18} />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Contributor Information
                  </h4>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                      <User size={16} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {contribution.contributor_name}
                      </p>
                    </div>
                  </div>

                  {contribution.contributor_email && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                        <Mail size={16} className="text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {contribution.contributor_email}
                        </p>
                      </div>
                    </div>
                  )}

                  {contribution.contributor_phone && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                        <Phone size={16} className="text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {contribution.contributor_phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="group hover:shadow-lg transition-all duration-300">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/30 border-2 border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-slate-600 rounded-xl shadow-lg flex-shrink-0">
                    <Shield className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Anonymous Contribution
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Contributor chose to remain anonymous
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT DETAILS */}
          <div className="group hover:shadow-lg transition-all duration-300">
            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-600 rounded-xl shadow-lg flex-shrink-0">
                  <CreditCard className="text-white" size={18} />
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Payment Details
                </h4>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                    <CreditCard size={16} className="text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Payment Method</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {(contribution.payment_method || 'cash').replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>

                {contribution.mpesa_ref && (
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-3 sm:p-4">
                    <p className="text-xs font-bold text-green-700 dark:text-green-300 mb-2">M-Pesa Reference</p>
                    <p className="text-sm font-mono font-bold text-green-900 dark:text-green-100 break-all">
                      {contribution.mpesa_ref}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="group hover:shadow-lg transition-all duration-300">
            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-purple-600 rounded-xl shadow-lg flex-shrink-0">
                  <Calendar className="text-white" size={18} />
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Timeline
                </h4>
              </div>

              <div className="relative space-y-4 sm:space-y-6 pl-6 sm:pl-8">
                {/* Vertical Line */}
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-green-600"></div>

                {/* Created */}
                <div className="relative">
                  <div className="absolute -left-5 sm:-left-6 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-600 ring-2 sm:ring-4 ring-blue-100 dark:ring-blue-950"></div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-black text-slate-900 dark:text-white mb-1">Created</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {formatDate(contribution.created_at)}
                    </p>
                    {contribution.created_by_name && (
                      <div className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-950 rounded-md">
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                          by {contribution.created_by_name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verified */}
                {contribution.verified_at && (
                  <div className="relative">
                    <div className="absolute -left-5 sm:-left-6 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-600 ring-2 sm:ring-4 ring-green-100 dark:ring-green-950"></div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield size={14} className="text-green-600" />
                        <p className="text-sm font-black text-slate-900 dark:text-white">Verified</p>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        {formatDate(contribution.verified_at)}
                      </p>
                      {contribution.verified_by_name && (
                        <div className="inline-block px-2 py-1 bg-green-100 dark:bg-green-950 rounded-md">
                          <p className="text-xs text-green-700 dark:text-green-300 font-semibold">
                            by {contribution.verified_by_name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NOTES */}
          {contribution.notes && (
            <div className="group hover:shadow-lg transition-all duration-300">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-amber-600 rounded-xl shadow-lg flex-shrink-0">
                    <FileText className="text-white" size={18} />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-100">
                    Notes
                  </h4>
                </div>
                <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed bg-white dark:bg-amber-950/50 p-3 sm:p-4 rounded-xl break-words">
                  {contribution.notes}
                </p>
              </div>
            </div>
          )}

          {/* TECHNICAL DETAILS - Collapsible */}
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 sm:p-3 bg-slate-600 rounded-xl shadow-lg flex-shrink-0">
                      <Hash className="text-white" size={18} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Technical Details
                    </h4>
                  </div>
                  <ChevronDown className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0" size={20} />
                </div>
              </div>
            </summary>
            
            <div className="mt-2 bg-slate-900 dark:bg-slate-950 border-2 border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 font-mono text-xs overflow-x-auto">
              <div className="space-y-2 text-emerald-400">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">ID:</span>
                  <span className="text-white font-bold break-all text-right">{contribution.id}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Campaign ID:</span>
                  <span className="text-white font-bold break-all text-right">{contribution.campaign_id}</span>
                </div>
                {contribution.created_by_id && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Created By ID:</span>
                    <span className="text-white font-bold break-all text-right">{contribution.created_by_id}</span>
                  </div>
                )}
                {contribution.verified_by_id && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Verified By ID:</span>
                    <span className="text-white font-bold break-all text-right">{contribution.verified_by_id}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Created:</span>
                  </div>
                  <span className="text-emerald-300 text-[10px] break-all">{new Date(contribution.created_at).toISOString()}</span>
                </div>
                {contribution.updated_at && (
                  <div className="pt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Updated:</span>
                    </div>
                    <span className="text-emerald-300 text-[10px] break-all">{new Date(contribution.updated_at).toISOString()}</span>
                  </div>
                )}
              </div>
            </div>
          </details>
        </div>

        {/* FOOTER - Sticky */}
        <div className="sticky bottom-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-[#8B1A1A] to-red-800 text-white font-black rounded-xl sm:rounded-2xl shadow-2xl shadow-red-900/30 hover:shadow-red-900/50 transition-all duration-300 active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}