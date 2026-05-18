# Documentación Técnica: Base de Datos (Supabase)

Esta sección documenta la arquitectura de datos relacional de Nexora App, diseñada para ser implementada sobre **PostgreSQL** dentro del ecosistema de **Supabase**.

## 🏗️ Arquitectura del Esquema
El diseño sigue un **modelo bilateral** donde cada registro en la tabla de autenticación de Supabase (`auth.users`) se vincula a un perfil público con un rol específico.

### Tablas Principales

#### 1. `profiles`
Centraliza la información compartida por todos los usuarios.
- **PK**: `id` (uuid) -> Relación 1:1 con `auth.users`.
- **Campos**: `full_name`, `avatar_url`, `city`, `user_type` (Enum: EMPRESA | CONSULTOR).
- **Finalidad**: Gestión de identidad única y tipo de acceso.

#### 2. `consultants` — capa auth-linked
Información profesional **del usuario logueado**. Una fila ⇔ un `auth.users` real, con RLS.
- **PK**: `id` (uuid) -> Referencia a `profiles(id)` ON DELETE CASCADE.
- **Campos Clave**: `role`, `rating`, `projects`, `experience_years`, `age`, `bio`, `expertise` (text[]), `verified`, `ciudad`.
- **Finalidad**: Soportar operaciones que requieren identidad — perfil propio, favoritos, mensajería, citas.

#### 2bis. `consultor` — capa catálogo público (legacy)
Directorio masivo de talento **independiente de `auth.users`**, sin RLS.
- **PK**: `id_consultor` (serial integer).
- **Campos**: `nombre`, `apellido`, `email`, `telefono`, `especialidad`, `años_experiencia`, `tarifa_referencial`, `estado`, `fecha_registro`, `ciudad`, `avatar_url`, `bio`, `rol`, `expertise` (text[]), `verified`, `fuente`, `id_externo`.
- **Volumen actual**: ~1,772 perfiles reales colombianos (1,690 desde SECOP + 82 legacy).
- **Carga**: `node scripts/seed-consultores.mjs` desde GitHub Users API + datos.gov.co.
- **Vinculación con `profiles`**: por email (o `profiles.consultor_id` cuando se setea).
- **Detalles**: `FUENTE_DATOS_CONSULTORES.md` (fuentes y mapeo) + `IMPLEMENTACION_CONSULTORES_SUPABASE.md` (especificación completa de `consultants` vs `consultor` y cambios aplicados).

#### 3. `favorites`
Permite a las empresas guardar consultores de interés.
- **Relación**: N:M entre `profiles` (Empresas) y `consultants` (Talento).
- **Reglas**: Índice único en `(user_id, consultant_id)` para evitar duplicados.

#### 4. `messages`
Sistema de comunicación directa bilateral.
- **Relación**: Registra conversaciones entre cualquier par de usuarios validados.
- **Campos**: `sender_id`, `receiver_id`, `content`, `is_read`, `created_at`.

## 🔒 Seguridad (Row Level Security - RLS)
Para garantizar la privacidad de los datos, se han implementado políticas de RLS:
- **Lectura Pública**: Perfiles y consultores son visibles por todos los usuarios autenticados.
- **Escritura Privada**: Un usuario solo puede actualizar su propio registro en `profiles`.
- **Mensajería**: El acceso a la tabla `messages` está restringido estrictamente al emisor (`sender_id`) y al receptor (`receiver_id`).

## 📁 Estructura de Migraciones (SQL)

Las migraciones de base de datos se encuentran actualmente en **fase de refinamiento de flujo**. Se añadirán nuevos archivos SQL una vez que se valide la lógica de negocio final para asegurar una integración perfecta con Supabase.

---
> [!NOTE]
> La implementación física en Supabase se realizará tras la validación de los flujos de usuario detallados en la carpeta `NEGOCIO`.
