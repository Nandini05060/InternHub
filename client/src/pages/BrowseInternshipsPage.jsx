import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { internshipApi } from '../api/internshipApi.js';
import { InternshipCard } from '../components/internships/InternshipCard.jsx';
import { InternshipFilter } from '../components/internships/InternshipFilter.jsx';
import { InternshipDetailsModal } from '../components/internships/InternshipDetailsModal.jsx';
import { CardSkeleton } from '../components/common/SkeletonLoader.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Sparkles, ShieldCheck } from 'lucide-react';

export function BrowseInternshipsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [workType, setWorkType] = useState(searchParams.get('workType') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState(null);

  // Sync state into URL params
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;
    if (workType && workType !== 'All') params.workType = workType;
    if (sort && sort !== 'newest') params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [search, category, workType, sort, setSearchParams]);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const res = await internshipApi.getInternships({
        search,
        category,
        workType,
        sort
      });
      if (res.success) {
        setInternships(res.internships || []);
      }
    } catch (err) {
      console.error('Failed to load internships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchInternships();
    }, 250);
    return () => clearTimeout(debounceTimer);
  }, [search, category, workType, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setWorkType('All');
    setSort('newest');
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Internship Discovery Hub
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> All Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Hand-curated, active college internships. No expired dates, no dead links.
          </p>
        </div>
      </div>

      {/* Filter Component */}
      <InternshipFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        workType={workType}
        setWorkType={setWorkType}
        sort={sort}
        setSort={setSort}
        totalResults={internships.length}
        onReset={handleResetFilters}
      />

      {/* Grid of Listings */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : internships.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
          <EmptyState
            title="No matching internships found"
            description="We couldn't find any opportunities matching your selected filters. Try searching with different keywords or reset your filters."
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              onSelect={(item) => setSelectedInternship(item)}
              onStatusChange={fetchInternships}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedInternship && (
        <InternshipDetailsModal
          internship={selectedInternship}
          isOpen={Boolean(selectedInternship)}
          onClose={() => setSelectedInternship(null)}
          onStatusChange={fetchInternships}
        />
      )}
    </div>
  );
}
