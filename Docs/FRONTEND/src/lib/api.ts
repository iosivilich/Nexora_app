import type {
  ChallengeSummary,
  CompanyDirectoryItem,
  ConsultantDirectoryItem,
  DashboardSnapshot,
  ListResponse,
  SeedStatus,
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

export async function fetchSeedStatus() {
  return getJson<SeedStatus>('/api/demo/seed');
}

export async function triggerSeedDemo() {
  return getJson<SeedStatus>('/api/demo/seed', { method: 'POST' });
}
