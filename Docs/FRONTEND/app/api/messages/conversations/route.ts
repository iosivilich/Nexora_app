import { NextResponse } from 'next/server';
import { listConversations } from '../../../../src/lib/backend-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'profileId es obligatorio.' }, { status: 400 });
    }

    const items = await listConversations(profileId);
    return NextResponse.json({
      items,
      count: items.length,
      source: 'auth-metadata',
    });
  } catch (error) {
    console.error('GET /api/messages/conversations failed', error);
    return NextResponse.json(
      { error: 'No pudimos cargar las conversaciones del usuario.' },
      { status: 500 },
    );
  }
}
