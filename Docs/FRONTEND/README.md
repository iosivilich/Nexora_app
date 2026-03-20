# Frontend: Aplicación Nexora

El frontend está desarrollado con tecnologías modernas que garantizan una experiencia premium y responsiva en tiempo real.

## 🛠️ Tecnologías Core
*   **React 18**: Biblioteca principal para la lógica de componentes.
*   **Vite**: Motor de construcción ultrarrápido para optimización en producción.
*   **Tailwind CSS 4**: Marco de trabajo de utilidad para estilos dinámicos y responsivos.
*   **Framer Motion**: Motor de animaciones para transiciones fluidas y micro-interacciones.
*   **Lucide React**: Herramienta de iconos vectoriales consistentes y modernos.

## 📂 Estructura de Componentes
Organización modular para escalabilidad:

| Carpeta | Descripción |
| :--- | :--- |
| `src/app/pages` | Vistas principales (Home, Explore, Registration, Profile). |
| `src/app/components` | UI Reutilizable (GlassCard, ConsultantCard, Sidebar). |
| `src/styles` | Tokens de diseño, temas CSS y fuentes de marca. |
| `public` | Activos estáticos como logotipos y recursos globales. |

## 🕹️ Características de Interfaz
*   **Explorar (Explore Page)**: Búsqueda avanzada con filtros dinámicos (Rating, Experiencia, Ciudad).
*   **Categorización**: Menú desplegable para selección de áreas de especialidad.
*   **Tarjetas Dinámicas**: Visualización de estadísticas clave del consultor de un vistazo.
*   **Modales de Perfil**: Detalle extendido y biografía con CTAs de agendamiento.

## 🚀 Despliegue (Vercel)
La aplicación se sirve como una **SPA (Single Page Application)** con configuraciones de ruteo personalizadas en `vercel.json` para evitar errores 404 al recargar.
