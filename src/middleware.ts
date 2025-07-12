// src/middleware.ts - OPTIMIZED FOR DJANGO REST FRAMEWORK TOKEN AUTH
import { NextRequest, NextResponse } from 'next/server';
import { config as appConfig } from './lib/config';
import { UserRole } from './types/auth.types';
import { apiClient } from './lib/api/client';

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

// Optimized cache for token validation
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
}>();

const CACHE_TTL = 30000; // 30 seconds

/**
 * Validates authentication token using Django REST Framework Token format
 * Based on debugging results, we know Django expects: Authorization: Token <token>
 */
async function validateAuthToken(token: string): Promise<{
  isValid: boolean;
  user?: {
    id: number;
    role: UserRole;
    email_verified: boolean;
    is_approved: boolean;
  };
}> {
  // Check cache first for performance
  const cached = tokenValidationCache.get(token);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  try {
    const apiUrl = `${appConfig.apiBaseUrl}/users/auth/me/`;
    
    // Use the Django REST Framework Token format that we confirmed works
    const response = await apiClient(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,  // ✅ Confirmed working format
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.status >= 200 && response.status < 300) {
      const userData = response.data;
      const result = {
        isValid: true,
        user: {
          id: userData.id,
          role: userData.role,
          email_verified: userData.email_verified,
          is_approved: userData.is_approved !== false,
        }
      };
      
      // Cache successful validation for performance
      tokenValidationCache.set(token, { result, timestamp: Date.now() });
      return result;
    } else {
      // Log authentication failures for monitoring (without exposing tokens)
      console.log('🔒 Token validation failed:', {
        status: response.status,
        statusText: response.statusText,
        tokenLength: token.length
      });
      
      const result = { isValid: false };
      // Cache failures for shorter time to allow retry on temporary issues
      tokenValidationCache.set(token, { result, timestamp: Date.now() - CACHE_TTL + 5000 });
      return result;
    }
  } catch (error) {
    console.error('🔒 Token validation error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      tokenExists: !!token
    });
    return { isValid: false };
  }
}

/**
 * Detects redirect loops in returnUrl parameters
 */
function hasRedirectLoop(returnUrl: string): boolean {
  try {
    // Decode URL to check for nested redirects
    let decodedUrl = returnUrl;
    try {
      for (let i = 0; i < 10; i++) {
        const newDecoded = decodeURIComponent(decodedUrl);
        if (newDecoded === decodedUrl) break;
        decodedUrl = newDecoded;
      }
    } catch {
      return true; // If decoding fails, assume problematic URL
    }

    // Check for obvious login loops
    if (decodedUrl.includes('/login') && decodedUrl.includes('returnUrl')) {
      return true;
    }

    // Check for specific problematic patterns
    const suspiciousPatterns = [
      'returnUrl=%2Flogin',
      'returnUrl=/login', 
      'returnUrl%3D%2Flogin',
      '/login?returnUrl=/login'
    ];

    return suspiciousPatterns.some(pattern => decodedUrl.includes(pattern));
  } catch {
    return true; // If any error in processing, assume loop
  }
}

/**
 * Main middleware function for authentication and authorization
 */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const returnUrl = searchParams.get('returnUrl');

  // Skip middleware for excluded paths (static assets, etc.)
  const isExcludedPath = EXCLUDED_PATHS.some(excluded => 
    pathname === excluded || pathname.startsWith(excluded + '/')
  );
  
  if (isExcludedPath) {
    return NextResponse.next();
  }

  // Prevent redirect loops
  if (returnUrl && hasRedirectLoop(returnUrl)) {
    console.log('🔄 Redirect loop detected, breaking the loop');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow access to public routes without authentication
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Extract authentication token from HttpOnly cookie
  const token = request.cookies.get(appConfig.authCookieName)?.value;

  if (!token) {
    console.log('❌ No authentication token found, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    
    // Add return URL for non-root paths
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

  // Validate the authentication token
  const authResult = await validateAuthToken(token);
  
  if (!authResult.isValid || !authResult.user) {
    console.log('❌ Invalid token, clearing cookie and redirecting to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(appConfig.authCookieName);
    return response;
  }

  const { user } = authResult;

  // Check account approval status
  if (!user.is_approved) {
    if (pathname !== '/approval-pending') {
      console.log('⏳ Account not approved, redirecting to approval pending');
      return NextResponse.redirect(new URL('/approval-pending', request.url));
    }
    return NextResponse.next();
  }
  
  // Check email verification status
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

  // Set security headers for HIPAA compliance
  const response = NextResponse.next();
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.klararety.com; " +
      "frame-ancestors 'none';"
    );
  } else {
    response.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "connect-src 'self' http://localhost:* ws://localhost:* https://api.klararety.com; " +
      "frame-ancestors 'none';"
    );
  }
  
  // Additional security headers for HIPAA compliance
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|images|assets|robots.txt|sitemap.xml|manifest.json|\\.well-known).*)',
  ],
};