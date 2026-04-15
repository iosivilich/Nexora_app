import { NextResponse } from 'next/server';
import {
  listFavoriteConsultants,
  toggleFavoriteConsultant,
} from '../../../../src/lib/backend-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'profileId es obligatorio.' }, { status: 400 });
    }

    const collection = await listFavoriteConsultants(profileId);
    return NextResponse.json(collection);
  } catch (error) {
    console.error('GET /api/network/favorites failed', error);
    return NextResponse.json(
      { error: 'No pudimos cargar los favoritos del usuario.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profileId?: string;
      consultantId?: string;
    };

    if (!body.profileId || !body.consultantId) {
      return NextResponse.json(
        { error: 'profileId y consultantId son obligatorios.' },
        { status: 400 },
      );
    }

    const collection = await toggleFavoriteConsultant(body.profileId, body.consultantId);
    return NextResponse.json(collection);
  } catch (error) {
    console.error('POST /api/network/favorites failed', error);
    return NextResponse.json(
      { error: 'No pudimos actualizar los favoritos del usuario.' },
      { status: 500 },
    );
  }
}
