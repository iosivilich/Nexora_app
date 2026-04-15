import { NextResponse } from 'next/server';
import { createChallenge, listChallenges } from '../../../src/lib/backend-data';

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
    const items = await listChallenges({
      idEmpresa: toNumber(searchParams.get('idEmpresa')),
      status: searchParams.get('status'),
      mode: searchParams.get('mode'),
      limit: toNumber(searchParams.get('limit')),
    });

    return NextResponse.json({
      items,
      count: items.length,
      source: 'supabase',
    });
  } catch (error) {
    console.error('GET /api/challenges failed', error);

    return NextResponse.json(
      { error: 'No pudimos cargar los desafios desde Supabase.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      idEmpresa?: number;
      title?: string;
      description?: string;
      specialty?: string;
      budget?: number | null;
      mode?: string | null;
      status?: string | null;
    };

    if (!body.idEmpresa || !body.title?.trim() || !body.description?.trim() || !body.specialty?.trim()) {
      return NextResponse.json(
        { error: 'idEmpresa, title, description y specialty son obligatorios.' },
        { status: 400 },
      );
    }

    const item = await createChallenge({
      idEmpresa: body.idEmpresa,
      title: body.title,
      description: body.description,
      specialty: body.specialty,
      budget: body.budget ?? null,
      mode: body.mode ?? null,
      status: body.status ?? null,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('POST /api/challenges failed', error);

    return NextResponse.json(
      { error: 'No pudimos crear el desafio.' },
      { status: 500 },
    );
  }
}
