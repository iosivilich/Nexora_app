import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../Header';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    signOut: vi.fn(),
    loading: false,
  }),
}));

describe('Header', () => {
  it('renders the Nexora logo', () => {
    render(<Header />);
    expect(screen.getByText('Nexora')).toBeInTheDocument();
  });

  it('shows login button when not authenticated', () => {
    render(<Header />);
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
  });
});
