import { NextResponse } from 'next/server';
import { getAuthenticatedContext, getUserSettings, updateUserSettings } from '../../../src/lib/backend-data';
import type { UserSettings } from '../../../src/lib/backend-types';

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : 500;
}

export async function GET() {
  try {
    const context = await getAuthenticatedContext();
    const settings = await getUserSettings(context.user.id, context.routeClient);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET /api/settings failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos cargar la configuración del usuario.' },
      { status: getErrorStatus(error) },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      settings?: Partial<UserSettings>;
    };

    if (!body.settings) {
      return NextResponse.json(
        { error: 'settings es obligatorio.' },
        { status: 400 },
      );
    }

    const context = await getAuthenticatedContext();
    const settings = await updateUserSettings(context.user.id, body.settings, context.routeClient);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('PUT /api/settings failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos actualizar la configuración del usuario.' },
      { status: getErrorStatus(error) },
    );
  }
}
