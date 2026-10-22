import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { notificationApi } from '../../api/extraApis.js';
import {
  GraduationCap,
  Bell,
  User,
  LogOut,
  Briefcase,
  Bookmark,
  Shield,
  Check,
  ChevronDown,
  Clock,
  Sparkles,
  Menu,
  X,
  FlaskConical,
  FileText,
  Search,
  Layers,
  Target,
  CheckSquare,
  Award,
  MessageSquare,
  FolderLock
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCareerOpen, setMobileCareerOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [careerDropdownOpen, setCareerDropdownOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const userRef = useRef(null);
  const careerRef = useRef(null);

  // Fetch notifications for authenticated users
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    async function fetchNotifs() {
      try {
        const res = await notificationApi.getNotifications();
        if (res.success && isMounted) {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unreadCount || 0);
        }
      } catch (err) {
        // Silently handle
      }
    }

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // 30s poll
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, location.pathname]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (careerRef.current && !careerRef.current.contains(e.target)) {
        setCareerDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationApi.markRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? ({ ...n, is_read: true }) : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {}
    }
    setNotifDropdownOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-slate-900 tracking-tight">InternHub</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Verified
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 hidden sm:inline -mt-0.5">Discovery & Tracking Platform</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/internships"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/internships')
                    ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Browse Internships
              </Link>

              <Link
                to="/test-cases"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/test-cases')
                    ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FlaskConical className="w-4 h-4 text-indigo-600" />
                <span>Test Cases</span>
              </Link>

              {isAuthenticated && isStudent && (
                <>
                  <Link
                    to="/student/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/student/dashboard')
                        ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Pipeline
                  </Link>

                  {/* Career Tools Dropdown */}
                  <div className="relative" ref={careerRef}>
                    <button
                      type="button"
                      onClick={() => setCareerDropdownOpen(!careerDropdownOpen)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        location.pathname.startsWith('/student/resume') ||
                        location.pathname.startsWith('/student/internship-match') ||
                        location.pathname.startsWith('/student/placement-prep') ||
                        location.pathname.startsWith('/student/skills') ||
                        location.pathname.startsWith('/student/interview') ||
                        location.pathname.startsWith('/student/document')
                          ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Career Tools</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {careerDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-slide-up divide-y divide-slate-100">
                        <div className="py-1">
                          <Link
                            to="/student/resume-builder"
                            onClick={() => setCareerDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <div className="text-slate-900">Resume Builder</div>
                              <div className="text-[10px] text-slate-400 font-normal">ATS-friendly visual creator</div>
                            </div>
                          </Link>
                          <Link
                            to="/student/resume-analyzer"
                            onClick={() => setCareerDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors"
                          >
                            <Search className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <div className="text-slate-900">Resume Analyzer</div>
                              <div className="text-[10px] text-slate-400 font-normal">Score & keyword coverage</div>
                            </div>
                          </Link>
                          <Link
                            to="/student/resume-versions"
                            onClick={() => setCareerDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors"
                          >
                            <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <div className="text-slate-900">Resume Versions</div>
                              <div className="text-[10px] text-slate-400 font-normal">Multi-role tailored drafts</div>
                            </div>
                          </Link>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/student/internship-match"
                            onClick={() => setCareerDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors"
                          >
                            <Target className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <div className="text-slate-900">Internship Match</div>
                              <div className="text-[10px] text-slate-400 font-normal">Compatibility index</div>
                            </div>
                          </Link>
                          <Link
                            to="/student/placement-prep"
                            onClick={() => setCareerDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors"
                          >
                            <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <div className="text-slate-900">Placement Preparation</div>
                              <div className="text-[10px] text-slate-400 font-normal">DSA, aptitude & core CS</div>
                            </div>
                          </Link>
                          <Link
                            to="/student/skills-certifications"
                            onClick={() => setCareerDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors"
                          >
                            <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <div className="text-slate-900">Skills & Certifications</div>
                              <div className="text-[10px] text-slate-400 font-normal">Track credentials & goals</div>
                            </div>
                          </Link>
                          <Link
                            to="/student/interview-practice"
                            onClick={() => setCareerDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <div className="text-slate-900">Interview Practice</div>
                              <div className="text-[10px] text-slate-400 font-normal">Role-based mock rehearsal</div>
                            </div>
                          </Link>
                          <Link
                            to="/student/document-vault"
                            onClick={() => setCareerDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors"
                          >
                            <FolderLock className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <div className="text-slate-900">Document Vault</div>
                              <div className="text-[10px] text-slate-400 font-normal">Private asset storage</div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/student/saved"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/student/saved')
                        ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Saved
                  </Link>
                </>
              )}


              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Admin Portal
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section: Auth & Notifications */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-slide-up">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-sm text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                                !n.is_read ? 'bg-indigo-50/40' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                                {!n.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(n.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left focus:outline-none"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[120px]">
                        {user?.name}
                      </span>
                      <span className="text-[10px] text-indigo-600 font-medium capitalize">
                        {user?.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-slide-up">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-xs font-semibold text-slate-900 truncate">{user?.email}</p>
                      </div>

                      {isStudent && (
                        <>
                          <Link
                            to="/student/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            My Student Profile
                          </Link>
                          <Link
                            to="/student/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            Application Tracker
                          </Link>
                          <Link
                            to="/student/saved"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Bookmark className="w-4 h-4 text-slate-400" />
                            Saved Bookmarks
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-slate-400" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-xs py-2 px-3.5">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary text-xs py-2 px-4 shadow-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/internships"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Browse Internships
          </Link>
          <Link
            to="/test-cases"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100"
          >
            <FlaskConical className="w-4 h-4 text-indigo-600" />
            <span>Test Cases (Faculty Viva)</span>
          </Link>
          {isAuthenticated ? (
            <>
              {isStudent && (
                <>
                  <Link
                    to="/student/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/student/saved"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Saved Internships
                  </Link>
                  <Link
                    to="/student/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Profile
                  </Link>

                  <div className="pt-2 pb-1 border-t border-slate-100">
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Career Tools</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <Link
                        to="/student/resume-builder"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Resume Builder</span>
                      </Link>
                      <Link
                        to="/student/resume-analyzer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                      >
                        <Search className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Analyzer</span>
                      </Link>
                      <Link
                        to="/student/resume-versions"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Versions</span>
                      </Link>
                      <Link
                        to="/student/internship-match"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                      >
                        <Target className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Match Index</span>
                      </Link>
                      <Link
                        to="/student/placement-prep"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Placement Prep</span>
                      </Link>
                      <Link
                        to="/student/skills-certifications"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                      >
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Skills</span>
                      </Link>
                      <Link
                        to="/student/interview-practice"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Interview Prep</span>
                      </Link>
                      <Link
                        to="/student/document-vault"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                      >
                        <FolderLock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Vault</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary w-full justify-center"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full justify-center"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
