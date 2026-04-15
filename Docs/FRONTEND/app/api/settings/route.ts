import { NextResponse } from 'next/server';
import { getUserSettings, updateUserSettings } from '../../../src/lib/backend-data';
import type { UserSettings } from '../../../src/lib/backend-types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'profileId es obligatorio.' }, { status: 400 });
    }

    const settings = await getUserSettings(profileId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET /api/settings failed', error);
    return NextResponse.json(
      { error: 'No pudimos cargar la configuración del usuario.' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      profileId?: string;
      settings?: Partial<UserSettings>;
    };

    if (!body.profileId || !body.settings) {
      return NextResponse.json(
        { error: 'profileId y settings son obligatorios.' },
        { status: 400 },
      );
    }

    const settings = await updateUserSettings(body.profileId, body.settings);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('PUT /api/settings failed', error);
    return NextResponse.json(
      { error: 'No pudimos actualizar la configuración del usuario.' },
      { status: 500 },
    );
  }
}
