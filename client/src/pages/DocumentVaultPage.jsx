import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { careerApi } from '../api/careerApi.js';
import { applicationApi } from '../api/extraApis.js';
import {
  FolderLock,
  Plus,
  Trash2,
  Download,
  ExternalLink,
  FileText,
  Shield,
  Upload,
  Link2,
  Calendar,
  Lock,
  Building,
  CheckCircle2
} from 'lucide-react';

export function DocumentVaultPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [documents, setDocuments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New Document Form
  const [docType, setDocType] = useState('resume');
  const [name, setName] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [docsRes, appsRes] = await Promise.all([
        careerApi.getVaultDocuments(),
        applicationApi.getApplications()
      ]);
      if (docsRes.success) setDocuments(docsRes.documents || []);
      if (appsRes.success) setApplications(appsRes.applications || []);
    } catch (err) {
      console.error('Failed to load vault documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Document title is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await careerApi.createVaultDocument({
        name: name.trim(),
        documentType: docType,
        externalUrl: externalUrl.trim(),
        notes: notes.trim(),
        applicationId: applicationId ? parseInt(applicationId, 10) : null
      });

      if (res.success) {
        toast.success('Document securely saved to vault!');
        setModalOpen(false);
        setName('');
        setExternalUrl('');
        setNotes('');
        setApplicationId('');
        loadData();
      }
    } catch (err) {
      toast.error('Failed to vault document.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (docId, docName) => {
    if (!window.confirm(`Delete "${docName}" from your vault permanently?`)) return;
    try {
      const res = await careerApi.deleteVaultDocument(docId);
      if (res.success) {
        toast.success('Document removed from vault.');
        setDocuments(prev => prev.filter(d => d.id !== docId));
      }
    } catch (err) {
      toast.error('Failed to delete document.');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Encrypted Student Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Application Document Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Store and organize all application assets: tailored resume versions, cover letters, transcripts, portfolio links, and interview preparation notes.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary bg-indigo-500 hover:bg-indigo-600 text-xs py-2.5 px-4 shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Vault New Asset</span>
        </button>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : documents.length === 0 ? (
        <div className="card-base p-12 text-center border border-slate-200 shadow-soft space-y-3">
          <FolderLock className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Your Document Vault is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Safely store cover letters, recommendation letters, project links, and application drafts.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add First Document</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="card-base p-5 border border-slate-200/90 shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {doc.document_type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Private</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {doc.name}
                  </h4>
                  {doc.notes && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {doc.notes}
                    </p>
                  )}
                </div>

                {doc.internship_title && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-0.5">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Linked Application:</div>
                    <div className="font-semibold text-slate-900">{doc.internship_company} — {doc.internship_title}</div>
                    {doc.application_status && (
                      <span className="text-[11px] font-medium text-indigo-700 block">
                        Status: {doc.application_status}
                      </span>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Vaulted: {new Date(doc.created_at).toLocaleDateString()}</span>
                  {doc.file_size > 0 && (
                    <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {doc.file_url ? (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Asset</span>
                  </a>
                ) : (
                  <span className="text-slate-400 italic">No external link</span>
                )}

                <button
                  onClick={() => handleDelete(doc.id, doc.name)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove from vault"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Vault New Application Document</h3>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Type *</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="input-base text-xs py-2"
                  >
                    <option value="resume">Resume Version</option>
                    <option value="cover_letter">Cover Letter</option>
                    <option value="certificate">Certification / Transcript</option>
                    <option value="portfolio_link">Portfolio / Project Link</option>
                    <option value="interview_notes">Interview Notes</option>
                    <option value="other">Other Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Associate With Application</label>
                  <select
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    className="input-base text-xs py-2"
                  >
                    <option value="">None (General)</option>
                    {applications.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.company_name} — {a.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Razorpay Cover Letter — Final Draft"
                  className="input-base text-xs py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document / Drive / Cloud URL</label>
                <input
                  type="text"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://..."
                  className="input-base text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Private Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Tailored specifically with emphasis on distributed systems and microservices..."
                  className="input-base text-xs py-2 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
