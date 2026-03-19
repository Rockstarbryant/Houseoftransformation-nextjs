'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { donationApi } from '@/services/api/donationService';
import { 
  Heart, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Smartphone,
  Building2,
  CreditCard,
  Copy,
  Check,
  HandHeart,
  Gift,
  Phone,
  Globe,
} from 'lucide-react';
import { Icon } from '@iconify/react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (mirrors DonatePageClient logic, adapted for dark-card style)
// ─────────────────────────────────────────────────────────────────────────────

const METHOD_ICONS = {
  paybill:         Smartphone,
  till:            CreditCard,
  bank:            Building2,
  pochiLaBiashara: Phone,
  paypal:          Globe,
};

/**
 * Build display-ready payment method list from settings.
 * cardConfig = settings.titheCard | settings.offeringCard
 */
function buildPaymentMethods(pm, cardConfig, type) {
  if (!pm) return [];
  const methods = [];

  const shouldShow = (key) => {
    if (!pm[key]?.enabled) return false;
    const showKey = 'show' + key.charAt(0).toUpperCase() + key.slice(1);
    return cardConfig ? !!cardConfig[showKey] : true;
  };

  const accountRef = (method) => {
    if (type === 'tithe')    return method.titheAccountRef    || 'TITHE';
    if (type === 'offering') return method.offeringAccountRef || 'OFFERING';
    return 'DONATE';
  };

  if (shouldShow('paybill') && pm.paybill?.number) {
    methods.push({
      id:      'paybill',
      Icon:    Smartphone,
      title:   pm.paybill.label || 'M-Pesa Paybill',
      details: [
        { label: 'Paybill Number', value: pm.paybill.number,    field: 'paybill'  },
        { label: 'Account Number', value: accountRef(pm.paybill), field: 'account' },
      ],
    });
  }

  if (shouldShow('till') && pm.till?.number) {
    methods.push({
      id:      'till',
      Icon:    CreditCard,
      title:   pm.till.label || 'M-Pesa Till Number',
      details: [
        { label: 'Till Number', value: pm.till.number, field: 'till' },
      ],
    });
  }

  if (shouldShow('bank') && pm.bank?.accountNumber) {
    const details = [];
    if (pm.bank.bankName)    details.push({ label: 'Bank',           value: pm.bank.bankName,      field: 'bank'        });
    details.push(            { label: 'Account Number', value: pm.bank.accountNumber,  field: 'bankaccount' });
    if (pm.bank.accountName) details.push({ label: 'Account Name',  value: pm.bank.accountName,   field: 'bankname'    });
    methods.push({ id: 'bank', Icon: Building2, title: pm.bank.label || 'Bank Transfer', details });
  }

  if (shouldShow('pochiLaBiashara') && pm.pochiLaBiashara?.number) {
    const details = [{ label: 'Phone Number', value: pm.pochiLaBiashara.number, field: 'pochi' }];
    if (pm.pochiLaBiashara.name) details.push({ label: 'Account Name', value: pm.pochiLaBiashara.name, field: 'pochiname' });
    methods.push({ id: 'pochi', Icon: Phone, title: pm.pochiLaBiashara.label || 'Pochi la Biashara', details });
  }

  if (shouldShow('paypal') && pm.paypal?.email) {
    methods.push({
      id:      'paypal',
      Icon:    Globe,
      title:   pm.paypal.label || 'PayPal',
      details: [{ label: 'PayPal Email', value: pm.paypal.email, field: 'paypal' }],
    });
  }

  return methods;
}

/**
 * Inline payment method list — white-on-dark variant for the red cards.
 * Falls back to a plain message when no methods are configured.
 */
