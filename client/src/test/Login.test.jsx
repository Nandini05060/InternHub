import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';

// Helper to render LoginPage wrapped with required context providers
function renderLoginPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ToastProvider>
          <LoginPage />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Frontend Login Page Specification Tests (TC_LGN_01 - 08)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('TC_LGN_02: Show/hide password button toggles between masked and visible states', () => {
    renderLoginPage();

    const passwordInput = screen.getByLabelText(/^password/i);
    const toggleButton = screen.getByLabelText(/show password/i);

    // Initial state: password masked
    expect(passwordInput.type).toBe('password');
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false');

    // Click toggle: password becomes visible
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    expect(screen.getByLabelText(/hide password/i)).toHaveAttribute('aria-pressed', 'true');

    // Click toggle again: returns to masked
    fireEvent.click(screen.getByLabelText(/hide password/i));
    expect(passwordInput.type).toBe('password');
  });

  it('TC_LGN_05: Empty fields and invalid email validation messages appear', () => {
    renderLoginPage();

    const loginButton = screen.getByRole('button', { name: /sign in/i });

    // Submit with completely empty fields
    fireEvent.click(loginButton);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();

    // Type invalid email format
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email-string' } });
    fireEvent.click(loginButton);

    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('TC_LGN_07: Focus sequence order follows Email -> Password -> Sign In -> Forgot Password', () => {
    renderLoginPage();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    const forgotLink = screen.getByRole('button', { name: /forgot password\?/i });

    // Verify assigned tabIndex attributes
    expect(emailInput).toHaveAttribute('tabIndex', '1');
    expect(passwordInput).toHaveAttribute('tabIndex', '2');
    expect(loginButton).toHaveAttribute('tabIndex', '3');
    expect(forgotLink).toHaveAttribute('tabIndex', '4');

    // Verify sequential focus
    emailInput.focus();
    expect(document.activeElement).toBe(emailInput);

    passwordInput.focus();
    expect(document.activeElement).toBe(passwordInput);

    loginButton.focus();
    expect(document.activeElement).toBe(loginButton);

    forgotLink.focus();
    expect(document.activeElement).toBe(forgotLink);
  });

  it('TC_LGN_08: Pressing Enter key submits the form from the password field', async () => {
    // Mock successful login fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          token: 'mock-jwt-token-12345',
          user: { id: 5, name: 'Test Candidate', email: 'testuser@email.com', role: 'student' }
        })
    });

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password/i);

    fireEvent.change(emailInput, { target: { value: 'testuser@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Pass123!' } });

    // Press Enter in password input
    fireEvent.submit(passwordInput.closest('form'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'testuser@email.com', password: 'Pass123!' })
        })
      );
    });
  });

  it('TC_LGN_06: Displays 15-minute account lockout security notice when locked out', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 423,
      json: () =>
        Promise.resolve({
          success: false,
          locked: true,
          message: 'Account locked for 15 minutes due to too many failed attempts.'
        })
    });

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password/i);

    fireEvent.change(emailInput, { target: { value: 'testuser@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'BadPass' } });
    fireEvent.submit(passwordInput.closest('form'));

    await waitFor(() => {
      expect(screen.getAllByText(/account locked for 15 minutes due to too many failed attempts/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
