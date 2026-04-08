# Arquitectura: Stack Tecnológico

Nexora App se construye sobre una infraestructura equilibrada para garantizar escalabilidad, seguridad y una experiencia de usuario de élite.

## 🚀 Stack de Desarrollo
| Capa | Herramienta | Función |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Motor de visualización y construcción. |
| **Estilos** | CSS Variables + Tailwind | Sistema de diseño de bajo nivel y utilidades. |
| **Animaciones** | Framer Motion | Micro-interacciones y transiciones de página. |
| **Iconografía** | Lucide Icons | Conjunto de iconos vectoriales optimizados. |
| **Backend/DB** | Supabase | Base de datos relacional y autenticación segura. |
| **Despliegue** | Vercel | Infraestructura de hosting y CI/CD. |
| **IA** | Nexa AI (Local) | Motor de búsqueda y recomendación inteligente. |

## 📐 Principios de Diseño
1.  **Modularidad**: Separación clara entre la lógica de negocio y la visualización de componentes.
2.  **Escalabilidad**: Implementación de Supabase para manejar el crecimiento del tráfico y datos.
3.  **Seguridad**: Autenticación gestionada por terceros y gestión de datos cifrados.
4.  **UX First**: Prioridad absoluta en la fluidez de las animaciones y la estética premium.

## 🌉 Integración
*   **API**: Conexión con Supabase mediante el cliente oficial para operaciones de lectura/escritura en tiempo real.
*   **Routing**: Navegación interna gestionada por `react-router` para transiciones sin recarga de página.
*   **SPA Logic**: Manejo de rutas del servidor hacia `index.html` para compatibilidad completa en producción.
