import type {
  ChallengeSummary,
  CityCoverageItem,
  CompanyDirectoryItem,
  ConsultantDirectoryItem,
  DashboardSnapshot,
  SeedStatus,
  ApplicationSummary,
  ProfileDetails,
  UserSettings,
  AnalyticsStats,
  NetworkCollection,
  NetworkDirectoryItem,
  ConversationPreview,
  ConversationThread,
  MessageThreadItem,
  AppointmentSummary,
} from './backend-types';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createRouteHandlerClient } from './supabase-server';
import { hasSupabaseServiceRole, supabaseAdmin, supabasePublic } from './supabase';

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  user_type: string | null;
  empresa_id?: number | null;
  consultor_id?: number | null;
  updated_at?: string | null;
};

type ConsultantRow = {
  id: string;
  role: string | null;
  rating: number | null;
  projects: number | null;
  experience_years: number | null;
  age: number | null;
  bio: string | null;
  expertise: string[] | null;
  verified: boolean | null;
  profiles: ProfileRow | ProfileRow[] | null;
};

type BusinessCompanyRow = {
  id_empresa: number;
  nombre_empresa: string | null;
  sector: string | null;
  'tamaño_empresa': string | null;
  email_contacto: string | null;
  telefono: string | null;
  descripcion: string | null;
  fecha_registro: string | null;
  estado: string | null;
};

type BusinessConsultorRow = {
  id_consultor: number;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  telefono: string | null;
  especialidad: string | null;
  'años_experiencia': number | null;
  tarifa_referencial: number | null;
  estado: string | null;
  fecha_registro: string | null;
};

type ChallengeRow = {
  id_desafio: number;
  id_empresa: number | null;
  titulo: string | null;
  descripcion: string | null;
  especialidad_requerida: string | null;
  presupuesto_estimado: number | null;
  modalidad: string | null;
  fecha_publicacion: string | null;
  estado: string | null;
};

type ApplicationRow = {
  id_postulacion: number;
  id_desafio: number | null;
  id_consultor: number | null;
  mensaje_presentacion: string | null;
  propuesta_economica: number | null;
  fecha_postulacion: string | null;
  estado: string | null;
};

type UserSettingsRow = {
  user_id: string;
  notifications_email: boolean | null;
  notifications_push: boolean | null;
  notifications_projects: boolean | null;
  language: string | null;
  timezone: string | null;
  updated_at?: string | null;
};

type FavoriteRow = {
  user_id: string;
  consultant_profile_id: string;
  created_at: string | null;
};

type ConnectionRow = {
  user_id: string;
  consultant_profile_id: string;
  created_at: string | null;
};

type ConversationRow = {
  id: string;
  company_user_id: string;
  consultant_user_id: string;
  challenge_id: number | null;
  created_at: string;
  last_message_at: string | null;
};

type DirectMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

type AppointmentRow = {
  id: string;
  requester_id: string;
  consultant_profile_id: string;
  requested_at: string;
  note: string | null;
  status: string | null;
  created_at: string;
};

export type AuthenticatedBackendContext = {
  routeClient: SupabaseClient;
  user: User;
  profile: ProfileRow;
  consultantProfile: ConsultantDirectoryItem | null;
  companyRecord: BusinessCompanyRow | null;
  consultantRecord: BusinessConsultorRow | null;
};

const DEMO_COMPANIES = [
  {
    id: '8572366c-365d-44e5-99df-8f8a8089d66a',
    full_name: '(DEMO) Nexora Solutions',
    avatar_url: '',
    city: 'Bogota',
    user_type: 'EMPRESA',
  },
  {
    id: 'c993658f-d808-448b-b50c-a7963e6bae26',
    full_name: '(DEMO) TechInnovate Latam',
    avatar_url: '',
    city: 'Medellin',
    user_type: 'EMPRESA',
  },
  {
    id: '98032812-04f1-429f-a019-33bf78d5894c',
    full_name: '(DEMO) Bogota Digital Hub',
    avatar_url: '',
    city: 'Bogota',
    user_type: 'EMPRESA',
  },
  {
    id: 'd1ae2ce7-42e2-43cf-9d04-487f1898348c',
    full_name: '(DEMO) GreenFuture Energias',
    avatar_url: '',
    city: 'Cali',
    user_type: 'EMPRESA',
  },
  {
    id: '87df129c-078c-47bb-87e3-47ef0b8a447a',
    full_name: '(DEMO) Inversiones Capital Bogota',
    avatar_url: '',
    city: 'Bogota',
    user_type: 'EMPRESA',
  },
  {
    id: '68deda3e-835b-4bbc-bb8f-ce06a8e8de00',
    full_name: '(DEMO) Manufacturas Siglo XXI',
    avatar_url: '',
    city: 'Barranquilla',
    user_type: 'EMPRESA',
  },
] as const;

const DEMO_CONSULTANTS = [
  {
    profile: {
      id: '163523f8-ad95-4b66-bdad-8e39810761fd',
      full_name: '(DEMO) Marta Cloud',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400',
      city: 'Bogota',
      user_type: 'CONSULTOR',
    },
    consultant: {
      id: '163523f8-ad95-4b66-bdad-8e39810761fd',
      role: 'Arquitecta Cloud',
      rating: 5,
      projects: 15,
      experience_years: 15,
      age: 42,
      bio: 'Consultora demo especializada en arquitectura cloud y modernizacion de plataformas.',
      expertise: ['Cloud Computing'],
      verified: true,
    },
  },
  {
    profile: {
      id: '5626979d-84bb-45df-be79-c55a095e82e2',
      full_name: '(DEMO) Ana Estratega',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400',
      city: 'Medellin',
      user_type: 'CONSULTOR',
    },
    consultant: {
      id: '5626979d-84bb-45df-be79-c55a095e82e2',
      role: 'Lider en Agilidad',
      rating: 4.9,
      projects: 35,
      experience_years: 12,
      age: 38,
      bio: 'Consultora demo enfocada en estrategia agil, transformacion de equipos y mejora continua.',
      expertise: ['Agile Coaching'],
      verified: true,
    },
  },
  {
    profile: {
      id: '491d9499-7d63-42c0-94f9-8d204cc968fd',
      full_name: '(DEMO) Carlos Experto',
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400',
      city: 'Bogota',
      user_type: 'CONSULTOR',
    },
    consultant: {
      id: '491d9499-7d63-42c0-94f9-8d204cc968fd',
      role: 'Especialista en Ciberseguridad',
      rating: 4.8,
      projects: 20,
      experience_years: 10,
      age: 34,
      bio: 'Consultor demo con enfoque en ciberseguridad, gobierno TI y mitigacion de riesgo.',
      expertise: ['Cyber Security'],
      verified: true,
    },
  },
  {
    profile: {
      id: 'a8da3ec7-6a9b-405f-a4e7-dbc241bad602',
      full_name: '(DEMO) Felipe Data',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400',
      city: 'Bogota',
      user_type: 'CONSULTOR',
    },
    consultant: {
      id: 'a8da3ec7-6a9b-405f-a4e7-dbc241bad602',
      role: 'Cientifico de Datos',
      rating: 4.7,
      projects: 50,
      experience_years: 8,
      age: 30,
      bio: 'Consultor demo dedicado a ciencia de datos, analitica avanzada y modelos predictivos.',
      expertise: ['Data Science'],
      verified: true,
    },
  },
  {
    profile: {
      id: 'ae90d09b-7a5c-415d-828f-50855a28d398',
      full_name: '(DEMO) Juan Blockchain',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
      city: 'Cali',
      user_type: 'CONSULTOR',
    },
    consultant: {
      id: 'ae90d09b-7a5c-415d-828f-50855a28d398',
      role: 'Consultor Web3',
      rating: 4.6,
      projects: 10,
      experience_years: 5,
      age: 28,
      bio: 'Consultor demo para iniciativas blockchain, tokenizacion y productos Web3.',
      expertise: ['Blockchain'],
      verified: true,
    },
  },
] as const;

