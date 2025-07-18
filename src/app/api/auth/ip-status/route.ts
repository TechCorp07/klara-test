import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    const backendUrl = `${config.apiBaseUrl}/security/ip-status/`;
    
    const response = await fetch(backendUrl, {
      headers: {
        'X-Client-IP': clientIP,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json({
      ip: clientIP,
      blocked: data.blocked || false,
      reason: data.reason || null,
      unblock_time: data.unblock_time || null,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check IP status' },
      { status: 500 }
    );
  }
}