"use server";

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import api from '@/lib/api';

/**
 * Login handler - authenticates user and sets tokens
 * @route POST /login
 */
export async function login(request) {
  try {
    const { username, password } = await request.json();
    
    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    const { access, refresh, user } = data;
    
    // Set cookies
    const responseObj = NextResponse.json({ 
      success: true, 
      user,
      requires2FA: data.requires_2fa,
      user_id: data.user_id
    });
    
    // If 2FA is required, don't set tokens yet
    if (data.requires_2fa) {
      return responseObj;
    }
    
    // Set HttpOnly cookies
    responseObj.cookies.set('access_token', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });
    
    responseObj.cookies.set('refresh_token', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return responseObj;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 2FA verification handler - verifies 2FA code and sets tokens
 * @route POST /verify-2fa
 */
export async function verify2FA(request) {
  try {
    const { token, code } = await request.json();
    
    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/verify-2fa/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, code }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    const { access, refresh, user } = data;
    
    // Set cookies
    const responseObj = NextResponse.json({ 
      success: true, 
      user 
    });
    
    // Set HttpOnly cookies
    responseObj.cookies.set('access_token', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });
    
    responseObj.cookies.set('refresh_token', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return responseObj;
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Token refresh handler - refreshes access token
 * @route POST /refresh
 */
export async function refreshToken(request) {
  try {
    const { refresh } = await request.json();
    
    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    const { access } = data;
    
    // Set cookies
    const responseObj = NextResponse.json({ 
      success: true
    });
    
    // Set HttpOnly cookie for access token
    responseObj.cookies.set('access_token', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });
    
    return responseObj;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get current user handler - retrieves authenticated user profile
 * @route GET /me
 */
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
    
    if (!response.ok) {
      // If token is invalid, clear cookies
      if (response.status === 401) {
        const responseObj = NextResponse.json(
          { message: 'Authentication expired' },
          { status: 401 }
        );
        
        responseObj.cookies.delete('access_token');
        responseObj.cookies.delete('refresh_token');
        
        return responseObj;
      }
      
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const user = await response.json();
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Logout handler - logs out user and clears tokens
 * @route POST /logout
 */
export async function logout() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
    
    // Create response object
    const responseObj = NextResponse.json({ 
      success: true 
    });
    
    // Clear cookies regardless of API response
    responseObj.cookies.delete('access_token');
    responseObj.cookies.delete('refresh_token');
    
    return responseObj;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, we should clear cookies
    const responseObj = NextResponse.json(
      { message: 'Logout completed with errors' },
      { status: 500 }
    );
    
    responseObj.cookies.delete('access_token');
    responseObj.cookies.delete('refresh_token');
    
    return responseObj;
  }
}

/**
 * Withings OAuth callback handler - processes OAuth redirect and exchanges authorization code
 * @route GET /wearables/withings/callback
 */
export async function handleWithingsCallback(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  // Handle error case
  if (error) {
    return NextResponse.redirect(new URL('/health-devices?error=' + error, request.url));
  }
  
  // Handle missing parameters
  if (!code) {
    return NextResponse.redirect(new URL('/health-devices?error=missing_code', request.url));
  }
  
  try {
    // Get auth token from cookies
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/health-devices', request.url));
    }
    
    // Forward the authorization code to the backend
    await api.post('/wearables/withings/callback/', { code, state }, {
      headers: {
        'Authorization': `Token ${authToken}`
      }
    });
    
    // Redirect back to the health devices page on success
    return NextResponse.redirect(new URL('/health-devices?success=true', request.url));
  } catch (error) {
    console.error('Error in Withings callback:', error);
    
    // Redirect with error
    return NextResponse.redirect(new URL('/health-devices?error=authorization_failed', request.url));
  }
}
