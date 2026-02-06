'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, getCampaignTypeIcon, calculateCampaignProgress } from '@/utils/donationHelpers';
import { 
  Heart, 
  TrendingUp, 
  Calendar,
  ShieldCheck,  
  Target,
  Globe, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Smartphone,
  CreditCard,
  Building2,
  Banknote,
  Copy,
  Check,
  X,
  Sparkles,
  DollarSign,
  Gift,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ContributionForm from '@/components/donations/ContributionForm';

// Payment Details Component
function PaymentDetailsCard({ campaign }) {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Banknote className="text-[#8B1A1A]" size={20} />
        <h4 className="font-bold text-slate-900 dark:text-white">
          Payment Methods
        </h4>
      </div>

      {paymentMethods.map((method) => {
        const Icon = method.icon;
        return (
          <div
            key={method.id}
            className={`${method.bgColor} rounded-lg p-4 border border-slate-200 dark:border-slate-700`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className={method.color} size={20} />
              <span className={`font-semibold ${method.color}`}>
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
                    <p className="font-mono font-bold text-slate-900 dark:text-white">
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

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
        <p className="text-amber-800 dark:text-amber-200 text-xs">
          💡 <strong>Note:</strong> After making a manual payment, please contact us or use the &quot;My Pledges&quot; section to record your contribution.
        </p>
      </div>
    </div>
  );
}

// Tithe/Offering Card Component
function TitheOfferingCard({ type, title, subtitle, verse, reference, color, icon }) {
  const [showPayment, setShowPayment] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-blue-700',
      button: 'bg-white text-blue-700 hover:bg-blue-50',
      bgOverlay: 'bg-blue-50 dark:bg-blue-950/30',
      textLight: 'text-blue-100',
      text: 'text-blue-700'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-700',
      button: 'bg-white text-purple-700 hover:bg-purple-50',
      bgOverlay: 'bg-purple-50 dark:bg-purple-950/30',
      textLight: 'text-purple-100',
      text: 'text-purple-700'
    }
  };

  const colors = colorClasses[color];
  const IconComponent = icon === 'church' ? Building2 : Gift;

  const paymentMethods = [
    {
      id: 'mpesa-paybill',
      icon: Smartphone,
      title: 'M-Pesa Paybill',
      details: [
        { label: 'Paybill Number', value: '247247', field: 'paybill' },
        { label: 'Account Number', value: type === 'tithe' ? 'TITHE' : 'OFFERING', field: 'account' }
      ]
    },
    {
      id: 'mpesa-till',
      icon: CreditCard,
      title: 'M-Pesa Till',
      details: [
        { label: 'Till Number', value: '5678901', field: 'till' }
      ]
    },
    {
      id: 'bank',
      icon: Building2,
      title: 'Bank Transfer',
      details: [
        { label: 'Bank', value: 'Kenya Commercial Bank', field: 'bank' },
        { label: 'Account', value: '1234567890', field: 'bankaccount' }
      ]
    }
  ];

  return (
    <div className={`bg-gradient-to-br ${colors.gradient} rounded-2xl shadow-xl overflow-hidden`}>
      <div className="p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <IconComponent size={40} />
          <div>
            <h3 className="text-2xl sm:text-3xl font-black">{title}</h3>
            <p className={`${colors.textLight} text-sm`}>{subtitle}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
          <p className="text-white text-sm mb-1 leading-relaxed">
            &quot;{verse}&quot;
          </p>
          <p className={`${colors.textLight} text-xs`}>- {reference}</p>
        </div>

        <button
          onClick={() => setShowPayment(!showPayment)}
          className={`w-full ${colors.button} py-3 sm:py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2`}
        >
          <IconComponent size={20} />
          {showPayment ? 'Hide Payment Info' : `Give Your ${title}`}
        </button>

        {/* Payment Methods */}
        {showPayment && (
          <div className="mt-6 space-y-4">
            {paymentMethods.map((method) => {
              const MethodIcon = method.icon;
              return (
                <div key={method.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MethodIcon size={18} className="text-white" />
                    <span className="text-sm font-bold text-white">{method.title}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {method.details.map((detail) => (
                      <div
                        key={detail.field}
                        className="flex items-center justify-between bg-white/20 rounded px-3 py-2"
                      >
                        <div className="flex-1">
                          <p className={`text-xs ${colors.textLight}`}>{detail.label}</p>
                          <p className="font-mono text-sm font-bold text-white">{detail.value}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(detail.value, `${type}-${detail.field}`)}
                          className="ml-2 p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          {copiedField === `${type}-${detail.field}` ? (
                            <Check className="text-green-300" size={16} />
                          ) : (
                            <Copy className="text-white" size={16} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Contribution Modal Component
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
    // Kenya phone format: 254XXXXXXXXX
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

    // Validation
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

export default function DonatePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [campaigns, setCampaigns] = useState([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState({});

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const [allRes, featuredRes] = await Promise.all([
        donationApi.campaigns.getAll({ status: 'active', visibility: 'public' }),
        donationApi.campaigns.getFeatured()
      ]);

      if (allRes.success) {
        setCampaigns(allRes.campaigns || []);
      }

      if (featuredRes.success) {
        setFeaturedCampaigns(featuredRes.campaigns || []);
      }
    } catch (err) {
      console.error('Error loading campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContribute = (campaign) => {
    setSelectedCampaign(campaign);
    setShowContributeModal(true);
  };

  const togglePaymentDetails = (campaignId) => {
    setShowPaymentDetails(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-slate-900">
            {/* Abstract Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-[#8B1A1A]/90"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/20 via-slate-900/80 to-slate-950"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="text-left space-y-8 animate-in slide-in-from-left-4 duration-500">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
                <Sparkles size={14} className="text-yellow-400" />
                <span>Transforming Busia County, Kenya</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                Empower a Life, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-white">
                  Build a Future.
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-300 max-w-xl leading-relaxed">
                Your generosity is the seed of hope. Join House of Transformation in spreading God&apos;s love through tangible support in Mombasa and beyond.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link href="#campaigns" className="px-8 py-4 bg-[#8B1A1A] hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center gap-2">
                  View Active Campaigns
                  <ArrowRight size={18} />
                </Link>
                <Link href="/portal/donations" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 backdrop-blur-sm text-white font-semibold rounded-xl transition-all">
                  Manage Pledges
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-white/10 flex flex-wrap gap-8 text-white/60 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-green-400" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-blue-400" />
                  <span>Transparent Impact</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-yellow-400" />
                  <span>Community Driven</span>
                </div>
              </div>
            </div>

            {/* Right Content - Visual Card */}
            <div className="hidden lg:block relative animate-in slide-in-from-right-4 duration-500 delay-100">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                 <div className="flex items-start justify-between mb-8">
                    <div>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Total Impact</p>
                        <h3 className="text-3xl font-bold text-white">Join the Mission</h3>
                    </div>
                    <div className="p-3 bg-[#8B1A1A]/20 rounded-lg">
                        <Heart className="text-red-500 fill-red-500" size={24} />
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-white font-bold">100% Goes to the Cause</p>
                            <p className="text-slate-400 text-xs">Direct impact on families</p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-white font-bold">Real-time Updates</p>
                            <p className="text-slate-400 text-xs">Track progress on the portal</p>
                        </div>
                    </div>
                 </div>

                 <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-slate-400 text-sm">
                        &quot;Let each of you look not only to his own interests, but also to the interests of others.&quot; <br/>
                        <span className="text-white/60 italic">- Philippians 2:4</span>
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tithe & Offerings Section */}
        <section id="tithe-offerings" className="py-12 sm:py-16 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
                Tithes & Offerings
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
                Honor God with your faithful giving
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Tithe Card */}
              <TitheOfferingCard
                type="tithe"
                title="Tithe"
                subtitle="Honor God with your first fruits"
                verse="Bring the whole tithe into the storehouse..."
                reference="Malachi 3:10"
                color="blue"
                icon="church"
              />

              {/* Offering Card */}
              <TitheOfferingCard
                type="offering"
                title="Offerings"
                subtitle="Give cheerfully as the Lord leads"
                verse="God loves a cheerful giver"
                reference="2 Corinthians 9:7"
                color="purple"
                icon="gift"
              />
            </div>
          </div>
        </section>

      {/* Active Campaigns */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Active Campaigns
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              Choose a campaign to support
            </p>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={64} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No Active Campaigns
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Check back soon for new fundraising campaigns
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {campaigns.map(campaign => {
                const progress = calculateCampaignProgress(campaign.currentAmount, campaign.goalAmount);
                
                return (
                  <div key={campaign._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                    {campaign.imageUrl && (
                      <div className="h-40 sm:h-48 overflow-hidden">
                        <img 
                          src={campaign.imageUrl} 
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl sm:text-2xl">{getCampaignTypeIcon(campaign.campaignType)}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
                          {campaign.campaignType}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {campaign.title}
                      </h3>

                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                        {campaign.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            {formatCurrency(campaign.currentAmount)} raised
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {progress}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleContribute(campaign)}
                          className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <Smartphone size={16} />
                          Contribute Now
                        </button>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePaymentDetails(campaign._id)}
                            className="flex-1 px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-xs sm:text-sm"
                          >
                            Payment Info
                          </button>
                          <Link
                            href={`/campaigns/${campaign._id}`}
                            className="flex-1 px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-xs sm:text-sm text-center"
                          >
                            Details
                          </Link>
                        </div>
                      </div>

                      {/* Payment Details - Expandable */}
                      {showPaymentDetails[campaign._id] && (
                        <PaymentDetailsCard campaign={campaign} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Why Give Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <span className="text-[#8B1A1A] font-bold tracking-wider uppercase text-sm">Why We Give</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-6">
                        More Than Just a Donation. <br /> It&apos;s a Transformation.
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
                        When you partner with House of Transformation, you aren't just sending money. You are sending hope, education, and spiritual nourishment to the heart of Busia County.
                    </p>
                    
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-[#8B1A1A]">
                                <Users size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Direct Community Impact</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Supporting families directly with food, shelter, and care.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                <Target size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Mission Advancement</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Expanding our reach to spread the Gospel effectively.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="relative">
                    <div className="absolute -inset-4 bg-[#8B1A1A]/5 rounded-[2rem] transform rotate-3"></div>
                    <div className="relative bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] p-8 sm:p-12 border border-slate-200 dark:border-slate-700 text-center">
                        <div className="inline-block p-4 rounded-full bg-white dark:bg-slate-900 shadow-xl mb-6">
                            <Heart className="text-[#8B1A1A] fill-[#8B1A1A]" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">God loves a cheerful giver</h3>
                        <p className="text-slate-600 dark:text-slate-400 italic mb-8">
                            &quot;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion.&quot;
                            <br/><span className="font-semibold not-italic text-slate-900 dark:text-slate-300 mt-2 block">- 2 Corinthians 9:7</span>
                        </p>
                        <Link 
                            href="#campaigns" 
                            className="inline-block w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Make a Pledge Today
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-[#8B1A1A] to-red-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg sm:text-xl text-red-100 mb-8">
            Join us in transforming lives through your generous support
          </p>
          {user ? (
            <Link 
              href="/portal/donations"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#8B1A1A] font-bold rounded-xl hover:bg-red-50 transition-all shadow-lg text-sm sm:text-base"
            >
              Go to Portal
              <ArrowRight size={20} />
            </Link>
          ) : (
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#8B1A1A] font-bold rounded-xl hover:bg-red-50 transition-all shadow-lg text-sm sm:text-base"
            >
              Create Account
              <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </section>

      {/* Quick Contribute Modal */}
      {selectedCampaign && (
        <QuickContributeModal
          campaign={selectedCampaign}
          isOpen={showContributeModal}
          onClose={() => {
            setShowContributeModal(false);
            setSelectedCampaign(null);
          }}
          onSuccess={() => {
            loadCampaigns();
          }}
        />
      )}
    </div>
  );
}