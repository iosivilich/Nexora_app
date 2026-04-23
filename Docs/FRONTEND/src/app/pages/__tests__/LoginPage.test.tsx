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
    expect(screen.getByPlaceholderText('tu@ejemplo.com')).toBeInTheDocument();
    expect(screen.getByText(/Google es el acceso principal/i)).toBeInTheDocument();
  });

  it('toggles between sign-in and sign-up', () => {
    render(<LoginPage />);
    expect(screen.getByText('Bienvenido')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Regístrate aquí'));
    expect(screen.getByText('Únete a Nexora')).toBeInTheDocument();
  });

  it('shows role selection in sign-up mode', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Regístrate aquí'));
    expect(screen.getByText('Soy Empresa')).toBeInTheDocument();
    expect(screen.getByText('Soy Consultor')).toBeInTheDocument();
  });

  it('shows avatar upload during sign-up', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Regístrate aquí'));
    expect(screen.getByText('Foto de perfil')).toBeInTheDocument();
    expect(screen.getByLabelText('Elegir foto')).toBeInTheDocument();
  });

  it('renders Google login button', () => {
    render(<LoginPage />);
    expect(screen.getByText('Google')).toBeInTheDocument();
  });
});
