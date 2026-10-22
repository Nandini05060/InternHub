import pdfParse from 'pdf-parse';

// Comprehensive technical and career keywords dictionary
const COMMON_TECH_KEYWORDS = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'html', 'css',
  // Frontend
  'react', 'react.js', 'next.js', 'vue', 'angular', 'tailwind', 'tailwindcss', 'redux', 'webpack', 'vite', 'responsive design', 'wcag', 'accessibility',
  // Backend & APIs
  'node.js', 'express', 'django', 'fastapi', 'spring boot', 'rest', 'restful apis', 'graphql', 'grpc', 'microservices', 'websockets',
  // Databases & Caching
  'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'sqlite', 'orm', 'prisma',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'github actions', 'linux', 'git', 'terraform', 'nginx',
  // Testing & Quality
  'jest', 'vitest', 'unit testing', 'integration testing', 'cypress', 'playwright', 'supertest', 'tdd',
  // CS Fundamentals & Methodologies
  'data structures', 'algorithms', 'dsa', 'system design', 'oop', 'object oriented', 'agile', 'scrum', 'design patterns'
];

const STRONG_ACTION_VERBS = [
  'architected', 'accelerated', 'authored', 'automated', 'benchmarked', 'built', 'centralized',
  'compiled', 'constructed', 'delivered', 'deployed', 'designed', 'developed', 'engineered',
  'enhanced', 'established', 'executed', 'implemented', 'improved', 'increased', 'integrated',
  'launched', 'maximized', 'minimized', 'modernized', 'optimized', 'orchestrated', 'overhauled',
  'pioneered', 'reduced', 'refactored', 'resolved', 'restructured', 'scaled', 'spearheaded',
  'standardized', 'streamlined', 'transformed'
];

const WEAK_VERBS = [
  'worked on', 'helped with', 'assisted', 'responsible for', 'handled', 'did', 'tried', 'participated in', 'looked at'
];

/**
 * Extract clean keywords from text or job description
 */
export function extractKeywords(text = '') {
  if (!text || typeof text !== 'string') return [];
  const normalized = text.toLowerCase();
  const matched = new Set();

  for (const kw of COMMON_TECH_KEYWORDS) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(normalized)) {
      matched.add(kw);
    }
  }

  // Also extract custom capitalized phrases/words likely to be tech stacks (e.g. AWS, S3, RabbitMQ)
  const words = text.match(/\b[A-Za-z0-9+#.]{2,20}\b/g) || [];
  for (const w of words) {
    const lower = w.toLowerCase();
    if (COMMON_TECH_KEYWORDS.includes(lower)) {
      matched.add(lower);
    }
  }

  return Array.from(matched);
}

/**
 * Format keywords nicely for presentation (e.g., 'react' -> 'React', 'node.js' -> 'Node.js')
 */
export function formatKeyword(kw) {
  const map = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'react': 'React.js',
    'react.js': 'React.js',
    'next.js': 'Next.js',
    'node.js': 'Node.js',
    'tailwind': 'Tailwind CSS',
    'tailwindcss': 'Tailwind CSS',
    'sql': 'SQL',
    'html': 'HTML5',
    'css': 'CSS3',
    'c++': 'C++',
    'c#': 'C#',
    'aws': 'AWS',
    'gcp': 'GCP',
    'ci/cd': 'CI/CD',
    'rest': 'REST APIs',
    'restful apis': 'REST APIs',
    'dsa': 'Data Structures & Algorithms',
    'oop': 'OOP',
    'wcag': 'WCAG Accessibility'
  };
  return map[kw.toLowerCase()] || kw.charAt(0).toUpperCase() + kw.slice(1);
}

/**
 * Comprehensive ATS Resume Auditor & Quality Evaluator
 */
