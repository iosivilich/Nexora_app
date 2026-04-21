import { NextResponse } from 'next/server';
import {
  getAuthenticatedContext,
  listFavoriteConsultants,
  toggleFavoriteConsultant,
} from '../../../../src/lib/backend-data';

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : 500;
}

export async function GET() {
  try {
    const context = await getAuthenticatedContext();
    const collection = await listFavoriteConsultants(context.user.id, context.routeClient);
    return NextResponse.json(collection);
  } catch (error) {
    console.error('GET /api/network/favorites failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos cargar los favoritos del usuario.' },
      { status: getErrorStatus(error) },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      consultantId?: string;
    };

    if (!body.consultantId) {
      return NextResponse.json(
        { error: 'consultantId es obligatorio.' },
        { status: 400 },
      );
    }

    const context = await getAuthenticatedContext();
    const collection = await toggleFavoriteConsultant(context.user.id, body.consultantId, context.routeClient);
    return NextResponse.json(collection);
  } catch (error) {
    console.error('POST /api/network/favorites failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos actualizar los favoritos del usuario.' },
      { status: getErrorStatus(error) },
    );
  }
}
