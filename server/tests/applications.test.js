import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('InternHub Applications & Bookmarks API Endpoints', () => {
  let studentToken = '';
  let incompleteStudentToken = '';

  beforeAll(async () => {
    // 1. Login complete student (Alex Sharma - student@internhub.com)
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@internhub.com', password: 'Student@123' });
    studentToken = studentRes.body.token;

    // 2. Register a fresh student without profile completion
    const incompleteEmail = `incomplete_${Date.now()}@college.edu`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Incomplete Candidate',
        email: incompleteEmail,
        password: 'ValidPass@123'
      });
    incompleteStudentToken = regRes.body.token;
  });

  it('should retrieve student application history', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.applications)).toBe(true);
  });

  it('should retrieve application funnel stats', async () => {
    const res = await request(app)
      .get('/api/applications/stats')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalApplications).toBeGreaterThanOrEqual(1);
  });

  it('TC_APP_01: Block applying when student profile is incomplete', async () => {
    const res = await request(app)
      .post('/api/applications/4')
      .set('Authorization', `Bearer ${incompleteStudentToken}`)
      .send({ status: 'Applied' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('PROFILE_INCOMPLETE');
    expect(res.body.message).toMatch(/complete your college, degree, graduation year, and skills/i);
  });

  it('TC_APP_02: Block applying to unverified or pending internship listings', async () => {
    // Internship 9 has verification_status: 'pending'
    const res = await request(app)
      .post('/api/applications/9')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'Applied' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('UNVERIFIED_LISTING');
    expect(res.body.message).toMatch(/cannot apply to unverified or pending/i);
  });

  it('TC_APP_03: Block applying to expired internship listings', async () => {
    // Internship 10 has is_expired: true
    const res = await request(app)
      .post('/api/applications/10')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'Applied' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('EXPIRED_LISTING');
    expect(res.body.message).toMatch(/cannot apply to an expired internship/i);
  });

  it('TC_APP_04: Block duplicate application submissions', async () => {
    // Alex Sharma already applied to internship 1 in seed data
    const res = await request(app)
      .post('/api/applications/1')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'Applied' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('DUPLICATE_APPLICATION');
    expect(res.body.message).toMatch(/already submitted an application/i);
  });

  it('TC_APP_05: Track application status progression and notes', async () => {
    const res = await request(app)
      .patch('/api/applications/1')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        status: 'Interviewing',
        notes: 'Passed initial screening call. Scheduled technical round on Friday.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.application.status).toBe('Interviewing');
  });

  it('TC_BMK_01: Bookmark and unbookmark verified internship', async () => {
    // Save listing 6
    const saveRes = await request(app)
      .post('/api/bookmarks/6')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(saveRes.status).toBe(200);
    expect(saveRes.body.saved).toBe(true);

    // Unsave listing 6
    const unsaveRes = await request(app)
      .delete('/api/bookmarks/6')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(unsaveRes.status).toBe(200);
    expect(unsaveRes.body.saved).toBe(false);
  });

  it('TC_BMK_02: Block duplicate bookmark attempts', async () => {
    // Internship 1 is already in saved list from seed
    const res = await request(app)
      .post('/api/bookmarks/1')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('DUPLICATE_BOOKMARK');
  });

  it('TC_BMK_03: Reject bookmarking nonexistent internship ID', async () => {
    const res = await request(app)
      .post('/api/bookmarks/999999')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('INTERNSHIP_NOT_FOUND');
  });
});
