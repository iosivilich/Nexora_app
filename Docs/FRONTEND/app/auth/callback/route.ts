import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '../../../src/lib/supabase-server';

function normalizeUserType(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return normalized === 'EMPRESA' || normalized === 'CONSULTOR' ? normalized : null;
}

function normalizeText(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  let next = searchParams.get('next') ?? '/';

  if (!next.startsWith('/')) {
    next = '/';
  }

  if (code) {
    const supabase = await createRouteHandlerClient();
    await supabase.auth.exchangeCodeForSession(code);

    const userType = normalizeUserType(searchParams.get('userType'));
    const fullName = normalizeText(searchParams.get('fullName'));
    const city = normalizeText(searchParams.get('city'));

    if (userType || fullName || city) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const currentMetadata = (user.user_metadata ?? {}) as Record<string, unknown>;
        const nextMetadata: Record<string, unknown> = { ...currentMetadata };

        if (userType) {
          nextMetadata.user_type = userType;
        }

        if (fullName && !currentMetadata.full_name) {
          nextMetadata.full_name = fullName;
        }

        if (city) {
          nextMetadata.city = city;
        }

        await supabase.auth.updateUser({ data: nextMetadata });
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
