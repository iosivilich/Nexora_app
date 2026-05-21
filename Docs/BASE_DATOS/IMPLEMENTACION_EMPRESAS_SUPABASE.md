# Implementación: Datos de Empresas en Supabase

> **Para futuros prompts:** Este archivo documenta todos los cambios aplicados para integrar el catálogo masivo de empresas colombianas (datos.gov.co) en la base de datos de Nexora y las modificaciones de esquema relacionadas.

---

## Resumen ejecutivo

Se integraron **19,376 empresas reales colombianas** extraídas de datos.gov.co (SECOP) en la tabla `empresa` de Supabase. Además se enriqueció el esquema con campos de ubicación y organización tanto para empresas como para consultores.

---

## 1. Enriquecimiento de la tabla `empresa`

### Migración aplicada
**Archivo:** `Docs/BASE_DATOS/migrations/20260513_empresa_datos_gov.sql`  
**Estado:** ⚠️ Pendiente de correr en Supabase SQL Editor

Esta migración hace dos cosas:

#### 1.1 Nuevas columnas en `empresa`

```sql
ALTER TABLE public.empresa
  ADD COLUMN IF NOT EXISTS nit              text,
  ADD COLUMN IF NOT EXISTS ciudad           text,
  ADD COLUMN IF NOT EXISTS departamento     text,
  ADD COLUMN IF NOT EXISTS rep_legal        text,
  ADD COLUMN IF NOT EXISTS website          text,
  ADD COLUMN IF NOT EXISTS tipo_organizacion text,
  ADD COLUMN IF NOT EXISTS es_pyme          boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS empresa_nit_unique_idx
  ON public.empresa (nit) WHERE nit IS NOT NULL;
```

El índice es parcial (solo aplica cuando `nit IS NOT NULL`) para no romper empresas existentes sin NIT.

#### 1.2 Esquema completo de `empresa` post-migración

| Columna | Tipo | Descripción |
|---|---|---|
| `id_empresa` | serial PK | Identificador interno |
| `nombre_empresa` | text | Razón social |
| `sector` | text | Sector ('General' para los importados) |
| `tamaño_empresa` | text | 'PyME' o 'Empresa' |
| `email_contacto` | text | Email de contacto |
| `telefono` | text | Teléfono |
| `descripcion` | text | Descripción |
| `estado` | text | 'activo' |
| `fecha_registro` | text | Fecha ISO |
| `nit` | text ← nuevo | NIT colombiano |
| `ciudad` | text ← nuevo | Ciudad (Bogotá, Medellín…) |
| `departamento` | text ← nuevo | Departamento |
| `rep_legal` | text ← nuevo | Representante legal |
| `website` | text ← nuevo | Sitio web |
| `tipo_organizacion` | text ← nuevo | SAS, Ltda, S.A., etc. |
| `es_pyme` | boolean ← nuevo | Si es PyME según SECOP |

---

## 2. Seed masivo de empresas

### Datos insertados
**19,376 empresas** insertadas directamente vía Supabase JS client (service role) en lotes de 50.

| Ciudad | Empresas |
|---|---|
| Medellín | 2,064 |
| Cali | 2,011 |
| Barranquilla | 1,979 |
| Bucaramanga | 1,973 |
| Cartagena | 1,949 |
| Villavicencio | 1,925 |
| Ibagué | 1,910 |
| Pereira | 1,869 |
| Pasto | 1,864 |
| Bogotá | 1,832 |
| **Total** | **19,376** |

**Nota Bogotá:** faltan letras B, C y D (timeout del API). Se pueden insertar con el script `seed_empresas.mjs` re-ejecutándolo una vez que se haya aplicado la migración de columnas.

### Cómo está protegido contra duplicados
```sql
ON CONFLICT (nit) WHERE nit IS NOT NULL DO NOTHING;
```
El `INSERT` via script usa `upsert` con `ignoreDuplicates: true` sobre `nit`. Si se corre más de una vez no se duplica nada.

### Script de seed
El script Node.js vive temporalmente en `/tmp/seed_empresas.mjs`. Si se necesita re-ejecutar, se puede regenerar desde `FUENTE_DATOS_EMPRESAS.md` + el JSON en `src/lib/muestra-empresas.json`.

Las credenciales que usa:
- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` de `Docs/FRONTEND/.env.local`

---

## 3. Ciudad en las tablas de consultores

### Problema detectado
El campo `city` existía en `profiles` pero **no** en las dos tablas propias de consultores:
- `consultants` (UUID PK, vinculada a auth)
- `consultor` (integer PK, capa de negocio)

### Migración aplicada
**Archivo:** `Docs/BASE_DATOS/migrations/20260513_consultor_ciudad.sql`  
**Estado:** ⚠️ Pendiente de correr en Supabase SQL Editor

```sql
-- Tabla consultants
ALTER TABLE public.consultants ADD COLUMN IF NOT EXISTS ciudad text;
UPDATE public.consultants c SET ciudad = p.city
FROM public.profiles p WHERE p.id = c.id AND p.city IS NOT NULL;

