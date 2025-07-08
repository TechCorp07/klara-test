// src/middleware.ts 
import { NextRequest, NextResponse } from 'next/server';
import { config as appConfig } from './lib/config';
import { UserRole } from './types/auth.types';

const PUBLIC_ROUTES = [
  '/',
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
  //'/logout',
  '/help',
  '/support',
  '/faq',
];
const EXCLUDED_PATHS = [
  '/_next',
  '/favicon.ico',
  '/api',
  '/assets',
  '/images', 
  '/fonts',
  '/.well-known',
  '/logout',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
];

const ROLE_ROUTES: Record<UserRole, string[]> = {
  patient: ['/patient', '/profile', '/settings', '/messages', '/health-records', '/appointments', '/settings/password', '/telemedicine', '/research', '/clinical-trials', '/medications'],
  provider: ['/provider', '/profile', '/settings', '/settings/password', '/messages', '/clinical-trials', '/patients', '/health-records', '/appointments', '/telemedicine', '/provider/emergency-access', '/medications'],
  admin: ['/admin', '/profile', '/settings', '/settings/password', '/messages', '/users', '/reports', '/approvals', '/audit-logs', '/system-settings', '/monitoring'],
  pharmco: ['/pharmco', '/profile', '/settings', '/settings/password', '/messages', '/medications', '/clinical-trials', '/reports', '/research'],
  caregiver: ['/caregiver', '/profile', '/settings', '/settings/password', '/messages', '/health-records', '/appointments', '/patients'],
  researcher: ['/researcher', '/profile', '/settings', '/settings/password', '/messages', '/research', '/clinical-trials', '/studies', '/data-analysis'],
  superadmin: ['/admin', '/patient', '/provider', '/pharmco', '/caregiver', '/researcher', '/compliance'],
  compliance: ['/compliance', '/profile', '/settings', '/settings/password', '/messages', '/audit-logs', '/emergency-access', '/consent-management', '/compliance/emergency-access', '/reports'],
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
      '/logout',
      '/.well-known',
      'com.chrome.devtools',
      '_next/',
      '/api/',
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

// 🔒 IMPROVED: Add caching and better error handling for token validation
const tokenValidationCache = new Map<string, {
  result: {
    isValid: boolean;
    user?: {
      id: number;
      role: UserRole;
      email_verified: boolean;
      is_approved: boolean;
    };
  }; 
  timestamp: number 
}>
();

const CACHE_TTL = 30000; // 30 seconds

async function validateAuthToken(token: string): Promise<{
  isValid: boolean;
  user?: {
    id: number;
    role: UserRole;
    email_verified: boolean;
    is_approved: boolean;
  };
}> {
  // Check cache first
  const cached = tokenValidationCache.get(token);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  try {
    const apiUrl = `${appConfig.apiBaseUrl}/users/auth/me/`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.ok) {
      const userData = await response.json();
      const result = {
        isValid: true,
        user: {
          id: userData.id,
          role: userData.role,
          email_verified: userData.email_verified,
          is_approved: userData.is_approved !== false,
        }
      };
      
      // Cache the result
      tokenValidationCache.set(token, { result, timestamp: Date.now() });
      return result;
    } else {
      const result = { isValid: false };
      // Don't cache failed validations for as long
      tokenValidationCache.set(token, { result, timestamp: Date.now() - CACHE_TTL + 5000 });
      return result;
    }
  } catch (error) {
    console.error('🔒 Token validation error:', error);
    return { isValid: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const returnUrl = searchParams.get('returnUrl');

  const isExcludedPath = EXCLUDED_PATHS.some(excluded => 
    pathname === excluded || pathname.startsWith(excluded + '/')
  );
  
  if (isExcludedPath) {
    // Don't log for these common excluded paths to reduce noise
    if (!pathname.includes('/.well-known') && !pathname.includes('/_next')) {
      console.log('🚫 Excluded path, skipping middleware:', pathname);
    }
    return NextResponse.next();
  }

  console.log('🔍 Middleware processing:', { pathname, returnUrl });
  
  if (returnUrl && hasRedirectLoop(returnUrl)) {
    console.log('🔄 Redirect loop detected, breaking the loop');
    const response = NextResponse.redirect(new URL('/login', request.url));
    return response;
  }

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
    
    if (pathname !== '/' && 
      pathname !== '/dashboard' && 
      pathname.length < 50 && 
      !pathname.includes('/.well-known') && 
      !pathname.includes('/logout') &&
      !pathname.includes('/api/') &&
      !pathname.includes('/_next')) {
    loginUrl.searchParams.set('returnUrl', pathname);
  }

    return NextResponse.redirect(loginUrl);
  }

  // 🔒 IMPROVED: Add retry logic for token validation
  let authResult: { 
    isValid: boolean; 
    user?: { 
      id: number; 
      role: UserRole; 
      email_verified: boolean; 
      is_approved: boolean; 
    } 
  } = { isValid: false };
  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    authResult = await validateAuthToken(token);
    
    if (authResult.isValid || retryCount >= maxRetries) {
      break;
    }
    
    retryCount++;
    console.log(`🔄 Token validation retry ${retryCount}/${maxRetries}`);
    
    // Wait a bit before retry
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (!authResult.isValid || !authResult.user) {
    console.log('❌ Invalid token, clearing cookie and redirecting to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(appConfig.authCookieName);
    return response;
  }

  const { user } = authResult;

  // Handle account approval status
  if (!user.is_approved) {
    if (pathname !== '/approval-pending') {
      console.log('⏳ Account not approved, redirecting to approval pending');
      return NextResponse.redirect(new URL('/approval-pending', request.url));
    }
    return NextResponse.next();
  }
  
  // Handle email verification
  if (!user.email_verified) {
    if (pathname !== '/verify-email') {
      console.log('📧 Email not verified, redirecting to verification');
      return NextResponse.redirect(new URL('/verify-email', request.url));
    }
    return NextResponse.next();
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
    '/((?!_next/static|_next/image|favicon.ico|api/auth|images|assets|robots.txt|sitemap.xml|manifest.json|\\.well-known).*)',
  ],
};
