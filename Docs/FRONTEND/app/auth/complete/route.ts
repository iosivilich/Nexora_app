import { NextResponse } from 'next/server';
import { getAuthenticatedContext } from '../../../src/lib/backend-data';

function shouldCompleteOnboarding(context: Awaited<ReturnType<typeof getAuthenticatedContext>>) {
  const userType = context.profile.user_type?.trim().toUpperCase();
  const city = context.profile.city?.trim();

  const hasValidUserType = userType === 'EMPRESA' || userType === 'CONSULTOR';
  return !hasValidUserType || !city;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  let next = url.searchParams.get('next') ?? '/';

  if (!next.startsWith('/')) {
    next = '/';
  }

  try {
    const context = await getAuthenticatedContext();
    const destination = shouldCompleteOnboarding(context) ? '/onboarding' : next;
    return NextResponse.redirect(new URL(destination, url.origin));
  } catch (error) {
    console.error('GET /auth/complete failed', error);
    return NextResponse.redirect(new URL('/login', url.origin));
  }
}
