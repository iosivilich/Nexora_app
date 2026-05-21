# Fuente de Datos: Catálogo de Consultores Colombianos

> **Para futuros prompts / modelos:** este archivo describe las APIs gratuitas usadas para poblar la tabla `consultor` con consultores reales de Colombia, su mapeo a campos, y el enriquecimiento determinístico de campos no disponibles. Hermano de `FUENTE_DATOS_EMPRESAS.md`.

---

## Fuentes activas

### Primaria — SECOP (datos.gov.co, dataset `4ex9-j3n8`)
Mismo dataset que empresas, filtrado a personas individuales registradas como proveedores del Estado.

**Filtro aplicado:**
```sql
esta_activa = 'Si'
AND tipo_entidad = 'PERSONA NATURAL COLOMBIANA'
AND correo_electronico IS NOT NULL
AND descripci_n_categoria_principal IN (
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
  'Servicios educativos especializados'
)
```

**Volumen útil verificado (2026-05-16):** ~5,800 perfiles con categoría profesional y email. De los 1.25M `PERSONA NATURAL COLOMBIANA` totales, ~99% tienen categoría `No Definido` (no son consultores en sentido marketplace) y se excluyen.

**Auth:** Reusa `SOCRATA_APP_TOKEN` de `.env.local`. Sin token, 1K req/h; con token, ilimitado.

### Secundaria — GitHub Users API
Para perfiles tech con avatar y bio reales.

**Endpoint:** `GET https://api.github.com/search/users?q=location:colombia+type:user&per_page=100`
**Detalle por usuario:** `GET https://api.github.com/users/{login}`

**Volumen disponible (2026-05-16):** 68,961 usuarios con `location:colombia` (variable, GitHub indexa en vivo).

**Auth:** Variable de entorno `GITHUB_PAT` (opcional pero recomendado).
- Sin PAT: 60 req/h → solo alcanza ~25 perfiles enriquecidos por hora.
- Con PAT: 5,000 req/h → ~2,400 perfiles/h. Crear gratis en github.com → Settings → Developer settings → permiso `public_repo:read`.

### Sintética — generación determinística
Campos que ninguna fuente provee (teléfono, edad, tarifa, rating) se calculan vía hash `cyrb53(id_externo)`. Mismo input → mismo output: el seed es reproducible.

Vive en [Docs/FRONTEND/src/lib/consultores-enrich.ts](../FRONTEND/src/lib/consultores-enrich.ts).

| Campo | Rango | Método |
|---|---|---|
| `telefono` | `+57 3XX XXX XXXX` | `hash('phone', id) mod 10⁹`, formateado |
| `edad` | 25–54 años | `25 + hash('age', id) mod 30` |
| `tarifa_referencial` | 80K–300K COP/h | `80000 + hash('rate', id) mod 221 × 1000` |
| `rating` | 3.8–5.0 (1 decimal) | `3.8 + (hash('rating', id) mod 13) / 10` |
| `avatar_url` (sólo SECOP) | DiceBear initials | `api.dicebear.com/9.x/initials/svg?seed={nombre}` |

---

## Mapeo de campos por fuente

### Tabla destino: `public.consultor`

| Campo en `consultor` | GitHub | SECOP |
|---|---|---|
| `nombre`, `apellido` | parse de `name` (últimas 2 palabras = apellidos) | parse de `nombre_entidad` |
| `email` | `email` (a veces null) | `correo_electronico` (lowercase) |
| `telefono` | sintético | sintético |
| `especialidad` | igual a `rol` | `descripci_n_categoria_principal` |
| `años_experiencia` | `today − year(created_at)`, cap 25 | `1 + hash mod 20` |
| `tarifa_referencial` | sintético | sintético |
| `estado` | `hireable ? 'disponible' : 'ocupado'` | `'disponible'` |
| `fecha_registro` | `created_at` | `feacha_de_creacion` |
| `ciudad` | parse de `location` con whitelist regex | normalización SECOP (CIUDAD_DISPLAY) |
| `departamento` | `''` (no disponible) | título-case de `departamento` |
| `avatar_url` | `avatar_url` (real) | DiceBear determinístico |
| `bio` | `bio` real (recortado) | construido: `"{rol} con sede en {ciudad}, especializado en {categoría}"` |
| `rol` | `inferRol({ bio })` con KEYWORDS_BIO | `inferRol({ categoria })` con ROL_DESDE_CATEGORIA |
| `expertise[]` | `inferExpertise({ bio })` por tags | `inferExpertise({ categoria })` por tags |
| `verified` | `false` (cuenta pública pero no validada por el Estado) | `true` (registrado en SECOP) |
| `fuente` | `'github'` | `'secop'` |
| `id_externo` | `login` | `nit_entidad` |

### Inferencia de `rol`

**Desde categoría SECOP** (regex sobre `descripci_n_categoria_principal`):
| Categoría matchea | Rol asignado |
|---|---|
| recursos humanos / selección / talento | Consultor de Talento |
| asesoría de gestión / administración | Consultor de Estrategia |
| legales / jurídico | Abogado Corporativo |
| ingeniería / arquitectura | Ingeniero Consultor |
| informáticos / software / datos | Desarrollador / Ingeniero de Datos |
| contabilidad / auditor | Contador Público |
| salud / médic | Consultor de Salud |
| publicidad / marketing / comunicación | Especialista en Marketing |
| educación / formación | Consultor en Educación |
| medioambient | Consultor Ambiental |

