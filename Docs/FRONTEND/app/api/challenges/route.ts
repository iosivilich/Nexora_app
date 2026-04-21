import { NextResponse } from 'next/server';
import { createChallenge, getAuthenticatedContext, listChallenges } from '../../../src/lib/backend-data';

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
    const scope = searchParams.get('scope');
    let idEmpresa = toNumber(searchParams.get('idEmpresa'));

    if (scope === 'mine') {
      const context = await getAuthenticatedContext();

      if (context.profile.user_type !== 'EMPRESA' || !context.companyRecord?.id_empresa) {
        return NextResponse.json(
          { error: 'Solo una empresa vinculada puede consultar sus propios desafíos.' },
          { status: 403 },
        );
      }

      idEmpresa = context.companyRecord.id_empresa;
    }

    const items = await listChallenges({
      idEmpresa,
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
      title?: string;
      description?: string;
      specialty?: string;
      budget?: number | null;
      mode?: string | null;
      status?: string | null;
    };

    if (!body.title?.trim() || !body.description?.trim() || !body.specialty?.trim()) {
      return NextResponse.json(
        { error: 'title, description y specialty son obligatorios.' },
        { status: 400 },
      );
    }

    const context = await getAuthenticatedContext();
    if (context.profile.user_type !== 'EMPRESA' || !context.companyRecord?.id_empresa) {
      return NextResponse.json(
        { error: 'Solo una empresa vinculada puede crear desafíos.' },
        { status: 403 },
      );
    }

    const item = await createChallenge({
      idEmpresa: context.companyRecord.id_empresa,
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
      { error: error instanceof Error ? error.message : 'No pudimos crear el desafio.' },
      {
        status:
          typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
            ? error.status
            : 500,
      },
    );
  }
}
