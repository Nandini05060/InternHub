import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { careerApi } from '../api/careerApi.js';
import { applicationApi } from '../api/extraApis.js';
import { generateResumePdf } from '../utils/pdfGenerator.js';
import {
  Layers,
  Plus,
  Edit3,
  Copy,
  Download,
  Trash2,
  Calendar,
  Building,
  CheckCircle2,
  Sparkles,
  Link2,
  ExternalLink,
  Briefcase
} from 'lucide-react';

export function ResumeVersionsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  // Modals
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [activeResume, setActiveResume] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');

  const loadData = async () => {
    try {
      const [resumesRes, appsRes] = await Promise.all([
        careerApi.getResumes(),
        applicationApi.getApplications()
      ]);
      if (resumesRes.success) setResumes(resumesRes.resumes || []);
      if (appsRes.success) setApplications(appsRes.applications || []);
    } catch (err) {
      console.error('Failed to load resume versions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNew = async () => {
    try {
      const res = await careerApi.createResume({
        title: `Resume — ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
        target_role: 'Software Developer',
        template_id: 'ats_minimal',
        version_status: 'draft'
      });
      if (res.success && res.resume) {
        toast.success('New resume created!');
        navigate(`/student/resume-builder?id=${res.resume.id}`);
      }
    } catch (err) {
      toast.error('Failed to create new resume.');
    }
  };

  const handleDuplicate = async (resumeId) => {
    try {
      const res = await careerApi.duplicateResume(resumeId);
      if (res.success) {
        toast.success(`Duplicated as "${res.resume.title}"!`);
        loadData();
      }
    } catch (err) {
      toast.error('Failed to duplicate resume.');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await careerApi.deleteResume(id);
      if (res.success) {
        toast.success('Resume version deleted.');
        setResumes(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete resume.');
    }
  };

  const handleDownload = (resume) => {
    try {
      generateResumePdf(resume, {
        compact: false,
        filename: `${(resume.title || 'Resume').replace(/\s+/g, '_')}.pdf`
      });
      toast.success('Downloading vector PDF!');
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    }
  };

  const openRename = (resume) => {
    setActiveResume(resume);
    setNewTitle(resume.title);
    setRenameModalOpen(true);
  };

  const handleSaveRename = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await careerApi.updateResume(activeResume.id, { title: newTitle.trim() });
      if (res.success) {
        toast.success('Resume renamed.');
        setRenameModalOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error('Failed to rename resume.');
    }
  };

  const openLink = (resume) => {
    setActiveResume(resume);
    setLinkModalOpen(true);
  };

  const handleSaveLink = async (e) => {
    e.preventDefault();
    if (!selectedAppId) {
      toast.error('Please select an internship application to link.');
      return;
    }

    try {
      // Save vaulted reference linking resume to application
      await careerApi.createVaultDocument({
        name: `${activeResume.title}.pdf`,
        documentType: 'resume',
        applicationId: parseInt(selectedAppId, 10),
        notes: `Linked resume version: ${activeResume.title}`
      });
      toast.success('Resume version linked to application successfully!');
      setLinkModalOpen(false);
    } catch (err) {
      toast.error('Failed to link resume to application.');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Layers className="w-3.5 h-3.5" />
            <span>Target-Specific Profiles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Resume Version Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Maintain tailored resumes for different roles, companies, and technical tracks. Link versions directly to your internship applications.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="btn-primary bg-indigo-500 hover:bg-indigo-600 text-xs py-2.5 px-4 shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Resume</span>
        </button>
      </div>

      {/* Resumes Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : resumes.length === 0 ? (
        <div className="card-base p-12 text-center border border-slate-200 shadow-soft space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Resume Versions Saved</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Build your first ATS-friendly resume to begin applying to verified internship listings.
          </p>
          <button onClick={handleCreateNew} className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Create First Resume</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((r) => (
            <div
              key={r.id}
              className="card-base p-5 border border-slate-200/90 shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Status & Score */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    r.version_status === 'final'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : r.version_status === 'tailored'
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {r.version_status || 'Draft'}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <span className="text-[10px] font-semibold text-slate-400">ATS Score:</span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      r.quality_score >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {r.quality_score || 0}/100
                    </span>
                  </div>
                </div>

                {/* Title & Target Role */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {r.title}
                  </h3>
                  <div className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r.target_role || 'General Role'}</span>
                  </div>
                  {r.target_company && (
                    <div className="text-xs text-indigo-700 font-medium flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5" />
                      <span>Target: {r.target_company}</span>
                    </div>
                  )}
                </div>

                {/* Meta details */}
                <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span>Template:</span>
                    <span className="font-semibold text-slate-700 capitalize">
                      {(r.template_id || 'ats_minimal').replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Modified:</span>
                    <span>{new Date(r.updated_at || r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/student/resume-builder?id=${r.id}`)}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDownload(r)}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>PDF</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <button
                    onClick={() => openLink(r)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>Link to App</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDuplicate(r.id)}
                      className="text-slate-500 hover:text-slate-800"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openRename(r)}
                      className="text-slate-500 hover:text-slate-800 text-[11px]"
                      title="Rename"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(r.id, r.title)}
                      className="text-rose-500 hover:text-rose-700"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename Modal */}
      {renameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Rename Resume Version</h3>
            <form onSubmit={handleSaveRename} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-base text-xs py-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameModalOpen(false)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-1.5 px-4">
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link to Application Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Link Resume to Application</h3>
            </div>
            <p className="text-xs text-slate-500">
              Associate "{activeResume?.title}" with an internship listing you have applied to or tracked.
            </p>

            <form onSubmit={handleSaveLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Application</label>
                {applications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No active applications found. Track an internship first!</p>
                ) : (
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="input-base text-xs py-2"
                    required
                  >
                    <option value="">Select an application...</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.company_name} — {app.title} ({app.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applications.length === 0}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Confirm Association
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
