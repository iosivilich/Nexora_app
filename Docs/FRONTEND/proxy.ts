import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isClerkServerConfigured } from './src/lib/clerk-server';

const fallbackMiddleware = (_request: NextRequest) => NextResponse.next();

export default isClerkServerConfigured ? clerkMiddleware() : fallbackMiddleware;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api)(.*)',
  ],
};
