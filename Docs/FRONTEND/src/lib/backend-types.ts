export interface ConsultantDirectoryItem {
  id: string;
  name: string;
  role: string;
  location: string;
  city: string;
  rating: number;
  projects: number;
  experience: number;
  age: number;
  expertise: string[];
  image: string;
  verified: boolean;
  bio: string;
}

export interface CompanyDirectoryItem {
  id: string;
  name: string;
  location: string;
  city: string;
  image: string;
  updatedAt: string | null;
}

export interface CityCoverageItem {
  city: string;
  total: number;
}

export interface DashboardSnapshot {
  consultantCount: number;
  companyCount: number;
  verifiedConsultantCount: number;
  averageRating: number;
  eliteConsultantsCount: number;
  featuredConsultants: ConsultantDirectoryItem[];
  companies: CompanyDirectoryItem[];
  topCities: CityCoverageItem[];
}

export interface ChallengeSummary {
  id: string;
  numericId?: number | null;
  companyId?: number | null;
  companyName?: string | null;
  title: string;
  description: string;
  status: string;
  mode: string;
  publishedAt: string | null;
  specialty?: string | null;
  budget?: number | null;
  applicantCount?: number;
  raw: Record<string, unknown>;
}

export interface SeedStatus {
  companiesSeeded: number;
  consultantsSeeded: number;
  ready: boolean;
  canSeed: boolean;
  note: string;
}

export interface ListResponse<T> {
  items: T[];
  count: number;
  source: 'supabase';
}

export interface ApplicationSummary {
  id: number;
  challengeId: number | null;
  companyId?: number | null;
  consultantId: number | null;
  consultantName?: string | null;
  consultantEmail?: string | null;
  status: string;
  coverLetter: string;
  proposedBudget: number | null;
  appliedAt: string | null;
  challengeTitle: string | null;
  challengeStatus: string | null;
  companyName: string | null;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    projects: boolean;
  };
  language: string;
  timezone: string;
}

export interface ProfileDetails {
  id: string;
  fullName: string;
  avatarUrl: string;
  city: string;
  userType: string;
  email: string | null;
  updatedAt: string | null;
  consultantProfile: ConsultantDirectoryItem | null;
  companyRecord: {
    idEmpresa: number;
    nombreEmpresa: string;
    sector: string;
    tamanoEmpresa: string | null;
    emailContacto: string | null;
    telefono: string | null;
    descripcion: string | null;
    estado: string | null;
    fechaRegistro: string | null;
  } | null;
  consultantRecord: {
    idConsultor: number;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    especialidad: string | null;
    anosExperiencia: number | null;
    tarifaReferencial: number | null;
    estado: string | null;
    fechaRegistro: string | null;
  } | null;
  settings: UserSettings;
}

export interface AnalyticsStats {
  profileViews: number;
  newConnections: number;
  activeProjects: number;
  engagement: number;
  favoriteConsultants: number;
  applications: number;
  note: string;
}

export interface NetworkDirectoryItem extends ConsultantDirectoryItem {
  connectedAt?: string | null;
}

export interface NetworkCollection {
  items: NetworkDirectoryItem[];
  count: number;
  source: 'supabase';
  persistent: boolean;
  note: string;
}

export interface ConversationPreview {
  id: string;
  consultantId: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface MessageThreadItem {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
  createdAt: string;
}

export interface ConversationThread {
  conversationId: string;
  items: MessageThreadItem[];
  source: 'supabase';
  persistent: boolean;
}

export interface AppointmentSummary {
  id: string;
  consultantId: string;
  consultantName: string;
  requestedAt: string;
  note: string;
  status: string;
  createdAt: string;
}
