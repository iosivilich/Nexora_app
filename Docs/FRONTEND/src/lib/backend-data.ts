import type {
  ChallengeSummary,
  CityCoverageItem,
  CompanyDirectoryItem,
  ConsultantDirectoryItem,
  DashboardSnapshot,
  SeedStatus,
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
  const name = profile?.full_name ?? 'Consultor demo';
  const city = profile?.city ?? 'Remoto';

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
  const name = row.full_name ?? 'Empresa demo';
  const city = row.city ?? 'Colombia';

  return {
    id: row.id,
    name,
    location: `${city}, Colombia`,
    city,
    image: buildAvatar(name, row.avatar_url),
    updatedAt: row.updated_at ?? null,
  };
}

function toTitleCase(value: string) {
  return value
    .split(/[\s_-]+/)
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
  const { data, error } = await supabase.from('desafio').select('*');

  if (error) {
    throw error;
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row, index) => {
    const title = readString(row, ['titulo', 'nombre', 'title']) ?? `Desafio ${index + 1}`;
    const description =
      readString(row, ['descripcion', 'resumen', 'description']) ??
      'Desafio sincronizado desde Supabase.';
    const status = readString(row, ['estado', 'status']) ?? 'Pendiente';
    const mode = readString(row, ['modalidad', 'mode']) ?? 'Por definir';
    const publishedAt = readString(row, ['fecha_publicacion', 'updated_at', 'created_at']);
    const id =
      readString(row, ['uuid', 'slug', 'titulo', 'nombre']) ??
      `${title.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`;

    return {
      id,
      title,
      description,
      status: toTitleCase(status),
      mode,
      publishedAt,
      raw: row,
    };
  });
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
