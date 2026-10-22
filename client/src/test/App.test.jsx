import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { VerifiedBadge, WorkTypeBadge, DeadlineBadge } from '../components/common/Badge.jsx';
import { InternshipFilter } from '../components/internships/InternshipFilter.jsx';

// Mock fetch for client tests
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, internships: [] })
  })
);

describe('InternHub Frontend Components', () => {
  it('should render VerifiedBadge with check icon and label', () => {
    render(<VerifiedBadge />);
    expect(screen.getByText(/Verified Listing/i)).toBeInTheDocument();
  });

  it('should render WorkTypeBadge properly', () => {
    const { rerender } = render(<WorkTypeBadge type="remote" />);
    expect(screen.getByText(/Remote/i)).toBeInTheDocument();

    rerender(<WorkTypeBadge type="hybrid" />);
    expect(screen.getByText(/Hybrid/i)).toBeInTheDocument();

    rerender(<WorkTypeBadge type="on-site" />);
    expect(screen.getByText(/On-site/i)).toBeInTheDocument();
  });

  it('should render DeadlineBadge showing days left', () => {
    // 5 days in future
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    render(<DeadlineBadge deadline={futureDate} />);
    expect(screen.getByText(/days left/i)).toBeInTheDocument();
  });

  it('should render InternshipFilter controls and categories', () => {
    const setSearch = vi.fn();
    const setCategory = vi.fn();
    const setWorkType = vi.fn();
    const setSort = vi.fn();
    const onReset = vi.fn();

    render(
      <InternshipFilter
        search=""
        setSearch={setSearch}
        category="All"
        setCategory={setCategory}
        workType="All"
        setWorkType={setWorkType}
        sort="newest"
        setSort={setSort}
        totalResults={12}
        onReset={onReset}
      />
    );

    expect(screen.getByPlaceholderText(/Search by role, company/i)).toBeInTheDocument();
    expect(screen.getByText(/Software Engineering/i)).toBeInTheDocument();
    expect(screen.getByText(/Frontend/i)).toBeInTheDocument();
    expect(screen.getByText(/Backend/i)).toBeInTheDocument();
    expect(screen.getByText(/12/i)).toBeInTheDocument();
  });
});
