import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('legacy auth callback route', () => {
  it('forwards old callback urls to auth/complete', async () => {
    const response = await GET(
      new Request('https://nexora-repo.vercel.app/auth/callback?code=test-code&next=%2Fproyectos'),
    );

    expect(response.headers.get('location')).toBe('https://nexora-repo.vercel.app/auth/complete?next=%2Fproyectos');
  });
});
