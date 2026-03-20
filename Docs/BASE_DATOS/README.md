# Base de Datos

Nexora utiliza **Supabase** como proveedor de base de datos y autenticación para una gestión escalable y segura.

## Esquema Propuesto

### Tabla: `consultores`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` | Identificador único (Primary Key) |
| `name` | `text` | Nombre completo del consultor |
| `role` | `text` | Especialidad o cargo profesional |
| `city` | `text` | Ciudad de residencia |
| `rating` | `float` | Puntuación acumulada (0-5) |
| `projects` | `int` | Número de proyectos realizados |
| `experience` | `int` | Años de experiencia profesional |
| `age` | `int` | Edad del consultor |
| `expertise` | `text[]` | Array de habilidades principales |
| `bio` | `text` | Biografía y trayectoria |
| `image_url` | `text` | Enlace a la fotografía de perfil |
| `verified` | `boolean` | Estado de verificación Elite |

### Tabla: `usuarios` (Bilateral)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` | Identificador único |
| `email` | `text` | Correo electrónico institucional |
| `type` | `enum` | `EMPRESA` o `CONSULTOR` |
| `favorites` | `uuid[]` | Lista de IDs de consultores guardados |

## Migraciones
Actualmente el proyecto utiliza un estado inicial basado en un array de datos estáticos en el frontend para el prototipo. Las migraciones de Supabase se encuentran en fase de desarrollo interno.

> [!CAUTION]
> No subir archivos `.env` o credenciales de Supabase al repositorio público.
