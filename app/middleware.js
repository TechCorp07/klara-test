import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // routes that anyone can hit
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublic    = publicPaths.some((p) => pathname.startsWith(p));

  // read cookie straight from the Request (headers API isn’t available here)
  const accessToken = request.cookies.get('access_token')?.value;
  const isAuth      = Boolean(accessToken);

  if (isPublic) {
    // authenticated user hitting a public page → send to dashboard
    if (isAuth) return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.next();
  }

  // protected route, not authenticated → bounce to login
  if (!isAuth) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // everything ok
  return NextResponse.next();
}

export const config = {
  matcher: [
    // run on everything except API routes, static assets and favicon
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
