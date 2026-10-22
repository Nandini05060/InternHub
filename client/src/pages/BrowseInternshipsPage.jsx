import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { internshipApi } from '../api/internshipApi.js';
import { InternshipCard } from '../components/internships/InternshipCard.jsx';
import { InternshipFilter } from '../components/internships/InternshipFilter.jsx';
import { InternshipDetailsModal } from '../components/internships/InternshipDetailsModal.jsx';
import { CardSkeleton } from '../components/common/SkeletonLoader.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { PageHeading } from '../components/common/PageHeading.jsx';
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

export function BrowseInternshipsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [workType, setWorkType] = useState(searchParams.get('workType') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || 'All');
  const [stipendFilter, setStipendFilter] = useState(searchParams.get('stipend') || 'All');
  const [skillFilter, setSkillFilter] = useState(searchParams.get('skill') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [rawInternships, setRawInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState(null);

  const PAGE_SIZE = 6;

  // Sync state into URL params
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;
    if (workType && workType !== 'All') params.workType = workType;
    if (location && location !== 'All') params.location = location;
    if (stipendFilter && stipendFilter !== 'All') params.stipend = stipendFilter;
    if (skillFilter) params.skill = skillFilter;
    if (sort && sort !== 'newest') params.sort = sort;
    if (currentPage > 1) params.page = String(currentPage);

    setSearchParams(params, { replace: true });
  }, [search, category, workType, location, stipendFilter, skillFilter, sort, currentPage, setSearchParams]);

  // Fetch base listings from API
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
        setRawInternships(res.internships || []);
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
    }, 200);
    return () => clearTimeout(debounceTimer);
  }, [search, category, workType, sort]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, workType, location, stipendFilter, skillFilter, sort]);

  // Apply location, stipend, and skill filters in memory
  const filteredInternships = useMemo(() => {
    return rawInternships.filter((item) => {
      // Location filter
      if (location && location !== 'All') {
        const itemLoc = (item.location || '').toLowerCase();
        if (!itemLoc.includes(location.toLowerCase())) return false;
      }

      // Skill filter
      if (skillFilter) {
        const skills = Array.isArray(item.required_skills)
          ? item.required_skills.map(s => s.toLowerCase())
          : typeof item.required_skills === 'string'
          ? item.required_skills.toLowerCase().split(',').map(s => s.trim())
          : [];
        if (!skills.some(s => s.includes(skillFilter.toLowerCase()))) return false;
      }

      // Stipend filter
      if (stipendFilter && stipendFilter !== 'All') {
        const stipendStr = (item.stipend || '').replace(/,/g, '');
        const match = stipendStr.match(/\d+/);
        const stipendVal = match ? parseInt(match[0], 10) : 0;

        if (stipendFilter === 'paid' && stipendVal <= 0) return false;
        if (stipendFilter === '25k' && stipendVal < 25000) return false;
        if (stipendFilter === '40k' && stipendVal < 40000) return false;
      }

      return true;
    });
  }, [rawInternships, location, skillFilter, stipendFilter]);

  // Pagination calculation
  const totalItems = filteredInternships.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedInternships = useMemo(() => {
    const startIdx = (validPage - 1) * PAGE_SIZE;
    return filteredInternships.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredInternships, validPage]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setWorkType('All');
    setLocation('All');
    setStipendFilter('All');
    setSkillFilter('');
    setSort('newest');
    setCurrentPage(1);
  };

  const handleFilterBySkill = (skill) => {
    setSkillFilter(skill);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeading
        title="Internship Discovery Hub"
        badge="Verified Opportunities"
        badgeColor="emerald"
        subtitle="Explore active, verified college internships with direct corporate links. Filter by domain, skills, stipend, and mode."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Browse Internships' }
        ]}
      />

      {/* Filter Component */}
      <InternshipFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        workType={workType}
        setWorkType={setWorkType}
        location={location}
        setLocation={setLocation}
        stipendFilter={stipendFilter}
        setStipendFilter={setStipendFilter}
        skillFilter={skillFilter}
        setSkillFilter={setSkillFilter}
        sort={sort}
        setSort={setSort}
        totalResults={totalItems}
        onReset={handleResetFilters}
      />

      {/* Grid of Listings */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : totalItems === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-soft">
          <EmptyState
            title="No matching internships found"
            description="We couldn't find any opportunities matching your active filters. Try removing filters or searching for a broader role title."
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedInternships.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                onSelect={(item) => setSelectedInternship(item)}
                onStatusChange={fetchInternships}
                onFilterSkill={handleFilterBySkill}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-800">
                  {(validPage - 1) * PAGE_SIZE + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-800">
                  {Math.min(validPage * PAGE_SIZE, totalItems)}
                </span>{' '}
                of <span className="font-semibold text-slate-800">{totalItems}</span> internships
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(validPage - 1)}
                  disabled={validPage === 1}
                  className="btn-secondary text-xs p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${
                      p === validPage
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(validPage + 1)}
                  disabled={validPage === totalPages}
                  className="btn-secondary text-xs p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
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

export default BrowseInternshipsPage;
