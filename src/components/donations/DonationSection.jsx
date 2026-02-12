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
    <section className="relative py-16 bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 dark:bg-red-900/10 rounded-full blur-3xl opacity-30 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-3xl opacity-30 -z-10"></div>

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
                      <span className="text-3xl sm:text-4xl">
                        {campaigns[currentSlide]?.campaignType === 'building' && '🏛️'}
                        {campaigns[currentSlide]?.campaignType === 'mission' && '🌍'}
                        {campaigns[currentSlide]?.campaignType === 'event' && '🎉'}
                        {campaigns[currentSlide]?.campaignType === 'equipment' && '🎸'}
                        {campaigns[currentSlide]?.campaignType === 'benevolence' && '❤️'}
                        {campaigns[currentSlide]?.campaignType === 'offering' && '🙏'}
                      </span>
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

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4 mb-4 line-clamp-2">
                      {campaigns[currentSlide]?.description}
                    </p>

                    {campaigns[currentSlide]?.impactStatement && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                        <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm font-semibold">
                          💡 {campaigns[currentSlide]?.impactStatement}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Raised</span>
                        <span className="font-bold text-green-600">{formatCurrency(campaigns[currentSlide]?.currentAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Goal</span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(campaigns[currentSlide]?.goalAmount || 0)}</span>
                      </div>
                      
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                          style={{ width: `${Math.min(getProgressPercent(campaigns[currentSlide]?.currentAmount || 0, campaigns[currentSlide]?.goalAmount || 0), 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-center text-sm font-bold text-slate-900 dark:text-white">
                        {getProgressPercent(campaigns[currentSlide]?.currentAmount || 0, campaigns[currentSlide]?.goalAmount || 0)}% Complete
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

          {/* Right: Tithe & Offerings */}
          <div className="space-y-6">
            
            {/* Tithe Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Church size={32} />
                  <div>
                    <h3 className="text-2xl font-black">Tithe</h3>
                    <p className="text-blue-100 text-sm">Honor God with your first fruits</p>
                  </div>
                </div>

                <p className="text-blue-50 text-sm mb-4 leading-relaxed">
                  &quot;Bring the whole tithe into the storehouse...&quot; - Malachi 3:10
                </p>

                <button
                  onClick={() => setShowTithePayment(!showTithePayment)}
                  className="w-full bg-white text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
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
                                <p className="text-xs text-blue-100">{detail.label}</p>
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

            {/* Offerings Card */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Gift size={32} />
                  <div>
                    <h3 className="text-2xl font-black">Offerings</h3>
                    <p className="text-purple-100 text-sm">Give cheerfully as the Lord leads</p>
                  </div>
                </div>

                <p className="text-purple-50 text-sm mb-4 leading-relaxed">
                  &quot;God loves a cheerful giver&quot; - 2 Corinthians 9:7
                </p>

                <button
                  onClick={() => setShowOfferingPayment(!showOfferingPayment)}
                  className="w-full bg-white text-purple-700 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
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
                                <p className="text-xs text-purple-100">{detail.label}</p>
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