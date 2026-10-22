import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { careerApi } from '../api/careerApi.js';
import { applicationApi } from '../api/extraApis.js';
import { InternshipDetailsModal } from '../components/internships/InternshipDetailsModal.jsx';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Building,
  MapPin,
  Calendar,
  Briefcase,
  HelpCircle,
  ArrowRight,
  SlidersHorizontal,
  BookmarkCheck
} from 'lucide-react';

export function InternshipMatchPage() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [filterTier, setFilterTier] = useState('All');

  const loadMatches = async () => {
    try {
      const res = await careerApi.getInternshipMatches();
      if (res.success) {
        setMatches(res.matches || []);
      }
    } catch (err) {
      console.error('Failed to load internship matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleTrackApplication = async (internshipId, title) => {
    try {
      await applicationApi.applyOrTrack(internshipId, {
        status: 'Applied',
        appliedDate: new Date().toISOString().slice(0, 10),
        notes: 'Tracked directly from Internship Match dashboard.'
      });
      toast.success(`Application tracked for "${title}"!`);
      loadMatches();
    } catch (err) {
      toast.error(err.message || 'Failed to track application.');
    }
  };

  const filteredMatches = matches.filter(m => {
    if (filterTier === 'All') return true;
    return m.matchTier === filterTier;
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Target className="w-3.5 h-3.5" />
            <span>AI Compatibility Index</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Internship Match Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            See how your verified skills, coursework, degree, and graduation timeline align with verified internship listings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Active Profile:</span>
          <span className="text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
            {profile?.degree || 'B.Tech CS'} ({profile?.graduation_year || 2026})
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {['All', 'Strong Match', 'Good Match', 'Moderate Match', 'Growth Opportunity'].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setFilterTier(tier)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTier === tier ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Showing {filteredMatches.length} matching listings
        </span>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="card-base p-12 text-center border border-slate-200 shadow-soft space-y-3">
          <Target className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Listings in This Compatibility Tier</h3>
          <p className="text-xs text-slate-500">
            Switch filter tabs or update your student skills profile to unlock more matches.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map(({ internship, score, matchTier, matchingSkills, skillsToImprove, eligibility, explanation }) => (
            <div
              key={internship.id}
              className="card-base p-5 sm:p-6 border border-slate-200/90 shadow-soft hover:shadow-card-hover transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Role Info */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      score >= 80 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}>
                      {matchTier}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">•</span>
                    <span className="text-xs text-slate-600">{internship.category}</span>
                    <span className="text-xs font-semibold text-slate-500">•</span>
                    <span className="text-xs text-slate-600 capitalize">{internship.work_type}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {internship.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {internship.company_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {internship.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Deadline: {new Date(internship.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Right: Compatibility Gauge & Action */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-700 leading-none">
                      {score}%
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Match Index</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedInternship(internship)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleTrackApplication(internship.id, internship.title)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Apply / Track
                    </button>
                  </div>
                </div>
              </div>

              {/* Explainable match breakdown */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Matching Skills */}
                <div>
                  <div className="font-semibold text-emerald-800 flex items-center gap-1 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Matching Skills ({matchingSkills.length})</span>
                  </div>
                  {matchingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {matchingSkills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No exact skill overlap detected.</span>
                  )}
                </div>

                {/* Skills to Improve */}
                <div>
                  <div className="font-semibold text-amber-800 flex items-center gap-1 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Skills to Gain / Emphasize ({skillsToImprove.length})</span>
                  </div>
                  {skillsToImprove.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {skillsToImprove.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-emerald-600">All key listed skills present on profile!</span>
                  )}
                </div>
              </div>

              {/* Rationale & Tailoring Shortcut */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-slate-600 italic">
                  Rationale: {explanation}
                </span>

                <button
                  onClick={() => navigate(`/student/resume-builder?targetRole=${encodeURIComponent(internship.title)}`)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Tailor Resume for this Role</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compliance Disclaimer */}
      <div className="card-base p-4 border border-slate-200 bg-slate-50 text-slate-500 text-xs italic flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          InternHub Compatibility Estimates are calculated strictly from your listed profile skills and verified internship requirements. Match percentages indicate academic and technical fit; they do not guarantee interview shortlisting or hiring selection.
        </p>
      </div>

      {/* Details Modal */}
      {selectedInternship && (
        <InternshipDetailsModal
          internship={selectedInternship}
          onClose={() => setSelectedInternship(null)}
        />
      )}
    </div>
  );
}
