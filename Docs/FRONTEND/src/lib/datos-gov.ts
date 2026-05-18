import type { CompanyCatalogItem } from './backend-types';

// Dataset nacional: 2M empresas — Colombia Compra Eficiente (SECOP)
const SOCRATA_URL = 'https://www.datos.gov.co/resource/4ex9-j3n8.json';

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

// Inferencia de sector por palabras clave en el nombre de la empresa.
// Fuente: RUES y CIIU no tienen API pública gratuita; el campo
// descripci_n_categoria_principal del SECOP solo cubre ~3.5% de empresas.
const KEYWORD_SECTOR: Array<[RegExp, string]> = [
  [/SOFTWARE|TECNOLOG|DIGITAL|SISTEMAS|INFORM[AÁ]TIC|DATOS|CLOUD|IA\b|INTELIG/i, 'Tecnología y Software'],
  [/CONSULT|ASESOR|ESTRATEGI|GERENCIA|MANAGEMENT/i,                               'Consultoría Empresarial'],
  [/INGENIER|CONSTRUC|INFRAESTRUCTURA|ARQUITECT|OBRAS/i,                          'Ingeniería y Construcción'],
  [/PUBLICIDAD|MARKETING|MEDIOS|COMUNICAC|CREATIV|DISEÑO/i,                       'Publicidad y Marketing'],
  [/SALUD|MEDIC|CLINIC|HOSPITAL|FARMAC|IPS\b/i,                                   'Salud'],
  [/EDUCA|CAPACITA|FORMACI|COLEGIO|UNIVERSIDAD|INSTITUTO/i,                       'Educación'],
  [/FINANC|INVERS|CAPITAL|CREDITO|LEASING|FIDUCI/i,                              'Servicios Financieros'],
  [/LOGISTIC|TRANSPORT|CARGA|FLOTA|DISTRIBUCI/i,                                  'Logística y Transporte'],
  [/ALIMENT|RESTAURANT|CATERING|COMIDA|BEBIDA/i,                                  'Alimentos y Bebidas'],
  [/INMOBILI|FINCA RAIZ|ARREND|PROPIEDAD|BIENES RAICES/i,                         'Inmobiliaria'],
  [/METALIC|ACERO|HIERRO|MANUFACTUR|INDUSTRI|PRODUCC/i,                           'Manufactura e Industria'],
  [/LEGAL|JURIDIC|ABOGAD|DERECHO/i,                                               'Servicios Jurídicos'],
  [/RECURSOS HUMANOS|SELECCION|TALENTO|HEADHUNTING/i,                             'Recursos Humanos'],
  [/SEGURIDAD|VIGILANCIA|CUSTODIA/i,                                               'Seguridad'],
  [/AGRO|AGRICOL|GANADERI|PECUARI|CAMPO/i,                                        'Agropecuario'],
  [/TURISMO|HOTEL|VIAJES|HOSPEDAJE/i,                                              'Turismo y Hotelería'],
  [/ENERGIA|ELECTRI|GAS\b|PETROLEO|MINERIA|CARBON/i,                             'Energía y Minería'],
];

function inferSector(nombre: string, actividadSecop: string): string {
  if (actividadSecop) return actividadSecop;
  for (const [re, sector] of KEYWORD_SECTOR) {
    if (re.test(nombre)) return sector;
  }
  return '';
}

// Nombres exactos de ciudad en el dataset (encoding especial)
export const CIUDADES_PRINCIPALES = [
  'BOGOTa',
  'MEDELLiN',
  'CALI',
  'BARRANQUILLA',
  'CARTAGENA',
  'BUCARAMANGA',
  'IBAGUe',
  'VILLAVICENCIO',
  'PEREIRA',
  'PASTO',
];

export const CIUDAD_DISPLAY: Record<string, string> = {
  'BOGOTa':        'Bogotá',
  'MEDELLiN':      'Medellín',
  'CALI':          'Cali',
  'BARRANQUILLA':  'Barranquilla',
  'CARTAGENA':     'Cartagena',
  'BUCARAMANGA':   'Bucaramanga',
  'IBAGUe':        'Ibagué',
  'VILLAVICENCIO': 'Villavicencio',
  'PEREIRA':       'Pereira',
  'PASTO':         'Pasto',
};

export type CatalogFilters = {
  q?:          string;
  ciudad?:     string;
  tipo?:       string;
  soloActivas?: boolean;
  soloPymes?:  boolean;
  limit?:      number;
  offset?:     number;
};

type SocrataRow = {
  nombre_entidad?:                    string;
  nit_entidad?:                       string;
  correo_electronico?:                string;
  nombre_representante_legal?:        string;
  ciudad?:                            string;
  departamento?:                      string;
  tipo_entidad?:                      string;
  es_pyme?:                           string;
  esta_activa?:                       string;
  website?:                           string;
  descripci_n_categoria_principal?:   string;
  codigo_categoria_principal?:        string;
};

const EMPTY = new Set(['No Definido', 'No Provisto', '-', '.', '']);

function clean(v?: string): string {
  const t = v?.trim() ?? '';
  return EMPTY.has(t) ? '' : t;
}

function mapRow(r: SocrataRow): CompanyCatalogItem {
  const ciudad     = r.ciudad ?? '';
  const nombre     = clean(r.nombre_entidad);
  const actividadSecop = clean(r.descripci_n_categoria_principal);
  return {
    nit:              clean(r.nit_entidad),
    razonSocial:      nombre,
    ciudad:           CIUDAD_DISPLAY[ciudad] ?? ciudad,
    departamento:     clean(r.departamento),
    ciiu:             clean(r.codigo_categoria_principal),
    sector:           inferSector(nombre, actividadSecop),
    activos:          0,
    tipoOrganizacion: clean(r.tipo_entidad),
    email:            clean(r.correo_electronico),
    repLegal:         clean(r.nombre_representante_legal),
    esPyme:           r.es_pyme === 'SI',
    activa:           r.esta_activa === 'Si',
    website:          r.website !== 'No Provisto' ? clean(r.website) : '',
  } as CompanyCatalogItem;
}

export async function fetchCatalog(filters: CatalogFilters = {}): Promise<CompanyCatalogItem[]> {
  const {
    q,
    ciudad,
    tipo,
    soloActivas = true,
    soloPymes,
    limit  = 100,
    offset = 0,
  } = filters;

  const conditions: string[] = [];

  if (soloActivas) conditions.push("esta_activa='Si'");
  if (soloPymes)   conditions.push("es_pyme='SI'");
  if (ciudad)      conditions.push(`ciudad='${ciudad}'`);

  if (tipo) {
    conditions.push(`tipo_entidad='${tipo}'`);
  } else {
    // Por defecto excluir Consorcios y Uniones Temporales (datos sucios)
    conditions.push(`tipo_entidad NOT IN ('CONSORCIO','UNIoN TEMPORAL')`);
  }

  if (q) {
    const term = q.toUpperCase().replace(/'/g, "''");
    conditions.push(`upper(nombre_entidad) like '%${term}%'`);
  }

  const params = new URLSearchParams({
    '$select': 'nombre_entidad,nit_entidad,correo_electronico,nombre_representante_legal,ciudad,departamento,tipo_entidad,es_pyme,esta_activa,website,codigo_categoria_principal,descripci_n_categoria_principal',
    '$where':  conditions.length ? conditions.join(' AND ') : 'esta_activa=\'Si\'',
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
    throw new Error(`datos.gov.co error ${res.status}: ${await res.text()}`);
  }

  const rows: SocrataRow[] = await res.json();
  return rows.map(mapRow);
}
