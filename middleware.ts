import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/aiwriter')) {
    const targetUrl = new URL(request.url);
    targetUrl.hostname = 'ai-proposal-intelligence.vercel.app';
    targetUrl.port = '';
    targetUrl.protocol = 'https:';

    const headers = new Headers(request.headers);
    headers.set('host', 'ai-proposal-intelligence.vercel.app');
    headers.delete('x-forwarded-host');

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  }
}

export const config = { matcher: ['/aiwriter', '/aiwriter/:path*'] };
