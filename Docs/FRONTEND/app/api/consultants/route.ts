import { NextResponse } from 'next/server';
import { searchConsultants } from '../../../src/lib/backend-data';

function toNumber(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value: string | null) {
  if (!value) {
    return null;
  }

  return value === 'true';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitValue = Number(searchParams.get('limit'));
    const limit = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : undefined;
    const items = await searchConsultants({
      limit,
      search: searchParams.get('search'),
      category: searchParams.get('category'),
      minRating: toNumber(searchParams.get('minRating')),
      minExperience: toNumber(searchParams.get('minExperience')),
      city: searchParams.get('city'),
      minProjects: toNumber(searchParams.get('minProjects')),
      maxAge: toNumber(searchParams.get('maxAge')),
      featured: toBoolean(searchParams.get('featured')),
      verified: toBoolean(searchParams.get('verified')),
    });

    return NextResponse.json({
      items,
      count: items.length,
      source: 'supabase',
    });
  } catch (error) {
    console.error('GET /api/consultants failed', error);

    return NextResponse.json(
      { error: 'No pudimos cargar los consultores desde Supabase.' },
      { status: 500 },
    );
  }
}
