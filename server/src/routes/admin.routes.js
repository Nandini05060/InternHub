import { Router } from 'express';
import { getAdminStats, getAllStudents, toggleBlockUser } from '../db/repository.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Apply admin guard to all routes in this router
router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getAdminStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/students (View student accounts and activity)
router.get('/students', async (req, res, next) => {
  try {
    const students = await getAllStudents();
    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/students/:id/block (Block or Unblock student)
router.patch('/students/:id/block', async (req, res, next) => {
  try {
    const { is_blocked } = req.body;
    const result = await toggleBlockUser(req.params.id, !!is_blocked);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found.'
      });
    }

    res.json({
      success: true,
      message: result.is_blocked ? 'Student account suspended.' : 'Student account activated.',
      student: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
