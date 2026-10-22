import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  User,
  GraduationCap,
  Code,
  FileText,
  Github,
  Linkedin,
  Save,
  CheckCircle2,
  AlertTriangle,
  Upload,
  MapPin,
  Briefcase
} from 'lucide-react';

export function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    university: '',
    degree: '',
    graduation_year: 2026,
    year_of_study: '3rd Year',
    preferred_location: 'Bengaluru / Remote',
    work_mode: 'remote',
    skills: '',
    resume_url: '',
    github_url: '',
    linkedin_url: '',
    bio: ''
  });

  const [saving, setSaving] = useState(false);
  const [uploadedResumeName, setUploadedResumeName] = useState('');

  useEffect(() => {
    if (user || profile) {
      setFormData({
        name: user?.name || '',
        university: profile?.university || '',
        degree: profile?.degree || '',
        graduation_year: profile?.graduation_year || 2026,
        year_of_study: profile?.year_of_study || '3rd Year',
        preferred_location: profile?.preferred_location || 'Bengaluru',
        work_mode: profile?.work_mode || 'hybrid',
        skills: profile?.skills || '',
        resume_url: profile?.resume_url || '',
        github_url: profile?.github_url || '',
        linkedin_url: profile?.linkedin_url || '',
        bio: profile?.bio || ''
      });
      if (profile?.resume_url) {
        setUploadedResumeName('Attached_Resume.pdf');
      }
    }
  }, [user, profile]);

  // Calculate profile completion percentage
  const calculateCompleteness = () => {
    const fields = [
      Boolean(formData.name?.trim()),
      Boolean(formData.university?.trim()),
      Boolean(formData.degree?.trim()),
      Boolean(formData.graduation_year),
      Boolean(formData.skills?.trim()),
      Boolean(formData.preferred_location?.trim()),
      Boolean(formData.resume_url?.trim() || uploadedResumeName),
      Boolean(formData.bio?.trim())
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completeness = calculateCompleteness();
  const isEligibleToApply =
    Boolean(formData.university?.trim()) &&
    Boolean(formData.degree?.trim()) &&
    Boolean(formData.graduation_year) &&
    Boolean(formData.skills?.trim());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, DOCX)
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
      toast.error('Invalid file type. Please upload a PDF resume document.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit. Please upload an optimized PDF.');
      return;
    }

    setUploadedResumeName(file.name);
    // Simulate safe local data URL or link
    setFormData(prev => ({
      ...prev,
      resume_url: `https://internhub.college.edu/resumes/${encodeURIComponent(file.name)}`
    }));
    toast.success(`Resume "${file.name}" attached successfully!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Student profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const skillList = formData.skills
    ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 bg-[#FAF8F5]">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Profile & Academic Credentials
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Keep your university, branch, skills, and resume updated to unlock verified applications.
          </p>
        </div>
      </div>

      {/* Profile Completeness Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Profile Completeness
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              completeness === 100
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}>
              {completeness}%
            </span>
          </div>

          {isEligibleToApply ? (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Application Ready
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Incomplete (Required to apply)
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              completeness === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${completeness}%` }}
          />
        </div>

        {!isEligibleToApply && (
          <p className="mt-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/70">
            <strong>Mandatory backend requirement:</strong> Please fill your college/university, degree/branch, graduation year, and technical skills before applying to verified internships.
          </p>
        )}
      </div>

      {/* Main Profile Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-base text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="input-base text-xs bg-slate-100 cursor-not-allowed opacity-80"
                />
              </div>
            </div>
          </div>

          {/* Section 2: College & Academic Background */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-600" /> Academic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  College / University *
                </label>
                <input
                  type="text"
                  name="university"
                  required
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="e.g. National Institute of Technology"
                  className="input-base text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Branch / Degree *
                </label>
                <input
                  type="text"
                  name="degree"
                  required
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech in Computer Science and Engineering"
                  className="input-base text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Graduation Year *
                </label>
                <select
                  name="graduation_year"
                  value={formData.graduation_year}
                  onChange={handleChange}
                  className="input-base text-xs"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Year of Study
                </label>
                <select
                  name="year_of_study"
                  value={formData.year_of_study}
                  onChange={handleChange}
                  className="input-base text-xs"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="Final Year">Final Year</option>
                  <option value="Graduate">Recent Graduate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Technical Skills & Preferences */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-indigo-600" /> Technical Skills & Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Technical Skills (Comma Separated) *
                </label>
                <input
                  type="text"
                  name="skills"
                  required
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, Express, MySQL, Python, Tailwind CSS, Git"
                  className="input-base text-xs"
                />
                {skillList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {skillList.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Preferred Location
                  </label>
                  <input
                    type="text"
                    name="preferred_location"
                    value={formData.preferred_location}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru, Remote, Pune"
                    className="input-base text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    Preferred Work Mode
                  </label>
                  <select
                    name="work_mode"
                    value={formData.work_mode}
                    onChange={handleChange}
                    className="input-base text-xs"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on-site">On-site</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Resume & Links */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" /> Resume & External Links
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Upload Student Resume (PDF, max 5MB)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-300 hover:bg-slate-200 transition-colors text-xs font-semibold text-slate-700 shadow-2xs">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>Choose PDF Resume</span>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleResumeFileSelect}
                      className="hidden"
                    />
                  </label>
                  {uploadedResumeName && (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {uploadedResumeName}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Or Direct Resume Link (Google Drive / GitHub / Portfolio)
                </label>
                <input
                  type="url"
                  name="resume_url"
                  value={formData.resume_url}
                  onChange={handleChange}
                  placeholder="https://example.com/my-resume.pdf"
                  className="input-base text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Github className="w-3.5 h-3.5 text-slate-600" /> GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className="input-base text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="input-base text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Professional Bio & Career Objective
                </label>
                <textarea
                  rows={3}
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Summarize your engineering focus, key university projects, and target internship roles..."
                  className="input-base text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-2.5 text-xs font-semibold shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
