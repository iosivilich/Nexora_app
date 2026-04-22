import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getAuthenticatedContext,
  createChallenge,
  listChallenges,
  createApplication,
  listApplications,
} = vi.hoisted(() => ({
  getAuthenticatedContext: vi.fn(),
  createChallenge: vi.fn(),
  listChallenges: vi.fn(),
  createApplication: vi.fn(),
  listApplications: vi.fn(),
}));

vi.mock('@/src/lib/backend-data', () => ({
  getAuthenticatedContext,
  createChallenge,
  listChallenges,
  createApplication,
  listApplications,
}));

import { GET as getChallenges, POST as postChallenges } from '../challenges/route';
import { GET as getApplications, POST as postApplications } from '../applications/route';

describe('business routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lets an authenticated company list only its own challenges with scope=mine', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profile: { user_type: 'EMPRESA' },
      companyRecord: { id_empresa: 17 },
    });
    listChallenges.mockResolvedValueOnce([
      { id: 'challenge-1', companyId: 17, title: 'Migracion cloud' },
    ]);

    const response = await getChallenges(new Request('http://localhost/api/challenges?scope=mine'));

    expect(response.status).toBe(200);
    expect(listChallenges).toHaveBeenCalledWith({
      idEmpresa: 17,
      status: null,
      mode: null,
      limit: null,
    });
  });

  it('prevents a consultant from creating challenges', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profile: { user_type: 'CONSULTOR' },
      companyRecord: null,
    });

    const response = await postChallenges(new Request('http://localhost/api/challenges', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Nuevo desafio',
        description: 'Detalle',
        specialty: 'Cloud',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }));

    expect(response.status).toBe(403);
    expect(createChallenge).not.toHaveBeenCalled();
  });

  it('creates challenges using the linked company from the session', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profile: { user_type: 'EMPRESA' },
      companyRecord: { id_empresa: 99 },
    });
    createChallenge.mockResolvedValueOnce({ id: 'challenge-2' });

    const response = await postChallenges(new Request('http://localhost/api/challenges', {
      method: 'POST',
      body: JSON.stringify({
        idEmpresa: 1,
        title: 'Expansion regional',
        description: 'Detalle',
        specialty: 'Estrategia',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }));

    expect(response.status).toBe(201);
    expect(createChallenge).toHaveBeenCalledWith({
      idEmpresa: 99,
      title: 'Expansion regional',
      description: 'Detalle',
      specialty: 'Estrategia',
      budget: null,
      mode: null,
      status: null,
    });
  });

  it('lets a company list only applications for its own projects', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profile: { user_type: 'EMPRESA' },
      companyRecord: { id_empresa: 44 },
    });
    listApplications.mockResolvedValueOnce([{ id: 1 }]);

    const response = await getApplications(new Request('http://localhost/api/applications'));

    expect(response.status).toBe(200);
    expect(listApplications).toHaveBeenCalledWith({
      idConsultor: null,
      idEmpresa: 44,
      idDesafio: null,
      status: null,
    });
  });

  it('returns an empty applications payload for a consultant without linked business record yet', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profile: { user_type: 'CONSULTOR' },
      consultantRecord: null,
    });

    const response = await getApplications(new Request('http://localhost/api/applications'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [],
      count: 0,
      source: 'supabase',
    });
    expect(listApplications).not.toHaveBeenCalled();
  });

  it('prevents a company from creating consultant applications', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profile: { user_type: 'EMPRESA' },
      consultantRecord: null,
    });

    const response = await postApplications(new Request('http://localhost/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        idDesafio: 10,
        coverLetter: 'Me interesa',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }));

    expect(response.status).toBe(403);
    expect(createApplication).not.toHaveBeenCalled();
  });

  it('creates applications using the linked consultant from the session', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profile: { user_type: 'CONSULTOR' },
      consultantRecord: { id_consultor: 55 },
    });
    createApplication.mockResolvedValueOnce({ id: 3 });

    const response = await postApplications(new Request('http://localhost/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        idConsultor: 1,
        idDesafio: 10,
        coverLetter: 'Tengo experiencia relevante',
        proposedBudget: 5000,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }));

    expect(response.status).toBe(201);
    expect(createApplication).toHaveBeenCalledWith({
      idDesafio: 10,
      idConsultor: 55,
      coverLetter: 'Tengo experiencia relevante',
      proposedBudget: 5000,
      status: null,
    });
  });
});
