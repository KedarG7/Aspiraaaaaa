import express from 'express';
import { body } from 'express-validator';
import { register, login, sendOtp, verifyOtp, getMe, updateProfile } from '../controllers/authController.js';
import { validateFields } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name', 'Name is required').notEmpty().trim(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    body('role', 'Role must be candidate or employer').isIn(['candidate', 'employer']),
    validateFields,
  ],
  register
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists(),
    validateFields,
  ],
  login
);

router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

// OTP endpoints
router.post('/send-otp', [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('purpose').optional().isIn(['login', 'register']),
  validateFields,
], sendOtp);
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }),
  body('purpose').optional().isIn(['login', 'register']),
  validateFields,
], verifyOtp);

import { forgotPassword, resetPassword } from '../controllers/passwordController.js';

// Password reset endpoints
router.post('/forgot-password', [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  validateFields,
], forgotPassword);

router.post('/reset-password', [
  body('token', 'Reset token is required').exists(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  validateFields,
], resetPassword);

export default router;
