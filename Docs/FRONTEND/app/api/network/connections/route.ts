import { NextResponse } from 'next/server';
import {
  addNetworkConnection,
  getAuthenticatedContext,
  listNetworkConnections,
  removeNetworkConnection,
} from '../../../../src/lib/backend-data';

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : 500;
}

export async function GET() {
  try {
    const context = await getAuthenticatedContext();
    const collection = await listNetworkConnections(context.user.id, context.routeClient);
    return NextResponse.json(collection);
  } catch (error) {
    console.error('GET /api/network/connections failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos cargar las conexiones del usuario.' },
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
    const collection = await addNetworkConnection(context.user.id, body.consultantId, context.routeClient);
    return NextResponse.json(collection);
  } catch (error) {
    console.error('POST /api/network/connections failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos añadir la conexión.' },
      { status: getErrorStatus(error) },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const consultantId = searchParams.get('consultantId');

    if (!consultantId) {
      return NextResponse.json(
        { error: 'consultantId es obligatorio.' },
        { status: 400 },
      );
    }

    const context = await getAuthenticatedContext();
    const collection = await removeNetworkConnection(context.user.id, consultantId, context.routeClient);
    return NextResponse.json(collection);
  } catch (error) {
    console.error('DELETE /api/network/connections failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos eliminar la conexión.' },
      { status: getErrorStatus(error) },
    );
  }
}
