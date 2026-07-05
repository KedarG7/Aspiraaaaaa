import express from 'express';
import { body } from 'express-validator';
import { register, login, sendOtp, verifyOtp, getMe } from '../controllers/authController.js';
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

// OTP endpoints
router.post('/send-otp', [body('email', 'Please include a valid email').isEmail().normalizeEmail(), validateFields], sendOtp);
router.post('/verify-otp', [body('email').isEmail().normalizeEmail(), body('code').isLength({ min: 6, max: 6 }), validateFields], verifyOtp);

export default router;
