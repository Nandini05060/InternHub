import React, { useState } from 'react';
import { StatusBadge, DeadlineBadge } from '../common/Badge.jsx';
import {
  ExternalLink,
  Edit3,
  Calendar,
  Building2,
  CheckCircle,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { applicationApi } from '../../api/extraApis.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../common/Modal.jsx';

const STATUS_OPTIONS = ['Saved', 'Applied', 'In Review', 'Interviewing', 'Offered', 'Rejected', 'Withdrawn'];

export function ApplicationTracker({ applications, stats, onRefresh, onViewInternship }) {
  const toast = useToast();
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingApp, setEditingApp] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('Applied');
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = (app) => {
    setEditingApp(app);
    setEditStatus(app.status);
    setEditNotes(app.notes || '');
  };

  const handleSaveEdit = async () => {
    if (!editingApp) return;
    setSaving(true);
    try {
      await applicationApi.updateStatus(editingApp.internship_id, editStatus, editNotes);
      toast.success('Application status updated!');
      setEditingApp(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to update application');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (app, newStatus) => {
    try {
      await applicationApi.updateStatus(app.internship_id, newStatus, app.notes || '');
      toast.success(`Status changed to ${newStatus}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to change status');
    }
  };

  const filteredApps = filterStatus === 'All'
    ? applications
    : applications.filter(a => a.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Funnel Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setFilterStatus('All')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'All'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider block ${filterStatus === 'All' ? 'text-indigo-100' : 'text-slate-500'}`}>
            Total Tracked
          </span>
          <span className="text-2xl font-bold mt-1 block">{applications.length}</span>
        </div>

        <div
          onClick={() => setFilterStatus('Applied')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'Applied'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider block ${filterStatus === 'Applied' ? 'text-blue-100' : 'text-slate-500'}`}>
            Applied
          </span>
          <span className="text-2xl font-bold mt-1 block">
            {applications.filter(a => a.status === 'Applied').length}
          </span>
        </div>

        <div
          onClick={() => setFilterStatus('In Review')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'In Review'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider block ${filterStatus === 'In Review' ? 'text-amber-100' : 'text-slate-500'}`}>
            In Review
          </span>
          <span className="text-2xl font-bold mt-1 block">
            {stats?.inReview || applications.filter(a => a.status === 'In Review').length}
          </span>
        </div>

        <div
          onClick={() => setFilterStatus('Interviewing')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'Interviewing'
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider block ${filterStatus === 'Interviewing' ? 'text-purple-100' : 'text-slate-500'}`}>
            Interviewing
          </span>
          <span className="text-2xl font-bold mt-1 block">
            {stats?.interviewing || applications.filter(a => a.status === 'Interviewing').length}
          </span>
        </div>

        <div
          onClick={() => setFilterStatus('Offered')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'Offered'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider block ${filterStatus === 'Offered' ? 'text-emerald-100' : 'text-slate-500'}`}>
            Offers Received
          </span>
          <span className="text-2xl font-bold mt-1 block">
            {stats?.offered || applications.filter(a => a.status === 'Offered').length}
          </span>
        </div>

        <div
          onClick={() => setFilterStatus('Saved')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'Saved'
              ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider block ${filterStatus === 'Saved' ? 'text-slate-300' : 'text-slate-500'}`}>
            Saved Intent
          </span>
          <span className="text-2xl font-bold mt-1 block">
            {applications.filter(a => a.status === 'Saved').length}
          </span>
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Internship Pipeline</h3>
            <p className="text-xs text-slate-500">
              Showing {filteredApps.length} opportunities in stage "{filterStatus}"
            </p>
          </div>

          {/* Quick status tabs */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full">
            {['All', ...STATUS_OPTIONS].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  filterStatus === s
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No applications found in stage "{filterStatus}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3.5">Company & Role</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Stage / Status</th>
                  <th className="px-6 py-3.5">Notes</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Role & Company */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.company_logo}
                          alt={app.company_name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop';
                          }}
                        />
                        <div>
                          <span
                            onClick={() => onViewInternship && onViewInternship(app.internship_id)}
                            className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer block line-clamp-1"
                          >
                            {app.title}
                          </span>
                          <span className="text-xs text-slate-500">{app.company_name} • {app.stipend}</span>
                        </div>
                      </div>
                    </td>

                    {/* Applied Date */}
                    <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.applied_date || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleQuickStatusChange(app, e.target.value)}
                        className="text-xs font-semibold rounded-lg px-2.5 py-1 border border-slate-200 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-2xs"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Notes preview */}
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">
                      <p className="line-clamp-2 italic text-slate-500">
                        {app.notes || 'No notes added yet.'}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(app)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Status & Notes"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {app.application_link && (
                          <a
                            href={app.application_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Visit Official Career Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Notes & Status Modal */}
      {editingApp && (
        <Modal
          isOpen={!!editingApp}
          onClose={() => setEditingApp(null)}
          title={`Update Progress: ${editingApp.company_name}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Stage
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="input-base"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Application Notes & Interview Reminders
              </label>
              <textarea
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="e.g. HR Screening completed. Technical round scheduled with senior engineer on Thursday at 3 PM. Remember to review SQL indexing."
                className="input-base"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setEditingApp(null)} className="btn-secondary text-xs">
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={saving} className="btn-primary text-xs">
                {saving ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
