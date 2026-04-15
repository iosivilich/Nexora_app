# Nexora App - Endpoints Backend

Documentacion de todos los endpoints necesarios para conectar el frontend con las tablas de Supabase.

## Esquema de Tablas Actual (Supabase)

### Tablas de autenticacion (UUID-based)

| Tabla | Rows | PK | Descripcion |
|---|---|---|---|
| `profiles` | 12 | `id` (uuid, FK auth.users) | Identidad basica del usuario |
| `consultants` | 5 | `id` (uuid, FK profiles) | Datos profesionales extendidos del consultor |

### Tablas de negocio (Integer-based, auto-increment)

| Tabla | Rows | PK | Descripcion |
|---|---|---|---|
| `empresa` | 1+ | `id_empresa` (int) | Datos de la empresa registrada |
| `consultor` | 1+ | `id_consultor` (int) | Datos del consultor registrado |
| `desafio` | 0 | `id_desafio` (int) | Proyectos/retos publicados por empresas |
| `postulacion` | 0 | `id_postulacion` (int) | Aplicaciones de consultores a desafios |
| `contrato` | 0 | `id_contrato` (int) | Contratos formalizados |
| `calificacion` | 0 | `id_calificacion` (int) | Evaluaciones bidireccionales |

### Nota sobre doble esquema

Existen dos sistemas de identidad en paralelo:
- **Auth/profiles/consultants** — UUID, ligado a Supabase Auth. Usado por el frontend actual.
- **empresa/consultor** — Integer auto-increment, independiente de auth. Tablas de negocio.

Se necesita una relacion entre `profiles.id` (uuid) y `empresa.id_empresa` / `consultor.id_consultor` (int) para vincular la sesion autenticada con los datos de negocio. Opciones:
1. Agregar columna `auth_user_id` (uuid) a `empresa` y `consultor`
2. Crear tabla puente `user_roles` que mapee profiles.id a empresa/consultor

---

## Endpoints por Pagina

### 1. LoginPage (auth) — YA IMPLEMENTADO

| Accion | Metodo | Tabla | Estado |
|---|---|---|---|
| Registro email/password | `supabase.auth.signUp()` | auth.users + profiles | Funcional |
| Login email/password | `supabase.auth.signInWithPassword()` | auth.users | Funcional |
| Login Google OAuth | `supabase.auth.signInWithOAuth()` | auth.users | Funcional |
| Fetch perfil post-login | `supabase.from('profiles').select()` | profiles | Funcional |

---

### 2. HomePage — PENDIENTE

**Contexto:** Muestra consultores destacados (empresa) o metricas de mercado (consultor). Actualmente todo hardcoded.

#### GET /consultants/featured
- **Tipo:** Query Supabase (client-side)
- **Tabla:** `consultants` JOIN `profiles`
- **Logica:**
  ```ts
  const { data } = await supabase
    .from('consultants')
    .select('*, profiles(full_name, avatar_url, city)')
    .eq('verified', true)
    .order('rating', { ascending: false })
    .limit(4);
  ```
- **Reemplaza:** Array hardcoded `consultants` (4 objetos) en HomePage.tsx:11-58
- **Response:** `{ name, role, location, rating, projects, experience, age, expertise[], image, verified }`

#### GET /stats/dashboard
- **Tipo:** Query Supabase con count
- **Tablas:** `consultants`, `desafio`, `empresa`
- **Logica:**
  ```ts
  const [consultoresCount, desafiosCount, empresasCount] = await Promise.all([
    supabase.from('consultants').select('*', { count: 'exact', head: true }),
    supabase.from('desafio').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
    supabase.from('empresa').select('*', { count: 'exact', head: true }),
  ]);
  ```
- **Reemplaza:** Stats hardcoded (1,247 / 482 / 890) en HomePage.tsx:123-126

---

### 3. ExplorePage — PENDIENTE

**Contexto:** Busqueda y filtrado de consultores. Actualmente filtra sobre 5 consultores hardcoded.

#### GET /consultants/search
- **Tipo:** Query Supabase con filtros dinamicos
- **Tabla:** `consultants` JOIN `profiles`
- **Parametros:** `search`, `category`, `minRating`, `minExperience`, `city`, `minProjects`, `maxAge`
- **Logica:**
  ```ts
  let query = supabase
    .from('consultants')
    .select('*, profiles(full_name, avatar_url, city)');
  
  if (search) query = query.or(`role.ilike.%${search}%,profiles.full_name.ilike.%${search}%`);
  if (minRating) query = query.gte('rating', minRating);
  if (minExperience) query = query.gte('experience_years', minExperience);
  if (city) query = query.eq('profiles.city', city);
  if (minProjects) query = query.gte('projects', minProjects);
  if (maxAge) query = query.lte('age', maxAge);
  if (category) query = query.contains('expertise', [category]);
  
  const { data } = await query.order('rating', { ascending: false });
  ```
