import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { applicationApi, bookmarkApi, notificationApi } from '../api/extraApis.js';
import { internshipApi } from '../api/internshipApi.js';
import { ApplicationTracker } from '../components/student/ApplicationTracker.jsx';
import { SavedInternshipsList } from '../components/student/SavedInternshipsList.jsx';
import { InternshipDetailsModal } from '../components/internships/InternshipDetailsModal.jsx';
import { DeadlineBadge, VerifiedBadge, StatusBadge } from '../components/common/Badge.jsx';
import {
  Briefcase,
  Bookmark,
  Calendar,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  User,
  Clock,
  FileText,
  Search,
  Target,
  CheckSquare,
  Award,
  MessageSquare,
  FolderLock,
  Layers,
  ArrowRight,
  Bell,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function StudentDashboardPage() {
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [savedList, setSavedList] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState(null);

  const loadDashboardData = async () => {
    try {
      const [appsRes, statsRes, savedRes, internsRes, notifsRes] = await Promise.all([
        applicationApi.getApplications(),
        applicationApi.getStats(),
        bookmarkApi.getBookmarks(),
        internshipApi.getInternships({ sort: 'newest' }),
        notificationApi.getNotifications()
      ]);

      if (appsRes.success) setApplications(appsRes.applications || []);
      if (statsRes.success) setStats(statsRes.stats || null);
      if (savedRes.success) setSavedList(savedRes.saved || []);
      if (notifsRes.success) setNotifications(notifsRes.notifications || []);

      // Calculate recommended based on profile skills
      if (internsRes.success) {
        const studentSkills = Array.isArray(profile?.skills)
          ? profile.skills.map((s) => s.toLowerCase())
          : typeof profile?.skills === 'string'
          ? profile.skills.toLowerCase().split(',').map((s) => s.trim())
          : [];

        const allActive = (internsRes.internships || []).filter((item) => !item.is_expired);
        if (studentSkills.length > 0) {
          const scored = allActive.map((item) => {
            const reqSkills = Array.isArray(item.required_skills)
              ? item.required_skills.map((s) => s.toLowerCase())
              : typeof item.required_skills === 'string'
              ? item.required_skills.toLowerCase().split(',').map((s) => s.trim())
              : [];
            const matches = reqSkills.filter((rs) => studentSkills.some((ss) => ss.includes(rs) || rs.includes(ss)));
            return { ...item, matchScore: matches.length };
          });
          scored.sort((a, b) => b.matchScore - a.matchScore);
          setRecommended(scored.slice(0, 3));
        } else {
          setRecommended(allActive.slice(0, 3));
        }
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  const handleViewInternship = async (internshipId) => {
    try {
      const res = await internshipApi.getInternshipById(internshipId);
      if (res.success) {
        setSelectedInternship(res.internship);
      }
    } catch {}
  };

  // Profile completion calculation from actual user profile
  const profileFields = [
    { key: 'phone', label: 'Phone' },
    { key: 'university', label: 'University' },
    { key: 'degree', label: 'Degree' },
    { key: 'graduation_year', label: 'Graduation Year' },
    { key: 'skills', label: 'Skills' },
    { key: 'cgpa', label: 'CGPA' },
    { key: 'bio', label: 'Bio / Objective' }
  ];

  const completedCount = profileFields.filter((f) => {
    const val = profile ? profile[f.key] : null;
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    return String(val).trim().length > 0;
  }).length;

  const completionPercent = Math.round((completedCount / profileFields.length) * 100);

  // Application stage summaries calculated from actual applications
  const pipelineMetrics = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter((a) => a.status === 'Applied').length;
    const review = applications.filter((a) => a.status === 'Under Review' || a.status === 'In Review').length;
    const interview = applications.filter((a) => a.status === 'Interviewing' || a.status === 'Interview').length;
    const offer = applications.filter((a) => a.status === 'Offered' || a.status === 'Offer').length;
    return { total, applied, review, interview, offer };
  }, [applications]);

  // Deadlines derived from applications & saved listings
  const upcomingDeadlines = useMemo(() => {
    return [...applications, ...savedList]
      .filter((item) => item.deadline)
      .reduce((acc, current) => {
        const id = current.internship_id || current.id;
        if (!acc.some((item) => (item.internship_id || item.id) === id)) {
          acc.push(current);
        }
        return acc;
      }, [])
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [applications, savedList]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Career Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            {profile?.university
              ? `${profile.university} • ${profile.degree || 'Engineering'}`
              : 'Keep your academic profile complete and track your active summer opportunities.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/student/profile"
            className="btn-secondary bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs py-2 px-3.5"
          >
            <User className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
          <Link
            to="/internships"
            className="btn-primary bg-indigo-500 hover:bg-indigo-600 text-xs py-2 px-3.5 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Roles</span>
          </Link>
        </div>
      </div>

      {/* 2. Metrics & Profile Completion Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Profile Completion Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Profile Completion
              </span>
              <span className="text-xs font-extrabold text-indigo-600">{completionPercent}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completionPercent === 100
                    ? 'bg-emerald-500'
                    : completionPercent >= 70
                    ? 'bg-indigo-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {completionPercent === 100
                ? 'Your student profile is 100% complete! Employers and match algorithms can evaluate your profile.'
                : 'Complete all academic and skill fields to unlock verified application discovery and tailored matches.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {completedCount} of {profileFields.length} fields filled
            </span>
            {completionPercent < 100 && (
              <Link
                to="/student/profile"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Finish Setup</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Application Stage Counters (8 Cols) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-soft flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Applied</span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{pipelineMetrics.total}</span>
            </div>
            <span className="text-[11px] text-slate-400">Tracked roles</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-soft flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Under Review</span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{pipelineMetrics.review}</span>
            </div>
            <span className="text-[11px] text-slate-400">In screening</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-soft flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interviews</span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{pipelineMetrics.interview}</span>
            </div>
            <span className="text-[11px] text-slate-400">Active rounds</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-soft flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Offers Received</span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{pipelineMetrics.offer}</span>
            </div>
            <span className="text-[11px] text-slate-400">Accepted/Pending</span>
          </div>
        </div>
      </div>

      {/* 3. Career Preparation & ATS Launchpad */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Career Intelligence & ATS Tools</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                New
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Build compliant resumes, analyze JD keywords, and prepare for placement interviews
            </p>
          </div>
          <Link
            to="/student/resume-builder"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>Open Resume Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Link
            to="/student/resume-builder"
            className="group p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-white border border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                Resume Builder
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Single-page ATS templates, live XYZ action verb suggestions & vector PDF download.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
              <span>Create / Edit</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            to="/student/resume-analyzer"
            className="group p-4 rounded-2xl bg-gradient-to-br from-blue-50/60 to-white border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                Resume Analyzer
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Objective 0–100 ATS scoring, JD keyword coverage audit & role tailoring insights.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-600">
              <span>Audit Resume</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            to="/student/internship-match"
            className="group p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                Match Index
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Transparent compatibility index, matched strengths & personalized skill gaps.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span>View Matches</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            to="/student/placement-prep"
            className="group p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 to-white border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                Placement Prep
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Interactive DSA, Core CS, Aptitude & HR roadmaps with live progress tracking.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-amber-600">
              <span>Start Prep</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Secondary quick bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-medium">More Career Prep:</span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/student/resume-versions"
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Resume Versions</span>
            </Link>
            <Link
              to="/student/skills-certifications"
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Skills & Certs</span>
            </Link>
            <Link
              to="/student/interview-practice"
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Interview Rehearsal</span>
            </Link>
            <Link
              to="/student/document-vault"
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
            >
              <FolderLock className="w-3.5 h-3.5 text-blue-600" />
              <span>Document Vault</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Recommended Internships Section */}
      {recommended.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600" /> Recommended for Your Skillset
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Matched automatically from your technical profile skills
              </p>
            </div>
            <Link
              to="/student/internship-match"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Full Match Index</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommended.map((item) => (
              <div
                key={item.id}
                onClick={() => handleViewInternship(item.id)}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 truncate">{item.company_name}</span>
                    <VerifiedBadge />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{item.location} • {item.stipend}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <DeadlineBadge deadline={item.deadline} />
                  <span className="font-semibold text-indigo-600 flex items-center gap-0.5">
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'applications'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>My Pipeline ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'saved'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Bookmarked ({savedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deadlines')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'deadlines'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Upcoming Deadlines ({upcomingDeadlines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts ({notifications.filter((n) => !n.is_read).length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'applications' && (
        <ApplicationTracker
          applications={applications}
          stats={stats}
          onRefresh={loadDashboardData}
          onViewInternship={handleViewInternship}
        />
      )}

      {activeTab === 'saved' && (
        <SavedInternshipsList
          savedList={savedList}
          onSelectInternship={(item) => setSelectedInternship(item)}
          onStatusChange={loadDashboardData}
        />
      )}

      {activeTab === 'deadlines' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Application Deadlines Schedule</h3>
              <p className="text-xs text-slate-500">
                Sorted by most urgent deadlines across your applied and bookmarked roles
              </p>
            </div>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No upcoming deadlines recorded yet. Save or track an internship to see its timeline.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingDeadlines.map((item) => (
                <div
                  key={item.internship_id || item.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 rounded-xl px-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.company_logo}
                      alt={item.company_name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0 shadow-2xs"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop';
                      }}
                    />
                    <div>
                      <h4
                        onClick={() => handleViewInternship(item.internship_id || item.id)}
                        className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer text-sm"
                      >
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500">{item.company_name} • {item.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DeadlineBadge deadline={item.deadline} />
                    {item.application_link && (
                      <a
                        href={item.application_link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Notifications & Deadline Alerts</h3>
              <p className="text-xs text-slate-500">
                Automated reminders for approaching deadlines and application updates
              </p>
            </div>
            {notifications.some((n) => !n.is_read) && (
              <button
                onClick={async () => {
                  await notificationApi.markAllRead();
                  setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No notifications yet. You will receive deadline alerts here when saved internships near their cutoff.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`py-3.5 px-3 rounded-2xl flex items-start justify-between gap-3 transition-colors ${
                    !notif.is_read ? 'bg-indigo-50/40' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(notif.created_at).toLocaleDateString()} at{' '}
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedInternship && (
        <InternshipDetailsModal
          internship={selectedInternship}
          isOpen={Boolean(selectedInternship)}
          onClose={() => setSelectedInternship(null)}
          onStatusChange={loadDashboardData}
        />
      )}
    </div>
  );
}

export default StudentDashboardPage;
