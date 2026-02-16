'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { donationApi } from '@/services/api/donationService';
import { 
  Heart, 
  ArrowRight, 
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
  Church
} from 'lucide-react';
import { Icon } from '@iconify/react';

export default function DonationSection() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedField, setCopiedField] = useState(null);
  const [showTithePayment, setShowTithePayment] = useState(false);
  const [showOfferingPayment, setShowOfferingPayment] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Auto-slide for campaigns
  useEffect(() => {
    if (campaigns.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % campaigns.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [campaigns.length]);

  const fetchCampaigns = async () => {
  try {
    setIsLoading(true);
    const response = await donationApi.campaigns.getFeatured();
    
    if (response.success && response.campaigns) {
      setCampaigns(response.campaigns.slice(0, 5)); // Show max 5 featured campaigns
    }
  } catch (err) {
    console.error('Error fetching featured campaigns:', err);
  } finally {
    setIsLoading(false);
  }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getProgressPercent = (raised, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min(100, Math.round((raised / goal) * 100));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % campaigns.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + campaigns.length) % campaigns.length);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Get iconify icon based on campaign type
  const getCampaignIcon = (campaignType) => {
    const iconMap = {
      building: 'mdi:bank',
      mission: 'mdi:earth',
      event: 'mdi:party-popper',
      equipment: 'mdi:guitar-acoustic',
      benevolence: 'mdi:heart',
      offering: 'mdi:hands-pray'
    };
    return iconMap[campaignType] || 'mdi:gift';
  };

  // Payment methods for tithe and offerings
  const paymentMethods = [
    {
      id: 'mpesa-paybill',
      icon: Smartphone,
      title: 'M-Pesa Paybill',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      details: [
        { label: 'Paybill Number', value: '4119027', field: 'paybill' },
        { label: 'Account Number', value: 'TITHE', field: 'account' }
      ]
    },
    {
      id: 'mpesa-till',
      icon: CreditCard,
      title: 'M-Pesa Till',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      details: [
        { label: 'Till Number', value: 'Not supported yet', field: 'till' }
      ]
    },
    {
      id: 'bank',
      icon: Building2,
      title: 'Bank Transfer',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      details: [
        { label: 'Bank', value: 'N/A', field: 'bank name' },
        { label: 'Account', value: 'N/A', field: 'bankaccount' }
      ]
    }
  ];

  return (
    <section className="relative py-16 bg-white dark:bg-slate-950 overflow-hidden">
      {/* Decorative Elements - solid colors */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 dark:bg-red-950/20 rounded-full blur-3xl opacity-40 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-50 dark:bg-red-950/20 rounded-full blur-3xl opacity-40 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-950/30 rounded-full mb-4">
            <Sparkles size={16} className="text-[#8B1A1A]" />
            <span className="text-sm font-bold text-[#8B1A1A] dark:text-red-400">Give Generously</span>
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
          
          {/* Left: Campaigns Carousel */}
          <div className="lg:col-span-2">
            {!isLoading && campaigns.length > 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">

                <div className="relative">
                  {/* Campaign Slide */}
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

                    {/* Campaign Image */}
                    {campaigns[currentSlide]?.imageUrl && (
                      <div className="h-48 sm:h-64 overflow-hidden">
                        <img
                          src={campaigns[currentSlide].imageUrl}
                          alt={campaigns[currentSlide].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Progress Bar */}
                    {campaigns[currentSlide]?.goalAmount > 0 && (
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {formatCurrency(campaigns[currentSlide]?.raisedAmount || 0)} raised
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            Goal: {formatCurrency(campaigns[currentSlide]?.goalAmount)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-[#8B1A1A] h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${getProgressPercent(
                                campaigns[currentSlide]?.raisedAmount,
                                campaigns[currentSlide]?.goalAmount
                              )}%`
                            }}
                          />
                        </div>
                        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {getProgressPercent(
                            campaigns[currentSlide]?.raisedAmount,
                            campaigns[currentSlide]?.goalAmount
                          )}% funded
                        </p>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3">
                      {campaigns[currentSlide]?.description}
                    </p>

                    {/* CTA Button */}
                    <Link
                      href={`/donate?campaign=${campaigns[currentSlide]?._id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B1A1A] hover:bg-red-800 text-white font-bold rounded-xl transition-colors"
                    >
                      Support This Campaign
                      <ArrowRight size={18} />
                    </Link>
                  </div>

                  {/* Navigation Arrows */}
                  {campaigns.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 rounded-full flex items-center justify-center shadow-lg transition-colors"
                      >
                        <ChevronLeft size={20} className="text-slate-900 dark:text-white" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 rounded-full flex items-center justify-center shadow-lg transition-colors"
                      >
                        <ChevronRight size={20} className="text-slate-900 dark:text-white" />
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

          {/* Right: Tithe & Offerings */}
          <div className="space-y-6">
            
            {/* Tithe Card - solid red background */}
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
                  &quot;Bring the whole tithe into the storehouse...&quot; - Malachi 3:10
                </p>

                <button
                  onClick={() => setShowTithePayment(!showTithePayment)}
                  className="w-full bg-white text-[#8B1A1A] py-3 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <HandHeart size={20} />
                  {showTithePayment ? 'Hide Payment Info' : 'Give Your Tithe'}
                </button>

                {/* Payment Methods */}
                {showTithePayment && (
                  <div className="mt-4 space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div key={method.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon size={16} className="text-white" />
                            <span className="text-sm font-bold text-white">{method.title}</span>
                          </div>
                          {method.details.map((detail) => (
                            <div key={detail.field} className="flex items-center justify-between bg-white/20 rounded px-2 py-1.5 mb-1">
                              <div>
                                <p className="text-xs text-red-100">{detail.label}</p>
                                <p className="font-mono text-xs font-bold text-white">{detail.value}</p>
                              </div>
                              <button
                                onClick={() => copyToClipboard(detail.value, `tithe-${detail.field}`)}
                                className="p-1 hover:bg-white/20 rounded"
                              >
                                {copiedField === `tithe-${detail.field}` ? (
                                  <Check size={14} className="text-green-300" />
                                ) : (
                                  <Copy size={14} className="text-white" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Offerings Card - darker red background */}
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
                  &quot;God loves a cheerful giver&quot; - 2 Corinthians 9:7
                </p>

                <button
                  onClick={() => setShowOfferingPayment(!showOfferingPayment)}
                  className="w-full bg-white text-[#6B1515] py-3 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Gift size={20} />
                  {showOfferingPayment ? 'Hide Payment Info' : 'Give Your Offering'}
                </button>

                {/* Payment Methods */}
                {showOfferingPayment && (
                  <div className="mt-4 space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div key={method.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon size={16} className="text-white" />
                            <span className="text-sm font-bold text-white">{method.title}</span>
                          </div>
                          {method.details.map((detail) => (
                            <div key={detail.field} className="flex items-center justify-between bg-white/20 rounded px-2 py-1.5 mb-1">
                              <div>
                                <p className="text-xs text-red-100">{detail.label}</p>
                                <p className="font-mono text-xs font-bold text-white">
                                  {detail.label === 'Account Number' ? 'OFFERING' : detail.value}
                                </p>
                              </div>
                              <button
                                onClick={() => copyToClipboard(
                                  detail.label === 'Account Number' ? 'OFFERING' : detail.value, 
                                  `offering-${detail.field}`
                                )}
                                className="p-1 hover:bg-white/20 rounded"
                              >
                                {copiedField === `offering-${detail.field}` ? (
                                  <Check size={14} className="text-green-300" />
                                ) : (
                                  <Copy size={14} className="text-white" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
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
              className="px-6 py-3 bg-[#8B1A1A] hover:bg-red-800 text-white font-bold rounded-xl hover:shadow-lg transition-all whitespace-nowrap"
            >
              Explore All Ways to Give
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}