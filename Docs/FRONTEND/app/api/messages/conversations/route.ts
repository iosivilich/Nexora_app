import { NextResponse } from 'next/server';
import {
  getAuthenticatedContext,
  getOrCreateConversation,
  listConversations,
} from '../../../../src/lib/backend-data';

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : 500;
}

export async function GET() {
  try {
    const context = await getAuthenticatedContext();
    const items = await listConversations(context.profileId, context.routeClient);
    return NextResponse.json({
      items,
      count: items.length,
      source: 'supabase',
    });
  } catch (error) {
    console.error('GET /api/messages/conversations failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos cargar las conversaciones del usuario.' },
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
    const conversation = await getOrCreateConversation(context.profileId, body.consultantId, context.routeClient);

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('POST /api/messages/conversations failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos iniciar la conversación.' },
      { status: getErrorStatus(error) },
    );
  }
}
