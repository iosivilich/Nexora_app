# Flujos de Usuario (User Flows) 📱

Nexora App prioriza la fluidez y la seguridad mediante una arquitectura de roles definida desde la autenticación.

## 1. Autenticación y Registro Estratégico 🔐
El acceso a la aplicación es obligatorio y se realiza mediante **Supabase Auth**.
*   **Métodos**: Google OAuth o Correo/Contraseña.
*   **Registro Obligatorio (First-time)**:
    *   **Datos requeridos**: Nombre Completo y Ciudad.
    *   **Selección de Rol**: El usuario debe elegir mediante botones interactivos si es una **Empresa** o un **Consultor**.
    *   **Sincronización**: Los datos se guardan automáticamente en la tabla de perfiles de la base de datos para personalizar la experiencia.

## 2. Experiencia Diferenciada por Rol (Home) 🏠
Al iniciar sesión, la aplicación detecta el tipo de usuario y adapta la interfaz:

### A. Para Empresas (Ecosistema de Talento)
*   **Enfoque**: Búsqueda asistida de consultores expertos.
*   **Home**: Dashboard de métricas globales (Consultores activos, proyectos en curso) y acceso a **Consultores Destacados**.
*   **CTA Principal**: "Explorar Talento" y "Publicar Desafío".

### B. Para Consultores (Ecosistema de Oportunidades)
*   **Enfoque**: Crecimiento profesional y postulación estratégica.
*   **Home**: Métricas de mercado (Empresas destacadas, proyectos abiertos, tasa de aceptación).
*   **CTA Principal**: "Buscar Desafíos" y "Mis Postulaciones".
*   **Guía**: Sección dedicada de "Cómo funciona" centrada en el valor para el profesional.

## 3. Exploración y Búsqueda Inteligente 🔍
*   **Consultores (Vista Empresa)**: Filtros avanzados por Rating, Experiencia y Ciudad. Menú desplegable de especialidades.
*   **Proyectos (Vista Consultor)**: Si el usuario no tiene postulaciones, es redirigido mediante una **Lupa de Búsqueda** interactiva para descubrir nuevos desafíos en la sección de Explorar.

## 4. Gestión de Proyectos y Red 💼
*   **Empresas**: Panel de administración para publicar nuevos desafíos y gestionar aplicantes.
*   **Consultores**: Visualización del estado de sus candidaturas ("Mis Postulaciones") y acceso a una red de colaboración con otros expertos ("Comunidad").

## 5. Comunicación Directa 💬
*   **Unificación**: Centro de mensajería en tiempo real disponible para ambos roles para coordinar entrevistas, resolver dudas y gestionar la entrega de proyectos.

---

# Historial de Cambios (Changelog) 🛠️

### Versión actual (Implementado v2.0)
*   [x] **Auth Global**: Implementación de `AuthContext` y `ProtectedRoute`.
*   [x] **Dual Auth**: Soporte para Google Login y Email/Password.
*   [x] **Registro Enriquecido**: Los usuarios ahora cargan Nombre, Ciudad y Rol de forma obligatoria al crear cuenta.
*   [x] **UI Adaptativa**: Rediseño total de la `HomePage` y `Sidebar` según el rol detectado.
*   [x] **Manejo de Errores**: Integración de notificaciones `sonner` para feedback de autenticación.
*   [x] **Despliegue Continuo**: Configuración y despliegue automático a Vercel con variables de entorno de producción.
