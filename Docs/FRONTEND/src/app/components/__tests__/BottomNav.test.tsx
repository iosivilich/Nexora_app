import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BottomNav } from '../BottomNav';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('BottomNav', () => {
  it('renders 5 navigation items', () => {
    render(<BottomNav />);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
    expect(screen.getByText('Proyectos')).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Mensajes')).toBeInTheDocument();
  });

  it('renders correct navigation links', () => {
    render(<BottomNav />);
    const homeLink = screen.getByText('Inicio').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
    const searchLink = screen.getByText('Buscar').closest('a');
    expect(searchLink).toHaveAttribute('href', '/explorar');
  });
});
