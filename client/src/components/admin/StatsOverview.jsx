import React from 'react';
import {
  Briefcase,
  ShieldCheck,
  Clock,
  Users,
  AlertTriangle,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export function StatsOverview({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Active Verified */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Verified Listings
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{stats.activeVerified}</span>
          <span className="text-xs font-medium text-emerald-600">Visible to students</span>
        </div>
      </div>

      {/* Pending Verification */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Verification
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-amber-600">{stats.pendingVerification}</span>
          <span className="text-xs font-medium text-slate-500">Needs review</span>
        </div>
      </div>

      {/* Total Students */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Student Accounts
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{stats.totalStudents}</span>
          {stats.blockedStudents > 0 && (
            <span className="text-xs font-medium text-rose-500">
              ({stats.blockedStudents} suspended)
            </span>
          )}
        </div>
      </div>

      {/* Applications Tracked */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Applications Tracked
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">
            {stats.totalApplicationsTracked}
          </span>
          <span className="text-xs font-medium text-blue-600">Student intents</span>
        </div>
      </div>
    </div>
  );
}
