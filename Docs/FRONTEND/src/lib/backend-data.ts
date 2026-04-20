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
import { hasSupabaseServiceRole, supabase, supabaseAdmin } from './supabase';

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  user_type: string | null;
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
  return supabaseAdmin ?? supabase;
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

function getDefaultConversationMessages(consultant: ConsultantDirectoryItem): MessageThreadItem[] {
  const createdAt = new Date().toISOString();

  return [
    {
      id: `${consultant.id}-welcome`,
      text: `Hola, soy ${consultant.name}. Estoy disponible para conversar sobre ${consultant.expertise[0] ?? 'estrategia'}.`,
      time: '10:30',
      isOwn: false,
      createdAt,
    },
    {
      id: `${consultant.id}-reply`,
      text: 'Perfecto, quiero entender mejor tu experiencia y el alcance que podrías cubrir.',
      time: '10:35',
      isOwn: true,
      createdAt,
    },
  ];
}

function toStoredMessage(message: MessageThreadItem) {
  return {
    id: message.id,
    text: message.text,
    time: message.time,
    isOwn: message.isOwn,
    createdAt: message.createdAt,
  };
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

async function readUserMetadata(profileId: string) {
  const user = await getAuthUser(profileId);
  return user.user_metadata ?? {};
}

async function patchUserMetadata(
  profileId: string,
  updater: (metadata: Record<string, unknown>) => Record<string, unknown>,
) {
  const user = await getAuthUser(profileId);
  const currentMetadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const nextMetadata = updater(currentMetadata);

  const { data, error } = await supabaseAdmin!.auth.admin.updateUserById(profileId, {
    user_metadata: nextMetadata,
  });

  if (error) {
    throw error;
  }

  return data.user?.user_metadata ?? nextMetadata;
}

async function resolveBusinessRecords(profileId: string, email?: string | null) {
  const db = getDatabaseClient();
  const normalizedEmail = normalizeQueryValue(email)?.toLowerCase() ?? null;

  const [companyResult, consultantResult] = await Promise.all([
    normalizedEmail
      ? db.from('empresa').select('*').ilike('email_contacto', normalizedEmail).limit(1).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    normalizedEmail
      ? db.from('consultor').select('*').ilike('email', normalizedEmail).limit(1).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (companyResult.error) {
    throw companyResult.error;
  }

  if (consultantResult.error) {
    throw consultantResult.error;
  }

  return {
    companyRecord: (companyResult.data ?? null) as BusinessCompanyRow | null,
    consultantRecord: (consultantResult.data ?? null) as BusinessConsultorRow | null,
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
): ApplicationSummary {
  return {
    id: row.id_postulacion,
    challengeId: row.id_desafio,
    consultantId: row.id_consultor,
    status: row.estado ?? 'pendiente',
    coverLetter: row.mensaje_presentacion ?? '',
    proposedBudget: row.propuesta_economica ?? null,
    appliedAt: row.fecha_postulacion ?? null,
    challengeTitle: challenge?.titulo ?? null,
    challengeStatus: challenge?.estado ?? null,
    companyName: company?.nombre_empresa ?? null,
  };
}

function ensureProfileId(profileId?: string | null) {
  const normalized = normalizeQueryValue(profileId);
  if (!normalized) {
    throw createRuntimeError('profileId es obligatorio para esta operación.', 400);
  }

  return normalized;
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
  let query = supabase
    .from('consultants')
    .select('id, role, rating, projects, experience_years, age, bio, expertise, verified, profiles!inner(id, full_name, avatar_url, city, user_type)')
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
  let query = supabase
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

  return applicationRows.map((row) => {
    const challenge = row.id_desafio ? challenges[row.id_desafio] : null;
    const company = challenge?.id_empresa ? companies[challenge.id_empresa] : null;
    const result = mapApplication(row, challenge, company);

    if (!result.consultantId && row.id_consultor && consultants[row.id_consultor]) {
      result.consultantId = consultants[row.id_consultor].id_consultor;
    }

    return result;
  });
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
    supabase
      .from('profiles')
      .select('id, full_name', { count: 'exact' })
      .eq('user_type', 'EMPRESA')
      .ilike('full_name', '(DEMO)%'),
    supabase
      .from('consultants')
      .select('id, profiles!inner(full_name)')
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

export async function getProfileDetails(profileId: string): Promise<ProfileDetails> {
  const db = getDatabaseClient();
  const [authUser, profileResult, consultantResult] = await Promise.all([
    getAuthUser(profileId),
    db.from('profiles').select('*').eq('id', profileId).maybeSingle(),
    db
      .from('consultants')
      .select('id, role, rating, projects, experience_years, age, bio, expertise, verified, profiles!inner(id, full_name, avatar_url, city, user_type)')
      .eq('id', profileId)
      .maybeSingle(),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (consultantResult.error) {
    throw consultantResult.error;
  }

  const profile = profileResult.data as ProfileRow | null;
  if (!profile) {
    throw createRuntimeError('No encontramos el perfil solicitado.', 404);
  }

  const { companyRecord, consultantRecord } = await resolveBusinessRecords(profileId, authUser.email);
  const settings = normalizeSettings((authUser.user_metadata as Record<string, unknown> | undefined)?.settings);

  return {
    id: profile.id,
    fullName: profile.full_name ?? '',
    avatarUrl: buildAvatar(profile.full_name ?? 'Nexora', profile.avatar_url),
    city: profile.city ?? '',
    userType: profile.user_type ?? 'CONSULTOR',
    email: authUser.email ?? null,
    updatedAt: profile.updated_at ?? null,
    consultantProfile: consultantResult.data ? mapConsultant(consultantResult.data as ConsultantRow) : null,
    companyRecord: companyRecord
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
      : null,
    consultantRecord: consultantRecord
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
      : null,
    settings,
  };
}

export async function updateProfileDetails(input: {
  profileId: string;
  fullName?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  bio?: string | null;
  expertise?: string[] | null;
}) {
  const db = getDatabaseClient();
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

  if (Object.keys(profileUpdates).length > 0) {
    profileUpdates.updated_at = new Date().toISOString();
    const { error } = await db.from('profiles').update(profileUpdates).eq('id', input.profileId);
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
    const { error } = await db.from('consultants').update(consultantUpdates).eq('id', input.profileId);
    if (error) {
      throw error;
    }
  }

  return getProfileDetails(input.profileId);
}

export async function getUserSettings(profileId: string) {
  const metadata = await readUserMetadata(profileId);
  return normalizeSettings(metadata.settings);
}

export async function updateUserSettings(profileId: string, settings: Partial<UserSettings>) {
  const nextSettings = normalizeSettings({
    ...normalizeSettings((await readUserMetadata(profileId)).settings),
    ...settings,
    notifications: {
      ...normalizeSettings((await readUserMetadata(profileId)).settings).notifications,
      ...(settings.notifications ?? {}),
    },
  });

  await patchUserMetadata(profileId, (metadata) => ({
    ...metadata,
    settings: nextSettings,
  }));

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

  const connections = input.profileId ? await getNetworkCollection(input.profileId, 'connections') : null;
  const favorites = input.profileId ? await getNetworkCollection(input.profileId, 'favorites') : null;

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
    note: 'Las métricas combinan datos reales de Supabase con derivaciones provisionales mientras se completa el esquema social.',
  };
}

async function getNetworkCollection(profileId: string, kind: 'connections' | 'favorites'): Promise<NetworkCollection> {
  const consultants = await getConsultants();
  const metadata = await readUserMetadata(profileId);
  const metadataKey = kind === 'connections' ? 'networkConnections' : 'favoriteConsultants';
  const storedIds = normalizeStringList(metadata[metadataKey]);
  const fallbackIds = consultants
    .slice(kind === 'connections' ? 0 : 3, kind === 'connections' ? 3 : undefined)
    .map((consultant) => consultant.id);
  const ids = storedIds.length > 0 ? storedIds : fallbackIds;
  const items = ids
    .map((id) => consultants.find((consultant) => consultant.id === id))
    .filter((consultant): consultant is ConsultantDirectoryItem => Boolean(consultant))
    .map((consultant) => ({ ...consultant, connectedAt: null })) as NetworkDirectoryItem[];

  return {
    items,
    count: items.length,
    source: storedIds.length > 0 ? 'auth-metadata' : 'derived-demo',
    persistent: storedIds.length > 0,
    note:
      storedIds.length > 0
        ? 'Colección persistida en auth.user_metadata para el usuario autenticado.'
        : 'Colección demo derivada de consultores reales hasta que el usuario personalice su red.',
  };
}

export async function listNetworkConnections(profileId: string) {
  return getNetworkCollection(profileId, 'connections');
}

export async function listFavoriteConsultants(profileId: string) {
  return getNetworkCollection(profileId, 'favorites');
}

async function updateNetworkCollection(
  profileId: string,
  kind: 'connections' | 'favorites',
  consultantId: string,
  mode: 'add' | 'remove' | 'toggle',
) {
  const metadataKey = kind === 'connections' ? 'networkConnections' : 'favoriteConsultants';

  const updatedMetadata = await patchUserMetadata(profileId, (metadata) => {
    const currentIds = normalizeStringList(metadata[metadataKey]);
    const exists = currentIds.includes(consultantId);
    let nextIds = currentIds;

    if (mode === 'add' && !exists) {
      nextIds = [...currentIds, consultantId];
    } else if (mode === 'remove') {
      nextIds = currentIds.filter((id) => id !== consultantId);
    } else if (mode === 'toggle') {
      nextIds = exists ? currentIds.filter((id) => id !== consultantId) : [...currentIds, consultantId];
    }

    return {
      ...metadata,
      [metadataKey]: nextIds,
    };
  });

  return {
    consultantId,
    ids: normalizeStringList(updatedMetadata[metadataKey]),
  };
}

export async function addNetworkConnection(profileId: string, consultantId: string) {
  await updateNetworkCollection(profileId, 'connections', consultantId, 'add');
  return listNetworkConnections(profileId);
}

export async function removeNetworkConnection(profileId: string, consultantId: string) {
  await updateNetworkCollection(profileId, 'connections', consultantId, 'remove');
  return listNetworkConnections(profileId);
}

export async function toggleFavoriteConsultant(profileId: string, consultantId: string) {
  await updateNetworkCollection(profileId, 'favorites', consultantId, 'toggle');
  return listFavoriteConsultants(profileId);
}

function getStoredThreadMessages(
  metadata: Record<string, unknown>,
  conversationId: string,
): MessageThreadItem[] | null {
  const threads = metadata.messageThreads;
  if (!threads || typeof threads !== 'object') {
    return null;
  }

  const thread = (threads as Record<string, unknown>)[conversationId];
  if (!Array.isArray(thread)) {
    return null;
  }

  return thread
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const candidate = item as Partial<MessageThreadItem>;
      if (!candidate.id || !candidate.text || !candidate.createdAt) {
        return null;
      }

      return {
        id: candidate.id,
        text: candidate.text,
        time: candidate.time ?? formatTimeLabel(candidate.createdAt),
        isOwn: Boolean(candidate.isOwn),
        createdAt: candidate.createdAt,
      } satisfies MessageThreadItem;
    })
    .filter((item): item is MessageThreadItem => Boolean(item));
}

export async function listConversations(profileId: string): Promise<ConversationPreview[]> {
  const consultants = await getConsultants();
  const metadata = await readUserMetadata(profileId);

  return consultants.map((consultant, index) => {
    const storedThread = getStoredThreadMessages(metadata as Record<string, unknown>, consultant.id);
    const latestMessage = storedThread?.[storedThread.length - 1];

    return {
      id: consultant.id,
      consultantId: consultant.id,
      name: consultant.name,
      role: consultant.role,
      avatar: consultant.image,
      lastMessage:
        latestMessage?.text ??
        `Tengo disponibilidad para conversar sobre ${consultant.expertise[0] ?? 'estrategia'} y el alcance del reto.`,
      time: latestMessage ? formatRelativeLabel(latestMessage.createdAt) : ['Hace 5 min', 'Hace 30 min', 'Hace 2 horas', 'Ayer', 'Hace 2 dias'][index] ?? 'Esta semana',
      unread: latestMessage?.isOwn ? 0 : index === 0 ? 2 : 0,
      online: index % 2 === 0,
    };
  });
}

export async function getConversationThread(
  profileId: string,
  conversationId: string,
): Promise<ConversationThread> {
  const consultants = await getConsultants();
  const consultant = consultants.find((item) => item.id === conversationId);

  if (!consultant) {
    throw createRuntimeError('No encontramos la conversación solicitada.', 404);
  }

  const metadata = await readUserMetadata(profileId);
  const storedMessages = getStoredThreadMessages(metadata as Record<string, unknown>, conversationId);
  const items = storedMessages ?? getDefaultConversationMessages(consultant);

  return {
    conversationId,
    items,
    source: storedMessages ? 'auth-metadata' : 'derived-demo',
    persistent: Boolean(storedMessages),
  };
}

export async function sendConversationMessage(input: {
  profileId: string;
  conversationId: string;
  text: string;
}) {
  const currentThread = await getConversationThread(input.profileId, input.conversationId);
  const newMessage: MessageThreadItem = {
    id: `${input.conversationId}-${Date.now()}`,
    text: input.text.trim(),
    time: formatTimeLabel(new Date().toISOString()),
    isOwn: true,
    createdAt: new Date().toISOString(),
  };

  await patchUserMetadata(input.profileId, (metadata) => {
    const currentThreads = (metadata.messageThreads ?? {}) as Record<string, unknown>;
    const currentItems = currentThread.items.map(toStoredMessage);

    return {
      ...metadata,
      messageThreads: {
        ...currentThreads,
        [input.conversationId]: [...currentItems, newMessage],
      },
    };
  });

  return getConversationThread(input.profileId, input.conversationId);
}

export async function listAppointments(profileId: string): Promise<AppointmentSummary[]> {
  const consultants = await getConsultants();
  const metadata = await readUserMetadata(profileId);
  const appointments = Array.isArray(metadata.appointments) ? metadata.appointments : [];

  return appointments
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const candidate = item as Partial<AppointmentSummary>;
      const consultant = consultants.find((entry) => entry.id === candidate.consultantId);

      if (!candidate.id || !candidate.consultantId || !candidate.requestedAt) {
        return null;
      }

      return {
        id: candidate.id,
        consultantId: candidate.consultantId,
        consultantName: consultant?.name ?? candidate.consultantName ?? 'Consultor Nexora',
        requestedAt: candidate.requestedAt,
        note: candidate.note ?? '',
        status: candidate.status ?? 'pendiente',
        createdAt: candidate.createdAt ?? new Date().toISOString(),
      } satisfies AppointmentSummary;
    })
    .filter((item): item is AppointmentSummary => Boolean(item));
}

export async function scheduleAppointment(input: {
  profileId: string;
  consultantId: string;
  requestedAt: string;
  note?: string | null;
}) {
  const consultants = await getConsultants();
  const consultant = consultants.find((item) => item.id === input.consultantId);

  if (!consultant) {
    throw createRuntimeError('No encontramos el consultor seleccionado para agendar.', 404);
  }

  const appointment: AppointmentSummary = {
    id: `appointment-${Date.now()}`,
    consultantId: consultant.id,
    consultantName: consultant.name,
    requestedAt: input.requestedAt,
    note: input.note ?? '',
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  };

  await patchUserMetadata(input.profileId, (metadata) => {
    const current = Array.isArray(metadata.appointments) ? metadata.appointments : [];

    return {
      ...metadata,
      appointments: [...current, appointment],
    };
  });

  return appointment;
}
