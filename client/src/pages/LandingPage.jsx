import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Building,
  Briefcase,
  MapPin,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Laptop,
  CheckSquare,
  FileText,
  Target,
  Award,
  FolderLock,
  Compass,
  Check
} from 'lucide-react';
import { internshipApi } from '../api/internshipApi.js';
import { InternshipCard } from '../components/internships/InternshipCard.jsx';
import { InternshipDetailsModal } from '../components/internships/InternshipDetailsModal.jsx';
import { CardSkeleton } from '../components/common/SkeletonLoader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');

  // Listings sections
  const [featuredInternships, setFeaturedInternships] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [closingSoon, setClosingSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState(null);

  // Active Career Tool tab in preview section
  const [activeToolTab, setActiveToolTab] = useState('builder');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  useEffect(() => {
    async function loadHomepageListings() {
      try {
        const [featuredRes, newestRes, deadlineRes] = await Promise.all([
          internshipApi.getInternships({ sort: 'newest' }),
          internshipApi.getInternships({ sort: 'newest' }),
          internshipApi.getInternships({ sort: 'deadline' })
        ]);

        if (featuredRes.success) {
          const all = featuredRes.internships || [];
          setFeaturedInternships(all.slice(0, 3));
          setRecentlyAdded(newestRes.success ? (newestRes.internships || []).slice(0, 3) : all.slice(0, 3));

          // Closing soon: filter upcoming deadlines (not expired)
          const activeDeadlines = (deadlineRes.success ? deadlineRes.internships : all)
            .filter((item) => !item.is_expired)
            .slice(0, 3);
          setClosingSoon(activeDeadlines);
        }
      } catch (err) {
        console.error('Failed to load homepage listings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomepageListings();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedLocation !== 'All') params.set('location', selectedLocation);
    if (selectedWorkMode !== 'All') params.set('workType', selectedWorkMode.toLowerCase());

    const qs = params.toString();
    navigate(qs ? `/internships?${qs}` : '/internships');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedLocation('All');
    setSelectedWorkMode('All');
  };

  const handleQuickDemoStudent = async () => {
    try {
      await login('student@internhub.com', 'Student@123');
      navigate('/student/dashboard');
    } catch {}
  };

  const handleQuickDemoAdmin = async () => {
    try {
      await login('admin@internhub.com', 'Admin@123');
      navigate('/admin');
    } catch {}
  };

  const categories = [
    { name: 'Software Engineering', count: 'Full Stack, Systems, C++', icon: Laptop },
    { name: 'Frontend Development', count: 'React, Vue, Tailwind', icon: Sparkles },
    { name: 'Backend Engineering', count: 'Node, Express, MySQL', icon: Layers },
    { name: 'Data Science & AI', count: 'Python, PyTorch, SQL', icon: TrendingUp },
    { name: 'DevOps & Cloud', count: 'Docker, AWS, Linux', icon: Zap },
    { name: 'UI/UX Product Design', count: 'Figma, Design Systems', icon: Briefcase }
  ];

  const careerTools = [
    {
      id: 'builder',
      title: 'ATS Resume Builder',
      badge: 'Single-Page ATS',
      icon: FileText,
      description: 'Build single-column, ATS-parsed resumes with 4 clean templates, live XYZ action verb suggestions, and selectable vector PDF download.',
      link: '/student/resume-builder',
      highlights: ['4 ATS standard templates', 'Action verbs & XYZ tips', 'Native vector PDF export']
    },
    {
      id: 'analyzer',
      title: 'Resume Analyzer',
      badge: '0–100 Audit',
      icon: Search,
      description: 'Audit your resume against specific target job descriptions. Extract technical keywords, view section completeness, and spot missing skills.',
      link: '/student/resume-analyzer',
      highlights: ['Objective 0–100 scoring', 'JD keyword coverage', 'Missing skill breakdown']
    },
    {
      id: 'match',
      title: 'Internship Match Index',
      badge: 'Explainable AI',
      icon: Target,
      description: 'Discover how well your student profile aligns with active internships through transparent percentage scores and actionable skill gaps.',
      link: '/student/internship-match',
      highlights: ['Compatibility breakdown', 'Matched skill strengths', 'Skills to develop']
    },
    {
      id: 'prep',
      title: 'Placement Prep Hub',
      badge: 'DSA & Core CS',
      icon: CheckSquare,
      description: 'Stay interview-ready with categorized checklists for DSA, Core Computer Science, Aptitude, and HR questions with real-time progress bars.',
      link: '/student/placement-prep',
      highlights: ['Categorized roadmaps', 'Dynamic progress %', 'Custom milestone tasks']
    }
  ];

  const faqs = [
    {
      q: 'How does InternHub ensure opportunities are verified?',
      a: 'Every listing undergoes strict administrative verification before appearing in active student feeds. Administrators confirm the employer identity, verify official corporate career portal domains, and validate stipend amounts and deadlines. Unverified or pending submissions are isolated from students.'
    },
    {
      q: 'How does application tracking work when applying to external portals?',
      a: 'InternHub directs you to the official corporate portal (e.g. Razorpay, Postman, CRED). When you click Apply, InternHub tracks your application stage in your student dashboard. You can mark whether you are Applied, In Review, Interviewing, Offered, or Withdrawn, complete with recruiter notes.'
    },
    {
      q: 'Why am I required to complete my student profile before applying?',
      a: 'To guarantee quality candidate submissions and comply with academic requirements, students must provide their college, degree, graduation year, and technical skills before tracking or submitting applications.'
    },
    {
      q: 'How does the 15-minute account lockout protect accounts?',
      a: 'To protect student privacy and prevent brute-force credential stuffing, the backend automatically enforces a 15-minute lockout after 5 consecutive failed login attempts on any registered account.'
    },
    {
      q: 'Where can faculty evaluate the software engineering test cases?',
      a: 'Click "Test Cases" in the top navigation bar or footer to open the interactive Test Case Execution Dashboard. All 44 cataloged test cases and 73 automated test assertions can be inspected live with Viva Presentation Mode.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-14 sm:pt-14 sm:pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#FAF8F5] to-indigo-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Truthful Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Opportunities • Official Application Links • Deadline Tracking</span>
          </div>

          {/* Exact Required Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15] sm:leading-[1.12]">
            Your Next Opportunity{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Starts Here.
            </span>
          </h1>

          {/* Exact Required Supporting Text */}
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover verified internships, manage applications, and stay ahead of every deadline — all in one place.
          </p>

          {/* Hero CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/internships" className="btn-primary px-6 py-2.5 text-sm font-semibold shadow-sm">
              <span>Explore Internships</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register" className="btn-secondary px-6 py-2.5 text-sm font-semibold shadow-2xs">
              <span>Get Started</span>
            </Link>
            <Link
              to="/test-cases"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
              title="Open access for academic evaluators"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Faculty Test Dashboard (Public Access)</span>
            </Link>
          </div>

          {/* Search Section */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-3xl mx-auto bg-white p-2.5 sm:p-3 rounded-2xl shadow-card border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2 text-left"
          >
            {/* Title / Company / Skills Input */}
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search role, company, skills (e.g. React, Python, CRED)..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Location Select */}
            <div className="relative w-full sm:w-40">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-8 pr-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="All">All Locations</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Remote">Remote</option>
                <option value="Gurugram">Gurugram</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            {/* Work Mode Select */}
            <div className="relative w-full sm:w-36">
              <select
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="All">All Modes</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-site</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto px-5 py-2.5 text-xs font-semibold shadow-sm shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {(searchQuery || selectedLocation !== 'All' || selectedWorkMode !== 'All') && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn-secondary px-3 py-2.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Compact Dashboard Visual Preview */}
          <div className="mt-10 max-w-4xl mx-auto rounded-3xl bg-white/90 border border-slate-200/90 shadow-card p-4 sm:p-5 text-left backdrop-blur-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 tracking-tight">
                  Student Pipeline & Verification Preview
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Live Preview
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Verified Internship Hub
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1: Verified Listing */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                  <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    3 days left
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">Software Engineering Intern</h4>
                <p className="text-[11px] text-slate-500">Razorpay • Bengaluru • ₹45,000/mo</p>
                <div className="mt-2.5 flex items-center gap-1">
                  <span className="text-[10px] font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200">React</span>
                  <span className="text-[10px] font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200">Node.js</span>
                  <span className="text-[10px] font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200">SQL</span>
                </div>
              </div>

              {/* Card 2: Pipeline Stage Progress */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-600">Application Pipeline</span>
                  <span className="text-[10px] font-bold text-indigo-600">Step 3 of 5</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="h-1.5 flex-1 bg-indigo-600 rounded-full" />
                  <div className="h-1.5 flex-1 bg-indigo-600 rounded-full" />
                  <div className="h-1.5 flex-1 bg-indigo-600 rounded-full animate-pulse" />
                  <div className="h-1.5 flex-1 bg-slate-200 rounded-full" />
                  <div className="h-1.5 flex-1 bg-slate-200 rounded-full" />
                </div>
                <p className="text-xs font-bold text-slate-900">Postman — Interview Stage</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Round 2 Technical Interview scheduled</p>
              </div>

              {/* Card 3: Deadline Alert */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-600">Approaching Deadlines</span>
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-800 font-medium truncate">CRED — Frontend Intern</span>
                    <span className="text-rose-600 font-bold shrink-0">2 days left</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-800 font-medium truncate">Swiggy — Backend Intern</span>
                    <span className="text-amber-600 font-bold shrink-0">5 days left</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Evaluator Access Bar */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              One-Click Viva Login:
            </span>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Login / Autofill Test User</span>
            </button>
            <button
              onClick={handleQuickDemoStudent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-2xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              <span>Demo Student</span>
            </button>
            <button
              onClick={handleQuickDemoAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 transition-all shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Demo Admin Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Featured Verified Internships */}
      <section className="py-14 sm:py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                Curated Opportunities
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Verified Internships
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Hand-picked summer roles vetted by administrators with active corporate portals.
              </p>
            </div>
            <Link to="/internships" className="btn-secondary text-xs py-2 px-4 shadow-2xs shrink-0">
              <span>View All Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredInternships.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  onSelect={(item) => setSelectedInternship(item)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Recently Added Internships */}
      {recentlyAdded.length > 0 && (
        <section className="py-14 sm:py-16 bg-[#FAF8F5] border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                  Fresh Openings
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Recently Added Internships
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  The latest opportunities verified and opened for student applications.
                </p>
              </div>
              <Link to="/internships?sort=newest" className="btn-secondary text-xs py-2 px-4 shadow-2xs shrink-0">
                <span>View Newest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentlyAdded.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  onSelect={(item) => setSelectedInternship(item)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Closing Soon Internships */}
      {closingSoon.length > 0 && (
        <section className="py-14 sm:py-16 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Approaching Cutoffs
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Closing Soon — Apply Promptly
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Active verified internships reaching their application deadline within days.
                </p>
              </div>
              <Link to="/internships?sort=deadline" className="btn-secondary text-xs py-2 px-4 shadow-2xs shrink-0">
                <span>View Upcoming Deadlines</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {closingSoon.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  onSelect={(item) => setSelectedInternship(item)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Internship Categories */}
      <section className="py-14 sm:py-16 bg-[#FAF8F5] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Explore by Specialization
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Engineering Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Jump directly to listings tailored to your technical track and career interests.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {categories.map((c) => {
              const IconComp = c.icon;
              return (
                <div
                  key={c.name}
                  onClick={() => navigate(`/internships?category=${encodeURIComponent(c.name)}`)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-card transition-all cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform shadow-2xs">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{c.count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. How It Works Section */}
      <section className="py-14 sm:py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How InternHub Operates
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              From academic profile setup to direct company submissions and deadline reminders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-slate-200/80 shadow-soft text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-4 shadow-sm">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Complete Your Profile
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add your college, branch, graduation year, and technical skills. Complete profiles unlock verified application discovery.
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-slate-200/80 shadow-soft text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-4 shadow-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Explore Verified Listings
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by work type, branch, stipend, and category. Click official company links to submit directly on employer portals.
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-slate-200/80 shadow-soft text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-4 shadow-sm">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Track Applications & Deadlines
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Organize your stages from Applied to Interview and Offer. Receive notifications before deadlines expire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Platform Core Features */}
      <section className="py-14 sm:py-16 bg-[#FAF8F5] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Features Built for Students
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Engineered with academic rigor, secure authentication, and transparent data models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-3.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Administrative Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Listings must be vetted and approved by administrators before students can discover or apply.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center mb-3.5">
                <ExternalLink className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Direct Employer Links</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applications open directly on official employer career pages, eliminating middleman forms.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mb-3.5">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Application Pipeline</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage your progression across 6 standardized stages with personal notes and interview dates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-3.5">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Smart Deadline Alerts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                In-app notification engine checks saved roles within 7 days and prevents duplicate alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Career Tools Preview Section */}
      <section className="py-14 sm:py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Beyond Discovery
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Complete Career Preparation Suite
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              ATS-compliant resumes, job-description analysis, placement prep, and credential tracking.
            </p>
          </div>

          {/* Tool Tab Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {careerTools.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveToolTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeToolTab === t.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                <span>{t.title}</span>
              </button>
            ))}
          </div>

          {/* Active Tool Showcase Card */}
          {(() => {
            const activeTool = careerTools.find((t) => t.id === activeToolTab) || careerTools[0];
            const IconComp = activeTool.icon;
            return (
              <div className="max-w-3xl mx-auto bg-[#FAF8F5] rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                      <IconComp className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{activeTool.title}</h3>
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        {activeTool.badge}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
                    {activeTool.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {activeTool.highlights.map((h, i) => (
                      <span key={i} className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{h}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to={activeTool.link}
                  className="btn-primary text-xs py-2.5 px-5 shadow-xs shrink-0 self-start md:self-center"
                >
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 9. FAQ Accordion Section */}
      <section className="py-14 sm:py-16 bg-[#FAF8F5] border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Everything you need to know about verification, application tracking, and the evaluation suite.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. Bottom Evaluation Banner */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full inline-block">
            Software Engineering Project Evaluation
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Ready to review the live test case demonstration?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Inspect all 44 cataloged test specifications, boundary-value analysis, and 73 automated test assertions live.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link to="/test-cases" className="btn-primary bg-indigo-500 hover:bg-indigo-600 text-xs px-5 py-2.5 shadow-sm">
              <span>Open Test Case Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/internships" className="btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs px-5 py-2.5">
              Explore Live Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Modal for viewing details */}
      {selectedInternship && (
        <InternshipDetailsModal
          internship={selectedInternship}
          isOpen={Boolean(selectedInternship)}
          onClose={() => setSelectedInternship(null)}
        />
      )}
    </div>
  );
}

export default LandingPage;
