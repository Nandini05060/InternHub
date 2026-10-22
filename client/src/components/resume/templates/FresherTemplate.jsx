import React from 'react';

export function FresherTemplate({ resume, compactMode = false }) {
  const info = resume.personal_info || {};
  const education = Array.isArray(resume.education) ? resume.education : [];
  const experience = Array.isArray(resume.experience) ? resume.experience : [];
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const skillsObj = resume.skills || {};
  const certs = Array.isArray(resume.certifications) ? resume.certifications : [];
  const achievements = Array.isArray(resume.achievements) ? resume.achievements : [];
  const extracurriculars = Array.isArray(resume.extracurriculars) ? resume.extracurriculars : [];

  return (
    <div
      className={`bg-white text-slate-900 font-sans leading-normal ${
        compactMode ? 'p-6 text-xs' : 'p-8 text-sm'
      }`}
      style={{ minHeight: '100%', boxSizing: 'border-box' }}
    >
      {/* Header */}
      <div className="text-center pb-3 border-b-2 border-slate-800 mb-4">
        <h1 className={`${compactMode ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight text-slate-900`}>
          {info.fullName || 'Candidate Name'}
        </h1>
        <p className="text-xs text-slate-600 font-medium mt-1">
          {resume.target_role || 'Fresher / Entry-Level Graduate'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
          {info.email && <span>{info.email}</span>}
          {info.phone && <span>• {info.phone}</span>}
          {info.location && <span>• {info.location}</span>}
          {info.linkedin && <span>• {info.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
          {info.github && <span>• {info.github.replace(/^https?:\/\/(www\.)?/, '')}</span>}
        </div>
      </div>

      {/* Career Objective / Summary */}
      {resume.summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Career Objective
          </h2>
          <p className="text-slate-700 leading-relaxed text-justify">
            {resume.summary}
          </p>
        </section>
      )}

      {/* Education — Top Priority for Freshers */}
      {education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Academic Background
          </h2>
          <div className="space-y-2.5">
            {education.map((edu, idx) => (
              <div key={edu.id || idx}>
                <div className="flex items-baseline justify-between font-bold text-slate-900">
                  <span>{edu.institution}</span>
                  <span className="text-slate-500 font-normal text-xs">
                    {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                <div className="text-slate-700 text-xs flex flex-wrap gap-x-2">
                  <span className="font-medium">{edu.degree} in {edu.fieldOfStudy}</span>
                  {edu.gpa && <span className="font-bold text-slate-900">• Cumulative GPA: {edu.gpa}</span>}
                </div>
                {edu.coursework && (
                  <p className="text-slate-600 text-xs mt-1">
                    <span className="font-semibold">Core Coursework:</span> {edu.coursework}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical & Core Skills */}
      {((skillsObj.languages && skillsObj.languages.length > 0) || (skillsObj.tools && skillsObj.tools.length > 0) || (Array.isArray(skillsObj) && skillsObj.length > 0)) && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Key Competencies & Technical Skills
          </h2>
          <div className="text-xs space-y-1">
            {Array.isArray(skillsObj) ? (
              <p><span className="font-semibold text-slate-900">Skills:</span> {skillsObj.join(', ')}</p>
            ) : (
              <>
                {skillsObj.languages?.length > 0 && (
                  <p><span className="font-semibold text-slate-900">Programming Languages:</span> {Array.isArray(skillsObj.languages) ? skillsObj.languages.join(', ') : skillsObj.languages}</p>
                )}
                {skillsObj.frameworks?.length > 0 && (
                  <p><span className="font-semibold text-slate-900">Frameworks & Technologies:</span> {Array.isArray(skillsObj.frameworks) ? skillsObj.frameworks.join(', ') : skillsObj.frameworks}</p>
                )}
                {skillsObj.tools?.length > 0 && (
                  <p><span className="font-semibold text-slate-900">Tools, Platforms & DB:</span> {Array.isArray(skillsObj.tools) ? skillsObj.tools.join(', ') : skillsObj.tools}</p>
                )}
                {skillsObj.softSkills?.length > 0 && (
                  <p><span className="font-semibold text-slate-900">Soft Skills & Methodologies:</span> {Array.isArray(skillsObj.softSkills) ? skillsObj.softSkills.join(', ') : skillsObj.softSkills}</p>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Academic & Capstone Projects */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Academic & Independent Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={proj.id || idx}>
                <div className="flex items-baseline justify-between font-bold text-slate-900">
                  <span>{proj.title}</span>
                  {proj.githubUrl && (
                    <a href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-700 font-normal hover:underline">
                      GitHub
                    </a>
                  )}
                </div>
                {proj.techStack && (
                  <p className="text-slate-600 text-xs italic mb-1">
                    Technologies: {proj.techStack}
                  </p>
                )}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
                    {proj.bullets.filter(Boolean).map((b, bIdx) => (
                      <li key={bIdx} className="leading-snug">{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work / Internship Experience (if any) */}
      {experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Internship & Practical Experience
          </h2>
          <div className="space-y-2.5">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx}>
                <div className="flex items-baseline justify-between font-bold text-slate-900">
                  <span>{exp.role} — {exp.company}</span>
                  <span className="text-slate-500 font-normal text-xs">
                    {[exp.startDate, exp.endDate || (exp.isCurrent ? 'Present' : '')].filter(Boolean).join(' – ')}
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs mt-1">
                    {exp.bullets.filter(Boolean).map((b, bIdx) => (
                      <li key={bIdx} className="leading-snug">{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Extracurriculars */}
      {(certs.length > 0 || achievements.length > 0 || extracurriculars.length > 0) && (
        <section className="mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Certifications & Co-Curricular Honours
          </h2>
          <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 text-xs">
            {certs.map((c, idx) => (
              <li key={c.id || idx}>
                <span className="font-semibold text-slate-900">{c.name || c.title}</span>
                {c.issuer && <span> — {c.issuer}</span>}
                {c.issueDate && <span className="text-slate-500"> ({c.issueDate})</span>}
              </li>
            ))}
            {achievements.map((a, idx) => (
              <li key={a.id || idx}>
                <span className="font-semibold text-slate-900">{a.title}</span>
                {a.date && <span className="text-slate-500"> ({a.date})</span>}
                {a.description && <span>: {a.description}</span>}
              </li>
            ))}
            {extracurriculars.map((e, idx) => (
              <li key={e.id || idx}>
                <span className="font-semibold text-slate-900">{e.role}</span>
                {e.organization && <span>, {e.organization}</span>}
                {e.description && <span>: {e.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