const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    email: true,
    push: true,
    projects: true,
  },
  language: 'es',
  timezone: 'America/Bogota',
};

function buildAvatar(name: string, avatarUrl?: string | null) {
  if (avatarUrl) {
    return avatarUrl;
  }

  return `https://ui-avatars.com/api/?background=0A1F44&color=FFFFFF&bold=true&name=${encodeURIComponent(name)}`;
}

function normalizeProfile(row: ConsultantRow['profiles']) {
  if (Array.isArray(row)) {
    return row[0] ?? null;
  }

  return row;
}

function mapConsultant(row: ConsultantRow): ConsultantDirectoryItem {
  const profile = normalizeProfile(row.profiles);
  const name = toTitleCase(profile?.full_name ?? 'Consultor demo');
  const city = toTitleCase(profile?.city ?? 'Remoto');

  return {
    id: row.id,
    name,
    role: row.role ?? 'Consultor estrategico',
    location: `${city}, Colombia`,
    city,
    rating: row.rating ?? 0,
    projects: row.projects ?? 0,
    experience: row.experience_years ?? 0,
    age: row.age ?? 0,
    expertise: row.expertise ?? [],
    image: buildAvatar(name, profile?.avatar_url),
    verified: Boolean(row.verified),
    bio: row.bio ?? 'Perfil demo sincronizado desde Supabase.',
  };
}

function mapCompany(row: ProfileRow): CompanyDirectoryItem {
  const name = toTitleCase(row.full_name ?? 'Empresa demo');
  const city = toTitleCase(row.city ?? 'Colombia');

  return {
    id: row.id,
    name,
    location: `${city}, Colombia`,
    city,
    image: buildAvatar(name, row.avatar_url),
    updatedAt: row.updated_at ?? null,
  };
}

function toTitleCase(value: string | null) {
  if (!value) return '';
  return value
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(' ');
}

function readString(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return null;
}

function createRuntimeError(message: string, status = 400) {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
}

function getDatabaseClient() {
  return supabaseAdmin ?? supabasePublic;
}

function normalizeQueryValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeStringList(values: unknown) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
}

function normalizeUserType(value: unknown): 'EMPRESA' | 'CONSULTOR' | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return normalized === 'EMPRESA' || normalized === 'CONSULTOR' ? normalized : null;
}

function getAuthMetadata(user: User) {
  return (user.user_metadata ?? {}) as Record<string, unknown>;
}

function buildProfilePayloadFromAuthUser(user: User) {
  const metadata = getAuthMetadata(user);
  const fullName =
    readString(metadata, ['full_name', 'name']) ??
    user.email?.split('@')[0] ??
    'Usuario Nexora';
  const avatarUrl = readString(metadata, ['avatar_url', 'picture']);
  const city = readString(metadata, ['city']);
  const userType = normalizeUserType(metadata.user_type);

  return {
    full_name: fullName,
    avatar_url: avatarUrl,
    city,
    user_type: userType,
    updated_at: new Date().toISOString(),
  };
}

function formatRelativeLabel(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return 'Ahora';
  }

  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `Hace ${diffHours} horas`;
  }

  const diffDays = Math.round(diffHours / 24);
  return diffDays <= 1 ? 'Ayer' : `Hace ${diffDays} dias`;
}

function formatTimeLabel(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return 'Ahora';
  }

  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function getAuthUser(profileId: string) {
  if (!supabaseAdmin) {
    throw createRuntimeError('La SUPABASE_SERVICE_ROLE_KEY es necesaria para acceder a metadata del usuario.', 503);
  }

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(profileId);

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw createRuntimeError('No encontramos un usuario autenticado con ese profileId.', 404);
  }

  return data.user;
}

async function patchUserMetadata(
  profileId: string,
  patch: (metadata: Record<string, unknown>) => Record<string, unknown>,
) {
  const user = await getAuthUser(profileId);
  const nextMetadata = patch((user.user_metadata ?? {}) as Record<string, unknown>);
  const { error } = await supabaseAdmin!.auth.admin.updateUserById(profileId, {
    user_metadata: nextMetadata,
  });

  if (error) {
    throw error;
  }
}

