// components/donations/ContributionDetailsModal.jsx

'use client';

import { 
  X, User, Mail, Phone, Calendar, CreditCard, 
  Hash, Shield, TrendingUp, FileText, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadge } from '@/utils/donationHelpers';

export default function ContributionDetailsModal({ contribution, onClose }) {
  const statusBadge = getStatusBadge(contribution.status);

  // Helper component for consistent label/value pairs
  const DetailRow = ({ icon: Icon, label, value, subValue, className = "" }) => (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="mt-0.5 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md shrink-0">
        <Icon size={14} className="text-gray-500 dark:text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {value || 'N/A'}
        </p>
        {subValue && (
          <p className="text-xs text-gray-500 mt-0.5 break-all">{subValue}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Contribution Details
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.bg} ${statusBadge.text} border-opacity-20`}>
                {statusBadge.icon}
                {statusBadge.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-mono">
              ID: {contribution.id}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto flex-1 p-6 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* LEFT COLUMN */}
            <div className="space-y-6">
              
              {/* Primary Amount Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {formatCurrency(contribution.amount)}
                  </h1>
                  <span className="text-sm font-medium text-gray-500 uppercase">
                    {(contribution.payment_method || 'cash').replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Campaign Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-600" />
                  Campaign Context
                </h3>
                <div className="space-y-4">
                  <DetailRow 
                    icon={TrendingUp} 
                    label="Target Campaign" 
                    value={contribution.campaign_title || 'General Offering'} 
                  />
                  {contribution.campaign_type && (
                    <DetailRow 
                      icon={Hash} 
                      label="Campaign Type" 
                      value={contribution.campaign_type} 
                    />
                  )}
                </div>
              </div>

              {/* Contributor Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User size={16} className="text-gray-500" />
                  Contributor Profile
                </h3>
                
                {contribution.is_anonymous ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md border border-gray-100 dark:border-gray-700 border-dashed">
                    <Shield className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Anonymous Donor</p>
                      <p className="text-xs text-gray-500">Identity hidden by request</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <DetailRow 
                      icon={User} 
                      label="Name" 
                      value={contribution.contributor_name} 
                    />
                    {contribution.contributor_email && (
                      <DetailRow 
                        icon={Mail} 
                        label="Email" 
                        value={contribution.contributor_email} 
                      />
                    )}
                    {contribution.contributor_phone && (
                      <DetailRow 
                        icon={Phone} 
                        label="Phone" 
                        value={contribution.contributor_phone} 
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">

              {/* Payment Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-gray-500" />
                  Transaction Data
                </h3>
                <div className="space-y-4">
                  <DetailRow 
                    icon={CreditCard} 
                    label="Method" 
                    value={(contribution.payment_method || 'cash').replace('_', ' ').toUpperCase()} 
                  />
                  {contribution.mpesa_ref && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 bg-green-50 dark:bg-green-900/20 rounded-md shrink-0">
                        <Hash size={14} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          M-Pesa Reference
                        </p>
                        <p className="text-sm font-mono font-bold text-green-700 dark:text-green-400 break-all">
                          {contribution.mpesa_ref}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  Audit Trail
                </h3>
                
                <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-6">
                  {/* Created Step */}
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 bg-blue-500"></div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Created</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(contribution.created_at)}
                      </p>
                      {contribution.created_by_name && (
                        <p className="text-xs text-gray-400 mt-0.5">by {contribution.created_by_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Verified Step (Conditional) */}
                  {contribution.verified_at && (
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 bg-green-500"></div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Verified</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(contribution.verified_at)}
                        </p>
                        {contribution.verified_by_name && (
                          <p className="text-xs text-gray-400 mt-0.5">by {contribution.verified_by_name}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {contribution.notes && (
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800/30 p-4">
                  <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-200">
                    <FileText size={14} />
                    <span className="text-xs font-bold uppercase">Notes</span>
                  </div>
                  <p className="text-sm text-amber-900 dark:text-amber-100 italic leading-relaxed">
                    "{contribution.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Technical Details (Collapsed) */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-4">
            <details className="group">
              <summary className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-600 cursor-pointer select-none">
                <Hash size={12} />
                <span>View System Metadata</span>
              </summary>
              <div className="mt-3 p-4 bg-gray-50 dark:bg-black/30 rounded-lg border border-gray-100 dark:border-gray-800 font-mono text-[11px] text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                  <span>Record ID:</span>
                  <span className="text-gray-700 dark:text-gray-300">{contribution.id}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                  <span>Campaign ID:</span>
                  <span className="text-gray-700 dark:text-gray-300">{contribution.campaign_id}</span>
                </div>
                {contribution.created_by_id && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span>Creator ID:</span>
                    <span className="text-gray-700 dark:text-gray-300">{contribution.created_by_id}</span>
                  </div>
                )}
                {contribution.verified_by_id && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span>Verifier ID:</span>
                    <span className="text-gray-700 dark:text-gray-300">{contribution.verified_by_id}</span>
                  </div>
                )}
                <div className="col-span-full pt-2 text-gray-400">
                  Created: {new Date(contribution.created_at).toISOString()} <br/>
                  {contribution.updated_at && `Updated: ${new Date(contribution.updated_at).toISOString()}`}
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 transition-all text-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}