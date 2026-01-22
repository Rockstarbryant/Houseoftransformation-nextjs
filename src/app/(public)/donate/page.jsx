'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, getCampaignTypeIcon, calculateCampaignProgress } from '@/utils/donationHelpers';
import { Heart, TrendingUp, Calendar, Target, Users, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function DonatePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [campaigns, setCampaigns] = useState([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

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

  const handlePledge = (campaign) => {
    if (!user) {
      router.push('/login?redirect=/donate');
      return;
    }
    
    router.push(`/portal/donations?campaign=${campaign._id}`);
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
      <section className="relative py-20 bg-gradient-to-br from-[#8B1A1A] to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="mx-auto mb-6" size={64} />
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Support Our Mission
          </h1>
          <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-3xl mx-auto">
            Your generous giving helps us spread God's love and support our community programs in Mombasa and beyond.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#campaigns" className="px-8 py-4 bg-white text-[#8B1A1A] font-bold rounded-xl hover:bg-red-50 transition-all shadow-lg">
              View Campaigns
            </Link>
            {user ? (
              <Link href="/portal/donations" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                My Pledges
              </Link>
            ) : (
              <Link href="/login" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                Login to Pledge
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      {featuredCampaigns.length > 0 && (
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
                Featured Campaigns
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Join us in making a difference in our community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCampaigns.map(campaign => {
                const progress = calculateCampaignProgress(campaign.currentAmount, campaign.goalAmount);
                
                return (
                  <div key={campaign._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border-2 border-[#8B1A1A] transform hover:scale-105 transition-all">
                    {campaign.imageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={campaign.imageUrl} 
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-3xl">{getCampaignTypeIcon(campaign.campaignType)}</span>
                        <span className="px-3 py-1 bg-[#8B1A1A] text-white text-xs font-bold rounded-full uppercase">
                          Featured
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        {campaign.title}
                      </h3>

                      <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {campaign.description}
                      </p>

                      {campaign.impactStatement && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                          <p className="text-blue-800 dark:text-blue-200 text-sm font-semibold">
                            💡 {campaign.impactStatement}
                          </p>
                        </div>
                      )}

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Raised</span>
                          <span className="font-bold text-green-600">{formatCurrency(campaign.currentAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Goal</span>
                          <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(campaign.goalAmount)}</span>
                        </div>
                        
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-center text-sm font-bold text-slate-900 dark:text-white">
                          {progress}% Complete
                        </p>
                      </div>

                      <button
                        onClick={() => handlePledge(campaign)}
                        className="w-full bg-[#8B1A1A] text-white py-3 rounded-xl font-bold hover:bg-red-900 transition-colors flex items-center justify-center gap-2"
                      >
                        <Heart size={20} />
                        Make a Pledge
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Active Campaigns */}
      <section id="campaigns" className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              Active Campaigns
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Choose a campaign to support
            </p>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={64} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No Active Campaigns
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Check back soon for new fundraising campaigns
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map(campaign => {
                const progress = calculateCampaignProgress(campaign.currentAmount, campaign.goalAmount);
                
                return (
                  <div key={campaign._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                    {campaign.imageUrl && (
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={campaign.imageUrl} 
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{getCampaignTypeIcon(campaign.campaignType)}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
                          {campaign.campaignType}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
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

                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePledge(campaign)}
                          className="flex-1 bg-[#8B1A1A] text-white py-2 rounded-lg font-bold hover:bg-red-900 transition-colors text-sm flex items-center justify-center gap-1"
                        >
                          Pledge
                        </button>
                        <Link
                          href={`/campaigns/${campaign._id}`}
                          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Why Give Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              Why Your Giving Matters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="w-16 h-16 bg-[#8B1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Community Impact
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Your giving directly supports families and individuals in our Mombasa community
              </p>
            </div>

            <div className="text-center p-8 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="w-16 h-16 bg-[#8B1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Mission Advancement
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Every contribution helps us fulfill our mission of transformation
              </p>
            </div>

            <div className="text-center p-8 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="w-16 h-16 bg-[#8B1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Transparent Giving
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Track your pledges and see exactly where your donations are making a difference
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#8B1A1A] to-red-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join us in transforming lives through your generous support
          </p>
          {user ? (
            <Link 
              href="/portal/donations"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#8B1A1A] font-bold rounded-xl hover:bg-red-50 transition-all shadow-lg"
            >
              Go to Portal
              <ArrowRight size={20} />
            </Link>
          ) : (
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#8B1A1A] font-bold rounded-xl hover:bg-red-50 transition-all shadow-lg"
            >
              Create Account
              <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}