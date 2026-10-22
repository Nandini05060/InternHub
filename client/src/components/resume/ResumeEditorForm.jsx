import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Code2,
  Award,
  Trophy,
  Users2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function ResumeEditorForm({
  resume,
  onChange,
  onCheckQuality,
  jobDescription,
  setJobDescription
}) {
  const [activeSection, setActiveSection] = useState('contact');

  const updatePersonalInfo = (field, value) => {
    onChange({
      ...resume,
      personal_info: {
        ...(resume.personal_info || {}),
        [field]: value
      }
    });
  };

  const updateField = (field, value) => {
    onChange({
      ...resume,
      [field]: value
    });
  };

  // Education Helpers
  const addEducation = () => {
    const list = Array.isArray(resume.education) ? [...resume.education] : [];
    list.push({
      id: `edu_${Date.now()}`,
      institution: '',
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science',
      startDate: '2022',
      endDate: '2026',
      gpa: '',
      coursework: ''
    });
    updateField('education', list);
  };

  const updateEducationItem = (idx, field, val) => {
    const list = [...(resume.education || [])];
    list[idx] = { ...list[idx], [field]: val };
    updateField('education', list);
  };

  const removeEducation = (idx) => {
    const list = [...(resume.education || [])];
    list.splice(idx, 1);
    updateField('education', list);
  };

  // Projects Helpers
  const addProject = () => {
    const list = Array.isArray(resume.projects) ? [...resume.projects] : [];
    list.push({
      id: `proj_${Date.now()}`,
      title: '',
      role: 'Developer',
      techStack: '',
      liveUrl: '',
      githubUrl: '',
      bullets: ['']
    });
    updateField('projects', list);
  };

  const updateProjectItem = (idx, field, val) => {
    const list = [...(resume.projects || [])];
    list[idx] = { ...list[idx], [field]: val };
    updateField('projects', list);
  };

  const updateProjectBullet = (projIdx, bulletIdx, val) => {
    const list = [...(resume.projects || [])];
    const bullets = [...(list[projIdx].bullets || [])];
    bullets[bulletIdx] = val;
    list[projIdx].bullets = bullets;
    updateField('projects', list);
  };

  const addProjectBullet = (projIdx) => {
    const list = [...(resume.projects || [])];
    const bullets = [...(list[projIdx].bullets || [])];
    bullets.push('');
    list[projIdx].bullets = bullets;
    updateField('projects', list);
  };

  const removeProjectBullet = (projIdx, bulletIdx) => {
    const list = [...(resume.projects || [])];
    const bullets = [...(list[projIdx].bullets || [])];
    bullets.splice(bulletIdx, 1);
    list[projIdx].bullets = bullets;
    updateField('projects', list);
  };

  const removeProject = (idx) => {
    const list = [...(resume.projects || [])];
    list.splice(idx, 1);
    updateField('projects', list);
  };

  const moveProject = (idx, direction) => {
    const list = [...(resume.projects || [])];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    updateField('projects', list);
  };

  // Experience Helpers
  const addExperience = () => {
    const list = Array.isArray(resume.experience) ? [...resume.experience] : [];
    list.push({
      id: `exp_${Date.now()}`,
      company: '',
      role: 'Intern',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      bullets: ['']
    });
    updateField('experience', list);
  };

  const updateExperienceItem = (idx, field, val) => {
    const list = [...(resume.experience || [])];
    list[idx] = { ...list[idx], [field]: val };
    updateField('experience', list);
  };

  const updateExperienceBullet = (expIdx, bulletIdx, val) => {
    const list = [...(resume.experience || [])];
    const bullets = [...(list[expIdx].bullets || [])];
    bullets[bulletIdx] = val;
    list[expIdx].bullets = bullets;
    updateField('experience', list);
  };

  const addExperienceBullet = (expIdx) => {
    const list = [...(resume.experience || [])];
    const bullets = [...(list[expIdx].bullets || [])];
    bullets.push('');
    list[expIdx].bullets = bullets;
    updateField('experience', list);
  };

  const removeExperienceBullet = (expIdx, bulletIdx) => {
    const list = [...(resume.experience || [])];
    const bullets = [...(list[expIdx].bullets || [])];
    bullets.splice(bulletIdx, 1);
    list[expIdx].bullets = bullets;
    updateField('experience', list);
  };

  const removeExperience = (idx) => {
    const list = [...(resume.experience || [])];
    list.splice(idx, 1);
    updateField('experience', list);
  };

  // Skills Helpers
  const updateSkillsCategory = (cat, val) => {
    const skills = typeof resume.skills === 'object' && !Array.isArray(resume.skills) ? { ...resume.skills } : {};
    skills[cat] = typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val;
    updateField('skills', skills);
  };

  // Certifications Helpers
  const addCertification = () => {
    const list = Array.isArray(resume.certifications) ? [...resume.certifications] : [];
    list.push({ id: `cert_${Date.now()}`, name: '', issuer: '', issueDate: '', url: '' });
    updateField('certifications', list);
  };

  const updateCertItem = (idx, field, val) => {
    const list = [...(resume.certifications || [])];
    list[idx] = { ...list[idx], [field]: val };
    updateField('certifications', list);
  };

  const removeCert = (idx) => {
    const list = [...(resume.certifications || [])];
    list.splice(idx, 1);
    updateField('certifications', list);
  };

  // Achievements Helpers
  const addAchievement = () => {
    const list = Array.isArray(resume.achievements) ? [...resume.achievements] : [];
    list.push({ id: `ach_${Date.now()}`, title: '', description: '', date: '' });
    updateField('achievements', list);
  };

  const updateAchievementItem = (idx, field, val) => {
    const list = [...(resume.achievements || [])];
    list[idx] = { ...list[idx], [field]: val };
    updateField('achievements', list);
  };

  const removeAchievement = (idx) => {
    const list = [...(resume.achievements || [])];
    list.splice(idx, 1);
    updateField('achievements', list);
  };

  const pInfo = resume.personal_info || {};
  const currentSkills = typeof resume.skills === 'object' && !Array.isArray(resume.skills) ? resume.skills : {};

  return (
    <div className="space-y-6">
      {/* Target Role & Job Tailoring Module */}
      <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Job-Specific Tailoring</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
            Keyword Match
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
            <input
              type="text"
              value={resume.target_role || ''}
              onChange={(e) => updateField('target_role', e.target.value)}
              placeholder="e.g. Full Stack Developer, SDE Intern"
              className="input-base text-xs py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Company (Optional)</label>
            <input
              type="text"
              value={resume.target_company || ''}
              onChange={(e) => updateField('target_company', e.target.value)}
              placeholder="e.g. Razorpay, Swiggy, Google"
              className="input-base text-xs py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span>Job Description / Key Requirements</span>
            <span className="text-[10px] text-slate-400 font-normal">Paste JD for instant keyword coverage audit</span>
          </label>
          <textarea
            rows={3}
            value={jobDescription || ''}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job description to match required skills, detect missing keywords, and get tailoring suggestions..."
            className="input-base text-xs py-2 leading-relaxed"
          />
        </div>
      </div>

      {/* Accordion / Section Navigation */}
      <div className="space-y-4">
        {/* 1. Contact Information */}
        <div className="card-base border border-slate-200 p-4">
          <button
            type="button"
            onClick={() => setActiveSection(activeSection === 'contact' ? '' : 'contact')}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Personal & Contact Details</h4>
                <p className="text-[11px] text-slate-500">Name, email, phone, location, and profiles</p>
              </div>
            </div>
            {activeSection === 'contact' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {activeSection === 'contact' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
              <div>
                <label htmlFor="fullNameInput" className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  id="fullNameInput"
                  type="text"
                  value={pInfo.fullName || ''}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  placeholder="e.g. Alex Sharma"
                  className="input-base text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Email *</label>
                <input
                  type="email"
                  value={pInfo.email || ''}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  placeholder="e.g. alex.sharma@example.com"
                  className="input-base text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={pInfo.phone || ''}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="input-base text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City, Location *</label>
                <input
                  type="text"
                  value={pInfo.location || ''}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  placeholder="e.g. Bengaluru, Karnataka, India"
                  className="input-base text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={pInfo.linkedin || ''}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="input-base text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Profile URL</label>
                <input
                  type="text"
                  value={pInfo.github || ''}
                  onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  placeholder="https://github.com/username"
                  className="input-base text-xs py-2"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio / Personal Website</label>
                <input
                  type="text"
                  value={pInfo.portfolio || ''}
                  onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="input-base text-xs py-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Professional Summary */}
        <div className="card-base border border-slate-200 p-4">
          <button
            type="button"
            onClick={() => setActiveSection(activeSection === 'summary' ? '' : 'summary')}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Professional Summary</h4>
                <p className="text-[11px] text-slate-500">2-3 concise lines describing your technical strengths</p>
              </div>
            </div>
            {activeSection === 'summary' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {activeSection === 'summary' && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <textarea
                rows={3}
                value={resume.summary || ''}
                onChange={(e) => updateField('summary', e.target.value)}
                placeholder="Results-driven Computer Science undergraduate proficient in React, Node.js, and SQL. Seeking Summer 2026 Software Engineering Internship..."
                className="input-base text-xs py-2 leading-relaxed"
              />
              <p className="text-[11px] text-slate-500">
                Tip: Keep summary between 35–80 words. Highlight verified technologies and target role directly.
              </p>
            </div>
          )}
        </div>

        {/* 3. Education */}
        <div className="card-base border border-slate-200 p-4">
          <button
            type="button"
            onClick={() => setActiveSection(activeSection === 'education' ? '' : 'education')}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Education & CGPA ({resume.education?.length || 0})</h4>
                <p className="text-[11px] text-slate-500">University, degree, graduation year, and coursework</p>
              </div>
            </div>
            {activeSection === 'education' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {activeSection === 'education' && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-4">
              {(resume.education || []).map((edu, idx) => (
                <div key={edu.id || idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Degree Entry #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Remove Degree"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Institution / College *</label>
                      <input
                        type="text"
                        value={edu.institution || ''}
                        onChange={(e) => updateEducationItem(idx, 'institution', e.target.value)}
                        placeholder="e.g. University Institute of Technology"
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Degree & Major *</label>
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => updateEducationItem(idx, 'degree', e.target.value)}
                        placeholder="e.g. B.Tech Computer Science"
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Graduation Year / Period</label>
                      <input
                        type="text"
                        value={edu.endDate || ''}
                        onChange={(e) => updateEducationItem(idx, 'endDate', e.target.value)}
                        placeholder="e.g. 2026 or May 2026"
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">CGPA / Percentage</label>
                      <input
                        type="text"
                        value={edu.gpa || ''}
                        onChange={(e) => updateEducationItem(idx, 'gpa', e.target.value)}
                        placeholder="e.g. 8.85 / 10.0 or 85%"
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Relevant Coursework</label>
                      <input
                        type="text"
                        value={edu.coursework || ''}
                        onChange={(e) => updateEducationItem(idx, 'coursework', e.target.value)}
                        placeholder="e.g. Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks"
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addEducation}
                className="btn-secondary text-xs py-2 w-full flex items-center justify-center gap-1.5 border-dashed"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education Entry</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Skills */}
        <div className="card-base border border-slate-200 p-4">
          <button
            type="button"
            onClick={() => setActiveSection(activeSection === 'skills' ? '' : 'skills')}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Technical & Soft Skills</h4>
                <p className="text-[11px] text-slate-500">Categorized by languages, frameworks, developer tools, soft skills</p>
              </div>
            </div>
            {activeSection === 'skills' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {activeSection === 'skills' && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Programming Languages (comma separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(currentSkills.languages) ? currentSkills.languages.join(', ') : currentSkills.languages || ''}
                  onChange={(e) => updateSkillsCategory('languages', e.target.value)}
                  placeholder="e.g. JavaScript, TypeScript, Python, C++, SQL"
                  className="input-base text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Frameworks & Libraries (comma separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(currentSkills.frameworks) ? currentSkills.frameworks.join(', ') : currentSkills.frameworks || ''}
                  onChange={(e) => updateSkillsCategory('frameworks', e.target.value)}
                  placeholder="e.g. React.js, Node.js, Express, Next.js, Tailwind CSS"
                  className="input-base text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Developer Tools & Databases (comma separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(currentSkills.tools) ? currentSkills.tools.join(', ') : currentSkills.tools || ''}
                  onChange={(e) => updateSkillsCategory('tools', e.target.value)}
                  placeholder="e.g. Git, Docker, MySQL, Redis, AWS, Postman"
                  className="input-base text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Core Fundamentals & Soft Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(currentSkills.softSkills) ? currentSkills.softSkills.join(', ') : currentSkills.softSkills || ''}
                  onChange={(e) => updateSkillsCategory('softSkills', e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms, System Design, Agile, Team Collaboration"
                  className="input-base text-xs py-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. Projects */}
        <div className="card-base border border-slate-200 p-4">
          <button
            type="button"
            onClick={() => setActiveSection(activeSection === 'projects' ? '' : 'projects')}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Projects ({resume.projects?.length || 0})</h4>
                <p className="text-[11px] text-slate-500">Technical projects, stack, links, and impact bullets</p>
              </div>
            </div>
            {activeSection === 'projects' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {activeSection === 'projects' && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-4">
              {(resume.projects || []).map((proj, idx) => (
                <div key={proj.id || idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Project #{idx + 1}: {proj.title || 'Untitled'}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveProject(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveProject(idx, 1)}
                        disabled={idx === (resume.projects.length - 1)}
                        className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProject(idx)}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 transition-colors ml-1"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Project Title *</label>
                      <input
                        type="text"
                        value={proj.title || ''}
                        onChange={(e) => updateProjectItem(idx, 'title', e.target.value)}
                        placeholder="e.g. CloudTask Distributed Queue"
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Role / Contribution</label>
                      <input
                        type="text"
                        value={proj.role || ''}
                        onChange={(e) => updateProjectItem(idx, 'role', e.target.value)}
                        placeholder="e.g. Lead Developer, Frontend Author"
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Technologies Used *</label>
                      <input
                        type="text"
                        value={proj.techStack || ''}
                        onChange={(e) => updateProjectItem(idx, 'techStack', e.target.value)}
                        placeholder="e.g. Node.js, Redis, Docker, React, Tailwind CSS"
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">GitHub Repository Link</label>
                      <input
                        type="text"
                        value={proj.githubUrl || ''}
                        onChange={(e) => updateProjectItem(idx, 'githubUrl', e.target.value)}
                        placeholder="https://github.com/..."
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Live Demo Link</label>
                      <input
                        type="text"
                        value={proj.liveUrl || ''}
                        onChange={(e) => updateProjectItem(idx, 'liveUrl', e.target.value)}
                        placeholder="https://app.example.com"
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                  </div>

                  {/* Bullet points */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Impact Bullet Points (Use Action Verbs & XYZ formula)
                    </label>
                    {(proj.bullets || []).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => updateProjectBullet(idx, bIdx, e.target.value)}
                          placeholder="e.g. Engineered distributed message queue handling 5,000 jobs/sec with at-least-once delivery."
                          className="input-base text-xs py-1.5 flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeProjectBullet(idx, bIdx)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 mt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addProjectBullet(idx)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Bullet Point</span>
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addProject}
                className="btn-secondary text-xs py-2 w-full flex items-center justify-center gap-1.5 border-dashed"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project Entry</span>
              </button>
            </div>
          )}
        </div>

        {/* 6. Work Experience / Internships */}
        <div className="card-base border border-slate-200 p-4">
          <button
            type="button"
            onClick={() => setActiveSection(activeSection === 'experience' ? '' : 'experience')}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Work Experience / Internships ({resume.experience?.length || 0})</h4>
                <p className="text-[11px] text-slate-500">Industry internships, trainee experience, and freelance roles</p>
              </div>
            </div>
            {activeSection === 'experience' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {activeSection === 'experience' && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-4">
              {(resume.experience || []).map((exp, idx) => (
                <div key={exp.id || idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Experience #{idx + 1}: {exp.role || 'Role'}</span>
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Delete Experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company / Organization *</label>
                      <input
                        type="text"
                        value={exp.company || ''}
                        onChange={(e) => updateExperienceItem(idx, 'company', e.target.value)}
                        placeholder="e.g. ZetaTech Labs"
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Job Role / Title *</label>
                      <input
                        type="text"
                        value={exp.role || ''}
                        onChange={(e) => updateExperienceItem(idx, 'role', e.target.value)}
                        placeholder="e.g. Software Engineering Intern"
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate || ''}
                        onChange={(e) => updateExperienceItem(idx, 'startDate', e.target.value)}
                        placeholder="e.g. Jun 2024"
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">End Date</label>
                      <input
                        type="text"
                        value={exp.endDate || ''}
                        onChange={(e) => updateExperienceItem(idx, 'endDate', e.target.value)}
                        placeholder="e.g. Aug 2024 or Present"
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                  </div>

                  {/* Bullet points */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Responsibilities & Quantified Outcomes
                    </label>
                    {(exp.bullets || []).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => updateExperienceBullet(idx, bIdx, e.target.value)}
                          placeholder="e.g. Architected REST APIs using Node.js & Express, decreasing median endpoint latency by 32%."
                          className="input-base text-xs py-1.5 flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeExperienceBullet(idx, bIdx)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 mt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addExperienceBullet(idx)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Experience Bullet</span>
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addExperience}
                className="btn-secondary text-xs py-2 w-full flex items-center justify-center gap-1.5 border-dashed"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Experience Entry</span>
              </button>
            </div>
          )}
        </div>

        {/* 7. Certifications & Achievements */}
        <div className="card-base border border-slate-200 p-4">
          <button
            type="button"
            onClick={() => setActiveSection(activeSection === 'certs' ? '' : 'certs')}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Certifications & Achievements ({resume.certifications?.length || 0})
                </h4>
                <p className="text-[11px] text-slate-500">Credly links, competitive programming, and hackathon wins</p>
              </div>
            </div>
            {activeSection === 'certs' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {activeSection === 'certs' && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-4">
              <h5 className="text-xs font-bold text-slate-800">Certifications</h5>
              {(resume.certifications || []).map((c, idx) => (
                <div key={c.id || idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    value={c.name || ''}
                    onChange={(e) => updateCertItem(idx, 'name', e.target.value)}
                    placeholder="Cert Name (e.g. AWS Cloud Practitioner)"
                    className="input-base text-xs py-1"
                  />
                  <input
                    type="text"
                    value={c.issuer || ''}
                    onChange={(e) => updateCertItem(idx, 'issuer', e.target.value)}
                    placeholder="Issuer (e.g. Amazon Web Services)"
                    className="input-base text-xs py-1"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={c.issueDate || ''}
                      onChange={(e) => updateCertItem(idx, 'issueDate', e.target.value)}
                      placeholder="Year (e.g. 2024)"
                      className="input-base text-xs py-1 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeCert(idx)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addCertification}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Certification</span>
              </button>

              <h5 className="text-xs font-bold text-slate-800 pt-3 border-t border-slate-200">Achievements</h5>
              {(resume.achievements || []).map((a, idx) => (
                <div key={a.id || idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    value={a.title || ''}
                    onChange={(e) => updateAchievementItem(idx, 'title', e.target.value)}
                    placeholder="e.g. 1st Place National Hackathon"
                    className="input-base text-xs py-1"
                  />
                  <input
                    type="text"
                    value={a.description || ''}
                    onChange={(e) => updateAchievementItem(idx, 'description', e.target.value)}
                    placeholder="Brief description / outcome"
                    className="input-base text-xs py-1"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={a.date || ''}
                      onChange={(e) => updateAchievementItem(idx, 'date', e.target.value)}
                      placeholder="e.g. Feb 2024"
                      className="input-base text-xs py-1 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeAchievement(idx)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addAchievement}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Achievement</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
