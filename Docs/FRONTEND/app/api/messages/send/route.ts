import { NextResponse } from 'next/server';
import { sendConversationMessage } from '../../../../src/lib/backend-data';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profileId?: string;
      conversationId?: string;
      text?: string;
    };

    if (!body.profileId || !body.conversationId || !body.text?.trim()) {
      return NextResponse.json(
        { error: 'profileId, conversationId y text son obligatorios.' },
        { status: 400 },
      );
    }

    const thread = await sendConversationMessage({
      profileId: body.profileId,
      conversationId: body.conversationId,
      text: body.text,
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error('POST /api/messages/send failed', error);
    return NextResponse.json(
      { error: 'No pudimos enviar el mensaje.' },
      { status: 500 },
    );
  }
}
