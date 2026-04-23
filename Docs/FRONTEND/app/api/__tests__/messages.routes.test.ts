import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getAuthenticatedContext,
  getConversationThread,
  sendConversationMessage,
} = vi.hoisted(() => ({
  getAuthenticatedContext: vi.fn(),
  getConversationThread: vi.fn(),
  sendConversationMessage: vi.fn(),
}));

vi.mock('@/src/lib/backend-data', () => ({
  getAuthenticatedContext,
  getConversationThread,
  sendConversationMessage,
}));

import { GET as getThread } from '../messages/thread/route';
import { POST as postMessage } from '../messages/send/route';

describe('messages routes', () => {
  const routeClient = { kind: 'route-client' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires conversationId to read a thread', async () => {
    const response = await getThread(new Request('http://localhost/api/messages/thread'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'conversationId es obligatorio.' });
  });

  it('returns 403 when a user tries to read a conversation they do not own', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profileId: 'auth-user-id',
      routeClient,
    });
    getConversationThread.mockRejectedValueOnce(Object.assign(new Error('Forbidden'), { status: 403 }));

    const response = await getThread(
      new Request('http://localhost/api/messages/thread?conversationId=conversation-1'),
    );

    expect(response.status).toBe(403);
    expect(getConversationThread).toHaveBeenCalledWith('auth-user-id', 'conversation-1', routeClient);
  });

  it('sends messages as the authenticated participant', async () => {
    getAuthenticatedContext.mockResolvedValueOnce({
      profileId: 'auth-user-id',
      routeClient,
    });
    sendConversationMessage.mockResolvedValueOnce({
      conversationId: 'conversation-1',
      items: [],
      source: 'supabase',
      persistent: true,
    });

    const response = await postMessage(new Request('http://localhost/api/messages/send', {
      method: 'POST',
      body: JSON.stringify({
        profileId: 'tampered-user-id',
        conversationId: 'conversation-1',
        text: 'Hola equipo',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }));

    expect(response.status).toBe(200);
    expect(sendConversationMessage).toHaveBeenCalledWith({
      profileId: 'auth-user-id',
      conversationId: 'conversation-1',
      text: 'Hola equipo',
    }, routeClient);
  });
});
