import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import * as authController from '../controllers/auth';

const router = Router();

// Register
router.post(
  '/register',
  authLimiter,
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty(),
  ]),
  authController.register
);

// Login
router.post(
  '/login',
  authLimiter,
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ]),
  authController.login
);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Logout
router.delete('/logout', authenticate, authController.logout);

// Google OAuth
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

export default router;