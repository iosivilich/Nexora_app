import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginPage } from '../LoginPage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
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
