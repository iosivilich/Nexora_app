import { NextResponse } from 'next/server';
import {
  addNetworkConnection,
  listNetworkConnections,
  removeNetworkConnection,
} from '../../../../src/lib/backend-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'profileId es obligatorio.' }, { status: 400 });
    }

    const collection = await listNetworkConnections(profileId);
    return NextResponse.json(collection);
  } catch (error) {
    console.error('GET /api/network/connections failed', error);
    return NextResponse.json(
      { error: 'No pudimos cargar las conexiones del usuario.' },
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

    const collection = await addNetworkConnection(body.profileId, body.consultantId);
    return NextResponse.json(collection);
  } catch (error) {
    console.error('POST /api/network/connections failed', error);
    return NextResponse.json(
      { error: 'No pudimos añadir la conexión.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const consultantId = searchParams.get('consultantId');

    if (!profileId || !consultantId) {
      return NextResponse.json(
        { error: 'profileId y consultantId son obligatorios.' },
        { status: 400 },
      );
    }

    const collection = await removeNetworkConnection(profileId, consultantId);
    return NextResponse.json(collection);
  } catch (error) {
    console.error('DELETE /api/network/connections failed', error);
    return NextResponse.json(
      { error: 'No pudimos eliminar la conexión.' },
      { status: 500 },
    );
  }
}
