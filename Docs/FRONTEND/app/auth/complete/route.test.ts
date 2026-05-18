import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getAuthenticatedContext } = vi.hoisted(() => ({
  getAuthenticatedContext: vi.fn(),
}));

vi.mock('../../../src/lib/backend-data', () => ({
  getAuthenticatedContext,
}));

import { GET } from './route';

describe('auth complete route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects new Google users without onboarding data to /onboarding', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profile: {
        user_type: null,
        city: null,
      },
    });

    const response = await GET(new Request('https://nexora-repo.vercel.app/auth/complete'));

    expect(response.headers.get('location')).toBe('https://nexora-repo.vercel.app/onboarding');
  });

  it('keeps the requested next path for users with complete onboarding', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profile: {
        user_type: 'CONSULTOR',
        city: 'Bogota',
      },
    });

    const response = await GET(new Request('https://nexora-repo.vercel.app/auth/complete?next=%2Fproyectos'));

    expect(response.headers.get('location')).toBe('https://nexora-repo.vercel.app/proyectos');
  });

  it('sends unauthenticated users back to /login', async () => {
    getAuthenticatedContext.mockRejectedValueOnce(new Error('Unauthorized'));

    const response = await GET(new Request('https://nexora-repo.vercel.app/auth/complete'));

    expect(response.headers.get('location')).toBe('https://nexora-repo.vercel.app/login');
  });
});
