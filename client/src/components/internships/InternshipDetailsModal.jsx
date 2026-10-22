import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { VerifiedBadge, WorkTypeBadge, DeadlineBadge, StatusBadge } from '../common/Badge.jsx';
import {
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Building2,
  MapPin,
  Banknote,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { bookmarkApi, applicationApi } from '../../api/extraApis.js';

export function InternshipDetailsModal({ internship, isOpen, onClose, onStatusChange }) {
  const { isAuthenticated, isStudent } = useAuth();
  const toast = useToast();

  const [isSaved, setIsSaved] = useState(Boolean(internship?.is_saved));
  const [saveLoading, setSaveLoading] = useState(false);
  const [appStatus, setAppStatus] = useState(internship?.application_status);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Sync state if internship changes
  React.useEffect(() => {
    if (internship) {
      setIsSaved(Boolean(internship.is_saved));
      setAppStatus(internship.application_status);
    }
  }, [internship]);

  if (!internship) return null;

  const handleToggleSave = async () => {
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

  const handleApplyOfficial = async () => {
    if (isAuthenticated && isStudent && (!appStatus || appStatus === 'Saved')) {
      try {
        await applicationApi.trackApplication(internship.id, {
          status: 'Applied',
          notes: 'Applied via official company portal.'
        });
        setAppStatus('Applied');
        toast.success(`Application tracked for ${internship.company_name}!`);
        if (onStatusChange) onStatusChange();
      } catch (err) {
        if (err.message && (err.message.includes('complete your college') || err.message.includes('Profile incomplete'))) {
          toast.warning('Please complete your student profile before applying.');
          return;
        }
      }
    }

    window.open(internship.application_link, '_blank', 'noopener,noreferrer');
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await applicationApi.updateStatus(internship.id, newStatus, `Status updated to ${newStatus}`);
      setAppStatus(newStatus);
      toast.success(`Status updated to ${newStatus}`);
      if (onStatusChange) onStatusChange();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Internship Overview" maxWidth="max-w-2xl">
      <div className="space-y-6 text-slate-800">
        {/* Company Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={internship.company_logo}
              alt={internship.company_name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-100 bg-slate-50 shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop';
              }}
            />
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{internship.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-slate-700">{internship.company_name}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-500">{internship.category}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleSave}
            disabled={saveLoading}
            className={`p-2.5 rounded-xl border transition-all ${
              isSaved
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={isSaved ? 'Remove Bookmark' : 'Save Bookmark'}
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5 fill-indigo-600 text-indigo-600" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>

        {/* Verification Guarantee Banner */}
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Verified by InternHub Admin:</strong> Link directs directly to official employer career application.
            </span>
          </div>
          <VerifiedBadge />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Stipend</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-900 text-sm">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>{internship.stipend}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Duration</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-900 text-sm">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>{internship.duration}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Work Mode</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-900 text-sm capitalize">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{internship.work_type}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Deadline</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-900 text-sm">
              <Calendar className="w-4 h-4 text-rose-600" />
              <span>{internship.deadline}</span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600" /> About the Internship
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
            {internship.description}
          </p>
        </div>

        {/* Requirements */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Skills & Requirements
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
            {internship.requirements}
          </p>
        </div>

        {/* Perks if present */}
        {internship.perks && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Perks & Benefits
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-amber-50/40 p-3.5 rounded-xl border border-amber-100">
              {internship.perks}
            </p>
          </div>
        )}

        {/* If logged-in student, provide application tracker management */}
        {isAuthenticated && isStudent && (
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-indigo-950 block">Your Application Tracking Status</span>
              <span className="text-xs text-indigo-700">
                Update your current progress stage for this role.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={appStatus || 'None'}
                disabled={updatingStatus}
                onChange={(e) => {
                  if (e.target.value !== 'None') {
                    handleStatusUpdate(e.target.value);
                  }
                }}
                className="input-base text-xs py-1.5 px-3 bg-white font-medium cursor-pointer"
              >
                <option value="None">Not Tracked Yet</option>
                <option value="Saved">Saved</option>
                <option value="Applied">Applied</option>
                <option value="In Review">In Review</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}

        {/* Official Portal Notice */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Official Employer Redirection:</strong> InternHub forwards you directly to the verified corporate career portal. Your application is recorded in your personal tracker so you can manage your interview stages and deadlines.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button onClick={onClose} className="btn-secondary text-sm">
            Close
          </button>

          <button
            onClick={handleApplyOfficial}
            className="btn-primary text-sm px-6 py-2.5 shadow-md shadow-indigo-600/20"
          >
            <span>Apply on Official Company Portal</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
