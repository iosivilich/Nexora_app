# Documentación: Google Auth & Onboarding

Esta sección detalla la implementación técnica del sistema de autenticación de Google y el flujo de bienvenida (onboarding) para nuevos usuarios en Nexora.

## 1. Autenticación con Google (OAuth)
Se ha implementado un flujo de autenticación directo en el lado del cliente utilizando el SDK de Supabase.

- **Archivo**: `Docs/FRONTEND/src/app/pages/LoginPage.tsx`
- **Lógica**: Se utiliza `supabase.auth.signInWithOAuth` con el proveedor `google`.
- **Redirección**: El usuario es redirigido a la raíz (`/`) tras una autenticación exitosa. El SDK de Supabase gestiona la persistencia de la sesión automáticamente.

## 2. Flujo de Onboarding
Para los usuarios que se registran por primera vez (como ocurre con Google Auth), se ha implementado un paso obligatorio para completar el perfil.

- **Componente**: `OnboardingRoleSelection.tsx` (en `src/app/components/`)
- **Página Dedicada**: `/onboarding` (en `app/onboarding/page.tsx`)
- **Campos Capturados**:
  - **Ciudad**: Campo de texto para ubicación geográfica.
  - **Rol**: Selección binaria entre `EMPRESA` y `CONSULTOR`.

### Lógica de Redirección
En la `HomePage.tsx`, se verifica si el usuario autenticado tiene un rol definido (`user_type`). 
- Si no tiene rol: Se redirige automáticamente a `/onboarding`.
- Tras completar el onboarding: Se actualiza el perfil y se redirige de vuelta a `/`.

## 3. Sincronización de Datos (Backend)
Se han realizado ajustes críticos en la capa de datos para soportar este flujo:

- **Upsert de Perfil**: Las funciones en `backend-data.ts` ahora utilizan `.upsert()` en lugar de `.update()` para asegurar que se cree el registro en la tabla `profiles` si un usuario de Google entra por primera vez.
- **Sincronización de Metadata**: El rol seleccionado se guarda tanto en la tabla `profiles` como en los metadatos de autenticación (`auth.users`) para garantizar consistencia y facilitar las comprobaciones rápidas en el cliente.
- **Resolución de Ambigüedad**: Se corrigieron las consultas de Supabase especificando la clave foránea `profiles!consultants_id_fkey` para evitar errores durante los joins.

## 4. API de Perfil
El endpoint `PUT /api/profile/me` fue actualizado para aceptar los nuevos campos `userType` y `city`, permitiendo una actualización fluida desde el formulario de onboarding.
