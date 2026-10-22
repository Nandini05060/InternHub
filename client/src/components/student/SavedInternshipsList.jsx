import React from 'react';
import { InternshipCard } from '../internships/InternshipCard.jsx';
import { EmptyState } from '../common/EmptyState.jsx';
import { Bookmark, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SavedInternshipsList({ savedList, onSelectInternship, onStatusChange }) {
  if (savedList.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
        <EmptyState
          icon={Bookmark}
          title="No saved internships yet"
          description="Explore verified opportunities on the discovery page and bookmark internships you want to apply for later."
          actionText="Browse Internships"
          onAction={() => window.location.assign('/internships')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Bookmarked Opportunities</h3>
          <p className="text-xs text-slate-500">
            You have saved {savedList.length} internships for review and application
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savedList.map((item) => (
          <InternshipCard
            key={item.id}
            internship={item}
            onSelect={onSelectInternship}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}
