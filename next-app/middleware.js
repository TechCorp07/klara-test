// middleware.js
import { NextResponse } from 'next/server';

// Constants
const MAX_IDLE_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
const PUBLIC_PATHS = new Set([
  '/login', 
  '/register', 
  '/forgot-password', 
  '/reset-password',
  '/verify-email',
  '/terms',
  '/privacy'
]);

// Static asset patterns to ignore - compiled once for better performance
const ASSET_PATTERNS = [
  /^\/api\//,          // API routes
  /^\/_(next|vercel)/, // Next.js assets
  /\.(jpe?g|png|gif|ico|svg|webp)$/, // Images
  /\.(js|css|woff2?|ttf|otf)$/,      // Static files
  /^\/favicon\.ico$/   // Favicon
];

/**
 * Check if a path is a static asset
 * @param {string} path - Path to check
 * @returns {boolean}
 */
function isAssetPath(path) {
  return ASSET_PATTERNS.some(pattern => pattern.test(path));
}

/**
 * Check if a path is publicly accessible - using Set for O(1) lookup
 * @param {string} path - Path to check
 * @returns {boolean}
 */
function isPublicPath(path) {
  // Check exact matches first for performance
  if (PUBLIC_PATHS.has(path)) return true;
  
  // Then check path starts with
  return Array.from(PUBLIC_PATHS).some(publicPath => 
    path.startsWith(publicPath) && (path === publicPath || path.charAt(publicPath.length) === '/')
  );
}

// Role-based redirect mapping for O(1) lookup
const ROLE_REDIRECTS = {
  'admin': '/admin-dashboard',
  'superadmin': '/admin-dashboard',
  'provider': '/provider-dashboard',
  'compliance': '/compliance-dashboard',
  'patient': '/patient-dashboard',
  // Default fallback
  'default': '/dashboard'
};

/**
 * Get redirect path based on user role
 * @param {string} role - User role
 * @returns {string} Redirect path
 */
function getRoleBasedPath(role) {
  return ROLE_REDIRECTS[role] || ROLE_REDIRECTS.default;
}

/**
 * Middleware function for route protection and auth checks
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for asset requests
  if (isAssetPath(pathname)) {
    return NextResponse.next();
  }
  
  // Determine if the route is public
  const isPublic = isPublicPath(pathname);
  
  // Get auth tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const isAuth = Boolean(accessToken);
  
  // Handle HIPAA compliance for idle timeout
  const lastActivity = request.cookies.get('last_activity')?.value;
  const now = Date.now();
  const isSessionExpired = lastActivity && (now - parseInt(lastActivity, 10)) > MAX_IDLE_TIME;
  
  // Create base response
  const response = NextResponse.next();
  
  // Update last activity timestamp for authenticated users
  if (isAuth && !isSessionExpired) {
    response.cookies.set('last_activity', now.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_IDLE_TIME / 1000 // Convert to seconds
    });
  }
  
  // Handle public routes
  if (isPublic) {
    // Authenticated user hitting public page → redirect to appropriate dashboard
    if (isAuth) {
      const role = request.cookies.get('user_role')?.value || 'patient';
      const redirectPath = getRoleBasedPath(role);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return response;
  }
  
  // Handle expired session
  if (isAuth && isSessionExpired) {
    const url = new URL('/login', request.url);
    url.searchParams.set('session', 'expired');
    
    // Clear auth cookies
    const response = NextResponse.redirect(url);
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('last_activity');
    return response;
  }
  
  // Protected route, not authenticated → redirect to login with return URL
  if (!isAuth) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', encodeURIComponent(pathname + request.nextUrl.search));
    return NextResponse.redirect(url);
  }
  
  // Role-based access control for specific paths
  if (pathname.startsWith('/admin')) {
    const role = request.cookies.get('user_role')?.value;
    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  // User is authenticated and authorized
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};