function DarkPaymentMethodsList({ methods, prefix, copiedField, onCopy }) {
  if (!methods || methods.length === 0) {
    return (
      <p className="text-red-100 text-xs italic text-center py-3">
        No payment methods configured yet — contact the church office.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {methods.map((method) => {
        const MethodIcon = method.Icon;
        return (
          <div key={method.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <MethodIcon size={16} className="text-white" />
              <span className="text-sm font-bold text-white">{method.title}</span>
            </div>
            {method.details.map((detail) => {
              const fieldKey = `${prefix}-${method.id}-${detail.field}`;
              return (
                <div
                  key={detail.field}
                  className="flex items-center justify-between bg-white/20 rounded px-2 py-1.5 mb-1"
                >
                  <div>
                    <p className="text-xs text-red-100">{detail.label}</p>
                    <p className="font-mono text-xs font-bold text-white">{detail.value}</p>
                  </div>
                  <button
                    onClick={() => onCopy(detail.value, fieldKey)}
                    className="p-1 hover:bg-white/20 rounded"
                  >
                    {copiedField === fieldKey ? (
                      <Check size={14} className="text-green-300" />
                    ) : (
                      <Copy size={14} className="text-white" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DonationSection() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedField, setCopiedField] = useState(null);
  const [showTithePayment, setShowTithePayment] = useState(false);
  const [showOfferingPayment, setShowOfferingPayment] = useState(false);

  // Dynamic payment settings from backend
  const [churchPaymentMethods, setChurchPaymentMethods] = useState(null);
  const [titheCardConfig, setTitheCardConfig]           = useState(null);
  const [offeringCardConfig, setOfferingCardConfig]     = useState(null);

  useEffect(() => {
    fetchCampaigns();
    fetchPaymentSettings();
  }, []);

  // Auto-slide for campaigns
  useEffect(() => {
    if (campaigns.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % campaigns.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [campaigns.length]);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await donationApi.campaigns.getFeatured();
      if (response.success && response.campaigns) {
        setCampaigns(response.campaigns.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching featured campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings/public`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        setChurchPaymentMethods(s.churchPaymentMethods ?? null);
        setTitheCardConfig(s.titheCard               ?? null);
        setOfferingCardConfig(s.offeringCard          ?? null);
      }
    } catch (err) {
      console.error('[DonationSection] Failed to fetch payment settings:', err.message);
    }
  };

  // Derived payment method lists
  const titheMethods    = buildPaymentMethods(churchPaymentMethods, titheCardConfig,    'tithe');
  const offeringMethods = buildPaymentMethods(churchPaymentMethods, offeringCardConfig, 'offering');

  // Card visibility
  const showTitheCard    = titheCardConfig?.enabled    !== false;
  const showOfferingCard = offeringCardConfig?.enabled !== false;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency', currency: 'KES',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);

  const getProgressPercent = (raised, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min(100, Math.round((raised / goal) * 100));
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % campaigns.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + campaigns.length) % campaigns.length);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getCampaignIcon = (campaignType) => {
    const iconMap = {
      building: 'mdi:bank', mission: 'mdi:earth', event: 'mdi:party-popper',
      equipment: 'mdi:guitar-acoustic', benevolence: 'mdi:heart', offering: 'mdi:hands-pray',
    };
    return iconMap[campaignType] || 'mdi:gift';
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <section className="relative py-16 bg-white dark:bg-slate-950 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 dark:bg-red-950/20 rounded-full blur-3xl opacity-40 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-50 dark:bg-red-950/20 rounded-full blur-3xl opacity-40 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-900 dark:bg-red-900 rounded-full mb-6">
            <Sparkles size={16} className="text-[#8B1A1A]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-100 dark:text-slate-100">
              Give Generously
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Transform Lives Through Giving
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Every seed sown in faith multiplies into blessings. Your generosity fuels our mission to spread God&apos;s love
            and transform communities across Busia and beyond.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

          {/* Left: Campaigns Carousel — UNCHANGED */}
          <div className="lg:col-span-2">
            {!isLoading && campaigns.length > 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="relative">
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
                      <Icon
                        icon={getCampaignIcon(campaigns[currentSlide]?.campaignType)}
                        className="text-[#8B1A1A]"
                        width="36"
                        height="36"
                      />
                      <span className="px-3 py-1 bg-[#8B1A1A] text-white text-xs font-bold rounded-full uppercase">
                        Featured
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
                      {campaigns[currentSlide]?.title}
                    </h3>

                    {campaigns[currentSlide]?.imageUrl && (
                      <div className="h-48 sm:h-64 overflow-hidden">
                        <img
                          src={campaigns[currentSlide].imageUrl}
                          alt={campaigns[currentSlide].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4 mb-4 line-clamp-2">
                      {campaigns[currentSlide]?.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Raised</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(campaigns[currentSlide]?.currentAmount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Goal</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(campaigns[currentSlide]?.goalAmount || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              getProgressPercent(
                                campaigns[currentSlide]?.currentAmount || 0,
                                campaigns[currentSlide]?.goalAmount    || 0,
                              ),
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-center text-sm font-bold text-slate-900 dark:text-white">
                        {getProgressPercent(
                          campaigns[currentSlide]?.currentAmount || 0,
                          campaigns[currentSlide]?.goalAmount    || 0,
                        )}% Complete
                      </p>
                    </div>

                    <Link
                      href={`/campaigns/${campaigns[currentSlide]?._id}`}
                      className="w-full bg-[#8B1A1A] text-white py-3 sm:py-4 rounded-xl font-bold hover:bg-red-900 transition-colors flex items-center justify-center gap-2"
                    >
                      <Heart size={20} />
                      Support Campaign
                    </Link>
                  </div>

                  {/* Navigation Arrows */}
                  {campaigns.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      >
                        <ChevronLeft size={24} className="text-slate-900 dark:text-white" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      >
                        <ChevronRight size={24} className="text-slate-900 dark:text-white" />
                      </button>
                    </>
                  )}

                  {/* Slide Indicators */}
                  {campaigns.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {campaigns.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide
                              ? 'w-8 bg-[#8B1A1A]'
                              : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
                <div className="text-center py-12">
                  <Heart size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    No Active Campaigns
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Check back soon for new opportunities to give
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Tithe & Offerings — DYNAMIC */}
          <div className="space-y-6">

            {/* Tithe Card */}
            {showTitheCard && (
              <div className="bg-[#8B1A1A] rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon icon="mdi:church" width="32" height="32" />
                    <div>
                      <h3 className="text-2xl font-black">Tithe</h3>
                      <p className="text-red-100 text-sm">Honor God with your first fruits</p>
                    </div>
                  </div>

                  <p className="text-red-50 text-sm mb-4 leading-relaxed">
                    &quot;Bring the whole tithe into the storehouse...&quot; — Malachi 3:10
                  </p>

                  <button
                    onClick={() => setShowTithePayment(!showTithePayment)}
                    className="w-full bg-white text-[#8B1A1A] py-3 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <HandHeart size={20} />
                    {showTithePayment ? 'Hide Payment Info' : 'Give Your Tithe'}
                  </button>

                  {showTithePayment && (
                    <div className="mt-4">
                      <DarkPaymentMethodsList
                        methods={titheMethods}
                        prefix="tithe"
                        copiedField={copiedField}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Offerings Card */}
            {showOfferingCard && (
              <div className="bg-[#6B1515] rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon icon="mdi:gift" width="32" height="32" />
                    <div>
                      <h3 className="text-2xl font-black">Offerings</h3>
                      <p className="text-red-100 text-sm">Give cheerfully as the Lord leads</p>
                    </div>
                  </div>

                  <p className="text-red-50 text-sm mb-4 leading-relaxed">
                    &quot;God loves a cheerful giver&quot; — 2 Corinthians 9:7
                  </p>

                  <button
                    onClick={() => setShowOfferingPayment(!showOfferingPayment)}
                    className="w-full bg-white text-[#6B1515] py-3 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Gift size={20} />
                    {showOfferingPayment ? 'Hide Payment Info' : 'Give Your Offering'}
                  </button>

                  {showOfferingPayment && (
                    <div className="mt-4">
                      <DarkPaymentMethodsList
                        methods={offeringMethods}
                        prefix="offering"
                        copiedField={copiedField}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Bottom CTA — UNCHANGED */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center">
                <Heart className="text-[#8B1A1A]" size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-900 dark:text-white">Ready to make a difference?</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Your generosity changes lives</p>
              </div>
            </div>
            <Link
              href="/donate"
              className="px-6 py-3 bg-gradient-to-r from-[#8B1A1A] to-red-700 text-white font-bold rounded-xl hover:shadow-lg transition-all whitespace-nowrap"
            >
              Explore All Ways to Give
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}