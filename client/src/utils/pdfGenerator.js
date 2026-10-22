import { jsPDF } from 'jspdf';

/**
 * Cleanly generates a professional vector PDF with selectable text, working links,
 * correct page breaks, and consistent typography.
 */
export function generateResumePdf(resume, options = {}) {
  const { compact = false, filename } = options;

  // A4 dimensions in points: 595.28 x 841.89
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
    orientation: 'portrait'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = compact ? 32 : 40;
  const contentWidth = pageWidth - margin * 2;
  const bottomThreshold = pageHeight - margin - 20;

  let y = margin;

  const fontSizes = compact
    ? { name: 17, title: 10, sectionHeader: 10.5, body: 8.5, small: 7.5 }
    : { name: 20, title: 11, sectionHeader: 11.5, body: 9.5, small: 8.5 };

  const lineHeights = compact
    ? { body: 11.5, sectionSpacing: 12, itemSpacing: 5 }
    : { body: 13.5, sectionSpacing: 15, itemSpacing: 7 };

  function checkPageBreak(requiredSpace = 25) {
    if (y + requiredSpace > bottomThreshold) {
      doc.addPage();
      y = margin;
    }
  }

  function drawSectionHeader(title) {
    checkPageBreak(30);
    y += lineHeights.sectionSpacing;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fontSizes.sectionHeader);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(title.toUpperCase(), margin, y);

    // Subtle horizontal divider line
    const textWidth = doc.getTextWidth(title.toUpperCase());
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.75);
    doc.line(margin, y + 3, margin + contentWidth, y + 3);
    y += 10;
  }

  // ==========================================
  // 1. Header (Personal Info & Links)
  // ==========================================
  const info = resume.personal_info || {};
  const fullName = info.fullName || 'Candidate Name';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontSizes.name);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(fullName, pageWidth / 2, y + 6, { align: 'center' });
  y += fontSizes.name + 2;

  // Contact items line
  const contactParts = [];
  if (info.email) contactParts.push(info.email);
  if (info.phone) contactParts.push(info.phone);
  if (info.location) contactParts.push(info.location);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSizes.small);
  doc.setTextColor(71, 85, 105); // slate-600
  if (contactParts.length > 0) {
    doc.text(contactParts.join('  •  '), pageWidth / 2, y, { align: 'center' });
    y += lineHeights.body;
  }

  // Profile Links Line (LinkedIn, GitHub, Portfolio)
  const linkParts = [];
  if (info.linkedin) linkParts.push(info.linkedin.replace(/^https?:\/\/(www\.)?/, ''));
  if (info.github) linkParts.push(info.github.replace(/^https?:\/\/(www\.)?/, ''));
  if (info.portfolio) linkParts.push(info.portfolio.replace(/^https?:\/\/(www\.)?/, ''));

  if (linkParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSizes.small);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(linkParts.join('   |   '), pageWidth / 2, y, { align: 'center' });
    y += lineHeights.body + 2;
  }

  // ==========================================
  // 2. Professional Summary
  // ==========================================
  if (resume.summary && resume.summary.trim()) {
    drawSectionHeader('Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSizes.body);
    doc.setTextColor(51, 65, 85);

    const summaryLines = doc.splitTextToSize(resume.summary.trim(), contentWidth);
    summaryLines.forEach(line => {
      checkPageBreak(lineHeights.body);
      doc.text(line, margin, y);
      y += lineHeights.body;
    });
  }

  // ==========================================
  // 3. Technical & Soft Skills
  // ==========================================
  const skillsObj = resume.skills || {};
  let skillCategories = [];

  if (Array.isArray(skillsObj)) {
    if (skillsObj.length > 0) {
      skillCategories.push({ name: 'Skills', items: skillsObj.join(', ') });
    }
  } else if (typeof skillsObj === 'object') {
    if (skillsObj.languages && skillsObj.languages.length) {
      skillCategories.push({ name: 'Languages', items: Array.isArray(skillsObj.languages) ? skillsObj.languages.join(', ') : skillsObj.languages });
    }
    if (skillsObj.frameworks && skillsObj.frameworks.length) {
      skillCategories.push({ name: 'Frameworks / Libraries', items: Array.isArray(skillsObj.frameworks) ? skillsObj.frameworks.join(', ') : skillsObj.frameworks });
    }
    if (skillsObj.tools && skillsObj.tools.length) {
      skillCategories.push({ name: 'Developer Tools & Cloud', items: Array.isArray(skillsObj.tools) ? skillsObj.tools.join(', ') : skillsObj.tools });
    }
    if (skillsObj.softSkills && skillsObj.softSkills.length) {
      skillCategories.push({ name: 'Core Competencies', items: Array.isArray(skillsObj.softSkills) ? skillsObj.softSkills.join(', ') : skillsObj.softSkills });
    }
  }

  if (skillCategories.length > 0) {
    drawSectionHeader('Technical Skills');
    skillCategories.forEach(cat => {
      checkPageBreak(lineHeights.body);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSizes.body);
      doc.setTextColor(30, 41, 59);
      const catHeader = `${cat.name}: `;
      doc.text(catHeader, margin, y);
      const catWidth = doc.getTextWidth(catHeader);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(cat.items, contentWidth - catWidth);
      if (lines.length > 0) {
        doc.text(lines[0], margin + catWidth, y);
        for (let i = 1; i < lines.length; i++) {
          y += lineHeights.body;
          checkPageBreak(lineHeights.body);
          doc.text(lines[i], margin + catWidth, y);
        }
      }
      y += lineHeights.body + 2;
    });
  }

  // ==========================================
  // 4. Technical Projects
  // ==========================================
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  if (projects.length > 0) {
    drawSectionHeader('Projects');
    projects.forEach(p => {
      checkPageBreak(35);
      // Project Title & Tech Stack
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSizes.body + 0.5);
      doc.setTextColor(15, 23, 42);
      doc.text(p.title || 'Project Title', margin, y);

      let rightText = '';
      if (p.liveUrl) rightText = p.liveUrl.replace(/^https?:\/\/(www\.)?/, '');
      else if (p.githubUrl) rightText = p.githubUrl.replace(/^https?:\/\/(www\.)?/, '');

      if (rightText) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSizes.small);
        doc.setTextColor(79, 70, 229);
        doc.text(rightText, margin + contentWidth, y, { align: 'right' });
      }
      y += lineHeights.body - 1;

      if (p.techStack) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(fontSizes.small);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`Tech Stack: ${p.techStack}`, margin, y);
        y += lineHeights.body - 1;
      }

      // Project bullets
      const bullets = Array.isArray(p.bullets) ? p.bullets : [];
      bullets.forEach(bullet => {
        if (!bullet || !bullet.trim()) return;
        checkPageBreak(lineHeights.body);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSizes.body);
        doc.setTextColor(51, 65, 85);

        // Bullet point marker
        doc.text('•', margin + 6, y);
        const bulletLines = doc.splitTextToSize(bullet.trim(), contentWidth - 18);
        bulletLines.forEach((bLine, idx) => {
          if (idx > 0) {
            y += lineHeights.body;
            checkPageBreak(lineHeights.body);
          }
          doc.text(bLine, margin + 18, y);
        });
        y += lineHeights.body + 1;
      });
      y += lineHeights.itemSpacing;
    });
  }

  // ==========================================
  // 5. Work Experience / Internships
  // ==========================================
  const experience = Array.isArray(resume.experience) ? resume.experience : [];
  if (experience.length > 0) {
    drawSectionHeader('Experience');
    experience.forEach(exp => {
      checkPageBreak(35);
      // Company & Role
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSizes.body + 0.5);
      doc.setTextColor(15, 23, 42);
      doc.text(exp.role || 'Role', margin, y);

      const dateStr = [exp.startDate, exp.endDate || (exp.isCurrent ? 'Present' : '')].filter(Boolean).join(' – ');
      if (dateStr) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSizes.small);
        doc.setTextColor(100, 116, 139);
        doc.text(dateStr, margin + contentWidth, y, { align: 'right' });
      }
      y += lineHeights.body - 1;

      // Sub-line: Company, Location
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSizes.small);
      doc.setTextColor(71, 85, 105);
      const subParts = [exp.company, exp.location].filter(Boolean);
      if (subParts.length > 0) {
        doc.text(subParts.join('  •  '), margin, y);
        y += lineHeights.body;
      }

      // Bullets
      const bullets = Array.isArray(exp.bullets) ? exp.bullets : [];
      bullets.forEach(bullet => {
        if (!bullet || !bullet.trim()) return;
        checkPageBreak(lineHeights.body);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSizes.body);
        doc.setTextColor(51, 65, 85);

        doc.text('•', margin + 6, y);
        const bulletLines = doc.splitTextToSize(bullet.trim(), contentWidth - 18);
        bulletLines.forEach((bLine, idx) => {
          if (idx > 0) {
            y += lineHeights.body;
            checkPageBreak(lineHeights.body);
          }
          doc.text(bLine, margin + 18, y);
        });
        y += lineHeights.body + 1;
      });
      y += lineHeights.itemSpacing;
    });
  }

  // ==========================================
  // 6. Education
  // ==========================================
  const education = Array.isArray(resume.education) ? resume.education : [];
  if (education.length > 0) {
    drawSectionHeader('Education');
    education.forEach(edu => {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSizes.body + 0.5);
      doc.setTextColor(15, 23, 42);
      doc.text(edu.institution || 'University', margin, y);

      const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');
      if (dateStr) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSizes.small);
        doc.setTextColor(100, 116, 139);
        doc.text(dateStr, margin + contentWidth, y, { align: 'right' });
      }
      y += lineHeights.body - 1;

      // Degree, Field of study, CGPA
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSizes.body);
      doc.setTextColor(51, 65, 85);
      const degreeParts = [];
      if (edu.degree) degreeParts.push(edu.degree);
      if (edu.fieldOfStudy) degreeParts.push(edu.fieldOfStudy);
      if (edu.gpa) degreeParts.push(`CGPA: ${edu.gpa}`);

      doc.text(degreeParts.join('  •  '), margin, y);
      y += lineHeights.body;

      if (edu.coursework) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(fontSizes.small);
        doc.setTextColor(100, 116, 139);
        const courseLines = doc.splitTextToSize(`Coursework: ${edu.coursework}`, contentWidth);
        courseLines.forEach(cl => {
          checkPageBreak(lineHeights.body);
          doc.text(cl, margin, y);
          y += lineHeights.body - 2;
        });
      }
      y += lineHeights.itemSpacing;
    });
  }

  // ==========================================
  // 7. Certifications & Achievements
  // ==========================================
  const certs = Array.isArray(resume.certifications) ? resume.certifications : [];
  const achievements = Array.isArray(resume.achievements) ? resume.achievements : [];

  if (certs.length > 0 || achievements.length > 0) {
    drawSectionHeader('Certifications & Achievements');

    certs.forEach(c => {
      checkPageBreak(lineHeights.body);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSizes.body);
      doc.setTextColor(30, 41, 59);
      doc.text('•', margin + 6, y);
      const titleStr = c.name || c.title || 'Certification';
      doc.text(titleStr, margin + 18, y);

      const extra = [c.issuer || c.provider, c.issueDate || c.date].filter(Boolean).join(' | ');
      if (extra) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSizes.small);
        doc.setTextColor(100, 116, 139);
        doc.text(extra, margin + contentWidth, y, { align: 'right' });
      }
      y += lineHeights.body + 1;
    });

    achievements.forEach(a => {
      checkPageBreak(lineHeights.body);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSizes.body);
      doc.setTextColor(30, 41, 59);
      doc.text('•', margin + 6, y);
      const titleStr = a.title || 'Achievement';
      doc.text(titleStr, margin + 18, y);

      if (a.date) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSizes.small);
        doc.setTextColor(100, 116, 139);
        doc.text(a.date, margin + contentWidth, y, { align: 'right' });
      }
      y += lineHeights.body - 1;

      if (a.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSizes.small);
        doc.setTextColor(71, 85, 105);
        const descLines = doc.splitTextToSize(a.description, contentWidth - 18);
        descLines.forEach(dl => {
          checkPageBreak(lineHeights.body);
          doc.text(dl, margin + 18, y);
          y += lineHeights.body - 2;
        });
      }
      y += 2;
    });
  }

  const safeFilename = (filename || `${(fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`).replace(/[^\w.-]/g, '_');
  doc.save(safeFilename);
  return doc;
}

/**
 * Triggers native browser print preview styled cleanly for resume printing
 */
export function printResumeElement(elementId = 'resume-preview-container') {
  window.print();
}
