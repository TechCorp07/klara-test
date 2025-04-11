// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get current user endpoint - retrieves authenticated user profile
 * @route GET /api/auth/me
 */
export async function GET() {
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
    const response = await fetch(`${API_URL}/users/me/`, {
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