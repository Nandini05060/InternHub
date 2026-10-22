import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Building2,
  Calendar,
  Banknote,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { VerifiedBadge, WorkTypeBadge, DeadlineBadge, StatusBadge } from '../common/Badge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { bookmarkApi, applicationApi } from '../../api/extraApis.js';

export function InternshipCard({ internship, onSelect, onStatusChange }) {
  const { isAuthenticated, isStudent } = useAuth();
  const toast = useToast();

  const [isSaved, setIsSaved] = useState(!!internship.is_saved);
  const [saveLoading, setSaveLoading] = useState(false);
  const [appStatus, setAppStatus] = useState(internship.application_status);

  const handleToggleSave = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.warning('Please log in to save internships to your dashboard.');
      return;
    }

    setSaveLoading(true);
    try {
      if (isSaved) {
        await bookmarkApi.unsaveBookmark(internship.id);
        setIsSaved(false);
        toast.info('Removed from saved bookmarks');
      } else {
        await bookmarkApi.saveBookmark(internship.id);
        setIsSaved(true);
        toast.success('Saved to your bookmarks!');
      }
      if (onStatusChange) onStatusChange();
    } catch (err) {
      toast.error(err.message || 'Failed to update bookmark');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleApplyClick = async (e) => {
    e.stopPropagation();

    // If student is logged in and not yet applied, record intent in tracker
    if (isAuthenticated && isStudent && (!appStatus || appStatus === 'Saved')) {
      try {
        await applicationApi.trackApplication(internship.id, {
          status: 'Applied',
          notes: 'Applied via official company career portal.'
        });
        setAppStatus('Applied');
        toast.success(`Application tracked for ${internship.company_name}!`);
        if (onStatusChange) onStatusChange();
      } catch (err) {
        // Continue opening link even if track fails
      }
    }

    // Open official application link
    window.open(internship.application_link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => onSelect(internship)}
      className="card-hoverable p-5 flex flex-col justify-between group cursor-pointer relative bg-white border border-slate-200/90 rounded-2xl"
    >
      <div>
        {/* Top bar: Company + Save Button */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <img
              src={internship.company_logo}
              alt={internship.company_name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0 shadow-xs"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop';
              }}
            />
            <div>
              <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{internship.company_name}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <span className="font-medium text-slate-700">{internship.category}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleSave}
            disabled={saveLoading}
            title={isSaved ? 'Remove from saved' : 'Save internship'}
            className={`p-2 rounded-xl transition-all ${
              isSaved
                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5 fill-indigo-600 text-indigo-600" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
          {internship.title}
        </h3>

        {/* Tags Row */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          <WorkTypeBadge type={internship.work_type} />
          <VerifiedBadge />
          {internship.is_expired ? (
            <span className="px-2 py-0.5 rounded-md text-xs bg-rose-50 text-rose-700 border border-rose-200">
              Expired
            </span>
          ) : (
            <DeadlineBadge deadline={internship.deadline} />
          )}
        </div>

        {/* Short description preview */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {internship.description}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>{internship.stipend}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{internship.duration}</span>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(internship);
            }}
            className="btn-secondary flex-1 text-xs py-2"
          >
            Details
          </button>

          <button
            onClick={handleApplyClick}
            className="btn-primary flex-1 text-xs py-2 shadow-xs group/btn"
          >
            <span>Apply Official</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Student tracked status banner if already applied */}
        {appStatus && (
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tracking status:</span>
            <StatusBadge status={appStatus} />
          </div>
        )}
      </div>
    </div>
  );
}
