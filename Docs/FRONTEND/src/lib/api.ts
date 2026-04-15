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

export async function fetchChallenges() {
  return getJson<ListResponse<ChallengeSummary>>('/api/challenges');
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
  idDesafio?: number;
  status?: string;
}) {
  const searchParams = new URLSearchParams();

  if (typeof params.idConsultor === 'number') {
    searchParams.set('idConsultor', String(params.idConsultor));
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
  idConsultor: number;
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

export async function fetchProfile(profileId: string) {
  return getJson<ProfileDetails>(`/api/profile/me?profileId=${encodeURIComponent(profileId)}`);
}

export async function updateProfile(input: {
  profileId: string;
  fullName?: string;
  city?: string;
  avatarUrl?: string;
  role?: string;
  bio?: string;
  expertise?: string[];
}) {
  return getJson<ProfileDetails>('/api/profile/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
}

export async function fetchSettings(profileId: string) {
  return getJson<UserSettings>(`/api/settings?profileId=${encodeURIComponent(profileId)}`);
}

export async function updateSettings(profileId: string, settings: Partial<UserSettings>) {
  return getJson<UserSettings>('/api/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ profileId, settings }),
  });
}

export async function updatePassword(profileId: string, newPassword: string) {
  return getJson<{ ok: true }>('/api/settings/password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ profileId, newPassword }),
  });
}

export async function fetchAnalytics(profileId?: string, idEmpresa?: number, idConsultor?: number) {
  const searchParams = new URLSearchParams();

  if (profileId) {
    searchParams.set('profileId', profileId);
  }

  if (typeof idEmpresa === 'number') {
    searchParams.set('idEmpresa', String(idEmpresa));
  }

  if (typeof idConsultor === 'number') {
    searchParams.set('idConsultor', String(idConsultor));
  }

  return getJson<AnalyticsStats>(`/api/analytics/stats?${searchParams.toString()}`);
}

export async function fetchConnections(profileId: string) {
  return getJson<NetworkCollection>(`/api/network/connections?profileId=${encodeURIComponent(profileId)}`);
}

export async function addConnection(profileId: string, consultantId: string) {
  return getJson<NetworkCollection>('/api/network/connections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ profileId, consultantId }),
  });
}

export async function removeConnection(profileId: string, consultantId: string) {
  return getJson<NetworkCollection>(`/api/network/connections?profileId=${encodeURIComponent(profileId)}&consultantId=${encodeURIComponent(consultantId)}`, {
    method: 'DELETE',
  });
}

export async function fetchFavorites(profileId: string) {
  return getJson<NetworkCollection>(`/api/network/favorites?profileId=${encodeURIComponent(profileId)}`);
}

export async function toggleFavorite(profileId: string, consultantId: string) {
  return getJson<NetworkCollection>('/api/network/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ profileId, consultantId }),
  });
}

export async function fetchConversations(profileId: string) {
  return getJson<ListResponse<ConversationPreview>>(`/api/messages/conversations?profileId=${encodeURIComponent(profileId)}`);
}

export async function fetchMessageThread(profileId: string, conversationId: string) {
  return getJson<ConversationThread>(`/api/messages/thread?profileId=${encodeURIComponent(profileId)}&conversationId=${encodeURIComponent(conversationId)}`);
}

export async function sendMessage(profileId: string, conversationId: string, text: string) {
  return getJson<ConversationThread>('/api/messages/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ profileId, conversationId, text }),
  });
}

export async function fetchAppointments(profileId: string) {
  return getJson<ListResponse<AppointmentSummary>>(`/api/appointments?profileId=${encodeURIComponent(profileId)}`);
}

export async function createAppointment(input: {
  profileId: string;
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
