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
  CheckSquare
} from 'lucide-react';
import { internshipApi } from '../api/internshipApi.js';
import { InternshipCard } from '../components/internships/InternshipCard.jsx';
import { InternshipDetailsModal } from '../components/internships/InternshipDetailsModal.jsx';
import { CardSkeleton } from '../components/common/SkeletonLoader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');

  const [featuredInternships, setFeaturedInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState(null);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await internshipApi.getInternships({ sort: 'newest' });
        if (res.success) {
          // Take top 3 verified active for showcase
          setFeaturedInternships((res.internships || []).slice(0, 3));
        }
      } catch (err) {
        console.error('Featured internships load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
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
    { name: 'Software Engineering', count: 'MERN, Python, Java', icon: Laptop },
    { name: 'Frontend Development', count: 'React, Tailwind, Vue', icon: Sparkles },
    { name: 'Backend Engineering', count: 'Node, Express, MySQL', icon: Layers },
    { name: 'Data Science & AI', count: 'Python, PyTorch, SQL', icon: TrendingUp },
    { name: 'DevOps & Cloud', count: 'Docker, AWS, Linux', icon: Zap },
    { name: 'UI/UX Product Design', count: 'Figma, Design Systems', icon: Briefcase }
  ];

  const faqs = [
    {
      q: 'How does InternHub verify that internships are legitimate?',
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
      a: 'Click "Test Cases" in the top navigation bar or footer to open the interactive Test Case Execution Dashboard, where all 31 automated test cases, boundary-value analyses, and viva presentation modes can be inspected live.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/70 bg-gradient-to-b from-[#FDFBF7] via-[#FAF8F5] to-indigo-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero Fake Listings • Zero Expired Links • 100% Official Employer Portals</span>
          </div>

          {/* Exact Required Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Your Next Opportunity{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Starts Here.
            </span>
          </h1>

          {/* Exact Required Supporting Text */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover verified internships, manage applications, and stay ahead of every deadline — all in one place.
          </p>

          {/* Hero CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/internships" className="btn-primary px-6 py-3 text-sm font-semibold shadow-sm">
              <span>Explore Internships</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register" className="btn-secondary px-6 py-3 text-sm font-semibold shadow-2xs">
              <span>Get Started</span>
            </Link>
            <Link
              to="/test-cases"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Faculty Test Dashboard</span>
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
                placeholder="Role, company, or skills (e.g. React, Node, Python)..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Location Select */}
            <div className="relative w-full sm:w-40">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-8 pr-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="All">All Locations</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Remote">Remote</option>
                <option value="Gurugram">Gurugram</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            {/* Work Mode Select */}
            <div className="relative w-full sm:w-36">
              <select
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="All">All Modes</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-site</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto px-5 py-2.5 text-xs font-semibold shadow-sm shrink-0"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Evaluator Access Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              One-Click Viva Login:
            </span>
            <button
              onClick={() => {
                navigate('/login');
              }}
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

      {/* 2. Platform Value: Verified vs Bad Portals */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Why InternHub Matters
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Built for Students, Governed by Verification
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              College students lose precious time navigating expired job listings, unverified agents, and scattered messaging channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-slate-200/80 shadow-soft flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">
                  100% Verified Listings Only
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every opportunity is vetted by platform administrators. Pending, unverified, and expired listings are strictly excluded from the student feed.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Fake Application Portals</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-slate-200/80 shadow-soft flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">
                  Integrated Stage Tracker
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Eliminate messy spreadsheets. Track applications from Saved to Applied, Under Review, Interviewing, and Offer with notes.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Database-Backed Stage Persistence</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-slate-200/80 shadow-soft flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">
                  Approaching Deadline Alerts
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Never miss out on your target role due to an overlooked cutoff date. Dynamic countdown badges and reminder services alert you on time.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Smart Duplicate-Free Reminders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Verified Internships */}
      <section className="py-16 sm:py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                Verified Openings
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Verified Internships
              </h2>
            </div>
            <Link to="/internships" className="btn-secondary text-xs py-2 px-4 shadow-2xs">
              <span>View All Internships</span>
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

      {/* 4. Internship Categories */}
      <section className="py-16 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Explore by Specialization
            </h2>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Popular Engineering Categories
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {categories.map((c) => {
              const IconComp = c.icon;
              return (
                <div
                  key={c.name}
                  onClick={() => navigate(`/internships?category=${encodeURIComponent(c.name)}`)}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80 hover:border-indigo-400 hover:shadow-card transition-all cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-2xs">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {c.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{c.count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section className="py-16 sm:py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Simple 3-Step Process
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How InternHub Operates
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-4 shadow-sm">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">
                Complete Your Profile
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add your college, branch, graduation year, and technical skills. Complete profiles unlock verified application discovery.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-4 shadow-sm">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">
                Explore Verified Listings
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by work type, branch, stipend, and category. Click official company links to submit directly on employer portals.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-4 shadow-sm">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">
                Track Applications & Deadlines
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Organize your stages from Applied to Interview and Offer. Receive notifications before deadlines expire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion Section */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Frequently Asked Questions
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform & Architecture Details
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#FAF8F5] rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
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
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Bottom Evaluation CTA Banner */}
      <section className="py-14 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to review the live test case demonstration?
          </h2>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
            View the automated test harness, boundary-value analysis, and traceability matrix live.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/test-cases" className="btn-primary bg-indigo-500 hover:bg-indigo-600 text-xs px-5 py-2.5">
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
