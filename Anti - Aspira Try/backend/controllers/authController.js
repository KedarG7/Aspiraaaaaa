import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendMail } from '../utils/mailer.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const generateOtpCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const buildRegistrationEmail = (name, code) => ({
  subject: 'Complete your Aspira registration',
  html: `<p>Hi ${name},</p><p>Your verification code is <strong>${code}</strong>. Enter it on the signup screen to complete your registration.</p><p>This code expires in 10 minutes. If you did not create this account, ignore this email.</p>`,
});

const assignAndSendRegistrationOtp = async (user) => {
  const code = generateOtpCode();
  user.otpCode = code;
  user.otpExpires = Date.now() + 10 * 60 * 1000;

  try {
    const { subject, html } = buildRegistrationEmail(user.name, code);
    await sendMail({ to: user.email, subject, html });
    await user.save();
    return { success: true };
  } catch (mailError) {
    console.error('OTP email failed:', mailError.message);
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();
    return { success: false, message: 'Unable to send verification email right now. Please try again in a moment.' };
  }
};

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((skill) => skill.trim()).filter(Boolean);
  }

  return (skills || '')
    .split(/[\n,]+/)
    .map((skill) => skill.trim())
    .filter(Boolean);
};

export const register = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    companyName,
    companyWebsite,
    companyDescription,
    companyAddress,
    companyPhone,
    companyIndustry,
    employeeCount,
    location,
    headline,
    bio,
    skills,
    experience,
    portfolioUrl,
  } = req.body;
  const normalizedEmail = (email || '').toLowerCase();

  try {
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ success: false, errors: [{ field: 'email', message: 'User already exists with this email' }] });
      }

      user.name = name;
      user.password = password;
      user.role = role;
      if (companyName !== undefined) user.companyName = companyName;
      if (companyWebsite !== undefined) user.companyWebsite = companyWebsite;
      if (companyDescription !== undefined) user.companyDescription = companyDescription;
      if (companyAddress !== undefined) user.companyAddress = companyAddress;
      if (companyPhone !== undefined) user.companyPhone = companyPhone;
      if (companyIndustry !== undefined) user.companyIndustry = companyIndustry;
      if (employeeCount !== undefined) user.employeeCount = employeeCount;
      if (location !== undefined) user.location = location;
      if (headline !== undefined) user.headline = headline;
      if (bio !== undefined) user.bio = bio;
      if (skills !== undefined) user.skills = normalizeSkills(skills);
      if (experience !== undefined) user.experience = experience;
      if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl;

      const otpResult = await assignAndSendRegistrationOtp(user);
      if (!otpResult.success) {
        return res.status(500).json({ success: false, message: otpResult.message });
      }

      return res.status(200).json({
        success: true,
        message: 'A verification code has been resent to your email. Enter it to complete registration.',
        email: user.email,
      });
    }

    user = new User({
      name,
      email: normalizedEmail,
      password,
      role,
      isVerified: false,
      companyName,
      companyWebsite,
      companyDescription,
      companyAddress,
      companyPhone,
      companyIndustry,
      employeeCount,
      location,
      headline,
      bio,
      skills: normalizeSkills(skills),
      experience,
      portfolioUrl,
    });
    await user.save();

    const otpResult = await assignAndSendRegistrationOtp(user);
    if (!otpResult.success) {
      return res.status(500).json({ success: false, message: otpResult.message });
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

    if (purpose === 'login' && !user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please complete email verification before logging in.' });
    }

    if (purpose === 'register') {
      const otpResult = await assignAndSendRegistrationOtp(user);
      if (!otpResult.success) {
        return res.status(500).json({ success: false, message: otpResult.message });
      }
      return res.json({ success: true, message: 'OTP code sent to email' });
    }

    const code = generateOtpCode();
    user.otpCode = code;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    try {
      const subject = 'Your Aspira login code';
      const html = `<p>Hi ${user.name},</p><p>Your one-time login code is <strong>${code}</strong>. It expires in 10 minutes.</p><p>If you did not request this, ignore this email.</p>`;
      await sendMail({ to: user.email, subject, html });
      await user.save();
    } catch (mailError) {
      console.error('OTP email failed:', mailError.message);
      user.otpCode = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: 'Unable to send OTP' });
    }

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
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'This email is already verified. Please sign in.' });
      }

      user.isVerified = true;
      await user.save();
      return res.json({ success: true, message: 'Registration completed successfully. Please sign in with your password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please complete email verification before logging in.' });
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
    const user = await User.findById(req.user.id).select('-password -otpCode -otpExpires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error getting profile info' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'phone',
      'address',
      'city',
      'state',
      'country',
      'location',
      'linkedin',
      'about',
      'bio',
      'headline',
      'skills',
      'experience',
      'portfolioUrl',
      'companyName',
      'companyWebsite',
      'companyAddress',
      'companyPhone',
      'companyDescription',
      'companyIndustry',
      'employeeCount',
    ];

    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) {
        updates[f] = f === 'skills' && !Array.isArray(req.body[f])
          ? req.body[f]
              .split(/[,\n]+/)
              .map((skill) => skill.trim())
              .filter(Boolean)
          : req.body[f];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password -otpCode -otpExpires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};
