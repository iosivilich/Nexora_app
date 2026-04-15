import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConsultantCard } from '../ConsultantCard';

const mockProps = {
  name: 'María González',
  role: 'Consultora en Transformación Digital',
  location: 'Madrid, España',
  rating: 4.9,
  projects: 47,
  experience: 12,
  age: 38,
  expertise: ['Digital', 'Estrategia', 'Innovación'],
  image: 'https://example.com/photo.jpg',
  verified: true,
};

describe('ConsultantCard', () => {
  it('renders consultant name', () => {
    render(<ConsultantCard {...mockProps} />);
    expect(screen.getByText('María González')).toBeInTheDocument();
  });

  it('renders consultant role', () => {
    render(<ConsultantCard {...mockProps} />);
    expect(screen.getByText('Consultora en Transformación Digital')).toBeInTheDocument();
  });

  it('renders location', () => {
    render(<ConsultantCard {...mockProps} />);
    expect(screen.getByText('Madrid, España')).toBeInTheDocument();
  });

  it('renders expertise tags', () => {
    render(<ConsultantCard {...mockProps} />);
    expect(screen.getByText('Digital')).toBeInTheDocument();
    expect(screen.getByText('Estrategia')).toBeInTheDocument();
    expect(screen.getByText('Innovación')).toBeInTheDocument();
  });

  it('renders rating', () => {
    render(<ConsultantCard {...mockProps} />);
    expect(screen.getByText('4.9')).toBeInTheDocument();
  });

  it('renders action button', () => {
    render(<ConsultantCard {...mockProps} />);
    expect(screen.getByText('Ver Perfil')).toBeInTheDocument();
  });
});
