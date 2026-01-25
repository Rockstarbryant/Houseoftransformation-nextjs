'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, TrendingUp, Users, Target, ArrowRight, Zap, Loader } from 'lucide-react';

export default function DonationSection() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalRaised: 0,
    activeCampaigns: 0,
    membersGiving: 0,
    impactReach: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredCampaign, setFeaturedCampaign] = useState(null);

  useEffect(() => {
    fetchCampaignData();
  }, []);

  const fetchCampaignData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all active campaigns
      const response = await fetch('/api/campaigns?status=active&visibility=public', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      
      if (data.success && data.campaigns) {
        setCampaigns(data.campaigns);

        // Calculate stats
        const totalRaised = data.campaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
        const activeCampaigns = data.campaigns.filter(c => c.status === 'active').length;

        setStats({
          totalRaised,
          activeCampaigns,
          membersGiving: data.campaigns.reduce((sum, c) => sum + (c.pledges || 0), 0),
          impactReach: 500 // This would come from a separate API if available
        });

        // Set featured campaign (first active one or marked as featured)
        const featured = data.campaigns.find(c => c.isFeatured === true) || data.campaigns[0];
        setFeaturedCampaign(featured);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercent = (raised, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.round((raised / goal) * 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-br from-slate-900 via-[#8B1A1A] to-red-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-full mb-6 backdrop-blur-sm">
                <Zap size={16} className="text-red-300" />
                <span className="text-sm font-semibold text-red-100">Make an Impact Today</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                Support Our <span className="bg-gradient-to-r from-red-200 to-red-400 bg-clip-text text-transparent">Mission</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-red-100 leading-relaxed max-w-2xl">
                Your generous giving transforms lives and strengthens our community. Every contribution brings us closer to our vision of hope and healing.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/donate"
                className="group px-8 py-4 bg-white text-[#8B1A1A] font-bold rounded-xl hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Heart size={20} />
                Start Giving
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/portal/donations"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                View Pledges
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <p className="text-sm text-red-100 font-semibold mb-1">Raised</p>
                <p className="text-2xl font-black text-white">KES {(stats.totalRaised / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <p className="text-sm text-red-100 font-semibold mb-1">Active</p>
                <p className="text-2xl font-black text-white">{stats.activeCampaigns}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <p className="text-sm text-red-100 font-semibold mb-1">Givers</p>
                <p className="text-2xl font-black text-white">{stats.membersGiving}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <p className="text-sm text-red-100 font-semibold mb-1">Impact</p>
                <p className="text-2xl font-black text-white">{stats.impactReach}</p>
              </div>
            </div>
          </div>

          {/* Right: Featured Campaign Card */}
          {!isLoading && featuredCampaign && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl blur-2xl opacity-50"></div>
              
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Card Header */}
                <div className="h-32 bg-gradient-to-br from-[#8B1A1A] to-red-900 p-6 text-white flex items-end">
                  <div>
                    <p className="text-4xl mb-2">🎯</p>
                    <h3 className="text-2xl font-black">{featuredCampaign.title}</h3>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-8 space-y-6">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {featuredCampaign.description?.substring(0, 120)}...
                  </p>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(featuredCampaign.currentAmount)} raised
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {getProgressPercent(featuredCampaign.currentAmount, featuredCampaign.goalAmount)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                        style={{ width: `${Math.min(getProgressPercent(featuredCampaign.currentAmount, featuredCampaign.goalAmount), 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      {formatCurrency(featuredCampaign.goalAmount - featuredCampaign.currentAmount)} to goal
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">GOAL</p>
                      <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                        {formatCurrency(featuredCampaign.goalAmount)}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">RAISED</p>
                      <p className="text-lg font-black text-green-600 dark:text-green-400">
                        {formatCurrency(featuredCampaign.currentAmount)}
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">TYPE</p>
                      <p className="text-lg font-black text-orange-600 dark:text-orange-400 capitalize">
                        {featuredCampaign.campaignType}
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/campaigns/${featuredCampaign._id}`}
                    className="w-full bg-gradient-to-r from-[#8B1A1A] to-red-700 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Heart size={20} />
                    View Campaign
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center h-96">
              <Loader className="animate-spin text-white" size={40} />
            </div>
          )}
        </div>

        {/* Featured Campaigns Grid */}
        {!isLoading && campaigns.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-white mb-4">Active Campaigns</h2>
              <p className="text-xl text-red-100">Choose a campaign to support our mission</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {campaigns.slice(0, 3).map((campaign) => {
                const progress = getProgressPercent(campaign.currentAmount, campaign.goalAmount);
                
                return (
                  <Link
                    key={campaign._id}
                    href={`/campaigns/${campaign._id}`}
                    className="group bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105"
                  >
                    {/* Header */}
                    <div className="h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                      <span className="text-5xl">🎯</span>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#8B1A1A] transition-colors">
                          {campaign.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                          {campaign.description}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600 dark:text-slate-400">
                            {formatCurrency(campaign.currentAmount)}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-green-600"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* CTA */}
                      <button className="w-full mt-4 px-4 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors text-center">
                        Support Campaign
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>

            {campaigns.length > 3 && (
              <div className="text-center mt-12">
                <Link
                  href="/donate"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#8B1A1A] font-bold rounded-xl hover:bg-red-50 transition-all duration-300"
                >
                  View All Campaigns
                  <ArrowRight size={20} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Why Give Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-white">
            <div className="w-12 h-12 bg-red-400/20 rounded-lg flex items-center justify-center mb-4">
              <Users size={24} className="text-red-200" />
            </div>
            <h3 className="text-xl font-bold mb-2">Community Impact</h3>
            <p className="text-red-100">Your giving directly supports families and strengthens communities across Mombasa.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-white">
            <div className="w-12 h-12 bg-red-400/20 rounded-lg flex items-center justify-center mb-4">
              <Target size={24} className="text-red-200" />
            </div>
            <h3 className="text-xl font-bold mb-2">Transparent Giving</h3>
            <p className="text-red-100">Track your pledges and see exactly where your donations make a difference.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-white">
            <div className="w-12 h-12 bg-red-400/20 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp size={24} className="text-red-200" />
            </div>
            <h3 className="text-xl font-bold mb-2">Mission Advancement</h3>
            <p className="text-red-100">Every contribution brings us closer to transforming lives through God's love.</p>
          </div>
        </div>
      </div>
    </section>
  );
}