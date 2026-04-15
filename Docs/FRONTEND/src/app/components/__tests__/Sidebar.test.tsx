import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '../Sidebar';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    profile: { user_type: 'EMPRESA' },
  }),
}));

describe('Sidebar', () => {
  it('renders the Nexora logo', () => {
    render(<Sidebar />);
    expect(screen.getByText('Nexora')).toBeInTheDocument();
  });

  it('renders navigation items for empresa', () => {
    render(<Sidebar />);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Explorar Talento')).toBeInTheDocument();
    expect(screen.getByText('Mi Red')).toBeInTheDocument();
    expect(screen.getByText('Proyectos Activos')).toBeInTheDocument();
    expect(screen.getByText('Mensajes')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders correct href attributes', () => {
    render(<Sidebar />);
    const homeLink = screen.getByText('Inicio').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