**Desde bio GitHub** (regex sobre `bio`):
| Bio matchea | Rol asignado |
|---|---|
| react / next.js / frontend | Frontend Developer |
| node.js / backend / api | Backend Developer |
| full stack | Full Stack Developer |
| devops / sre / kubernetes / docker / aws / gcp / azure | DevOps / Cloud Engineer |
| data science / data engineer / ml / ia / ai | Data / AI Specialist |
| ux / ui / product design | UX / UI Designer |
| mobile / android / ios / flutter / react native | Mobile Developer |
| qa / tester / quality | QA Engineer |
| security / pentest | Security Specialist |
| product manager | Product Manager |

Fallback: `'Consultor Profesional'` (SECOP) o `'Software Engineer'` (GitHub).

### Inferencia de `expertise[]`
Hasta 8 tags por perfil. Tabla completa en [consultores-enrich.ts](../FRONTEND/src/lib/consultores-enrich.ts) `EXPERTISE_TAGS`. Ejemplos: `react`, `nodejs`, `typescript`, `python`, `aws`, `docker`, `sql`, `data`, `ia`, `devops`, `ux`, `mobile`, `rrhh`, `legal`, `contabilidad`, `marketing`, `finanzas`, `ingenieria`, `salud`.

**Bug histórico:** la primera versión usaba `/\bmobile|android|ios|flutter|react native\b/i` sin agrupar la alternancia; `ios` matcheaba dentro de "servicios" y contaminaba el 100% de los perfiles RRHH. Fix: `/\b(mobile|android|flutter)\b|\bios\b|react native/i`. Aplicado en `consultores-enrich.ts` y `scripts/seed-consultores.mjs`.

---

## Calidad de datos

### Filtros de limpieza (`isClean`)
Aplicados en `datos-gov-consultores.ts` y en el script bulk:

```javascript
const GARBAGE_NAME = /^[^A-Za-záéíóúÁÉÍÓÚñÑ]/;
const FAKE_NITS = new Set(['No Definido','0','00','000','0000','00000','-','No Provisto']);

if (!nombre || GARBAGE_NAME.test(nombre)) reject;   // empieza con número/símbolo
if (!nit || FAKE_NITS.has(nit) || nit.length < 6) reject;
if (!email) reject;
```

**Para GitHub:**
- `type !== 'User'` (filtra organizaciones)
- ni `name` ni `bio` poblados → descarta
- `parseCiudadFromLocation(location)` con whitelist de 14 ciudades colombianas; si no matchea, `ciudad = ''`

### Resultado de la primera carga (2026-05-16)
| Métrica | Valor |
|---|---|
| Insertados de SECOP | 1,690 |
| Omitidos por `consultor_email_key` duplicado | ~310 |
| Ciudades únicas | 61 |
| `verified = true` | 1,690 (100% de los nuevos) |
| Categorías representadas | 11 de 13 (Servicios de información y educativos especializados < 50 cada uno) |

---

## Cómo ejecutar el bulk seed

```bash
cd Docs/FRONTEND

# Solo SECOP (no requiere GITHUB_PAT, rápido):
node scripts/seed-consultores.mjs --source secop --limit 2000

# Híbrido GitHub + SECOP (70/30, requiere GITHUB_PAT):
node scripts/seed-consultores.mjs --limit 5000

# Dry-run + exportar a JSON sin tocar BD:
node scripts/seed-consultores.mjs --source secop --limit 200 --dry-run --out src/lib/muestra-consultores.json

# Regenerar la migración bulk SQL desde el JSON:
node scripts/build-consultor-seed-sql.mjs
```

**Variables requeridas en `.env.local`:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (bypasea RLS — sólo para el script CLI)
- `SOCRATA_APP_TOKEN` (recomendado)
- `GITHUB_PAT` (opcional, solo si `--source github` o `all`)

---

## Endpoint en vivo

`GET /api/consultants/catalog` (espejo del de empresas).

| Query | Comportamiento |
|---|---|
| `?meta=1` | Devuelve `{ sources, ciudades, categorias }` para poblar UI de filtros |
| `?source=github\|secop\|all` | Selección de fuente. Default: `all` (Promise.allSettled) |
| `?ciudad=BOGOTa` | Filtro (usa el encoding SECOP en SECOP, parser de location en GitHub) |
| `?q=marketing` | Búsqueda libre por nombre/bio |
| `?limit=30&offset=0` | Paginación. Default: 30 |

Cache: `next: { revalidate: 3600 }` en cada fetch — una consulta única se cachea 1h.

**Resiliencia:** si una fuente cae (rate limit, 5xx), `Promise.allSettled` deja pasar la otra. Logs en consola del server.

---

## Limitaciones conocidas (sin solución gratuita)

- **Email/teléfono real de GitHub:** la mayoría de cuentas tienen `email: null` por privacidad. El teléfono nunca se expone.
- **Edad real:** ninguna fuente la da. Sintética siempre.
- **Rating real:** no hay sistema de reviews externo cruzable por nombre.
- **CIIU del consultor:** SECOP usa UNSPSC (categoría de contratación), no CIIU.
- **Tarifa real:** los contratos SECOP tienen valor pero asociarlos por persona requiere otro dataset y ETL adicional (deferred).

---

## Para modelos / análisis futuros

Si se quiere extender:

1. **Cruzar contratos SECOP** (`jbjy-vk9h` para SECOP II) para inferir `años_experiencia` real (fecha del primer contrato → hoy) y `projects` real (count de contratos). ~30 min de ETL adicional.
2. **Top languages de GitHub** vía `GET /users/{login}/repos?sort=updated&per_page=10` para enriquecer `expertise[]`. Triplica el costo de API; sólo activar si calidad actual no convence.
3. **Stack Overflow** para reputación. API no filtra por país: hay que descargar miles y filtrar por `location`. Costo/beneficio bajo.
