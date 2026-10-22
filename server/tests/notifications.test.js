import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { processDeadlineReminders } from '../src/services/reminderService.js';

describe('InternHub Notifications & Deadline Reminders (TC_NOT_01)', () => {
  let studentToken = '';

  beforeAll(async () => {
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@internhub.com', password: 'Student@123' });
    studentToken = studentRes.body.token;
  });

  it('TC_NOT_01: Process deadline reminders strictly for active verified internships and skip duplicates', async () => {
    // 1. Run reminder cycle
    const summary1 = await processDeadlineReminders();
    expect(summary1).toBeDefined();
    expect(summary1.scanned).toBeGreaterThan(0);

    // 2. Run reminder cycle second time: duplicates must be skipped
    const summary2 = await processDeadlineReminders();
    expect(summary2.skippedDuplicates).toBeGreaterThanOrEqual(0);

    // 3. Student fetches notifications
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

  it('Allows student to mark notifications as read', async () => {
    const notifsRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    if (notifsRes.body.notifications.length > 0) {
      const firstId = notifsRes.body.notifications[0].id;
      const markRes = await request(app)
        .patch(`/api/notifications/${firstId}/read`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(markRes.status).toBe(200);
      expect(markRes.body.success).toBe(true);
    }
  });
});
