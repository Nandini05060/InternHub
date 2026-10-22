import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  TrendingUp,
  FileCheck,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react';

export function ResumeQualityWidget({
  audit,
  loading = false,
  onApplySuggestion = () => {}
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-10 bg-slate-100 rounded" />
      </div>
    );
  }

  if (!audit) return null;

  const score = audit.score || 0;
  const breakdown = audit.breakdown || {};
  const issues = audit.issues || [];
  const strengths = audit.strengths || [];
  const suggestions = audit.suggestions || [];
  const matchingKeywords = audit.matchingKeywords || [];
  const missingKeywords = audit.missingKeywords || [];

  const getScoreColor = (val) => {
    if (val >= 85) return 'text-emerald-600 border-emerald-500 bg-emerald-50';
    if (val >= 70) return 'text-indigo-600 border-indigo-500 bg-indigo-50';
    if (val >= 50) return 'text-amber-600 border-amber-500 bg-amber-50';
    return 'text-rose-600 border-rose-500 bg-rose-50';
  };

  const getScoreBadge = (val) => {
    if (val >= 85) return 'Excellent ATS Readiness';
    if (val >= 70) return 'Good Quality — Minor Polishing';
    if (val >= 50) return 'Moderate — Needs Improvement';
    return 'Incomplete — Follow Checklist';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft space-y-5">
      {/* Top Header & Circular Score */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Resume Quality Checker</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
              ATS Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{getScoreBadge(score)}</p>
        </div>

        <div className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center font-bold shadow-xs ${getScoreColor(score)}`}>
          <span className="text-lg leading-none">{score}</span>
          <span className="text-[9px] uppercase font-semibold text-slate-500">/ 100</span>
        </div>
      </div>

      {/* Component Breakdown Bars */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Audit Breakdown</h4>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
              <span>Contact & Links</span>
              <span className="font-bold">{breakdown.contactScore || 0}/15</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${((breakdown.contactScore || 0) / 15) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
              <span>Section Completeness</span>
              <span className="font-bold">{breakdown.sectionCompletenessScore || 0}/25</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${((breakdown.sectionCompletenessScore || 0) / 25) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
              <span>Action Verbs</span>
              <span className="font-bold">{breakdown.actionVerbsScore || 0}/20</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${((breakdown.actionVerbsScore || 0) / 20) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
              <span>Measurable Outcomes (XYZ)</span>
              <span className="font-bold">{breakdown.metricScore || 0}/15</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${((breakdown.metricScore || 0) / 15) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
              <span>Brevity & Formatting</span>
              <span className="font-bold">{breakdown.formattingScore || 0}/15</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${((breakdown.formattingScore || 0) / 15) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
              <span>Job Keywords Match</span>
              <span className="font-bold">{breakdown.keywordMatchScore || 0}/10</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${((breakdown.keywordMatchScore || 0) / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Matching vs Missing Keywords */}
      {(matchingKeywords.length > 0 || missingKeywords.length > 0) && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Job Description Keywords Coverage
          </h4>

          {matchingKeywords.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Matching Skills ({matchingKeywords.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchingKeywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missingKeywords.length > 0 && (
            <div className="mt-2">
              <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Missing In Resume ({missingKeywords.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {missingKeywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
                    {kw}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Only add skills you actually possess and can discuss in an interview.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Role-Specific Tailoring Suggestions (Require Student Approval!) */}
      {suggestions.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-900">Tailoring Suggestions (Drafts)</h4>
          </div>
          <p className="text-[11px] text-slate-500 -mt-1">
            Review recommendations before applying. InternHub never auto-overwrites your resume.
          </p>

          <div className="space-y-2">
            {suggestions.map((sugg, idx) => (
              <div key={sugg.id || `sugg_${idx}`} className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-950">{sugg.title}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200 shrink-0">
                    {sugg.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{sugg.description}</p>

                {sugg.draftText && (
                  <div className="p-2 rounded bg-white border border-indigo-100 text-xs text-slate-800 font-mono text-[11px]">
                    "{sugg.draftText}"
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-indigo-700 italic">
                    Why: {sugg.rationale}
                  </span>
                  <button
                    onClick={() => onApplySuggestion(sugg)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-2xs"
                  >
                    <span>Apply</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Improvement Checklist */}
      {issues.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Actionable Improvements ({issues.length})
          </h4>
          <div className="space-y-1.5">
            {issues.map((issue, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-200/60">
                <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                  issue.severity === 'high' ? 'text-rose-500' : 'text-amber-500'
                }`} />
                <span>{issue.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ATS Disclaimer */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 leading-relaxed italic flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
          <span>
            {audit.disclaimer ||
              'This quality score is an automated readability audit. It does not replicate proprietary ATS algorithms and does not guarantee interview shortlisting.'}
          </span>
        </p>
      </div>
    </div>
  );
}
