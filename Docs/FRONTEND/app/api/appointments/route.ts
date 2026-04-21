import { NextResponse } from 'next/server';
import { getAuthenticatedContext, listAppointments, scheduleAppointment } from '../../../src/lib/backend-data';

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : 500;
}

export async function GET() {
  try {
    const context = await getAuthenticatedContext();
    const items = await listAppointments(context.user.id, context.routeClient);
    return NextResponse.json({
      items,
      count: items.length,
      source: 'supabase',
    });
  } catch (error) {
    console.error('GET /api/appointments failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos cargar las citas del usuario.' },
      { status: getErrorStatus(error) },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      consultantId?: string;
      requestedAt?: string;
      note?: string | null;
    };

    if (!body.consultantId || !body.requestedAt) {
      return NextResponse.json(
        { error: 'consultantId y requestedAt son obligatorios.' },
        { status: 400 },
      );
    }

    const context = await getAuthenticatedContext();
    const appointment = await scheduleAppointment({
      profileId: context.user.id,
      consultantId: body.consultantId,
      requestedAt: body.requestedAt,
      note: body.note ?? null,
    }, context.routeClient);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('POST /api/appointments failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos agendar la solicitud de consultoría.' },
      { status: getErrorStatus(error) },
    );
  }
}
