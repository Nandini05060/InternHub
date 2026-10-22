import React from 'react';

export function InternshipTemplate({ resume, compactMode = false }) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-2 border-slate-900 pb-3 mb-4 gap-2">
        <div>
          <h1 className={`${compactMode ? 'text-2xl' : 'text-3xl'} font-extrabold text-slate-900 tracking-tight`}>
            {info.fullName || 'Candidate Name'}
          </h1>
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mt-0.5">
            {resume.target_role || 'Internship Candidate'}
          </p>
        </div>

        <div className="text-right text-xs text-slate-600 space-y-0.5 sm:border-l sm:border-slate-200 sm:pl-4">
          <div>{info.email || 'email@example.com'}</div>
          <div>{[info.phone, info.location].filter(Boolean).join(' • ')}</div>
          {(info.linkedin || info.github) && (
            <div className="text-indigo-600 font-medium">
              {[
                info.linkedin ? info.linkedin.replace(/^https?:\/\/(www\.)?/, '') : '',
                info.github ? info.github.replace(/^https?:\/\/(www\.)?/, '') : ''
              ].filter(Boolean).join('  |  ')}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Profile & Internship Objective
          </h2>
          <p className="text-slate-700 leading-relaxed text-justify">
            {resume.summary}
          </p>
        </section>
      )}

      {/* Relevant Experience — Promoted First for Internship Applicants */}
      {experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Relevant Experience & Internships
          </h2>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx}>
                <div className="flex items-baseline justify-between font-bold text-slate-900">
                  <span>{exp.role}</span>
                  <span className="text-slate-500 font-normal text-xs">
                    {[exp.startDate, exp.endDate || (exp.isCurrent ? 'Present' : '')].filter(Boolean).join(' – ')}
                  </span>
                </div>
                <div className="text-slate-600 text-xs mb-1">
                  <span className="font-semibold text-slate-800">{exp.company}</span>
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

      {/* Hands-on Projects */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Demonstrated Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={proj.id || idx}>
                <div className="flex items-baseline justify-between font-bold text-slate-900">
                  <div>
                    <span>{proj.title}</span>
                    {proj.role && <span className="font-normal text-slate-600 text-xs"> ({proj.role})</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-indigo-700 font-medium">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`} target="_blank" rel="noreferrer" className="hover:underline">
                        Code
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`} target="_blank" rel="noreferrer" className="hover:underline">
                        • Demo
                      </a>
                    )}
                  </div>
                </div>
                {proj.techStack && (
                  <p className="text-indigo-800 text-xs font-medium mb-1">
                    Stack: {proj.techStack}
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

      {/* Technical & Collaborative Skills */}
      {((skillsObj.languages && skillsObj.languages.length > 0) || (skillsObj.tools && skillsObj.tools.length > 0) || (Array.isArray(skillsObj) && skillsObj.length > 0)) && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Technical & Practical Skills
          </h2>
          <div className="text-xs space-y-1">
            {Array.isArray(skillsObj) ? (
              <p><span className="font-semibold text-slate-900">Skills:</span> {skillsObj.join(', ')}</p>
            ) : (
              <>
                {skillsObj.languages?.length > 0 && (
                  <p><span className="font-semibold text-slate-900">Languages:</span> {Array.isArray(skillsObj.languages) ? skillsObj.languages.join(', ') : skillsObj.languages}</p>
                )}
                {skillsObj.frameworks?.length > 0 && (
                  <p><span className="font-semibold text-slate-900">Frameworks / Libraries:</span> {Array.isArray(skillsObj.frameworks) ? skillsObj.frameworks.join(', ') : skillsObj.frameworks}</p>
                )}
                {skillsObj.tools?.length > 0 && (
                  <p><span className="font-semibold text-slate-900">Tools & Platforms:</span> {Array.isArray(skillsObj.tools) ? skillsObj.tools.join(', ') : skillsObj.tools}</p>
                )}
                {skillsObj.softSkills?.length > 0 && (
                  <p><span className="font-semibold text-slate-900">Team Collaboration:</span> {Array.isArray(skillsObj.softSkills) ? skillsObj.softSkills.join(', ') : skillsObj.softSkills}</p>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={edu.id || idx}>
                <div className="flex items-baseline justify-between font-bold text-slate-900">
                  <span>{edu.institution}</span>
                  <span className="text-slate-500 font-normal text-xs">
                    {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                <div className="text-slate-700 text-xs flex flex-wrap gap-x-2">
                  <span>{edu.degree} in {edu.fieldOfStudy}</span>
                  {edu.gpa && <span className="font-bold text-slate-900">• GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements & Leadership */}
      {(certs.length > 0 || achievements.length > 0 || extracurriculars.length > 0) && (
        <section className="mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Achievements & Campus Leadership
          </h2>
          <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 text-xs">
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
            {certs.map((c, idx) => (
              <li key={c.id || idx}>
                <span className="font-semibold text-slate-900">{c.name || c.title}</span>
                {c.issuer && <span> — {c.issuer}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
