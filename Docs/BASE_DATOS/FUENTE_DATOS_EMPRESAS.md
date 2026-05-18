# Fuente de Datos: Catálogo de Empresas Colombianas (datos.gov.co)

> **Para futuros prompts / modelos:** Este archivo describe cómo obtener, filtrar, autenticar y enriquecer el catálogo masivo de empresas colombianas integrado en Nexora. Es la fuente principal de datos del lado B2B (Empresas).

---

## ¿Qué es esta fuente?

**Dataset:** Registro de Proveedores del SECOP (Sistema Electrónico de Contratación Pública)
**Entidad:** Colombia Compra Eficiente  
**Portal:** [datos.gov.co](https://www.datos.gov.co)  
**Protocolo:** Socrata Open Data API (SODA 2.0)  
**Endpoint base:**
```
https://www.datos.gov.co/resource/4ex9-j3n8.json
```

### Volumen de datos (verificado 2026-05-08)

| Conjunto | Registros |
|---|---|
| Total en el dataset | 2,007,391 |
| Empresas activas (`esta_activa = 'Si'`) | 1,992,038 |
| Activas, sin Consorcios/Uniones Temporales | 1,737,379 |
| Con nombre real + email + ciudad principal | **~624,801** ← útiles para Nexora |

**El dataset se actualiza en tiempo real** (`X-SODA2-Truth-Last-Modified` cambia cada consulta).

---

## Autenticación — App Token (configurado)

Sin token: límite de ~1,000 requests/hora (Socrata no autenticado).  
Con token: ilimitado.

**El token de Nexora ya está registrado y configurado** (2026-05-08):

- Variable de entorno: `SOCRATA_APP_TOKEN` en `Docs/FRONTEND/.env.local`
- Se envía automáticamente como header `X-App-Token` en cada request desde `fetchCatalog()`
- Para producción: agregar `SOCRATA_APP_TOKEN` en Vercel → Settings → Environment Variables

```bash
# Header que se envía en cada consulta:
X-App-Token: <valor de SOCRATA_APP_TOKEN>
```

Si el token caduca o se revoca, crear uno nuevo en [datos.gov.co](https://www.datos.gov.co) → perfil → App Tokens, y actualizar `.env.local` y Vercel.

---

## Esquema del dataset (todos los campos extraídos)

| Campo Socrata | Tipo | Descripción |
|---|---|---|
| `nombre_entidad` | string | Razón social |
| `nit_entidad` | string | NIT (puede contener basura, ver sección calidad) |
| `correo_electronico` | string | Email de contacto |
| `nombre_representante_legal` | string | Nombre del rep. legal |
| `ciudad` | string | Ciudad (encoding especial, ver tabla abajo) |
| `departamento` | string | Departamento |
| `tipo_entidad` | string | Tipo jurídico (SAS, Ltda, Persona Natural…) |
| `es_pyme` | string | `'SI'` o `'NO'` (no es booleano) |
| `esta_activa` | string | `'Si'` o `'No'` (no es booleano) |
| `website` | string | URL o `'No Provisto'` |
| `codigo_categoria_principal` | string | Código UNSPSC de la categoría de contratación (≠ CIIU). Solo en ~3.5% de registros |
| `descripci_n_categoria_principal` | string | Descripción de la categoría de contratación. Ej: `"Servicios informáticos"` |

### Encoding de ciudades (importante)

El dataset usa tildes codificadas de forma no estándar. Usar los nombres exactos en los filtros `$where`:

| En el dataset | Mostrar como |
|---|---|
| `BOGOTa` | Bogotá |
| `MEDELLiN` | Medellín |
| `CALI` | Cali |
| `BARRANQUILLA` | Barranquilla |
| `CARTAGENA` | Cartagena |
| `BUCARAMANGA` | Bucaramanga |
| `IBAGUe` | Ibagué |
| `PEREIRA` | Pereira |
| `PASTO` | Pasto |
| `VILLAVICENCIO` | Villavicencio |

### Distribución por ciudad (empresas activas)

| Ciudad | Activas |
|---|---|
| Bogotá | 311,743 |
| Medellín | 65,666 |
| Cali | 47,793 |
| Barranquilla | 42,277 |
| Cartagena | 34,549 |
| Bucaramanga | 30,760 |

---

## Sector / Actividad económica — cómo se infiere

### El problema con CIIU en Colombia

El SECOP **no tiene CIIU** (Clasificación Industrial Internacional Uniforme). Los campos disponibles son:

| Fuente | ¿Tiene CIIU? | ¿Acceso programático gratuito? |
|---|---|---|
| SECOP (`codigo_categoria_principal`) | No — son códigos UNSPSC de contratación | Sí, pero solo en el **3.5%** de registros |
| RUES (Confecámaras) | Sí, oficial | No — SPA sin API JSON pública |
| DIAN | Sí | No — formulario web con CAPTCHA |
| Google Search | Aproximado | No — ToS + CAPTCHA en volumen |

**Conclusión:** no hay fuente gratuita con CIIU por NIT en Colombia sin registro de API pago.

### Estrategia implementada en Nexora: dos capas

**Capa 1 — SECOP directo** (3.5% de cobertura)  
Cuando `descripci_n_categoria_principal` está poblado (ej: `"Servicios informáticos"`), se usa ese valor directamente como sector.

**Capa 2 — Inferencia por palabras clave** (fallback para el 96.5%)  
Se analiza el `nombre_entidad` con regex para asignar un sector aproximado:

| Palabras clave en el nombre | Sector asignado |
|---|---|
| SOFTWARE, TECNOLOG, DIGITAL, SISTEMAS, INFORM, DATOS, CLOUD, IA | Tecnología y Software |
| CONSULT, ASESOR, ESTRATEGI, GERENCIA, MANAGEMENT | Consultoría Empresarial |
| INGENIER, CONSTRUC, INFRAESTRUCTURA, ARQUITECT, OBRAS | Ingeniería y Construcción |
| PUBLICIDAD, MARKETING, MEDIOS, COMUNICAC, CREATIV, DISEÑO | Publicidad y Marketing |
| SALUD, MEDIC, CLINIC, HOSPITAL, FARMAC, IPS | Salud |
| EDUCA, CAPACITA, FORMACI, COLEGIO, UNIVERSIDAD | Educación |
| FINANC, INVERS, CAPITAL, CREDITO, LEASING, FIDUCI | Servicios Financieros |
| LOGISTIC, TRANSPORT, CARGA, FLOTA, DISTRIBUCI | Logística y Transporte |
| ALIMENT, RESTAURANT, CATERING, COMIDA, BEBIDA | Alimentos y Bebidas |
| INMOBILI, FINCA RAIZ, ARREND, PROPIEDAD | Inmobiliaria |
| METALIC, ACERO, HIERRO, MANUFACTUR, INDUSTRI, PRODUCC | Manufactura e Industria |
| LEGAL, JURIDIC, ABOGAD, DERECHO | Servicios Jurídicos |
| RECURSOS HUMANOS, SELECCION, TALENTO, HEADHUNTING | Recursos Humanos |
| SEGURIDAD, VIGILANCIA, CUSTODIA | Seguridad |
| AGRO, AGRICOL, GANADERI, PECUARI | Agropecuario |
| TURISMO, HOTEL, VIAJES, HOSPEDAJE | Turismo y Hotelería |
| ENERGIA, ELECTRI, GAS, PETROLEO, MINERIA | Energía y Minería |

Si no hay coincidencia, `sector` queda como `''` (string vacío).

Esta lógica vive en `inferSector()` dentro de `datos-gov.ts`. Para mejorar la cobertura en el futuro, agregar más reglas a `KEYWORD_SECTOR`.

---

## Calidad de datos y cómo limpiarlos

### Filtros obligatorios en Socrata

```sql
-- Solo activas
esta_activa = 'Si'

-- Excluir tipos con datos sucios
tipo_entidad NOT IN ('CONSORCIO', 'UNIoN TEMPORAL')

-- Nombre que empiece con letra
upper(nombre_entidad) like 'A%'   -- ajustar por rango

-- Email presente
correo_electronico IS NOT NULL
```

### Validación adicional en código

```python
import re

GARBAGE_NAME = re.compile(r'^[^A-Za-záéíóúÁÉÍÓÚñÑ]')
FAKE_NITS = {'No Definido', '0', '00', '000', '0000', '00000', '-', 'No Provisto'}

def is_clean(row: dict) -> bool:
    name = (row.get('nombre_entidad') or '').strip()
    nit  = (row.get('nit_entidad')    or '').strip()
    if GARBAGE_NAME.match(name): return False
    if nit in FAKE_NITS:         return False
    if len(nit) < 6:             return False
    return True
```

### Tipos de entidad recomendados para Nexora

```
SOCIEDAD POR ACCIONES SIMPLIFICADA          ← mayoría de empresas tech/consultoría
SOCIEDAD ANONIMA ABIERTA COLOMBIANA         ← S.A. grandes
SOCIEDAD DE RESPONSABILIDAD LIMITADA COLOMBIANA
ENTIDADES SIN ANIMO DE LUCRO
PERSONA NATURAL COLOMBIANA
OTRO
```

---

## Cómo consultar el API

### Básico con token

```bash
curl "https://www.datos.gov.co/resource/4ex9-j3n8.json?\
$select=nombre_entidad,nit_entidad,correo_electronico,ciudad,tipo_entidad,es_pyme,esta_activa,website,codigo_categoria_principal,descripci_n_categoria_principal\
&$where=esta_activa='Si' AND ciudad='BOGOTa' AND tipo_entidad='SOCIEDAD POR ACCIONES SIMPLIFICADA'\
&$order=nombre_entidad ASC\
&$limit=100" \
-H "Accept: application/json" \
-H "X-App-Token: <SOCRATA_APP_TOKEN>"
```

### Contar total antes de extraer

```bash
curl "https://www.datos.gov.co/resource/4ex9-j3n8.json?\
$select=count(*)\
&$where=esta_activa='Si' AND tipo_entidad NOT IN ('CONSORCIO','UNIoN TEMPORAL')" \
-H "X-App-Token: <SOCRATA_APP_TOKEN>"
```

### Paginación masiva (Python)

```python
import requests

BASE      = "https://www.datos.gov.co/resource/4ex9-j3n8.json"
PAGE_SIZE = 50_000   # máximo práctico probado — responde en ~1.2s

def fetch_all(city: str, token: str) -> list[dict]:
    results, offset = [], 0
    while True:
        params = {
            "$select": (
                "nombre_entidad,nit_entidad,correo_electronico,"
                "nombre_representante_legal,ciudad,departamento,"
                "tipo_entidad,es_pyme,esta_activa,website,"
                "codigo_categoria_principal,descripci_n_categoria_principal"
            ),
            "$where":  f"esta_activa='Si' AND ciudad='{city}' AND tipo_entidad NOT IN ('CONSORCIO','UNIoN TEMPORAL')",
            "$order":  "nombre_entidad ASC",
            "$limit":  PAGE_SIZE,
            "$offset": offset,
        }
        rows = requests.get(BASE, params=params, headers={
            "Accept": "application/json",
            "X-App-Token": token,
        }).json()
        if not rows:
            break
        results.extend(rows)
        offset += PAGE_SIZE
    return results
```

---

## Rendimiento medido (2026-05-08)

| Tamaño de página | Tiempo respuesta | Peso aprox. |
|---|---|---|
| 1,000 filas | ~0.78 s | 135 KB |
| 5,000 filas | ~0.97 s | 378 KB |
| 50,000 filas | ~1.20 s | 3.7 MB |
| 10,000 en bloques de 1K (secuencial) | ~8.1 s total | — |

Extraer las ~624K empresas limpias: ~13 peticiones × 1.2s ≈ **16 segundos totales**.

---

## Integración en Nexora — archivos y responsabilidades

| Archivo | Qué hace |
|---|---|
| `Docs/FRONTEND/src/lib/datos-gov.ts` | `fetchCatalog()` + `inferSector()` + constantes de ciudades |
| `Docs/FRONTEND/app/api/companies/catalog/route.ts` | Route Next.js `/api/companies/catalog` — acepta `q`, `ciudad`, `tipo`, `limit`, `offset` |
| `Docs/FRONTEND/src/lib/api.ts` | `fetchCompaniesCatalog()` — wrapper del lado cliente |
| `Docs/FRONTEND/src/lib/backend-types.ts` | Tipos: `CompanyCatalogItem`, `CompanyCatalogResponse` |
| `Docs/FRONTEND/.env.local` | `SOCRATA_APP_TOKEN` (no commitear) |
| `Docs/FRONTEND/src/lib/muestra-empresas.json` | 200 registros limpios para tests/demos/seed |

### Tipo TypeScript de un registro (estado actual)

```typescript
interface CompanyCatalogItem {
  nit:              string;   // NIT de la empresa
  razonSocial:      string;   // Nombre legal
  ciudad:           string;   // Normalizado: "Bogotá", no "BOGOTa"
  departamento:     string;
  ciiu:             string;   // codigo_categoria_principal del SECOP (UNSPSC, no CIIU real). Vacío en el 96.5%
  sector:           string;   // Inferido: SECOP donde existe, keywords como fallback
  activos:          number;   // Siempre 0 (no disponible en SECOP)
  tipoOrganizacion: string;   // tipo_entidad: "SOCIEDAD POR ACCIONES SIMPLIFICADA", etc.
  email:            string;
  repLegal:         string;
  esPyme:           boolean;
  activa:           boolean;
  website:          string;   // '' si "No Provisto"
}
```

### Caché Next.js

`fetchCatalog()` usa `next: { revalidate: 3600 }` — cada consulta única se cachea 1 hora. No golpea el API en cada request de usuario.

---

## Para modelos / análisis futuros

### Features disponibles para ML

| Feature | Campo en `CompanyCatalogItem` | Útil para |
|---|---|---|
| Sector económico | `sector` | Matching con consultores por especialidad |
| Tamaño empresa | `esPyme` | Segmentación de clientes |
| Ciudad | `ciudad` | Matching regional |
| Tipo jurídico | `tipoOrganizacion` | Perfil empresa (startup SAS vs S.A. grande) |
| Madurez digital | `website != ''` | Scoring de potencial |
| Email corporativo | dominio de `email` (no gmail/hotmail) | Scoring de seriedad |
| Rep. legal | `repLegal` | Enriquecimiento de perfil de contacto |

### Lo que NO está disponible (limitaciones permanentes del SECOP)

- **CIIU real** — para obtenerlo cruzar el NIT con RUES (requiere API pago de Confecámaras)
- **Número de empleados**
- **Ingresos o activos** (existían en versiones anteriores del SECOP, ya no están)
- **Fecha de constitución** (existe `feacha_de_creacion` pero es fecha de registro en SECOP, no constitución legal)
- **Teléfono**

---

## Muestra de referencia

`Docs/FRONTEND/src/lib/muestra-empresas.json` — 200 registros limpios y normalizados.

| Métrica | Valor |
|---|---|
| Con email | 200/200 (100%) |
| Con website | 62/200 (31%) |
| Son PyMEs | 133/200 (66%) |
| Bogotá | 116 |
| Medellín | 31 |
| Cali | 20 |
| Barranquilla | 14 |
| Bucaramanga | 10 |
| Cartagena | 9 |
