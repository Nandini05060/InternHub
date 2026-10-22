import React from 'react';

export function SoftwareDeveloperTemplate({ resume, compactMode = false }) {
  const info = resume.personal_info || {};
  const education = Array.isArray(resume.education) ? resume.education : [];
  const experience = Array.isArray(resume.experience) ? resume.experience : [];
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const skillsObj = resume.skills || {};
  const certs = Array.isArray(resume.certifications) ? resume.certifications : [];
  const achievements = Array.isArray(resume.achievements) ? resume.achievements : [];

  return (
    <div
      className={`bg-white text-slate-900 font-sans leading-normal ${
        compactMode ? 'p-6 text-xs' : 'p-8 text-sm'
      }`}
      style={{ minHeight: '100%', boxSizing: 'border-box' }}
    >
      {/* Header: Tech Developer Emphasis */}
      <div className="border-b-2 border-indigo-600 pb-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <h1 className={`${compactMode ? 'text-2xl' : 'text-3xl'} font-extrabold text-slate-900 tracking-tight font-mono`}>
            {info.fullName || 'Candidate Name'}
          </h1>
          <span className="text-xs font-semibold text-indigo-700 font-mono">
            {resume.target_role || 'Software Development Engineer'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-600 font-mono">
          {info.email && (
            <a href={`mailto:${info.email}`} className="text-indigo-600 hover:underline">
              {info.email}
            </a>
          )}
          {info.phone && <span>• {info.phone}</span>}
          {info.location && <span>• {info.location}</span>}
          {info.github && (
            <a href={info.github.startsWith('http') ? info.github : `https://${info.github}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
              • {info.github.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          )}
          {info.linkedin && (
            <a href={info.linkedin.startsWith('http') ? info.linkedin : `https://${info.linkedin}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
              • {info.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          )}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-indigo-600 inline-block" />
            Summary
          </h2>
          <p className="text-slate-700 leading-relaxed text-justify">
            {resume.summary}
          </p>
        </section>
      )}

      {/* Technical Skills — Prominently Positioned on Top for Devs */}
      {((skillsObj.languages && skillsObj.languages.length > 0) || (skillsObj.tools && skillsObj.tools.length > 0) || (Array.isArray(skillsObj) && skillsObj.length > 0)) && (
        <section className="mb-4 bg-slate-50/70 p-3 rounded-lg border border-slate-200/80">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1.5 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-xs bg-indigo-600 inline-block" />
            Technical Arsenal
          </h2>
          <div className="grid grid-cols-1 gap-1 text-xs font-mono">
            {Array.isArray(skillsObj) ? (
              <p><span className="font-bold text-slate-800">Stack:</span> {skillsObj.join(' • ')}</p>
            ) : (
              <>
                {skillsObj.languages?.length > 0 && (
                  <p><span className="font-bold text-slate-800">Languages:</span> {Array.isArray(skillsObj.languages) ? skillsObj.languages.join(', ') : skillsObj.languages}</p>
                )}
                {skillsObj.frameworks?.length > 0 && (
                  <p><span className="font-bold text-slate-800">Frameworks / Runtimes:</span> {Array.isArray(skillsObj.frameworks) ? skillsObj.frameworks.join(', ') : skillsObj.frameworks}</p>
                )}
                {skillsObj.tools?.length > 0 && (
                  <p><span className="font-bold text-slate-800">Cloud / DevOps / DB:</span> {Array.isArray(skillsObj.tools) ? skillsObj.tools.join(', ') : skillsObj.tools}</p>
                )}
                {skillsObj.softSkills?.length > 0 && (
                  <p><span className="font-bold text-slate-800">Architecture / Practices:</span> {Array.isArray(skillsObj.softSkills) ? skillsObj.softSkills.join(', ') : skillsObj.softSkills}</p>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Projects — High Importance */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-indigo-600 inline-block" />
            Software Projects & Open Source
          </h2>
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={proj.id || idx}>
                <div className="flex items-baseline justify-between">
                  <div className="font-bold text-slate-900">
                    <span>{proj.title}</span>
                    {proj.role && <span className="font-normal text-slate-600 text-xs"> — {proj.role}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-indigo-600">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`} target="_blank" rel="noreferrer" className="hover:underline">
                        [source]
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`} target="_blank" rel="noreferrer" className="hover:underline">
                        [live demo]
                      </a>
                    )}
                  </div>
                </div>
                {proj.techStack && (
                  <p className="text-indigo-800 text-xs font-mono font-medium mb-1">
                    [{proj.techStack}]
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

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-indigo-600 inline-block" />
            Engineering Experience
          </h2>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx}>
                <div className="flex items-baseline justify-between font-bold text-slate-900">
                  <span>{exp.role}</span>
                  <span className="text-slate-500 font-mono font-normal text-xs">
                    {[exp.startDate, exp.endDate || (exp.isCurrent ? 'Present' : '')].filter(Boolean).join(' – ')}
                  </span>
                </div>
                <div className="text-slate-600 text-xs mb-1">
                  <span>{exp.company}</span>
                  {exp.location && <span> • {exp.location}</span>}
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
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

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-indigo-600 inline-block" />
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={edu.id || idx}>
                <div className="flex items-baseline justify-between font-bold text-slate-900">
                  <span>{edu.institution}</span>
                  <span className="text-slate-500 font-mono font-normal text-xs">
                    {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                <div className="text-slate-700 flex flex-wrap gap-x-2 text-xs">
                  <span>{edu.degree} in {edu.fieldOfStudy}</span>
                  {edu.gpa && <span className="font-semibold text-slate-900">• CGPA: {edu.gpa}</span>}
                </div>
                {edu.coursework && (
                  <p className="text-slate-500 text-xs font-mono mt-0.5">
                    Coursework: {edu.coursework}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Achievements */}
      {(certs.length > 0 || achievements.length > 0) && (
        <section className="mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-indigo-600 inline-block" />
            Certifications & Competitive Programming
          </h2>
          <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 text-xs">
            {certs.map((c, idx) => (
              <li key={c.id || idx}>
                <span className="font-bold text-slate-900">{c.name || c.title}</span>
                {c.issuer && <span> — {c.issuer}</span>}
                {c.issueDate && <span className="text-slate-500"> ({c.issueDate})</span>}
              </li>
            ))}
            {achievements.map((a, idx) => (
              <li key={a.id || idx}>
                <span className="font-bold text-slate-900">{a.title}</span>
                {a.date && <span className="text-slate-500"> ({a.date})</span>}
                {a.description && <span>: {a.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
