import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { LoginPage } from '../LoginPage';

const { signInWithOAuth } = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth,
    },
  },
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
  });

  it('starts Google auth with the callback route', () => {
    signInWithOAuth.mockResolvedValue({ error: null });

    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /Google/ }));

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'https://nexora-app-juan.vercel.app/auth/callback',
      },
    });
  });

  it('includes onboarding data in Google auth during sign-up', () => {
    signInWithOAuth.mockResolvedValue({ error: null });

    render(<LoginPage />);
    fireEvent.click(screen.getByText('Regístrate aquí'));
    fireEvent.change(screen.getByPlaceholderText('Ej: Carlos Ruiz'), {
      target: { value: 'Carla Gomez' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ej: Madrid'), {
      target: { value: 'bogota' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Soy Consultor/i }));
    fireEvent.click(screen.getByRole('button', { name: /Google/i }));

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo:
          'https://nexora-app-juan.vercel.app/auth/callback?userType=CONSULTOR&fullName=Carla+Gomez&city=Bogota',
      },
    });
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Bienvenido')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@ejemplo.com')).toBeInTheDocument();
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