-- Tabla consultor  
ALTER TABLE public.consultor ADD COLUMN IF NOT EXISTS ciudad text;
UPDATE public.consultor co SET ciudad = p.city
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE lower(u.email) = lower(co.email) AND p.city IS NOT NULL;
```

La migración también **rellena `ciudad` en los registros ya existentes** cruzando con `profiles.city`.

---

## 4. Flujo de ciudad al registrarse como consultor

### Cadena completa verificada ✅

```
OnboardingRoleSelection          (recolecta city del usuario)
  └── updateProfile({ city })    (AuthContext → PUT /api/profile/me)
        └── updateProfileDetails({ city })    (backend-data.ts)
              ├── profiles.city          ← actualizado ✅
              ├── resolveBusinessRecords(..., ciudad)
              │     └── INSERT consultor { ciudad }   ← incluido desde el inicio ✅
              ├── consultants.ciudad     ← sincronizado ✅
              └── consultor.ciudad      ← sincronizado ✅
```

### Detalle del fix aplicado

**Antes (gap):** `resolveBusinessRecords` creaba el registro `consultor` sin `ciudad`. Luego `updateProfileDetails` lo actualizaba en un segundo write.

**Después (correcto):** `resolveBusinessRecords` recibe `ciudad` como tercer parámetro y lo incluye en el `INSERT` inicial. Un solo write, dato correcto desde el primer momento.

```typescript
// backend-data.ts — resolveBusinessRecords ahora recibe ciudad
async function resolveBusinessRecords(
  profile: ProfileRow,
  email?: string | null,
  ciudad?: string | null,  // ← nuevo parámetro
)

// INSERT inicial ya incluye ciudad
await db.from('consultor').insert({
  nombre, apellido, email,
  ciudad: ciudad ?? profile.city ?? null,  // ← ciudad desde el inicio
  ...
})

// Llamada desde updateProfileDetails
await resolveBusinessRecords(
  profileData,
  authUser.email,
  typeof input.city === 'string' ? input.city : null,  // ← se pasa
)
```

### Sincronización en actualizaciones de perfil
Cuando el usuario actualiza su ciudad en **Configuración → Perfil**, `updateProfileDetails` actualiza las tres tablas:

| Tabla | Campo | Actualizado |
|---|---|---|
| `profiles` | `city` | ✅ |
| `consultants` | `ciudad` | ✅ |
| `consultor` | `ciudad` | ✅ |

---

## 5. Cambios en TypeScript

### `backend-data.ts`

| Tipo / Función | Cambio |
|---|---|
| `BusinessCompanyRow` | Agrega `nit`, `ciudad`, `departamento`, `rep_legal`, `website`, `tipo_organizacion`, `es_pyme` |
| `ConsultantRow` | Agrega `ciudad: string \| null` |
| `BusinessConsultorRow` | Agrega `ciudad: string \| null` |
| `mapCompanyRecord` | Expone los 7 campos nuevos de empresa |
| `mapConsultant` | Usa `row.ciudad ?? profile.city` (prefiere la columna propia) |
| `mapConsultantRecord` | Expone `ciudad` en el objeto mapeado |
| `resolveBusinessRecords` | Acepta `ciudad` como tercer parámetro e incluye en INSERT |
| `updateProfileDetails` | Sincroniza `ciudad` en `consultants` y `consultor` al actualizar perfil |

### `backend-types.ts`

| Interfaz | Cambio |
|---|---|
| `ProfileDetails.companyRecord` | Agrega `nit`, `ciudad`, `departamento`, `repLegal`, `website`, `tipoOrganizacion`, `esPyme` |
| `ProfileDetails.consultantRecord` | Agrega `ciudad: string \| null` |

---

## 6. Pendientes para completar la integración

| Tarea | Estado |
|---|---|
| Correr `20260513_empresa_datos_gov.sql` en Supabase SQL Editor | ⚠️ Pendiente |
| Correr `20260513_consultor_ciudad.sql` en Supabase SQL Editor | ⚠️ Pendiente |
| Re-ejecutar seed para Bogotá letras B, C, D (timeout) | Opcional |
| Exponer `ciudad` como filtro en `/explorar` | Pendiente |
| Corregir bug en `route.ts`: `ciiu` no existe en `CatalogFilters` | Pendiente |
