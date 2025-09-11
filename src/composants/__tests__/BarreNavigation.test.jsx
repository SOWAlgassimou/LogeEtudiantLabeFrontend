import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import BarreNavigation from '../BarreNavigation';

const MockedBarreNavigation = () => (
  <BrowserRouter>
    <BarreNavigation />
  </BrowserRouter>
);

describe('BarreNavigation', () => {
  it('renders navigation correctly', () => {
    render(<MockedBarreNavigation />);
    
    expect(screen.getByText('Logement Labé')).toBeInTheDocument();
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByText('Inscription')).toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    render(<MockedBarreNavigation />);
    
    const accueilLink = screen.getByRole('link', { name: 'Accueil' });
    const connexionLink = screen.getByRole('link', { name: 'Connexion' });
    const inscriptionLink = screen.getByRole('link', { name: 'Inscription' });
    
    expect(accueilLink).toHaveAttribute('href', '/');
    expect(connexionLink).toHaveAttribute('href', '/connexion');
    expect(inscriptionLink).toHaveAttribute('href', '/inscription');
  });
});