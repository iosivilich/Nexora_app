import { NextResponse } from 'next/server';
import { getProfileDetails, updateProfileDetails } from '../../../../src/lib/backend-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'profileId es obligatorio.' }, { status: 400 });
    }

    const profile = await getProfileDetails(profileId);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('GET /api/profile/me failed', error);
    return NextResponse.json(
      { error: 'No pudimos cargar el perfil solicitado.' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      profileId?: string;
      fullName?: string;
      city?: string;
      avatarUrl?: string;
      role?: string;
      bio?: string;
      expertise?: string[];
    };

    if (!body.profileId) {
      return NextResponse.json({ error: 'profileId es obligatorio.' }, { status: 400 });
    }

    const profile = await updateProfileDetails({
      profileId: body.profileId,
      fullName: body.fullName,
      city: body.city,
      avatarUrl: body.avatarUrl,
      role: body.role,
      bio: body.bio,
      expertise: body.expertise,
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('PUT /api/profile/me failed', error);
    return NextResponse.json(
      { error: 'No pudimos actualizar el perfil.' },
      { status: 500 },
    );
  }
}
