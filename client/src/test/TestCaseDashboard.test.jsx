import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { TestCaseDashboardPage } from '../pages/TestCaseDashboardPage.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';

describe('Frontend Test Case Dashboard UI & Functionality (Phase 6)', () => {
  const mockTestData = {
    success: true,
    summary: {
      total: 31,
      executed: 31,
      passed: 31,
      failed: 0,
      blocked: 0,
      notExecuted: 0,
      passRate: '100%',
      lastRunTimestamp: '2026-10-15T09:30:00Z'
    },
    tests: [
      {
        id: 'TC_LGN_01',
        name: 'Successful student/user authentication',
        category: 'Positive Scenarios',
        preconditions: 'Account testuser@email.com exists with Pass123!',
        steps: ['1. Enter testuser@email.com', '2. Enter Pass123!', '3. Click Sign In'],
        testData: 'Email: testuser@email.com | Password: Pass123!',
        expectedResult: 'User is authenticated and redirected to dashboard.',
        actualResult: 'HTTP 200 OK, JWT token generated, redirected.',
        status: 'Pass',
        duration: '42ms'
      },
      {
        id: 'TC_PWD_BVA_01',
        name: 'Password BVA length 7 (Lower boundary - 1)',
        category: 'Boundary Value Analysis',
        preconditions: 'Password policy 8-15 chars.',
        steps: ['1. Submit Ab1!xyz'],
        testData: 'Password: Ab1!xyz',
        expectedResult: 'Reject: Below 8 characters.',
        actualResult: 'HTTP 400 Bad Request.',
        status: 'Pass',
        duration: '12ms'
      }
    ]
  };

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTestData)
    });
  });

  it('Renders summary metrics cards correctly', async () => {
    render(
      <ToastProvider>
        <TestCaseDashboardPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('31').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/total tests/i)).toBeInTheDocument();
      expect(screen.getByText(/passed/i)).toBeInTheDocument();
      expect(screen.getByText(/zero regressions/i)).toBeInTheDocument();
    });
  });

  it('Renders test cases table and allows filtering', async () => {
    render(
      <ToastProvider>
        <TestCaseDashboardPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('TC_LGN_01')).toBeInTheDocument();
      expect(screen.getByText('TC_PWD_BVA_01')).toBeInTheDocument();
    });

    // Test Search input
    const searchInput = screen.getByPlaceholderText(/search test id/i);
    fireEvent.change(searchInput, { target: { value: 'TC_LGN_01' } });

    expect(screen.getByText('TC_LGN_01')).toBeInTheDocument();
    expect(screen.queryByText('TC_PWD_BVA_01')).not.toBeInTheDocument();
  });

  it('Opens Faculty Viva Presentation Mode with controls and step walkthrough', async () => {
    render(
      <ToastProvider>
        <TestCaseDashboardPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('TC_LGN_01')).toBeInTheDocument();
    });

    // Click Viva Presentation Mode button
    const presentationBtn = screen.getByRole('button', { name: /viva presentation mode/i });
    fireEvent.click(presentationBtn);

    expect(screen.getByText(/exit presentation view/i)).toBeInTheDocument();
    expect(screen.getByText(/exact test data & inputs/i)).toBeInTheDocument();
    expect(screen.getByText(/actual verified result \(pass\)/i)).toBeInTheDocument();
  });
});
