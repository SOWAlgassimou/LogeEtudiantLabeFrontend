import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TabButton from '../TabButton';

describe('TabButton', () => {
  const defaultProps = {
    isActive: false,
    onClick: vi.fn(),
    icon: '/test-icon.png',
    label: 'Test Label'
  };

  it('renders correctly', () => {
    render(<TabButton {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByAltText('Test Label')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const mockClick = vi.fn();
    render(<TabButton {...defaultProps} onClick={mockClick} />);
    
    fireEvent.click(screen.getByText('Test Label'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('shows active state with underline', () => {
    render(<TabButton {...defaultProps} isActive={true} />);
    
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('underline');
  });

  it('displays badge when provided', () => {
    render(<TabButton {...defaultProps} badge={5} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<TabButton {...defaultProps} size="small" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    
    rerender(<TabButton {...defaultProps} size="normal" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });
});