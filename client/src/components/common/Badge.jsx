import React from 'react';
import { ShieldCheck, MapPin, Clock, Calendar } from 'lucide-react';

export function VerifiedBadge({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs ${className}`}>
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
      Verified Listing
    </span>
  );
}

export function WorkTypeBadge({ type, className = '' }) {
  const norm = (type || 'remote').toLowerCase();
  let bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  let label = 'Remote';

  if (norm === 'hybrid') {
    bg = 'bg-sky-50 text-sky-700 border-sky-200';
    label = 'Hybrid';
  } else if (norm === 'on-site' || norm === 'onsite') {
    bg = 'bg-slate-100 text-slate-700 border-slate-300';
    label = 'On-site';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border capitalize ${bg} ${className}`}>
      <MapPin className="w-3 h-3 opacity-75" />
      {label}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const s = status || 'Saved';
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (s === 'Applied') {
    style = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (s === 'In Review') {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (s === 'Interviewing') {
    style = 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';
  } else if (s === 'Offered') {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
  } else if (s === 'Rejected') {
    style = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (s === 'Withdrawn') {
    style = 'bg-slate-200 text-slate-800 border-slate-300';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style} ${className}`}>
      {s}
    </span>
  );
}

export function DeadlineBadge({ deadline, className = '' }) {
  if (!deadline) return null;
  const target = new Date(deadline);
  const now = new Date();
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let text = `${diffDays} days left`;

  if (diffDays < 0) {
    color = 'bg-rose-50 text-rose-700 border-rose-200';
    text = 'Expired';
  } else if (diffDays <= 3) {
    color = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold animate-pulse';
    text = `${diffDays} day${diffDays === 1 ? '' : 's'} left!`;
  } else if (diffDays <= 7) {
    color = 'bg-amber-50 text-amber-700 border-amber-200 font-medium';
    text = `${diffDays} days left`;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs border ${color} ${className}`}>
      <Calendar className="w-3 h-3 opacity-80" />
      {text}
    </span>
  );
}
