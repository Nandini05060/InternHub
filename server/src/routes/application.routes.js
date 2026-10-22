import { Router } from 'express';
import {
  getStudentApplications,
  applyOrTrack,
  updateApplicationStatus,
  getApplicationStats,
  createNotification,
  getStudentProfile,
  getInternshipById
} from '../db/repository.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/applications (List student's applications)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const applications = await getStudentApplications(req.user.id);
    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/applications/stats
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const stats = await getApplicationStats(req.user.id);
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/applications/:internshipId (Submit/Track application intent)
router.post('/:internshipId', authenticateToken, async (req, res, next) => {
  try {
    const numericInternshipId = parseInt(req.params.internshipId, 10);
    const { status = 'Applied', appliedDate, notes = '' } = req.body;

    // 1. Enforce profile completion requirements before application
    const profile = await getStudentProfile(req.user.id);
    const isProfileComplete = profile &&
      profile.university && typeof profile.university === 'string' && profile.university.trim().length > 0 &&
      profile.degree && typeof profile.degree === 'string' && profile.degree.trim().length > 0 &&
      profile.graduation_year &&
      profile.skills && typeof profile.skills === 'string' && profile.skills.trim().length > 0;

    if (!isProfileComplete) {
      return res.status(400).json({
        success: false,
        code: 'PROFILE_INCOMPLETE',
        message: 'Profile incomplete. Please complete your college, degree, graduation year, and skills before applying to internships.'
      });
    }

    // 2. Enforce verified & active internship requirements
    const internship = await getInternshipById(numericInternshipId, req.user.id);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship listing not found.'
      });
    }

    if (internship.verification_status !== 'verified') {
      return res.status(400).json({
        success: false,
        code: 'UNVERIFIED_LISTING',
        message: 'Cannot apply to unverified or pending internship listings.'
      });
    }

    const isExpired = internship.is_expired || (internship.deadline && new Date(internship.deadline).getTime() < Date.now());
    if (isExpired) {
      return res.status(400).json({
        success: false,
        code: 'EXPIRED_LISTING',
        message: 'Cannot apply to an expired internship. Applications for this listing are closed.'
      });
    }

    // 3. Prevent duplicate applications
    const existingApps = await getStudentApplications(req.user.id);
    const alreadyApplied = existingApps.some(a => a.internship_id === numericInternshipId);
    if (alreadyApplied) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_APPLICATION',
        message: 'You have already submitted an application for this internship.'
      });
    }

    const application = await applyOrTrack(req.user.id, numericInternshipId, status, appliedDate, notes);

    // Create confirmation notification
    await createNotification({
      userId: req.user.id,
      title: `Application Tracked: ${application.title || 'Internship'}`,
      message: `Status marked as "${status}". Good luck! We will remind you about updates.`,
      type: 'status_update',
      link: '/student/dashboard'
    });

    res.status(201).json({
      success: true,
      message: 'Application recorded and added to your tracker!',
      application
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/applications/:internshipId (Update application stage or notes)
router.patch('/:internshipId', authenticateToken, async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = [
      'Saved',
      'Applied',
      'Under Review',
      'In Review',
      'Interview',
      'Interviewing',
      'Offer',
      'Offered',
      'Rejected',
      'Withdrawn'
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const application = await updateApplicationStatus(req.user.id, req.params.internshipId, status, notes);

    // Create notification when status changes to Interview or Offer
    if (status && (status.includes('Interview') || status.includes('Offer'))) {
      await createNotification({
        userId: req.user.id,
        title: `Stage Update: ${application.title || 'Role'}`,
        message: `Your application status is now updated to "${status}".`,
        type: 'status_update',
        link: '/student/dashboard'
      });
    }

    res.json({
      success: true,
      message: 'Application status updated!',
      application
    });
  } catch (error) {
    next(error);
  }
});

export default router;
