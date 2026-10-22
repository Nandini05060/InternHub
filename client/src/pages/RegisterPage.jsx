import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { GraduationCap, Mail, Lock, User, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Live password policy checks (Phase 4: 8-15 chars, uppercase, number, special char)
  const pwd = formData.password;
  const isLenValid = pwd.length >= 8 && pwd.length <= 15;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_=+[\]\\/`~]/.test(pwd);
  const isPasswordValid = isLenValid && hasUpper && hasNumber && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!isPasswordValid) {
      if (pwd.length < 8 || pwd.length > 15) {
        setErrorMsg(`Password length must be between 8 and 15 characters (currently ${pwd.length}).`);
      } else if (!hasUpper) {
        setErrorMsg('Password must contain at least one uppercase letter.');
      } else if (!hasNumber) {
        setErrorMsg('Password must contain at least one number.');
      } else {
        setErrorMsg('Password must contain at least one special character (!@#$%^&* etc.).');
      }
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'student'
      });
      toast.success('Account created! Welcome to InternHub.');
      navigate('/student/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">InternHub</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your student account</h1>
          <p className="mt-1 text-xs text-slate-500">
            Join college students discovering verified internships with deadline alerts
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-soft">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Sharma"
                  className="input-base pl-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                College / Personal Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex.sharma@college.edu"
                  className="input-base pl-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password (8–15 characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="e.g. Pass123! or Secure@2026"
                  className="input-base pl-10 text-xs"
                />
              </div>

              {/* Live Password Policy Feedback (Phase 4 BVA Guidance) */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1">
                <span className="font-semibold text-slate-600 block mb-1">Password Requirements:</span>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  <div className={`flex items-center gap-1.5 ${isLenValid ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {isLenValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>8–15 chars ({pwd.length})</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>1 Uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>1 Number</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>1 Special symbol</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className="input-base pl-10 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-xs font-semibold shadow-sm mt-3"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