- **Reemplaza:** Array `allConsultants` (5 objetos) en ExplorePage.tsx:9-80 y todo el filtrado client-side
- **Response:** Array de consultores con perfil vinculado

#### POST /messages/send (desde modal de consultor)
- **Tipo:** Insert Supabase
- **Tabla:** Por definir (no existe tabla de mensajes directos aun)
- **Trigger:** Boton "Enviar Mensaje" en modal de consultor (ExplorePage.tsx:454)
- **Estado:** Necesita definir tabla de mensajes

#### POST /appointments/schedule (desde modal de consultor)
- **Tipo:** Insert Supabase
- **Tabla:** Por definir (no existe tabla de citas aun)
- **Trigger:** Boton "Agendar Consultoria" en modal de consultor (ExplorePage.tsx:451)
- **Estado:** Necesita definir tabla de citas/agenda

---

### 4. ProjectsPage — PENDIENTE

**Contexto:** Empresas publican desafios, consultores se postulan. Actualmente hardcoded con 3 proyectos mock.

#### GET /desafios (vista Empresa)
- **Tipo:** Query Supabase
- **Tabla:** `desafio` + count de `postulacion`
- **Logica:**
  ```ts
  // Obtener id_empresa del usuario logueado
  const { data: emp } = await supabase
    .from('empresa')
    .select('id_empresa')
    .eq('auth_user_id', user.id)  // Requiere columna auth_user_id
    .single();

  const { data } = await supabase
    .from('desafio')
    .select('*, postulacion(count)')
    .eq('id_empresa', emp.id_empresa)
    .order('fecha_publicacion', { ascending: false });
  ```
- **Reemplaza:** Array `publishedProjects` (3 objetos) en ProjectsPage.tsx:8-42
- **Response:** `{ id_desafio, titulo, descripcion, presupuesto_estimado, modalidad, estado, fecha_publicacion, especialidad_requerida, applicants_count }`

#### GET /postulaciones (vista Consultor)
- **Tipo:** Query Supabase
- **Tabla:** `postulacion` JOIN `desafio` JOIN `empresa`
- **Logica:**
  ```ts
  const { data } = await supabase
    .from('postulacion')
    .select('*, desafio(titulo, descripcion, presupuesto_estimado, modalidad, empresa(nombre_empresa))')
    .eq('id_consultor', consultorId)
    .order('fecha_postulacion', { ascending: false });
  ```
- **Reemplaza:** Estado vacio hardcoded para consultores en ProjectsPage.tsx:58

#### POST /desafios/create
- **Tipo:** Insert Supabase
- **Tabla:** `desafio`
- **Trigger:** Formulario "Publicar Nuevo Proyecto" en ProjectsPage.tsx:268-370
- **Campos del form:** titulo, descripcion, presupuesto_estimado, modalidad, especialidad_requerida
- **Logica:**
  ```ts
  const { data, error } = await supabase
    .from('desafio')
    .insert({
      id_empresa: empresaId,
      titulo: newProject.title,
      descripcion: newProject.description,
      presupuesto_estimado: parseBudget(newProject.budget),
      modalidad: 'remoto',
      especialidad_requerida: newProject.skills,
      estado: 'activo',
      fecha_publicacion: new Date().toISOString(),
    })
    .select();
  ```
- **Reemplaza:** `handleSubmitProject()` que solo limpia el form (ProjectsPage.tsx:59-68)

#### POST /postulaciones/apply
- **Tipo:** Insert Supabase
- **Tabla:** `postulacion`
- **Trigger:** Boton que debe agregarse en vista de desafio individual
- **Logica:**
  ```ts
  const { data, error } = await supabase
    .from('postulacion')
    .insert({
      id_desafio: desafioId,
      id_consultor: consultorId,
      mensaje_presentacion: mensaje,
      propuesta_economica: propuesta,
      estado: 'pendiente',
      fecha_postulacion: new Date().toISOString(),
    });
  ```

---

### 5. NetworkPage — PENDIENTE

