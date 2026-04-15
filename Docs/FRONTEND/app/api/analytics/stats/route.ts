import { NextResponse } from 'next/server';
import { getAnalyticsStats } from '../../../../src/lib/backend-data';

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
    const stats = await getAnalyticsStats({
      profileId: searchParams.get('profileId'),
      idEmpresa: toNumber(searchParams.get('idEmpresa')),
      idConsultor: toNumber(searchParams.get('idConsultor')),
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('GET /api/analytics/stats failed', error);
    return NextResponse.json(
      { error: 'No pudimos construir las métricas de analytics.' },
      { status: 500 },
    );
  }
}
