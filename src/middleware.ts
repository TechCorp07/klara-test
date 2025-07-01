// src/middleware.ts - FIXED: Direct role-based dashboard routing
import { NextRequest, NextResponse } from 'next/server';
import { config as appConfig } from './lib/config';
import { UserRole } from './types/auth.types';

const PUBLIC_ROUTES = [
  '/login',
  '/register', 
  '/verify-email',
  '/reset-password',
  '/forgot-password',
  '/two-factor',
  '/approval-pending',
  '/unauthorized',
  '/compliance-violation',
  '/terms-of-service',
  '/privacy-policy', 
  '/hipaa-notice',
  '/contact',
  '/about',
  '/help',
  '/support',
  '/faq',
  '/_next', '/favicon.ico', '/api', '/assets', '/images', '/fonts',
];

const ROLE_ROUTES: Record<UserRole, string[]> = {
  patient: ['/dashboard/patient', '/profile', '/settings', '/messages', 
    '/health-records', '/appointments', '/settings/password',
     '/telemedicine', '/research', '/clinical-trials', '/medications'],
  provider: ['/dashboard/provider', '/profile', '/settings', '/settings/password',
     '/messages', '/clinical-trials', '/patients',
      '/health-records', '/appointments', '/telemedicine', 
      '/medications'],
  admin: ['/dashboard/admin', '/profile', '/settings', '/settings/password',
     '/messages', '/users', '/reports', '/admin',
    '/approvals', '/users', '/audit-logs', '/system-settings', '/monitoring'],
  pharmco: ['/dashboard/pharmco', '/profile', '/settings', '/settings/password',
     '/messages', '/medications', '/clinical-trials', '/reports',
     '/research'],
  caregiver: ['/dashboard/caregiver', '/profile', '/settings', '/settings/password',
    '/messages', '/health-records', '/appointments', '/patients'],
  researcher: ['/dashboard/researcher', '/profile', '/settings', '/settings/password',
    '/messages', '/research', '/clinical-trials', '/studies', '/data-analysis'],
  superadmin: ['/dashboard/admin', '/dashboard/patient', '/dashboard/provider', '/dashboard/pharmco', '/dashboard/caregiver', '/dashboard/researcher', '/dashboard/compliance'],
  compliance: ['/dashboard/compliance', '/profile', '/settings', '/settings/password',
    '/messages', '/audit-logs', '/emergency-access', '/consent-management',
    '/reports', '/compliance'],
};

function hasRedirectLoop(returnUrl: string): boolean {
  try {
    if (returnUrl.includes('/login') || 
        returnUrl.includes('%2Flogin') || 
        returnUrl.includes('%252Flogin')) {
      return true;
    }
    
    const returnUrlCount = (returnUrl.match(/returnUrl/g) || []).length;
    if (returnUrlCount > 1) {
      return true;
    }
    
    if (returnUrl.length > 500) {
      return true;
    }
    
    const encodingLevels = returnUrl.split('%25').length - 1;
    if (encodingLevels > 5) {
      return true;
    }
    
    return false;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const returnUrl = searchParams.get('returnUrl');

  console.log('🔍 Middleware processing:', { pathname, returnUrl });

  // Allow public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (isPublicRoute) {
    console.log('✅ Public route, allowing access');
    return NextResponse.next();
  }

  // Check for redirect loops
  if (returnUrl && hasRedirectLoop(returnUrl)) {
    console.log('🔄 Redirect loop detected, going to default dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Get authentication data from cookies
  const token = request.cookies.get(appConfig.authCookieName)?.value;
  const role = request.cookies.get(appConfig.userRoleCookieName)?.value as UserRole | undefined;
  const verified = request.cookies.get(appConfig.emailVerifiedCookieName)?.value === 'true';
  const approved = request.cookies.get(appConfig.isApprovedCookieName)?.value !== 'false';

  console.log('🍪 Cookie data:', { hasToken: !!token, role, verified, approved });

  // Handle unauthenticated users
  if (!token) {
    console.log('❌ No token found, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    
    // Don't use /dashboard as returnUrl since it's not a valid page
    if (!pathname.includes('/login') && 
        pathname.length < 100 && 
        !hasRedirectLoop(pathname) &&
        pathname !== '/dashboard') {
      loginUrl.searchParams.set('returnUrl', pathname);
    }
    
    return NextResponse.redirect(loginUrl);
  }

  // Handle account approval status
  if (!approved) {
    console.log('⏳ Account not approved, redirecting to approval pending');
    return NextResponse.redirect(new URL('/approval-pending', request.url));
  }
  
  // Handle email verification
  if (!verified) {
    console.log('📧 Email not verified, redirecting to verification');
    return NextResponse.redirect(new URL('/verify-email', request.url));
  }

  // Handle invalid or missing role
  if (!role || !(role in ROLE_ROUTES)) {
    console.log('❌ Invalid or missing role, clearing cookies and redirecting to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(appConfig.authCookieName);
    response.cookies.delete(appConfig.userRoleCookieName);
    return response;
  }

  // MAIN FIX: Handle /dashboard root path - redirect to role-specific dashboard
  if (pathname === '/dashboard') {
    const roleDashboard = `/dashboard/${role}`;
    console.log(`🎯 Redirecting from /dashboard to ${roleDashboard} for role: ${role}`);
    return NextResponse.redirect(new URL(roleDashboard, request.url));
  }

  // Handle role-based route access (skip for superadmin)
  if (role !== 'superadmin') {
    const allowed = ROLE_ROUTES[role].some(allowedRoute =>
      pathname === allowedRoute || pathname.startsWith(allowedRoute + '/')
    );
    
    if (!allowed) {
      console.log(`❌ Access denied to ${pathname} for role ${role}`);
      console.log(`✅ Allowed routes for ${role}:`, ROLE_ROUTES[role]);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  console.log('✅ Access granted, proceeding to route');

  // Set security headers
  const res = NextResponse.next();
  
  if (process.env.NODE_ENV === 'production') {
    // Production CSP
    res.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.klararety.com; " +
      "frame-ancestors 'none';"
    );
  } else {
    // Development CSP
    res.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "connect-src 'self' http://localhost:* ws://localhost:* https://api.klararety.com; " +
      "frame-ancestors 'none';"
    );
  }
  
  // Other security headers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HIPAA-specific headers
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};