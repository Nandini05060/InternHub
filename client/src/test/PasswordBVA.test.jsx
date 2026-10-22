import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from '../pages/RegisterPage.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ToastProvider>
          <RegisterPage />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Frontend Password Boundary-Value Analysis (TC_PWD_BVA_01 - 06)', () => {
  const bvaCases = [
    { id: 'TC_PWD_BVA_01', pwd: 'Ab1!xyz', len: 7, shouldAccept: false },
    { id: 'TC_PWD_BVA_02', pwd: 'Ab1!xyzw', len: 8, shouldAccept: true },
    { id: 'TC_PWD_BVA_03', pwd: 'Ab1!xyzwa', len: 9, shouldAccept: true },
    { id: 'TC_PWD_BVA_04', pwd: 'Ab1!xyzwaBcDeF', len: 14, shouldAccept: true },
    { id: 'TC_PWD_BVA_05', pwd: 'Ab1!xyzwaBcDeFg', len: 15, shouldAccept: true },
    { id: 'TC_PWD_BVA_06', pwd: 'Ab1!xyzwaBcDeFgh', len: 16, shouldAccept: false }
  ];

  bvaCases.forEach(({ id, pwd, len, shouldAccept }) => {
    it(`${id}: Password "${pwd}" (Length: ${len}) should be ${shouldAccept ? 'Accepted' : 'Rejected'}`, async () => {
      expect(pwd.length).toBe(len);

      global.fetch = vi.fn().mockResolvedValue({
        ok: shouldAccept,
        status: shouldAccept ? 201 : 400,
        json: () =>
          Promise.resolve({
            success: shouldAccept,
            token: shouldAccept ? 'mock-token' : undefined,
            user: shouldAccept ? { id: 99, email: 'bva@college.edu' } : undefined,
            message: shouldAccept ? 'Account registered' : 'Password length must be between 8 and 15 characters.'
          })
      });

      renderRegisterPage();

      const nameInput = screen.getByPlaceholderText(/alex sharma/i);
      const emailInput = screen.getByPlaceholderText(/college\.edu/i);
      const passwordInputs = screen.getAllByPlaceholderText(/pass123!|repeat your password/i);
      const passwordInput = passwordInputs[0];
      const confirmInput = passwordInputs[1];
      const submitButton = screen.getByRole('button', { name: /complete registration/i });

      fireEvent.change(nameInput, { target: { value: 'BVA Candidate' } });
      fireEvent.change(emailInput, { target: { value: `bva_${len}@college.edu` } });
      fireEvent.change(passwordInput, { target: { value: pwd } });
      fireEvent.change(confirmInput, { target: { value: pwd } });

      fireEvent.click(submitButton);

      if (shouldAccept) {
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalled();
        });
      } else {
        expect(screen.getByText(/between 8 and 15 characters/i)).toBeInTheDocument();
      }
    });
  });
});
