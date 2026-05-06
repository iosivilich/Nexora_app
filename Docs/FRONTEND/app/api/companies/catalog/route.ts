import { NextRequest, NextResponse } from 'next/server';
import { fetchCatalog, CIIU_SECTORES, CIUDADES_PRINCIPALES } from '../../../../src/lib/datos-gov';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Devolver metadatos de filtros disponibles
  if (searchParams.get('meta') === '1') {
    return NextResponse.json({
      sectores:  CIIU_SECTORES,
      ciudades:  CIUDADES_PRINCIPALES,
      source:    'datos.gov.co',
    });
  }

  const rawLimit  = Number(searchParams.get('limit'));
  const rawOffset = Number(searchParams.get('offset'));
  const rawActivos = Number(searchParams.get('activosMin'));

  try {
    const items = await fetchCatalog({
      q:          searchParams.get('q')        ?? undefined,
      ciudad:     searchParams.get('ciudad')   ?? undefined,
      ciiu:       searchParams.get('ciiu')     ?? undefined,
      activosMin: rawActivos > 0 ? rawActivos : undefined,
      limit:      rawLimit  > 0 ? rawLimit  : 100,
      offset:     rawOffset > 0 ? rawOffset : 0,
    });

    return NextResponse.json({
      items,
      total:  items.length,
      source: 'datos.gov.co',
    });
  } catch (error) {
    console.error('GET /api/companies/catalog failed', error);
    return NextResponse.json(
      { error: 'No fue posible consultar el catálogo de empresas.' },
      { status: 502 },
    );
  }
}