async function syncProfileFromAuthUser(
  profile: ProfileRow | null,
  user: User,
  db: SupabaseClient = getDatabaseClient(),
) {
  const payload = buildProfilePayloadFromAuthUser(user);

  if (!profile) {
    const insertPayload = {
      id: user.id,
      ...payload,
    };

    const { data, error } = await db.from('profiles').upsert(insertPayload, { onConflict: 'id' }).select('*').single();

    if (error) {
      throw error;
    }

    return data as ProfileRow;
  }

  const updates: Partial<ProfileRow> = {};

  if (payload.full_name && !profile.full_name) {
    updates.full_name = payload.full_name;
  }

  if (payload.avatar_url && !profile.avatar_url) {
    updates.avatar_url = payload.avatar_url;
  }

  if (payload.city && !profile.city) {
    updates.city = payload.city;
  }

  if (payload.user_type && payload.user_type !== profile.user_type) {
    updates.user_type = payload.user_type;
  }

  if (Object.keys(updates).length === 0) {
    return profile;
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await db.from('profiles').update(updates).eq('id', user.id).select('*').single();

  if (error) {
    throw error;
  }

  return data as ProfileRow;
}

function mapUserSettingsRow(row: UserSettingsRow | null): UserSettings {
  if (!row) {
    return DEFAULT_SETTINGS;
  }

  return {
    notifications: {
      email: row.notifications_email ?? DEFAULT_SETTINGS.notifications.email,
      push: row.notifications_push ?? DEFAULT_SETTINGS.notifications.push,
      projects: row.notifications_projects ?? DEFAULT_SETTINGS.notifications.projects,
    },
    language: row.language ?? DEFAULT_SETTINGS.language,
    timezone: row.timezone ?? DEFAULT_SETTINGS.timezone,
  };
}

function toUserSettingsRow(userId: string, settings: UserSettings) {
  return {
    user_id: userId,
    notifications_email: settings.notifications.email,
    notifications_push: settings.notifications.push,
    notifications_projects: settings.notifications.projects,
    language: settings.language,
    timezone: settings.timezone,
    updated_at: new Date().toISOString(),
  };
}

async function resolveBusinessRecords(profile: ProfileRow, email?: string | null) {
  const db = getDatabaseClient();
  const normalizedEmail = normalizeQueryValue(email)?.toLowerCase() ?? null;
  const fallbackDisplayName =
    normalizeQueryValue(profile.full_name) ??
    normalizedEmail?.split('@')[0]?.replace(/[._-]+/g, ' ') ??
    'Usuario Nexora';

  const buildConsultantName = () => {
    const parts = fallbackDisplayName
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    return {
      nombre: parts[0] ?? 'Consultor',
      apellido: parts.slice(1).join(' ') || 'Nexora',
    };
  };

  const [linkedCompanyResult, linkedConsultantResult, fallbackCompanyResult, fallbackConsultantResult] =
    await Promise.all([
      profile.empresa_id
        ? db.from('empresa').select('*').eq('id_empresa', profile.empresa_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      profile.consultor_id
        ? db.from('consultor').select('*').eq('id_consultor', profile.consultor_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      !profile.empresa_id && normalizedEmail
        ? db.from('empresa').select('*').ilike('email_contacto', normalizedEmail).limit(1).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      !profile.consultor_id && normalizedEmail
        ? db.from('consultor').select('*').ilike('email', normalizedEmail).limit(1).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

  if (linkedCompanyResult.error) {
    throw linkedCompanyResult.error;
  }

  if (linkedConsultantResult.error) {
    throw linkedConsultantResult.error;
  }

  if (fallbackCompanyResult.error) {
    throw fallbackCompanyResult.error;
  }

  if (fallbackConsultantResult.error) {
    throw fallbackConsultantResult.error;
  }

  let companyRecord = (linkedCompanyResult.data ?? fallbackCompanyResult.data ?? null) as BusinessCompanyRow | null;
  let consultantRecord = (linkedConsultantResult.data ??
    fallbackConsultantResult.data ??
    null) as BusinessConsultorRow | null;

  if (profile.user_type === 'EMPRESA' && !companyRecord && normalizedEmail) {
    const { data, error } = await db
      .from('empresa')
      .insert({
        nombre_empresa: fallbackDisplayName,
        sector: 'General',
        'tamaño_empresa': null,
        email_contacto: normalizedEmail,
        telefono: null,
        descripcion: null,
        fecha_registro: new Date().toISOString(),
        estado: 'activo',
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    companyRecord = data as BusinessCompanyRow;
  }

  if (profile.user_type === 'CONSULTOR' && !consultantRecord && normalizedEmail) {
    const { nombre, apellido } = buildConsultantName();
    const { data, error } = await db
      .from('consultor')
      .insert({
        nombre,
        apellido,
        email: normalizedEmail,
        telefono: null,
        especialidad: 'Consultoría general',
        'años_experiencia': 0,
        tarifa_referencial: null,
        estado: 'activo',
        fecha_registro: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    consultantRecord = data as BusinessConsultorRow;
  }

  const profileLinkUpdates: Record<string, number> = {};
  if (!profile.empresa_id && companyRecord?.id_empresa) {
    profileLinkUpdates.empresa_id = companyRecord.id_empresa;
  }
  if (!profile.consultor_id && consultantRecord?.id_consultor) {
    profileLinkUpdates.consultor_id = consultantRecord.id_consultor;
  }

  if (Object.keys(profileLinkUpdates).length > 0) {
    await db.from('profiles').update(profileLinkUpdates).eq('id', profile.id);
  }

  return {
    companyRecord,
    consultantRecord,
  };
}

export async function getAuthenticatedContext(): Promise<AuthenticatedBackendContext> {
  const routeClient = await createRouteHandlerClient();
  const {
    data: { user },
    error,
  } = await routeClient.auth.getUser();

  if (error || !user) {
    throw createRuntimeError('Debes iniciar sesión para acceder a este recurso.', 401);
  }

  const db = getDatabaseClient();
  const [profileResult, consultantResult] = await Promise.all([
    db.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    db
      .from('consultants')
      .select(
        'id, role, rating, projects, experience_years, age, bio, expertise, verified, profiles!consultants_id_fkey(id, full_name, avatar_url, city, user_type, empresa_id, consultor_id, updated_at)',
      )
      .eq('id', user.id)
      .maybeSingle(),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (consultantResult.error) {
    throw consultantResult.error;
  }

  const profile = await syncProfileFromAuthUser(profileResult.data as ProfileRow | null, user, routeClient);

  const { companyRecord, consultantRecord } = await resolveBusinessRecords(profile, user.email ?? null);

  return {
    routeClient,
    user,
    profile,
    consultantProfile: consultantResult.data ? mapConsultant(consultantResult.data as ConsultantRow) : null,
    companyRecord,
    consultantRecord,
  };
}

function mapBusinessChallenge(
  row: ChallengeRow,
  applicantCount = 0,
): ChallengeSummary {
  const title = row.titulo ?? `Desafio ${row.id_desafio}`;
  const description = row.descripcion ?? 'Desafio sincronizado desde Supabase.';
  const status = row.estado ?? 'Pendiente';
  const mode = row.modalidad ?? 'Por definir';
  const publishedAt = row.fecha_publicacion ?? null;

  return {
    id: String(row.id_desafio),
    numericId: row.id_desafio,
    companyId: row.id_empresa,
    title,
    description,
    status: toTitleCase(status),
    mode,
    publishedAt,
    specialty: row.especialidad_requerida ?? null,
    budget: row.presupuesto_estimado ?? null,
    applicantCount,
    raw: row as unknown as Record<string, unknown>,
  };
}

function mapApplication(
  row: ApplicationRow,
  challenge?: ChallengeRow | null,
  company?: BusinessCompanyRow | null,
  consultant?: BusinessConsultorRow | null,
): ApplicationSummary {
  const consultantName = [consultant?.nombre, consultant?.apellido]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
    .trim();

  return {
    id: row.id_postulacion,
    challengeId: row.id_desafio,
    companyId: challenge?.id_empresa ?? null,
    consultantId: row.id_consultor,
    consultantName: consultantName || null,
    consultantEmail: consultant?.email ?? null,
    status: row.estado ?? 'pendiente',
    coverLetter: row.mensaje_presentacion ?? '',
    proposedBudget: row.propuesta_economica ?? null,
    appliedAt: row.fecha_postulacion ?? null,
    challengeTitle: challenge?.titulo ?? null,
    challengeStatus: challenge?.estado ?? null,
    companyName: company?.nombre_empresa ?? null,
  };
}

function normalizeSettings(input: unknown): UserSettings {
  if (!input || typeof input !== 'object') {
    return DEFAULT_SETTINGS;
  }

  const candidate = input as Partial<UserSettings>;

  return {
    notifications: {
      email: candidate.notifications?.email ?? DEFAULT_SETTINGS.notifications.email,
      push: candidate.notifications?.push ?? DEFAULT_SETTINGS.notifications.push,
      projects: candidate.notifications?.projects ?? DEFAULT_SETTINGS.notifications.projects,
    },
    language: candidate.language ?? DEFAULT_SETTINGS.language,
    timezone: candidate.timezone ?? DEFAULT_SETTINGS.timezone,
  };
}

export async function getConsultants(limit?: number) {
  let query = supabasePublic
    .from('consultants')
    .select('id, role, rating, projects, experience_years, age, bio, expertise, verified, profiles!consultants_id_fkey!inner(id, full_name, avatar_url, city, user_type)')
    .order('rating', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ((data ?? []) as ConsultantRow[]).map(mapConsultant);
}

export async function searchConsultants(filters: {
  limit?: number;
  search?: string | null;
  category?: string | null;
  minRating?: number | null;
  minExperience?: number | null;
  city?: string | null;
  minProjects?: number | null;
  maxAge?: number | null;
  featured?: boolean | null;
  verified?: boolean | null;
}) {
  let consultants = await getConsultants(filters.limit);

  if (filters.search) {
    const needle = filters.search.toLowerCase();
    consultants = consultants.filter((consultant) =>
      consultant.name.toLowerCase().includes(needle) ||
      consultant.role.toLowerCase().includes(needle) ||
      consultant.expertise.some((expertise) => expertise.toLowerCase().includes(needle)),
    );
  }

  if (filters.category) {
    consultants = consultants.filter((consultant) =>
      consultant.expertise.some((expertise) => expertise.toLowerCase().includes(filters.category!.toLowerCase())),
    );
  }

  if (typeof filters.minRating === 'number') {
    consultants = consultants.filter((consultant) => consultant.rating >= filters.minRating!);
  }

  if (typeof filters.minExperience === 'number') {
    consultants = consultants.filter((consultant) => consultant.experience >= filters.minExperience!);
  }

  if (filters.city) {
    consultants = consultants.filter((consultant) => consultant.city.toLowerCase() === filters.city!.toLowerCase());
  }

  if (typeof filters.minProjects === 'number') {
    consultants = consultants.filter((consultant) => consultant.projects >= filters.minProjects!);
  }

  if (typeof filters.maxAge === 'number') {
    consultants = consultants.filter((consultant) => consultant.age <= filters.maxAge!);
  }

  if (typeof filters.verified === 'boolean') {
    consultants = consultants.filter((consultant) => consultant.verified === filters.verified);
  }

  if (filters.featured) {
    consultants = consultants.slice(0, 4);
  }

  return consultants;
}

export async function getCompanies(limit?: number) {
  let query = supabasePublic
    .from('profiles')
    .select('id, full_name, avatar_url, city, user_type, updated_at')
    .eq('user_type', 'EMPRESA')
    .order('updated_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ((data ?? []) as ProfileRow[]).map(mapCompany);
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [consultants, companies] = await Promise.all([
    getConsultants(),
    getCompanies(),
  ]);

  const topCitiesMap = consultants.reduce<Record<string, number>>((acc, consultant) => {
    acc[consultant.city] = (acc[consultant.city] ?? 0) + 1;
    return acc;
  }, {});

  const topCities = Object.entries(topCitiesMap)
    .map(([city, total]) => ({ city, total }))
    .sort((left, right) => right.total - left.total)
    .slice(0, 3) as CityCoverageItem[];

  const averageRating = consultants.length
    ? Number(
        (
          consultants.reduce((sum, consultant) => sum + consultant.rating, 0) / consultants.length
        ).toFixed(1),
      )
    : 0;

  return {
    consultantCount: consultants.length,
    companyCount: companies.length,
    verifiedConsultantCount: consultants.filter((consultant) => consultant.verified).length,
    averageRating,
    featuredConsultants: consultants.slice(0, 4),
    companies,
    topCities,
  };
}

export async function getChallenges(): Promise<ChallengeSummary[]> {
  const db = getDatabaseClient();
  const { data, error } = await db.from('desafio').select('*');

  if (error) {
    throw error;
  }

  const challengeRows = (data ?? []) as ChallengeRow[];
  const { data: applicationsData, error: applicationsError } = await db
    .from('postulacion')
    .select('id_postulacion, id_desafio');

  if (applicationsError) {
    throw applicationsError;
  }

  const counts = ((applicationsData ?? []) as Array<{ id_postulacion: number; id_desafio: number | null }>).reduce<Record<number, number>>(
    (acc, application) => {
      if (application.id_desafio) {
        acc[application.id_desafio] = (acc[application.id_desafio] ?? 0) + 1;
      }
      return acc;
    },
    {},
  );

  return challengeRows.map((row) => mapBusinessChallenge(row, counts[row.id_desafio] ?? 0));
}

export async function listChallenges(filters: {
  idEmpresa?: number | null;
  status?: string | null;
  mode?: string | null;
  limit?: number | null;
}) {
  let items = await getChallenges();

  if (typeof filters.idEmpresa === 'number') {
    items = items.filter((item) => item.companyId === filters.idEmpresa);
  }

  if (filters.status) {
    items = items.filter((item) => item.status.toLowerCase() === filters.status!.toLowerCase());
  }

  if (filters.mode) {
    items = items.filter((item) => item.mode.toLowerCase() === filters.mode!.toLowerCase());
  }

  if (typeof filters.limit === 'number' && filters.limit > 0) {
    items = items.slice(0, filters.limit);
  }

  return items;
}

export async function createChallenge(input: {
  idEmpresa: number;
  title: string;
  description: string;
  specialty: string;
  budget?: number | null;
  mode?: string | null;
  status?: string | null;
}) {
  const db = getDatabaseClient();
  const { data, error } = await db
    .from('desafio')
    .insert({
      id_empresa: input.idEmpresa,
      titulo: input.title,
      descripcion: input.description,
      especialidad_requerida: input.specialty,
      presupuesto_estimado: input.budget ?? null,
      modalidad: input.mode ?? 'remoto',
      fecha_publicacion: new Date().toISOString(),
      estado: input.status ?? 'activo',
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapBusinessChallenge(data as ChallengeRow, 0);
}

export async function listApplications(filters: {
  idConsultor?: number | null;
  idEmpresa?: number | null;
  idDesafio?: number | null;
  status?: string | null;
}) {
  const db = getDatabaseClient();
  let query = db.from('postulacion').select('*').order('fecha_postulacion', { ascending: false });

  if (typeof filters.idConsultor === 'number') {
    query = query.eq('id_consultor', filters.idConsultor);
  }

  if (typeof filters.idDesafio === 'number') {
    query = query.eq('id_desafio', filters.idDesafio);
  }

  if (filters.status) {
    query = query.eq('estado', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const applicationRows = (data ?? []) as ApplicationRow[];
  const challengeIds = Array.from(new Set(applicationRows.map((row) => row.id_desafio).filter(Boolean))) as number[];
  const consultorIds = Array.from(new Set(applicationRows.map((row) => row.id_consultor).filter(Boolean))) as number[];

  const [challengeResult, companyResult, consultantResult] = await Promise.all([
    challengeIds.length
      ? db.from('desafio').select('*').in('id_desafio', challengeIds)
      : Promise.resolve({ data: [], error: null }),
    db.from('empresa').select('*'),
    consultorIds.length
      ? db.from('consultor').select('*').in('id_consultor', consultorIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (challengeResult.error) {
    throw challengeResult.error;
  }

  if (companyResult.error) {
    throw companyResult.error;
  }

  if (consultantResult.error) {
    throw consultantResult.error;
  }

  const challenges = ((challengeResult.data ?? []) as ChallengeRow[]).reduce<Record<number, ChallengeRow>>(
    (acc, challenge) => {
      acc[challenge.id_desafio] = challenge;
      return acc;
    },
    {},
  );

  const companies = ((companyResult.data ?? []) as BusinessCompanyRow[]).reduce<Record<number, BusinessCompanyRow>>(
    (acc, company) => {
      acc[company.id_empresa] = company;
      return acc;
    },
    {},
  );

  const consultants = ((consultantResult.data ?? []) as BusinessConsultorRow[]).reduce<Record<number, BusinessConsultorRow>>(
    (acc, consultant) => {
      acc[consultant.id_consultor] = consultant;
      return acc;
    },
    {},
  );

  let items = applicationRows.map((row) => {
    const challenge = row.id_desafio ? challenges[row.id_desafio] : null;
    const company = challenge?.id_empresa ? companies[challenge.id_empresa] : null;
    const consultant = row.id_consultor ? consultants[row.id_consultor] : null;
    const result = mapApplication(row, challenge, company, consultant);

    if (!result.consultantId && row.id_consultor && consultant) {
      result.consultantId = consultant.id_consultor;
    }

    return result;
  });

  if (typeof filters.idEmpresa === 'number') {
    items = items.filter((item) => item.companyId === filters.idEmpresa);
  }

  return items;
}

export async function createApplication(input: {
  idDesafio: number;
  idConsultor: number;
  coverLetter: string;
  proposedBudget?: number | null;
  status?: string | null;
}) {
  const db = getDatabaseClient();
  const { data, error } = await db
    .from('postulacion')
    .insert({
      id_desafio: input.idDesafio,
      id_consultor: input.idConsultor,
      mensaje_presentacion: input.coverLetter,
      propuesta_economica: input.proposedBudget ?? null,
      fecha_postulacion: new Date().toISOString(),
      estado: input.status ?? 'pendiente',
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  const items = await listApplications({ idDesafio: input.idDesafio });
  return items.find((item) => item.id === (data as ApplicationRow).id_postulacion) ?? mapApplication(data as ApplicationRow);
}

export async function getDemoSeedStatus(): Promise<SeedStatus> {
  const [companies, consultants] = await Promise.all([
    supabasePublic
      .from('profiles')
      .select('id, full_name', { count: 'exact' })
      .eq('user_type', 'EMPRESA')
      .ilike('full_name', '(DEMO)%'),
    supabasePublic
      .from('consultants')
      .select('id, profiles!consultants_id_fkey!inner(full_name)')
      .order('rating', { ascending: false }),
  ]);

  if (companies.error) {
    throw companies.error;
  }

  if (consultants.error) {
    throw consultants.error;
  }

  const consultantRows = (consultants.data ?? []) as Array<{
    id: string;
    profiles: { full_name: string | null } | { full_name: string | null }[] | null;
  }>;

  const consultantsSeeded = consultantRows.filter((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return profile?.full_name?.startsWith('(DEMO)') ?? false;
  }).length;

  const companiesSeeded = companies.count ?? 0;
  const ready = companiesSeeded >= DEMO_COMPANIES.length && consultantsSeeded >= DEMO_CONSULTANTS.length;

  return {
    companiesSeeded,
    consultantsSeeded,
    ready,
    canSeed: hasSupabaseServiceRole,
    note: ready
      ? 'Los perfiles demo ya existen en Supabase y la app puede leerlos.'
      : hasSupabaseServiceRole
        ? 'Faltan registros demo y el backend esta listo para sembrarlos con la service role key.'
        : 'Faltan registros demo y aun no hay SUPABASE_SERVICE_ROLE_KEY configurada para sembrarlos desde el backend.',
  };
}

export async function seedDemoData() {
  const currentStatus = await getDemoSeedStatus();

  if (currentStatus.ready) {
    return currentStatus;
  }

  if (!supabaseAdmin) {
    return currentStatus;
  }

  const { error: profilesError } = await supabaseAdmin
    .from('profiles')
    .upsert(
      [
        ...DEMO_COMPANIES,
        ...DEMO_CONSULTANTS.map(({ profile }) => profile),
      ],
      { onConflict: 'id' },
    );

  if (profilesError) {
    throw profilesError;
  }

  const { error: consultantsError } = await supabaseAdmin
    .from('consultants')
    .upsert(DEMO_CONSULTANTS.map(({ consultant }) => consultant), { onConflict: 'id' });

  if (consultantsError) {
    throw consultantsError;
  }

  return getDemoSeedStatus();
}

function mapCompanyRecord(companyRecord: BusinessCompanyRow | null) {
  return companyRecord
    ? {
        idEmpresa: companyRecord.id_empresa,
        nombreEmpresa: companyRecord.nombre_empresa ?? '',
        sector: companyRecord.sector ?? '',
        tamanoEmpresa: companyRecord['tamaño_empresa'] ?? null,
        emailContacto: companyRecord.email_contacto ?? null,
        telefono: companyRecord.telefono ?? null,
        descripcion: companyRecord.descripcion ?? null,
        estado: companyRecord.estado ?? null,
        fechaRegistro: companyRecord.fecha_registro ?? null,
      }
    : null;
}

function mapConsultantRecord(consultantRecord: BusinessConsultorRow | null) {
  return consultantRecord
    ? {
        idConsultor: consultantRecord.id_consultor,
        nombre: consultantRecord.nombre ?? '',
        apellido: consultantRecord.apellido ?? '',
        email: consultantRecord.email ?? null,
        telefono: consultantRecord.telefono ?? null,
        especialidad: consultantRecord.especialidad ?? null,
        anosExperiencia: consultantRecord['años_experiencia'] ?? null,
        tarifaReferencial: consultantRecord.tarifa_referencial ?? null,
        estado: consultantRecord.estado ?? null,
        fechaRegistro: consultantRecord.fecha_registro ?? null,
      }
    : null;
}

function buildProfileDetails(input: {
  profile: ProfileRow;
  user: User;
  consultantProfile: ConsultantDirectoryItem | null;
  companyRecord: BusinessCompanyRow | null;
  consultantRecord: BusinessConsultorRow | null;
  settings: UserSettings;
}): ProfileDetails {
  const metadata = getAuthMetadata(input.user);
  const fullName = input.profile.full_name ?? readString(metadata, ['full_name', 'name']) ?? '';
  const avatarUrl = input.profile.avatar_url ?? readString(metadata, ['avatar_url', 'picture']);
  const city = input.profile.city ?? readString(metadata, ['city']) ?? '';
  const metadataUserType = normalizeUserType(metadata.user_type);
  const userType =
    input.profile.user_type ??
    metadataUserType ??
    (input.companyRecord ? 'EMPRESA' : 'CONSULTOR');

  return {
    id: input.profile.id,
    fullName,
    avatarUrl: buildAvatar(fullName || 'Nexora', avatarUrl),
    city,
    userType,
    email: input.user.email ?? null,
    updatedAt: input.profile.updated_at ?? null,
    consultantProfile: input.consultantProfile,
    companyRecord: mapCompanyRecord(input.companyRecord),
    consultantRecord: mapConsultantRecord(input.consultantRecord),
    settings: input.settings,
  };
}

async function getUserSettingsRow(
  userId: string,
  db: SupabaseClient = getDatabaseClient(),
): Promise<UserSettingsRow | null> {
  const { data, error } = await db.from('user_settings').select('*').eq('user_id', userId).maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as UserSettingsRow | null;
}

export async function getCurrentProfileDetails(
  context: AuthenticatedBackendContext,
): Promise<ProfileDetails> {
  const settings = await getUserSettings(context.user.id, context.routeClient);

  return buildProfileDetails({
    profile: context.profile,
    user: context.user,
    consultantProfile: context.consultantProfile,
    companyRecord: context.companyRecord,
    consultantRecord: context.consultantRecord,
    settings,
  });
}

export async function getProfileDetails(profileId: string): Promise<ProfileDetails> {
  const db = getDatabaseClient();
  const [authUser, profileResult, consultantResult, settingsRow] = await Promise.all([
    getAuthUser(profileId),
    db.from('profiles').select('*').eq('id', profileId).maybeSingle(),
    db
      .from('consultants')
      .select(
        'id, role, rating, projects, experience_years, age, bio, expertise, verified, profiles!consultants_id_fkey!inner(id, full_name, avatar_url, city, user_type, empresa_id, consultor_id, updated_at)',
      )
      .eq('id', profileId)
      .maybeSingle(),
    getUserSettingsRow(profileId, db),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (consultantResult.error) {
    throw consultantResult.error;
  }

  const profile = await syncProfileFromAuthUser(profileResult.data as ProfileRow | null, authUser, db);

  const { companyRecord, consultantRecord } = await resolveBusinessRecords(profile, authUser.email ?? null);

  return buildProfileDetails({
    profile,
    user: authUser,
    consultantProfile: consultantResult.data ? mapConsultant(consultantResult.data as ConsultantRow) : null,
    companyRecord,
    consultantRecord,
    settings: mapUserSettingsRow(settingsRow),
  });
}

export async function updateProfileDetails(
  input: {
    profileId: string;
    fullName?: string | null;
    city?: string | null;
    avatarUrl?: string | null;
    userType?: 'EMPRESA' | 'CONSULTOR' | null;
    role?: string | null;
    bio?: string | null;
    expertise?: string[] | null;
  },
  db: SupabaseClient = getDatabaseClient(),
) {
  const profileUpdates: Record<string, unknown> = {};

  if (typeof input.fullName === 'string') {
    profileUpdates.full_name = input.fullName;
  }

  if (typeof input.city === 'string') {
    profileUpdates.city = input.city;
  }

  if (typeof input.avatarUrl === 'string') {
    profileUpdates.avatar_url = input.avatarUrl;
  }

  if (input.userType) {
    profileUpdates.user_type = input.userType;
    // Sincronizar con metadata de auth para consistencia
    if (supabaseAdmin) {
      await patchUserMetadata(input.profileId, (metadata) => ({
        ...metadata,
        user_type: input.userType,
      }));
    }
  }

  if (Object.keys(profileUpdates).length > 0) {
    profileUpdates.updated_at = new Date().toISOString();
    const { error } = await db.from('profiles').upsert({
      id: input.profileId,
      ...profileUpdates,
    });
    if (error) {
      throw error;
    }
  }

  const consultantUpdates: Record<string, unknown> = {};
  if (typeof input.role === 'string') {
    consultantUpdates.role = input.role;
  }
  if (typeof input.bio === 'string') {
    consultantUpdates.bio = input.bio;
  }
  if (Array.isArray(input.expertise)) {
    consultantUpdates.expertise = input.expertise;
  }
  if (Object.keys(consultantUpdates).length > 0) {
    consultantUpdates.updated_at = new Date().toISOString();
    const { error } = await db.from('consultants').upsert({
      id: input.profileId,
      ...consultantUpdates,
    });
    if (error) {
      throw error;
    }
  }

  return getProfileDetails(input.profileId);
}

export async function getUserSettings(
  profileId: string,
  db: SupabaseClient = getDatabaseClient(),
) {
  return mapUserSettingsRow(await getUserSettingsRow(profileId, db));
}

export async function updateUserSettings(
  profileId: string,
  settings: Partial<UserSettings>,
  db: SupabaseClient = getDatabaseClient(),
) {
  const currentSettings = await getUserSettings(profileId, db);
  const nextSettings = normalizeSettings({
    ...currentSettings,
    ...settings,
    notifications: {
      ...currentSettings.notifications,
      ...(settings.notifications ?? {}),
    },
  });

  const { error } = await db
    .from('user_settings')
    .upsert(toUserSettingsRow(profileId, nextSettings), { onConflict: 'user_id' });

  if (error) {
    throw error;
  }

  return nextSettings;
}

export async function updateUserPassword(profileId: string, newPassword: string) {
  if (!supabaseAdmin) {
    throw createRuntimeError('La SUPABASE_SERVICE_ROLE_KEY es necesaria para cambiar la contraseña.', 503);
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(profileId, {
    password: newPassword,
  });

  if (error) {
    throw error;
  }

  return { ok: true };
}

export async function getAnalyticsStats(input: {
  profileId?: string | null;
  idEmpresa?: number | null;
  idConsultor?: number | null;
}): Promise<AnalyticsStats> {
  const [dashboard, challenges, applications] = await Promise.all([
    getDashboardSnapshot(),
    listChallenges({
      idEmpresa: typeof input.idEmpresa === 'number' ? input.idEmpresa : null,
    }),
    listApplications({
      idConsultor: typeof input.idConsultor === 'number' ? input.idConsultor : null,
    }),
  ]);

  const connections = input.profileId
    ? await getNetworkCollection(input.profileId, 'connections')
    : null;
  const favorites = input.profileId
    ? await getNetworkCollection(input.profileId, 'favorites')
    : null;

  const profileViews = Math.max(
    dashboard.consultantCount * 25,
    dashboard.companyCount * 15,
    input.idConsultor ? applications.length * 40 : 0,
  );
  const newConnections = connections?.count ?? 0;
  const activeProjects = challenges.filter((challenge) => challenge.status.toLowerCase() === 'activo').length;
  const favoriteConsultants = favorites?.count ?? 0;
  const applicationsCount = applications.length;
  const engagement = Math.min(
    99,
    40 + dashboard.verifiedConsultantCount * 5 + newConnections * 3 + activeProjects * 4,
  );

  return {
    profileViews,
    newConnections,
    activeProjects,
    engagement,
    favoriteConsultants,
    applications: applicationsCount,
    note: 'Las métricas combinan datos del marketplace, postulaciones y actividad social persistida en Supabase.',
  };
}

async function getNetworkCollection(
  profileId: string,
  kind: 'connections' | 'favorites',
  db: SupabaseClient = getDatabaseClient(),
): Promise<NetworkCollection> {
  const table = kind === 'connections' ? 'connections' : 'favorites';
  const { data, error } = await db
    .from(table)
    .select('consultant_profile_id, created_at')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as Array<ConnectionRow | FavoriteRow>;
  const consultants = await getConsultants();
  const byId = new Map(consultants.map((consultant) => [consultant.id, consultant]));
  const items = rows
    .map((row) => {
      const consultant = byId.get(row.consultant_profile_id);
      if (!consultant) {
        return null;
      }

      const item: NetworkDirectoryItem = {
        ...consultant,
        connectedAt: row.created_at ?? null,
      };

      return item;
    })
    .filter((item): item is NetworkDirectoryItem => Boolean(item));

  return {
    items,
    count: items.length,
    source: 'supabase',
    persistent: true,
    note: items.length
      ? 'Colección persistida en tablas reales de Supabase.'
      : 'Todavía no tienes elementos guardados en esta colección.',
  };
}

export async function listNetworkConnections(
  profileId: string,
  db: SupabaseClient = getDatabaseClient(),
) {
  return getNetworkCollection(profileId, 'connections', db);
}

export async function listFavoriteConsultants(
  profileId: string,
  db: SupabaseClient = getDatabaseClient(),
) {
  return getNetworkCollection(profileId, 'favorites', db);
}

async function updateNetworkCollection(
  profileId: string,
  kind: 'connections' | 'favorites',
  consultantId: string,
  mode: 'add' | 'remove' | 'toggle',
  db: SupabaseClient = getDatabaseClient(),
) {
  const table = kind === 'connections' ? 'connections' : 'favorites';
  const { data: consultantData, error: consultantError } = await getDatabaseClient()
    .from('consultants')
    .select('id')
    .eq('id', consultantId)
    .maybeSingle();

  if (consultantError) {
    throw consultantError;
  }

  if (!consultantData) {
    throw createRuntimeError('No encontramos el consultor seleccionado.', 404);
  }

  if (mode === 'remove') {
    const { error } = await db
      .from(table)
      .delete()
      .eq('user_id', profileId)
      .eq('consultant_profile_id', consultantId);

    if (error) {
      throw error;
    }
  } else {
    const { data: existing, error: existingError } = await db
      .from(table)
      .select('user_id')
      .eq('user_id', profileId)
      .eq('consultant_profile_id', consultantId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (mode === 'toggle' && existing) {
      const { error } = await db
        .from(table)
        .delete()
        .eq('user_id', profileId)
        .eq('consultant_profile_id', consultantId);

      if (error) {
        throw error;
      }
    } else if (!existing) {
      const { error } = await db.from(table).insert({
        user_id: profileId,
        consultant_profile_id: consultantId,
      });

      if (error) {
        throw error;
      }
    }
  }

  return kind === 'connections'
    ? listNetworkConnections(profileId, db)
    : listFavoriteConsultants(profileId, db);
}

export async function addNetworkConnection(
  profileId: string,
  consultantId: string,
  db: SupabaseClient = getDatabaseClient(),
) {
  return updateNetworkCollection(profileId, 'connections', consultantId, 'add', db);
}

export async function removeNetworkConnection(
  profileId: string,
  consultantId: string,
  db: SupabaseClient = getDatabaseClient(),
) {
  return updateNetworkCollection(profileId, 'connections', consultantId, 'remove', db);
}

export async function toggleFavoriteConsultant(
  profileId: string,
  consultantId: string,
  db: SupabaseClient = getDatabaseClient(),
) {
  return updateNetworkCollection(profileId, 'favorites', consultantId, 'toggle', db);
}

async function getConversationRows(
  profileId: string,
  db: SupabaseClient = getDatabaseClient(),
) {
  const { data, error } = await db
    .from('conversations')
    .select('*')
    .or(`company_user_id.eq.${profileId},consultant_user_id.eq.${profileId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ConversationRow[];
}

async function getLatestMessagesByConversation(
  conversationIds: string[],
  db: SupabaseClient = getDatabaseClient(),
) {
  if (conversationIds.length === 0) {
    return new Map<string, DirectMessageRow>();
  }

  const { data, error } = await db
    .from('direct_messages')
    .select('*')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as DirectMessageRow[]).reduce<Map<string, DirectMessageRow>>((acc, message) => {
    acc.set(message.conversation_id, message);
    return acc;
  }, new Map());
}

export async function getOrCreateConversation(
  profileId: string,
  consultantId: string,
  db: SupabaseClient = getDatabaseClient(),
) {
  const dbAdmin = getDatabaseClient();
  const [profileResult, consultantResult, existingResult] = await Promise.all([
    dbAdmin.from('profiles').select('id, user_type').eq('id', profileId).maybeSingle(),
    dbAdmin.from('consultants').select('id').eq('id', consultantId).maybeSingle(),
    db
      .from('conversations')
      .select('*')
      .eq('company_user_id', profileId)
      .eq('consultant_user_id', consultantId)
      .maybeSingle(),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }
  if (consultantResult.error) {
    throw consultantResult.error;
  }
  if (existingResult.error) {
    throw existingResult.error;
  }

  const profile = profileResult.data as Pick<ProfileRow, 'id' | 'user_type'> | null;
  if (!profile || profile.user_type !== 'EMPRESA') {
    throw createRuntimeError(
      'Solo una empresa autenticada puede iniciar una conversación desde el directorio.',
      403,
    );
  }

  if (!consultantResult.data) {
    throw createRuntimeError('No encontramos el consultor seleccionado.', 404);
  }

  const existing = existingResult.data as ConversationRow | null;
  if (existing) {
    return existing;
  }

  const { data, error } = await db
    .from('conversations')
    .insert({
      company_user_id: profileId,
      consultant_user_id: consultantId,
      last_message_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as ConversationRow;
}

export async function listConversations(
  profileId: string,
  db: SupabaseClient = getDatabaseClient(),
): Promise<ConversationPreview[]> {
  const conversations = await getConversationRows(profileId, db);
  const latestMessages = await getLatestMessagesByConversation(
    conversations.map((conversation) => conversation.id),
    db,
  );
  const [consultants, companies] = await Promise.all([getConsultants(), getCompanies()]);
  const consultantsById = new Map(consultants.map((consultant) => [consultant.id, consultant]));
  const companiesById = new Map(companies.map((company) => [company.id, company]));

  return conversations.map((conversation) => {
    const isCompany = conversation.company_user_id === profileId;
    const counterpartConsultant = consultantsById.get(conversation.consultant_user_id);
    const counterpartCompany = companiesById.get(conversation.company_user_id);
    const latestMessage = latestMessages.get(conversation.id);

    return {
      id: conversation.id,
      consultantId: conversation.consultant_user_id,
      name: isCompany
        ? counterpartConsultant?.name ?? 'Consultor Nexora'
        : counterpartCompany?.name ?? 'Empresa Nexora',
      role: isCompany
        ? counterpartConsultant?.role ?? 'Consultor estrategico'
        : 'Empresa',
      avatar: isCompany
        ? counterpartConsultant?.image ?? buildAvatar('Consultor Nexora')
        : counterpartCompany?.image ?? buildAvatar('Empresa Nexora'),
      lastMessage: latestMessage?.content ?? 'Aún no hay mensajes en esta conversación.',
      time: latestMessage ? formatRelativeLabel(latestMessage.created_at) : 'Ahora',
      unread: 0,
      online: false,
    };
  });
}

async function resolveConversationForParticipant(
  profileId: string,
  conversationId: string,
  db: SupabaseClient = getDatabaseClient(),
) {
  const { data, error } = await db
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .or(`company_user_id.eq.${profileId},consultant_user_id.eq.${profileId}`)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as ConversationRow | null;
}

export async function getConversationThread(
  profileId: string,
  conversationId: string,
  db: SupabaseClient = getDatabaseClient(),
): Promise<ConversationThread> {
  const conversation = await resolveConversationForParticipant(profileId, conversationId, db);

  if (!conversation) {
    throw createRuntimeError('No encontramos la conversación solicitada.', 404);
  }

  const { data, error } = await db
    .from('direct_messages')
    .select('*')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  const items = ((data ?? []) as DirectMessageRow[]).map((message) => ({
    id: message.id,
    text: message.content,
    time: formatTimeLabel(message.created_at),
    isOwn: message.sender_id === profileId,
    createdAt: message.created_at,
  }));

  return {
    conversationId: conversation.id,
    items,
    source: 'supabase',
    persistent: true,
  };
}

export async function sendConversationMessage(
  input: {
    profileId: string;
    conversationId: string;
    text: string;
  },
  db: SupabaseClient = getDatabaseClient(),
) {
  let conversation = await resolveConversationForParticipant(input.profileId, input.conversationId, db);

  if (!conversation) {
    conversation = await getOrCreateConversation(input.profileId, input.conversationId, db);
  }

  const createdAt = new Date().toISOString();
  const { error } = await db.from('direct_messages').insert({
    conversation_id: conversation.id,
    sender_id: input.profileId,
    content: input.text.trim(),
    created_at: createdAt,
  });

  if (error) {
    throw error;
  }

  const { error: conversationError } = await db
    .from('conversations')
    .update({ last_message_at: createdAt })
    .eq('id', conversation.id);

  if (conversationError) {
    throw conversationError;
  }

  return getConversationThread(input.profileId, conversation.id, db);
}

export async function listAppointments(
  profileId: string,
  db: SupabaseClient = getDatabaseClient(),
): Promise<AppointmentSummary[]> {
  const { data, error } = await db
    .from('appointments')
    .select('*')
    .or(`requester_id.eq.${profileId},consultant_profile_id.eq.${profileId}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const consultants = await getConsultants();
  const consultantsById = new Map(consultants.map((consultant) => [consultant.id, consultant]));

  return ((data ?? []) as AppointmentRow[]).map((appointment) => ({
    id: appointment.id,
    consultantId: appointment.consultant_profile_id,
    consultantName:
      consultantsById.get(appointment.consultant_profile_id)?.name ?? 'Consultor Nexora',
    requestedAt: appointment.requested_at,
    note: appointment.note ?? '',
    status: appointment.status ?? 'pendiente',
    createdAt: appointment.created_at,
  }));
}

export async function scheduleAppointment(
  input: {
    profileId: string;
    consultantId: string;
    requestedAt: string;
    note?: string | null;
  },
  db: SupabaseClient = getDatabaseClient(),
) {
  const { data: consultantData, error: consultantError } = await getDatabaseClient()
    .from('consultants')
    .select('id')
    .eq('id', input.consultantId)
    .maybeSingle();

  if (consultantError) {
    throw consultantError;
  }

  if (!consultantData) {
    throw createRuntimeError('No encontramos el consultor seleccionado para agendar.', 404);
  }

  const { data, error } = await db
    .from('appointments')
    .insert({
      requester_id: input.profileId,
      consultant_profile_id: input.consultantId,
      requested_at: input.requestedAt,
      note: input.note ?? '',
      status: 'pendiente',
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  const appointment = data as AppointmentRow;
  const consultants = await getConsultants();
  const consultant = consultants.find((item) => item.id === appointment.consultant_profile_id);

  return {
    id: appointment.id,
    consultantId: appointment.consultant_profile_id,
    consultantName: consultant?.name ?? 'Consultor Nexora',
    requestedAt: appointment.requested_at,
    note: appointment.note ?? '',
    status: appointment.status ?? 'pendiente',
    createdAt: appointment.created_at,
  };
}
