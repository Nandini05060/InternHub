import React, { useState } from 'react';
import { UserCheck, UserX, Search, ShieldAlert, CheckCircle2, GraduationCap } from 'lucide-react';
import { adminApi } from '../../api/extraApis.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../common/Modal.jsx';

export function StudentManagerTable({ students, onRefresh }) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [targetStudent, setTargetStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleToggleBlock = async (student) => {
    setLoading(true);
    try {
      const willBlock = !student.is_blocked;
      await adminApi.toggleBlockStudent(student.id, willBlock);
      toast.success(
        willBlock
          ? `Account for ${student.name} has been suspended.`
          : `Account for ${student.name} has been activated.`
      );
      setTargetStudent(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to update student account status');
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.university && s.university.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
      {/* Top bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Student Directory & Moderation</h3>
          <p className="text-xs text-slate-500">
            Total of {students.length} students registered on the platform
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by name, email, college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 py-2 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3.5">Student</th>
              <th className="px-6 py-3.5">Academic Background</th>
              <th className="px-6 py-3.5">Activity</th>
              <th className="px-6 py-3.5">Account Status</th>
              <th className="px-6 py-3.5 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                  No students found matching your query.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Name and Email */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {s.name?.[0] || 'S'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{s.name}</span>
                        <span className="text-xs text-slate-500">{s.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* University & Degree */}
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-slate-800 block">
                          {s.university || 'University Not Specified'}
                        </span>
                        <span className="text-slate-400">
                          {s.degree || 'Degree'} • Class of {s.graduation_year || 2026}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Applications & Saved */}
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div className="space-y-0.5">
                      <div>
                        <strong className="text-slate-800">{s.total_applications || 0}</strong> applications
                      </div>
                      <div className="text-slate-400">
                        {s.saved_count || 0} bookmarks
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {s.is_blocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setTargetStudent(s)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        s.is_blocked
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      {s.is_blocked ? 'Unblock Student' : 'Suspend Account'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {targetStudent && (
        <Modal
          isOpen={!!targetStudent}
          onClose={() => setTargetStudent(null)}
          title={targetStudent.is_blocked ? 'Reactivate Student Account' : 'Suspend Student Account'}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              {targetStudent.is_blocked ? (
                <>
                  Are you sure you want to reactivate access for <strong>{targetStudent.name}</strong> ({targetStudent.email})? The student will be able to log in and discover internships again.
                </>
              ) : (
                <>
                  Are you sure you want to suspend access for <strong>{targetStudent.name}</strong> ({targetStudent.email})? While suspended, the student will be immediately blocked from logging in or tracking applications.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setTargetStudent(null)} className="btn-secondary text-xs">
                Cancel
              </button>
              <button
                onClick={() => handleToggleBlock(targetStudent)}
                disabled={loading}
                className={targetStudent.is_blocked ? 'btn-primary text-xs' : 'btn-danger text-xs'}
              >
                {loading ? 'Processing...' : targetStudent.is_blocked ? 'Activate Account' : 'Suspend Account'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
