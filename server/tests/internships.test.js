import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('InternHub Internships API Endpoints (TC_INT_01, 02, 03)', () => {
  let adminToken = '';
  let studentToken = '';

  beforeAll(async () => {
    // Login as Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@internhub.com', password: 'Admin@123' });
    adminToken = adminRes.body.token;

    // Login as Student
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@internhub.com', password: 'Student@123' });
    studentToken = studentRes.body.token;
  });

  it('TC_INT_01: List and filter verified internships by category and work mode', async () => {
    // Category filter
    const catRes = await request(app).get('/api/internships?category=Frontend');
    expect(catRes.status).toBe(200);
    expect(catRes.body.internships.length).toBeGreaterThan(0);
    expect(catRes.body.internships.every(i => i.category === 'Frontend')).toBe(true);

    // Work type filter
    const workRes = await request(app).get('/api/internships?workType=remote');
    expect(workRes.status).toBe(200);
    expect(workRes.body.internships.length).toBeGreaterThan(0);
    expect(workRes.body.internships.every(i => i.work_type === 'remote')).toBe(true);
  });

  it('TC_INT_02: Unverified listings must NOT appear in public student discovery feed', async () => {
    const res = await request(app).get('/api/internships');
    expect(res.status).toBe(200);

    // Pending internship ID 10 must NOT appear
    const containsPending = res.body.internships.some(
      item => item.id === 10 || item.verification_status !== 'verified'
    );
    expect(containsPending).toBe(false);

    // Every item in student feed must be strictly verified
    res.body.internships.forEach(item => {
      expect(item.verification_status).toBe('verified');
    });
  });

  it('TC_INT_03: Expired listings must NOT appear in public student discovery feed', async () => {
    const res = await request(app).get('/api/internships');
    expect(res.status).toBe(200);

    // Expired internship ID 11 must NOT appear
    const containsExpired = res.body.internships.some(
      item => item.id === 11 || item.is_expired === true
    );
    expect(containsExpired).toBe(false);
  });

  it('TC_ADM_01: Allow admin to create a new verified internship', async () => {
    const newInternship = {
      title: 'Site Reliability Engineering Intern',
      company_name: 'Atlassian',
      location: 'Bengaluru, India',
      work_type: 'hybrid',
      category: 'DevOps & Cloud',
      stipend: '₹55,000 / month',
      duration: '6 Months',
      application_link: 'https://atlassian.com/careers/sre-intern',
      deadline: '2026-12-31',
      description: 'Join Atlassian to build resilient distributed incident management systems.',
      requirements: 'Python, Bash, Linux, understanding of network protocols and observability.'
    };

    const res = await request(app)
      .post('/api/internships')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newInternship);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.internship.title).toBe(newInternship.title);
  });

  it('TC_SEC_01: Block non-admins from creating internships', async () => {
    const res = await request(app)
      .post('/api/internships')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Intern Post',
        company_name: 'Fake Corp'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
