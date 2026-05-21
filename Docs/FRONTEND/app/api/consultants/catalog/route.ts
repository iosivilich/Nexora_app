import { NextRequest, NextResponse } from 'next/server';
import {
  fetchSecopConsultores,
  listSecopCategorias,
  listSecopCiudades,
} from '../../../../src/lib/datos-gov-consultores';
import { fetchGithubConsultores } from '../../../../src/lib/github-consultores';
import type {
  ConsultantCatalogItem,
  ConsultantSource,
} from '../../../../src/lib/backend-types';

const VALID_SOURCES: ConsultantSource[] = ['github', 'secop'];

function parseSources(raw: string | null): ConsultantSource[] {
  if (!raw || raw === 'all') return VALID_SOURCES;
  const parts = raw.split(',').map((p) => p.trim().toLowerCase()) as ConsultantSource[];
  const valid = parts.filter((p): p is ConsultantSource =>
    (VALID_SOURCES as string[]).includes(p),
  );
  return valid.length ? Array.from(new Set(valid)) : VALID_SOURCES;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  if (searchParams.get('meta') === '1') {
    return NextResponse.json({
      sources:    VALID_SOURCES,
      ciudades:   listSecopCiudades(),
      categorias: listSecopCategorias(),
      source:     'github + datos.gov.co',
    });
  }

  const rawLimit  = Number(searchParams.get('limit'));
  const rawOffset = Number(searchParams.get('offset'));
  const limit     = rawLimit  > 0 ? rawLimit  : 30;
  const offset    = rawOffset > 0 ? rawOffset : 0;
  const sources   = parseSources(searchParams.get('source'));
  const ciudad    = searchParams.get('ciudad') ?? undefined;
  const q         = searchParams.get('q')      ?? undefined;

  try {
    const tasks: Array<Promise<ConsultantCatalogItem[]>> = [];
    if (sources.includes('github')) {
      tasks.push(fetchGithubConsultores({ ciudad, q, limit, offset }));
    }
    if (sources.includes('secop')) {
      tasks.push(fetchSecopConsultores({ ciudad, q, limit, offset }));
    }

    const settled = await Promise.allSettled(tasks);
    const items: ConsultantCatalogItem[] = [];
    for (const res of settled) {
      if (res.status === 'fulfilled') items.push(...res.value);
      else console.error('consultants/catalog source failed', res.reason);
    }

    // Dedupe por (fuente, idExterno) por si se piden ambas fuentes con overlap.
    const seen = new Set<string>();
    const deduped = items.filter((c) => {
      const key = `${c.fuente}:${c.idExterno}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({
      items:   deduped,
      total:   deduped.length,
      sources,
    });
  } catch (error) {
    console.error('GET /api/consultants/catalog failed', error);
    return NextResponse.json(
      { error: 'No fue posible consultar el catálogo de consultores.' },
      { status: 502 },
    );
  }
}
