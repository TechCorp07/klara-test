import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import api from '@/lib/api';

export async function GET(request) {
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
