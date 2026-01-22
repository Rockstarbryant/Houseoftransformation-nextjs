'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDateShort, getCampaignTypeIcon, calculateCampaignProgress } from '@/utils/donationHelpers';
import { ArrowLeft, Heart, Calendar, Target, TrendingUp, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CampaignDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const campaignId = params.id;

  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handlePledge = () => {
    if (!user) {
      router.push('/login?redirect=/donate');
      return;
    }
    
    router.push(`/portal/donations?campaign=${campaignId}`);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Campaign Image */}
            {campaign.imageUrl && (
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={campaign.imageUrl} 
                  alt={campaign.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Campaign Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{getCampaignTypeIcon(campaign.campaignType)}</span>
                <span className="px-4 py-2 bg-[#8B1A1A] text-white text-sm font-bold rounded-full uppercase">
                  {campaign.campaignType}
                </span>
                {campaign.isFeatured && (
                  <span className="px-4 py-2 bg-yellow-500 text-white text-sm font-bold rounded-full uppercase">
                    ⭐ Featured
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
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

            {/* Impact Statement */}
            {campaign.impactStatement && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  💡 Impact
                </h3>
                <p className="text-blue-800 dark:text-blue-200">
                  {campaign.impactStatement}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                About This Campaign
              </h2>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {campaign.description}
              </p>
            </div>

            {/* Milestones */}
            {campaign.milestones && campaign.milestones.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
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
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatCurrency(milestone.amount)}
                          </span>
                          {milestone.achieved && milestone.achievedDate && (
                            <span className="text-sm text-green-600">
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
              
              {/* Progress Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-3xl font-black text-green-600">
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
                  onClick={handlePledge}
                  className="w-full bg-[#8B1A1A] text-white py-4 rounded-xl font-bold hover:bg-red-900 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg"
                >
                  <Heart size={24} />
                  Make a Pledge
                </button>

                {!user && (
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
                    Login required to make a pledge
                  </p>
                )}
              </div>

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
    </div>
  );
}