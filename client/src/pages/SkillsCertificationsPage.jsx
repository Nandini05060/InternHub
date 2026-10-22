import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { careerApi } from '../api/careerApi.js';
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Link2,
  GraduationCap
} from 'lucide-react';

export function SkillsCertificationsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [newCert, setNewCert] = useState({
    title: '',
    provider: 'Coursera',
    skill_name: '',
    skill_level: 'Intermediate',
    status: 'In Progress',
    target_date: '',
    completed_date: '',
    credential_url: ''
  });

  // Curated Free Resources catalog (Never fabricated)
  const FREE_RESOURCES = [
    {
      category: 'Full Stack & Web Dev',
      title: 'The Odin Project',
      provider: 'Open Source Community',
      type: 'Hands-on Curriculum',
      url: 'https://www.theodinproject.com',
      topics: 'JavaScript, React, Node.js, Git, HTML/CSS'
    },
    {
      category: 'CS Fundamentals & DSA',
      title: 'CS50x: Introduction to Computer Science',
      provider: 'Harvard University / edX',
      type: 'Free University Course',
      url: 'https://cs50.harvard.edu/x',
      topics: 'Algorithms, Data Structures, Memory, C, Python, SQL'
    },
    {
      category: 'DSA & Coding Practice',
      title: 'NeetCode 150 & Algorithms Roadmap',
      provider: 'NeetCode',
      type: 'Interactive Problem Solving',
      url: 'https://neetcode.io',
      topics: 'Arrays, Two Pointers, Trees, Graphs, Dynamic Programming'
    },
    {
      category: 'Web Standards & Frontend',
      title: 'MDN Web Docs Front-End Curriculum',
      provider: 'Mozilla Developer Network',
      type: 'Official Documentation & Guides',
      url: 'https://developer.mozilla.org',
      topics: 'Modern JavaScript (ES6+), Accessibility (WCAG), CSS Grid'
    },
    {
      category: 'Cloud & Infrastructure',
      title: 'AWS Cloud Quest & Skill Builder',
      provider: 'Amazon Web Services',
      type: 'Free Hands-on Cloud Labs',
      url: 'https://aws.amazon.com/training/digital',
      topics: 'EC2, S3, IAM, Serverless Lambda, Cloud Architecture'
    }
  ];

  const loadCertifications = async () => {
    try {
      const res = await careerApi.getCertifications();
      if (res.success) {
        setCertifications(res.certifications || []);
      }
    } catch (err) {
      console.error('Failed to load certifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertifications();
  }, []);

  const handleCreateCert = async (e) => {
    e.preventDefault();
    if (!newCert.title.trim()) return;

    try {
      const res = await careerApi.createCertification(newCert);
      if (res.success) {
        toast.success('Skill certification goal added!');
        setModalOpen(false);
        setNewCert({
          title: '',
          provider: 'Coursera',
          skill_name: '',
          skill_level: 'Intermediate',
          status: 'In Progress',
          target_date: '',
          completed_date: '',
          credential_url: ''
        });
        loadCertifications();
      }
    } catch (err) {
      toast.error('Failed to add certification.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const updates = {
        status,
        ...(status === 'Completed' ? { completed_date: new Date().toISOString().slice(0, 10) } : {})
      };
      const res = await careerApi.updateCertification(id, updates);
      if (res.success) {
        toast.success(`Status updated to "${status}".`);
        loadCertifications();
      }
    } catch (err) {
      toast.error('Failed to update certification.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await careerApi.deleteCertification(id);
      if (res.success) {
        toast.success('Certification removed.');
        setCertifications(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      toast.error('Failed to remove certification.');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Award className="w-3.5 h-3.5" />
            <span>Lifelong Skills & Learning Goals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Skills & Certifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Record your verified credentials, track ongoing technical courses, and explore curated free learning resources.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary bg-indigo-500 hover:bg-indigo-600 text-xs py-2.5 px-4 shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course / Certification</span>
        </button>
      </div>

      {/* Student Certifications List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Your Tracked Certifications ({certifications.length})
          </h3>
          <span className="text-xs text-slate-500">
            {certifications.filter(c => c.status === 'Completed').length} Completed • {certifications.filter(c => c.status === 'In Progress').length} In Progress
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : certifications.length === 0 ? (
          <div className="card-base p-10 text-center border border-slate-200 shadow-soft space-y-3">
            <Award className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No Certifications Recorded</h4>
            <p className="text-xs text-slate-500">
              Record courses you have completed or are currently taking to strengthen your profile.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((c) => (
              <div
                key={c.id}
                className="card-base p-5 border border-slate-200/90 shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      c.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : c.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {c.status}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-500">
                      {c.skill_level}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {c.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {c.provider || 'Independent Provider'}
                    </p>
                  </div>

                  {c.skill_name && (
                    <div className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {c.skill_name}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-100">
                    {c.target_date && c.status !== 'Completed' && (
                      <div>Target Date: {new Date(c.target_date).toLocaleDateString()}</div>
                    )}
                    {c.completed_date && (
                      <div className="text-emerald-700 font-medium">
                        Completed: {new Date(c.completed_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {c.credential_url ? (
                    <a
                      href={c.credential_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Verify Credential</span>
                    </a>
                  ) : (
                    <select
                      value={c.status}
                      onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                      className="input-base text-[11px] py-1 px-2 w-auto"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Mark Completed</option>
                    </select>
                  )}

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Free Resources Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Curated Free Learning Resources
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Industry-standard free curricula and problem sets. (These are recommended resources, separate from your verified certifications above.)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FREE_RESOURCES.map((res, idx) => (
            <div
              key={idx}
              className="card-base p-5 border border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-white shadow-soft flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {res.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{res.type}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{res.title}</h4>
                <p className="text-xs text-slate-600 font-medium">{res.provider}</p>
                <p className="text-[11px] text-slate-500 italic">Topics: {res.topics}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                >
                  <span>Explore Free Curriculum</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Course or Certification</h3>

            <form onSubmit={handleCreateCert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Credential Name *</label>
                <input
                  type="text"
                  value={newCert.title}
                  onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                  placeholder="e.g. AWS Certified Cloud Practitioner"
                  className="input-base text-xs py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Provider / Platform</label>
                  <input
                    type="text"
                    value={newCert.provider}
                    onChange={(e) => setNewCert({ ...newCert, provider: e.target.value })}
                    placeholder="e.g. Coursera, Udemy, NPTEL, AWS"
                    className="input-base text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Skill Area</label>
                  <input
                    type="text"
                    value={newCert.skill_name}
                    onChange={(e) => setNewCert({ ...newCert, skill_name: e.target.value })}
                    placeholder="e.g. React.js, Cloud Computing"
                    className="input-base text-xs py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={newCert.status}
                    onChange={(e) => setNewCert({ ...newCert, status: e.target.value })}
                    className="input-base text-xs py-2"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Not Started">Not Started</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Proficiency Level</label>
                  <select
                    value={newCert.skill_level}
                    onChange={(e) => setNewCert({ ...newCert, skill_level: e.target.value })}
                    className="input-base text-xs py-2"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Credential URL (if completed)</label>
                <input
                  type="text"
                  value={newCert.credential_url}
                  onChange={(e) => setNewCert({ ...newCert, credential_url: e.target.value })}
                  placeholder="https://coursera.org/verify/..."
                  className="input-base text-xs py-2"
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
                <button type="submit" className="btn-primary text-xs py-2 px-4">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
