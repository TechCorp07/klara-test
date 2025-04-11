// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Logout endpoint - logs out user and clears tokens
 * @route POST /api/auth/logout
 */
export async function POST() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    // Call backend API if access token exists
    if (accessToken) {
      try {
        await fetch(`${API_URL}/users/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
        });
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API error:', error);
      }
    }
    
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
    
    // Even if there's an error, clear cookies
    const responseObj = NextResponse.json(
      { message: 'Logout completed with errors' },
      { status: 500 }
    );
    
    responseObj.cookies.delete('access_token');
    responseObj.cookies.delete('refresh_token');
    
    return responseObj;
  }
}