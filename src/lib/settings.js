// src/lib/settings.js
// ✅ Server-side data fetching for settings with ISR
// Used ONLY in Server Components (App Router) — never import from client components.
// Mirrors the pattern of src/lib/donation.js and src/lib/blog.js.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Fetch the public-facing settings from the backend API.
 * Safe to call server-side — no auth token required.
 * Returns churchPaymentMethods, titheCard, offeringCard, and other
 * public fields. Revalidates every 5 minutes (ISR).
 *
 * REQUIRES: backend server.js mounts settingsRoutes WITHOUT mount-level protect:
 *   app.use('/api/settings', require('./routes/settingsRoutes'))
 *   (Each route inside the router handles its own protect/requireAdmin)
 *
 * @returns {{ success: boolean, paymentSettings: object|null, error?: string }}
 */
export async function getPublicPaymentSettings() {
  try {
    const url = `${API_URL}/settings/public`;
    console.log('[lib/settings] Fetching public payment settings from:', url);

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 }, // 5-minute ISR window
      cache: 'force-cache',
    });

    if (!res.ok) {
      console.error('[lib/settings] API error:', res.status, res.statusText);
      return { success: false, paymentSettings: null, error: res.statusText };
    }

    const data = await res.json();

    if (!data.success) {
      console.error('[lib/settings] API returned success:false:', data.message);
      return { success: false, paymentSettings: null, error: data.message };
    }

    const s = data.settings || {};

    console.log('[lib/settings] Successfully fetched public settings');

    return {
      success: true,
      paymentSettings: {
        churchPaymentMethods: s.churchPaymentMethods ?? null,
        titheCard:            s.titheCard            ?? null,
        offeringCard:         s.offeringCard          ?? null,
      },
    };
  } catch (error) {
    console.error('[lib/settings] getPublicPaymentSettings error:', error.message);
    return { success: false, paymentSettings: null, error: error.message };
  }
}

/**
 * Fetch public site settings (name, tagline, social media, features, maintenance).
 * Revalidates every 5 minutes.
 *
 * @returns {{ success: boolean, settings: object|null, error?: string }}
 */
export async function getPublicSiteSettings() {
  try {
    const url = `${API_URL}/settings/public`;
    console.log('[lib/settings] Fetching public site settings from:', url);

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
      cache: 'force-cache',
    });

    if (!res.ok) {
      console.error('[lib/settings] API error:', res.status, res.statusText);
      return { success: false, settings: null, error: res.statusText };
    }

    const data = await res.json();

    if (!data.success) {
      return { success: false, settings: null, error: data.message };
    }

    console.log('[lib/settings] Successfully fetched public site settings');
    return { success: true, settings: data.settings || null };
  } catch (error) {
    console.error('[lib/settings] getPublicSiteSettings error:', error.message);
    return { success: false, settings: null, error: error.message };
  }
}

/**
 * Fetch church info for authenticated members (Connect tab).
 * Requires a valid JWT — call from API routes or server actions where
 * you can forward the token, NOT directly from a public Server Component.
 *
 * @param {string} token - Supabase JWT
 * @returns {{ success: boolean, churchInfo: object|null, error?: string }}
 */
export async function getChurchInfo(token) {
  try {
    if (!token) {
      return { success: false, churchInfo: null, error: 'No token provided' };
    }

    const url = `${API_URL}/settings/church-info`;
    console.log('[lib/settings] Fetching church info from:', url);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store', // Always fresh for authenticated member data
    });

    if (!res.ok) {
      console.error('[lib/settings] Church info API error:', res.status, res.statusText);
      return { success: false, churchInfo: null, error: res.statusText };
    }

    const data = await res.json();

    if (!data.success) {
      return { success: false, churchInfo: null, error: data.message };
    }

    console.log('[lib/settings] Successfully fetched church info');
    return { success: true, churchInfo: data.churchInfo || null };
  } catch (error) {
    console.error('[lib/settings] getChurchInfo error:', error.message);
    return { success: false, churchInfo: null, error: error.message };
  }
}