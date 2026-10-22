import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 animate-pulse shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-100 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-100 rounded w-full"></div>
        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <div className="h-6 bg-slate-100 rounded-md w-16"></div>
        <div className="h-6 bg-slate-100 rounded-md w-20"></div>
        <div className="h-6 bg-slate-100 rounded-md w-24"></div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
}
