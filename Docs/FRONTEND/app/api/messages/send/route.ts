import { NextResponse } from 'next/server';
import { getAuthenticatedContext, sendConversationMessage } from '../../../../src/lib/backend-data';

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : 500;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      conversationId?: string;
      text?: string;
    };

    if (!body.conversationId || !body.text?.trim()) {
      return NextResponse.json(
        { error: 'conversationId y text son obligatorios.' },
        { status: 400 },
      );
    }

    const context = await getAuthenticatedContext();
    const thread = await sendConversationMessage({
      profileId: context.profileId,
      conversationId: body.conversationId,
      text: body.text,
    }, context.routeClient);

    return NextResponse.json(thread);
  } catch (error) {
    console.error('POST /api/messages/send failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos enviar el mensaje.' },
      { status: getErrorStatus(error) },
    );
  }
}
