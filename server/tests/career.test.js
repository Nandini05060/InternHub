import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('InternHub Career Intelligence & Resume Builder API (TC_CAR_01 - 13)', () => {
  let alexToken = ''; // user_id: 2
  let priyaToken = ''; // user_id: 3
  let createdResumeId = null;
  let createdTaskId = null;
  let createdCertId = null;
  let createdDocId = null;

  beforeAll(async () => {
    // Login as Alex Sharma (student@internhub.com)
    const alexRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@internhub.com', password: 'Student@123' });
    alexToken = alexRes.body.token;

    // Login as Priya Patel (priya.patel@student.edu)
    const priyaRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya.patel@student.edu', password: 'Student@123' });
    priyaToken = priyaRes.body.token;
  });

  // TC_CAR_01: Required-field validation on resume creation
  it('TC_CAR_01: Rejects resume creation when mandatory title is missing or empty', async () => {
    const res = await request(app)
      .post('/api/career/resumes')
      .set('Authorization', `Bearer ${alexToken}`)
      .send({ title: '', target_role: 'Full Stack Engineer' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/resume title is required/i);
  });

  // TC_CAR_02: Creating a new resume with ATS quality audit
  it('TC_CAR_02: Successfully creates a new resume and computes initial ATS quality score', async () => {
    const newResume = {
      title: 'DevOps & Cloud Engineer Resume',
      target_role: 'Cloud Engineer',
      target_company: 'Amazon AWS',
      template_id: 'software_dev',
      personal_info: {
        fullName: 'Alex Sharma',
        email: 'student@internhub.com',
        phone: '+91 98765 43210',
        location: 'Bengaluru, India',
        linkedin: 'https://linkedin.com/in/alexsharma',
        github: 'https://github.com/alexsharma'
      },
      summary: 'Results-oriented final year student with strong foundation in Docker, Kubernetes, and AWS infrastructure.',
      education: [
        {
          id: 'edu-test-1',
          institution: 'University Institute of Technology',
          degree: 'Bachelor of Engineering',
          fieldOfStudy: 'Computer Science',
          startDate: '2022',
          endDate: '2026',
          gpa: '8.8 / 10.0'
        }
      ],
      experience: [
        {
          id: 'exp-test-1',
          company: 'ZetaTech Labs',
          role: 'DevOps Intern',
          startDate: 'Jun 2024',
          endDate: 'Aug 2024',
          bullets: [
            'Architected automated CI/CD pipeline using GitHub Actions, reducing release time by 45%.',
            'Deployed Kubernetes clusters on AWS EKS managing 20+ containerized microservices.'
          ]
        }
      ],
      projects: [
        {
          id: 'proj-test-1',
          title: 'AutoCloud Deployer',
          techStack: 'Docker, AWS, Node.js',
          bullets: [
            'Engineered CLI deployment orchestrator processing 100+ deployments with 99.9% uptime.'
          ]
        }
      ],
      skills: {
        languages: ['Go', 'Python', 'JavaScript'],
        tools: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Git']
      }
    };

    const res = await request(app)
      .post('/api/career/resumes')
      .set('Authorization', `Bearer ${alexToken}`)
      .send(newResume);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.resume.title).toBe('DevOps & Cloud Engineer Resume');
    expect(res.body.resume.quality_score).toBeGreaterThan(60);
    expect(res.body.audit).toBeDefined();
    createdResumeId = res.body.resume.id;
  });

  // TC_CAR_03: Editing an existing resume & recalculating quality score
  it('TC_CAR_03: Edits resume content and recomputes updated quality audit', async () => {
    const updates = {
      summary: 'Senior undergraduate engineer specializing in cloud-native microservices, containerization, and AWS serverless computing.',
      quality_score: 95
    };

    const res = await request(app)
      .put(`/api/career/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${alexToken}`)
      .send(updates);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.resume.summary).toBe(updates.summary);
    expect(res.body.audit).toBeDefined();
  });

  // TC_CAR_04: Resume ownership and access control
  it('TC_CAR_04: Enforces strict resume ownership — student B cannot access or modify student A\'s resume', async () => {
    // Priya tries to read Alex's resume
    const readRes = await request(app)
      .get(`/api/career/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${priyaToken}`);

    expect(readRes.status).toBe(404);
    expect(readRes.body.success).toBe(false);

    // Priya tries to update Alex's resume
    const updateRes = await request(app)
      .put(`/api/career/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({ title: 'Hacked Title' });

    expect(updateRes.status).toBe(404);
    expect(updateRes.body.success).toBe(false);

    // Priya tries to delete Alex's resume
    const deleteRes = await request(app)
      .delete(`/api/career/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${priyaToken}`);

    expect(deleteRes.status).toBe(404);
    expect(deleteRes.body.success).toBe(false);
  });

  // TC_CAR_05: Resume version duplication
  it('TC_CAR_05: Duplicates a resume version preserving all sections with a copy suffix', async () => {
    const res = await request(app)
      .post(`/api/career/resumes/${createdResumeId}/duplicate`)
      .set('Authorization', `Bearer ${alexToken}`)
      .send({ newTitle: 'DevOps Resume — Version 2' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.resume.title).toBe('DevOps Resume — Version 2');
    expect(res.body.resume.id).not.toBe(createdResumeId);
  });

  // TC_CAR_06: Job description keyword analysis & tailoring recommendations
  it('TC_CAR_06: Audits resume against target job description and identifies matching and missing keywords', async () => {
    const jobDescription = 'Looking for a Cloud Engineer with hands-on experience in AWS, Docker, Kubernetes, Linux, Terraform, and Python. Experience with CI/CD is required.';

    const res = await request(app)
      .post('/api/career/resumes/check-quality')
      .set('Authorization', `Bearer ${alexToken}`)
      .send({
        resume: {
          personal_info: { fullName: 'Alex Sharma', email: 'alex@example.com', phone: '+91 9999999999', location: 'Bengaluru' },
          summary: 'Cloud Enthusiast',
          education: [{ institution: 'UIT', degree: 'B.Tech' }],
          skills: { tools: ['Docker', 'AWS', 'Git'] },
          projects: [{ title: 'Cloud Deploy', bullets: ['Engineered Docker container pipelines.'] }]
        },
        targetRole: 'Cloud Engineer',
        jobDescription
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.audit.matchingKeywords).toContain('Docker');
    expect(res.body.audit.matchingKeywords).toContain('AWS');
    expect(res.body.audit.missingKeywords).toContain('Kubernetes');
    expect(res.body.audit.suggestions.length).toBeGreaterThan(0);
    expect(res.body.audit.disclaimer).toMatch(/guarantee interview calls/i);
  });


  // TC_CAR_07: File upload validation for resume analyzer
  it('TC_CAR_07: Rejects unsupported file formats (e.g. .exe or .zip) for resume analysis', async () => {
    const res = await request(app)
      .post('/api/career/analyses/analyze')
      .set('Authorization', `Bearer ${alexToken}`)
      .attach('resumeFile', Buffer.from('malicious binary content'), 'malware.exe');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/only pdf and txt/i);
  });

  // TC_CAR_08: Plain text resume analysis execution
  it('TC_CAR_08: Successfully analyzes pasted resume text and generates actionable audit breakdown', async () => {
    const sampleResumeText = `
Alex Sharma
student@internhub.com | +91 98765 43210 | Bengaluru, India
linkedin.com/in/alexsharma | github.com/alexsharma

Summary:
Computer Science undergraduate proficient in React, Node.js, and SQL. Built high-traffic web applications with automated unit tests.

Education:
University Institute of Technology — B.Tech in Computer Science and Engineering (CGPA: 8.85)

Projects:
DevConnect — Developer Portfolio Platform
• Architected RESTful APIs using Express and Node.js with sub-30ms latency.
• Engineered responsive user interface with React and Tailwind CSS.

Skills:
React, Node.js, Express, JavaScript, TypeScript, SQL, Git, Docker
    `;

    const res = await request(app)
      .post('/api/career/analyses/analyze')
      .set('Authorization', `Bearer ${alexToken}`)
      .send({
        resumeText: sampleResumeText,
        targetRole: 'Full Stack Developer',
        jobDescription: 'Seeking Full Stack Intern with React, Node.js, Express, and SQL.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.analysis.score).toBeGreaterThan(65);
    expect(res.body.analysis.skills_identified).toContain('React.js');
    expect(res.body.analysis.matching_keywords).toContain('React.js');
  });

  // TC_CAR_09: Internship compatibility matching
  it('TC_CAR_09: Computes explainable internship compatibility scores and matching skills', async () => {
    const res = await request(app)
      .get('/api/career/internship-matches')
      .set('Authorization', `Bearer ${alexToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.matches)).toBe(true);
    expect(res.body.matches.length).toBeGreaterThan(0);

    const firstMatch = res.body.matches[0];
    expect(firstMatch.score).toBeGreaterThanOrEqual(25);
    expect(firstMatch.score).toBeLessThanOrEqual(98);
    expect(firstMatch.matchTier).toBeDefined();
    expect(firstMatch.explanation).toBeDefined();
    expect(res.body.disclaimer).toMatch(/compatibility scores are calculated/i);
  });

  // TC_CAR_10: Placement task persistence and completion toggling
  it('TC_CAR_10: Adds placement preparation task and toggles completion status', async () => {
    // Add task
    const addRes = await request(app)
      .post('/api/career/placement-tasks')
      .set('Authorization', `Bearer ${alexToken}`)
      .send({
        category: 'DSA',
        title: 'Master Graph Topological Sort',
        description: 'Implement Kahn\'s Algorithm and DFS cycle detection',
        priority: 'high',
        deadline: '2026-11-20'
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.success).toBe(true);
    expect(addRes.body.task.is_completed).toBe(false);
    createdTaskId = addRes.body.task.id;

    // Toggle complete
    const toggleRes = await request(app)
      .patch(`/api/career/placement-tasks/${createdTaskId}/toggle`)
      .set('Authorization', `Bearer ${alexToken}`);

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.success).toBe(true);
    expect(toggleRes.body.task.is_completed).toBe(true);
  });

  // TC_CAR_11: Certification status and learning goals tracking
  it('TC_CAR_11: Creates and updates certification learning status', async () => {
    const addRes = await request(app)
      .post('/api/career/certifications')
      .set('Authorization', `Bearer ${alexToken}`)
      .send({
        title: 'Google Cloud Associate Cloud Engineer',
        provider: 'Coursera / Google',
        skill_name: 'GCP',
        skill_level: 'Intermediate',
        status: 'In Progress',
        target_date: '2026-12-01'
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.success).toBe(true);
    createdCertId = addRes.body.certification.id;

    // Update to Completed
    const updateRes = await request(app)
      .put(`/api/career/certifications/${createdCertId}`)
      .set('Authorization', `Bearer ${alexToken}`)
      .send({
        status: 'Completed',
        completed_date: '2026-10-22',
        credential_url: 'https://coursera.org/verify/gcp-ace-123'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.certification.status).toBe('Completed');
    expect(updateRes.body.certification.credential_url).toContain('gcp-ace-123');
  });

  // TC_CAR_12: Document Vault access permissions and ownership protection
  it('TC_CAR_12: Protects private documents in Application Document Vault from unauthorized users', async () => {
    // Alex uploads/vaults a private document link
    const addRes = await request(app)
      .post('/api/career/vault')
      .set('Authorization', `Bearer ${alexToken}`)
      .send({
        name: 'Private_Transcripts_Alex.pdf',
        documentType: 'certificate',
        externalUrl: 'https://vault.internhub.com/private/transcripts.pdf',
        notes: 'Confidential grade sheet.'
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.success).toBe(true);
    createdDocId = addRes.body.document.id;

    // Priya tries to delete Alex's vaulted document
    const deleteRes = await request(app)
      .delete(`/api/career/vault/${createdDocId}`)
      .set('Authorization', `Bearer ${priyaToken}`);

    expect(deleteRes.status).toBe(404);
    expect(deleteRes.body.success).toBe(false);
  });

  // TC_CAR_13: Deleting a resume cleans it up completely
  it('TC_CAR_13: Deletes a resume cleanly and ensures it is no longer returned in user list', async () => {
    const deleteRes = await request(app)
      .delete(`/api/career/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${alexToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const getRes = await request(app)
      .get(`/api/career/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${alexToken}`);

    expect(getRes.status).toBe(404);
  });
});
