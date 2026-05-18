import { NextResponse } from 'next/server';
import { createApplication, getAuthenticatedContext, listApplications } from '../../../src/lib/backend-data';

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
    const context = await getAuthenticatedContext();

    if (context.profile.user_type === 'CONSULTOR' && !context.consultantRecord?.id_consultor) {
      return NextResponse.json(
        { error: 'Tu usuario consultor aún no está vinculado a un registro de consultor.' },
        { status: 403 },
      );
    }

    if (context.profile.user_type === 'EMPRESA' && !context.companyRecord?.id_empresa) {
      return NextResponse.json(
        { error: 'Tu usuario empresa aún no está vinculado a un registro de empresa.' },
        { status: 403 },
      );
    }

    const requestedConsultorId = toNumber(searchParams.get('idConsultor'));
    const requestedEmpresaId = toNumber(searchParams.get('idEmpresa'));
    const effectiveConsultorId =
      context.profile.user_type === 'CONSULTOR'
        ? context.consultantRecord?.id_consultor ?? null
        : requestedConsultorId;
    const effectiveEmpresaId =
      context.profile.user_type === 'EMPRESA'
        ? context.companyRecord?.id_empresa ?? null
        : requestedEmpresaId;
    const items = await listApplications({
      idConsultor: effectiveConsultorId,
      idEmpresa: effectiveEmpresaId,
      idDesafio: toNumber(searchParams.get('idDesafio')),
      status: searchParams.get('status'),
    }, context.routeClient);

    return NextResponse.json({
      items,
      count: items.length,
      source: 'supabase',
    });
  } catch (error) {
    console.error('GET /api/applications failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos cargar las postulaciones desde Supabase.' },
      {
        status:
          typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
            ? error.status
            : 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      idDesafio?: number;
      coverLetter?: string;
      proposedBudget?: number | null;
      status?: string | null;
    };

    if (!body.idDesafio || !body.coverLetter?.trim()) {
      return NextResponse.json(
        { error: 'idDesafio y coverLetter son obligatorios.' },
        { status: 400 },
      );
    }

    const context = await getAuthenticatedContext();
    if (context.profile.user_type !== 'CONSULTOR' || !context.consultantRecord?.id_consultor) {
      return NextResponse.json(
        { error: 'Solo un consultor vinculado puede crear postulaciones.' },
        { status: 403 },
      );
    }

    const item = await createApplication({
      idDesafio: body.idDesafio,
      idConsultor: context.consultantRecord.id_consultor,
      coverLetter: body.coverLetter,
      proposedBudget: body.proposedBudget ?? null,
      status: body.status ?? null,
    }, context.routeClient);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('POST /api/applications failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos crear la postulacion.' },
      {
        status:
          typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
            ? error.status
            : 500,
      },
    );
  }
}
