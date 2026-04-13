import { NextResponse } from 'next/server';
import { getDemoSeedStatus, seedDemoData } from '../../../../src/lib/backend-data';

export async function GET() {
  try {
    const status = await getDemoSeedStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('GET /api/demo/seed failed', error);

    return NextResponse.json(
      { error: 'No pudimos validar el estado de los datos demo.' },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const status = await seedDemoData();
    const httpStatus = status.ready ? 200 : 503;

    return NextResponse.json(status, { status: httpStatus });
  } catch (error) {
    console.error('POST /api/demo/seed failed', error);

    return NextResponse.json(
      { error: 'No pudimos sembrar los datos demo en Supabase.' },
      { status: 500 },
    );
  }
}
