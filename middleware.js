// middleware.js - ROOT OF PROJECT (Next.js 13+)
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Skip all public routes
  const publicRoutes = [
    '/auth/login',
    '/auth/signup',
    '/maintenance',
    '/api/',
    '/_next/',
    '/favicon.ico',
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // 2. Get cookies to check user role and token
    const authToken = request.cookies.get('auth_token')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    console.log(`[Middleware] Checking ${pathname}`);
    console.log(`[Middleware] Auth token: ${authToken ? '✅' : '❌'}, Role: ${userRole || 'NOT_SET'}`);

    // 3. If no auth token, let them through (will be caught by protected routes)
    if (!authToken) {
      console.log('[Middleware] No auth token - allowing to proceed');
      return NextResponse.next();
    }

    // 4. Fetch maintenance status
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${baseUrl}/api/settings/public`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.log('[Middleware] Could not fetch settings');
      return NextResponse.next();
    }

    const data = await response.json();
    const { maintenanceMode } = data.settings || {};

    // 5. If maintenance is disabled, allow access
    if (!maintenanceMode?.enabled) {
      console.log('[Middleware] ✅ Maintenance disabled - allowing access');
      return NextResponse.next();
    }

    // 6. MAINTENANCE IS ENABLED
    console.log('[Middleware] ⚠️ MAINTENANCE ACTIVE');

    // 7. Check if admin - admins can access everything
    if (userRole === 'admin') {
      console.log('[Middleware] ✅ Admin user - bypassing maintenance');
      return NextResponse.next();
    }

    // 8. Non-admin during maintenance - REDIRECT to /maintenance
    console.log(`[Middleware] ❌ Non-admin user (${userRole}) - redirecting to /maintenance`);

    if (pathname !== '/maintenance') {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();

  } catch (error) {
    console.log('[Middleware] Error:', error.message);
    // Fail open
    return NextResponse.next();
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};