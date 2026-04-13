import { NextResponse } from 'next/server';
import { getCompanies } from '../../../src/lib/backend-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitValue = Number(searchParams.get('limit'));
    const limit = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : undefined;
    const items = await getCompanies(limit);

    return NextResponse.json({
      items,
      count: items.length,
      source: 'supabase',
    });
  } catch (error) {
    console.error('GET /api/companies failed', error);

    return NextResponse.json(
      { error: 'No pudimos cargar las empresas desde Supabase.' },
      { status: 500 },
    );
  }
}
