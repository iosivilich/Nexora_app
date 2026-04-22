import type {
  ChallengeSummary,
  CompanyDirectoryItem,
  ConsultantDirectoryItem,
  DashboardSnapshot,
  ListResponse,
  SeedStatus,
  ApplicationSummary,
  ProfileDetails,
  UserSettings,
  AnalyticsStats,
  NetworkCollection,
  ConversationPreview,
  ConversationThread,
  AppointmentSummary,
} from './backend-types';

async function getJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.error ?? payload?.note ?? 'No fue posible completar la solicitud al backend.';
    throw new Error(message);
  }

  return payload as T;
}

export async function fetchConsultants(limit?: number) {
  const params = new URLSearchParams();

  if (limit) {
    params.set('limit', String(limit));
  }

  const query = params.toString();

  return getJson<ListResponse<ConsultantDirectoryItem>>(
    `/api/consultants${query ? `?${query}` : ''}`,
  );
}

export async function fetchCompanies(limit?: number) {
  const params = new URLSearchParams();

  if (limit) {
    params.set('limit', String(limit));
  }

  const query = params.toString();

  return getJson<ListResponse<CompanyDirectoryItem>>(
    `/api/companies${query ? `?${query}` : ''}`,
  );
}

export async function fetchDashboard() {
  return getJson<DashboardSnapshot>('/api/dashboard');
}

export async function fetchChallenges(params?: {
  scope?: 'mine';
  idEmpresa?: number;
  status?: string;
  mode?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.scope) {
    searchParams.set('scope', params.scope);
  }

  if (typeof params?.idEmpresa === 'number') {
    searchParams.set('idEmpresa', String(params.idEmpresa));
  }

  if (params?.status) {
    searchParams.set('status', params.status);
  }

  if (params?.mode) {
    searchParams.set('mode', params.mode);
  }

  if (typeof params?.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }

  const query = searchParams.toString();
  return getJson<ListResponse<ChallengeSummary>>(`/api/challenges${query ? `?${query}` : ''}`);
}

export async function createChallenge(input: {
  title: string;
  description: string;
  specialty: string;
  budget?: number | null;
  mode?: string | null;
  status?: string | null;
}) {
  return getJson<ChallengeSummary>('/api/challenges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
}

export async function fetchApplications(params: {
  idConsultor?: number;
  idEmpresa?: number;
  idDesafio?: number;
  status?: string;
}) {
  const searchParams = new URLSearchParams();

  if (typeof params.idConsultor === 'number') {
    searchParams.set('idConsultor', String(params.idConsultor));
  }

  if (typeof params.idEmpresa === 'number') {
    searchParams.set('idEmpresa', String(params.idEmpresa));
  }

  if (typeof params.idDesafio === 'number') {
    searchParams.set('idDesafio', String(params.idDesafio));
  }

  if (params.status) {
    searchParams.set('status', params.status);
  }

  const query = searchParams.toString();
  return getJson<ListResponse<ApplicationSummary>>(`/api/applications${query ? `?${query}` : ''}`);
}

export async function createApplication(input: {
  idDesafio: number;
  coverLetter: string;
  proposedBudget?: number | null;
  status?: string | null;
}) {
  return getJson<ApplicationSummary>('/api/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
}

export async function fetchProfile() {
  return getJson<ProfileDetails>('/api/profile/me');
}

export async function updateProfile(input: {
  fullName?: string;
  city?: string;
  avatarUrl?: string;
  role?: string;
  bio?: string;
  expertise?: string[];
  experienceYears?: number;
  age?: number;
  projects?: number;
  nombreEmpresa?: string;
  sector?: string;
  companySize?: string;
  emailContacto?: string;
  phone?: string;
}) {
  return getJson<ProfileDetails>('/api/profile/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
}

export async function uploadProfileAvatar(file: File) {
  const formData = new FormData();
  formData.set('avatar', file);

  return getJson<ProfileDetails>('/api/profile/avatar', {
    method: 'POST',
    body: formData,
  });
}

export async function fetchSettings() {
  return getJson<UserSettings>('/api/settings');
}

export async function updateSettings(settings: Partial<UserSettings>) {
  return getJson<UserSettings>('/api/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ settings }),
  });
}

export async function updatePassword(newPassword: string) {
  return getJson<{ ok: true }>('/api/settings/password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newPassword }),
  });
}

export async function fetchAnalytics(idEmpresa?: number, idConsultor?: number) {
  const searchParams = new URLSearchParams();

  if (typeof idEmpresa === 'number') {
    searchParams.set('idEmpresa', String(idEmpresa));
  }

  if (typeof idConsultor === 'number') {
    searchParams.set('idConsultor', String(idConsultor));
  }

  const query = searchParams.toString();
  return getJson<AnalyticsStats>(`/api/analytics/stats${query ? `?${query}` : ''}`);
}

export async function fetchConnections() {
  return getJson<NetworkCollection>('/api/network/connections');
}

export async function addConnection(consultantId: string) {
  return getJson<NetworkCollection>('/api/network/connections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ consultantId }),
  });
}

export async function removeConnection(consultantId: string) {
  return getJson<NetworkCollection>(`/api/network/connections?consultantId=${encodeURIComponent(consultantId)}`, {
    method: 'DELETE',
  });
}

export async function fetchFavorites() {
  return getJson<NetworkCollection>('/api/network/favorites');
}

export async function toggleFavorite(consultantId: string) {
  return getJson<NetworkCollection>('/api/network/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ consultantId }),
  });
}

export async function fetchConversations() {
  return getJson<ListResponse<ConversationPreview>>('/api/messages/conversations');
}

export async function ensureConversation(consultantId: string) {
  return getJson<{ id: string }>('/api/messages/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ consultantId }),
  });
}

export async function fetchMessageThread(conversationId: string) {
  return getJson<ConversationThread>(`/api/messages/thread?conversationId=${encodeURIComponent(conversationId)}`);
}

export async function sendMessage(conversationId: string, text: string) {
  return getJson<ConversationThread>('/api/messages/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ conversationId, text }),
  });
}

export async function fetchAppointments() {
  return getJson<ListResponse<AppointmentSummary>>('/api/appointments');
}

export async function createAppointment(input: {
  consultantId: string;
  requestedAt: string;
  note?: string | null;
}) {
  return getJson<AppointmentSummary>('/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
}

export async function fetchSeedStatus() {
  return getJson<SeedStatus>('/api/demo/seed');
}

export async function triggerSeedDemo() {
  return getJson<SeedStatus>('/api/demo/seed', { method: 'POST' });
}
