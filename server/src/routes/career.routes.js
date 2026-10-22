import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth.js';
import {
  getResumesByUserId,
  getResumeById,
  createResume,
  updateResume,
  duplicateResume,
  deleteResume,
  getAnalysesByUserId,
  createResumeAnalysis,
  deleteResumeAnalysis,
  getPlacementTasks,
  createPlacementTask,
  togglePlacementTask,
  updatePlacementTask,
  deletePlacementTask,
  getStudentCertifications,
  createStudentCertification,
  updateStudentCertification,
  deleteStudentCertification,
  getInterviewPractice,
  saveInterviewPractice,
  getVaultDocuments,
  createVaultDocument,
  deleteVaultDocument,
  getStudentProfile,
  getInternships
} from '../db/repository.js';
import {
  auditResume,
  extractKeywords,
  formatKeyword,
  extractTextFromUpload
} from '../services/resumeChecker.js';

const router = Router();

// Multer memory storage for resume parsing
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'text/plain'];
    const allowedExts = ['.pdf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      const err = new Error('Invalid file type. Only PDF and TXT documents are allowed.');
      err.code = 'INVALID_FILE_TYPE';
      err.statusCode = 400;
      cb(err, false);
    }
  }
});

// Multer disk storage for vault documents
const vaultUploadDir = path.resolve('uploads/vault');
if (!fs.existsSync(vaultUploadDir)) {
  fs.mkdirSync(vaultUploadDir, { recursive: true });
}

const vaultStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, vaultUploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `${uniqueSuffix}_${safeName}`);
  }
});

const uploadVault = multer({
  storage: vaultStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.pdf', '.txt', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      const err = new Error('File type not supported for Document Vault. Allowed: PDF, TXT, DOC, DOCX, PNG, JPG.');
      err.code = 'INVALID_FILE_TYPE';
      err.statusCode = 400;
      cb(err, false);
    }
  }
});


// All routes require authentication
router.use(authenticateToken);

// ==========================================
// 1. ATS RESUME BUILDER & VERSION MANAGEMENT
// ==========================================

