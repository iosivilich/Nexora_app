# Implementación en Supabase: Catálogo de Consultores

> **Para futuros prompts / modelos:** este archivo documenta los cambios reales aplicados (2026-05-16) para sembrar consultores colombianos desde GitHub + SECOP, la especificación de cómo `consultants` y `consultor` se complementan, y los pendientes. Hermano de `IMPLEMENTACION_EMPRESAS_SUPABASE.md`.

---

## Especificación: `consultants` vs `consultor`

Nexora tiene **dos tablas** de consultores que coexisten por diseño, no por accidente. Entender la división es crítico antes de tocar cualquiera.

### `public.consultants` — capa **auth-linked** (UUID, RLS)

| Aspecto | Valor |
|---|---|
| PK | `id uuid` → FK a `profiles(id)` ON DELETE CASCADE |
| Existencia | Una fila ⇔ un usuario real en `auth.users` |
| RLS | Habilitada: cualquier authenticated puede SELECT; sólo el dueño puede UPDATE |
| Quién la llena | Trigger `on_auth_user_created` crea `profiles`; el flujo de signup como CONSULTOR upserta `consultants` con los datos del propio usuario |
| Quién la lee | Operaciones que requieren identidad: perfil propio, favoritos, mensajería, conexiones, citas |
| Campos | `id`, `role`, `rating`, `projects`, `experience_years`, `age`, `bio`, `expertise[]`, `verified`, `ciudad`, `updated_at` |
| Volumen actual | ~decenas (sólo usuarios registrados) |

**Para qué sirve:** todas las relaciones N:M auth-linked apuntan aquí (`favorites.consultant_profile_id`, `connections.consultant_profile_id`, `conversations.consultant_user_id`, `appointments.consultant_profile_id`). Sin `consultants`, no hay manera de favoritear o mensajear a un consultor desde la app.

### `public.consultor` — capa **catálogo/negocio** (integer, sin RLS)

| Aspecto | Valor |
|---|---|
| PK | `id_consultor serial` (integer auto-incremental) |
| Existencia | Independiente de `auth.users` — son perfiles públicos del directorio |
| RLS | No habilitada (lectura abierta a service_role y al backend; los usuarios no escriben directo) |
| Quién la llena | Carga masiva CLI (`scripts/seed-consultores.mjs`) desde GitHub + SECOP |
| Quién la lee | Directorio público de talento, página `/explorar`, búsquedas, filtros por ciudad/sector |
| Campos | `id_consultor`, `nombre`, `apellido`, `email`, `telefono`, `especialidad`, `años_experiencia`, `tarifa_referencial`, `estado`, `fecha_registro`, `ciudad`, **+ nuevos:** `avatar_url`, `bio`, `rol`, `expertise[]`, `verified`, `fuente`, `id_externo` |
| Volumen actual | **1,772 filas** (82 legacy + 1,690 SECOP cargados 2026-05-16) |

**Para qué sirve:** mostrar al visitante (autenticado o no) un catálogo grande y diverso de talento sin requerir que cada consultor sea un usuario registrado. Permite que el producto luzca poblado desde día 1.

### Cómo se vinculan

```
auth.users ─── 1:1 ──► profiles ─── 1:1 ──► consultants     (vía profiles.id = consultants.id)
                          │
                          └── soft FK via email ──► consultor (vía profiles.email = consultor.email)
                                                     OR vía profiles.consultor_id (cuando se setea)
```

