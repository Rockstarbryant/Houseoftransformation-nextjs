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


const CARD_IMAGES = {
  // Card 1: Become Like Christ - Hands helping/reaching
  becomeLikeChrist: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=400&fit=crop",
  
  // Card 2: Store Eternal Treasure - Coins/giving/hands with money
  storeEternalTreasure: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop",
  
  // Card 3: Enlarge Your Harvest - Growing plants/seedling/nature
  enlargeYourHarvest: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=400&fit=crop",
  
  // Card 4: Guard Your Heart - Shield/protection/security
  guardYourHeart: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=400&fit=crop",
  
  // Card 5: Create Margin - Balance/peace/breathing space
  createMargin: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=400&fit=crop",
  
  // Card 6: Worship Through Sacrifice - Heart/worship/hands raised
  worshipSacrifice: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=400&h=400&fit=crop"
};

// Alternative high-quality image options (you can swap these in):
const ALTERNATIVE_IMAGES = {
  helping: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=400&fit=crop",
  charity: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=400&fit=crop",
  community: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=400&fit=crop",
  giving: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=400&fit=crop",
  growth: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop",
  hands: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=400&fit=crop",
  heart: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=400&fit=crop",
  volunteer: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=400&fit=crop",
  support: "https://images.unsplash.com/photo-1609252159838-47a74363d6b1?w=400&h=400&fit=crop",
  donation: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=400&fit=crop"
};


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
      <section className="relative min-h-screen flex items-center overflow-hidden">
  {/* Background Image - Clearly Visible */}
  <div 
    className="absolute inset-0 z-0"
    style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&h=1080&fit=crop')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}
  >
    {/* Subtle Overlay - Light to keep image visible */}
    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/50 to-transparent"></div>
  </div>

  {/* Content Container */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
    <div className="max-w-3xl">
      {/* Small Badge */}
      <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/95 rounded-full mb-6 shadow-lg">
        <Heart className="text-[#8B1A1A]" size={18} />
        <span className="text-slate-900 font-bold text-sm">Kingdom Impact</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
        Your Generosity
        <br />
        <span className="text-yellow-400">Changes Everything</span>
      </h1>

      {/* Description */}
      <p className="text-xl sm:text-2xl text-white mb-8 leading-relaxed drop-shadow-lg">
        Join us in making a lasting impact through faithful giving. Every contribution fuels ministry, transforms lives, and advances God&apos;s kingdom.
      </p>

      {/* Scripture */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-10 shadow-2xl border-l-4 border-[#8B1A1A]">
        <p className="text-lg text-slate-700 italic mb-2">
          &quot;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&quot;
        </p>
        <p className="text-[#8B1A1A] font-bold">2 Corinthians 9:7</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Link 
          href="#campaigns"
          className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-[#8B1A1A] text-white font-bold text-lg rounded-xl hover:bg-[#A01F1F] transition-all shadow-2xl hover:shadow-red-900/50 hover:scale-105 transform duration-300"
        >
          <Gift size={24} />
          Give Now
          <ArrowRight size={24} />
        </Link>
        
        <Link 
          href="#why-give"
          className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-white text-slate-900 font-bold text-lg rounded-xl hover:bg-slate-100 transition-all shadow-xl hover:scale-105 transform duration-300"
        >
          <Sparkles size={24} />
          See Impact Stories
        </Link>
      </div>

      {/* Quick Stats */}
      
    </div>
  </div>

  {/* Right Side Feature Cards - Floating */}
  <div className="hidden lg:block absolute right-8 top-1/2 transform -translate-y-1/2 z-10 space-y-4 w-80">
    {/* Card 1 */}
    <div className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-red-900/30 transition-all hover:scale-105 transform duration-300">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
          <TrendingUp size={24} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 mb-2">Multiply Impact</h3>
          <p className="text-sm text-slate-600">Your seed grows into harvest</p>
        </div>
      </div>
    </div>

    {/* Card 2 */}
    <div className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-red-900/30 transition-all hover:scale-105 transform duration-300">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
          <Users size={24} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 mb-2">Build Community</h3>
          <p className="text-sm text-slate-600">Together we go further</p>
        </div>
      </div>
    </div>

    {/* Card 3 */}
    <div className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-red-900/30 transition-all hover:scale-105 transform duration-300">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
          <Sparkles size={24} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 mb-2">Eternal Rewards</h3>
          <p className="text-sm text-slate-600">Store treasures in heaven</p>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* Tithe & Offerings Section */}
        {/* Tithe & Offerings Section */}
        <section id="tithe-offerings" className="py-12 sm:py-8 bg-white dark:bg-slate-900">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            {/* Enhanced Header with Encouragement */}
            <div className="text-center mb-12 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1A1A]/10 dark:bg-[#8B1A1A]/20 rounded-full mb-6">
                <Heart className="text-[#8B1A1A]" size={18} />
                <span className="text-sm font-bold text-[#8B1A1A] tracking-wide">WORSHIP THROUGH GIVING</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">
                Tithes & Offerings
              </h2>
              
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                God gives us the blessing of being able to work, earn, and save. As faithful stewards, 
                we joyfully worship Him through giving back what He has first given to us.
              </p>

              {/* Encouragement Quote Card */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Sparkles className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-3 leading-relaxed">
                      &quot;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&quot;
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                      2 Corinthians 9:7
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Encouragement Text */}
              <div className="mt-8 grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Why Tithe?</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    A tithe (10%) is our way of recognizing that God owns everything. It keeps our hearts 
                    reminded of the God who not only calls us to give, but blesses us in return.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Gift className="text-purple-600 dark:text-purple-400" size={20} />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Why Offer?</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Offerings are gifts beyond the tithe, given as the Lord leads your heart. They represent 
                    our gratitude and desire to advance God&apos;s kingdom through the church.
                  </p>
                </div>
              </div>
            </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-4xl mx-auto">
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
        <section id="campaigns" className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Enhanced Header with Encouragement */}
            <div className="text-center mb-12 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                <Target className="text-green-600 dark:text-green-400" size={18} />
                <span className="text-sm font-bold text-green-700 dark:text-green-400 tracking-wide">
                  KINGDOM IMPACT
                </span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">
                Active Campaigns
              </h2>
              
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Join us in transforming lives through giving. Every campaign represents people, 
                needs, and God&apos;s work in our community.
              </p>

              {/* Encouragement Banner */}
              <div className="bg-gradient-to-r from-[#8B1A1A] to-red-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Heart className="text-white fill-white" size={20} />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">
                      God Gets to You What He Can Get Through You
                    </h3>
                    <p className="text-red-100 leading-relaxed">
                      &quot;You will be enriched in every way so that you can be generous on every occasion, 
                      and through us your generosity will result in thanksgiving to God.&quot; 
                      <span className="font-semibold block mt-2">- 2 Corinthians 9:11</span>
                    </p>
                  </div>
                  </div>
              </div>
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

                      {campaign.imageUrl && (
                      <div className="h-40 sm:h-48 overflow-hidden">
                        <img 
                          src={campaign.imageUrl} 
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-4 mb-4 line-clamp-3">
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

          {/* Inspirational Giving Messages Section */}
          {/* Inspirational Giving Messages Section */}
<section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section Header */}
    <div className="text-center mb-16">
      <span className="text-[#8B1A1A] font-bold tracking-wider uppercase text-sm">
        The Heart of Giving
      </span>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mt-3 mb-6">
        What God Does Through Your Gift
      </h2>
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
        Discover how your generosity becomes a powerful force for Kingdom transformation
      </p>
    </div>

    {/* Message Cards Grid */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
      {/* Card 1 - Become Like Christ */}
      <div 
        className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-96"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=800&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/95 via-purple-800/85 to-purple-600/60 group-hover:from-purple-900/98 group-hover:via-purple-800/90 transition-all duration-300"></div>
        <div className="relative h-full p-8 flex flex-col justify-end text-white">
          <h3 className="text-2xl font-bold mb-4">
            Become Like Christ
          </h3>
          <p className="text-white/90 mb-6 leading-relaxed">
            &quot;It is more blessed to give than to receive.&quot; When we give, we trust Jesus&apos; promise and participate in His nature of generosity.
          </p>
          <div className="pt-4 border-t border-white/30">
            <p className="text-sm font-semibold text-purple-200">
              Acts 20:35
            </p>
          </div>
        </div>
      </div>

      {/* Card 2 - Store Eternal Treasure */}
      <div 
        className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-96"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=800&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/95 via-orange-800/85 to-yellow-600/60 group-hover:from-orange-900/98 group-hover:via-orange-800/90 transition-all duration-300"></div>
        <div className="relative h-full p-8 flex flex-col justify-end text-white">
          <h3 className="text-2xl font-bold mb-4">
            Store Eternal Treasure
          </h3>
          <p className="text-white/90 mb-6 leading-relaxed">
            Be rich in good works, generous and ready to share, storing up treasure as a good foundation for the future—taking hold of that which is truly life.
          </p>
          <div className="pt-4 border-t border-white/30">
            <p className="text-sm font-semibold text-orange-200">
              1 Timothy 6:17-19
            </p>
          </div>
        </div>
      </div>

      {/* Card 3 - Enlarge Your Harvest */}
      <div 
        className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-96"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=800&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/95 via-emerald-800/85 to-green-600/60 group-hover:from-green-900/98 group-hover:via-emerald-800/90 transition-all duration-300"></div>
        <div className="relative h-full p-8 flex flex-col justify-end text-white">
          <h3 className="text-2xl font-bold mb-4">
            Enlarge Your Harvest
          </h3>
          <p className="text-white/90 mb-6 leading-relaxed">
            God supplies seed to the sower and bread for food. He will also increase your store of seed and enlarge the harvest of your righteousness.
          </p>
          <div className="pt-4 border-t border-white/30">
            <p className="text-sm font-semibold text-green-200">
              2 Corinthians 9:10
            </p>
          </div>
        </div>
      </div>

      {/* Card 4 - Guard Your Heart */}
      <div 
        className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-96"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&h=800&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/95 via-indigo-800/85 to-blue-600/60 group-hover:from-blue-900/98 group-hover:via-indigo-800/90 transition-all duration-300"></div>
        <div className="relative h-full p-8 flex flex-col justify-end text-white">
          <h3 className="text-2xl font-bold mb-4">
            Guard Your Heart
          </h3>
          <p className="text-white/90 mb-6 leading-relaxed">
            The righteous give without sparing. Giving keeps our hearts from craving more all day long, protecting us from the idolatry of material possessions.
          </p>
          <div className="pt-4 border-t border-white/30">
            <p className="text-sm font-semibold text-blue-200">
              Proverbs 21:26
            </p>
          </div>
        </div>
      </div>

      {/* Card 5 - Create Margin to Breathe */}
      <div 
        className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-96"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&h=800&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/95 via-cyan-800/85 to-teal-600/60 group-hover:from-teal-900/98 group-hover:via-cyan-800/90 transition-all duration-300"></div>
        <div className="relative h-full p-8 flex flex-col justify-end text-white">
          <h3 className="text-2xl font-bold mb-4">
            Create Margin to Breathe
          </h3>
          <p className="text-white/90 mb-6 leading-relaxed">
            If the willingness is there, the gift is acceptable according to what you have. Create margin in your life for God to work and for you to thrive.
          </p>
          <div className="pt-4 border-t border-white/30">
            <p className="text-sm font-semibold text-teal-200">
              2 Corinthians 8:12
            </p>
          </div>
        </div>
      </div>

      {/* Card 6 - Worship Through Sacrifice */}
      <div 
        className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-96"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=600&h=800&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/95 via-rose-800/85 to-red-600/60 group-hover:from-red-900/98 group-hover:via-rose-800/90 transition-all duration-300"></div>
        <div className="relative h-full p-8 flex flex-col justify-end text-white">
          <h3 className="text-2xl font-bold mb-4">
            Worship God Through Sacrifice
          </h3>
          <p className="text-white/90 mb-6 leading-relaxed">
            Do not neglect to do good and to share what you have, for such sacrifices are pleasing to God. Giving is an act of worship.
          </p>
          <div className="pt-4 border-t border-white/30">
            <p className="text-sm font-semibold text-red-200">
              Hebrews 13:16
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Featured Quote Section */}
    <div className="relative max-w-4xl mx-auto">
      <div className="absolute inset-0 bg-gradient-to-r from-[#8B1A1A] to-red-700 rounded-3xl opacity-5"></div>
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-slate-700">
        <div className="text-6xl text-yellow-400 opacity-20 mb-4">&quot;</div>
        <blockquote className="text-2xl sm:text-3xl font-bold mb-6 leading-relaxed">
          You will be enriched in every way so that you can be generous on every occasion
        </blockquote>
        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
          Every dollar that passes through our hands is a transfer of power. How we use that power shapes us, for better or worse. God turns us into more generous, thankful, joyful people by blessing us with resources so we can give back to the kingdom.
        </p>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-yellow-400 font-bold text-lg">
            2 Corinthians 9:11
          </p>
          <Link 
            href="#campaigns"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Give Now
            <ArrowRight size={18} />
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