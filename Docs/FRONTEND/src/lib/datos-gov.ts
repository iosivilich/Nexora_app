import type { CompanyCatalogItem } from './backend-types';

const SOCRATA_URL = 'https://www.datos.gov.co/resource/gskn-y6cz.json';

// CIIU prefixes relevantes para Nexora
export const CIIU_SECTORES: Record<string, string> = {
  '62': 'Tecnología y Software',
  '63': 'Datos y Hosting',
  '64': 'Servicios Financieros',
  '65': 'Seguros',
  '66': 'Actividades Financieras Auxiliares',
  '70': 'Consultoría Empresarial',
  '71': 'Ingeniería y Arquitectura',
  '72': 'Investigación Científica',
  '73': 'Publicidad y Estudios de Mercado',
  '74': 'Actividades Profesionales',
  '78': 'Selección de Personal',
};

export const CIUDADES_PRINCIPALES = [
  'BOGOTA',
  'MEDELLIN',
  'CALI',
  'BARRANQUILLA',
  'CARTAGENA',
  'BUCARAMANGA',
  'PEREIRA',
  'MANIZALES',
];

export type CatalogFilters = {
  q?:          string;
  ciudad?:     string;
  ciiu?:       string;
  activosMin?: number;
  limit?:      number;
  offset?:     number;
};

type SocrataRow = {
  nit?:                    string;
  razon_social?:           string;
  municipio?:              string;
  departamento?:           string;
  ciiu?:                   string;
  descripcion_ciiu?:       string;
  activos?:                string;
  organizacion_juridica?:  string;
};

function mapRow(r: SocrataRow): CompanyCatalogItem {
  return {
    nit:              r.nit              ?? '',
    razonSocial:      r.razon_social     ?? '',
    ciudad:           r.municipio        ?? '',
    departamento:     r.departamento     ?? '',
    ciiu:             r.ciiu             ?? '',
    sector:           r.descripcion_ciiu ?? '',
    activos:          Number(r.activos)  || 0,
    tipoOrganizacion: r.organizacion_juridica ?? '',
  };
}

export async function fetchCatalog(filters: CatalogFilters = {}): Promise<CompanyCatalogItem[]> {
  const {
    q,
    ciudad,
    ciiu,
    activosMin,
    limit  = 100,
    offset = 0,
  } = filters;

  const conditions: string[] = ["estado='ACTIVO'"];

  if (ciudad) {
    conditions.push(`municipio='${ciudad.toUpperCase()}'`);
  }

  if (ciiu) {
    conditions.push(`starts_with(ciiu,'${ciiu}')`);
  }

  if (typeof activosMin === 'number' && activosMin > 0) {
    conditions.push(`activos>${activosMin}`);
  }

  if (q) {
    // Búsqueda por texto en razón social — Socrata usa upper() para case-insensitive
    const term = q.toUpperCase().replace(/'/g, "''");
    conditions.push(`contains(upper(razon_social),'${term}')`);
  }

  const params = new URLSearchParams({
    '$select': 'nit,razon_social,municipio,departamento,ciiu,descripcion_ciiu,activos,organizacion_juridica',
    '$where':  conditions.join(' AND '),
    '$order':  'activos DESC',
    '$limit':  String(Math.min(limit, 1000)),
    '$offset': String(offset),
  });

  const res = await fetch(`${SOCRATA_URL}?${params}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },   // cache 1 hora en Next.js
  });

  if (!res.ok) {
    throw new Error(`datos.gov.co error ${res.status}: ${await res.text()}`);
  }

  const rows: SocrataRow[] = await res.json();
  return rows.map(mapRow);
}
