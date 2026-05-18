import 'server-only';

export const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? '';
export const clerkSecretKey = process.env.CLERK_SECRET_KEY?.trim() ?? '';

export const isClerkServerConfigured =
  clerkPublishableKey.length > 0 && clerkSecretKey.length > 0;
