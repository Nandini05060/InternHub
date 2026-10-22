import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('InternHub Authentication API & Login Test Cases', () => {
  beforeEach(async () => {
    // Reset any lockout state before each test
    await request(app).post('/api/auth/reset-lockout');
  });

  it('TC_LGN_01: Successful login with valid credentials (testuser@email.com / Pass123!)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@email.com',
        password: 'Pass123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('testuser@email.com');
    expect(res.body.user.role).toBe('student');
  });

  it('TC_LGN_03: Unregistered username rejection with generic error message', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'fakeuser@test.com',
        password: 'Pass123!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password.');
    expect(res.body.token).toBeUndefined();
  });

  it('TC_LGN_04: Incorrect password rejection with generic error message', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@email.com',
        password: 'WrongPass!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password.');
    expect(res.body.token).toBeUndefined();
  });

  it('TC_LGN_05: Empty fields and invalid email format validation', async () => {
    // 1. Completely blank fields
    const emptyRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: '',
        password: ''
      });

    expect(emptyRes.status).toBe(400);
    expect(emptyRes.body.success).toBe(false);
    expect(emptyRes.body.message).toMatch(/email.*required/i);
    expect(emptyRes.body.message).toMatch(/password.*required/i);

    // 2. Invalid email format
    const invalidFormatRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
        password: 'Pass123!'
      });

    expect(invalidFormatRes.status).toBe(400);
    expect(invalidFormatRes.body.success).toBe(false);
    expect(invalidFormatRes.body.message).toMatch(/valid email/i);
  });

  it('TC_LGN_06: 5 consecutive failed attempts trigger 15-minute server lockout', async () => {
    const targetEmail = 'testuser@email.com';

    // Ensure clean state
    await request(app).post('/api/auth/reset-lockout').send({ email: targetEmail });

    // 4 failed attempts: return 401
    for (let i = 1; i <= 4; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: targetEmail, password: 'BadPassword999' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password.');
    }

    // 5th failed attempt: triggers 15-min lockout (HTTP 423)
    const lockRes = await request(app)
      .post('/api/auth/login')
      .send({ email: targetEmail, password: 'BadPassword999' });

    expect(lockRes.status).toBe(423);
    expect(lockRes.body.locked).toBe(true);
    expect(lockRes.body.message).toBe('Account locked for 15 minutes due to too many failed attempts.');

    // Attempt during lockout even with CORRECT password: still rejected
    const blockedRes = await request(app)
      .post('/api/auth/login')
      .send({ email: targetEmail, password: 'Pass123!' });

    expect(blockedRes.status).toBe(423);
    expect(blockedRes.body.locked).toBe(true);
    expect(blockedRes.body.message).toBe('Account locked for 15 minutes due to too many failed attempts.');

    // Controllable clock test: Advance clock by 16 minutes (960,000 ms) via header
    const futureTime = new Date(Date.now() + 16 * 60 * 1000).toISOString();
    const futureRes = await request(app)
      .post('/api/auth/login')
      .set('x-mock-time', futureTime)
      .send({ email: targetEmail, password: 'Pass123!' });

    expect(futureRes.status).toBe(200);
    expect(futureRes.body.success).toBe(true);
    expect(futureRes.body.token).toBeDefined();
  });

  it('should successfully register a student with valid password', async () => {
    const newEmail = `reg_student_${Date.now()}@college.edu`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sarah Connor',
        email: newEmail,
        password: 'SecurePass@123'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(newEmail);
  });

  it('should reject registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Student',
        email: 'student@internhub.com',
        password: 'ValidPass@123'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when accessing protected /api/auth/me without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should block suspended/blocked student accounts from logging in', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rohan.verma@college.edu',
        password: 'Student@123'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/suspended by an administrator/i);
  });
});
