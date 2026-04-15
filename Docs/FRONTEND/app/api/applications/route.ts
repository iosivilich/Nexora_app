import { NextResponse } from 'next/server';
import { createApplication, listApplications } from '../../../src/lib/backend-data';

function toNumber(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const items = await listApplications({
      idConsultor: toNumber(searchParams.get('idConsultor')),
      idDesafio: toNumber(searchParams.get('idDesafio')),
      status: searchParams.get('status'),
    });

    return NextResponse.json({
      items,
      count: items.length,
      source: 'supabase',
    });
  } catch (error) {
    console.error('GET /api/applications failed', error);
    return NextResponse.json(
      { error: 'No pudimos cargar las postulaciones desde Supabase.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      idDesafio?: number;
      idConsultor?: number;
      coverLetter?: string;
      proposedBudget?: number | null;
      status?: string | null;
    };

    if (!body.idDesafio || !body.idConsultor || !body.coverLetter?.trim()) {
      return NextResponse.json(
        { error: 'idDesafio, idConsultor y coverLetter son obligatorios.' },
        { status: 400 },
      );
    }

    const item = await createApplication({
      idDesafio: body.idDesafio,
      idConsultor: body.idConsultor,
      coverLetter: body.coverLetter,
      proposedBudget: body.proposedBudget ?? null,
      status: body.status ?? null,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('POST /api/applications failed', error);
    return NextResponse.json(
      { error: 'No pudimos crear la postulacion.' },
      { status: 500 },
    );
  }
}
