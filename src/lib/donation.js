// src/lib/donation.js
// ✅ Server-side data fetching for donations with ISR (Incremental Static Regeneration)
// This file is used ONLY on the server for initial page loads with 10-minute cache

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all campaigns with ISR
 * @param {Object} filters - Optional filters (status, type, isFeatured)
 * @returns {Promise<Object>} Campaign data
 */
export async function getCampaigns(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.isFeatured) params.append('isFeatured', filters.isFeatured);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const url = `${API_BASE_URL}/campaigns${params.toString() ? `?${params.toString()}` : ''}`;

    console.log('[DONATION-LIB] Fetching campaigns from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { 
        revalidate: 600 // ✅ Revalidate every 10 minutes (600 seconds)
      },
      cache: 'force-cache' // Use Next.js cache
    });

    if (!response.ok) {
      console.error('[DONATION-LIB] Failed to fetch campaigns:', response.status, response.statusText);
      return { campaigns: [], success: false, error: response.statusText };
    }

    const data = await response.json();
    console.log('[DONATION-LIB] Successfully fetched campaigns:', data.campaigns?.length || 0);
    return data || { campaigns: [], success: false };
  } catch (error) {
    console.error('[DONATION-LIB] Get campaigns error:', error);
    return { campaigns: [], success: false, error: error.message };
  }
}

/**
 * Fetch featured campaigns with ISR
 * @returns {Promise<Object>} Featured campaign data
 */
export async function getFeaturedCampaigns() {
  try {
    const url = `${API_BASE_URL}/campaigns/featured`;

    console.log('[DONATION-LIB] Fetching featured campaigns from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { 
        revalidate: 600 // ✅ Revalidate every 10 minutes
      },
      cache: 'force-cache'
    });

    if (!response.ok) {
      console.error('[DONATION-LIB] Failed to fetch featured campaigns:', response.statusText);
      return { campaigns: [], success: false, error: response.statusText };
    }

    const data = await response.json();
    console.log('[DONATION-LIB] Successfully fetched featured campaigns:', data.campaigns?.length || 0);
    return data || { campaigns: [], success: false };
  } catch (error) {
    console.error('[DONATION-LIB] Get featured campaigns error:', error);
    return { campaigns: [], success: false, error: error.message };
  }
}

/**
 * Fetch active campaigns with ISR
 * @returns {Promise<Object>} Active campaign data
 */
export async function getActiveCampaigns() {
  try {
    const url = `${API_BASE_URL}/campaigns?status=active`;

    console.log('[DONATION-LIB] Fetching active campaigns from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { 
        revalidate: 600 // ✅ Revalidate every 10 minutes
      },
      cache: 'force-cache'
    });

    if (!response.ok) {
      console.error('[DONATION-LIB] Failed to fetch active campaigns:', response.statusText);
      return { campaigns: [], success: false, error: response.statusText };
    }

    const data = await response.json();
    console.log('[DONATION-LIB] Successfully fetched active campaigns:', data.campaigns?.length || 0);
    return data || { campaigns: [], success: false };
  } catch (error) {
    console.error('[DONATION-LIB] Get active campaigns error:', error);
    return { campaigns: [], success: false, error: error.message };
  }
}

/**
 * Fetch campaign by ID with ISR
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Campaign data
 */
export async function getCampaignById(campaignId) {
  try {
    const url = `${API_BASE_URL}/campaigns/${campaignId}`;

    console.log('[DONATION-LIB] Fetching campaign by ID from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { 
        revalidate: 600 // ✅ Revalidate every 10 minutes
      },
      cache: 'force-cache'
    });

    if (!response.ok) {
      console.error('[DONATION-LIB] Failed to fetch campaign:', response.statusText);
      return { campaign: null, success: false, error: response.statusText };
    }

    const data = await response.json();
    console.log('[DONATION-LIB] Successfully fetched campaign:', campaignId);
    return data || { campaign: null, success: false };
  } catch (error) {
    console.error('[DONATION-LIB] Get campaign by ID error:', error);
    return { campaign: null, success: false, error: error.message };
  }
}

/**
 * Fetch public donation settings with ISR
 * @returns {Promise<Object>} Public donation settings
 */
export async function getPublicDonationSettings() {
  try {
    const url = `${API_BASE_URL}/settings/donations/public`;

    console.log('[DONATION-LIB] Fetching donation settings from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { 
        revalidate: 600 // ✅ Revalidate every 10 minutes
      },
      cache: 'force-cache'
    });

    if (!response.ok) {
      console.error('[DONATION-LIB] Failed to fetch donation settings:', response.statusText);
      return { donations: {}, success: false, error: response.statusText };
    }

    const data = await response.json();
    console.log('[DONATION-LIB] Successfully fetched donation settings');
    return data || { donations: {}, success: false };
  } catch (error) {
    console.error('[DONATION-LIB] Get donation settings error:', error);
    return { donations: {}, success: false, error: error.message };
  }
}

/**
 * Fetch campaign analytics with ISR
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Campaign analytics data
 */
export async function getCampaignAnalytics(campaignId) {
  try {
    const url = `${API_BASE_URL}/campaigns/${campaignId}/analytics`;

    console.log('[DONATION-LIB] Fetching campaign analytics from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { 
        revalidate: 600 // ✅ Revalidate every 10 minutes
      },
      cache: 'force-cache'
    });

    if (!response.ok) {
      console.error('[DONATION-LIB] Failed to fetch campaign analytics:', response.statusText);
      return { analytics: {}, success: false, error: response.statusText };
    }

    const data = await response.json();
    console.log('[DONATION-LIB] Successfully fetched campaign analytics:', campaignId);
    return data || { analytics: {}, success: false };
  } catch (error) {
    console.error('[DONATION-LIB] Get campaign analytics error:', error);
    return { analytics: {}, success: false, error: error.message };
  }
}