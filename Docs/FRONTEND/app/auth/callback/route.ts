import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '../../../src/lib/supabase-server';
import { updateProfileDetails } from '../../../src/lib/backend-data';

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

    const requestedUserType = normalizeUserType(searchParams.get('userType'));
    const requestedFullName = normalizeText(searchParams.get('fullName'));
    const requestedCity = normalizeText(searchParams.get('city'));

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const currentMetadata = (user.user_metadata ?? {}) as Record<string, unknown>;
      const metadataUserType = normalizeUserType(
        typeof currentMetadata.user_type === 'string' ? currentMetadata.user_type : null,
      );
      const metadataFullName = normalizeText(
        typeof currentMetadata.full_name === 'string'
          ? currentMetadata.full_name
          : typeof currentMetadata.name === 'string'
            ? currentMetadata.name
            : null,
      );
      const metadataCity = normalizeText(
        typeof currentMetadata.city === 'string' ? currentMetadata.city : null,
      );

      const userType = requestedUserType ?? metadataUserType;
      const fullName = requestedFullName ?? metadataFullName;
      const city = requestedCity ?? metadataCity;

      if (requestedUserType || requestedFullName || requestedCity) {
        const nextMetadata: Record<string, unknown> = { ...currentMetadata };

        if (userType) {
          nextMetadata.user_type = userType;
        }

        if (fullName) {
          nextMetadata.full_name = fullName;
        }

        if (city) {
          nextMetadata.city = city;
        }

        await supabase.auth.updateUser({ data: nextMetadata });
      }

      if (userType || fullName || city) {
        await updateProfileDetails(
          {
            profileId: user.id,
            authUser: user,
            userType,
            fullName,
            city,
          },
          supabase,
        );
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