El vínculo entre `profiles` y `consultor` es **por email** (no por FK rígida), implementado en [resolveBusinessRecords()](../FRONTEND/src/lib/backend-data.ts) en [backend-data.ts:862-868](../FRONTEND/src/lib/backend-data.ts#L862-L868). Cuando un usuario hace login:

1. Si tiene `profiles.consultor_id` poblado → lookup directo por integer PK.
2. Si no → lookup por `ilike('email', user.email)`, y si encuentra match, se considera "consultor verificado por catálogo".

### Cuándo modificar cada una

| Si necesitas… | Tabla |
|---|---|
| Agregar avatar/bio masivos desde una API | `consultor` |
| Que un usuario edite SU rating, bio o expertise | `consultants` |
| Mostrar consultor en página de explorar | `consultor` (vía `backend-data.ts`) |
| Crear conversación, favorito, cita | `consultants` (FK target) |
| Aplicar a un desafío como consultor | `consultor` (`aplicacion.id_consultor`) |
| Sumar nuevas categorías profesionales | `consultor.especialidad` + inferencia en `consultores-enrich.ts` |

### Por qué no se siembran las dos

Sembrar `consultants` con 1,700 filas reales requeriría crear 1,700 usuarios en `auth.users` (la FK lo exige por CASCADE). Eso:

- Genera 1,700 buzones que pueden recibir resets de contraseña.
- Aparece en el panel de Supabase Auth con cuentas no operadas.
- Si alguno se loguea por accidente o por fuga del service role, tiene acceso a la app.

El catálogo público ya se ve poblado leyendo de `consultor`, así que el costo de seguridad no se compensa. La integración mejor (deferred) es: al hacer signup como CONSULTOR, pre-rellenar `consultants` con los campos del `consultor` matcheado por email (~30 LOC, no hecho aún).

---

## Cambios aplicados (2026-05-16)

### 1. Schema — `Docs/BASE_DATOS/migrations/20260516_consultor_datos_extras.sql`
`ALTER TABLE public.consultor ADD COLUMN IF NOT EXISTS` los 7 campos nuevos:
- `avatar_url text`
- `bio text`
- `rol text`
- `expertise text[] not null default '{}'`
- `verified boolean not null default false`
- `fuente text` (`'github' | 'secop' | null`)
- `id_externo text` (login GitHub o NIT)

Más índice único NO parcial `consultor_fuente_externo_unique_idx` sobre `(fuente, id_externo)`. **El índice debe ser no-parcial** porque Postgres rechaza índices parciales como target de `ON CONFLICT` salvo que se reproduzca el predicado (y supabase-js no expone esa sintaxis). La primera versión usaba `WHERE fuente IS NOT NULL AND id_externo IS NOT NULL` y fue corregida.

### 2. Seed bulk — `Docs/BASE_DATOS/migrations/20260516_consultor_seed_bulk.sql`
200 INSERTs con `ON CONFLICT (fuente, id_externo) DO UPDATE`, generado desde `Docs/FRONTEND/src/lib/muestra-consultores.json`. Regenerable con:
```bash
cd Docs/FRONTEND && node scripts/build-consultor-seed-sql.mjs
```

### 3. Carga masiva ejecutada (resultado verificado)
```bash
cd Docs/FRONTEND && node scripts/seed-consultores.mjs --source secop --limit 2000
```
- **1,690 filas insertadas** en `public.consultor` (sumando a 82 legacy → 1,772 totales).
- ~310 omitidas por colisión en `consultor_email_key` (emails que aparecen múltiples veces como persona natural en SECOP).
- 61 ciudades únicas representadas.

El script usa estrategia **delete + insert por lote** en vez de `upsert` puro, lo cual es robusto incluso si el índice único no estuviera todavía aplicado en Supabase. Mantiene idempotencia por `(fuente, id_externo)`.

### 4. Endpoint en vivo — `Docs/FRONTEND/app/api/consultants/catalog/route.ts`
Espejo del de empresas. `Promise.allSettled` para que un fallo en GitHub (rate limit sin PAT) no rompa SECOP.

**Smoke tests pasados:**
- `GET /api/consultants/catalog?meta=1` → 200, devuelve sources + ciudades + categorías.
- `GET /api/consultants/catalog?source=secop&ciudad=BOGOTa&limit=3` → 200, 3 perfiles ricos.
- `GET /api/consultants/catalog?source=all&limit=5` → 200, mix GitHub + SECOP.

### 5. Archivos nuevos (Docs/FRONTEND)

| Path | Rol |
|---|---|
| `src/lib/consultores-enrich.ts` | Hash determinístico + `inferRol` + `inferExpertise` + DiceBear avatar |
| `src/lib/datos-gov-consultores.ts` | `fetchSecopConsultores()` — server-side, cache 1h |
| `src/lib/github-consultores.ts` | `fetchGithubConsultores()` — server-side, cache 1h |
| `src/lib/muestra-consultores.json` | 200 perfiles muestra (SECOP-only) |
| `app/api/consultants/catalog/route.ts` | Endpoint `/api/consultants/catalog` |
| `scripts/seed-consultores.mjs` | CLI bulk upsert. Flags: `--source`, `--limit`, `--dry-run`, `--out` |
| `scripts/build-consultor-seed-sql.mjs` | Genera migración SQL desde el JSON muestra |
| `scripts/check-consultor-schema.mjs` | Smoke check del schema y conteo |

### 6. Tipos extendidos — `Docs/FRONTEND/src/lib/backend-types.ts`
Nuevos: `ConsultantSource`, `ConsultantCatalogItem`, `ConsultantCatalogResponse`.

### 7. Bug fix histórico
Regex `inferExpertise`: la alternancia `/\bmobile|android|ios|flutter|react native\b/i` no agrupaba — `ios` matcheaba dentro de "servicios", contaminando el 100% de perfiles RRHH con tag `mobile`. Corregido a `/\b(mobile|android|flutter)\b|\bios\b|react native/i` en ambos archivos (TS y mjs).

---

## Próximos pasos (no hechos aún)

| Prioridad | Tarea | Esfuerzo |
|---|---|---|
| Alta | **Pre-rellenar `consultants` al signup**: cuando un usuario se registra como CONSULTOR, hacer upsert a `consultants` copiando `rol`, `bio`, `expertise`, `avatar_url` desde el `consultor` matcheado por email. Vive en flujo de signup, ~30 LOC. | ~30 min |
| Media | **Activar híbrido GitHub**: crear PAT gratis, añadir `GITHUB_PAT` a `.env.local` y Vercel, correr `seed-consultores.mjs --limit 5000` para llegar a ~5K perfiles con avatares reales. | ~10 min |
| Media | **Vincular consultor → desafíos**: las 1,690 filas no tienen aplicaciones a desafíos (la tabla `aplicacion` está vacía para ellos). Si se quiere demo de matching, sembrar aplicaciones sintéticas. | ~1 h |
| Baja | **Cross-data SECOP-contratos**: enriquecer `años_experiencia` y `projects` con el dataset `jbjy-vk9h` (SECOP II) cruzando por NIT. | ~3 h |
| Baja | **Top languages GitHub** en `expertise[]`: extra fetch a `/users/{login}/repos`. Triplica el costo API. | ~1 h |

---

## Estado de migraciones (al 2026-05-16)

| Archivo | Aplicada en prod | Notas |
|---|---|---|
| `20260420_real_social_tables.sql` | Sí (preexistente) | Tablas de favoritos, conexiones, citas, mensajes |
| `20260513_consultor_ciudad.sql` | Sí (preexistente) | Añade `ciudad` a ambas tablas |
| `20260513_empresa_datos_gov.sql` | Sí | Schema empresas para SECOP |
| `20260513_empresa_seed_bulk.sql` | Sí | 19,376 empresas |
| **`20260516_consultor_datos_extras.sql`** | **Sí, índice parcial fue corregido** | Aplicar la versión actualizada cuando se haga migración limpia |
| **`20260516_consultor_seed_bulk.sql`** | No (200 filas) | El bulk real lo hizo `seed-consultores.mjs --limit 2000` directamente; este SQL es backup para entornos sin Node |

---

## Verificación rápida

```bash
cd Docs/FRONTEND

# 1. Conteo y schema OK
node scripts/check-consultor-schema.mjs
# → SCHEMA-OK. current count: 1772

# 2. Endpoint meta
curl -s http://localhost:3030/api/consultants/catalog?meta=1 | jq

# 3. Endpoint con filtros
curl -s 'http://localhost:3030/api/consultants/catalog?source=secop&ciudad=BOGOTa&limit=3' | jq '.items[0]'

# 4. Verificar idempotencia (re-correr no duplica)
node scripts/seed-consultores.mjs --source secop --limit 100
node scripts/check-consultor-schema.mjs   # count debe ser igual o casi
```

---

## Despliegue y merge a producción (2026-05-18)

Esta sección registra cómo llegó el código a `master` (Vercel prod) para que cualquier futura iteración entienda el camino tomado y los gotchas encontrados.

### Estado inicial del repo

- Branch local `iosiv` tenía 10 commits que `origin/iosiv` no había recibido, incluyendo `f8f96f79` (integración de empresas) más todo el trabajo de consultores sin commitear.
- `master` local apuntaba a `f9048576`, dos commits adelante de la base común con `iosiv`.
- `origin/master` estaba **3 commits adicionales** más adelante, con una **migración a Clerk** (`a05cd4a7 feat: migrate auth flow to clerk`, `e6db6a58 fix: harden vercel deploy without clerk envs`, `ed5aa0e0 refactor: remove non-google login option`) que el local no había traído.

Un push directo `iosiv → master` habría sobrescrito esos 5 commits ajenos y, en particular, hubiera eliminado la migración a Clerk en producción.

### Riesgos detectados y mitigados antes de commit

| Riesgo | Cómo se manejó |
|---|---|
| `tsconfig.tsbuildinfo` staged como cambio | Unstage + añadido a `Docs/FRONTEND/.gitignore` con patrón `*.tsbuildinfo` |
| `next-env.d.ts` con cambios efímeros de `npm run dev` | Se dejó que `npm run build` lo regenerara a la forma estable; quedó sin diff |
| Docs y migraciones de empresas previas sin commitear (`FUENTE_DATOS_EMPRESAS.md`, `IMPLEMENTACION_EMPRESAS_SUPABASE.md`, `20260513_*.sql`, `muestra-empresas.json`) | Incluidos en el mismo commit que cierra la integración de consultores, ya que pertenecen a la misma cadena de trabajo |
| Secretos en archivos nuevos | Auditados: cero leakage. Solo menciones del nombre `SUPABASE_SERVICE_ROLE_KEY` en docs y scripts, nunca valores |

### Resolución de conflictos del merge

Al traer `origin/master` aparecieron 2 conflictos:

**`Docs/FRONTEND/.gitignore`** — trivial: ambas ramas habían añadido líneas distintas (tsbuildinfo vs `.clerk/`). Se combinaron sin perder ninguna.

**`Docs/FRONTEND/src/lib/backend-data.ts`** — la función `resolveBusinessRecords` divergió en su signatura:
- `iosiv` añadió un 3er parámetro `ciudad?: string | null` para que al crear un consultor sintético tome la ciudad del input en vez del `profile.city`.
- `master` cambió el 3er parámetro a `db: SupabaseClient = getDatabaseClient()` para permitir inyectar el client correcto bajo Clerk.

**Resolución:** se combinaron en una signatura de 4 parámetros que preserva ambas semánticas:

```ts
async function resolveBusinessRecords(
  profile: ProfileRow,
  email?: string | null,
  ciudad?: string | null,
  db: SupabaseClient = getDatabaseClient(),
)
```

Los 2 callsites preexistentes que pasaban `db` como 3er argumento se actualizaron a `(profile, email, null, db)` para no romper su intención.

### Validación post-merge

| Paso | Resultado |
|---|---|
| `npm install` | Trajo `@clerk/nextjs` y deps relacionadas (faltaban porque iosiv venía de antes de la migración) |
| `npx tsc --noEmit -p tsconfig.json` | Sin errores |
| `npm run test:run` | **44/44 tests pasan** (eran 41 antes del merge; master añadió 3) |
| `npm run build` | exit 0; ruta `/api/consultants/catalog` aparece junto a `/api/companies/catalog` |

### Camino final a producción

1. Commit `91fc5c4d feat: integrar GitHub + SECOP como catálogo masivo de consultores colombianos` con todos los archivos nuevos + cambios pendientes de empresas.
2. Merge `master` local (`5147c0c8`) — trivial, sólo añadía PDF y borraba assets viejos de `public/`.
3. Merge `origin/master` (`72b0970f`) — conflictos resueltos como se documentó arriba.
4. Push `iosiv` → `origin/iosiv` (commit `72b0970f`).
5. **PR abierto:** [#1 — feat: catálogo masivo de consultores colombianos (GitHub + SECOP)](https://github.com/iosivilich/Nexora_app/pull/1).

**Por qué PR y no push directo a `master`:** el flujo del equipo (CLAUDE.md) usa branches por persona y `master` para producción. Un push directo a `master` dispara deploy a Vercel sin revisión. El PR mantiene la trazabilidad y permite que el resto del equipo confirme que la migración a Clerk + la ingesta de consultores conviven sin romper auth.

### Para el próximo dev que continúe esto

- **No mergees el PR sin verificar** que `/login` y el flujo Clerk siguen funcionando en preview. La signatura de `resolveBusinessRecords` se cambió manualmente; un caso edge en el upsert de perfil podría romperse aunque tests pasen.
- Si se quiere desactivar Clerk temporalmente para validar la rama, comentar las nuevas dependencias en `app/layout.tsx`, `proxy.ts`, `src/app/context/AuthContext.tsx`, `src/app/pages/LoginPage.tsx`, `src/lib/supabase-server.ts`, `src/lib/backend-data.ts` (todos importan `@clerk/nextjs`).
- Para futuras integraciones de fuente de datos (ej. otro dataset SECOP), seguir el patrón consolidado: `src/lib/<fuente>.ts` + `app/api/<recurso>/catalog/route.ts` + `scripts/seed-<recurso>.mjs` + `Docs/BASE_DATOS/FUENTE_DATOS_<RECURSO>.md` + migración SQL en `Docs/BASE_DATOS/migrations/`.

### Incidente: workflow de Vercel fallando tras el PR

Al pushear el PR #1, el workflow `.github/workflows/vercel-deploy.yml` falló en dos etapas distintas. Se documenta aquí para que el siguiente intento no caiga en el mismo hoyo.

**Etapa 1 — `--token=` vacío:**
```
Error: No existing credentials found. Please run `vercel login` or pass "--token"
```
Causa: el secret `VERCEL_TOKEN` no existía en GitHub. Los otros dos (`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) sí estaban (creados 2026-04-22). El comando del workflow `vercel pull --token=${{ secrets.VERCEL_TOKEN }}` se renderizaba como `--token=` (cadena vacía) y Vercel CLI lo trataba como ausencia de credenciales.

Fix: crear el token en https://vercel.com/account/tokens con scope al team/cuenta donde vive el proyecto, y añadirlo como secret `VERCEL_TOKEN` en GitHub → Settings → Secrets and variables → Actions.

**Etapa 2 — token sí pero IDs incorrectos:**
```
Error: Could not retrieve Project Settings. To link your Project, remove the `.vercel` directory and deploy again.
```
Causa: con `VERCEL_TOKEN` ya configurado, la CLI autenticó pero no encontró el proyecto. Los valores antiguos de `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` apuntaban a un proyecto/team que ya no existía con esos IDs (proyecto migrado o renombrado en Vercel durante el último mes).

Fix: regenerar los IDs ejecutando localmente:
```bash
cd Docs/FRONTEND
npx vercel login
npx vercel link        # te pregunta team + proyecto, genera .vercel/project.json
cat .vercel/project.json
# → { "projectId": "prj_XXXX", "orgId": "team_YYYY" o user_YYYY }
```

Y actualizar los 3 secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) en GitHub con los valores autoritativos. **No commitear `.vercel/`** (ya está en `.gitignore`).

**Cómo validar el fix sin tocar `master`:**
1. Cualquier push a `iosiv` re-dispara el workflow `deploy-preview`. Si pasa, los 3 secrets están alineados.
2. Si no quieres push extra: `gh run rerun <RUN_ID> --repo iosivilich/Nexora_app` re-ejecuta el último run fallido con los secrets actuales.
3. Recién cuando preview pase, mergear PR #1 dispara `deploy-production` con altísima confianza.

**Aprendizaje para auditorías futuras:**
Antes de cualquier push a una rama con workflow de deploy, verificar con `gh secret list` que los 3 secrets de Vercel siguen presentes y datan de fechas coherentes con la edad del proyecto. Si el proyecto cambió de team en Vercel, los IDs viejos quedan huérfanos y el síntoma es exactamente el mismo error 2.
