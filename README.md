# Nexora App 📱

Nexora App es la solución móvil y web avanzada que potencia el ecosistema de **Nexora**, diseñada para optimizar la conexión estratégica entre el talento especializado y las organizaciones que buscan transformación.

## ✨ Características Principales

### 1. Registro Bilateral Personalizado 👥
Hemos implementado un sistema de registro robusto y segmentado para garantizar una experiencia a medida:
- **Empresas:** Registro enfocado en la detección de necesidades estratégicas, área de interés y desafíos específicos.
- **Consultores:** Registro detallado de especialidades, años de experiencia y portafolio profesional (Consultores Elite).

### 2. Expertos Favoritos (Favorite Experts) ⭐
Esta funcionalidad permite a las empresas crear y gestionar su propia red de contactos de confianza. Guarda a los consultores más destacados para tener acceso inmediato a su perfil en proyectos actuales o futuros.

### 3. Habilidades en Tendencia (Trending Skills) 📈
Un panel inteligente que destaca las habilidades más demandadas y las tecnologías emergentes en el mercado de la consultoría. Ayuda a los consultores a mantenerse competitivos y a las empresas a identificar el conocimiento necesario para su próximo gran paso.

### 4. Centro de Mensajería Directa 💬
La ventana de mensajes integrada rompe las barreras de comunicación. Permite una interacción fluida, segura y en tiempo real entre empresas y consultores para coordinar entrevistas, resolver dudas y gestionar la entrega de proyectos.

### 5. Gestión Integral de Perfiles 👤
Acceso dedicado y seguro para ambas partes:
- **Vista de Empresa:** Panel de control para gestionar vacantes, revisar perfiles de consultores guardados y monitorear mensajes activos.
- **Vista de Consultor:** Perfil profesional dinámico donde se puede actualizar la experiencia, gestionar postulaciones y visualizar las habilidades en tendencia del mercado.

## 🛠️ Tecnologías y Arquitectura

- **Frontend:** Interfaz premium en **Next.js + React**, responsiva y orientada a la experiencia de usuario (UX).
- **Backend:** Capa `app/api` en **Next.js** para exponer endpoints internos y centralizar la lectura de datos.
- **Base de Datos & Auth:** Integración nativa con **Supabase** para una gestión de datos escalable y segura.
- **Inteligencia Artificial:** Soporte integrado de **Nexa AI** para búsqueda y recomendación inteligente.

## 🎨 Estética y Diseño Premium

Nexora App hereda y potencia la identidad visual consolidada en el proyecto Nexora, centrada en una experiencia de usuario de gama alta:

### Paleta de Colores Estratégica
- **Primary Blue (`#0A1F44`):** Color base que transmite confianza, profesionalismo y profundidad.
- **Electric Blue (`#2563EB`):** Tono vibrante utilizado para acentos tecnológicos y llamadas a la acción.
- **Strategic Purple (`#6D5EF3`):** Representa la innovación y la visión estratégica de la plataforma.
- **Action Green (`#22C55E`):** Color de éxito y confirmación para procesos completados.
- **Fondo & Superficies:** Uso de **Glass BG** (`rgba(255, 255, 255, 0.1)`) con bordes sutiles para el efecto de profundidad.

### Sistema de Diseño y Estética
- **Tipografía de Marca:** Uso exclusivo de **Montserrat** y **Sora** para una imagen moderna, profesional y legible.
- **Estética Visual:** Implementación integral de **Glassmorphism** (efecto de vidrio esmerilado) en tarjetas, paneles y elementos de interfaz.
- **Micro-interacciones:** Sistema de partículas optimizado, gradientes dinámicos y navegación fluida con efectos de desenfoque (`backdrop-filter: blur(12px)`).

### Optimización de Marca e Interfaz
- **Identidad Proporcional:** Refinamiento visual con un equilibrio entre el texto de marca y el logo oficial (`Logo.png`).
- **Layout:** Diseño basado en contenedores de 1200px con una estructura de rejilla (**Grid Floor**) inspirada en estéticas futuristas.

### Componentes Interactivos UX
- **Segmentación Visual:** Sistema de pestañas interactivo para diferenciar claramante los flujos de Empresas y Consultores.
- **Canales Glass:** Tarjetas de contacto con efecto glass para información oficial (Email, Teléfono, etc.).
- **Nexa AI Local Potenciada:** Interfaz de chat con botones interactivos y normalización de texto inteligente (ignora acentos y mayúsculas) para una interacción natural.

## 🔄 Actualizaciones Recientes (Refinamiento de Exploración)

Hemos elevado la experiencia de búsqueda en la sección de **Explorar** con nuevas funcionalidades avanzadas:

### 1. Sistema de Filtros Avanzados 🔍
- **Filtros Dinámicos**: Implementación de criterios específicos como Rating ( ⭐), Años de Experiencia, Edad, Proyectos Realizados y Ciudad.
- **Interfaz Animada**: Panel lateral desplegable con efectos suaves de entrada y salida mediante *Framer Motion (AnimatePresence)*.
- **Limpieza Rápida**: Botón de restablecimiento integral para volver a la vista general con un solo toque.

