import { NextResponse } from 'next/server';
import { getChallenges } from '../../../src/lib/backend-data';

export async function GET() {
  try {
    const items = await getChallenges();

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
