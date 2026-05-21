// Fuente: datos.gov.co (SECOP, dataset 4ex9-j3n8) filtrado a
// `tipo_entidad = 'PERSONA NATURAL COLOMBIANA'` con email y categoría
// definida — son consultores y proveedores individuales registrados ante
// el Estado. ~5K útiles con categoría real, ~1.3K en categorías de
// "consultoría / asesoría / profesional / informática".
//
// Reusa: token Socrata, normalización de ciudad y filtros de calidad
// de `datos-gov.ts`.

import { CIUDAD_DISPLAY, CIUDADES_PRINCIPALES } from './datos-gov';
import {
  diceBearAvatar,
  inferExpertise,
  inferRol,
  syntheticAge,
  syntheticPhone,
  syntheticRate,
  syntheticRating,
} from './consultores-enrich';
import type { ConsultantCatalogItem } from './backend-types';

const SOCRATA_URL = 'https://www.datos.gov.co/resource/4ex9-j3n8.json';

// Misma lógica de limpieza que datos-gov.ts.
const EMPTY = new Set(['No Definido', 'No Provisto', '-', '.', '']);
const GARBAGE_NAME = /^[^A-Za-záéíóúÁÉÍÓÚñÑ]/;
const FAKE_NITS = new Set(['No Definido', '0', '00', '000', '0000', '00000', '-', 'No Provisto']);

function clean(v?: string): string {
  const t = v?.trim() ?? '';
  return EMPTY.has(t) ? '' : t;
}

function splitNombre(full: string): { nombre: string; apellido: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length <= 1) return { nombre: full.trim(), apellido: '' };
  // Convención hispana: últimas 2 palabras son apellidos.
  const cut = Math.max(1, parts.length - 2);
  return {
    nombre:   parts.slice(0, cut).join(' '),
    apellido: parts.slice(cut).join(' '),
  };
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b([a-záéíóúñ])/g, (m) => m.toUpperCase());
}

type SocrataPersonaRow = {
  nombre_entidad?:                 string;
  nit_entidad?:                    string;
  correo_electronico?:             string;
  ciudad?:                         string;
  departamento?:                   string;
  feacha_de_creacion?:             string;
  descripci_n_categoria_principal?: string;
  esta_activa?:                    string;
  tipo_entidad?:                   string;
};

export type SecopConsultorFilters = {
  ciudad?:    string;
  categoria?: string;
  q?:         string;
  limit?:     number;
  offset?:    number;
};

function isClean(r: SocrataPersonaRow): boolean {
  const name = clean(r.nombre_entidad);
  const nit  = clean(r.nit_entidad);
  if (!name || GARBAGE_NAME.test(name)) return false;
  if (!nit || FAKE_NITS.has(nit) || nit.length < 6) return false;
  if (!clean(r.correo_electronico)) return false;
  return true;
}

function mapRow(r: SocrataPersonaRow): ConsultantCatalogItem {
  const fullName     = titleCase(clean(r.nombre_entidad));
  const { nombre, apellido } = splitNombre(fullName);
  const nit          = clean(r.nit_entidad);
  const email        = clean(r.correo_electronico).toLowerCase();
  const ciudadRaw    = clean(r.ciudad);
  const ciudad       = CIUDAD_DISPLAY[ciudadRaw] ?? titleCase(ciudadRaw);
  const departamento = titleCase(clean(r.departamento));
  const categoria    = clean(r.descripci_n_categoria_principal);
  const fechaReg     = clean(r.feacha_de_creacion);

  const rol         = inferRol({ categoria, fallback: 'Consultor Profesional' });
  const expertise   = inferExpertise({ categoria });
  const bio         = ciudad
    ? `${rol} con sede en ${ciudad}, especializado en ${categoria.toLowerCase()}.`
    : `${rol} especializado en ${categoria.toLowerCase()}.`;

  return {
    idExterno:         nit,
    fuente:            'secop',
    nombre,
    apellido,
    email:             email || null,
    telefono:          syntheticPhone(nit),
    rol,
    bio,
    especialidad:      categoria,
    expertise,
    ciudad,
    departamento,
    avatarUrl:         diceBearAvatar(fullName || nit),
    experienciaAnos:   1 + (Math.abs((nit.charCodeAt(0) || 0) * 31 + nit.length) % 20),
    tarifaReferencial: syntheticRate(nit),
    rating:            syntheticRating(nit),
    edad:              syntheticAge(nit),
    estado:            'disponible',
    verified:          true,
    fechaRegistro:     fechaReg || null,
  };
}

// Categorías SECOP que efectivamente representan consultores/profesionales.
const CATEGORIAS_CONSULTORAS = [
  'Servicios de recursos humanos',
  'Servicios de asesoría de gestión',
  'Servicios legales',
  'Servicios profesionales de ingeniería y arquitectura',
  'Servicios de administración de empresas',
  'Servicios integrales de salud',
  'Formación profesional',
  'Servicios informáticos',
  'Servicios de contabilidad y auditorias',
  'Gestión medioambiental',
  'Publicidad',
  'Servicios de información',
  'Servicios educativos especializados',
];

export function listSecopCategorias(): string[] {
  return [...CATEGORIAS_CONSULTORAS];
}

export function listSecopCiudades(): string[] {
  return [...CIUDADES_PRINCIPALES];
}

export async function fetchSecopConsultores(
  filters: SecopConsultorFilters = {},
): Promise<ConsultantCatalogItem[]> {
  const { ciudad, categoria, q, limit = 200, offset = 0 } = filters;

  const conditions: string[] = [
    "esta_activa='Si'",
    "tipo_entidad='PERSONA NATURAL COLOMBIANA'",
    "correo_electronico IS NOT NULL",
    "descripci_n_categoria_principal IS NOT NULL",
  ];

  if (ciudad) conditions.push(`ciudad='${ciudad.replace(/'/g, "''")}'`);

  if (categoria) {
    conditions.push(`descripci_n_categoria_principal='${categoria.replace(/'/g, "''")}'`);
  } else {
    const inList = CATEGORIAS_CONSULTORAS
      .map((c) => `'${c.replace(/'/g, "''")}'`)
      .join(',');
    conditions.push(`descripci_n_categoria_principal IN (${inList})`);
  }

  if (q) {
    const term = q.toUpperCase().replace(/'/g, "''");
    conditions.push(`upper(nombre_entidad) like '%${term}%'`);
  }

  const params = new URLSearchParams({
    '$select': 'nombre_entidad,nit_entidad,correo_electronico,ciudad,departamento,feacha_de_creacion,descripci_n_categoria_principal,esta_activa,tipo_entidad',
    '$where':  conditions.join(' AND '),
    '$order':  'nombre_entidad ASC',
    '$limit':  String(Math.min(limit, 1000)),
    '$offset': String(offset),
  });

  const res = await fetch(`${SOCRATA_URL}?${params}`, {
    headers: {
      Accept: 'application/json',
      ...(process.env.SOCRATA_APP_TOKEN ? { 'X-App-Token': process.env.SOCRATA_APP_TOKEN } : {}),
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`datos.gov.co (consultores) error ${res.status}: ${await res.text()}`);
  }

  const rows: SocrataPersonaRow[] = await res.json();
  return rows.filter(isClean).map(mapRow);
}
