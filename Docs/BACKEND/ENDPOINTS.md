# Nexora App - Endpoints Backend

Documentacion actualizada de los endpoints disponibles en la capa backend de Next.js.

## Criterio de implementacion

Hoy convivimos con tres fuentes de datos:

1. **Supabase Auth + `profiles` + `consultants`**
   Usado por el frontend actual y por la sesion autenticada.
2. **Tablas de negocio**
   `empresa`, `consultor`, `desafio`, `postulacion`, `contrato`, `calificacion`.
3. **Tablas sociales dedicadas**
   `user_settings`, `favorites`, `connections`, `conversations`, `direct_messages` y `appointments`.

## Rutas implementadas

### Directorio y dashboard

| Ruta | Metodo | Backing | Descripcion |
|---|---|---|---|
| `/api/consultants` | `GET` | `consultants` + `profiles` | Lista y filtra consultores. Soporta `limit`, `search`, `category`, `minRating`, `minExperience`, `city`, `minProjects`, `maxAge`, `featured`, `verified`. |
| `/api/companies` | `GET` | `profiles` | Lista empresas visibles en el directorio. |
| `/api/dashboard` | `GET` | `consultants` + `profiles` | Snapshot de metricas para Home: conteos, rating promedio, destacados y ciudades. |

### Desafios y postulaciones

| Ruta | Metodo | Backing | Descripcion |
|---|---|---|---|
| `/api/challenges` | `GET` | `desafio` + `postulacion` | Lista desafios. Soporta `idEmpresa`, `status`, `mode`, `limit`. |
| `/api/challenges` | `POST` | `desafio` | Crea un desafio con `idEmpresa`, `title`, `description`, `specialty`, `budget`, `mode`, `status`. |
| `/api/applications` | `GET` | `postulacion` + `desafio` + `empresa` | Lista postulaciones. Soporta `idConsultor`, `idDesafio`, `status`. |
| `/api/applications` | `POST` | `postulacion` | Crea una postulacion con `idDesafio`, `idConsultor`, `coverLetter`, `proposedBudget`, `status`. |

### Perfil y configuracion

| Ruta | Metodo | Backing | Descripcion |
|---|---|---|---|
| `/api/profile/me` | `GET` | `profiles` + `consultants` + `user_settings` + vinculo persistido a `empresa`/`consultor` | Devuelve el perfil enriquecido del usuario autenticado; ya no confia en `profileId` enviado por cliente. |
| `/api/profile/me` | `PUT` | `profiles` + `consultants` | Actualiza datos visibles del perfil autenticado usando la sesion activa. |
| `/api/settings` | `GET` | `user_settings` | Obtiene preferencias del usuario autenticado. |
| `/api/settings` | `PUT` | `user_settings` | Actualiza `notifications`, `language` y `timezone` del usuario autenticado. |
| `/api/settings/password` | `PUT` | `auth.users` via admin API | Cambia la contraseña del usuario autenticado. |
| `/api/analytics/stats` | `GET` | Mezcla de Supabase real + derivaciones | Retorna metricas para analytics de la sesion actual y admite `idEmpresa` / `idConsultor` cuando aplica. |

### Red, mensajes y citas

| Ruta | Metodo | Backing | Descripcion |
|---|---|---|---|
| `/api/network/connections` | `GET` | `connections` + `consultants` | Lista conexiones reales del usuario autenticado. |
| `/api/network/connections` | `POST` | `connections` | Agrega un consultor a la red usando la sesion del usuario y `consultantId`. |
| `/api/network/connections` | `DELETE` | `connections` | Elimina una conexion del usuario autenticado usando `consultantId`. |
| `/api/network/favorites` | `GET` | `favorites` + `consultants` | Lista favoritos reales del usuario autenticado. |
| `/api/network/favorites` | `POST` | `favorites` | Hace toggle de favorito usando la sesion del usuario y `consultantId`. |
| `/api/messages/conversations` | `GET` | `conversations` + `direct_messages` | Lista previews reales de conversaciones para el usuario autenticado. |
| `/api/messages/conversations` | `POST` | `conversations` | Crea o recupera una conversacion real entre empresa autenticada y consultor. |
| `/api/messages/thread` | `GET` | `direct_messages` | Devuelve el hilo real de una conversacion usando la sesion activa y `conversationId`. |
| `/api/messages/send` | `POST` | `direct_messages` | Persiste mensajes reales usando la sesion activa, `conversationId` y `text`. |
| `/api/appointments` | `GET` | `appointments` | Lista solicitudes de consultoria del usuario autenticado. |
| `/api/appointments` | `POST` | `appointments` | Crea una solicitud de consultoria real con `consultantId`, `requestedAt` y `note`. |

### Seed y soporte demo

| Ruta | Metodo | Backing | Descripcion |
|---|---|---|---|
| `/api/demo/seed` | `GET` | `profiles` + `consultants` | Valida el estado de los 6 perfiles empresa demo y 5 consultores demo. |
| `/api/demo/seed` | `POST` | `profiles` + `consultants` | Re-siembra los datos demo si existe `SUPABASE_SERVICE_ROLE_KEY`. |

## Tablas verificadas

### Tablas activas para backend real

| Tabla | Uso |
|---|---|
| `profiles` | Identidad base del usuario autenticado. |
| `consultants` | Perfil profesional extendido del consultor. |
| `empresa` | Registro empresarial de negocio. |
| `consultor` | Registro del consultor en el esquema de negocio. |
| `desafio` | Retos publicados. |
| `postulacion` | Aplicaciones a desafios. |
| `contrato` | Preparada para contratos formales. |
| `calificacion` | Preparada para evaluaciones. |

### Persistencia social real

Estas capacidades ya quedaron migradas a tablas dedicadas en Supabase:

- settings
- conexiones
- favoritos
- conversaciones
- mensajes directos
- citas

## Payloads clave

### Crear desafio

```json
{
  "idEmpresa": 6,
  "title": "Transformacion digital bancaria",
  "description": "Necesitamos apoyo estrategico para modernizar canales digitales.",
  "specialty": "Transformacion Digital",
  "budget": 45000,
  "mode": "remoto",
  "status": "activo"
}
```

### Crear postulacion

```json
{
  "idDesafio": 12,
  "idConsultor": 8,
  "coverLetter": "Tengo experiencia liderando iniciativas similares.",
  "proposedBudget": 38000,
  "status": "pendiente"
}
```

### Actualizar settings

```json
{
  "settings": {
    "notifications": {
      "email": true,
      "push": false,
      "projects": true
    },
    "language": "es",
    "timezone": "America/Bogota"
  }
}
```

### Enviar mensaje

```json
{
  "conversationId": "uuid-del-consultor",
  "text": "Hola, me interesa conversar sobre tu experiencia."
}
```

## Estado actual

### Persistente en Supabase

- Directorio de consultores
- Directorio de empresas
- Dashboard
- Desafios
- Postulaciones
- Perfil base
- Settings
- Conexiones
- Favoritos
- Conversaciones
- Mensajes directos
- Citas
- Cambio de contraseña
- Seed demo
