import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  Plus,
  Search,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { StatusBadge, WorkTypeBadge, DeadlineBadge } from '../common/Badge.jsx';
import { internshipApi } from '../../api/internshipApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../common/Modal.jsx';

export function InternshipManagerTable({
  internships,
  onRefresh,
  onEditInternship,
  onAddInternship
}) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Status Actions
  const handleVerify = async (id, status) => {
    setActionLoading(true);
    try {
      await internshipApi.verifyInternship(id, status);
      toast.success(`Listing marked as ${status}!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message || 'Verification update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleExpired = async (id, currentExpired) => {
    setActionLoading(true);
    try {
      await internshipApi.toggleExpired(id, !currentExpired);
      toast.success(!currentExpired ? 'Listing marked as expired and hidden from discovery.' : 'Listing restored to active discovery.');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle expired state');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setActionLoading(true);
    try {
      await internshipApi.deleteInternship(deleteConfirmId);
      toast.success('Internship listing permanently removed.');
      setDeleteConfirmId(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter listings
  const filtered = internships.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.company_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ? true : item.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
      {/* Table Action Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9 py-2 text-xs"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-base py-2 text-xs w-full sm:w-40 bg-slate-50 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
        </div>

        {/* Add new button */}
        <button
          onClick={onAddInternship}
          className="btn-primary text-xs py-2 px-4 shadow-sm w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Internship</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3.5">Listing</th>
              <th className="px-6 py-3.5">Mode & Deadline</th>
              <th className="px-6 py-3.5">Verification</th>
              <th className="px-6 py-3.5">Discovery State</th>
              <th className="px-6 py-3.5 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                  No internships match your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Role & Company */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.company_logo}
                        alt={item.company_name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop';
                        }}
                      />
                      <div>
                        <span className="font-bold text-slate-900 block line-clamp-1">{item.title}</span>
                        <span className="text-xs text-slate-500">{item.company_name} • {item.category}</span>
                      </div>
                    </div>
                  </td>

                  {/* Mode & Deadline */}
                  <td className="px-6 py-4 text-xs">
                    <div className="space-y-1">
                      <WorkTypeBadge type={item.work_type} />
                      <div className="text-slate-500 mt-1">Due: {item.deadline}</div>
                    </div>
                  </td>

                  {/* Verification Status */}
                  <td className="px-6 py-4">
                    {item.verification_status === 'verified' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Verified
                      </span>
                    )}
                    {item.verification_status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Review
                      </span>
                    )}
                    {item.verification_status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
                      </span>
                    )}
                  </td>

                  {/* Discovery / Expired state */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleExpired(item.id, item.is_expired)}
                      disabled={actionLoading}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                        item.is_expired
                          ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title="Click to toggle expired flag"
                    >
                      {item.is_expired ? 'Expired (Hidden)' : 'Active in Search'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.verification_status !== 'verified' && (
                        <button
                          onClick={() => handleVerify(item.id, 'verified')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Verify Listing"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      {item.verification_status !== 'rejected' && (
                        <button
                          onClick={() => handleVerify(item.id, 'rejected')}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                          title="Reject Listing"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => onEditInternship(item)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Edit Listing"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <a
                        href={item.application_link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Open Official Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Confirm Permanent Deletion"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800 leading-relaxed">
                Are you sure you want to delete this internship? This will also remove all student saved bookmarks and tracked application entries associated with it. This action cannot be undone.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary text-xs">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="btn-danger text-xs"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Listing'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
