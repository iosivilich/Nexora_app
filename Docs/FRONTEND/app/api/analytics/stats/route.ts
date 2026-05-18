import { NextResponse } from 'next/server';
import { getAnalyticsStats, getAuthenticatedContext } from '../../../../src/lib/backend-data';

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
    const stats = await getAnalyticsStats({
      profileId: context.profileId,
      idEmpresa: toNumber(searchParams.get('idEmpresa')) ?? context.companyRecord?.id_empresa ?? null,
      idConsultor: toNumber(searchParams.get('idConsultor')) ?? context.consultantRecord?.id_consultor ?? null,
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('GET /api/analytics/stats failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos construir las métricas de analytics.' },
      {
        status:
          typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
            ? error.status
            : 500,
      },
    );
  }
}