**Contexto:** Gestion de conexiones y favoritos. Actualmente hardcoded con 4 conexiones y 3 favoritos.

#### GET /network/connections
- **Tipo:** Query Supabase
- **Tabla:** Necesita tabla `conexiones` (no existe aun)
- **Schema sugerido:**
  ```sql
  CREATE TABLE conexiones (
    id serial PRIMARY KEY,
    user_id uuid REFERENCES profiles(id),
    connected_user_id uuid REFERENCES profiles(id),
    estado varchar DEFAULT 'pendiente', -- pendiente, aceptada, rechazada
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, connected_user_id)
  );
  ```
- **Reemplaza:** Array `connections` (4 objetos) en NetworkPage.tsx:9-50

#### GET /network/favorites
- **Tipo:** Query Supabase
- **Tabla:** Necesita tabla `favoritos` (no existe aun, `favorites` del schema viejo tampoco tiene datos)
- **Reemplaza:** Array `favorites` (3 objetos) en NetworkPage.tsx:52-83

#### POST /network/connections/add
- **Tipo:** Insert Supabase
- **Tabla:** `conexiones`
- **Trigger:** Boton "Anadir Conexion" (NetworkPage.tsx:215)

#### DELETE /network/connections/:id
- **Tipo:** Delete Supabase
- **Tabla:** `conexiones`

#### POST /network/favorites/toggle
- **Tipo:** Insert/Delete Supabase (toggle)
- **Tabla:** `favoritos`

---

### 6. MessagesPage — PENDIENTE

**Contexto:** Sistema de mensajeria directa. Actualmente todo hardcoded con 5 conversaciones y 6 mensajes mock.

#### GET /conversations
- **Tipo:** Query Supabase
- **Tabla:** Necesita tabla `conversaciones` y `mensajes_directos`
- **Schema sugerido:**
  ```sql
  CREATE TABLE conversaciones (
    id serial PRIMARY KEY,
    participante_1 uuid REFERENCES profiles(id),
    participante_2 uuid REFERENCES profiles(id),
    ultimo_mensaje text,
    ultimo_mensaje_at timestamptz,
    created_at timestamptz DEFAULT now(),
    UNIQUE(participante_1, participante_2)
  );

  CREATE TABLE mensajes_directos (
    id serial PRIMARY KEY,
    conversacion_id integer REFERENCES conversaciones(id),
    sender_id uuid REFERENCES profiles(id),
    contenido text NOT NULL,
    leido boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
  );
  ```
- **Reemplaza:** Arrays `conversations` y `messages` en MessagesPage.tsx:8-104

#### GET /conversations/:id/messages
- **Tipo:** Query Supabase con paginacion
- **Tabla:** `mensajes_directos`
- **Logica:**
  ```ts
  const { data } = await supabase
    .from('mensajes_directos')
    .select('*, profiles(full_name, avatar_url)')
    .eq('conversacion_id', conversationId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit);
  ```

#### POST /messages/send
- **Tipo:** Insert Supabase
- **Tabla:** `mensajes_directos` + UPDATE `conversaciones.ultimo_mensaje`
- **Trigger:** Boton enviar mensaje (MessagesPage.tsx:275)
- **Logica:**
  ```ts
  // Insert message
  await supabase.from('mensajes_directos').insert({
    conversacion_id: selectedConversation,
    sender_id: user.id,
    contenido: messageText,
  });
  // Update conversation
  await supabase.from('conversaciones')
    .update({ ultimo_mensaje: messageText, ultimo_mensaje_at: new Date() })
    .eq('id', selectedConversation);
  ```
- **Reemplaza:** `handleSendMessage()` que solo limpia el input (MessagesPage.tsx:115-120)
- **Comentario en codigo:** "Aqui iria la logica para enviar el mensaje" (linea 117)

#### REALTIME /messages/subscribe
- **Tipo:** Supabase Realtime subscription
- **Tabla:** `mensajes_directos`
- **Logica:**
  ```ts
  supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'mensajes_directos',
      filter: `conversacion_id=eq.${conversationId}`,
    }, (payload) => {
      setMessages(prev => [...prev, payload.new]);
    })
    .subscribe();
  ```

---

### 7. ProfilePage — PENDIENTE

**Contexto:** Perfil del usuario logueado. Actualmente muestra datos hardcoded de "Maria Gonzalez".

