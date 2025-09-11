import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Connexion from '../Connexion';
import { AuthProvider } from '../../context/AuthContext';

// Mock des modules
vi.mock('../../api/auth', () => ({
  login: vi.fn()
}));

const MockedConnexion = () => (
  <BrowserRouter>
    <AuthProvider>
      <Connexion />
    </AuthProvider>
  </BrowserRouter>
);

describe('Connexion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form elements', () => {
    render(<MockedConnexion />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('allows user to type in form fields', () => {
    render(<MockedConnexion />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('has required form validation', () => {
    render(<MockedConnexion />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('shows loading state when submitting valid form', async () => {
    const { login } = await import('../../api/auth');
    login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<MockedConnexion />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { 
      target: { value: 'password123' } 
    });
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Connexion...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});