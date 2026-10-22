import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { careerApi } from '../api/careerApi.js';
import { ResumeEditorForm } from '../components/resume/ResumeEditorForm.jsx';
import { ResumePreview } from '../components/resume/ResumePreview.jsx';
import { ResumeQualityWidget } from '../components/resume/ResumeQualityWidget.jsx';
import { generateResumePdf, printResumeElement } from '../utils/pdfGenerator.js';
import {
  FileText,
  Save,
  Download,
  Printer,
  Copy,
  Trash2,
  Sparkles,
  Layout,
  CheckCircle2,
  ChevronLeft,
  Eye,
  Edit3,
  Layers,
  Sliders,
  AlertCircle
} from 'lucide-react';

export function ResumeBuilderPage() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const resumeIdParam = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState('editor'); // 'editor' | 'preview'
  const [compactMode, setCompactMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('ats_minimal');

  const [jobDescription, setJobDescription] = useState('');
  const [qualityAudit, setQualityAudit] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);

  // Resume State
  const [resume, setResume] = useState({
    title: 'My ATS Resume',
    target_role: 'Software Developer',
    target_company: '',
    template_id: 'ats_minimal',
    version_status: 'draft',
    personal_info: {
      fullName: user?.name || 'Student Name',
      email: user?.email || '',
      phone: '',
      location: 'Bengaluru, India',
      linkedin: profile?.linkedin_url || '',
      github: profile?.github_url || '',
      portfolio: ''
    },
    summary: 'Motivated Computer Science undergraduate seeking summer engineering internship opportunities.',
    education: [
      {
        id: 'edu_1',
        institution: profile?.university || 'University Institute of Technology',
        degree: profile?.degree || 'Bachelor of Engineering',
        fieldOfStudy: 'Computer Science and Engineering',
        startDate: '2022',
        endDate: profile?.graduation_year ? String(profile.graduation_year) : '2026',
        gpa: '8.5 / 10.0',
        coursework: 'Data Structures, Database Management Systems, Computer Networks'
      }
    ],
    experience: [],
    projects: [
      {
        id: 'proj_1',
        title: 'Full Stack Web Platform',
        role: 'Lead Developer',
        techStack: 'React, Node.js, Express, MySQL',
        liveUrl: '',
        githubUrl: '',
        bullets: [
          'Engineered responsive web client with accessible form components and sub-30ms API responses.',
          'Integrated secure JWT authentication and role-based access control protecting 500+ records.'
        ]
      }
    ],
    skills: {
      languages: ['JavaScript', 'TypeScript', 'SQL', 'Python'],
      frameworks: ['React.js', 'Node.js', 'Express', 'Tailwind CSS'],
      tools: ['Git', 'Docker', 'MySQL', 'Postman'],
      softSkills: ['Problem Solving', 'Agile Collaboration', 'Technical Communication']
    },
    certifications: [],
    achievements: [],
    extracurriculars: []
  });

  // Load existing resume or latest
  useEffect(() => {
    let isMounted = true;
    async function loadResume() {
      setLoading(true);
      try {
        if (resumeIdParam) {
          const res = await careerApi.getResumeById(resumeIdParam);
          if (res.success && res.resume && isMounted) {
            setResume(res.resume);
            setSelectedTemplate(res.resume.template_id || 'ats_minimal');
          }
        } else {
          // Fetch student resumes list, load first or start fresh
          const res = await careerApi.getResumes();
          if (res.success && res.resumes && res.resumes.length > 0 && isMounted) {
            const first = res.resumes[0];
            setResume(first);
            setSelectedTemplate(first.template_id || 'ats_minimal');
            setSearchParams({ id: first.id }, { replace: true });
          }
        }
      } catch (err) {
        console.error('Failed to fetch resume:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadResume();
    return () => { isMounted = false; };
  }, [resumeIdParam]);

  // Live Audit Trigger (Debounced)
  const runLiveAudit = useCallback(async (currentResume, jd) => {
    setAuditLoading(true);
    try {
      const res = await careerApi.checkQuality({
        resume: currentResume,
        targetRole: currentResume.target_role,
        jobDescription: jd
      });
      if (res.success && res.audit) {
        setQualityAudit(res.audit);
      }
    } catch (err) {
      // ignore live audit failure
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      runLiveAudit(resume, jobDescription);
    }, 600);
    return () => clearTimeout(timer);
  }, [resume, jobDescription, runLiveAudit]);

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...resume,
        template_id: selectedTemplate,
        job_description: jobDescription
      };

      if (resume.id) {
        const res = await careerApi.updateResume(resume.id, payload);
        if (res.success) {
          setResume(res.resume);
          toast.success('Resume saved successfully!');
        }
      } else {
        const res = await careerApi.createResume(payload);
        if (res.success) {
          setResume(res.resume);
          setSearchParams({ id: res.resume.id }, { replace: true });
          toast.success('Resume created and saved!');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save resume.');
    } finally {
      setSaving(false);
    }
  };

  // Duplicate resume
  const handleDuplicate = async () => {
    if (!resume.id) return;
    try {
      const res = await careerApi.duplicateResume(resume.id);
      if (res.success && res.resume) {
        toast.success(`Duplicated as "${res.resume.title}"!`);
        navigate(`/student/resume-builder?id=${res.resume.id}`);
      }
    } catch (err) {
      toast.error('Failed to duplicate resume.');
    }
  };

  // Delete resume
  const handleDelete = async () => {
    if (!resume.id) return;
    if (!window.confirm(`Are you sure you want to delete "${resume.title}"? This action cannot be undone.`)) return;

    try {
      const res = await careerApi.deleteResume(resume.id);
      if (res.success) {
        toast.success('Resume deleted.');
        navigate('/student/resume-versions');
      }
    } catch (err) {
      toast.error('Failed to delete resume.');
    }
  };

  // Download Vector Selectable PDF
  const handleDownloadPdf = () => {
    try {
      generateResumePdf(resume, {
        compact: compactMode,
        filename: `${(resume.title || 'Resume').replace(/\s+/g, '_')}.pdf`
      });
      toast.success('Vector PDF generated and downloading!');
    } catch (err) {
      toast.error('PDF export failed: ' + err.message);
    }
  };

  // Apply suggestion from quality checker
  const handleApplySuggestion = (sugg) => {
    if (sugg.type === 'summary' && sugg.draftText) {
      setResume(prev => ({ ...prev, summary: sugg.draftText }));
      toast.success('Tailored summary applied! Remember to review.');
    } else if (sugg.type === 'reorder') {
      toast.info('Use the arrow buttons under Projects to move your top relevant project to the first position.');
    } else if (sugg.type === 'bullet' && sugg.draftText) {
      toast.info('Draft copied to clipboard. Paste into your project bullet to refine it.');
      navigator.clipboard?.writeText(sugg.draftText);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-12">
      {/* Top Action & Configuration Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Resume Title & Role */}
          <div className="flex items-center gap-3">
            <Link
              to="/student/resume-versions"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="All Saved Versions"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <div className="flex flex-col">
              <input
                type="text"
                value={resume.title || ''}
                onChange={(e) => setResume(prev => ({ ...prev, title: e.target.value }))}
                className="text-base font-bold text-slate-900 border-none bg-transparent hover:bg-slate-100/60 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-0.5 -ml-1 transition-colors"
                placeholder="Resume Title..."
              />
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="capitalize font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 text-[10px]">
                  {resume.version_status || 'Draft'}
                </span>
                <span>•</span>
                <span>Target: {resume.target_role || 'General'}</span>
              </div>
            </div>
          </div>

          {/* Controls: Template, Compact, Save, Download */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Template Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedTemplate('ats_minimal')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedTemplate === 'ats_minimal' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ATS Minimal
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('software_dev')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedTemplate === 'software_dev' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Software Dev
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('fresher')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedTemplate === 'fresher' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fresher
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('internship')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedTemplate === 'internship' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Internship
              </button>
            </div>

            {/* 1-Page Compact Fit Toggle */}
            <button
              type="button"
              onClick={() => setCompactMode(!compactMode)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                compactMode
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Adjust typography and margins to fit on one standard page"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>1-Page Fit</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            {/* PDF Export */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              title="Download vector ATS-friendly PDF"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>PDF</span>
            </button>

            {/* Print / Save */}
            <button
              type="button"
              onClick={() => printResumeElement()}
              className="btn-secondary text-xs py-1.5 px-2.5 text-slate-600 hover:text-slate-900"
              title="Print or Save via System Dialog"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Duplicate */}
            <button
              type="button"
              onClick={handleDuplicate}
              className="btn-secondary text-xs py-1.5 px-2.5 text-slate-600 hover:text-slate-900"
              title="Duplicate Resume Version"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={handleDelete}
              className="btn-secondary text-xs py-1.5 px-2.5 text-rose-600 hover:bg-rose-50 border-rose-200"
              title="Delete Resume"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Toggle */}
        <div className="flex md:hidden items-center border-t border-slate-100 pt-2 mt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTabMobile('editor')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 ${
              activeTabMobile === 'editor' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTabMobile('preview')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 ${
              activeTabMobile === 'preview' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview & Audit</span>
          </button>
        </div>
      </div>

      {/* Main Content: Split Pane on Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Editor */}
          <div className={`lg:col-span-6 space-y-6 ${activeTabMobile === 'editor' ? 'block' : 'hidden lg:block'}`}>
            <ResumeEditorForm
              resume={resume}
              onChange={setResume}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              onCheckQuality={() => runLiveAudit(resume, jobDescription)}
            />
          </div>

          {/* Right Column: Live Preview & Quality Score Widget */}
          <div className={`lg:col-span-6 space-y-6 ${activeTabMobile === 'preview' ? 'block' : 'hidden lg:block'}`}>
            {/* Live ATS Quality Score Widget */}
            <ResumeQualityWidget
              audit={qualityAudit}
              loading={auditLoading}
              onApplySuggestion={handleApplySuggestion}
            />

            {/* Resume Preview Document */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  Live Preview ({selectedTemplate.replace('_', ' ').toUpperCase()})
                </span>
                <span>Selectable text • High ATS readability</span>
              </div>

              <div className="bg-slate-200/70 p-4 sm:p-6 rounded-2xl overflow-auto border border-slate-300/80 shadow-inner max-h-[820px]">
                <ResumePreview
                  resume={resume}
                  templateId={selectedTemplate}
                  compactMode={compactMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
