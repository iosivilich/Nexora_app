# Nexora App - Endpoints Backend

Documentacion actualizada de los endpoints disponibles en la capa backend de Next.js.

## Criterio de implementacion

Hoy convivimos con tres fuentes de datos:

1. **Supabase Auth + `profiles` + `consultants`**
   Usado por el frontend actual y por la sesion autenticada.
2. **Tablas de negocio**
   `empresa`, `consultor`, `desafio`, `postulacion`, `contrato`, `calificacion`.
3. **`auth.user_metadata`**
   Soporte provisional para settings, favoritos, conexiones, mensajes demo y citas, mientras se crean tablas sociales dedicadas.

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
| `/api/profile/me` | `GET` | `profiles` + `consultants` + `auth.users` + busqueda por email en `empresa`/`consultor` | Devuelve el perfil enriquecido usando `profileId`. |
| `/api/profile/me` | `PUT` | `profiles` + `consultants` | Actualiza datos visibles del perfil autenticado. |
| `/api/settings` | `GET` | `auth.user_metadata` | Obtiene preferencias del usuario con `profileId`. |
| `/api/settings` | `PUT` | `auth.user_metadata` | Actualiza `notifications`, `language` y `timezone`. |
| `/api/settings/password` | `PUT` | `auth.users` via admin API | Cambia la contraseña usando `profileId` y `newPassword`. |
| `/api/analytics/stats` | `GET` | Mezcla de Supabase real + derivaciones | Retorna metricas para analytics. Soporta `profileId`, `idEmpresa`, `idConsultor`. |

### Red, mensajes y citas

| Ruta | Metodo | Backing | Descripcion |
|---|---|---|---|
| `/api/network/connections` | `GET` | `auth.user_metadata` + `consultants` | Lista conexiones del usuario. Si no existen datos propios, devuelve una coleccion demo derivada. |
| `/api/network/connections` | `POST` | `auth.user_metadata` | Agrega un consultor a la red usando `profileId` y `consultantId`. |
| `/api/network/connections` | `DELETE` | `auth.user_metadata` | Elimina una conexion usando `profileId` y `consultantId`. |
| `/api/network/favorites` | `GET` | `auth.user_metadata` + `consultants` | Lista favoritos del usuario o una coleccion demo inicial. |
| `/api/network/favorites` | `POST` | `auth.user_metadata` | Hace toggle de favorito usando `profileId` y `consultantId`. |
| `/api/messages/conversations` | `GET` | `auth.user_metadata` + `consultants` | Lista previews de conversaciones para el usuario. |
| `/api/messages/thread` | `GET` | `auth.user_metadata` + mensajes demo | Devuelve el hilo de una conversacion usando `profileId` y `conversationId`. |
| `/api/messages/send` | `POST` | `auth.user_metadata` | Persiste mensajes demo por usuario usando `profileId`, `conversationId` y `text`. |
| `/api/appointments` | `GET` | `auth.user_metadata` | Lista solicitudes de consultoria agendadas por el usuario. |
| `/api/appointments` | `POST` | `auth.user_metadata` | Crea una solicitud de consultoria con `profileId`, `consultantId`, `requestedAt` y `note`. |

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

### Persistencia provisional en metadata

Estas capacidades ya tienen endpoint, pero hoy se guardan en `auth.user_metadata` porque no existe una tabla social dedicada:

- settings
- conexiones
- favoritos
- mensajes demo
- citas demo

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
  "profileId": "uuid-del-auth-user",
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

### Enviar mensaje demo

```json
{
  "profileId": "uuid-del-auth-user",
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
- Cambio de contraseña
- Seed demo

### Persistente provisional en `auth.user_metadata`

- Settings
- Conexiones
- Favoritos
- Mensajes demo
- Citas demo

## Siguiente evolucion recomendada

Para cerrar la brecha final del backend conviene crear tablas sociales dedicadas:

- `conexiones`
- `favoritos`
- `conversaciones`
- `mensajes_directos`
- `appointments` o `consultorias_agendadas`

En ese momento los endpoints ya implementados pueden migrarse de `auth.user_metadata` a tablas reales sin romper el contrato HTTP actual.
