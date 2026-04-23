import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = new URL('/auth/complete', url.origin);
  const next = url.searchParams.get('next');

  if (next?.startsWith('/')) {
    redirectUrl.searchParams.set('next', next);
  }

  return NextResponse.redirect(redirectUrl);
}
