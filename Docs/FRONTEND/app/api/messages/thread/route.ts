import { NextResponse } from 'next/server';
import { getAuthenticatedContext, getConversationThread } from '../../../../src/lib/backend-data';

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : 500;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId es obligatorio.' },
        { status: 400 },
      );
    }

    const context = await getAuthenticatedContext();
    const thread = await getConversationThread(context.profileId, conversationId, context.routeClient);
    return NextResponse.json(thread);
  } catch (error) {
    console.error('GET /api/messages/thread failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos cargar el hilo de conversación.' },
      { status: getErrorStatus(error) },
    );
  }
}