// GET /api/career/resumes (List user's resumes)
router.get('/resumes', async (req, res, next) => {
  try {
    const resumes = await getResumesByUserId(req.user.id);
    res.json({
      success: true,
      count: resumes.length,
      resumes
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/career/resumes/:id (Get single resume with ownership check)
router.get('/resumes/:id', async (req, res, next) => {
  try {
    const resume = await getResumeById(req.params.id, req.user.id);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or access denied.'
      });
    }
    res.json({
      success: true,
      resume
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/career/resumes (Create new resume)
router.post('/resumes', async (req, res, next) => {
  try {
    const { title, target_role, target_company, template_id, personal_info, summary, education, experience, projects, skills, certifications, achievements, extracurriculars } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Resume title is required.'
      });
    }

    // Run quality check on initial content
    const audit = auditResume(req.body, target_role, '');
    const quality_score = audit.score;

    const resume = await createResume({
      userId: req.user.id,
      title: title.trim(),
      target_role: target_role || 'Software Developer',
      target_company: target_company || '',
      template_id: template_id || 'ats_minimal',
      personal_info: personal_info || {},
      summary: summary || '',
      education: education || [],
      experience: experience || [],
      projects: projects || [],
      skills: skills || {},
      certifications: certifications || [],
      achievements: achievements || [],
      extracurriculars: extracurriculars || [],
      version_status: req.body.version_status || 'draft',
      quality_score
    });

    res.status(201).json({
      success: true,
      message: 'Resume created successfully.',
      resume,
      audit
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/career/resumes/:id (Update resume with ownership check)
router.put('/resumes/:id', async (req, res, next) => {
  try {
    const existing = await getResumeById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or access denied.'
      });
    }

    // Recompute quality audit
    const mergedData = { ...existing, ...req.body };
    const audit = auditResume(mergedData, mergedData.target_role, req.body.job_description || '');
    mergedData.quality_score = audit.score;

    const updated = await updateResume(req.params.id, req.user.id, mergedData);

    res.json({
      success: true,
      message: 'Resume updated successfully.',
      resume: updated,
      audit
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/career/resumes/:id/duplicate (Duplicate resume with ownership check)
router.post('/resumes/:id/duplicate', async (req, res, next) => {
  try {
    const existing = await getResumeById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or access denied.'
      });
    }

    const { newTitle } = req.body;
    const duplicated = await duplicateResume(req.params.id, req.user.id, newTitle);

    res.status(201).json({
      success: true,
      message: 'Resume duplicated successfully.',
      resume: duplicated
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/career/resumes/:id (Delete resume with ownership check)
router.delete('/resumes/:id', async (req, res, next) => {
  try {
    const success = await deleteResume(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or access denied.'
      });
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/career/resumes/check-quality (Live quality & tailoring audit without saving)
router.post('/resumes/check-quality', (req, res) => {
  try {
    const { resume, targetRole, jobDescription } = req.body;
    if (!resume) {
      return res.status(400).json({ success: false, message: 'Resume payload is required for quality check.' });
    }

    const audit = auditResume(resume, targetRole, jobDescription);
    res.json({
      success: true,
      audit
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to audit resume: ' + err.message });
  }
});

// ==========================================
// 2. RESUME ANALYZER
// ==========================================

// GET /api/career/analyses (List past analyses)
router.get('/analyses', async (req, res, next) => {
  try {
    const analyses = await getAnalysesByUserId(req.user.id);
    res.json({
      success: true,
      analyses
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/career/analyses/analyze (Analyze uploaded PDF/TXT or pasted resume text)
router.post('/analyses/analyze', uploadMemory.single('resumeFile'), async (req, res, next) => {
  try {
    let extractedText = '';
    let resumeTitle = req.body.resumeTitle || 'Analyzed Resume';

    if (req.file) {
      resumeTitle = req.file.originalname;
      extractedText = await extractTextFromUpload(req.file.buffer, req.file.mimetype, req.file.originalname);
    } else if (req.body.resumeText && req.body.resumeText.trim()) {
      extractedText = req.body.resumeText.trim();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a PDF/TXT file upload or paste your resume text.'
      });
    }

    if (!extractedText || extractedText.trim().length < 30) {
      return res.status(400).json({
        success: false,
        message: 'Extracted resume text is too brief or could not be read. Please check your document.'
      });
    }

    const targetRole = req.body.targetRole || '';
    const jobDescription = req.body.jobDescription || '';

    // Convert extracted text into basic mock resume structure for auditing
    const lines = extractedText.split('\n').map(l => l.trim()).filter(Boolean);
    const mockResume = {
      personal_info: {
        fullName: lines[0] || 'Candidate',
        email: (extractedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) || [])[0] || '',
        phone: (extractedText.match(/(\+?\d[\d -]{8,}\d)/) || [])[0] || '',
        location: (extractedText.match(/(Bengaluru|Bangalore|Delhi|Mumbai|Hyderabad|Pune|Chennai|Remote|India|USA)/i) || [])[0] || '',
        linkedin: (extractedText.match(/linkedin\.com\/[^\s)]+/) || [])[0] || '',
        github: (extractedText.match(/github\.com\/[^\s)]+/) || [])[0] || ''
      },
      summary: lines.slice(1, 4).join(' '),
      education: /b\.?tech|bachelor|master|degree|university|college|gpa|cgpa/i.test(extractedText) ? [{ institution: 'Recognized University', degree: 'Degree' }] : [],
      skills: extractKeywords(extractedText),
      projects: /project|engineered|built|architected/i.test(extractedText) ? [{ title: 'Technical Projects', bullets: lines.filter(l => l.startsWith('•') || l.startsWith('-') || l.length > 30).slice(0, 5) }] : [],
      experience: /intern|experience|engineer|developer/i.test(extractedText) ? [{ company: 'Industry Experience', bullets: lines.filter(l => l.length > 40).slice(0, 3) }] : []
    };

    const audit = auditResume(mockResume, targetRole, jobDescription);
    const skillsIdentified = extractKeywords(extractedText).map(formatKeyword);

    const savedAnalysis = await createResumeAnalysis({
      userId: req.user.id,
      resumeId: req.body.resumeId ? parseInt(req.body.resumeId, 10) : null,
      resumeTitle,
      targetRole: targetRole || 'General Engineering Role',
      jobDescription,
      score: audit.score,
      breakdown: audit.breakdown,
      skillsIdentified,
      matchingKeywords: audit.matchingKeywords,
      missingKeywords: audit.missingKeywords,
      suggestions: audit.suggestions,
      extractedText: extractedText.slice(0, 10000) // cap stored text
    });

    res.status(201).json({
      success: true,
      analysis: savedAnalysis,
      audit
    });
  } catch (err) {
    if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
});

// DELETE /api/career/analyses/:id (Delete analysis record)
router.delete('/analyses/:id', async (req, res, next) => {
  try {
    const success = await deleteResumeAnalysis(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Analysis not found or access denied.' });
    }
    res.json({ success: true, message: 'Analysis record deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. INTERNSHIP COMPATIBILITY MATCHING
// ==========================================

// GET /api/career/internship-matches (Calculate explainable compatibility score)
router.get('/internship-matches', async (req, res, next) => {
  try {
    const profile = await getStudentProfile(req.user.id);
    const resumes = await getResumesByUserId(req.user.id);
    const internships = await getInternships({ verificationStatus: 'verified' }, req.user.id);

    // Aggregate student skills from profile and active resumes
    const studentSkillSet = new Set();
    if (profile && profile.skills) {
      profile.skills.split(',').forEach(s => {
        if (s.trim()) studentSkillSet.add(s.trim().toLowerCase());
      });
    }
    resumes.forEach(r => {
      const skills = r.skills || {};
      if (Array.isArray(skills)) {
        skills.forEach(s => studentSkillSet.add(s.toLowerCase()));
      } else if (typeof skills === 'object') {
        Object.values(skills).forEach(val => {
          if (Array.isArray(val)) val.forEach(s => studentSkillSet.add(s.toLowerCase()));
        });
      }
    });

    const studentDegree = (profile?.degree || '').toLowerCase();
    const studentGradYear = profile?.graduation_year || 2026;

    const matches = internships.map(internship => {
      const reqText = `${internship.requirements || ''} ${internship.description || ''} ${internship.category || ''}`;
      const neededKeywords = extractKeywords(reqText);

      const matchingSkills = [];
      const skillsToImprove = [];

      neededKeywords.forEach(kw => {
        let hasSkill = false;
        studentSkillSet.forEach(studentSkill => {
          if (studentSkill.includes(kw) || kw.includes(studentSkill)) {
            hasSkill = true;
          }
        });
        if (hasSkill) {
          matchingSkills.push(formatKeyword(kw));
        } else {
          skillsToImprove.push(formatKeyword(kw));
        }
      });

      // Match score calculation
      let score = 50; // base score
      if (neededKeywords.length > 0) {
        const skillRatio = matchingSkills.length / neededKeywords.length;
        score = Math.round(30 + skillRatio * 50); // 30 - 80 from skills
      }

      // Eligibility bonus/penalty
      const isEligibleDegree = !internship.requirements.toLowerCase().includes('b.tech') || studentDegree.includes('bachelor') || studentDegree.includes('b.tech') || studentDegree.includes('engineering');
      if (isEligibleDegree) score += 10;
      else score -= 10;

      // Graduation year check
      const isGradEligible = studentGradYear >= 2025 && studentGradYear <= 2027;
      if (isGradEligible) score += 10;

      score = Math.min(98, Math.max(25, score));

      let matchTier = 'Growth Opportunity';
      if (score >= 85) matchTier = 'Strong Match';
      else if (score >= 65) matchTier = 'Good Match';
      else if (score >= 45) matchTier = 'Moderate Match';

      return {
        internship,
        score,
        matchTier,
        matchingSkills: Array.from(new Set(matchingSkills)),
        skillsToImprove: Array.from(new Set(skillsToImprove)),
        eligibility: {
          degreeMatch: isEligibleDegree,
          gradYearMatch: isGradEligible,
          locationPreference: internship.work_type === 'remote' ? 'Remote Friendly' : internship.location
        },
        explanation: `Matches ${matchingSkills.length} of ${neededKeywords.length} required skill areas. Candidate has verified background matching ${internship.work_type} requirements.`
      };
    }).sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      count: matches.length,
      matches,
      disclaimer: 'Compatibility scores are calculated from profile criteria and listed requirements. Match scores represent alignment and do not constitute an interview guarantee or probability of selection.'
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 4. PLACEMENT PREPARATION HUB
// ==========================================

// GET /api/career/placement-tasks
router.get('/placement-tasks', async (req, res, next) => {
  try {
    const { category } = req.query;
    const result = await getPlacementTasks(req.user.id, { category });
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/career/placement-tasks (Add task)
router.post('/placement-tasks', async (req, res, next) => {
  try {
    const { category, title, description, priority, deadline } = req.body;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: 'Task category is required.' });
    }

    const task = await createPlacementTask({
      userId: req.user.id,
      category,
      title,
      description,
      priority,
      deadline: deadline || null
    });

    res.status(201).json({
      success: true,
      message: 'Placement task added.',
      task
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/career/placement-tasks/:id/toggle (Toggle complete)
router.patch('/placement-tasks/:id/toggle', async (req, res, next) => {
  try {
    const task = await togglePlacementTask(req.params.id, req.user.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }
    res.json({
      success: true,
      task
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/career/placement-tasks/:id (Update task)
router.put('/placement-tasks/:id', async (req, res, next) => {
  try {
    const updated = await updatePlacementTask(req.params.id, req.user.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }
    res.json({
      success: true,
      task: updated
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/career/placement-tasks/:id (Delete task)
router.delete('/placement-tasks/:id', async (req, res, next) => {
  try {
    const success = await deletePlacementTask(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }
    res.json({
      success: true,
      message: 'Task removed.'
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 5. SKILLS AND CERTIFICATIONS
// ==========================================

// GET /api/career/certifications
router.get('/certifications', async (req, res, next) => {
  try {
    const certifications = await getStudentCertifications(req.user.id);
    res.json({
      success: true,
      certifications
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/career/certifications
router.post('/certifications', async (req, res, next) => {
  try {
    const { title, provider, skill_name, skill_level, status, target_date, completed_date, credential_url } = req.body;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Certification / course title is required.' });
    }

    const cert = await createStudentCertification({
      userId: req.user.id,
      title,
      provider: provider || '',
      skill_name: skill_name || '',
      skill_level: skill_level || 'Intermediate',
      status: status || 'In Progress',
      target_date: target_date || null,
      completed_date: completed_date || null,
      credential_url: credential_url || ''
    });

    res.status(201).json({
      success: true,
      message: 'Certification / skill goal recorded.',
      certification: cert
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/career/certifications/:id
router.put('/certifications/:id', async (req, res, next) => {
  try {
    const cert = await updateStudentCertification(req.params.id, req.user.id, req.body);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certification not found or access denied.' });
    }
    res.json({
      success: true,
      certification: cert
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/career/certifications/:id
router.delete('/certifications/:id', async (req, res, next) => {
  try {
    const success = await deleteStudentCertification(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Certification not found or access denied.' });
    }
    res.json({
      success: true,
      message: 'Certification removed.'
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 6. INTERVIEW PRACTICE
// ==========================================

// Predefined deterministic question catalog covering all required role categories
const DEFAULT_QUESTIONS = [
  // HR & Behavioral
  {
    id: 'hr_1',
    category: 'hr',
    role: 'General / All Roles',
    questionText: 'Tell me about a time you faced an unexpected technical challenge right before a deadline. How did you handle it?',
    modelAnswer: 'Use the STAR format: Explain the Situation (e.g. hackathon or course demo), Task, Action (systematic debugging, root-cause analysis, isolating breaking change), and Result (clean deployment, zero downtime, and post-mortem lessons).',
    evaluationCriteria: ['Clear STAR structure', 'Calm composure under pressure', 'Emphasis on team communication']
  },
  {
    id: 'hr_2',
    category: 'hr',
    role: 'General / All Roles',
    questionText: 'Why do you want to join our internship program, and what unique perspective do you bring to our team?',
    modelAnswer: 'Highlight specific products/initiatives of the company, align your demonstrated technical stack with their engineering goals, and express eagerness to learn in production environments.',
    evaluationCriteria: ['Company awareness', 'Concrete motivation', 'Constructive humility and eagerness to learn']
  },
  {
    id: 'hr_3',
    category: 'hr',
    role: 'General / All Roles',
    questionText: 'Describe a situation where you had a technical disagreement with a teammate. How was it resolved?',
    modelAnswer: 'Focus on objective decision-making: rather than personal opinions, describe writing small proof-of-concept benchmarks or consulting documentation to arrive at consensus together.',
    evaluationCriteria: ['Ego-free collaboration', 'Data-driven decision making', 'Empathy for peer viewpoints']
  },
  // Technical: Frontend
  {
    id: 'tech_fe_1',
    category: 'technical',
    role: 'Frontend Developer',
    questionText: 'Explain the React Virtual DOM, reconciliation, and how the `key` prop prevents unnecessary re-renders in dynamic lists.',
    modelAnswer: 'The Virtual DOM is an in-memory lightweight representation of the actual DOM. React uses a diffing algorithm (Reconciliation) to calculate the minimal DOM mutations. Keys give elements stable identities across renders so React avoids re-mounting intact sibling nodes.',
    evaluationCriteria: ['Distinction between reconciliation and re-rendering', 'Proper explanation of key stability', 'Performance implications']
  },
  {
    id: 'tech_fe_2',
    category: 'technical',
    role: 'Frontend Developer',
    questionText: 'What strategies do you employ to optimize Core Web Vitals (LCP, FID/INP, CLS) in a modern web application?',
    modelAnswer: 'Preload critical fonts and hero images for LCP; code-split routes using dynamic imports to minimize main thread blocking for INP; provide explicit width/height dimensions on image containers to avoid layout shift (CLS).',
    evaluationCriteria: ['Explicit mention of the three vitals', 'Actionable remediation steps', 'Understanding of browser rendering cycle']
  },
  // Technical: Backend & Databases
  {
    id: 'tech_be_1',
    category: 'technical',
    role: 'Backend Developer',
    questionText: 'Explain the difference between clustered and non-clustered indexes in MySQL/PostgreSQL. When would indexing hurt performance?',
    modelAnswer: 'A clustered index determines the physical order of rows in the table (usually the primary key). Non-clustered indexes are secondary search trees storing pointers to the clustered row. Indexing can degrade write/insert/update throughput because every write requires updating the B-Tree.',
    evaluationCriteria: ['Physical vs logical row ordering', 'B-Tree mechanics', 'Write amplification awareness']
  },
  {
    id: 'tech_be_2',
    category: 'technical',
    role: 'Backend Developer',
    questionText: 'How do you prevent SQL Injection and Cross-Site Scripting (XSS) in an Express and SQL architecture?',
    modelAnswer: 'For SQL Injection, strictly use parameterized queries (prepared statements) rather than string concatenation. For XSS, sanitize user input, encode dynamic HTML output, use modern frameworks that auto-escape (React), and configure HTTP-only cookies and Content Security Policy headers.',
    evaluationCriteria: ['Parameterized queries', 'Context-aware output encoding', 'HTTP-only cookies and CSP']
  },
  // Project Explanation
  {
    id: 'proj_1',
    category: 'project',
    role: 'All Engineering Roles',
    questionText: 'Walk me through the system architecture of your proudest technical project. What was the most difficult architectural tradeoff you made?',
    modelAnswer: 'State the problem solved, high-level client-server-database topology, scaling bottlenecks encountered, and the specific tradeoff made (e.g. choosing eventual consistency over strict locks for higher read throughput).',
    evaluationCriteria: ['Clear architectural diagramming verbally', 'Honest acknowledgment of tradeoffs', 'Measurable outcomes']
  },
  // Resume-Based Deep Dive
  {
    id: 'resume_1',
    category: 'resume',
    role: 'All Roles',
    questionText: 'Pick an item from your resume achievements or experience where something did not go as planned. What would you do differently today?',
    modelAnswer: 'Be transparent: describe an initial assumption that proved flawed (e.g. schema rigidity or missing error handling), what failed, how you stabilized the system, and how you now apply automated unit tests or monitoring.',
    evaluationCriteria: ['Self-awareness and accountability', 'Learning orientation', 'Actionable engineering maturity']
  }
];

// GET /api/career/interview-practice
router.get('/interview-practice', async (req, res, next) => {
  try {
    const userRecords = await getInterviewPractice(req.user.id);
    const recordsMap = new Map();
    userRecords.forEach(r => recordsMap.set(r.question_id, r));

    const enriched = DEFAULT_QUESTIONS.map(q => {
      const record = recordsMap.get(q.id);
      return {
        ...q,
        is_practiced: record ? Boolean(record.is_practiced) : false,
        user_answer: record ? record.user_answer : '',
        notes: record ? record.notes : '',
        practiced_at: record ? record.practiced_at : null
      };
    });

    const practicedCount = enriched.filter(q => q.is_practiced).length;
    res.json({
      success: true,
      totalQuestions: enriched.length,
      practicedCount,
      progressPercentage: Math.round((practicedCount / enriched.length) * 100),
      questions: enriched
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/career/interview-practice (Record practiced answer)
router.post('/interview-practice', async (req, res, next) => {
  try {
    const { questionId, category, questionText, userAnswer, notes, isPracticed } = req.body;
    if (!questionId) {
      return res.status(400).json({ success: false, message: 'Question ID is required.' });
    }

    const saved = await saveInterviewPractice({
      userId: req.user.id,
      questionId,
      category: category || 'technical',
      questionText: questionText || '',
      userAnswer: userAnswer || '',
      notes: notes || '',
      isPracticed: isPracticed !== undefined ? Boolean(isPracticed) : true
    });

    res.json({
      success: true,
      message: 'Interview response saved.',
      record: saved
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 7. APPLICATION DOCUMENT VAULT
// ==========================================

// GET /api/career/vault (List documents)
router.get('/vault', async (req, res, next) => {
  try {
    const documents = await getVaultDocuments(req.user.id);
    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/career/vault (Upload document or save external link)
router.post('/vault', uploadVault.single('vaultFile'), async (req, res, next) => {
  try {
    const { name, documentType, notes, applicationId, externalUrl } = req.body;
    const docName = (name || req.file?.originalname || 'Career Document').trim();

    let fileUrl = externalUrl || '';
    let fileSize = 0;
    let mimeType = 'application/octet-stream';

    if (req.file) {
      fileUrl = `/uploads/vault/${req.file.filename}`;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;
    }

    if (!fileUrl && !notes) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a document file upload, a link URL, or document notes.'
      });
    }

    const doc = await createVaultDocument({
      userId: req.user.id,
      name: docName,
      documentType: documentType || 'resume',
      fileUrl,
      fileSize,
      mimeType,
      applicationId: applicationId ? parseInt(applicationId, 10) : null,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Document securely vaulted.',
      document: doc
    });
  } catch (err) {
    if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
});

// DELETE /api/career/vault/:id (Delete document with ownership check)
router.delete('/vault/:id', async (req, res, next) => {
  try {
    const success = await deleteVaultDocument(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }
    res.json({
      success: true,
      message: 'Document deleted from vault.'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
