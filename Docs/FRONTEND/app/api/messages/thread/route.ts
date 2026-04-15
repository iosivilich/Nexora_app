import { NextResponse } from 'next/server';
import { getConversationThread } from '../../../../src/lib/backend-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const conversationId = searchParams.get('conversationId');

    if (!profileId || !conversationId) {
      return NextResponse.json(
        { error: 'profileId y conversationId son obligatorios.' },
        { status: 400 },
      );
    }

    const thread = await getConversationThread(profileId, conversationId);
    return NextResponse.json(thread);
  } catch (error) {
    console.error('GET /api/messages/thread failed', error);
    return NextResponse.json(
      { error: 'No pudimos cargar el hilo de conversación.' },
      { status: 500 },
    );
  }
}
