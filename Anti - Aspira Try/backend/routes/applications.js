import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { validateFields } from '../middleware/validation.js';
import upload from '../middleware/uploadResume.js';
import {
  applyForJob,
  getResume,
  getCandidateApplications,
  getEmployerApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';

const router = express.Router();

router.post('/apply/:jobId', protect, authorize('candidate'), upload.single('resumeFile'), applyForJob);
router.get('/:id/resume', protect, authorize('employer'), getResume);
router.get('/candidate', protect, authorize('candidate'), getCandidateApplications);
router.get('/employer', protect, authorize('employer'), getEmployerApplications);
router.put(
  '/:id/status',
  [
    protect,
    authorize('employer'),
    body('status', 'Valid status is required').isIn(['applied', 'reviewing', 'interviewing', 'accepted', 'rejected']),
    validateFields,
  ],
  updateApplicationStatus
);

export default router;
