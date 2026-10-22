import React from 'react';
import { AtsMinimalTemplate } from './templates/AtsMinimalTemplate.jsx';
import { SoftwareDeveloperTemplate } from './templates/SoftwareDeveloperTemplate.jsx';
import { FresherTemplate } from './templates/FresherTemplate.jsx';
import { InternshipTemplate } from './templates/InternshipTemplate.jsx';

export function ResumePreview({ resume, templateId = 'ats_minimal', compactMode = false }) {
  const selectedTemplate = templateId || resume?.template_id || 'ats_minimal';

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'software_dev':
        return <SoftwareDeveloperTemplate resume={resume} compactMode={compactMode} />;
      case 'fresher':
        return <FresherTemplate resume={resume} compactMode={compactMode} />;
      case 'internship':
        return <InternshipTemplate resume={resume} compactMode={compactMode} />;
      case 'ats_minimal':
      default:
        return <AtsMinimalTemplate resume={resume} compactMode={compactMode} />;
    }
  };

  return (
    <div
      id="resume-preview-container"
      className="bg-white shadow-xl rounded-xl border border-slate-200 overflow-hidden mx-auto transition-all select-text"
      style={{
        width: '100%',
        maxWidth: '794px', // Standard A4 ratio at 96 DPI
        minHeight: compactMode ? '920px' : '1020px'
      }}
    >
      {renderTemplate()}
    </div>
  );
}
