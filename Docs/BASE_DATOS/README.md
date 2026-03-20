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

#### 2. `consultants`
Contiene la información profesional extendida para usuarios con rol `CONSULTOR`.
- **PK**: `id` (uuid) -> Referencia a `profiles(id)`.
- **Campos Clave**: `role`, `rating`, `projects`, `experience_years`, `age`, `bio`, `expertise` (text[]), `verified`.
- **Finalidad**: Proveer datos enriquecidos para el sistema de filtros en la página de Explorar.

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
