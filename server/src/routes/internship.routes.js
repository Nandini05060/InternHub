import { Router } from 'express';
import {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
  verifyInternship,
  toggleExpiredInternship
} from '../db/repository.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { validateInternship } from '../middleware/validator.js';

const router = Router();

// GET /api/internships (Discovery with search, filter, sort)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { search, category, workType, status, isExpired, sort, all } = req.query;
    const isAdmin = req.user && req.user.role === 'admin';

    // By default for students and guests, only show verified and active (not expired) listings
    let filterStatus = status;
    let filterExpired = isExpired;

    if (!isAdmin && all !== 'true') {
      filterStatus = 'verified';
      filterExpired = 'false';
    }

    const internships = await getInternships({
      search,
      category,
      workType,
      status: filterStatus,
      isExpired: filterExpired,
      sort,
      userId: req.user ? req.user.id : null
    });

    res.json({
      success: true,
      count: internships.length,
      internships
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/internships/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const internship = await getInternshipById(req.params.id, req.user ? req.user.id : null);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship listing not found.'
      });
    }

    res.json({
      success: true,
      internship
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/internships (Admin only)
router.post('/', authenticateToken, requireAdmin, validateInternship, async (req, res, next) => {
  try {
    const newInternship = await createInternship(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Internship listing published successfully!',
      internship: newInternship
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/internships/:id (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const updated = await updateInternship(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found.'
      });
    }

    res.json({
      success: true,
      message: 'Internship listing updated successfully!',
      internship: updated
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/internships/:id (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const result = await deleteInternship(req.params.id);
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message || 'Internship not found.'
      });
    }

    res.json({
      success: true,
      message: 'Internship listing removed successfully.'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/internships/:id/verify (Admin only)
router.patch('/:id/verify', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    if (!status || !['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be verified, rejected, or pending.'
      });
    }

    const updated = await verifyInternship(req.params.id, status);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found.'
      });
    }

    res.json({
      success: true,
      message: `Internship status updated to ${status}.`,
      internship: updated
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/internships/:id/toggle-expired (Admin only)
router.patch('/:id/toggle-expired', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { is_expired } = req.body;
    const updated = await toggleExpiredInternship(req.params.id, !!is_expired);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found.'
      });
    }

    res.json({
      success: true,
      message: updated.is_expired ? 'Listing marked as expired.' : 'Listing marked as active.',
      internship: updated
    });
  } catch (error) {
    next(error);
  }
});

export default router;
