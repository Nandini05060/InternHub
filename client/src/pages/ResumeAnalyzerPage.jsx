import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { careerApi } from '../api/careerApi.js';
import {
  Search,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Clock,
  ArrowRight,
  Info,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';

export function ResumeAnalyzerPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'paste'
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [jobDescription, setJobDescription] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [pastAnalyses, setPastAnalyses] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await careerApi.getAnalyses();
      if (res.success) {
        setPastAnalyses(res.analyses || []);
        if (!currentAnalysis && res.analyses && res.analyses.length > 0) {
          setCurrentAnalysis(res.analyses[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load past analyses:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.name.match(/\.(pdf|txt)$/i)) {
      toast.error('Only PDF and TXT files are supported.');
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    setFile(selected);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (inputMode === 'upload' && !file) {
      toast.error('Please upload a PDF or TXT resume document.');
      return;
    }

    if (inputMode === 'paste' && (!resumeText || resumeText.trim().length < 30)) {
      toast.error('Please paste sufficient resume text for an audit (minimum 30 characters).');
      return;
    }

    setAnalyzing(true);
    try {
      let res;
      if (inputMode === 'upload') {
        const formData = new FormData();
        formData.append('resumeFile', file);
        formData.append('targetRole', targetRole);
        formData.append('jobDescription', jobDescription);
        res = await careerApi.analyzeFile(formData);
      } else {
        res = await careerApi.analyzeText({
          resumeText,
          targetRole,
          jobDescription
        });
      }

      if (res.success && res.analysis) {
        setCurrentAnalysis(res.analysis);
        toast.success(`Analysis completed! Quality Score: ${res.analysis.score}/100`);
        fetchHistory();
      }
    } catch (err) {
      toast.error(err.message || 'Resume analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteAnalysis = async (id) => {
    if (!window.confirm('Delete this analysis record permanently?')) return;
    try {
      const res = await careerApi.deleteAnalysis(id);
      if (res.success) {
        toast.success('Analysis record deleted.');
        setPastAnalyses(prev => prev.filter(a => a.id !== id));
        if (currentAnalysis?.id === id) {
          setCurrentAnalysis(null);
        }
      }
    } catch (err) {
      toast.error('Failed to delete analysis record.');
    }
  };

  const breakdown = currentAnalysis?.breakdown || {};
  const matchingKeywords = currentAnalysis?.matching_keywords || [];
  const missingKeywords = currentAnalysis?.missing_keywords || [];
  const skillsIdentified = currentAnalysis?.skills_identified || [];
  const suggestions = currentAnalysis?.suggestions || [];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Search className="w-3.5 h-3.5" />
            <span>AI & Rule-Based ATS Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ATS Resume Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Upload your resume alongside a job description to get instant keyword match coverage, measurable impact checks, and actionable improvements.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-400 block">Total Audits Conducted</span>
          <span className="text-2xl font-bold text-white">{pastAnalyses.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload / Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-base p-6 border border-slate-200 shadow-soft space-y-5">
            <h3 className="text-base font-bold text-slate-900">1. Provide Resume & Target Role</h3>

            {/* Input Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  inputMode === 'upload' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload File (PDF / TXT)
              </button>
              <button
                type="button"
                onClick={() => setInputMode('paste')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  inputMode === 'paste' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paste Resume Text
              </button>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              {/* File Upload Zone */}
              {inputMode === 'upload' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Resume File (Max 5MB)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                      id="resume-file-input"
                    />
                    <label htmlFor="resume-file-input" className="cursor-pointer space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-semibold text-slate-900">
                        {file ? file.name : 'Click to upload or drag & drop'}
                      </div>
                      <p className="text-[11px] text-slate-500">PDF or TXT documents up to 5MB</p>
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Paste Resume Plain Text
                  </label>
                  <textarea
                    rows={7}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste the full text of your resume here including contact, education, skills, projects, and experience..."
                    className="input-base text-xs py-2 leading-relaxed font-mono"
                  />
                </div>
              )}

              {/* Target Role & Company */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer, Frontend Engineer"
                  className="input-base text-xs py-2"
                />
              </div>

              {/* Optional Job Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Target Job Description (Optional)</span>
                  <span className="text-[10px] text-indigo-600 font-normal">Extracts matching keywords</span>
                </label>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description to verify keyword coverage and identify missing technical competencies..."
                  className="input-base text-xs py-2 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={analyzing}
                className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 shadow-sm"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Resume Quality Audit</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Past Analyses History */}
          <div className="card-base p-5 border border-slate-200 shadow-soft space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Past Analyses ({pastAnalyses.length})</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </h4>

            {loadingHistory ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading history...</div>
            ) : pastAnalyses.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No past analyses recorded yet.</div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {pastAnalyses.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setCurrentAnalysis(item)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      currentAnalysis?.id === item.id
                        ? 'bg-indigo-50/70 border-indigo-300 shadow-2xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-slate-900 truncate">{item.resume_title || 'Resume'}</div>
                      <div className="text-[11px] text-slate-500 truncate">{item.target_role || 'General'}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        item.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.score}/100
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAnalysis(item.id);
                        }}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Analysis Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {currentAnalysis ? (
            <div className="card-base p-6 border border-slate-200 shadow-soft space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    Audit Report
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {currentAnalysis.resume_title || 'Analyzed Resume'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Evaluated for: <span className="font-semibold text-slate-700">{currentAnalysis.target_role}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl border-2 border-indigo-500 bg-indigo-50/50 flex flex-col items-center justify-center font-bold text-indigo-700 shadow-xs">
                    <span className="text-2xl leading-none">{currentAnalysis.score}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Score</span>
                  </div>
                </div>
              </div>

              {/* Component Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Quality Components Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="text-slate-500 mb-1">Contact Details</div>
                    <div className="text-base font-bold text-slate-900">{breakdown.contactScore || 0}/15</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="text-slate-500 mb-1">Completeness</div>
                    <div className="text-base font-bold text-slate-900">{breakdown.sectionCompletenessScore || 0}/25</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="text-slate-500 mb-1">Action Verbs</div>
                    <div className="text-base font-bold text-slate-900">{breakdown.actionVerbsScore || 0}/20</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="text-slate-500 mb-1">Measurable Metrics</div>
                    <div className="text-base font-bold text-slate-900">{breakdown.metricScore || 0}/15</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="text-slate-500 mb-1">Formatting & Brevity</div>
                    <div className="text-base font-bold text-slate-900">{breakdown.formattingScore || 0}/15</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="text-slate-500 mb-1">JD Keyword Match</div>
                    <div className="text-base font-bold text-slate-900">{breakdown.keywordMatchScore || 0}/10</div>
                  </div>
                </div>
              </div>

              {/* Skills Identified */}
              {skillsIdentified.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Skills Detected in Document ({skillsIdentified.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsIdentified.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching & Missing Keywords */}
              {(matchingKeywords.length > 0 || missingKeywords.length > 0) && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Target Job Description Match Analysis
                  </h4>

                  {matchingKeywords.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Matching Skills Found ({matchingKeywords.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchingKeywords.map((kw, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {missingKeywords.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 mb-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Keywords in Job Description Not Found on Resume ({missingKeywords.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {missingKeywords.map((kw, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Specific Improvement Recommendations
                  </h4>
                  <div className="space-y-2.5">
                    {suggestions.map((sugg, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                        <div className="text-xs font-bold text-indigo-950">{sugg.title}</div>
                        <p className="text-xs text-slate-600 leading-relaxed">{sugg.description}</p>
                        {sugg.draftText && (
                          <div className="p-2 rounded bg-white border border-indigo-100 text-[11px] font-mono text-slate-700 mt-1.5">
                            "{sugg.draftText}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 not-italic">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Important Compliance Notice</span>
                </div>
                <p>
                  Keyword coverage is an indicator of alignment with listed job requirements, but does not guarantee ATS acceptance or selection. Proprietary applicant tracking systems and human recruiters employ varying multi-factor evaluation criteria.
                </p>
              </div>
            </div>
          ) : (
            <div className="card-base p-12 text-center border border-slate-200 shadow-soft space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Resume Audit Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload a PDF or TXT file on the left, or paste your resume text to generate an instant ATS compatibility audit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
