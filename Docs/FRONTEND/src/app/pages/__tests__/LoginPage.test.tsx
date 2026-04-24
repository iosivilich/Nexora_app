import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { LoginPage } from '../LoginPage';

const { authenticateWithRedirect } = vi.hoisted(() => ({
  authenticateWithRedirect: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@clerk/nextjs', () => ({
  useClerk: () => ({
    client: {
      signIn: {
        authenticateWithRedirect,
      },
    },
  }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    signOut: vi.fn(),
    loading: false,
  }),
}));

vi.mock('../../../lib/clerk-client', () => ({
  isClerkClientConfigured: true,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://nexora-repo.vercel.app');
    window.history.replaceState({}, '', '/login');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('starts Clerk Google auth with the current origin callback routes', async () => {
    authenticateWithRedirect.mockResolvedValue(undefined);

    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /Google/ }));

    await waitFor(() =>
      expect(authenticateWithRedirect).toHaveBeenCalledWith({
        strategy: 'oauth_google',
        redirectUrl: 'http://localhost:3000/sso-callback',
        redirectUrlComplete: 'http://localhost:3000/auth/complete',
      }),
    );
  });

  it('prefers the browser origin over a configured app url', async () => {
    authenticateWithRedirect.mockResolvedValue(undefined);

    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /Google/ }));

    await waitFor(() =>
      expect(authenticateWithRedirect).toHaveBeenCalledWith({
        strategy: 'oauth_google',
        redirectUrl: 'http://localhost:3000/sso-callback',
        redirectUrlComplete: 'http://localhost:3000/auth/complete',
      }),
    );
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Bienvenido')).toBeInTheDocument();
    expect(screen.getByText(/Google es el acceso principal/i)).toBeInTheDocument();
  });

  it('does not render email or password access inputs', () => {
    render(<LoginPage />);
    expect(screen.queryByPlaceholderText('tu@ejemplo.com')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('••••••••')).not.toBeInTheDocument();
    expect(screen.queryByText('Regístrate aquí')).not.toBeInTheDocument();
  });

  it('renders Google login button', () => {
    render(<LoginPage />);
    expect(screen.getByText('Google')).toBeInTheDocument();
  });
});