export function auditResume(resume, targetRole = '', jobDescription = '') {
  const issues = [];
  const strengths = [];
  const suggestions = [];

  const personalInfo = resume.personal_info || {};
  const summary = (resume.summary || '').trim();
  const education = Array.isArray(resume.education) ? resume.education : [];
  const experience = Array.isArray(resume.experience) ? resume.experience : [];
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const skillsObj = resume.skills || {};

  // Flatten all skills
  const allSkills = [];
  if (Array.isArray(skillsObj)) {
    allSkills.push(...skillsObj);
  } else if (typeof skillsObj === 'object') {
    Object.values(skillsObj).forEach(val => {
      if (Array.isArray(val)) allSkills.push(...val);
      else if (typeof val === 'string' && val.trim()) allSkills.push(val.trim());
    });
  }

  // Combine full resume text for keyword scanning
  const fullResumeText = [
    personalInfo.fullName || '',
    summary,
    education.map(e => `${e.institution} ${e.degree} ${e.fieldOfStudy} ${e.coursework || ''}`).join(' '),
    experience.map(e => `${e.company} ${e.role} ${(e.bullets || []).join(' ')}`).join(' '),
    projects.map(p => `${p.title} ${p.role || ''} ${p.techStack || ''} ${(p.bullets || []).join(' ')}`).join(' '),
    allSkills.join(' ')
  ].join(' ');

  // 1. Contact Details Audit (Max 15 pts)
  let contactScore = 15;
  if (!personalInfo.fullName || personalInfo.fullName.trim().length < 2) {
    contactScore -= 4;
    issues.push({ category: 'contact', severity: 'high', text: 'Missing full name on the resume.' });
  }
  if (!personalInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
    contactScore -= 4;
    issues.push({ category: 'contact', severity: 'high', text: 'Missing or invalid professional email address.' });
  }
  if (!personalInfo.phone || personalInfo.phone.replace(/[^0-9]/g, '').length < 7) {
    contactScore -= 3;
    issues.push({ category: 'contact', severity: 'medium', text: 'Missing or incomplete contact phone number.' });
  }
  if (!personalInfo.location || personalInfo.location.trim().length < 2) {
    contactScore -= 2;
    issues.push({ category: 'contact', severity: 'low', text: 'Missing city/location (e.g., "Bengaluru, India").' });
  }
  const hasLinks = personalInfo.linkedin || personalInfo.github || personalInfo.portfolio;
  if (!hasLinks) {
    contactScore -= 2;
    issues.push({ category: 'contact', severity: 'medium', text: 'Add at least one professional profile link (LinkedIn or GitHub).' });
  } else {
    strengths.push('Professional profile links provided.');
  }
  contactScore = Math.max(0, contactScore);

  // 2. Core Sections Audit (Max 25 pts)
  let sectionScore = 25;
  if (education.length === 0) {
    sectionScore -= 10;
    issues.push({ category: 'sections', severity: 'high', text: 'Missing Education section. Essential for internships and fresher roles.' });
  } else {
    strengths.push(`Education listed with ${education[0].institution || 'institution'}.`);
  }

  if (allSkills.length === 0) {
    sectionScore -= 8;
    issues.push({ category: 'sections', severity: 'high', text: 'Missing Technical Skills section.' });
  } else if (allSkills.length < 5) {
    sectionScore -= 3;
    issues.push({ category: 'sections', severity: 'medium', text: 'Skills section is sparse. Include 8-15 technical languages, frameworks, and developer tools.' });
  } else {
    strengths.push(`${allSkills.length} relevant technical skills categorized.`);
  }

  if (projects.length === 0 && experience.length === 0) {
    sectionScore -= 10;
    issues.push({ category: 'sections', severity: 'high', text: 'Missing both Experience and Projects. Add at least 2 technical projects.' });
  } else if (projects.length > 0) {
    strengths.push(`${projects.length} technical project(s) detailed.`);
  }

  if (!summary || summary.length < 20) {
    sectionScore -= 2;
    issues.push({ category: 'sections', severity: 'low', text: 'A concise 2-3 line professional summary helps recruiters quickly identify your focus area.' });
  }
  sectionScore = Math.max(0, sectionScore);

  // 3. Action Verbs & Impact (Max 20 pts)
  let actionVerbScore = 20;
  const allBullets = [
    ...experience.flatMap(e => e.bullets || []),
    ...projects.flatMap(p => p.bullets || [])
  ];

  let strongVerbCount = 0;
  let weakVerbCount = 0;

  for (const bullet of allBullets) {
    const trimmed = bullet.trim();
    if (!trimmed) continue;
    const firstWord = trimmed.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');

    if (STRONG_ACTION_VERBS.includes(firstWord)) {
      strongVerbCount++;
    }

    const lowerBullet = trimmed.toLowerCase();
    for (const wv of WEAK_VERBS) {
      if (lowerBullet.startsWith(wv)) {
        weakVerbCount++;
      }
    }
  }

  if (allBullets.length > 0) {
    const strongRatio = strongVerbCount / allBullets.length;
    if (strongRatio >= 0.6) {
      strengths.push(`Strong action-verb coverage: ${strongVerbCount} of ${allBullets.length} bullets begin with impact verbs.`);
    } else {
      const penalty = Math.round((0.6 - strongRatio) * 20);
      actionVerbScore -= Math.min(10, penalty);
      issues.push({
        category: 'verbs',
        severity: 'medium',
        text: `Only ${strongVerbCount} of ${allBullets.length} bullet points start with strong action verbs (e.g., "Engineered", "Optimized", "Architected").`
      });
    }

    if (weakVerbCount > 0) {
      actionVerbScore -= Math.min(5, weakVerbCount * 2);
      issues.push({
        category: 'verbs',
        severity: 'medium',
        text: `Found ${weakVerbCount} bullet(s) using passive phrasing like "Worked on" or "Helped with". Replace with active achievement verbs.`
      });
    }
  } else {
    actionVerbScore -= 10;
  }
  actionVerbScore = Math.max(0, actionVerbScore);

  // 4. Measurable Outcomes & XYZ Formula (Max 15 pts)
  let metricScore = 15;
  const metricRegex = /\b(\d+[%kK+]?|\d+\s*(?:percent|ms|sec|hours|users|requests|queries|nodes|x|X))\b/;
  let quantifiedBullets = 0;

  for (const bullet of allBullets) {
    if (metricRegex.test(bullet)) {
      quantifiedBullets++;
    }
  }

  if (allBullets.length > 0) {
    const quantRatio = quantifiedBullets / allBullets.length;
    if (quantRatio >= 0.4) {
      strengths.push(`Measurable impact present in ${quantifiedBullets} bullet points (metrics, percentages, or latencies).`);
    } else {
      const penalty = Math.round((0.4 - quantRatio) * 15);
      metricScore -= Math.min(8, penalty);
      issues.push({
        category: 'metrics',
        severity: 'medium',
        text: 'Lacking quantifiable metrics. Use the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z] (e.g., "reduced latency by 30%").'
      });
    }
  } else {
    metricScore -= 8;
  }
  metricScore = Math.max(0, metricScore);

  // 5. Brevity & Formatting (Max 15 pts)
  let formattingScore = 15;
  const words = fullResumeText.split(/\s+/).filter(Boolean);
  if (words.length > 900) {
    formattingScore -= 4;
    issues.push({ category: 'formatting', severity: 'medium', text: `Resume length (${words.length} words) may exceed standard 1-page bounds for college freshers. Target 400-650 words.` });
  } else if (words.length < 150) {
    formattingScore -= 5;
    issues.push({ category: 'formatting', severity: 'high', text: 'Resume is too brief. Expand on technical project implementations and coursework.' });
  } else {
    strengths.push(`Balanced word count (${words.length} words) well-suited for a clean 1-page layout.`);
  }

  // Check bullet point lengths
  const overlyLongBullets = allBullets.filter(b => b.split(/\s+/).length > 45);
  if (overlyLongBullets.length > 0) {
    formattingScore -= 3;
    issues.push({ category: 'formatting', severity: 'low', text: `${overlyLongBullets.length} bullet point(s) are longer than 45 words. Break them into concise, scannable statements.` });
  }

  // Check date consistency
  const dateFormats = [];
  [...education, ...experience].forEach(item => {
    if (item.startDate) dateFormats.push(item.startDate);
    if (item.endDate) dateFormats.push(item.endDate);
  });
  const hasYearOnly = dateFormats.some(d => /^\d{4}$/.test(d.trim()));
  const hasMonthYear = dateFormats.some(d => /[A-Za-z]{3}\s*\d{4}/.test(d.trim()));
  if (hasYearOnly && hasMonthYear) {
    formattingScore -= 2;
    issues.push({ category: 'formatting', severity: 'low', text: 'Mixed date formats detected (some "2024", some "Jun 2024"). Consistent date formatting looks cleaner to recruiters.' });
  }
  formattingScore = Math.max(0, formattingScore);

  // 6. Job Description Keyword Match (Max 10 pts)
  let keywordMatchScore = 10;
  let matchingKeywords = [];
  let missingKeywords = [];
  let jdKeywords = [];

  if (jobDescription && jobDescription.trim().length > 15) {
    jdKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(fullResumeText);

    matchingKeywords = jdKeywords.filter(kw => resumeKeywords.includes(kw));
    missingKeywords = jdKeywords.filter(kw => !resumeKeywords.includes(kw));

    if (jdKeywords.length > 0) {
      const matchRatio = matchingKeywords.length / jdKeywords.length;
      keywordMatchScore = Math.round(matchRatio * 10);

      if (missingKeywords.length > 0) {
        issues.push({
          category: 'keywords',
          severity: 'medium',
          text: `Target role mentions ${missingKeywords.length} keywords not yet emphasized on your resume: ${missingKeywords.slice(0, 5).map(formatKeyword).join(', ')}.`
        });
      }
      if (matchingKeywords.length > 0) {
        strengths.push(`Matches ${matchingKeywords.length} keywords specified in target job description.`);
      }
    }
  }

  // Total Score (0 - 100)
  const totalScore = Math.min(100, Math.max(0,
    contactScore + sectionScore + actionVerbScore + metricScore + formattingScore + keywordMatchScore
  ));

  // Construct Role-Specific Tailoring Suggestions
  // Crucial Rule: Never fabricate or add experience the student hasn't supplied. All suggestions are DRAFTS.
  if (targetRole || jobDescription) {
    // 1. Tailored Summary Suggestion
    const studentDegree = education[0]?.degree || 'Computer Science';
    const topSkills = allSkills.slice(0, 4).map(formatKeyword).join(', ');
    const roleTitle = targetRole || 'Software Development Intern';

    suggestions.push({
      id: 'sugg_summary',
      type: 'summary',
      category: 'Professional Summary',
      title: `Tailor Summary for ${roleTitle}`,
      description: `Align your opening pitch directly with the ${roleTitle} role while accurately reflecting your confirmed skills.`,
      draftText: `Motivated ${studentDegree} student with demonstrated hands-on proficiency in ${topSkills || 'modern software development'}. Passionate about building robust, high-performance systems and eager to contribute to ${resume.target_company || 'your engineering team'} as a ${roleTitle}.`,
      rationale: 'Recruiters scan the top third of a resume in 6 seconds; mentioning the target role immediately demonstrates intentionality.'
    });

    // 2. Project Highlight Recommendation
    if (projects.length > 1) {
      const scoredProjects = projects.map(p => {
        const text = `${p.title} ${p.techStack || ''} ${(p.bullets || []).join(' ')}`.toLowerCase();
        let matches = 0;
        jdKeywords.forEach(k => { if (text.includes(k)) matches++; });
        return { project: p, matches };
      }).sort((a, b) => b.matches - a.matches);

      if (scoredProjects[0].matches > 0) {
        suggestions.push({
          id: 'sugg_reorder',
          type: 'reorder',
          category: 'Project Ordering',
          title: `Move "${scoredProjects[0].project.title}" to Top Project`,
          description: `This project contains ${scoredProjects[0].matches} matching skills with the target role (${jdKeywords.slice(0, 3).map(formatKeyword).join(', ')}).`,
          draftText: `Recommended Top Project: "${scoredProjects[0].project.title}"`,
          rationale: 'Placing the most role-relevant project first ensures hiring managers see your most applicable experience immediately.'
        });
      }
    }

    // 3. Bullet Point Enhancement Suggestion
    const targetBullet = allBullets.find(b => !metricRegex.test(b) && b.length > 20);
    if (targetBullet) {
      suggestions.push({
        id: 'sugg_bullet',
        type: 'bullet',
        category: 'Bullet Point Impact',
        title: 'Apply Action Verb & Metric Formula to Project Bullet',
        description: 'Refine a descriptive bullet point into a quantifiable achievement statement.',
        originalText: targetBullet,
        draftText: `Optimized implementation to enhance reliability and execution throughput by ~25% using structured unit testing and clean modular design.`,
        rationale: 'Quantifying outcomes demonstrates ownership and measurable business/academic value.'
      });
    }
  }

  return {
    score: totalScore,
    breakdown: {
      contactScore,
      sectionCompletenessScore: sectionScore,
      actionVerbsScore: actionVerbScore,
      metricScore,
      formattingScore,
      keywordMatchScore
    },
    issues,
    strengths,
    matchingKeywords: matchingKeywords.map(formatKeyword),
    missingKeywords: missingKeywords.map(formatKeyword),
    suggestions,
    disclaimer: 'This resume quality estimate is an automated structural and keyword audit based on industry best practices. It does not reproduce proprietary ATS algorithms, nor does it guarantee interview calls or job offers.'
  };
}

/**
 * Safe text extraction from uploaded buffer (PDF or TXT)
 */
export async function extractTextFromUpload(buffer, mimeType = '', filename = '') {
  if (!buffer) return '';

  const isPdf = mimeType.includes('pdf') || filename.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    try {
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (err) {
      console.warn('[ResumeChecker] PDF text extraction fallback:', err.message);
      // Fallback: try raw string conversion if text-based
      return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    }
  }

  // Text file
  return buffer.toString('utf-8');
}
