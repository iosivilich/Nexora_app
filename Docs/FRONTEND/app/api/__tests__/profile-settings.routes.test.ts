import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getAuthenticatedContext,
  getCurrentProfileDetails,
  updateProfileDetails,
  getUserSettings,
  updateUserSettings,
} = vi.hoisted(() => ({
  getAuthenticatedContext: vi.fn(),
  getCurrentProfileDetails: vi.fn(),
  updateProfileDetails: vi.fn(),
  getUserSettings: vi.fn(),
  updateUserSettings: vi.fn(),
}));

vi.mock('@/src/lib/backend-data', () => ({
  getAuthenticatedContext,
  getCurrentProfileDetails,
  updateProfileDetails,
  getUserSettings,
  updateUserSettings,
}));

import { GET as getProfile, PUT as putProfile } from '../profile/me/route';
import { GET as getSettings, PUT as putSettings } from '../settings/route';

describe('profile and settings routes', () => {
  const routeClient = { kind: 'route-client' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 from /api/profile/me when there is no active session', async () => {
    getAuthenticatedContext.mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { status: 401 }));

    const response = await getProfile();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('ignores profileId from the client when updating /api/profile/me', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profileId: 'auth-user-id',
      routeClient,
    });
    updateProfileDetails.mockResolvedValueOnce({ id: 'auth-user-id', fullName: 'Juan' });

    const request = new Request('http://localhost/api/profile/me', {
      method: 'PUT',
      body: JSON.stringify({
        profileId: 'tampered-user-id',
        fullName: 'Juan',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await putProfile(request);

    expect(response.status).toBe(200);
    expect(updateProfileDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: 'auth-user-id',
        fullName: 'Juan',
      }),
      routeClient,
    );
  });

  it('returns 401 from /api/settings when there is no active session', async () => {
    getAuthenticatedContext.mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { status: 401 }));

    const response = await getSettings();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('stores settings for the authenticated user only', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profileId: 'auth-user-id',
      routeClient,
    });
    updateUserSettings.mockResolvedValueOnce({
      notifications: { email: true, push: false, projects: true },
      language: 'es',
      timezone: 'America/Bogota',
    });

    const request = new Request('http://localhost/api/settings', {
      method: 'PUT',
      body: JSON.stringify({
        profileId: 'tampered-user-id',
        settings: {
          language: 'es',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await putSettings(request);

    expect(response.status).toBe(200);
    expect(updateUserSettings).toHaveBeenCalledWith(
      'auth-user-id',
      { language: 'es' },
      routeClient,
    );
  });
});
