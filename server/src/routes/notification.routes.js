import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../db/repository.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const notifications = await getUserNotifications(req.user.id);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticateToken, async (req, res, next) => {
  try {
    await markNotificationRead(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticateToken, async (req, res, next) => {
  try {
    await markAllNotificationsRead(req.user.id);
    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/reminders/trigger (Trigger deadline scan)
router.post('/reminders/trigger', authenticateToken, async (req, res, next) => {
  try {
    const { processDeadlineReminders } = await import('../services/reminderService.js');
    const result = await processDeadlineReminders();
    res.json({
      success: true,
      message: 'Deadline reminder cycle executed.',
      summary: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