#### GET /profile/me
- **Tipo:** Query Supabase
- **Tablas:** `profiles` + `consultants` (si es consultor) o `empresa` (si es empresa)
- **Logica:**
  ```ts
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile.user_type === 'CONSULTOR') {
    const { data: consultor } = await supabase
      .from('consultants')
      .select('*')
      .eq('id', user.id)
      .single();
    // Merge profile + consultor data
  }
  ```
- **Reemplaza:** Datos hardcoded en ProfilePage.tsx:29-55

#### PUT /profile/update
- **Tipo:** Update Supabase
- **Tablas:** `profiles` + `consultants` o `empresa`
- **Trigger:** Boton "Editar" (ProfilePage.tsx:64)
- **Logica:**
  ```ts
  await supabase
    .from('profiles')
    .update({ full_name, city, avatar_url })
    .eq('id', user.id);

  // If consultant, also update extended data
  await supabase
    .from('consultants')
    .update({ role, bio, expertise })
    .eq('id', user.id);
  ```

#### PUT /profile/avatar
- **Tipo:** Supabase Storage upload + profile update
- **Bucket:** `avatars` (necesita crearse en Supabase Storage)
- **Trigger:** Click en avatar (ProfilePage.tsx:34)
- **Logica:**
  ```ts
  const { data } = await supabase.storage
    .from('avatars')
    .upload(`${user.id}/avatar.png`, file);
  const url = supabase.storage.from('avatars').getPublicUrl(data.path);
  await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
  ```

---

### 8. AnalyticsPage — PENDIENTE

**Contexto:** Dashboard de metricas. Actualmente 4 stats hardcoded.

#### GET /analytics/stats
- **Tipo:** Multiples queries Supabase con count/aggregation
- **Tablas:** Varias
- **Logica (vista Empresa):**
  ```ts
  const stats = {
    profileViews: /* requiere tabla de analytics/tracking */,
    newConnections: await supabase.from('conexiones').select('*', { count: 'exact', head: true })
      .eq('connected_user_id', user.id).gte('created_at', thirtyDaysAgo),
    activeProjects: await supabase.from('desafio').select('*', { count: 'exact', head: true })
      .eq('id_empresa', empresaId).eq('estado', 'activo'),
    engagement: /* requiere logica de calculo */,
  };
  ```
- **Reemplaza:** Stats hardcoded (2,547 / 142 / 8 / 94%) en AnalyticsPage.tsx:25-47
- **Nota:** Algunas metricas (profile views, engagement) requieren tablas de tracking que no existen aun

---

### 9. SettingsPage — PENDIENTE

**Contexto:** Preferencias de usuario. Todos los controles son visuales sin funcionalidad.

#### GET /settings
- **Tipo:** Query Supabase
- **Tabla:** Necesita tabla `user_settings` o columnas adicionales en `profiles`
- **Schema sugerido:**
  ```sql
  ALTER TABLE profiles ADD COLUMN settings jsonb DEFAULT '{
    "notifications": { "email": true, "push": true, "projects": true },
    "language": "es",
    "timezone": "America/Bogota"
  }';
  ```

#### PUT /settings/update
- **Tipo:** Update Supabase
- **Tabla:** `profiles.settings` (jsonb)
- **Trigger:** Todos los toggles y selects en SettingsPage.tsx

#### PUT /auth/password
- **Tipo:** Supabase Auth
- **Logica:** `supabase.auth.updateUser({ password: newPassword })`
- **Trigger:** Boton "Cambiar Contrasena" (SettingsPage.tsx:67)

---

## Resumen de Estado

### Endpoints ya funcionales (4)
| Endpoint | Pagina | Tabla |
|---|---|---|
| Auth signup | LoginPage | auth.users, profiles |
| Auth login | LoginPage | auth.users |
| Auth Google | LoginPage | auth.users |
| Fetch profile | AuthContext | profiles |

### Endpoints pendientes por prioridad

#### Prioridad 1 — Core (10 endpoints)
| # | Endpoint | Metodo | Pagina | Tabla |
|---|---|---|---|---|
| 1 | Listar consultores destacados | GET | HomePage | consultants + profiles |
| 2 | Buscar/filtrar consultores | GET | ExplorePage | consultants + profiles |
| 3 | Listar desafios (empresa) | GET | ProjectsPage | desafio + postulacion |
| 4 | Crear desafio | POST | ProjectsPage | desafio |
| 5 | Listar postulaciones (consultor) | GET | ProjectsPage | postulacion + desafio |
| 6 | Crear postulacion | POST | ProjectsPage | postulacion |
| 7 | Obtener perfil completo | GET | ProfilePage | profiles + consultants/empresa |
| 8 | Actualizar perfil | PUT | ProfilePage | profiles + consultants |
| 9 | Stats del dashboard | GET | HomePage | consultants, desafio, empresa |
| 10 | Stats de analytics | GET | AnalyticsPage | multiples tablas |

