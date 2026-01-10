// src/components/donation/PledgeProgress.jsx
import React, { useState } from 'react';
import { Download, AlertCircle, CheckCircle, TrendingUp, Calendar, Heart, Zap } from 'lucide-react';
import Card from '../common/Card';
import { getDaysRemaining, formatDate, formatKES, getStatusClasses } from '../../utils/donationHelpers';

const PledgeProgress = ({ pledge, campaign, onPayment, onDownloadReceipt }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!pledge) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600">No pledge data available</p>
      </Card>
    );
  }

  const progress = pledge.pledgedAmount ? (pledge.paidAmount / pledge.pledgedAmount) * 100 : 0;
  const daysLeft = campaign ? getDaysRemaining(campaign.endDate) : 0;
  const isCompleted = pledge.status === 'completed';
  const hasRemaining = pledge.remainingAmount > 0;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': 
        return <CheckCircle size={18} className="text-green-600" />;
      case 'partial': 
        return <TrendingUp size={18} className="text-yellow-600" />;
      default: 
        return <AlertCircle size={18} className="text-blue-600" />;
    }
  };

  const getInstallmentDetails = () => {
    if (!pledge.installmentPlan || pledge.installmentPlan === 'lump-sum') {
      return { label: 'One-time Payment', duration: '' };
    }
    
    const plans = {
      'weekly': { label: 'Weekly Installments', duration: '7 days' },
      'bi-weekly': { label: 'Bi-weekly Installments', duration: '14 days' },
      'monthly': { label: 'Monthly Installments', duration: '30 days' }
    };
    
    return plans[pledge.installmentPlan] || plans.weekly;
  };

  const installmentDetails = getInstallmentDetails();

  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        
        {/* Main Content - Left Section */}
        <div className="flex-grow">
          {/* Header with Status */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="text-red-600" size={24} />
                <h3 className="text-2xl font-bold text-gray-900">
                  {campaign?.name || 'Campaign Pledge'}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {campaign?.type && `${campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)} Campaign`}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${getStatusClasses(pledge.status)}`}>
              {getStatusIcon(pledge.status)}
              <span>{pledge.status.charAt(0).toUpperCase() + pledge.status.slice(1)}</span>
            </div>
          </div>

          {/* Amount Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition">
              <p className="text-xs text-gray-600 font-semibold mb-1">Total Pledged</p>
              <p className="text-xl font-bold text-blue-900">
                {formatKES(pledge.pledgedAmount)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200 hover:border-green-400 transition">
              <p className="text-xs text-gray-600 font-semibold mb-1">Already Paid</p>
              <p className="text-xl font-bold text-green-600">
                {formatKES(pledge.paidAmount)}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200 hover:border-orange-400 transition">
              <p className="text-xs text-gray-600 font-semibold mb-1">Remaining</p>
              <p className="text-xl font-bold text-orange-600">
                {formatKES(pledge.remainingAmount)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition">
              <p className="text-xs text-gray-600 font-semibold mb-1">Days Left</p>
              <p className="text-xl font-bold text-purple-600">
                {daysLeft > 0 ? daysLeft : 'Ended'}
              </p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Payment Progress</p>
              <p className="text-sm font-bold text-blue-600 flex items-center gap-1">
                <Zap size={16} className="text-yellow-500" />
                {Math.round(progress)}% Complete
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-green-500 via-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-600">
                {Math.round(progress)}% of {formatKES(pledge.pledgedAmount)} paid
              </p>
              <p className="text-xs text-gray-600">
                {pledge.installmentPlan === 'lump-sum' ? 'Full Payment' : installmentDetails.label}
              </p>
            </div>
          </div>

          {/* Payment Schedule Info */}
          {pledge.installmentPlan && pledge.installmentPlan !== 'lump-sum' && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200 mb-6">
              <div className="flex items-start gap-3">
                <Calendar className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-grow">
                  <p className="text-sm font-bold text-gray-900 mb-1">Payment Schedule</p>
                  <p className="text-sm text-gray-700">
                    You have committed to pay in <span className="font-bold text-blue-900">{installmentDetails.label.toLowerCase()}</span>.
                  </p>
                  {pledge.nextPaymentDue && (
                    <p className="text-xs text-gray-600 mt-2">
                      📅 Next payment due: <span className="font-semibold text-blue-900">{formatDate(pledge.nextPaymentDue)}</span>
                    </p>
                  )}
                  {installmentDetails.duration && (
                    <p className="text-xs text-gray-600 mt-1">
                      ⏱️ Payment interval: <span className="font-semibold">{installmentDetails.duration}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Campaign Description */}
          {campaign?.description && (
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-gray-900">Campaign Details: </span>
                {campaign.description}
              </p>
            </div>
          )}

          {/* Impact Statement */}
          {campaign?.impactStatement && (
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <p className="text-sm text-green-900">
                <span className="font-bold">💡 Impact: </span>
                {campaign.impactStatement}
              </p>
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex flex-col gap-3 w-full lg:w-auto lg:min-w-[200px]">
          {/* Payment Button */}
          {hasRemaining ? (
            <div className="space-y-2">
              <button
                onClick={() => onPayment && onPayment(pledge)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Heart size={18} />
                Make Payment
              </button>
              <p className="text-xs text-gray-600 text-center font-semibold">
                {formatKES(pledge.remainingAmount)} remaining
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-100 to-green-50 text-green-800 px-6 py-3 rounded-lg font-bold text-center border-2 border-green-300 flex items-center justify-center gap-2">
              <CheckCircle size={20} />
              Completed ✓
            </div>
          )}
          
          {/* Receipt Button */}
          <button
            onClick={() => onDownloadReceipt && onDownloadReceipt(pledge)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Receipt
          </button>

          {/* Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold text-sm transition"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>

          {/* Detailed Info */}
          {showDetails && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3 mt-4">
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-bold text-gray-900">{pledge.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-bold text-gray-900">{formatDate(pledge.createdAt)}</span>
                </div>
                {pledge.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-bold text-gray-900">{formatDate(pledge.dueDate)}</span>
                  </div>
                )}
                {pledge.memberPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-bold text-gray-900">{pledge.memberPhone}</span>
                  </div>
                )}
                {pledge.memberEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-bold text-gray-900">{pledge.memberEmail}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PledgeProgress;