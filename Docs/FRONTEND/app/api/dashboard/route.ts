import { NextResponse } from 'next/server';
import { getDashboardSnapshot } from '../../../src/lib/backend-data';

export async function GET() {
  try {
    const dashboard = await getDashboardSnapshot();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('GET /api/dashboard failed', error);

    return NextResponse.json(
      { error: 'No pudimos construir el dashboard con datos de Supabase.' },
      { status: 500 },
    );
  }
}
