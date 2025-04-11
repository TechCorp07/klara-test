// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Routes that anyone can access
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  // Read cookie straight from the Request
  const accessToken = request.cookies.get('access_token')?.value;
  const isAuth = Boolean(accessToken);

  // Handle HIPAA compliance for idle timeout
  const lastActivity = request.cookies.get('last_activity')?.value;
  const now = Date.now();
  const MAX_IDLE_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
  const isSessionExpired = lastActivity && (now - parseInt(lastActivity, 10)) > MAX_IDLE_TIME;

  // Set last activity cookie for authenticated users
  const response = NextResponse.next();
  if (isAuth && !isSessionExpired) {
    response.cookies.set('last_activity', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  if (isPublic) {
    // Authenticated user hitting a public page → send to dashboard
    if (isAuth) return NextResponse.redirect(new URL('/dashboard', request.url));
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
    return response;
  }

  // Protected route, not authenticated → bounce to login
  if (!isAuth) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Everything ok
  return response;
}

export const config = {
  matcher: [
    // Run on everything except API routes, static assets and favicon
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};