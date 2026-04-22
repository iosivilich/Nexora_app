import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createRouteHandlerClient, updateProfileDetails } = vi.hoisted(() => ({
  createRouteHandlerClient: vi.fn(),
  updateProfileDetails: vi.fn(),
}));

vi.mock('@/src/lib/supabase-server', () => ({
  createRouteHandlerClient,
}));

vi.mock('@/src/lib/backend-data', () => ({
  updateProfileDetails,
}));

import { GET } from '../callback/route';

describe('auth callback route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists Google onboarding data into the profile before redirecting', async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    const user = {
      id: 'user-123',
      email: 'carla@example.com',
      user_metadata: {
        name: 'Carla Gomez',
      },
    };

    createRouteHandlerClient.mockResolvedValueOnce({
      auth: {
        exchangeCodeForSession,
        getUser: vi.fn().mockResolvedValue({ data: { user } }),
        updateUser,
      },
    });

    const response = await GET(
      new Request(
        'https://nexora-app-juan.vercel.app/auth/callback?code=abc123&userType=CONSULTOR&fullName=Carla%20Gomez&city=Bogota',
      ),
    );

    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc123');
    expect(updateUser).toHaveBeenCalledWith({
      data: {
        name: 'Carla Gomez',
        user_type: 'CONSULTOR',
        full_name: 'Carla Gomez',
        city: 'Bogota',
      },
    });
    expect(updateProfileDetails).toHaveBeenCalledWith(
      {
        profileId: 'user-123',
        authUser: user,
        userType: 'CONSULTOR',
        fullName: 'Carla Gomez',
        city: 'Bogota',
      },
      expect.anything(),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://nexora-app-juan.vercel.app/');
  });
});
