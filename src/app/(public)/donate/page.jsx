'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, getCampaignTypeIcon, calculateCampaignProgress } from '@/utils/donationHelpers';
import { 
  Heart, 
  Target,
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
  Gift,
  Phone,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import ContributionForm from '@/components/donations/ContributionForm';

// --- COMPONENTS ---

// Payment Details Component (LOGIC PRESERVED, UI CLEANED)
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
      color: 'text-[#8B1A1A]',
      bgColor: 'bg-red-50 dark:bg-red-900/10',
      details: [
        { label: 'Paybill Number', value: '247247', field: 'paybill' },
        { label: 'Account Number', value: campaign._id?.slice(-8) || 'CAMPAIGN', field: 'account' }
      ]
    },
    {
      id: 'mpesa-till',
      icon: CreditCard,
      title: 'M-Pesa Till Number',
      color: 'text-[#8B1A1A]',
      bgColor: 'bg-red-50 dark:bg-red-900/10',
      details: [
        { label: 'Till Number', value: '5678901', field: 'till' }
      ]
    },
    {
      id: 'bank',
      icon: Building2,
      title: 'Bank Transfer',
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-50 dark:bg-slate-800',
      details: [
        { label: 'Bank Name', value: 'Kenya Commercial Bank', field: 'bank' },
        { label: 'Account Number', value: '1234567890', field: 'bankaccount' },
        { label: 'Account Name', value: 'House of Transformation', field: 'bankname' }
      ]
    }
  ];

  return (
    <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Banknote className="text-[#8B1A1A]" size={18} />
        <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
          Payment Methods
        </h4>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <div
              key={method.id}
              className={`${method.bgColor} rounded-lg p-4 border border-slate-100 dark:border-slate-700`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={method.color} size={18} />
                <span className={`font-bold text-sm ${method.color === 'text-[#8B1A1A]' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  {method.title}
                </span>
              </div>
              
              <div className="space-y-2">
                {method.details.map((detail) => (
                  <div
                    key={detail.field}
                    className="flex items-center justify-between bg-white dark:bg-slate-900 rounded px-3 py-2 border border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-500 font-semibold">
                        {detail.label}
                      </p>
                      <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {detail.value}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(detail.value, detail.field)}
                      className="ml-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedField === detail.field ? (
                        <Check className="text-green-600" size={14} />
                      ) : (
                        <Copy className="text-slate-400 hover:text-[#8B1A1A]" size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tithe/Offering Card Component (LOGIC STRICTLY PRESERVED, DESIGN MODERNIZED)
// Removed gradients, added clean solid backgrounds with Red accents
function TitheOfferingCard({ type, title, subtitle, verse, reference, icon }) {
  const [showPayment, setShowPayment] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
        { label: 'Bank', value: 'KCB Bank', field: 'bank' },
        { label: 'Account', value: '1234567890', field: 'bankaccount' }
      ]
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border-t-4 border-[#8B1A1A] overflow-hidden transition-transform hover:-translate-y-1 duration-300">
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{subtitle}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full text-[#8B1A1A]">
            <IconComponent size={24} />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6 border-l-2 border-[#8B1A1A]">
          <p className="text-slate-700 dark:text-slate-300 text-sm italic mb-2">
            &quot;{verse}&quot;
          </p>
          <p className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wide">- {reference}</p>
        </div>

        <button
          onClick={() => setShowPayment(!showPayment)}
          className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 border-2 
            ${showPayment 
              ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' 
              : 'bg-[#8B1A1A] text-white border-[#8B1A1A] hover:bg-[#a01f1f] hover:border-[#a01f1f]'
            }`}
        >
          {showPayment ? (
            <>Hide Payment Info <ChevronDown className="rotate-180" size={18} /></>
          ) : (
            <>Give {title} <Heart size={18} className={showPayment ? "" : "fill-white/20"} /></>
          )}
        </button>

        {/* Payment Methods - Logic Preserved */}
        {showPayment && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            {paymentMethods.map((method) => {
              const MethodIcon = method.icon;
              return (
                <div key={method.id} className="border border-slate-100 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MethodIcon size={18} className="text-[#8B1A1A]" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{method.title}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {method.details.map((detail) => (
                      <div
                        key={detail.field}
                        className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded px-3 py-2"
                      >
                        <div className="flex-1">
                          <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">{detail.label}</p>
                          <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">{detail.value}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(detail.value, `${type}-${detail.field}`)}
                          className="ml-2 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                        >
                          {copiedField === `${type}-${detail.field}` ? (
                            <Check className="text-green-600" size={16} />
                          ) : (
                            <Copy className="text-slate-400 hover:text-[#8B1A1A]" size={16} />
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

// Contribution Modal Component (LOGIC PRESERVED)
function QuickContributeModal({ campaign, isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState('details'); 
  const [formData, setFormData] = useState({ amount: '', phone: '', name: '', email: '' });
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
    if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
    if (!cleaned.startsWith('254')) cleaned = '254' + cleaned;
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
      setError('Phone number is required');
      return;
    }
    const formattedPhone = formatPhoneNumber(formData.phone);
    if (!validatePhone(formattedPhone)) {
      setError('Invalid Kenyan phone number');
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
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {step === 'details' && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-[#8B1A1A] rounded-full"></span>
                Quick Give
              </h3>
              <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border border-red-100 dark:border-red-900/20">
                <p className="text-xs text-[#8B1A1A] uppercase font-bold mb-1">Supporting</p>
                <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{campaign.title}</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Amount (KES)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="e.g., 1000"
                  min="10"
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">M-Pesa Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="0712345678"
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#8B1A1A] hover:bg-[#a01f1f] text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? 'Processing...' : 'Pay via M-Pesa'}
              </button>
            </form>
          </>
        )}

        {step === 'processing' && (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A] mx-auto mb-6"></div>
            <h3 className="font-bold text-lg mb-2 dark:text-white">Requesting Payment...</h3>
            <p className="text-slate-500 text-sm">Check your phone for the MPesa prompt.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="font-bold text-xl mb-2 dark:text-white">Prompt Sent!</h3>
            <p className="text-slate-500 mb-6">Enter your MPesa PIN on your phone to complete the transaction.</p>
            <button onClick={handleClose} className="w-full bg-slate-100 dark:bg-slate-800 py-3 rounded-lg font-bold text-slate-900 dark:text-white">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function DonatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
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
      const response = await donationApi.campaigns.getAll({ status: 'active', visibility: 'public' });
      if (response.success) setCampaigns(response.campaigns || []);
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
    setShowPaymentDetails(prev => ({ ...prev, [campaignId]: !prev[campaignId] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-slate-200 border-t-[#8B1A1A] rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium">Loading Giving Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950">
      
      {/* 1. MODERN HERO SECTION (Reduced Text, High Impact) */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 z-10 bg-slate-900/60 mix-blend-multiply"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 scale-105 animate-in fade-in duration-1000"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />

        <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
          
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-lg animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
            Your Generosity <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-300">Changes Lives</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed font-light animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            Every contribution fuels ministry, transforms our community, and advances God&apos;s kingdom.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
            <Link 
              href="#campaigns"
              className="w-full sm:w-auto px-8 py-4 bg-[#8B1A1A] hover:bg-[#a01f1f] text-white font-bold rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
            >
              Support Campaigns <ArrowRight size={20} />
            </Link>
            <Link 
              href="#tithe-offerings"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold rounded-lg transition-all border border-white/30 flex items-center justify-center gap-2"
            >
             Give Tithe & Offering
            </Link>
          </div>
        </div>
      </section>

      {/* 2. IMPACT STRIP (Replaces massive "Why Give" text) */}
      <section className="relative z-30 -mt-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-[#8B1A1A]">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Community</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Supporting families in need.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-l-0 md:border-l border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <Target size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Mission</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Spreading the Gospel.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-l-0 md:border-l border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Sanctuary</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Building God&apos;s house.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TITHE & OFFERINGS (Redesigned: Clean, No Gradients) */}
      <section id="tithe-offerings" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#8B1A1A] font-bold tracking-widest text-xs uppercase mb-2 block">Biblical Stewardship</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">Tithe & Offering</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Giving is an act of worship. It reminds us that God is the owner of everything, and we are His stewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TitheOfferingCard
              type="tithe"
              title="Tithe"
              subtitle="Why Tithe?
              A tithe (10%) is our way of recognizing that God owns everything. It keeps our hearts reminded of the God who not only calls us to give, but blesses us in return."
              verse="Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this, says the Lord Almighty, and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it."
              reference="Malachi 3:10"
              icon="church"
            />
            <TitheOfferingCard
              type="offering"
              title="Offerings"
              subtitle="Offerings are gifts beyond the tithe, given as the Lord leads your heart. They represent our gratitude and desire to advance God's kingdom through the church."
              verse="Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
              reference="2 Corinthians 9:7"
              icon="gift"
            />
          </div>
        </div>
      </section>

      {/* 4. ACTIVE CAMPAIGNS (Brought Forward, Clean Design) */}
      <section id="campaigns" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <span className="text-[#8B1A1A] font-bold tracking-widest text-xs uppercase mb-2 block">Current Needs</span>
              <h2 className="text-3xl justify-center sm:text-4xl font-black text-slate-900 dark:text-white">
                Active Campaigns
              </h2>
            </div>
            
            <div className="flex-1 max-w-sm md:text-left">
                    <h3 className="text-2xl font-bold dark:text-slate-200 mb-2">
                      God Gets to You What He Can Get Through You
                    </h3>
                    <p className="text-red-800  leading-relaxed">
                      &quot;You will be enriched in every way so that you can be generous on every occasion, 
                      and through us your generosity will result in thanksgiving to God.&quot; 
                      <span className="font-semibold block mt-2">- 2 Corinthians 9:11</span>
                    </p>
                  </div>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-24 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Heart size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Active Campaigns</h3>
              <p className="text-slate-500 mt-2">Check back soon for new opportunities to give.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map(campaign => {
                const progress = calculateCampaignProgress(campaign.currentAmount, campaign.goalAmount);
                
                return (
                  <div key={campaign._id} className="group bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-red-900/5 hover:-translate-y-1 transition-all duration-300">
                    
                    {/* Image Area */}
                    <div className="relative h-52 overflow-hidden">
                      {campaign.imageUrl ? (
                        <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                          <Heart className="text-slate-300" size={40} />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-[#8B1A1A] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {campaign.campaignType}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-1">
                        {campaign.title}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                        {campaign.description}
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-900 dark:text-white">{formatCurrency(campaign.currentAmount)}</span>
                          <span className="text-slate-500">of {formatCurrency(campaign.goalAmount)}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#8B1A1A] h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => handleContribute(campaign)}
                          className="w-full bg-[#8B1A1A] hover:bg-[#a01f1f] text-white py-3 rounded-lg font-bold transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Smartphone size={16} />
                          Contribute Now
                        </button>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePaymentDetails(campaign._id)}
                            className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs"
                          >
                            {showPaymentDetails[campaign._id] ? 'Hide Info' : 'Manual Pay'}
                          </button>
                          <Link
                            href={`/campaigns/${campaign._id}`}
                            className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs text-center"
                          >
                            Details
                          </Link>
                        </div>
                      </div>

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

      {/* 5. MINIMALIST CTA (Clean Footer) */}
      <section className="py-16 bg-[#8B1A1A] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Make a Difference Today</h2>
          <p className="text-red-100 mb-8">Join the House of Transformation family in impacting our world.</p>
          <div className="flex justify-center gap-4">
             {user ? (
               <Link href="/portal/donations" className="bg-white text-[#8B1A1A] px-8 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors">
                 Make A Pledge.
               </Link>
             ) : (
               <Link href="/signup" className="bg-white text-[#8B1A1A] px-8 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors">
                 Create Account
               </Link>
             )}
          </div>
        </div>
      </section>

      {/* MODALS */}
      {selectedCampaign && (
        <QuickContributeModal
          campaign={selectedCampaign}
          isOpen={showContributeModal}
          onClose={() => {
            setShowContributeModal(false);
            setSelectedCampaign(null);
          }}
          onSuccess={() => loadCampaigns()}
        />
      )}
    </div>
  );
}