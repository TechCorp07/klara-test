// src/middleware.ts 
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
  // Static files and API routes
  '/_next', '/favicon.ico', '/api', '/assets', '/images', '/fonts',
  // Add these specific problematic routes
  '/.well-known',
  '/auth/logout',
];

const ROLE_ROUTES: Record<UserRole, string[]> = {
  patient: ['/patient', '/profile', '/settings', '/messages', 
    '/health-records', '/appointments', '/settings/password',
     '/telemedicine', '/research', '/clinical-trials', '/medications'],
  provider: ['/provider', '/profile', '/settings', '/settings/password',
     '/messages', '/clinical-trials', '/patients',
      '/health-records', '/appointments', '/telemedicine', '/provider/emergency-access', 
      '/medications'],
  admin: ['/admin', '/profile', '/settings', '/settings/password',
     '/messages', '/users', '/reports',
    '/approvals', '/users', '/audit-logs', '/system-settings', '/monitoring'],
  pharmco: ['/pharmco', '/profile', '/settings', '/settings/password',
     '/messages', '/medications', '/clinical-trials', '/reports',
     '/research'],
  caregiver: ['/caregiver', '/profile', '/settings', '/settings/password',
    '/messages', '/health-records', '/appointments', '/patients'],
  researcher: ['/researcher', '/profile', '/settings', '/settings/password',
    '/messages', '/research', '/clinical-trials', '/studies', '/data-analysis'],
  superadmin: ['/admin', '/patient', '/provider', '/pharmco', '/caregiver', '/researcher', '/compliance'],
  compliance: ['/compliance', '/profile', '/settings', '/settings/password',
    '/messages', '/audit-logs', '/emergency-access', '/consent-management', '/compliance/emergency-access',
    '/reports'],
};

// 🔧 IMPROVED: Better redirect loop detection
function hasRedirectLoop(returnUrl: string): boolean {
  try {
    // Decode the URL to check for loops
    let decodedUrl = returnUrl;
    try {
      // Try to decode multiple times to catch nested encoding
      for (let i = 0; i < 10; i++) {
        const newDecoded = decodeURIComponent(decodedUrl);
        if (newDecoded === decodedUrl) break; // No more decoding possible
        decodedUrl = newDecoded;
      }
    } catch {
      // If decoding fails, assume it's a problematic URL
      return true;
    }

    // Check for obvious login loops
    if (decodedUrl.includes('/login') && decodedUrl.includes('returnUrl')) {
      return true;
    }
    
    // Count returnUrl occurrences in the decoded string
    const returnUrlMatches = (decodedUrl.match(/returnUrl/g) || []).length;
    if (returnUrlMatches > 1) {
      console.log('🔄 Multiple returnUrl detected:', returnUrlMatches);
      return true;
    }
    
    // Check URL length (very long URLs indicate problems)
    if (returnUrl.length > 200) {
      console.log('🔄 URL too long:', returnUrl.length);
      return true;
    }
    
    // Check for excessive encoding levels
    const encodingLevels = (returnUrl.match(/%25/g) || []).length;
    if (encodingLevels > 3) {
      console.log('🔄 Too many encoding levels:', encodingLevels);
      return true;
    }
    
    // Check for specific problematic patterns
    const problematicPatterns = [
      '/auth/logout',
      '/.well-known',
      'com.chrome.devtools'
    ];
    
    if (problematicPatterns.some(pattern => decodedUrl.includes(pattern))) {
      console.log('🔄 Problematic pattern detected in returnUrl');
      return true;
    }
    
    return false;
  } catch (error) {
    console.log('🔄 Error checking redirect loop, assuming loop exists');
    return true;
  }
}

// 🔒 SECURE: Helper function to validate auth token by calling API
async function validateAuthToken(token: string): Promise<{
  isValid: boolean;
  user?: {
    id: number;
    role: UserRole;
    email_verified: boolean;
    is_approved: boolean;
  };
}> {
  try {
    const apiUrl = `${appConfig.apiBaseUrl}/users/auth/me/`;
    console.log('🔒 Validating token with:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return {
        isValid: true,
        user: {
          id: userData.id,
          role: userData.role,
          email_verified: userData.email_verified,
          is_approved: userData.is_approved !== false,
        }
      };
    } else {
      console.log('🔒 Token validation failed:', response.status);
      return { isValid: false };
    }
  } catch (error) {
    console.error('🔒 Token validation error:', error);
    return { isValid: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const returnUrl = searchParams.get('returnUrl');

  console.log('🔍 Middleware processing:', { pathname, returnUrl });
  
  // 🔧 CRITICAL: Check for redirect loops FIRST
  if (returnUrl && hasRedirectLoop(returnUrl)) {
    console.log('🔄 Redirect loop detected, breaking the loop');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (isPublicRoute) {
    console.log('✅ Public route, allowing access');
    return NextResponse.next();
  }

  // 🔒 SECURE: Get HttpOnly authentication token (server-side can read it)
  const token = request.cookies.get(appConfig.authCookieName)?.value;

  console.log('🍪 Auth token present:', !!token);

  // Handle unauthenticated users
  if (!token) {
    console.log('❌ No token found, redirecting to login');

    const loginUrl = new URL('/login', request.url);
    
  // Only add returnUrl if it's a reasonable path
  if (pathname.length < 50 && 
    !pathname.includes('/.well-known') && 
    !pathname.includes('/auth/logout') &&
    !pathname.includes('/api/') &&
    pathname !== '/dashboard') {
  loginUrl.searchParams.set('returnUrl', pathname);
  }

    return NextResponse.redirect(loginUrl);
  }

  // 🔒 SECURE: Validate token and get user data
  const authResult = await validateAuthToken(token);
  
  if (!authResult.isValid || !authResult.user) {
    console.log('❌ Invalid token, clearing cookie and redirecting to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(appConfig.authCookieName);
    return response;
  }

  const { user } = authResult;

  // Handle account approval status
  if (!user.is_approved) {
    console.log('⏳ Account not approved, redirecting to approval pending');
    return NextResponse.redirect(new URL('/approval-pending', request.url));
  }
  
  // Handle email verification
  if (!user.email_verified) {
    console.log('📧 Email not verified, redirecting to verification');
    return NextResponse.redirect(new URL('/verify-email', request.url));
  }

  // Handle /dashboard redirect to role-specific page
  if (pathname === '/dashboard') {
    const roleDashboard = `/${user.role}`;
    console.log(`🎯 Redirecting from /dashboard to ${roleDashboard} for role: ${user.role}`);
    return NextResponse.redirect(new URL(roleDashboard, request.url));
  }

  // Handle role-based route access (skip for superadmin)
  if (user.role !== 'superadmin') {
    const allowed = ROLE_ROUTES[user.role]?.some(allowedRoute =>
      pathname === allowedRoute || pathname.startsWith(allowedRoute + '/')
    );
    
    if (!allowed) {
      console.log(`❌ Access denied to ${pathname} for role ${user.role}`);
      console.log(`✅ Allowed routes for ${user.role}:`, ROLE_ROUTES[user.role]);
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
    '/((?!_next/static|_next/image|favicon.ico|api/auth|images|assets).*)',
  ],
};
