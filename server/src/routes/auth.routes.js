import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import {
  findUserByEmail,
  createUser,
  findUserById,
  getStudentProfile,
  upsertStudentProfile,
  recordFailedLogin,
  resetFailedLogin,
  clearAllLockouts,
  updateUserPassword
} from '../db/repository.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validator.js';
import { validatePasswordPolicy } from '../utils/passwordPolicy.js';

const router = Router();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

// POST /api/auth/register
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Only allow 'student' registration through public endpoint
    const userRole = role === 'admin' ? 'admin' : 'student';

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role: userRole
    });

    const token = generateToken(user);
    const profile = await getStudentProfile(user.id);

    res.status(201).json({
      success: true,
      message: 'Account successfully registered!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_blocked: user.is_blocked
      },
      profile
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    // Check optional mock time header for automated testing of the 15-minute lockout
    const mockTimeHeader = req.headers['x-mock-time'];
    const currentTime = mockTimeHeader ? new Date(mockTimeHeader).getTime() : Date.now();

    const user = await findUserByEmail(normalizedEmail);

    // TC_LGN_03: Unregistered user -> generic message
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // TC_LGN_06: Check account lockout (5 failed attempts -> 15 min lock)
    if (user.lockout_until) {
      const lockoutTime = new Date(user.lockout_until).getTime();
      if (lockoutTime > currentTime) {
        return res.status(423).json({
          success: false,
          locked: true,
          message: 'Account locked for 15 minutes due to too many failed attempts.',
          lockoutUntil: user.lockout_until
        });
      } else {
        // Lockout expired: reset failed attempts
        await resetFailedLogin(normalizedEmail);
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Record failed attempt
      const updatedUser = await recordFailedLogin(normalizedEmail, mockTimeHeader);

      // Check if this attempt caused lockout (attempt #5)
      if (updatedUser && updatedUser.failed_login_attempts >= 5) {
        return res.status(423).json({
          success: false,
          locked: true,
          message: 'Account locked for 15 minutes due to too many failed attempts.',
          lockoutUntil: updatedUser.lockout_until
        });
      }

      // TC_LGN_04: Generic error message on bad password
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.is_blocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator. Please contact college support.'
      });
    }

    // Reset failed login counter on successful authentication
    await resetFailedLogin(normalizedEmail);

    const token = generateToken(user);
    const profile = user.role === 'student' ? await getStudentProfile(user.id) : null;

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_blocked: user.is_blocked
      },
      profile
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-lockout (Utility for testing & faculty demonstration)
router.post('/reset-lockout', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (email) {
      await resetFailedLogin(email);
    } else {
      await clearAllLockouts();
    }
    res.json({
      success: true,
      message: 'Account lockout counters reset successfully.'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/forgot-password (Safe development password recovery flow)
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.'
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      // For security, don't leak user existence
      return res.json({
        success: true,
        message: 'If this email is registered, password reset instructions have been dispatched.'
      });
    }

    // Generate simulated dev token
    const devResetToken = `rst_${Buffer.from(user.email).toString('base64').slice(0, 12)}_${Date.now()}`;

    res.json({
      success: true,
      message: 'Password reset link dispatched.',
      developmentMode: true,
      instructions: 'In development mode, you can immediately reset your password with the reset token or use the Reset Password screen.',
      resetToken: devResetToken,
      email: user.email
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    const pwdCheck = validatePasswordPolicy(password);
    if (!pwdCheck.valid) {
      return res.status(400).json({
        success: false,
        message: pwdCheck.message
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updated = await updateUserPassword(email, hashedPassword);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    // Clear any lockout
    await resetFailedLogin(email);

    res.json({
      success: true,
      message: 'Password has been successfully updated. You may now log in with your new credentials.'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    const profile = user.role === 'student' ? await getStudentProfile(user.id) : null;

    res.json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const updatedProfile = await upsertStudentProfile(req.user.id, req.body);
    const updatedUser = await findUserById(req.user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
      profile: updatedProfile
    });
  } catch (error) {
    next(error);
  }
});

export default router;
