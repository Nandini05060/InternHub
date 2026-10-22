import { Router } from 'express';
import { getSavedInternships, saveInternship, unsaveInternship, getInternshipById } from '../db/repository.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/bookmarks (List saved internships for logged-in student)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const saved = await getSavedInternships(req.user.id);
    res.json({
      success: true,
      count: saved.length,
      saved
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/bookmarks/:id (Save an internship)
router.post('/:id', authenticateToken, async (req, res, next) => {
  try {
    const numericId = parseInt(req.params.id, 10);

    // 1. Verify internship exists
    const internship = await getInternshipById(numericId);
    if (!internship) {
      return res.status(404).json({
        success: false,
        code: 'INTERNSHIP_NOT_FOUND',
        message: 'Internship not found. Cannot bookmark nonexistent listing.'
      });
    }

    // 2. Prevent duplicate saved internships
    const savedList = await getSavedInternships(req.user.id);
    const alreadySaved = savedList.some(s => s.id === numericId);
    if (alreadySaved) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_BOOKMARK',
        message: 'Internship is already saved in your bookmarks.'
      });
    }

    const result = await saveInternship(req.user.id, numericId);
    res.json({
      success: true,
      message: 'Internship bookmarked successfully!',
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/bookmarks/:id (Remove saved internship)
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const numericId = parseInt(req.params.id, 10);
    const result = await unsaveInternship(req.user.id, numericId);
    res.json({
      success: true,
      message: 'Internship removed from bookmarks.',
      ...result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
