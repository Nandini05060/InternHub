import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { validatePasswordPolicy } from '../src/utils/passwordPolicy.js';
import { findUserByEmail } from '../src/db/repository.js';
import bcrypt from 'bcryptjs';

/**
 * PHASE 4 — PASSWORD BOUNDARY-VALUE ANALYSIS (BVA)
 * Exact test cases from student specification:
 * Length requirement: 8–15 characters inclusive, with >=1 uppercase, >=1 number, >=1 special character.
 * 
 * TC_PWD_BVA_01: "Ab1!xyz"        (len: 7)  -> Reject
 * TC_PWD_BVA_02: "Ab1!xyzw"       (len: 8)  -> Accept
 * TC_PWD_BVA_03: "Ab1!xyzwa"      (len: 9)  -> Accept
 * TC_PWD_BVA_04: "Ab1!xyzwaBcDeF" (len: 14) -> Accept
 * TC_PWD_BVA_05: "Ab1!xyzwaBcDeFg"(len: 15) -> Accept
 * TC_PWD_BVA_06: "Ab1!xyzwaBcDeFgh"(len: 16)-> Reject
 */

describe('Phase 4: Password Boundary-Value Analysis (TC_PWD_BVA_01 - 06)', () => {
  it('TC_PWD_BVA_01: Reject password with length 7 ("Ab1!xyz")', async () => {
    const password = 'Ab1!xyz';
    expect(password.length).toBe(7);

    // 1. Test validation function
    const policyResult = validatePasswordPolicy(password);
    expect(policyResult.valid).toBe(false);
    expect(policyResult.length).toBe(7);

    // 2. Test backend registration endpoint
    const email = `bva_len7_${Date.now()}@college.edu`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'BVA Tester 1',
        email,
        password
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/between 8 and 15 characters/i);

    // 3. Confirm account was NOT created
    const userInDb = await findUserByEmail(email);
    expect(userInDb).toBeNull();
  });

  it('TC_PWD_BVA_02: Accept password with length 8 ("Ab1!xyzw")', async () => {
    const password = 'Ab1!xyzw';
    expect(password.length).toBe(8);

    // 1. Test validation function
    const policyResult = validatePasswordPolicy(password);
    expect(policyResult.valid).toBe(true);
    expect(policyResult.length).toBe(8);

    // 2. Test backend registration endpoint
    const email = `bva_len8_${Date.now()}@college.edu`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'BVA Tester 2',
        email,
        password
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // 3. Confirm account created and stored as bcrypt hash, not plain text
    const userInDb = await findUserByEmail(email);
    expect(userInDb).not.toBeNull();
    expect(userInDb.password).not.toBe(password);
    expect(userInDb.password.startsWith('$2a$') || userInDb.password.startsWith('$2b$')).toBe(true);
    expect(await bcrypt.compare(password, userInDb.password)).toBe(true);
  });

  it('TC_PWD_BVA_03: Accept password with length 9 ("Ab1!xyzwa")', async () => {
    const password = 'Ab1!xyzwa';
    expect(password.length).toBe(9);

    const policyResult = validatePasswordPolicy(password);
    expect(policyResult.valid).toBe(true);
    expect(policyResult.length).toBe(9);

    const email = `bva_len9_${Date.now()}@college.edu`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'BVA Tester 3',
        email,
        password
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const userInDb = await findUserByEmail(email);
    expect(userInDb).not.toBeNull();
    expect(userInDb.password).not.toBe(password);
    expect(await bcrypt.compare(password, userInDb.password)).toBe(true);
  });

  it('TC_PWD_BVA_04: Accept password with length 14 ("Ab1!xyzwaBcDeF")', async () => {
    const password = 'Ab1!xyzwaBcDeF';
    expect(password.length).toBe(14);

    const policyResult = validatePasswordPolicy(password);
    expect(policyResult.valid).toBe(true);
    expect(policyResult.length).toBe(14);

    const email = `bva_len14_${Date.now()}@college.edu`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'BVA Tester 4',
        email,
        password
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const userInDb = await findUserByEmail(email);
    expect(userInDb).not.toBeNull();
    expect(userInDb.password).not.toBe(password);
    expect(await bcrypt.compare(password, userInDb.password)).toBe(true);
  });

  it('TC_PWD_BVA_05: Accept password with length 15 ("Ab1!xyzwaBcDeFg")', async () => {
    const password = 'Ab1!xyzwaBcDeFg';
    expect(password.length).toBe(15);

    const policyResult = validatePasswordPolicy(password);
    expect(policyResult.valid).toBe(true);
    expect(policyResult.length).toBe(15);

    const email = `bva_len15_${Date.now()}@college.edu`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'BVA Tester 5',
        email,
        password
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const userInDb = await findUserByEmail(email);
    expect(userInDb).not.toBeNull();
    expect(userInDb.password).not.toBe(password);
    expect(await bcrypt.compare(password, userInDb.password)).toBe(true);
  });

  it('TC_PWD_BVA_06: Reject password with length 16 ("Ab1!xyzwaBcDeFgh")', async () => {
    const password = 'Ab1!xyzwaBcDeFgh';
    expect(password.length).toBe(16);

    const policyResult = validatePasswordPolicy(password);
    expect(policyResult.valid).toBe(false);
    expect(policyResult.length).toBe(16);

    const email = `bva_len16_${Date.now()}@college.edu`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'BVA Tester 6',
        email,
        password
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/between 8 and 15 characters/i);

    const userInDb = await findUserByEmail(email);
    expect(userInDb).toBeNull();
  });
});
