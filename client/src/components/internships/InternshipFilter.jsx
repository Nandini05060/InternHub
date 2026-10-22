import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, MapPin, Banknote, Sparkles } from 'lucide-react';

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

export const LOCATIONS = [
  'All',
  'Bengaluru',
  'Remote',
  'Gurugram',
  'Mumbai',
  'Pune',
  'Hyderabad',
  'Delhi NCR'
];

export const STIPEND_RANGES = [
  { id: 'All', label: 'Any Stipend' },
  { id: 'paid', label: 'Paid Only' },
  { id: '25k', label: '≥ ₹25,000/mo' },
  { id: '40k', label: '≥ ₹40,000/mo' }
];

export function InternshipFilter({
  search,
  setSearch,
  category,
  setCategory,
  workType,
  setWorkType,
  location,
  setLocation,
  stipendFilter,
  setStipendFilter,
  skillFilter,
  setSkillFilter,
  sort,
  setSort,
  totalResults,
  onReset
}) {
  const hasActiveFilters =
    search ||
    (category && category !== 'All') ||
    (workType && workType !== 'All') ||
    (location && location !== 'All') ||
    (stipendFilter && stipendFilter !== 'All') ||
    skillFilter ||
    sort !== 'newest';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft space-y-4 mb-8">
      {/* Top row: Search, Location, and Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="relative sm:col-span-6">
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
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location Select */}
        <div className="relative sm:col-span-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={location || 'All'}
            onChange={(e) => setLocation(e.target.value)}
            className="input-base pl-9 pr-6 py-2.5 text-xs font-medium bg-slate-50 border-slate-200 cursor-pointer"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc === 'All' ? 'All Locations' : loc}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div className="relative sm:col-span-3">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-base pl-9 pr-6 py-2.5 text-xs font-medium bg-slate-50 border-slate-200 cursor-pointer"
          >
            <option value="newest">Sort: Newest Added</option>
            <option value="deadline">Sort: Deadline Approaching</option>
            <option value="oldest">Sort: Oldest Added</option>
          </select>
        </div>
      </div>

      {/* Middle row: Category Pills / Scrollable List */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar pt-2 border-t border-slate-100">
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

      {/* Bottom Filter Row: Work Mode & Stipend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          {/* Work Type Options */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500 mr-1">Work Mode:</span>
            {WORK_TYPES.map((wt) => (
              <button
                key={wt.id}
                onClick={() => setWorkType(wt.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  workType === wt.id
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {wt.label}
              </button>
            ))}
          </div>

          {/* Stipend Options */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Stipend:
            </span>
            {STIPEND_RANGES.map((st) => (
              <button
                key={st.id}
                onClick={() => setStipendFilter(st.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  stipendFilter === st.id
                    ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Skill Filter Badge */}
        {skillFilter && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Skill: {skillFilter}</span>
            <button
              onClick={() => setSkillFilter('')}
              className="p-0.5 hover:text-indigo-900 rounded-full"
              aria-label="Remove skill filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Active state footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <span>
          Showing <span className="font-bold text-slate-900">{totalResults}</span> verified opportunities
        </span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}

export default InternshipFilter;
