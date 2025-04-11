// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Login endpoint - authenticates user and sets tokens
 * @route POST /api/auth/login
 */
export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    // Call backend API
    const response = await fetch(`${API_URL}/users/login/`, {
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
