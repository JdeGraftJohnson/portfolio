import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/aiwriter')) {
    const targetUrl = new URL(request.url);
    targetUrl.hostname = 'ai-proposal-intelligence.vercel.app';
    targetUrl.port = '';
    targetUrl.protocol = 'https:';

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }
}

export const config = { matcher: '/aiwriter/:path*' };
