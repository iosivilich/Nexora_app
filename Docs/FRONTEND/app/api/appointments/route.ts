import { NextResponse } from 'next/server';
import { listAppointments, scheduleAppointment } from '../../../src/lib/backend-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'profileId es obligatorio.' }, { status: 400 });
    }

    const items = await listAppointments(profileId);
    return NextResponse.json({
      items,
      count: items.length,
      source: 'auth-metadata',
    });
  } catch (error) {
    console.error('GET /api/appointments failed', error);
    return NextResponse.json(
      { error: 'No pudimos cargar las citas del usuario.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profileId?: string;
      consultantId?: string;
      requestedAt?: string;
      note?: string | null;
    };

    if (!body.profileId || !body.consultantId || !body.requestedAt) {
      return NextResponse.json(
        { error: 'profileId, consultantId y requestedAt son obligatorios.' },
        { status: 400 },
      );
    }

    const appointment = await scheduleAppointment({
      profileId: body.profileId,
      consultantId: body.consultantId,
      requestedAt: body.requestedAt,
      note: body.note ?? null,
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('POST /api/appointments failed', error);
    return NextResponse.json(
      { error: 'No pudimos agendar la solicitud de consultoría.' },
      { status: 500 },
    );
  }
}
