import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const CATEGORIES = [
  'All',
  'Software Engineering',
  'Frontend',
  'Backend',
  'Data Science & AI',
  'UI/UX Design',
  'DevOps & Cloud',
  'Product Management',
  'Mobile Development',
  'Cybersecurity'
];

export const WORK_TYPES = [
  { id: 'All', label: 'All Modes' },
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'on-site', label: 'On-site' }
];

export function InternshipFilter({
  search,
  setSearch,
  category,
  setCategory,
  workType,
  setWorkType,
  sort,
  setSort,
  totalResults,
  onReset
}) {
  const hasActiveFilters = search || (category && category !== 'All') || (workType && workType !== 'All') || sort !== 'newest';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft space-y-4 mb-8">
      {/* Top row: Search and Sort */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by role, company, skills (e.g. React, Python, CRED)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10 pr-9 py-2.5 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-base py-2.5 text-xs font-medium w-full sm:w-48 bg-slate-50 border-slate-200 cursor-pointer"
          >
            <option value="newest">Sort: Newest Added</option>
            <option value="deadline">Sort: Deadline Approaching</option>
            <option value="oldest">Sort: Oldest Added</option>
          </select>
        </div>
      </div>

      {/* Middle row: Category and Work Type Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-slate-100">
        {/* Category Pills / Scrollable List */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Domain:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Work Type Options */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-semibold text-slate-500 mr-1">Work Mode:</span>
          {WORK_TYPES.map((wt) => (
            <button
              key={wt.id}
              onClick={() => setWorkType(wt.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                workType === wt.id
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {wt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active state footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Showing <span className="font-semibold text-slate-900">{totalResults}</span> verified opportunities
        </span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
