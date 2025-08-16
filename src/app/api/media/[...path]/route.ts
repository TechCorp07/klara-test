// src/app/api/media/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const mediaPath = params.path.join('/');
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const mediaUrl = `${backendUrl}/media/${mediaPath}`;

    console.log('🖼️ Proxying media request:', mediaUrl);

    const response = await fetch(mediaUrl);

    if (!response.ok) {
      console.error('❌ Failed to fetch media from backend:', response.status);
      return new NextResponse('Media not found', { status: 404 });
    }

    const mediaData = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(mediaData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('❌ Media proxy error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}