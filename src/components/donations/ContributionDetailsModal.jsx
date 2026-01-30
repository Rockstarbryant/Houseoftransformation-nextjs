'use client';

import { X, CheckCircle, Clock, XCircle, DollarSign, User, Mail, Phone, Calendar, FileText, CreditCard, Hash } from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadge } from '@/utils/donationHelpers';

export default function ContributionDetailsModal({ contribution, onClose }) {
  const statusBadge = getStatusBadge(contribution.status);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Contribution Details
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              ID: {contribution.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${statusBadge.bg} ${statusBadge.text}`}>
              {statusBadge.icon}
              <span className="ml-2">{statusBadge.label}</span>
            </span>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(contribution.amount)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {(contribution.payment_method || 'cash').toUpperCase()}
              </p>
            </div>
          </div>

          {/* Campaign */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-blue-600" size={20} />
              <h4 className="font-bold text-blue-900 dark:text-blue-200">Campaign</h4>
            </div>
            <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {contribution.campaign_title || 'General Offering'}
            </p>
            {contribution.campaign_type && (
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Type: {contribution.campaign_type}
              </p>
            )}
          </div>

          {/* Contributor Info */}
          {!contribution.is_anonymous && (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <User size={20} />
                Contributor Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-600 dark:text-slate-400" />
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {contribution.contributor_name}
                  </span>
                </div>
                {contribution.contributor_email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-slate-600 dark:text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {contribution.contributor_email}
                    </span>
                  </div>
                )}
                {contribution.contributor_phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-slate-600 dark:text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {contribution.contributor_phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {contribution.is_anonymous && (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center">
              <User size={32} className="text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">
                Anonymous Contribution
              </p>
            </div>
          )}

          {/* Payment Details */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CreditCard size={20} />
              Payment Details
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Method:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {(contribution.payment_method || 'cash').replace('_', ' ').toUpperCase()}
                </span>
              </div>
              {contribution.mpesa_ref && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">M-Pesa Ref:</span>
                  <code className="text-xs bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200 px-2 py-1 rounded font-mono">
                    {contribution.mpesa_ref}
                  </code>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  {formatCurrency(contribution.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar size={20} />
              Timeline
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Created</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {formatDate(contribution.created_at)}
                  </p>
                  {contribution.created_by_name && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      by {contribution.created_by_name}
                    </p>
                  )}
                </div>
              </div>
              
              {contribution.verified_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Verified</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {formatDate(contribution.verified_at)}
                    </p>
                    {contribution.verified_by_name && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        by {contribution.verified_by_name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {contribution.notes && (
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2 flex items-center gap-2">
                <FileText size={20} />
                Notes
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-100">
                {contribution.notes}
              </p>
            </div>
          )}

          {/* Technical Details */}
          <details className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <summary className="font-bold text-slate-900 dark:text-white cursor-pointer flex items-center gap-2">
              <Hash size={20} />
              Technical Details
            </summary>
            <div className="mt-3 space-y-1 text-xs font-mono text-slate-600 dark:text-slate-400">
              <p>ID: {contribution.id}</p>
              <p>Campaign ID: {contribution.campaign_id}</p>
              {contribution.created_by_id && <p>Created By ID: {contribution.created_by_id}</p>}
              {contribution.verified_by_id && <p>Verified By ID: {contribution.verified_by_id}</p>}
              <p>Created: {new Date(contribution.created_at).toISOString()}</p>
              {contribution.updated_at && <p>Updated: {new Date(contribution.updated_at).toISOString()}</p>}
            </div>
          </details>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}