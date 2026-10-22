import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('InternHub Admin Management API (TC_ADM_01 - 02 & Security)', () => {
  let adminToken = '';
  let studentToken = '';

  beforeAll(async () => {
    // Admin login
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@internhub.com', password: 'Admin@123' });
    adminToken = adminRes.body.token;

    // Student login
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@internhub.com', password: 'Student@123' });
    studentToken = studentRes.body.token;
  });

  it('TC_SEC_01: Block non-admin students from accessing /api/admin/stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/administrat(or|ive) privileges required/i);
  });

  it('TC_ADM_01: Admin creates new verified internship listing with all mandatory fields', async () => {
    const newInternship = {
      title: 'Distributed Systems Intern',
      company_name: 'Stripe',
      location: 'Bengaluru, India',
      work_type: 'hybrid',
      category: 'Backend',
      stipend: '₹75,000 / month',
      duration: '6 Months',
      application_link: 'https://stripe.com/jobs/intern-distributed-systems',
      deadline: '2026-12-31',
      description: 'Work with core engineering teams on high-availability ledger storage infrastructure.',
      requirements: 'Java or Go, Distributed Systems fundamentals, relational databases, ACID semantics.'
    };

    const res = await request(app)
      .post('/api/internships')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newInternship);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.internship.title).toBe(newInternship.title);
    expect(res.body.internship.verification_status).toBe('verified');
  });

  it('should reject admin internship creation with missing mandatory fields', async () => {
    const res = await request(app)
      .post('/api/internships')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Incomplete Listing'
        // Missing company_name, location, category, stipend, etc.
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Missing required internship fields/i);
  });

  it('TC_ADM_02: Admin blocks and unblocks a student account', async () => {
    // 1. Block student (Alex Sharma - ID 2)
    const blockRes = await request(app)
      .patch('/api/admin/students/2/block')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ is_blocked: true });

    expect(blockRes.status).toBe(200);
    expect(blockRes.body.student.is_blocked).toBe(true);

    // Verify student cannot login while blocked
    const loginAttempt = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@internhub.com', password: 'Student@123' });

    expect(loginAttempt.status).toBe(403);
    expect(loginAttempt.body.message).toMatch(/suspended by an administrator/i);

    // 2. Unblock student
    const unblockRes = await request(app)
      .patch('/api/admin/students/2/block')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ is_blocked: false });

    expect(unblockRes.status).toBe(200);
    expect(unblockRes.body.student.is_blocked).toBe(false);

    // Verify student can now login
    const loginRestored = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@internhub.com', password: 'Student@123' });

    expect(loginRestored.status).toBe(200);
    expect(loginRestored.body.token).toBeDefined();
  });

  it('Admin retrieves platform-wide operational statistics', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.totalInternships).toBeGreaterThan(0);
    expect(res.body.stats.totalStudents).toBeGreaterThan(0);
  });
});
