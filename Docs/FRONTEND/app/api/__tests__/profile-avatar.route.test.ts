import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getAuthenticatedContext,
  updateProfileDetails,
  createAdminClient,
} = vi.hoisted(() => ({
  getAuthenticatedContext: vi.fn(),
  updateProfileDetails: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock('@/src/lib/backend-data', () => ({
  getAuthenticatedContext,
  updateProfileDetails,
}));

vi.mock('@/src/lib/supabase-server', () => ({
  createAdminClient,
}));

import { POST as postAvatar } from '../profile/avatar/route';

describe('/api/profile/avatar', () => {
  const upload = vi.fn();
  const remove = vi.fn();
  const getPublicUrl = vi.fn();
  const routeClient = { kind: 'route-client' };

  beforeEach(() => {
    vi.clearAllMocks();

    upload.mockResolvedValue({ error: null });
    remove.mockResolvedValue({ error: null });
    getPublicUrl.mockReturnValue({
      data: {
        publicUrl: 'https://ofsuxhgyxzjhlboektvd.supabase.co/storage/v1/object/public/avatars/auth-user-id/avatar.png',
      },
    });

    createAdminClient.mockReturnValue({
      storage: {
        listBuckets: vi.fn().mockResolvedValue({ data: [], error: null }),
        createBucket: vi.fn().mockResolvedValue({ data: null, error: null }),
        updateBucket: vi.fn().mockResolvedValue({ data: null, error: null }),
        from: vi.fn(() => ({
          upload,
          remove,
          getPublicUrl,
        })),
      },
    });
  });

  it('uploads the avatar for the authenticated user', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profileId: 'auth-user-id',
      routeClient,
    });
    updateProfileDetails.mockResolvedValueOnce({
      id: 'auth-user-id',
      avatarUrl:
        'https://ofsuxhgyxzjhlboektvd.supabase.co/storage/v1/object/public/avatars/auth-user-id/avatar.png',
    });

    const formData = new FormData();
    formData.set('avatar', new File(['avatar'], 'avatar.png', { type: 'image/png' }));

    const response = await postAvatar({
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as Request);

    expect(response.status).toBe(200);
    expect(upload).toHaveBeenCalledWith(
      'auth-user-id/avatar.png',
      expect.any(ArrayBuffer),
      expect.objectContaining({
        contentType: 'image/png',
        upsert: true,
      }),
    );
    expect(updateProfileDetails).toHaveBeenCalledWith(
      {
        profileId: 'auth-user-id',
        avatarUrl:
          'https://ofsuxhgyxzjhlboektvd.supabase.co/storage/v1/object/public/avatars/auth-user-id/avatar.png',
      },
      routeClient,
    );
  });

  it('rejects unsupported file types', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profileId: 'auth-user-id',
      routeClient,
    });

    const formData = new FormData();
    formData.set('avatar', new File(['avatar'], 'avatar.gif', { type: 'image/gif' }));

    const response = await postAvatar({
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as Request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Usa una imagen JPG, PNG o WEBP.' });
    expect(upload).not.toHaveBeenCalled();
  });
});
