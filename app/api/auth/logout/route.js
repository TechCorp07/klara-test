// /api/auth/logout.js
import { NextResponse } from 'next/server';
import authAPI from '@/api/auth';
import { cookies } from 'next/headers';

/**
 * API route handler for user logout
 * 
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - The response object
 */
export async function POST(request) {
  try {
    // Call the auth API to logout
    await authAPI.logout();
    
    // Clear auth cookies
    const cookieStore = cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    
    // Clear cookies even if API call fails
    const cookieStore = cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    
    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
  }
}
