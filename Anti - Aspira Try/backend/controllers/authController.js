import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendMail } from '../utils/mailer.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const normalizedEmail = (email || '').toLowerCase();

  try {
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ success: false, errors: [{ field: 'email', message: 'User already exists with this email' }] });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpCode = code;
      user.otpExpires = Date.now() + 10 * 60 * 1000;
      await user.save();

      try {
        const subject = 'Complete your Aspira registration';
        const html = `<p>Hi ${user.name},</p><p>Your verification code is <strong>${code}</strong>. Enter it on the signup screen to complete your registration.</p><p>This code expires in 10 minutes. If you did not create this account, ignore this email.</p>`;
        await sendMail({ to: user.email, subject, html });
      } catch (mailError) {
        console.error('OTP email failed:', mailError.message);
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();
        return res.status(500).json({ success: false, message: 'Unable to send verification email right now. Please try again in a moment.' });
      }

      return res.status(200).json({
        success: true,
        message: 'A verification code has been resent to your email. Enter it to complete registration.',
        email: user.email,
      });
    }

    user = new User({ name, email: normalizedEmail, password, role, isVerified: false });
    await user.save();

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = code;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      const subject = 'Complete your Aspira registration';
      const html = `<p>Hi ${user.name},</p><p>Your verification code is <strong>${code}</strong>. Enter it on the signup screen to complete your registration.</p><p>This code expires in 10 minutes. If you did not create this account, ignore this email.</p>`;
      await sendMail({ to: user.email, subject, html });
    } catch (mailError) {
      console.error('OTP email failed:', mailError.message);
      user.otpCode = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: 'Unable to send verification email right now. Please try again in a moment.' });
    }

    return res.status(201).json({
      success: true,
      message: 'Verification code sent to your email. Enter it to complete registration.',
      email: user.email,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = (email || '').toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) return res.status(400).json({ success: false, errors: [{ field: 'email', message: 'Invalid credentials' }] });

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please complete email verification before logging in.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ success: false, errors: [{ field: 'password', message: 'Invalid credentials' }] });

    const token = generateToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const sendOtp = async (req, res) => {
  const { email, purpose = 'login' } = req.body;
  const normalizedEmail = (email || '').toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ success: false, message: 'No account found for that email' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = code;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const subject = purpose === 'register' ? 'Complete your Aspira registration' : 'Your Aspira login code';
    const html = purpose === 'register'
      ? `<p>Hi ${user.name},</p><p>Your verification code is <strong>${code}</strong>. Enter it on the signup screen to complete your registration.</p><p>This code expires in 10 minutes. If you did not create this account, ignore this email.</p>`
      : `<p>Hi ${user.name},</p><p>Your one-time login code is <strong>${code}</strong>. It expires in 10 minutes.</p><p>If you did not request this, ignore this email.</p>`;
    await sendMail({ to: user.email, subject, html });

    res.json({ success: true, message: 'OTP code sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Unable to send OTP' });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, code, purpose = 'login' } = req.body;
  const normalizedEmail = (email || '').toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail }).select('+otpCode +otpExpires');
    if (!user) return res.status(404).json({ success: false, message: 'No account found for that email' });

    if (!user.otpCode || !user.otpExpires || user.otpExpires < Date.now() || user.otpCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    user.otpCode = undefined;
    user.otpExpires = undefined;

    if (purpose === 'register') {
      user.isVerified = true;
      await user.save();
      return res.json({ success: true, message: 'Registration completed successfully. Please sign in with your password.' });
    }

    await user.save();
    const token = generateToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error getting profile info' });
  }
};