#### Prioridad 2 — Social (6 endpoints)
| # | Endpoint | Metodo | Pagina | Tabla |
|---|---|---|---|---|
| 11 | Listar conversaciones | GET | MessagesPage | conversaciones (nueva) |
| 12 | Listar mensajes de conversacion | GET | MessagesPage | mensajes_directos (nueva) |
| 13 | Enviar mensaje | POST | MessagesPage | mensajes_directos (nueva) |
| 14 | Suscripcion realtime mensajes | REALTIME | MessagesPage | mensajes_directos (nueva) |
| 15 | Listar conexiones | GET | NetworkPage | conexiones (nueva) |
| 16 | Agregar/eliminar conexion | POST/DELETE | NetworkPage | conexiones (nueva) |

#### Prioridad 3 — Complementarios (5 endpoints)
| # | Endpoint | Metodo | Pagina | Tabla |
|---|---|---|---|---|
| 17 | Toggle favorito | POST/DELETE | NetworkPage | favoritos (nueva) |
| 18 | Obtener settings | GET | SettingsPage | profiles.settings |
| 19 | Actualizar settings | PUT | SettingsPage | profiles.settings |
| 20 | Cambiar contrasena | PUT | SettingsPage | auth.users |
| 21 | Upload avatar | POST | ProfilePage | Supabase Storage |

---

## Tablas nuevas requeridas

Las tablas de negocio (`desafio`, `postulacion`, `contrato`, `calificacion`) ya existen. Faltan tablas para funcionalidad social:

### `conexiones`
```sql
CREATE TABLE conexiones (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  connected_user_id uuid REFERENCES profiles(id) NOT NULL,
  estado varchar(20) DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, connected_user_id)
);

-- RLS
ALTER TABLE conexiones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own connections" ON conexiones
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = connected_user_id);
CREATE POLICY "Users can insert connections" ON conexiones
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### `favoritos`
```sql
CREATE TABLE favoritos (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  favorito_user_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, favorito_user_id)
);

ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own favorites" ON favoritos
  USING (auth.uid() = user_id);
```

### `conversaciones`
```sql
CREATE TABLE conversaciones (
  id serial PRIMARY KEY,
  participante_1 uuid REFERENCES profiles(id) NOT NULL,
  participante_2 uuid REFERENCES profiles(id) NOT NULL,
  ultimo_mensaje text,
  ultimo_mensaje_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(participante_1, participante_2)
);

ALTER TABLE conversaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can see conversations" ON conversaciones
  FOR SELECT USING (auth.uid() = participante_1 OR auth.uid() = participante_2);
```

### `mensajes_directos`
```sql
CREATE TABLE mensajes_directos (
  id serial PRIMARY KEY,
  conversacion_id integer REFERENCES conversaciones(id) NOT NULL,
  sender_id uuid REFERENCES profiles(id) NOT NULL,
  contenido text NOT NULL,
  leido boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mensajes_directos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can see messages" ON mensajes_directos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversaciones c
      WHERE c.id = conversacion_id
      AND (auth.uid() = c.participante_1 OR auth.uid() = c.participante_2)
    )
  );
CREATE POLICY "Users can send messages" ON mensajes_directos
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

---

## Problema critico: Vinculacion Auth <-> Negocio

El frontend usa `profiles.id` (UUID de Supabase Auth) para identificar usuarios. Las tablas de negocio (`empresa`, `consultor`, `desafio`, `postulacion`) usan IDs integer independientes.

**Solucion recomendada:** Agregar columna `auth_user_id` a `empresa` y `consultor`:

```sql
ALTER TABLE empresa ADD COLUMN auth_user_id uuid REFERENCES profiles(id) UNIQUE;
ALTER TABLE consultor ADD COLUMN auth_user_id uuid REFERENCES profiles(id) UNIQUE;
```

Esto permite:
- Dado un usuario logueado (`auth.uid()`), encontrar su `id_empresa` o `id_consultor`
- Mantener las FK integer existentes en desafio/postulacion/contrato/calificacion
- No romper nada existente
