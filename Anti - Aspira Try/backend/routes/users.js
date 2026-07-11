import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/employers', protect, authorize('candidate', 'employer'), async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [employers, total] = await Promise.all([
      User.find({ role: 'employer' })
        .select('-password -otpCode -otpExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ role: 'employer' }),
    ]);

    res.json({
      success: true,
      count: employers.length,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      employers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch employers' });
  }
});

router.get('/candidates', protect, authorize('employer'), async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [candidates, total] = await Promise.all([
      User.find({ role: 'candidate' })
        .select('-password -otpCode -otpExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ role: 'candidate' }),
    ]);

    res.json({
      success: true,
      count: candidates.length,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      candidates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch candidates' });
  }
});

export default router;
