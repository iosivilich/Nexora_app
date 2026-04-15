import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatsCard } from '../StatsCard';
import { Users } from 'lucide-react';

describe('StatsCard', () => {
  it('renders title', () => {
    render(<StatsCard title="Consultores Activos" value="1,247" change="+12.5%" icon={Users} color="blue" />);
    expect(screen.getByText('Consultores Activos')).toBeInTheDocument();
  });

  it('renders value', () => {
    render(<StatsCard title="Consultores" value="1,247" change="+12.5%" icon={Users} color="blue" />);
    expect(screen.getByText('1,247')).toBeInTheDocument();
  });

  it('renders change percentage', () => {
    render(<StatsCard title="Consultores" value="1,247" change="+12.5%" icon={Users} color="blue" />);
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });
});