### 2. Navegación por Áreas (Dropdown) 🛠️
- Sustitución de las píldoras horizontales por un **menú desplegable inteligente**. Esto permite una selección más rápida y organizada de las más de 10 categorías de especialización disponibles.

### 3. Perfiles Detallados (Profile Modal) 📑
- **Vista de Detalle**: Al hacer clic en "Ver Perfil", se despliega un modal premium que contiene la biografía completa del consultor, estadísticas detalladas y tags de especialidad.
- **Acciones Rápidas**: Integración de botones de llamado a la acción para agendar consultorías o enviar mensajes directamente desde el detalle.

### 4. Optimización de Despliegue y PWA ⚡
- **Vercel SPA Fix**: Configuración de `vercel.json` para manejar redirecciones automáticas, eliminando errores 404 al recargar la página en producción.
- **Soporte PWA**: Implementación de `manifest.json` e iconos para permitir la instalación de la app en dispositivos móviles y escritorio.
- **Data Enrichment**: Ampliación de la base de datos de ejemplo con perfiles verificados y datos realistas de experiencia y ciudad.

### 5. Reorganización del Repositorio 📂
- **Carpeta Docs**: Centralización de la documentación técnica y de negocio en subcarpetas estructuradas.
- **Frontend Consolidado**: Código fuente integrado en `Docs/FRONTEND/` para una mejor gestión de activos y diseño.
- **Limpieza de Seguridad**: Remoción de archivos sensibles (.env, .vercel) y eliminación de versiones obsoletas del diseño.

## 🆕 Último Avance Técnico

En la sesión más reciente consolidamos la base técnica del proyecto para que la app deje de depender de datos estáticos y quede lista para seguir creciendo sobre una arquitectura más realista.

### 1. Migración Base del Frontend a Next.js ⚙️
- El frontend quedó montado sobre **Next.js**, manteniendo la experiencia visual existente mientras se prepara una migración progresiva de rutas y vistas.
- La estructura principal ahora aprovecha el directorio `app/` y la compatibilidad con despliegue moderno en Vercel.

### 2. Backend Integrado Dentro de Next.js 🔌
- Se implementó una capa backend con rutas internas en `Docs/FRONTEND/app/api/`.
- Ya existen endpoints para:
  - Consultores
  - Empresas
  - Dashboard
  - Desafíos
  - Estado y seed de datos demo
- Esto permite que el frontend consulte datos reales sin depender de arreglos mock quemados en los componentes.

### 3. Sincronización Real con Supabase 🗄️
- La app ya refleja los datos demo existentes en Supabase:
  - **6 empresas demo**
  - **5 consultores demo**
- Se conectaron las vistas principales (`Home`, `Explore`, `Network`, `Messages` y `Projects`) para consumir los endpoints internos de Next y mostrar información real de la base.
- La lectura actual funciona con:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- La variable `SUPABASE_SERVICE_ROLE_KEY` quedó preparada para habilitar procesos de seed o escrituras administrativas cuando se configure.

### 4. Documentación Backend VIS2 🧭
- Se añadió documentación técnica en `Docs/ARQUITECTURA/backend.md`.
- Allí se describe:
  - La estructura backend implementada
  - Las tablas verificadas en Supabase
  - El flujo actual entre frontend, rutas API y base de datos
  - El estado de cumplimiento de la guía de backend VIS2

## 📁 Estructura del Proyecto
```text
Nexora_app/
├── Docs/
│   ├── ARQUITECTURA/    # Tech Stack y Arquitectura.
│   ├── BASE_DATOS/      # Esquema Supabase y Migraciones.
│   ├── BRANDING/        # Moodboard, Colores y Tipografía.
│   ├── FRONTEND/        # Código fuente (Next.js/React), rutas API y PWA.
│   ├── NEGOCIO/         # Modelo de Negocio y Flujos.
│   └── figma-mcp-server/ # Servidor de integración Figma.
└── README.md            # Guía principal.
```

## 🌿 Ramas de trabajo

- `Juan`
- `Iosiv`
- `Sebastian`

## 🚀 Roadmap
- [ ] Implementación de Notificaciones Push para mensajes nuevos.
- [ ] Dashboard de analíticas avanzadas para empresas.
- [ ] Sistema de validación de habilidades mediante IA.
- [x] Backend inicial en Next.js con rutas `app/api`.
- [x] Conexión de vistas principales a datos reales de Supabase demo.
- [x] Migración base del frontend a Next.js.
- [x] Filtros avanzados y perfiles detallados en la sección Explorar.
- [x] Soporte PWA e instalación en dispositivos.
- [x] Reorganización completa de la arquitectura del repositorio.

---
*Nexora - El consultor correcto, en el momento exacto.*
