import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendMail } from '../utils/mailer.js';

// Generate a short-lived JWT token for password reset
const generateResetToken = (id) => {
  return jwt.sign({ id, purpose: 'reset' }, process.env.JWT_SECRET, {
    expiresIn: process.env.RESET_PASSWORD_EXPIRES_IN || '1h',
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = (email || '').toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ success: false, message: 'No account found for that email' });

    const token = generateResetToken(user._id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const subject = 'Reset your Aspira password';
    const html = `
      <p>Hi ${user.name || 'there'},</p>
      <p>We received a request to reset your password. Click the link below to set a new password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}">Reset my password</a></p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    `;

    try {
      await sendMail({ to: user.email, subject, html });
      return res.json({ success: true, message: 'Password reset email sent' });
    } catch (mailErr) {
      console.error('Forgot password email failed:', mailErr.message);
      return res.status(500).json({ success: false, message: 'Unable to send password reset email' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Unable to process forgot password request' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ success: false, message: 'Token and new password are required' });

  try {
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    if (payload.purpose !== 'reset' || !payload.id) {
      return res.status(400).json({ success: false, message: 'Invalid reset token' });
    }

    const user = await User.findById(payload.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = password;
    await user.save();

    return res.json({ success: true, message: 'Password has been reset. Please sign in with your new password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Unable to reset password' });
  }
};
