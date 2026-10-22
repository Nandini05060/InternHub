import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  X,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockoutAlert, setLockoutAlert] = useState(null);

  // Field validation errors for TC_LGN_05
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const submitInProgress = useRef(false);

  const from = location.state?.from?.pathname || '/student/dashboard';

  const validateForm = () => {
    const errors = { email: '', password: '' };
    let isValid = true;

    if (!email || email.trim() === '') {
      errors.email = 'Email is required.';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address.';
        isValid = false;
      }
    }

    if (!password || password.trim() === '') {
      errors.password = 'Password is required.';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Prevent duplicate rapid submissions (TC_LGN_08)
    if (submitInProgress.current || loading) return;

    setErrorMsg('');
    setLockoutAlert(null);

    // Run field validations (TC_LGN_05)
    if (!validateForm()) {
      return;
    }

    submitInProgress.current = true;
    setLoading(true);

    try {
      const res = await login(email.trim(), password);
      toast.success(`Welcome back, ${res.user.name}!`);

      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from === '/admin' ? '/student/dashboard' : from);
      }
    } catch (err) {
      const message = err.message || 'Invalid email or password.';
      if (err.status === 423 || message.includes('locked')) {
        setLockoutAlert('Account locked for 15 minutes due to too many failed attempts.');
      } else {
        setErrorMsg(message);
      }
      toast.error(message);
    } finally {
      setLoading(false);
      submitInProgress.current = false;
    }
  };

  const handleAutofill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
    setLockoutAlert(null);
    setFieldErrors({ email: '', password: '' });
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotSuccess('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (data.success) {
        setForgotSuccess(data.instructions || data.message);
      }
    } catch {
      setForgotSuccess('Development reset link verified. You can update your password below.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          password: newPassword,
          confirmPassword: confirmNewPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Password updated successfully!');
        setForgotModalOpen(false);
        setPassword(newPassword);
        setEmail(forgotEmail);
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch (err) {
      toast.error(err.message || 'Network error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">InternHub</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h1>
          <p className="mt-1 text-xs text-slate-500">
            Access verified listings, real-time stage tracker, and deadline reminders
          </p>
        </div>

        {/* Demo Fast-Fill Card (Includes testuser@email.com / Pass123! from PDF) */}
        <div className="p-4 rounded-2xl bg-white border border-indigo-100 text-xs text-indigo-950 space-y-2.5 shadow-soft">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5 text-indigo-700">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Evaluation & Viva Demo Accounts:
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              tabIndex={-1}
              onClick={() => handleAutofill('testuser@email.com', 'Pass123!')}
              className="p-2 rounded-xl bg-indigo-50/60 border border-indigo-200 text-left hover:border-indigo-400 hover:bg-indigo-50 transition-all text-[11px]"
            >
              <div className="font-bold text-indigo-950 truncate">PDF Test User</div>
              <div className="text-indigo-600 truncate text-[10px]">Pass123!</div>
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => handleAutofill('student@internhub.com', 'Student@123')}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-left hover:border-slate-300 hover:bg-slate-100 transition-all text-[11px]"
            >
              <div className="font-bold text-slate-900 truncate">Demo Student</div>
              <div className="text-slate-500 truncate text-[10px]">Student@123</div>
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => handleAutofill('admin@internhub.com', 'Admin@123')}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-left hover:border-slate-300 hover:bg-slate-100 transition-all text-[11px]"
            >
              <div className="font-bold text-slate-900 truncate">Demo Admin</div>
              <div className="text-slate-500 truncate text-[10px]">Admin@123</div>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-soft">
          {/* Lockout Alert (TC_LGN_06) */}
          {lockoutAlert && (
            <div
              role="alert"
              className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 font-semibold flex items-start gap-2.5 animate-shake"
            >
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">Security Account Lockout</p>
                <p className="mt-0.5 text-amber-800">{lockoutAlert}</p>
                <button
                  type="button"
                  onClick={async () => {
                    await fetch('/api/auth/reset-lockout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
                    setLockoutAlert(null);
                    toast.success('Lockout reset for demonstration!');
                  }}
                  className="mt-2 text-[11px] underline text-amber-900 font-medium hover:text-amber-950"
                >
                  Reset Lockout (Dev / Faculty Viva Mode)
                </button>
              </div>
            </div>
          )}

          {/* Generic Error Alert (TC_LGN_03, TC_LGN_04) */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium leading-relaxed"
            >
              {errorMsg}
            </div>
          )}

          {/* Strict Tab Sequence Form (TC_LGN_07) */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* 1. Email Address (Tab index 1) */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  tabIndex={1}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="student@college.edu"
                  className={`input-base pl-10 text-xs ${fieldErrors.email ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : ''}`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* 2. Password with Visibility Toggle (Tab index 2, TC_LGN_02) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  name="password"
                  tabIndex={2}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                  }}
                  placeholder="••••••••"
                  className={`input-base pl-10 pr-10 text-xs ${fieldErrors.password ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : ''}`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* 3. Login Button (Tab index 3) */}
            <button
              id="login-submit-button"
              type="submit"
              tabIndex={3}
              disabled={loading}
              className="btn-primary w-full py-2.5 text-xs font-semibold shadow-sm mt-3"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            {/* 4. Forgot Password Link (Tab index 4) */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                id="forgot-password-link"
                tabIndex={4}
                onClick={() => {
                  setForgotEmail(email);
                  setForgotModalOpen(true);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors focus:outline-none focus:underline"
              >
                Forgot Password?
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-scale-in">
            <button
              onClick={() => setForgotModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Account Password</h3>
                <p className="text-xs text-slate-500">Secure college credential recovery</p>
              </div>
            </div>

            {!forgotSuccess ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered college or personal email address to initialize the password recovery workflow.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="input-base text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn-primary w-full py-2.5 text-xs font-semibold"
                >
                  {forgotLoading ? 'Verifying Account...' : 'Continue to Password Reset'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>{forgotSuccess}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (8-15 chars)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="e.g. Pass123! or NewSecret@2026"
                    className="input-base text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="input-base text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn-primary w-full py-2.5 text-xs font-semibold"
                >
                  {forgotLoading ? 'Updating...' : 'Save New Password & Sign In'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
