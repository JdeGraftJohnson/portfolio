import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/aiwriter')) {
    const url = new URL(request.url);
    url.hostname = 'ai-proposal-intelligence.vercel.app';
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: '/aiwriter/:path*',
};
