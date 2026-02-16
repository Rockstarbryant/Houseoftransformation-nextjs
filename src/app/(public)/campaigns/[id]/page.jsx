'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDateShort, getCampaignTypeIcon, calculateCampaignProgress } from '@/utils/donationHelpers';
import { 
  ArrowLeft, 
  Heart, 
  Calendar, 
  Target, 
  TrendingUp, 
  Users, 
  CheckCircle,
  Smartphone,
  CreditCard,
  Building2,
  Banknote,
  Copy,
  Check,
  X,
  DollarSign,
  Phone
} from 'lucide-react';
import Link from 'next/link';

// Quick Contribution Modal Component
function QuickContributeModal({ campaign, isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState('details'); // 'details' | 'processing' | 'success'
  const [formData, setFormData] = useState({
    amount: '',
    phone: '',
    name: '',
    email: ''
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError(null);
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\s+/g, '');
    return /^254\d{9}$/.test(cleaned);
  };

  const formatPhoneNumber = (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.amount || parseFloat(formData.amount) < 10) {
      setError('Minimum contribution is KES 10');
      return;
    }

    if (!formData.phone) {
      setError('Phone number is required for M-Pesa payment');
      return;
    }

    const formattedPhone = formatPhoneNumber(formData.phone);
    if (!validatePhone(formattedPhone)) {
      setError('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }

    try {
      setIsSubmitting(true);
      setStep('processing');

      const response = await donationApi.contributions.initiateMpesa(
        campaign._id,
        parseFloat(formData.amount),
        formattedPhone
      );

      if (response.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 5000);
      } else {
        setError(response.message || 'Failed to initiate M-Pesa payment');
        setStep('details');
      }
    } catch (err) {
      console.error('M-Pesa initiation error:', err);
      setError(err.response?.data?.message || 'Failed to initiate payment');
      setStep('details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ amount: '', phone: '', name: '', email: '' });
      setError(null);
      setStep('details');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl">
        
        {/* Details Step */}
        {step === 'details' && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Quick Contribute - M-Pesa
              </h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Contributing to:
                </p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {campaign.title}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Amount (KES) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="e.g., 1000"
                    min="10"
                    required
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Minimum: KES 10
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  M-Pesa Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="0712345678 or 254712345678"
                    required
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You&apos;ll receive an M-Pesa prompt on this number
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Smartphone size={20} />
                      Pay via M-Pesa
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Processing...
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Initiating M-Pesa payment. Please wait...
            </p>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="animate-bounce">
                <Smartphone className="mx-auto text-green-600" size={64} />
              </div>
            </div>

            <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Check your phone!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We&apos;ve sent an M-Pesa payment prompt to <strong className="text-slate-900 dark:text-white">{formData.phone}</strong>
            </p>

            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                ✓ Enter your M-Pesa PIN to complete the payment
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  KES {parseFloat(formData.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Phone:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formData.phone}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Your contribution will be recorded automatically after successful payment.
            </p>

            <button
              onClick={handleClose}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CampaignDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const campaignId = params.id;

  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (campaignId) {
      loadCampaign();
    }
  }, [campaignId]);

  const loadCampaign = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await donationApi.campaigns.getById(campaignId);
      
      if (response.success) {
        setCampaign(response.campaign);
      } else {
        setError('Campaign not found');
      }
    } catch (err) {
      console.error('Error loading campaign:', err);
      setError(err.response?.data?.message || 'Failed to load campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContribute = () => {
    setShowContributeModal(true);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Campaign Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">{error}</p>
          <Link href="/donate" className="px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900">
            Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateCampaignProgress(campaign.currentAmount, campaign.goalAmount);
  const remaining = campaign.goalAmount - campaign.currentAmount;

  const paymentMethods = [
    {
      id: 'mpesa-paybill',
      icon: Smartphone,
      title: 'M-Pesa Paybill',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      details: [
        { label: 'Paybill Number', value: '247247', field: 'paybill' },
        { label: 'Account Number', value: campaign._id?.slice(-8) || 'CAMPAIGN', field: 'account' }
      ]
    },
    {
      id: 'mpesa-till',
      icon: CreditCard,
      title: 'M-Pesa Till Number',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      details: [
        { label: 'Till Number', value: '5678901', field: 'till' }
      ]
    },
    {
      id: 'bank',
      icon: Building2,
      title: 'Bank Transfer',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      details: [
        { label: 'Bank Name', value: 'Kenya Commercial Bank', field: 'bank' },
        { label: 'Account Number', value: '1234567890', field: 'bankaccount' },
        { label: 'Account Name', value: 'House of Transformation', field: 'bankname' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/donate" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-4">
            <ArrowLeft size={20} />
            Back to Campaigns
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Campaign Header */}
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-3xl sm:text-4xl">{getCampaignTypeIcon(campaign.campaignType)}</span>
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#8B1A1A] text-white text-xs sm:text-sm font-bold rounded-full uppercase">
                  {campaign.campaignType}
                </span>
                {campaign.isFeatured && (
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-500 text-white text-xs sm:text-sm font-bold rounded-full uppercase">
                    ⭐ Featured
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                {campaign.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Ends {formatDateShort(campaign.endDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={16} />
                  <span>Goal: {formatCurrency(campaign.goalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Campaign Image */}
            {campaign.imageUrl && (
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={campaign.imageUrl} 
                  alt={campaign.title}
                  className="w-full h-64 sm:h-96 object-cover"
                />
              </div>
            )}

            {/* Impact Statement */}
            {campaign.impactStatement && (
              <div className="bg-red-650 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  💡 Impact
                </h3>
                <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200">
                  {campaign.impactStatement}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">
                About This Campaign
              </h2>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {campaign.description}
              </p>
            </div>

            {/* Milestones */}
            {campaign.milestones && campaign.milestones.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Campaign Milestones
                </h2>
                <div className="space-y-4">
                  {campaign.milestones.map((milestone, index) => (
                    <div 
                      key={index}
                      className={`flex items-start gap-4 p-4 rounded-lg ${
                        milestone.achieved 
                          ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {milestone.achieved ? (
                          <CheckCircle className="text-green-600" size={24} />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-slate-300"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatCurrency(milestone.amount)}
                          </span>
                          {milestone.achieved && milestone.achievedDate && (
                            <span className="text-xs sm:text-sm text-green-600">
                              Achieved {formatDateShort(milestone.achievedDate)}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">

              {/* Campaign Details */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                  Campaign Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Type:</span>
                    <span className="font-semibold text-slate-900 dark:text-white capitalize">
                      {campaign.campaignType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Status:</span>
                    <span className={`font-semibold ${
                      campaign.status === 'active' ? 'text-green-600' : 'text-slate-600'
                    }`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Start Date:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatDateShort(campaign.startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">End Date:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatDateShort(campaign.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Pledges Allowed:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {campaign.allowPledges ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Progress Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl sm:text-3xl font-black text-green-600">
                      {formatCurrency(campaign.currentAmount)}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      raised
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <span>Goal: {formatCurrency(campaign.goalAmount)}</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mb-4">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {remaining > 0 ? (
                      <>{formatCurrency(remaining)} remaining to reach goal</>
                    ) : (
                      <>🎉 Goal reached! Thank you for your support!</>
                    )}
                  </p>
                </div>

                <button
                  onClick={handleContribute}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-base sm:text-lg shadow-lg mb-3"
                >
                  <Smartphone size={24} />
                  Contribute Now
                </button>

                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  Quick M-Pesa payment via STK Push
                </p>
              </div>

              {/* Payment Methods Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Banknote className="text-[#8B1A1A]" size={20} />
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Payment Methods
                  </h3>
                </div>

                <div className="space-y-4">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        className={`${method.bgColor} rounded-lg p-4 border border-slate-200 dark:border-slate-700`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={method.color} size={18} />
                          <span className={`font-semibold text-sm ${method.color}`}>
                            {method.title}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {method.details.map((detail) => (
                            <div
                              key={detail.field}
                              className="flex items-center justify-between bg-white dark:bg-slate-800 rounded px-3 py-2"
                            >
                              <div className="flex-1">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {detail.label}
                                </p>
                                <p className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                  {detail.value}
                                </p>
                              </div>
                              <button
                                onClick={() => copyToClipboard(detail.value, detail.field)}
                                className="ml-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Copy to clipboard"
                              >
                                {copiedField === detail.field ? (
                                  <Check className="text-green-600" size={16} />
                                ) : (
                                  <Copy className="text-slate-400" size={16} />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-4">
                  <p className="text-amber-800 dark:text-amber-200 text-xs">
                    💡 <strong>Note:</strong> After manual payment, contact us to verify your contribution.
                  </p>
                </div>
              </div>

              {/* Share */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                  Share This Campaign
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Help us reach our goal by sharing with your network
                </p>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: campaign.title,
                        text: campaign.description,
                        url: window.location.href
                      });
                    }
                  }}
                  className="w-full bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white py-3 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Share Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Contribute Modal */}
      {campaign && (
        <QuickContributeModal
          campaign={campaign}
          isOpen={showContributeModal}
          onClose={() => setShowContributeModal(false)}
          onSuccess={() => {
            loadCampaign();
          }}
        />
      )}
    </div>
  );
}