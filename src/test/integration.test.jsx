import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import BarreNavigation from '../composants/BarreNavigation';

const MockedNavigation = () => (
  <MemoryRouter>
    <BarreNavigation />
  </MemoryRouter>
);

describe('App Integration', () => {
  it('renders navigation without crashing', () => {
    render(<MockedNavigation />);
    expect(screen.getByText('Logement Labé')).toBeInTheDocument();
  });

  it('shows navigation links', () => {
    render(<MockedNavigation />);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByText('Inscription')).toBeInTheDocument();
  });
});