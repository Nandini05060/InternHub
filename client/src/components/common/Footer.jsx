import React from 'react';
import { GraduationCap, ShieldCheck, Heart, Github, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">InternHub</span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              The centralized college internship discovery platform built to eliminate fake, duplicate, and expired listings. Helping students discover verified opportunities, track applications, and hit every deadline.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Opportunities with Official Application Links
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Platform & Career</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/internships" className="hover:text-indigo-600 transition-colors">
                  Explore Internships
                </Link>
              </li>
              <li>
                <Link to="/student/resume-builder" className="hover:text-indigo-600 transition-colors">
                  ATS Resume Builder
                </Link>
              </li>
              <li>
                <Link to="/student/resume-analyzer" className="hover:text-indigo-600 transition-colors">
                  Resume Analyzer
                </Link>
              </li>
              <li>
                <Link to="/student/placement-prep" className="hover:text-indigo-600 transition-colors">
                  Placement Preparation
                </Link>
              </li>
              <li>
                <Link to="/student/dashboard" className="hover:text-indigo-600 transition-colors">
                  Student Pipeline
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Engineering Project</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <span className="font-medium text-slate-800">Stack:</span> React, Vite, Node, Express, MySQL
              </li>
              <li>
                <span className="font-medium text-slate-800">Security:</span> Bcrypt + JWT Auth
              </li>
              <li>
                <span className="font-medium text-slate-800">Testing:</span> Vitest & Supertest
              </li>
              <li>
                <Link to="/test-cases" className="font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
                  Faculty Test Dashboard →
                </Link>
              </li>
              <li>
                <span className="font-medium text-slate-800">License:</span> MIT Academic
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} InternHub. Designed & Built for College Software Engineering.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Students
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
